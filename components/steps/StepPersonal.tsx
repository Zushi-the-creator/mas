"use client";

import { PersonalInfo } from "@/lib/types";

interface Props {
  value: PersonalInfo;
  onChange: (v: PersonalInfo) => void;
}

export default function StepPersonal({ value, onChange }: Props) {
  const set = <K extends keyof PersonalInfo>(k: K, v: PersonalInfo[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div>
      <h2 className="section-title">פרטים אישיים</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">שנת מס</label>
          <select
            className="input"
            value={value.taxYear}
            onChange={(e) => set("taxYear", Number(e.target.value) as 2024 | 2025)}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <div>
          <label className="label">תעודת זהות</label>
          <input
            className="input"
            value={value.idNumber}
            onChange={(e) => set("idNumber", e.target.value)}
            placeholder="9 ספרות"
          />
        </div>
        <div>
          <label className="label">שם מלא</label>
          <input
            className="input"
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className="label">תאריך לידה</label>
          <input
            type="date"
            className="input"
            value={value.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">כתובת מלאה</label>
          <input
            className="input"
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="רחוב, מספר, עיר, מיקוד"
          />
        </div>
        <div>
          <label className="label">טלפון</label>
          <input
            className="input"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="label">דוא״ל</label>
          <input
            className="input"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <label className="label">מצב משפחתי</label>
          <select
            className="input"
            value={value.maritalStatus}
            onChange={(e) => set("maritalStatus", e.target.value as PersonalInfo["maritalStatus"])}
          >
            <option value="single">רווק/ה</option>
            <option value="married">נשוי/אה</option>
            <option value="divorced">גרוש/ה</option>
            <option value="widowed">אלמן/ה</option>
            <option value="separated">פרוד/ה</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-semibold text-slate-800 mt-8 mb-3">
        קטגוריות מיוחדות
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Toggle
          label="עולה חדש (3.5 שנים ראשונות)"
          checked={!!value.isOleh}
          onChange={(c) => set("isOleh", c)}
        />
        {value.isOleh && (
          <div>
            <label className="label">תאריך עליה</label>
            <input
              type="date"
              className="input"
              value={value.olehDate ?? ""}
              onChange={(e) => set("olehDate", e.target.value)}
            />
          </div>
        )}
        <Toggle
          label="חייל משוחרר (עד 3 שנים)"
          checked={!!value.isDischargedSoldier}
          onChange={(c) => set("isDischargedSoldier", c)}
        />
        {value.isDischargedSoldier && (
          <>
            <div>
              <label className="label">תאריך שחרור</label>
              <input
                type="date"
                className="input"
                value={value.dischargeDate ?? ""}
                onChange={(e) => set("dischargeDate", e.target.value)}
              />
            </div>
            <div>
              <label className="label">חודשי שירות סדיר</label>
              <input
                type="number"
                className="input"
                value={value.serviceMonths ?? ""}
                onChange={(e) => set("serviceMonths", Number(e.target.value))}
              />
            </div>
          </>
        )}
        <Toggle
          label="סיום תואר אקדמי (עד שנתיים אחרונות)"
          checked={!!value.academicDegreeFinished}
          onChange={(c) => set("academicDegreeFinished", c)}
        />
        {value.academicDegreeFinished && (
          <div>
            <label className="label">שנת סיום</label>
            <input
              type="number"
              className="input"
              value={value.academicDegreeYear ?? ""}
              onChange={(e) => set("academicDegreeYear", Number(e.target.value))}
            />
          </div>
        )}
        <div>
          <label className="label">ימי מילואים פעילים בשנת המס</label>
          <input
            type="number"
            className="input"
            value={value.reservistDays ?? ""}
            onChange={(e) => set("reservistDays", Number(e.target.value))}
            placeholder="5+ ימים = נקודת זיכוי"
          />
        </div>
        <Toggle
          label="גר/ה בישוב מזכה"
          checked={!!value.livingInBenefitedTown}
          onChange={(c) => set("livingInBenefitedTown", c)}
        />
        {value.livingInBenefitedTown && (
          <div>
            <label className="label">קוד ישוב</label>
            <input
              className="input"
              value={value.benefitedTownCode ?? ""}
              onChange={(e) => set("benefitedTownCode", e.target.value)}
            />
          </div>
        )}
        <Toggle label="נכה 100%" checked={!!value.isDisabled} onChange={(c) => set("isDisabled", c)} />
        <Toggle label="עיוור" checked={!!value.isBlind} onChange={(c) => set("isBlind", c)} />
      </div>

      <h3 className="text-md font-semibold text-slate-800 mt-8 mb-3">חשבון בנק להחזר</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">מספר בנק + סניף</label>
          <input
            className="input"
            value={value.bankBranch ?? ""}
            onChange={(e) => set("bankBranch", e.target.value)}
            placeholder="לדוגמה: 12-345"
          />
        </div>
        <div>
          <label className="label">מספר חשבון</label>
          <input
            className="input"
            value={value.bankAccount ?? ""}
            onChange={(e) => set("bankAccount", e.target.value)}
          />
        </div>
        <div>
          <label className="label">שם בעל החשבון</label>
          <input
            className="input"
            value={value.bankAccountOwner ?? ""}
            onChange={(e) => set("bankAccountOwner", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}
