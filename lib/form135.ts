import { Form135Field, UserData } from "./types";
import { ageInTaxYear } from "./creditPoints";

export function buildForm135(data: UserData): Form135Field[] {
  const fields: Form135Field[] = [];
  const A = "חלק א — פרטים כלליים";
  const B = "חלק ב — פרטים אישיים";
  const C = "חלק ג — הכנסות מיגיעה אישית";
  const D7 = "חלק ז — ניכויים אישיים";
  const H = "חלק ח — נקודות זיכוי";
  const I = "חלק ט — זיכויים אישיים";
  const J = "חלק י — מחזור ומס שנוכה במקור";

  // חלק א
  fields.push({
    section: A,
    field: "✓ בקשה להחזר מס",
    label: "תמיד מסומן",
    value: "✓",
  });
  if (data.spouse.exists && !data.spouse.filesSeparately) {
    fields.push({
      section: A,
      field: "✓ הכנסותיי והכנסות בן/בת זוגי",
      label: "חישוב משותף",
      value: "✓",
    });
  } else {
    fields.push({
      section: A,
      field: "✓ הכנסותיי בלבד",
      label: "הגשה עצמאית",
      value: "✓",
    });
  }
  if (data.spouse.exists && data.spouse.hasNoIncome) {
    fields.push({
      section: A,
      field: "✓ אין הכנסה לבן/בת זוגי",
      label: "בן/בת זוג ללא הכנסה כלל",
      value: "✓",
    });
  }
  if (data.spouse.filesSeparately) {
    fields.push({
      section: A,
      field: "✓ בן/בת זוגי מגיש/ה דוח נפרד",
      label: "",
      value: "✓",
    });
  }

  // חלק ב
  fields.push({ section: B, field: "ת.ז.", label: "תעודת זהות", value: data.personal.idNumber });
  fields.push({ section: B, field: "שם מלא", label: "", value: data.personal.fullName });
  fields.push({ section: B, field: "תאריך לידה", label: "", value: data.personal.birthDate });
  fields.push({ section: B, field: "כתובת", label: "", value: data.personal.address });
  fields.push({ section: B, field: "טלפון", label: "", value: data.personal.phone });
  fields.push({ section: B, field: "דוא״ל", label: "", value: data.personal.email });
  fields.push({ section: B, field: "מצב משפחתי", label: "", value: hebMarital(data.personal.maritalStatus) });
  if (data.personal.bankAccount) {
    fields.push({ section: B, field: "277", label: "מספר חשבון בנק", value: data.personal.bankAccount });
  }
  if (data.personal.bankBranch) {
    fields.push({ section: B, field: "278", label: "סמל סניף + בנק", value: data.personal.bankBranch });
  }
  if (data.personal.bankAccountOwner) {
    fields.push({ section: B, field: "שם בעל החשבון", label: "", value: data.personal.bankAccountOwner });
  }

  // חלק ג — הכנסות
  const sumSalary = data.forms106.reduce((s, f) => s + f.salary_158, 0);
  fields.push({
    section: C,
    field: "158",
    label: "משכורת (סכום מכל טופסי 106)",
    value: round(sumSalary),
  });

  if (data.bituachLeumi.hasUnemployment) {
    fields.push({
      section: C,
      field: "194",
      label: "תקבולים מב״ל כשכיר (אבטלה/לידה/מילואים)",
      value: round(data.bituachLeumi.amount),
    });
  }

  const sumShifts = data.forms106.reduce((s, f) => s + (f.shiftsWork_068 ?? 0), 0);
  if (sumShifts > 0) {
    fields.push({ section: C, field: "068", label: "עבודה במשמרות", value: round(sumShifts) });
  }

  if (data.severance.has161 && data.severance.type === "cash" && data.severance.taxableAmount > 0) {
    fields.push({
      section: C,
      field: "258",
      label: "מענק פרישה חייב במס",
      value: round(data.severance.taxableAmount),
    });
  }

  // חלק ז — ניכויים אישיים
  const sumInsurable = data.forms106.reduce((s, f) => s + f.insurableIncome_244, 0);
  const sumEmployerPension = data.forms106.reduce((s, f) => s + f.employerPension_248, 0);
  const sumHavraa = data.forms106.reduce((s, f) => s + (f.havraaReduction_012 ?? 0), 0);

  fields.push({ section: D7, field: "244", label: "הכנסה מבוטחת", value: round(sumInsurable) });
  fields.push({
    section: D7,
    field: "248",
    label: "הפקדות מעביד לקופ״ג לקצבה",
    value: round(sumEmployerPension),
  });
  if (sumHavraa > 0) {
    fields.push({ section: D7, field: "012", label: "הפחתת דמי הבראה", value: round(sumHavraa) });
  }
  if (data.privatePension.disabilityInsurance > 0) {
    fields.push({
      section: D7,
      field: "206",
      label: "ביטוח אכ״ע כשכיר (טופס 134)",
      value: round(data.privatePension.disabilityInsurance),
    });
  }
  if (data.privatePension.selfPensionDeposit > 0) {
    fields.push({
      section: D7,
      field: "135",
      label: "קופ״ג לקצבה כעמית עצמאי",
      value: round(data.privatePension.selfPensionDeposit),
    });
  }

  // חלק ח — נקודות זיכוי
  if (data.personal.isResident) {
    fields.push({ section: H, field: "020", label: "תושב/ת ישראל", value: "✓" });
  }
  if (data.spouse.exists && (data.spouse.isOver60 || data.spouse.isBlindOrDisabled)) {
    fields.push({ section: H, field: "021", label: "נקודות זיכוי לבן/בת זוג", value: "✓" });
  }
  if (data.children.isSingleParent) {
    fields.push({ section: H, field: "026", label: "הורה במשפחה חד הורית", value: "✓" });
  }

  // ילדים — עמודה לפי גיל
  const childrenByAge = groupChildrenByAgeColumn(data);
  for (const [column, count] of Object.entries(childrenByAge)) {
    if (count > 0) {
      const fieldNum = data.children.isSingleParent ? "022" : "260";
      fields.push({
        section: H,
        field: `${fieldNum} — עמודה "${column}"`,
        label: "מספר ילדים בחזקתי",
        value: count,
      });
    }
  }

  if (data.personal.isOleh && data.personal.olehDate) {
    fields.push({ section: H, field: "044", label: "עולה חדש — תאריך עליה", value: data.personal.olehDate });
  }
  if (data.personal.isDischargedSoldier && data.personal.dischargeDate) {
    fields.push({ section: H, field: "224", label: "חייל משוחרר — תאריך שחרור", value: data.personal.dischargeDate });
    fields.push({ section: H, field: "024", label: "מספר חודשי שירות סדיר", value: data.personal.serviceMonths ?? 0 });
  }
  if (data.personal.academicDegreeFinished && data.personal.academicDegreeYear) {
    fields.push({
      section: H,
      field: "181",
      label: "שנת סיום לימודים לתואר אקדמי",
      value: data.personal.academicDegreeYear,
    });
  }
  if (data.personal.livingInBenefitedTown && data.personal.benefitedTownCode) {
    fields.push({
      section: H,
      field: "093",
      label: "ישוב מזכה (קוד)",
      value: data.personal.benefitedTownCode,
    });
  }
  if (data.children.childSupportPaid && data.children.childSupportPaid > 0) {
    fields.push({
      section: H,
      field: "029",
      label: "השתתפות בכלכלת ילדים שאינם סמוכים (מזונות)",
      value: round(data.children.childSupportPaid),
    });
  }

  // חלק ט — זיכויים אישיים
  const sumEmployeePension = data.forms106.reduce((s, f) => s + f.employeePension_045, 0);
  const sumLifeIns = data.forms106.reduce((s, f) => s + f.lifeInsurance_036, 0);

  fields.push({
    section: I,
    field: "045",
    label: "תשלומים לקצבה כעמית שכיר",
    value: round(sumEmployeePension),
  });
  if (sumLifeIns > 0) {
    fields.push({ section: I, field: "036", label: "ביטוח חיים", value: round(sumLifeIns) });
  }
  if (data.donations.amount > 0) {
    fields.push({ section: I, field: "037", label: "תרומות סעיף 46", value: round(data.donations.amount) });
  }

  // חלק י
  const sumTax = data.forms106.reduce(
    (s, f) => s + f.tax_042 + (f.yasefWithheld ?? 0),
    0,
  );
  fields.push({
    section: J,
    field: "042",
    label: "סה״כ מס שנוכה במקור מטופסי 106 (כולל מס יסף)",
    value: round(sumTax),
  });
  if (data.bituachLeumi.hasUnemployment && data.bituachLeumi.taxWithheld > 0) {
    fields.push({
      section: J,
      field: "040",
      label: "ניכויים מהכנסות אחרות (מס שנוכה ע״י ב״ל)",
      value: round(data.bituachLeumi.taxWithheld),
    });
  }

  return fields;
}

function round(n: number): number {
  return Math.round(n);
}

function hebMarital(m: string): string {
  return (
    { single: "רווק/ה", married: "נשוי/אה", divorced: "גרוש/ה", widowed: "אלמן/ה", separated: "פרוד/ה" } as Record<
      string,
      string
    >
  )[m] || m;
}

function groupChildrenByAgeColumn(data: UserData): Record<string, number> {
  const cols: Record<string, number> = {
    "נולד בשנת המס": 0,
    "מלאו 1-2": 0,
    "מלאו 3": 0,
    "מלאו 4-5": 0,
    "מלאו 6-17": 0,
    "מלאו 18": 0,
  };
  for (const c of data.children.children) {
    if (!c.birthDate) continue;
    const age = ageInTaxYear(c.birthDate, data.personal.taxYear);
    if (age === 0) cols["נולד בשנת המס"]++;
    else if (age >= 1 && age <= 2) cols["מלאו 1-2"]++;
    else if (age === 3) cols["מלאו 3"]++;
    else if (age >= 4 && age <= 5) cols["מלאו 4-5"]++;
    else if (age >= 6 && age <= 17) cols["מלאו 6-17"]++;
    else if (age === 18) cols["מלאו 18"]++;
  }
  return cols;
}
