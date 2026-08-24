"use client";

import Wizard from "@/components/Wizard";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 border border-brand-200 px-4 py-1 text-xs font-bold text-brand-700 mb-4">
          💸 מס חוזר
        </div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          בואו נבדוק כמה כסף מגיע לך בחזרה
        </h1>
        <p className="text-soft mt-2 max-w-xl">
          כמה שאלות קצרות, הנתונים מטופסי ה-106 — ובסוף: חישוב מלא של ההחזר
          וכל מה שצריך להגשה. הערכה בלבד; לפני הגשה מומלץ לאמת בסימולטור
          הרשמי של רשות המסים.
        </p>
      </header>
      <Wizard />
      <footer className="mt-12 text-xs text-slate-500 text-center">
        החישוב הוא הערכה בלבד ואינו מהווה ייעוץ מס מקצועי. במקרי ספק יש להתייעץ
        עם רואה חשבון או יועץ מס.
      </footer>
    </main>
  );
}
