"use client";

import { useEffect, useRef, useState } from "react";

const TASKS = [
  "קוראים את נתוני ההכנסה מכל המעסיקים",
  "מחשבים מס לפי מדרגות שנת המס",
  "סופרים נקודות זיכוי — ילדים, מילואים, תארים",
  "בודקים זיכויי פנסיה וביטוח חיים",
  "משווים למס שנוכה לך בפועל",
];

const STEP_MS = 620;

interface Props {
  onDone: () => void;
}

export default function StepCalculating({ onDone }: Props) {
  const [done, setDone] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setDone(TASKS.length);
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    TASKS.forEach((_, i) => {
      timers.push(setTimeout(() => setDone(i + 1), STEP_MS * (i + 1)));
    });
    timers.push(setTimeout(onDone, STEP_MS * (TASKS.length + 1) + 250));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center py-10 text-center">
      {/* מטבע פועם */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-brand-400 animate-ringPulse" />
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-butter-200 to-brand-300 shadow-pillow flex items-center justify-center text-4xl font-bold text-brand-800">
          ₪
        </div>
      </div>

      <h2 className="text-xl font-bold text-ink mb-1">מחשבים את ההחזר שלך…</h2>
      <p className="text-sm text-soft mb-8">כמה שניות — עוברים על כל שקל</p>

      <ul className="text-right space-y-3 w-full max-w-sm">
        {TASKS.map((task, i) => {
          const isDone = i < done;
          const isActive = i === done;
          return (
            <li
              key={task}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                isDone ? "animate-fadeUp text-ink" : isActive ? "text-soft" : "opacity-30 text-soft"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-brand-600 text-white"
                    : isActive
                      ? "border-2 border-brand-400 text-brand-600"
                      : "border border-brand-200 text-transparent"
                }`}
              >
                {isDone ? "✓" : "·"}
              </span>
              {task}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
