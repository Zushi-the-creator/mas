"use client";

import { useMemo, useState } from "react";
import { UserData } from "@/lib/types";
import { calculate } from "@/lib/taxCalculator";
import { buildForm135 } from "@/lib/form135";
import { buildChecklist } from "@/lib/checklist";
import { buildExtensionCase } from "@/lib/extensionCase";

interface Props {
  data: UserData;
}

const fmt = (n: number) =>
  Math.round(n).toLocaleString("he-IL", { maximumFractionDigits: 0 });

export default function StepResults({ data }: Props) {
  const [isFemale, setIsFemale] = useState(false);
  const result = useMemo(() => calculate(data, isFemale), [data, isFemale]);
  const form135 = useMemo(() => buildForm135(data), [data]);
  const checklist = useMemo(() => buildChecklist(data), [data]);

  const isRefund = result.refund >= 0;
  const sections = Array.from(new Set(form135.map((f) => f.section)));

  const download = (obj: unknown, name: string) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () =>
    download({ data, result, form135, checklist }, `tax-refund-${data.personal.taxYear}.json`);

  // קובץ תיק לתוסף הדפדפן — מודבק ב-popup של התוסף וממלא את מסכי הרשות
  const downloadCase = () =>
    download(buildExtensionCase(data, result), `case-${data.personal.taxYear}.json`);

  return (
    <div className="space-y-8">
      <h2 className="section-title">תוצאות החישוב</h2>

      <label className="flex items-center gap-2 -mt-3 mb-2">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={isFemale}
          onChange={(e) => setIsFemale(e.target.checked)}
        />
        <span className="text-sm text-slate-700">המגיש/ה היא אישה (תוספת 0.5 נקודות זיכוי)</span>
      </label>

      {/* התראות */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div
              key={i}
              className={`p-3 rounded text-sm ${
                w.level === "red"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : w.level === "yellow"
                    ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                    : "bg-green-50 border border-green-200 text-green-800"
              }`}
            >
              {w.message}
            </div>
          ))}
        </div>
      )}

      {/* סיכום ראשי */}
      <div
        className={`rounded-xl p-6 text-center border-2 ${
          isRefund
            ? "bg-green-50 border-green-400"
            : "bg-red-50 border-red-400"
        }`}
      >
        <div className="text-sm font-medium text-slate-600 mb-1">
          {isRefund ? "החזר משוער" : "חוב משוער"}
        </div>
        <div
          className={`text-4xl font-bold ${
            isRefund ? "text-green-700" : "text-red-700"
          }`}
        >
          {fmt(Math.abs(result.refund))} ₪
        </div>
        <div className="mt-2 text-xs text-slate-500">
          רמת ביטחון: {hebConfidence(result.confidence)}
        </div>
      </div>

      {/* פירוט חישוב */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="הכנסה חייבת">
          <Row label="סה״כ" value={`${fmt(result.totalIncome)} ₪`} bold />
          {result.incomeBreakdown.map((b, i) => (
            <Row key={i} label={b.label} value={`${fmt(b.amount)} ₪`} />
          ))}
        </CalcCard>

        <CalcCard title="מס ברוטו לפי מדרגות">
          {result.taxByBracket.map((b, i) => (
            <Row
              key={i}
              label={`${b.label} על ${fmt(b.amount)} ₪`}
              value={`${fmt(b.tax)} ₪`}
            />
          ))}
          <Row label="מס יסף (3%)" value={`${fmt(result.yasefTax)} ₪`} />
          <Row
            label="סה״כ מס ברוטו"
            value={`${fmt(result.grossTax + result.yasefTax)} ₪`}
            bold
          />
        </CalcCard>

        <CalcCard title={`נקודות זיכוי — ${result.creditPoints.toFixed(2)}`}>
          {result.creditPointsBreakdown.map((b, i) => (
            <Row
              key={i}
              label={b.label}
              value={`${b.points.toFixed(2)} נק׳`}
            />
          ))}
          <Row
            label="שווי כספי"
            value={`${fmt(result.creditPointsValue)} ₪`}
            bold
          />
        </CalcCard>

        <CalcCard title="זיכויים נוספים">
          <Row label="זיכוי קצבה (35%)" value={`${fmt(result.pensionCredit)} ₪`} />
          <Row
            label="ביטוח חיים (25%)"
            value={`${fmt(result.lifeInsuranceCredit)} ₪`}
          />
          <Row label="תרומות (35%)" value={`${fmt(result.donationCredit)} ₪`} />
          <Row
            label="סה״כ זיכויים"
            value={`${fmt(result.totalCredits)} ₪`}
            bold
          />
        </CalcCard>

        <CalcCard title="חישוב סופי">
          <Row label="מס ברוטו + יסף" value={`${fmt(result.grossTax + result.yasefTax)} ₪`} />
          <Row label="– סה״כ זיכויים" value={`${fmt(result.totalCredits)} ₪`} />
          <Row label="מס נטו לתשלום" value={`${fmt(result.netTax)} ₪`} bold />
          <Row label="מס ששולם בפועל" value={`${fmt(result.totalTaxPaid)} ₪`} />
          <Row
            label={isRefund ? "החזר" : "חוב"}
            value={`${fmt(Math.abs(result.refund))} ₪`}
            bold
          />
        </CalcCard>
      </div>

      {/* מילוי טופס 135 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">מילוי טופס 135 — שדה אחרי שדה</h3>
        {sections.map((sec) => (
          <details key={sec} className="mb-2 border border-slate-200 rounded">
            <summary className="cursor-pointer px-4 py-2 font-medium bg-slate-50">
              {sec}
            </summary>
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-right px-3 py-2">שדה</th>
                  <th className="text-right px-3 py-2">תיאור</th>
                  <th className="text-right px-3 py-2">ערך</th>
                </tr>
              </thead>
              <tbody>
                {form135
                  .filter((f) => f.section === sec)
                  .map((f, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-mono text-xs">{f.field}</td>
                      <td className="px-3 py-2 text-slate-600">{f.label}</td>
                      <td className="px-3 py-2 font-semibold">
                        {typeof f.value === "number" ? fmt(f.value) : f.value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </details>
        ))}
      </div>

      {/* מסמכים */}
      <div>
        <h3 className="text-lg font-semibold mb-3">מסמכים לצרף בהגשה</h3>
        <ul className="space-y-1">
          {checklist.map((c, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className={c.required ? "text-red-600" : "text-slate-500"}>
                {c.required ? "★" : "○"}
              </span>
              <span>
                <span className="font-medium">{c.label}</span>
                {c.reason && (
                  <span className="text-slate-500"> — {c.reason}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* פעולות */}
      <div className="flex flex-wrap gap-3">
        <button onClick={downloadJSON} className="btn-primary">
          הורד סיכום (JSON)
        </button>
        <button onClick={downloadCase} className="btn-primary">
          הורד קובץ תיק לתוסף המילוי
        </button>
        <a
          href="https://www.gov.il/he/Departments/General/itc-calculator"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          הסימולטור הרשמי של רשות המסים ↗
        </a>
        <a
          href="https://www.gov.il/he/service/yearly_report_employee_135"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          הגשת טופס 135 מקוון ↗
        </a>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded p-4 text-xs text-slate-600">
        <strong>חשוב:</strong> לפני הגשה אמת את התוצאה בסימולטור הרשמי. אם השוני
        עד ±10% — בטוח להגיש; אם השוני גדול יותר — יש לבדוק את הנתונים שוב.
        החישוב כאן הוא הערכה ולא ייעוץ מס מקצועי.
      </div>
    </div>
  );
}

function hebConfidence(c: "high" | "medium" | "low"): string {
  return c === "high" ? "גבוהה" : c === "medium" ? "בינונית" : "נמוכה";
}

function CalcCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <h4 className="font-semibold mb-3 text-slate-800">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${
        bold ? "border-t border-slate-200 pt-2 mt-1 font-semibold" : ""
      }`}
    >
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 font-mono">{value}</span>
    </div>
  );
}
