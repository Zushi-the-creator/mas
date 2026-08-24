"use client";

import { useState } from "react";
import { UserData } from "@/lib/types";
import { defaultUserData } from "@/lib/defaults";
import StepPersonal from "./steps/StepPersonal";
import StepSpouse from "./steps/StepSpouse";
import StepChildren from "./steps/StepChildren";
import StepForms106 from "./steps/StepForms106";
import StepExtras from "./steps/StepExtras";
import StepCalculating from "./steps/StepCalculating";
import StepResults from "./steps/StepResults";

const STEPS = [
  { id: 1, label: "פרטים אישיים" },
  { id: 2, label: "בן/בת זוג" },
  { id: 3, label: "ילדים" },
  { id: 4, label: "טופסי 106" },
  { id: 5, label: "הכנסות נוספות" },
  { id: 6, label: "התוצאה שלך" },
];

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  const [data, setData] = useState<UserData>(defaultUserData());

  const next = () => {
    if (step === 5) {
      // לפני התוצאה — מסך חישוב מונפש
      setCalculating(true);
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const update = <K extends keyof UserData>(key: K, value: UserData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const finishCalculating = () => {
    setCalculating(false);
    setStep(6);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      <Stepper
        current={step}
        steps={STEPS}
        onJump={(n) => !calculating && setStep(n)}
        busy={calculating}
      />
      <div className="card">
        {calculating ? (
          <StepCalculating onDone={finishCalculating} />
        ) : (
          <>
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
            <div className="flex justify-between mt-8 pt-5 border-t border-brand-100">
              <button className="btn-ghost" onClick={back} disabled={step === 1}>
                חזרה
              </button>
              {step < STEPS.length ? (
                <button className="btn-primary" onClick={next}>
                  {step === 5 ? "חשבו לי את ההחזר ✨" : "ממשיכים"}
                </button>
              ) : (
                <span className="text-sm text-soft self-center">זהו! 🎉</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stepper({
  current,
  steps,
  onJump,
  busy,
}: {
  current: number;
  steps: { id: number; label: string }[];
  onJump: (n: number) => void;
  busy: boolean;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((s) => {
        const active = s.id === current && !busy;
        const done = s.id < current || (busy && s.id <= 5);
        return (
          <li key={s.id}>
            <button
              onClick={() => onJump(s.id)}
              disabled={busy}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-pillow"
                  : done
                    ? "bg-brand-100 text-brand-700 border-brand-200"
                    : "bg-white text-soft border-brand-200"
              }`}
            >
              {done && !active ? "✓ " : ""}
              {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
