"use client";

import { SpouseInfo } from "@/lib/types";

interface Props {
  value: SpouseInfo;
  onChange: (v: SpouseInfo) => void;
}

export default function StepSpouse({ value, onChange }: Props) {
  const set = <K extends keyof SpouseInfo>(k: K, v: SpouseInfo[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div>
      <h2 className="section-title">בן/בת זוג</h2>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={value.exists}
          onChange={(e) => set("exists", e.target.checked)}
        />
        <span className="text-sm">יש בן/בת זוג</span>
      </label>

      {value.exists && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">שם מלא</label>
            <input
              className="input"
              value={value.fullName ?? ""}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="label">ת.ז.</label>
            <input
              className="input"
              value={value.idNumber ?? ""}
              onChange={(e) => set("idNumber", e.target.value)}
            />
          </div>
          <div>
            <label className="label">תאריך לידה</label>
            <input
              type="date"
              className="input"
              value={value.birthDate ?? ""}
              onChange={(e) => set("birthDate", e.target.value)}
            />
          </div>
          <div>
            <label className="label">שכר חודשי משוער (₪)</label>
            <input
              type="number"
              className="input"
              value={value.approxMonthlySalary ?? ""}
              onChange={(e) => set("approxMonthlySalary", Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!value.worksThisYear}
                onChange={(e) => set("worksThisYear", e.target.checked)}
              />
              <span className="text-sm">עבד/ה בשנת המס</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!value.hasNoIncome}
                onChange={(e) => set("hasNoIncome", e.target.checked)}
              />
              <span className="text-sm">ללא הכנסה בכלל</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!value.filesSeparately}
                onChange={(e) => set("filesSeparately", e.target.checked)}
              />
              <span className="text-sm">מגיש/ה דוח נפרד</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!value.isOver60}
                onChange={(e) => set("isOver60", e.target.checked)}
              />
              <span className="text-sm">גיל 60+</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!value.isBlindOrDisabled}
                onChange={(e) => set("isBlindOrDisabled", e.target.checked)}
              />
              <span className="text-sm">עיוור/נכה</span>
            </label>
          </div>
          {value.hasNoIncome && (
            <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded">
              ⚠️ אם בן/בת הזוג ללא הכנסה — נקודות הזיכוי שלו/ה אינן עוברות אליך. אין נקודה
              מיוחדת ל״בן זוג שלא עובד״ (חוץ ממקרים של גיל 60+/עיוור/נכה).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
