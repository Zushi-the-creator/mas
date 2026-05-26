"use client";

import {
  BituachLeumiIncome,
  Donations,
  PrivatePension,
  SeveranceInfo,
  UserData,
} from "@/lib/types";

interface Props {
  bituachLeumi: BituachLeumiIncome;
  severance: SeveranceInfo;
  privatePension: PrivatePension;
  donations: Donations;
  onChange: (patch: Partial<UserData>) => void;
}

export default function StepExtras({
  bituachLeumi,
  severance,
  privatePension,
  donations,
  onChange,
}: Props) {
  return (
    <div className="space-y-8">
      <h2 className="section-title">הכנסות ותשלומים נוספים</h2>

      {/* ביטוח לאומי */}
      <section>
        <h3 className="font-semibold mb-3">תקבולים מביטוח לאומי</h3>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={bituachLeumi.hasUnemployment}
            onChange={(e) =>
              onChange({
                bituachLeumi: { ...bituachLeumi, hasUnemployment: e.target.checked },
              })
            }
          />
          <span className="text-sm">קיבלתי דמי אבטלה / לידה / מילואים</span>
        </label>
        {bituachLeumi.hasUnemployment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">סכום שנתי (₪) — לשדה 194</label>
              <input
                type="number"
                className="input"
                value={bituachLeumi.amount || ""}
                onChange={(e) =>
                  onChange({
                    bituachLeumi: { ...bituachLeumi, amount: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div>
              <label className="label">מס שנוכה ע״י ב״ל — לשדה 040</label>
              <input
                type="number"
                className="input"
                value={bituachLeumi.taxWithheld || ""}
                onChange={(e) =>
                  onChange({
                    bituachLeumi: {
                      ...bituachLeumi,
                      taxWithheld: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </section>

      {/* פיצויים */}
      <section>
        <h3 className="font-semibold mb-3">פיצויי פיטורים (טופס 161)</h3>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={severance.has161}
            onChange={(e) => onChange({ severance: { ...severance, has161: e.target.checked } })}
          />
          <span className="text-sm">פרשתי מעבודה בשנת המס</span>
        </label>
        {severance.has161 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">סוג טיפול בפיצויים</label>
              <select
                className="input"
                value={severance.type}
                onChange={(e) =>
                  onChange({
                    severance: { ...severance, type: e.target.value as SeveranceInfo["type"] },
                  })
                }
              >
                <option value="kitzba_continuity">רצף קצבה (ברירת מחדל) — לא חייב במס</option>
                <option value="pitzuyim_continuity">רצף פיצויים</option>
                <option value="cash">משיכה במזומן</option>
              </select>
            </div>
            {severance.type === "cash" && (
              <div>
                <label className="label">חלק חייב במס (₪)</label>
                <input
                  type="number"
                  className="input"
                  value={severance.taxableAmount || ""}
                  onChange={(e) =>
                    onChange({
                      severance: { ...severance, taxableAmount: Number(e.target.value) || 0 },
                    })
                  }
                />
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ למשיכה במזומן מומלץ טופס 1301 (לא 135) לבקשת פריסה לפי סעיף 8(ג).
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* הפקדות פרטיות */}
      <section>
        <h3 className="font-semibold mb-3">הפקדות פרטיות (שלא דרך התלוש)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">קופ״ג כעמית עצמאי (₪)</label>
            <input
              type="number"
              className="input"
              value={privatePension.selfPensionDeposit || ""}
              onChange={(e) =>
                onChange({
                  privatePension: {
                    ...privatePension,
                    selfPensionDeposit: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="label">ביטוח חיים פרטי (₪)</label>
            <input
              type="number"
              className="input"
              value={privatePension.lifeInsurancePrivate || ""}
              onChange={(e) =>
                onChange({
                  privatePension: {
                    ...privatePension,
                    lifeInsurancePrivate: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="label">ביטוח אובדן כושר עבודה (₪)</label>
            <input
              type="number"
              className="input"
              value={privatePension.disabilityInsurance || ""}
              onChange={(e) =>
                onChange({
                  privatePension: {
                    ...privatePension,
                    disabilityInsurance: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        </div>
      </section>

      {/* תרומות */}
      <section>
        <h3 className="font-semibold mb-3">תרומות (סעיף 46)</h3>
        <div>
          <label className="label">סך תרומות שנתי למוסדות מאושרים (₪)</label>
          <input
            type="number"
            className="input md:w-1/3"
            value={donations.amount || ""}
            onChange={(e) =>
              onChange({ donations: { amount: Number(e.target.value) || 0 } })
            }
          />
          <p className="text-xs text-slate-500 mt-1">
            מינימום מוכר: 207 ₪/שנה. זיכוי: 35% מהסכום.
          </p>
        </div>
      </section>
    </div>
  );
}
