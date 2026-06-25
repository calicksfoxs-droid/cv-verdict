"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";

export default function HomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(`${API_URL}/api/analysis`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || "ANALYSIS_FAILED");
      }
      const payload = await response.json();
      router.push(`/results/${payload.request_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ANALYSIS_FAILED");
      setBusy(false);
    }
  }

  const isArabic = language === "ar";

  return (
    <main className="shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" /> CV Verdict</div>
        <div className="lang-note">AR / EN · PDF audit</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="verdict-label">{isArabic ? "فحص صارم، لا مجاملة" : "Strict audit, not a compliment"}</span>
          <h1>{isArabic ? "سيرتك لا تحتاج مديحًا. تحتاج دليلًا." : "Your CV does not need praise. It needs evidence."}</h1>
          <p className="lede">
            {isArabic
              ? "ارفع سيرتك، اختر اللغة ونوع التقرير، واحصل على حكم واضح: الدرجة، المخاطر، ما يراه مسؤول التوظيف، وأول ما يجب إصلاحه."
              : "Upload your CV, choose language and report depth, then get a clear verdict: score, risks, recruiter view, and the first fixes that matter."}
          </p>

          <div className="action-panel">
            <div className="panel-head">
              <span>{isArabic ? "طلب تحليل جديد" : "New analysis request"}</span>
              <span>{isArabic ? "بدون حساب" : "No account"}</span>
            </div>

            <form className="upload-form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="cv_file">{isArabic ? "ملف السيرة PDF" : "CV PDF file"}</label>
                <input id="cv_file" name="cv_file" type="file" accept="application/pdf" required />
                <span className="hint">{isArabic ? "PDF نصي فقط. لا ندعم الصور أو OCR في النسخة الأولى." : "Text-based PDF only. Scans and OCR are not supported in the first MVP."}</span>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="language">{isArabic ? "لغة التقرير" : "Report language"}</label>
                  <select id="language" name="language" value={language} onChange={(e) => setLanguage(e.target.value as "ar" | "en")}>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="report_type">{isArabic ? "نوع التقرير المجاني" : "Free report type"}</label>
                  <select id="report_type" name="report_type">
                    <option value="medium">{isArabic ? "متوسط ومفيد جدًا" : "Medium and useful"}</option>
                    <option value="short">{isArabic ? "مختصر قوي" : "Sharp short"}</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="experience_level">{isArabic ? "مستوى الخبرة" : "Experience level"}</label>
                  <select id="experience_level" name="experience_level">
                    <option value="student">{isArabic ? "طالب" : "Student"}</option>
                    <option value="fresh_graduate">{isArabic ? "خريج جديد" : "Fresh graduate"}</option>
                    <option value="entry_level">{isArabic ? "مبتدئ" : "Entry-level"}</option>
                    <option value="mid_level">{isArabic ? "متوسط" : "Mid-level"}</option>
                    <option value="senior">{isArabic ? "خبير" : "Senior"}</option>
                    <option value="not_specified">{isArabic ? "غير محدد" : "Not specified"}</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="target_role">{isArabic ? "الوظيفة المستهدفة — اختيارية" : "Target role — optional"}</label>
                <input id="target_role" name="target_role" type="text" placeholder={isArabic ? "مثال: AI Automation Intern" : "Example: AI Automation Intern"} />
                <span className="hint">{isArabic ? "لو تركتها فارغة، ستحصل على تقييم عام." : "Leave it empty for a generic evaluation."}</span>
              </div>

              <div className="field">
                <label htmlFor="job_description">Job Description — {isArabic ? "اختياري" : "optional"}</label>
                <textarea id="job_description" name="job_description" placeholder={isArabic ? "الصق الوصف الوظيفي هنا إن وجد." : "Paste the job description here if available."} />
              </div>

              {error && <div className="error">{isArabic ? `فشل التحليل: ${error}` : `Analysis failed: ${error}`}</div>}

              <button className="primary-button" type="submit" disabled={busy}>
                {busy ? (isArabic ? "جاري التحليل..." : "Analyzing...") : (isArabic ? "ابدأ فحص السيرة" : "Start CV audit")}
              </button>
            </form>
          </div>
        </div>

        <aside className="evidence-rail" aria-label="Evidence rail">
          <div className="audit-strip">
            <span>{isArabic ? "ما الذي يميزنا؟" : "What makes it different?"}</span>
            <strong>{isArabic ? "الحكم مبني على دليل." : "The verdict follows evidence."}</strong>
          </div>
          <div className="rail-item"><strong>{isArabic ? "لا نقاط بلا سبب" : "No score without reason"}</strong><span>{isArabic ? "كل خصم أو إضافة يجب أن يستند لما يظهر في السيرة." : "Each gain or loss must come from visible CV evidence."}</span></div>
          <div className="rail-item"><strong>{isArabic ? "الوظيفة اختيارية" : "Role is optional"}</strong><span>{isArabic ? "لكن عدم تحديدها يجعل التقييم عامًا." : "But skipping it makes the evaluation generic."}</span></div>
          <div className="rail-item"><strong>{isArabic ? "البيانات مؤقتة" : "Temporary data"}</strong><span>{isArabic ? "لا حساب، لا تدريب على سيرتك، وزر حذف واضح." : "No account, no model training on your CV, and clear delete control."}</span></div>
        </aside>
      </section>
    </main>
  );
}
