import {
  TAX_BRACKETS,
  CREDIT_POINT_VALUE,
  YASEF_THRESHOLD,
  YASEF_RATE,
  PENSION_CREDIT_RATE,
  PENSION_CREDIT_INSURABLE_CAP_RATE,
  LIFE_INSURANCE_CREDIT_RATE,
  DONATION_CREDIT_RATE,
  DONATION_MIN,
  DONATION_MAX_RATE_OF_INCOME,
  DONATION_ABSOLUTE_CAP,
  REFUND_HIGH_WARNING_THRESHOLD,
} from "./constants";
import { computeCreditPoints } from "./creditPoints";
import {
  CalculationResult,
  UserData,
  Warning,
} from "./types";

export function calculateBracketedTax(
  income: number,
  year: keyof typeof TAX_BRACKETS,
): { total: number; perBracket: { label: string; amount: number; tax: number }[] } {
  const brackets = TAX_BRACKETS[year];
  let prev = 0;
  let total = 0;
  const perBracket: { label: string; amount: number; tax: number }[] = [];
  for (const { cap, rate } of brackets) {
    if (income <= prev) break;
    const top = Math.min(income, cap);
    const slice = top - prev;
    const tax = slice * rate;
    perBracket.push({
      label: `${(rate * 100).toFixed(0)}% (${nis(prev + 1)} – ${cap === Infinity ? "ומעלה" : nis(cap)})`,
      amount: slice,
      tax,
    });
    total += tax;
    prev = cap;
    if (income <= cap) break;
  }
  return { total, perBracket };
}

function nis(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export function calculate(data: UserData, filerIsFemale = false): CalculationResult {
  const year = data.personal.taxYear;
  const warnings: Warning[] = [];

  // הכנסה
  const sum106Salary = data.forms106.reduce((s, f) => s + f.salary_158, 0);
  const sum106Tax = data.forms106.reduce((s, f) => s + f.tax_042, 0);
  const sumYasefWithheld = data.forms106.reduce((s, f) => s + (f.yasefWithheld ?? 0), 0);
  const sumInsurable = data.forms106.reduce((s, f) => s + f.insurableIncome_244, 0);
  const sumEmployeePension = data.forms106.reduce((s, f) => s + f.employeePension_045, 0);
  const sumLifeInsurance106 = data.forms106.reduce((s, f) => s + f.lifeInsurance_036, 0);

  const blIncome = data.bituachLeumi.hasUnemployment ? data.bituachLeumi.amount : 0;
  const blTax = data.bituachLeumi.hasUnemployment ? data.bituachLeumi.taxWithheld : 0;

  const severanceTaxable =
    data.severance.has161 && data.severance.type === "cash"
      ? data.severance.taxableAmount
      : 0;

  const incomeBreakdown = [
    { label: "משכורת מטופסי 106", amount: sum106Salary },
    { label: "תקבולים מביטוח לאומי (194)", amount: blIncome },
    { label: "פיצויים חייבים במס", amount: severanceTaxable },
  ].filter((x) => x.amount > 0);

  const totalIncome = sum106Salary + blIncome + severanceTaxable;

  // מס ברוטו
  const bracketCalc = calculateBracketedTax(totalIncome, year);
  const grossTax = bracketCalc.total;

  // מס יסף
  const yasefTax = Math.max(0, (totalIncome - YASEF_THRESHOLD[year]) * YASEF_RATE);

  // נקודות זיכוי
  const cp = computeCreditPoints(
    data.personal,
    data.spouse,
    data.children,
    true,
    filerIsFemale,
  );
  const creditPointsValue = cp.total * CREDIT_POINT_VALUE[year];

  // זיכוי קצבה (סעיף 45א — עמית שכיר)
  const pensionEligible = Math.min(
    sumEmployeePension,
    PENSION_CREDIT_INSURABLE_CAP_RATE * sumInsurable,
  );
  const pensionCredit = pensionEligible * PENSION_CREDIT_RATE;

  // ביטוח חיים
  const lifeInsuranceCredit =
    (sumLifeInsurance106 + data.privatePension.lifeInsurancePrivate) *
    LIFE_INSURANCE_CREDIT_RATE;

  // תרומות
  const donationCap = Math.min(
    totalIncome * DONATION_MAX_RATE_OF_INCOME,
    DONATION_ABSOLUTE_CAP,
  );
  const donationEligible =
    data.donations.amount >= DONATION_MIN
      ? Math.min(data.donations.amount, donationCap)
      : 0;
  const donationCredit = donationEligible * DONATION_CREDIT_RATE;

  const totalCredits =
    creditPointsValue + pensionCredit + lifeInsuranceCredit + donationCredit;

  const netTax = Math.max(0, grossTax + yasefTax - totalCredits);

  const totalTaxPaid = sum106Tax + sumYasefWithheld + blTax;
  const refund = totalTaxPaid - netTax;

  // התראות
  if (data.forms106.length === 0) {
    warnings.push({ level: "red", message: "לא הוזנו טופסי 106 — לא ניתן לחשב." });
  }
  if (refund < 0) {
    warnings.push({
      level: "red",
      message:
        "⚠️ החישוב מצביע על חוב, לא החזר. אל תגיש 135 — הגשה עלולה לחשוף לדרישת תשלום.",
    });
  }
  if (refund > REFUND_HIGH_WARNING_THRESHOLD) {
    warnings.push({
      level: "yellow",
      message: `💰 ההחזר המשוער חריג (${nis(refund)} ₪). וודא שכל הנתונים נכונים לפני הגשה.`,
    });
  }
  if (data.forms106.length >= 2) {
    const overlapping = detectOverlapping106(data.forms106);
    if (!overlapping) {
      warnings.push({
        level: "green",
        message:
          "✓ זוהו כמה מעסיקים בתקופות לא חופפות — סיכוי טוב להחזר עקב חישוב מס נפרד אצל כל מעסיק.",
      });
    }
  }
  if (totalIncome < YASEF_THRESHOLD[year] && sumYasefWithheld > 0) {
    warnings.push({
      level: "green",
      message: `✓ הכנסה מתחת לרף מס יסף — כל מס היסף שנוכה (${nis(sumYasefWithheld)} ₪) יוחזר.`,
    });
  }
  for (const c of data.children.children) {
    if (!c.birthDate) {
      warnings.push({ level: "red", message: `חסר תאריך לידה לילד ${c.name ?? ""}` });
    }
  }
  if (data.spouse.exists && data.spouse.hasNoIncome) {
    warnings.push({
      level: "yellow",
      message:
        "בן/בת הזוג ללא הכנסה — נקודות הזיכוי שלו/ה אינן עוברות אליך (אובדות).",
    });
  }
  if (
    data.severance.has161 &&
    data.severance.type === "cash" &&
    data.severance.taxableAmount > 0
  ) {
    warnings.push({
      level: "yellow",
      message:
        "פיצויים במזומן — מומלץ לבקש פריסה (סעיף 8(ג)) באמצעות טופס 1301 ולא 135.",
    });
  }

  const confidence: CalculationResult["confidence"] =
    warnings.some((w) => w.level === "red")
      ? "low"
      : warnings.some((w) => w.level === "yellow")
        ? "medium"
        : "high";

  return {
    totalIncome,
    incomeBreakdown,
    grossTax,
    taxByBracket: bracketCalc.perBracket,
    yasefTax,
    creditPoints: cp.total,
    creditPointsBreakdown: cp.breakdown,
    creditPointsValue,
    pensionCredit,
    lifeInsuranceCredit,
    donationCredit,
    totalCredits,
    netTax,
    totalTaxPaid,
    refund,
    warnings,
    confidence,
  };
}

function detectOverlapping106(forms: { startDate?: string; endDate?: string }[]): boolean {
  const ranges = forms
    .filter((f) => f.startDate && f.endDate)
    .map((f) => ({ start: new Date(f.startDate!).getTime(), end: new Date(f.endDate!).getTime() }));
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (ranges[i].start <= ranges[j].end && ranges[j].start <= ranges[i].end) {
        return true;
      }
    }
  }
  return false;
}
