import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מערכת החזר מס וטופס 135",
  description: "חישוב החזר מס שנתי והכנת טופס 135 לשכירים בישראל",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-heb text-ink min-h-screen">
        {children}
      </body>
    </html>
  );
}
