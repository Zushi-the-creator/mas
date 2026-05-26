"use client";

import { useMemo, useState } from "react";
import { UserData } from "@/lib/types";
import { defaultUserData } from "@/lib/defaults";
import StepPersonal from "./steps/StepPersonal";
import StepSpouse from "./steps/StepSpouse";
import StepChildren from "./steps/StepChildren";
import StepForms106 from "./steps/StepForms106";
import StepExtras from "./steps/StepExtras";
import StepResults from "./steps/StepResults";

const STEPS = [
  { id: 1, label: "פרטים אישיים" },
  { id: 2, label: "בן/בת זוג" },
  { id: 3, label: "ילדים" },
  { id: 4, label: "טופסי 106" },
  { id: 5, label: "הכנסות ותשלומים נוספים" },
  { id: 6, label: "תוצאות ומילוי 135" },
];

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserData>(defaultUserData());

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const update = <K extends keyof UserData>(key: K, value: UserData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  return (
    <div className="space-y-6">
      <Stepper current={step} steps={STEPS} onJump={setStep} />
      <div className="card">
        {step === 1 && (
          <StepPersonal value={data.personal} onChange={(v) => update("personal", v)} />
        )}
        {step === 2 && (
          <StepSpouse value={data.spouse} onChange={(v) => update("spouse", v)} />
        )}
        {step === 3 && (
          <StepChildren value={data.children} onChange={(v) => update("children", v)} />
        )}
        {step === 4 && (
          <StepForms106 value={data.forms106} onChange={(v) => update("forms106", v)} />
        )}
        {step === 5 && (
          <StepExtras
            bituachLeumi={data.bituachLeumi}
            severance={data.severance}
            privatePension={data.privatePension}
            donations={data.donations}
            onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
          />
        )}
        {step === 6 && <StepResults data={data} />}
        <div className="flex justify-between mt-8 pt-4 border-t border-slate-200">
          <button className="btn-ghost" onClick={back} disabled={step === 1}>
            חזור
          </button>
          {step < STEPS.length ? (
            <button className="btn-primary" onClick={next}>
              המשך
            </button>
          ) : (
            <span className="text-sm text-slate-500">סיימת ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({
  current,
  steps,
  onJump,
}: {
  current: number;
  steps: { id: number; label: string }[];
  onJump: (n: number) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((s) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <li key={s.id}>
            <button
              onClick={() => onJump(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active
                  ? "bg-brand-600 text-white border-brand-600"
                  : done
                    ? "bg-brand-50 text-brand-700 border-brand-200"
                    : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              {s.id}. {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
