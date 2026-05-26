"use client";

import Wizard from "@/components/Wizard";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          מערכת לחישוב החזר מס והכנת טופס 135
        </h1>
        <p className="text-slate-600 mt-2">
          חישוב החזר מס שנתי לשכירים בישראל לפי כללי מס הכנסה. המערכת נותנת
          הערכה בלבד — לפני הגשה יש לאמת בסימולטור הרשמי של רשות המסים.
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
