"use client";

import { Form106 } from "@/lib/types";

interface Props {
  value: Form106[];
  onChange: (v: Form106[]) => void;
}

function emptyForm(): Form106 {
  return {
    employerName: "",
    salary_158: 0,
    tax_042: 0,
    insurableIncome_244: 0,
    employeePension_045: 0,
    employerPension_248: 0,
    lifeInsurance_036: 0,
  };
}

export default function StepForms106({ value, onChange }: Props) {
  const update = (i: number, patch: Partial<Form106>) => {
    const next = [...value];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const add = () => onChange([...value, emptyForm()]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <h2 className="section-title">טופסי 106</h2>
      <p className="text-sm text-slate-600 mb-4">
        הוסף טופס 106 לכל מעסיק שעבדת אצלו בשנת המס. כל השדות במטבע ₪ (סכומים שנתיים).
      </p>

      <div className="space-y-6">
        {value.map((f, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">טופס #{i + 1}</h3>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-600 hover:underline text-sm"
              >
                הסר טופס
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="label">שם מעסיק</label>
                <input
                  className="input"
                  value={f.employerName}
                  onChange={(e) => update(i, { employerName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">תאריך תחילה</label>
                <input
                  type="date"
                  className="input"
                  value={f.startDate ?? ""}
                  onChange={(e) => update(i, { startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">תאריך סיום</label>
                <input
                  type="date"
                  className="input"
                  value={f.endDate ?? ""}
                  onChange={(e) => update(i, { endDate: e.target.value })}
                />
              </div>
              <NumField
                label="משכורת ברוטו (שדה 158/172)"
                v={f.salary_158}
                set={(n) => update(i, { salary_158: n })}
              />
              <NumField
                label="מס שנוכה (שדה 042)"
                v={f.tax_042}
                set={(n) => update(i, { tax_042: n })}
              />
              <NumField
                label="מס יסף שנוכה בנפרד"
                v={f.yasefWithheld ?? 0}
                set={(n) => update(i, { yasefWithheld: n })}
              />
              <NumField
                label="הכנסה מבוטחת (שדה 244)"
                v={f.insurableIncome_244}
                set={(n) => update(i, { insurableIncome_244: n })}
              />
              <NumField
                label="הפקדות עובד לקצבה (שדה 045/086)"
                v={f.employeePension_045}
                set={(n) => update(i, { employeePension_045: n })}
              />
              <NumField
                label="הפרשות מעביד לקופ״ג (שדה 248)"
                v={f.employerPension_248}
                set={(n) => update(i, { employerPension_248: n })}
              />
              <NumField
                label="ביטוח חיים (שדה 036/081)"
                v={f.lifeInsurance_036}
                set={(n) => update(i, { lifeInsurance_036: n })}
              />
              <NumField
                label="עבודה במשמרות (שדה 068)"
                v={f.shiftsWork_068 ?? 0}
                set={(n) => update(i, { shiftsWork_068: n })}
              />
              <NumField
                label="הפחתת דמי הבראה (שדה 012)"
                v={f.havraaReduction_012 ?? 0}
                set={(n) => update(i, { havraaReduction_012: n })}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className="btn-primary mt-4">
        + הוסף טופס 106
      </button>
    </div>
  );
}

function NumField({
  label,
  v,
  set,
}: {
  label: string;
  v: number;
  set: (n: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        className="input"
        value={v || ""}
        onChange={(e) => set(Number(e.target.value) || 0)}
      />
    </div>
  );
}
