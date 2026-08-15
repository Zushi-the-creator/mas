import { CalculationResult, UserData } from "./types";
import { ageInTaxYear } from "./creditPoints";

// "קובץ תיק" — הפורמט שתוסף הדפדפן צורך.
// המפתחות הם קודי השדות הרשמיים של טופס 1301/135; התוסף ממפה אותם
// ישירות לאלמנטים txt<code> במערכת השידור של רשות המסים.
export interface ExtensionCase {
  version: 1;
  taxYear: number;
  reportScope: "joint" | "self_only";
  fields: Record<string, number>;
  checkboxes: string[];
  children: Record<string, Partial<Record<ChildCol, number>>>;
  expectedRefund: number | null;
}

type ChildCol = "born" | "age1_2" | "age3" | "age4_5" | "age6_17" | "age18";

export function buildExtensionCase(
  data: UserData,
  result: CalculationResult,
): ExtensionCase {
  const F = data.forms106;
  const sum = (fn: (f: (typeof F)[number]) => number) => F.reduce((s, f) => s + (fn(f) || 0), 0);

  const fields: Record<string, number> = {};
  const put = (code: string, v: number) => {
    if (v > 0) fields[code] = Math.round(v);
  };

  put("158", sum((f) => f.salary_158));
  put("194", data.bituachLeumi.hasUnemployment ? data.bituachLeumi.amount : 0);
  put("068", sum((f) => f.shiftsWork_068 ?? 0));
  put("258", data.severance.has161 && data.severance.type === "cash" ? data.severance.taxableAmount : 0);
  put("244", sum((f) => f.insurableIncome_244));
  put("248", sum((f) => f.employerPension_248));
  put("011", sum((f) => f.havraaReduction_012 ?? 0));
  put("045", sum((f) => f.employeePension_045));
  put("036", sum((f) => f.lifeInsurance_036) + data.privatePension.lifeInsurancePrivate);
  put("135", data.privatePension.selfPensionDeposit);
  put("206", data.privatePension.disabilityInsurance);
  put("037", data.donations.amount);
  put("042", sum((f) => f.tax_042 + (f.yasefWithheld ?? 0)));
  put("040", data.bituachLeumi.hasUnemployment ? data.bituachLeumi.taxWithheld : 0);

  const checkboxes = ["020"];
  if (data.spouse.exists) checkboxes.push("021");
  if (data.children.isSingleParent) checkboxes.push("026");

  const childRow = data.children.isSingleParent ? "022" : "260";
  const cols: Partial<Record<ChildCol, number>> = {};
  for (const c of data.children.children) {
    if (!c.birthDate) continue;
    const a = ageInTaxYear(c.birthDate, data.personal.taxYear);
    const key: ChildCol | null =
      a === 0 ? "born" : a <= 2 ? "age1_2" : a === 3 ? "age3" : a <= 5 ? "age4_5" : a <= 17 ? "age6_17" : a === 18 ? "age18" : null;
    if (key) cols[key] = (cols[key] ?? 0) + 1;
  }

  return {
    version: 1,
    taxYear: data.personal.taxYear,
    reportScope: data.spouse.exists && !data.spouse.filesSeparately ? "joint" : "self_only",
    fields,
    checkboxes,
    children: Object.keys(cols).length ? { [childRow]: cols } : {},
    expectedRefund: result.refund > 0 ? Math.round(result.refund) : null,
  };
}
