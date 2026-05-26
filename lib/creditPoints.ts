import { ChildrenInfo, PersonalInfo, SpouseInfo, Child } from "./types";

export interface CreditBreakdownItem {
  label: string;
  points: number;
}

// גיל שהילד הגיע אליו בשנת המס (השנה שמלאה לו במהלך השנה)
export function ageInTaxYear(birthDateISO: string, taxYear: number): number {
  const bd = new Date(birthDateISO);
  return taxYear - bd.getFullYear();
}

// טבלת נקודות זיכוי לילדים — לפי תפקיד ההורה
function childPointsForReceivingParent(age: number): number {
  if (age === 0) return 1.5;       // נולד בשנת המס
  if (age >= 1 && age <= 2) return 4.5;
  if (age === 3) return 2.5;       // 1.5 + 1 רפורמת 2024
  if (age >= 4 && age <= 5) return 1.5;
  if (age >= 6 && age <= 17) return 2; // 1 + 1 רפורמת 2024
  if (age === 18) return 0.5;
  return 0;
}

function childPointsForOtherParent(age: number): number {
  if (age === 0) return 1;
  if (age >= 1 && age <= 2) return 4.5;
  if (age === 3) return 2.5;
  if (age >= 4 && age <= 5) return 2;
  if (age >= 6 && age <= 17) return 1;
  return 0;
}

export function computeCreditPoints(
  personal: PersonalInfo,
  spouse: SpouseInfo,
  children: ChildrenInfo,
  isFiler: boolean = true, // האם זה המגיש או בן הזוג
  filerIsFemale: boolean = false,
): { total: number; breakdown: CreditBreakdownItem[] } {
  const breakdown: CreditBreakdownItem[] = [];
  let total = 0;

  // בסיס
  if (personal.isResident) {
    breakdown.push({ label: "תושב/ת ישראל", points: 2.25 });
    total += 2.25;
  }

  // אישה — תוספת 0.5
  if (filerIsFemale) {
    breakdown.push({ label: "אישה", points: 0.5 });
    total += 0.5;
  }

  // הורה יחיד
  if (children.isSingleParent) {
    breakdown.push({ label: "הורה יחיד", points: 1 });
    total += 1;
  }

  // עולה חדש — חישוב משוער
  if (personal.isOleh && personal.olehDate) {
    const monthsSinceOleh = monthsBetween(personal.olehDate, `${personal.taxYear}-12-31`);
    if (monthsSinceOleh <= 18) {
      breakdown.push({ label: "עולה חדש (18 חודשים ראשונים)", points: 3 });
      total += 3;
    } else if (monthsSinceOleh <= 30) {
      breakdown.push({ label: "עולה חדש (12 חודשים נוספים)", points: 2 });
      total += 2;
    } else if (monthsSinceOleh <= 42) {
      breakdown.push({ label: "עולה חדש (12 חודשים אחרונים)", points: 1 });
      total += 1;
    }
  }

  // חייל משוחרר
  if (personal.isDischargedSoldier && personal.dischargeDate) {
    const monthsSinceDischarge = monthsBetween(personal.dischargeDate, `${personal.taxYear}-12-31`);
    if (monthsSinceDischarge <= 36) {
      const months = personal.serviceMonths ?? 24;
      const annualPoints = months >= 23 ? 2 : 1;
      breakdown.push({ label: `חייל משוחרר (~${annualPoints} נקודות לשנה)`, points: annualPoints });
      total += annualPoints;
    }
  }

  // תואר אקדמי
  if (personal.academicDegreeFinished && personal.academicDegreeYear) {
    const yearsSince = personal.taxYear - personal.academicDegreeYear;
    if (yearsSince === 1) {
      breakdown.push({ label: "סיום תואר אקדמי — שנה ראשונה", points: 1 });
      total += 1;
    }
  }

  // מילואים
  if (personal.reservistDays && personal.reservistDays >= 5) {
    breakdown.push({ label: `מילואים פעיל (${personal.reservistDays} ימים)`, points: 1 });
    total += 1;
  }

  // ילדים — לפי תפקיד
  const isReceivingParent =
    children.receivesChildAllowance === "self" ||
    (children.receivesChildAllowance === "split" && true);

  for (const child of children.children) {
    const age = ageInTaxYear(child.birthDate, personal.taxYear);
    let pts = 0;
    if (children.receivesChildAllowance === "split") {
      pts = (childPointsForReceivingParent(age) + childPointsForOtherParent(age)) / 2;
    } else if (isReceivingParent) {
      pts = childPointsForReceivingParent(age);
    } else {
      pts = childPointsForOtherParent(age);
    }
    if (pts > 0) {
      breakdown.push({
        label: `ילד/ה ${child.name ?? ""} (גיל ${age} בשנת המס)`,
        points: pts,
      });
      total += pts;
    }
  }

  // בן זוג עיוור/נכה/60+
  if (spouse.exists && (spouse.isOver60 || spouse.isBlindOrDisabled)) {
    breakdown.push({ label: "נקודות זיכוי לבן/בת זוג", points: 1 });
    total += 1;
  }

  return { total, breakdown };
}

function monthsBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}
