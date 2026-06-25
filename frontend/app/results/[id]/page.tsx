"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchReport, Report, API_URL } from "../../../lib/api";

export default function ResultPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    fetchReport(params.id).then(setReport).catch((err) => setError(err.message));
  }, [params.id]);

  async function deleteData() {
    await fetch(`${API_URL}/api/analysis/${params.id}`, { method: "DELETE" });
    setDeleted(true);
  }

  if (deleted) {
    return (
      <main className="shell">
        <section className="results-shell">
          <Link href="/" className="verdict-label">CV Verdict</Link>
          <div className="audit-section"><h2>تم حذف التحليل</h2><p>تم حذف ملفك ونتيجة التحليل من التخزين المؤقت.</p></div>
        </section>
      </main>
    );
  }

  if (error) {
    return <main className="shell"><section className="results-shell"><div className="error">Report error: {error}</div></section></main>;
  }

  if (!report) {
    return <main className="shell"><section className="results-shell"><span className="verdict-label">Building evidence report...</span></section></main>;
  }

  const isArabic = report.language === "ar";

  return (
    <main className="shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <Link href="/" className="brand"><span className="brand-mark" /> CV Verdict</Link>
        <span className="lang-note">{report.request_id}</span>
      </header>

      <section className="results-shell">
        <div className="result-layout">
          <aside className="score-spine">
            <div className="pill">{isArabic ? "الدرجة النهائية" : "Final score"}</div>
            <div className="score-number">{report.score.final_score}<small>/100</small></div>
            <p><strong>{report.classification}</strong></p>
            <p>{report.decision}</p>
            <button className="primary-button" onClick={deleteData}>{isArabic ? "احذف ملفي ونتيجتي" : "Delete my file and result"}</button>
          </aside>

          <div>
            <section className="audit-section">
              <h2>{isArabic ? "الحكم التنفيذي" : "Executive judgment"}</h2>
              <p>{report.executive_judgment}</p>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "توزيع الدرجة" : "Score breakdown"}</h2>
              <p>{isArabic ? "المعايير الرئيسية" : "Main criteria"}: <strong>{report.score.main_score}/60</strong></p>
              <p>{isArabic ? "الفحص الداخلي" : "Internal review"}: <strong>{report.score.internal_score}/40</strong></p>
              <p>{isArabic ? "الخصومات الإضافية" : "Additional penalties"}: <strong>{report.score.penalties}</strong></p>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "أقوى الإشارات" : "Strongest signals"}</h2>
              <ul className="strength-list">
                {report.strengths.map((item, index) => (
                  <li key={index}><strong>{String(item.title || "Signal")}</strong><span>{String(item.evidence || "")}</span></li>
                ))}
              </ul>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "أخطر المشكلات" : "Highest risks"}</h2>
              <ul className="issue-list">
                {report.issues.map((item, index) => (
                  <li key={index}>
                    <span className="pill">{String(item.severity || "risk")}</span>
                    <strong>{String(item.title || "Issue")}</strong>
                    <p>{String(item.why || "")}</p>
                    <p><strong>{isArabic ? "الإجراء:" : "Action:"}</strong> {String(item.action || "")}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "خطة الإصلاح" : "Repair plan"}</h2>
              <ol className="repair-list">
                {report.repair_plan.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </section>

            <section className="audit-section">
              <h2>ATS</h2>
              <p>{isArabic ? "درجة تقديرية" : "Estimated score"}: <strong>{String(report.ats.estimated_score)}/100</strong></p>
              <p>{isArabic ? "النص قابل للقراءة" : "Readable text"}: <strong>{String(report.ats.readable_text)}</strong></p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
