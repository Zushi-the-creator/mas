import { UserData } from "./types";

export interface ChecklistItem {
  label: string;
  required: boolean;
  reason?: string;
}

export function buildChecklist(data: UserData): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { label: "כל טופסי 106 מהמעסיקים בשנת המס", required: true },
    { label: "צילום צ׳ק או אישור ניהול חשבון בנק", required: true },
  ];
  if (data.children.children.length > 0) {
    items.push({ label: "צילום ספח ת״ז עם פרטי הילדים", required: true });
  }
  if (data.bituachLeumi.hasUnemployment) {
    items.push({
      label: "אישור על דמי אבטלה/לידה/מילואים מביטוח לאומי",
      required: true,
      reason: "להוכחת ההכנסה בשדה 194 והמס בשדה 040",
    });
  }
  if (data.severance.has161) {
    items.push({
      label: "טופס 161 מהמעסיק שפרשת ממנו",
      required: true,
    });
  }
  if (
    data.privatePension.selfPensionDeposit > 0 ||
    data.privatePension.lifeInsurancePrivate > 0
  ) {
    items.push({
      label: "אישור הפקדות שנתי לקופ״ג / ביטוח חיים / קרן השתלמות",
      required: true,
    });
  }
  if (data.donations.amount > 0) {
    items.push({
      label: "קבלות תרומות סעיף 46",
      required: true,
      reason: "ממוסדות מאושרים בלבד",
    });
  }
  if (data.personal.reservistDays && data.personal.reservistDays > 0) {
    items.push({ label: "אישור ימי מילואים (טופס 3010)", required: true });
  }
  if (data.personal.isOleh) {
    items.push({ label: "תעודת עולה", required: true });
  }
  if (data.personal.isDischargedSoldier) {
    items.push({ label: "תעודת שחרור מהצבא", required: true });
  }
  if (data.personal.academicDegreeFinished) {
    items.push({ label: "טופס 119 — אישור סיום לימודים", required: true });
  }
  if (data.personal.livingInBenefitedTown) {
    items.push({
      label: "אישור מהרשות המקומית על ישוב מזכה (טופס 1312א)",
      required: true,
    });
  }
  if (data.personal.isDisabled || data.personal.isBlind) {
    items.push({ label: "תעודה רפואית 100% / טופס 116א", required: true });
  }
  return items;
}
