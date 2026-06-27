"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchReport, Report, getNetworkError } from "../../../lib/api";

export default function ResultPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    fetchReport(params.id).then(setReport).catch((err) => setError(getNetworkError(err).code));
  }, [params.id]);

  async function deleteData() {
    await fetch(`/api/analysis/${params.id}`, { method: "DELETE" });
    setDeleted(true);
  }

  if (deleted) {
    return (
      <main className="shell" dir="rtl">
        <section className="results-shell">
          <Link href="/" className="verdict-label">CV Verdict</Link>
          <div className="audit-section"><h2>تم حذف التحليل</h2><p>تم حذف ملفك ونتيجة التحليل من التخزين المؤقت.</p></div>
        </section>
      </main>
    );
  }

  if (error) {
    const copy = error === "BACKEND_UNAVAILABLE" ? "تعذر الاتصال بخادم التحليل. تحقق من إعدادات النشر." : `Report error: ${error}`;
    return <main className="shell"><section className="results-shell"><div className="error">{copy}</div></section></main>;
  }

  if (!report) {
    return (
      <main className="shell">
        <section className="results-shell loading-shell">
          <span className="verdict-label">Building evidence report...</span>
          <div className="processing-panel"><strong>Evidence Rail</strong><span>Checking status, assembling score, and preparing the report.</span></div>
        </section>
      </main>
    );
  }

  const isArabic = report.language === "ar";
  const modeLabel = {
    generic: isArabic ? "تحليل عام" : "Generic analysis",
    role_only: isArabic ? "حسب الوظيفة فقط" : "Role-only analysis",
    targeted: isArabic ? "موجه للوصف الوظيفي" : "Targeted analysis",
  }[report.metadata.analysis_mode || "generic"];
  const mainCriteria = report.metadata.criteria?.main || [];
  const internalCriteria = report.metadata.criteria?.internal || [];

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
            <p className="hint">{modeLabel}</p>
            <p className="hint">{isArabic ? "الملفات مؤقتة. لا نستخدم سيرتك لتدريب النماذج." : "Files are temporary. Your CV is not used for training."}</p>
            <button className="primary-button" onClick={deleteData}>{isArabic ? "احذف ملفي ونتيجتي" : "Delete my file and result"}</button>
          </aside>

          <div>
            <section className="audit-section">
              <div className="evidence-mini-rail" aria-label="Evidence rail">
                <span>{isArabic ? "ملف PDF" : "PDF file"}</span>
                <span>{isArabic ? "نص مستخرج" : "Extracted text"}</span>
                <span>{isArabic ? "درجة" : "Score"}</span>
                <span>{isArabic ? "قرار" : "Decision"}</span>
              </div>
              <h2>{isArabic ? "الحكم التنفيذي" : "Executive judgment"}</h2>
              <p>{report.executive_judgment}</p>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "اختبار أول 10 ثوانٍ" : "First 10-second test"}</h2>
              <dl className="fact-list">
                {Object.entries(report.ten_second_test).map(([key, value]) => (
                  <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{String(value)}</dd></div>
                ))}
              </dl>
            </section>

            <section className="audit-section">
              <h2>{isArabic ? "توزيع الدرجة" : "Score breakdown"}</h2>
              <p>{isArabic ? "المعايير الرئيسية" : "Main criteria"}: <strong>{report.score.main_score}/60</strong></p>
              <p>{isArabic ? "الفحص الداخلي" : "Internal review"}: <strong>{report.score.internal_score}/40</strong></p>
              <p>{isArabic ? "الخصومات الإضافية" : "Additional penalties"}: <strong>{report.score.penalties}</strong></p>
              {report.metadata.score_caps && report.metadata.score_caps.length > 0 && <p className="warning-note">{isArabic ? "تم تطبيق سقف درجة بسبب نقص في المدخلات أو الأدلة." : "A score cap was applied because targeting or evidence is incomplete."}</p>}
            </section>

            {report.report_type === "medium" && (
              <section className="audit-section">
                <h2>{isArabic ? "توزيع مختصر" : "Compact distribution"}</h2>
                <div className="criteria-grid">
                  {[...mainCriteria.slice(0, 5), ...internalCriteria.slice(0, 3)].map((item, index) => (
                    <div className="criterion-row" key={index}>
                      <span>{String(item.criterion || "criterion")}</span>
                      <strong>{String(item.score || 0)}/{String(item.max_score || 0)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
              <p>{isArabic ? "حشو كلمات مفتاحية" : "Keyword stuffing"}: <strong>{String(report.ats.keyword_stuffing)}</strong></p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
