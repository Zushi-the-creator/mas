"use client";

import { Child, ChildrenInfo } from "@/lib/types";

interface Props {
  value: ChildrenInfo;
  onChange: (v: ChildrenInfo) => void;
}

export default function StepChildren({ value, onChange }: Props) {
  const set = <K extends keyof ChildrenInfo>(k: K, v: ChildrenInfo[K]) =>
    onChange({ ...value, [k]: v });

  const updateChild = (i: number, patch: Partial<Child>) => {
    const next = [...value.children];
    next[i] = { ...next[i], ...patch };
    set("children", next);
  };

  const addChild = () =>
    set("children", [...value.children, { birthDate: "", name: "" }]);

  const removeChild = (i: number) =>
    set(
      "children",
      value.children.filter((_, idx) => idx !== i),
    );

  return (
    <div>
      <h2 className="section-title">ילדים</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label">מי מקבל קצבת ילדים?</label>
          <select
            className="input"
            value={value.receivesChildAllowance}
            onChange={(e) =>
              set(
                "receivesChildAllowance",
                e.target.value as ChildrenInfo["receivesChildAllowance"],
              )
            }
          >
            <option value="self">אני</option>
            <option value="spouse">בן/בת הזוג</option>
            <option value="split">חצי-חצי (משמרת משותפת)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 mt-7">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={value.isSingleParent}
            onChange={(e) => set("isSingleParent", e.target.checked)}
          />
          <span className="text-sm">הורה יחיד (חד-הורי)</span>
        </label>
        <div>
          <label className="label">ילדים נטולי יכולת (מספר)</label>
          <input
            type="number"
            className="input"
            value={value.disabledChildrenCount ?? ""}
            onChange={(e) => set("disabledChildrenCount", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">מזונות לבן/בת זוג לשעבר (₪/שנה)</label>
          <input
            type="number"
            className="input"
            value={value.childSupportPaid ?? ""}
            onChange={(e) => set("childSupportPaid", Number(e.target.value))}
          />
        </div>
      </div>

      <h3 className="text-md font-semibold text-slate-800 mb-3">פרטי הילדים</h3>
      <div className="space-y-3">
        {value.children.map((child, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end bg-slate-50 p-3 rounded border border-slate-200"
          >
            <div>
              <label className="label">שם הילד/ה</label>
              <input
                className="input"
                value={child.name ?? ""}
                onChange={(e) => updateChild(i, { name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">תאריך לידה</label>
              <input
                type="date"
                className="input"
                value={child.birthDate}
                onChange={(e) => updateChild(i, { birthDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">ת.ז. (אופציונלי)</label>
              <input
                className="input"
                value={child.id ?? ""}
                onChange={(e) => updateChild(i, { id: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeChild(i)}
              className="btn-ghost text-red-600 hover:bg-red-50"
            >
              הסר
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addChild} className="btn-primary mt-4">
        + הוסף ילד/ה
      </button>
    </div>
  );
}
