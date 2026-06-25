import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Verdict",
  description: "Strict bilingual CV evaluation from 100.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
