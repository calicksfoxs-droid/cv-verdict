"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getBackendError, getNetworkError } from "../lib/api";

export default function HomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [targetRole, setTargetRole] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("cv_file");

    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      setError(new ApiError("INVALID_FILE_TYPE"));
      setBusy(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(new ApiError("FILE_TOO_LARGE"));
      setBusy(false);
      return;
    }

    const url = "/api/analysis";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        throw await getBackendError(response);
      }
      const payload = await response.json();
      router.push(`/results/${payload.request_id}`);
    } catch (err) {
      setError(getNetworkError(err, url));
      setBusy(false);
    }
  }

  const isArabic = language === "ar";
  const errorCopy: Record<string, string> = {
    INVALID_FILE_TYPE: isArabic ? "ارفع ملف PDF فقط." : "Upload a PDF file only.",
    FILE_TOO_LARGE: isArabic ? "حجم الملف أكبر من 5MB." : "File size is larger than 5MB.",
    NO_EXTRACTABLE_TEXT: isArabic ? "لم نستطع قراءة النص داخل الملف. ارفع نسخة PDF نصية. لا ندعم OCR الآن." : "No readable text was found. Upload a text-based PDF. OCR is not supported now.",
    PASSWORD_PROTECTED_PDF: isArabic ? "الملف محمي بكلمة مرور. أزل الحماية ثم أعد الرفع." : "The PDF is password protected. Remove protection and upload again.",
    CORRUPTED_PDF: isArabic ? "ملف PDF تالف أو غير صالح." : "The PDF is corrupted or invalid.",
    TOO_MANY_PAGES: isArabic ? "النسخة الحالية تقبل حتى 3 صفحات فقط." : "The current MVP accepts up to 3 pages only.",
    JOB_DESCRIPTION_TOO_LONG: isArabic ? "الوصف الوظيفي طويل جدًا للنسخة الحالية." : "The job description is too long for the current MVP.",
    REPORT_NOT_READY: isArabic ? "التقرير غير جاهز بعد." : "The report is not ready yet.",
    BACKEND_UNAVAILABLE: isArabic ? "تعذر الاتصال بخادم التحليل. تحقق من إعدادات النشر." : "Could not reach the analysis server. Check deployment settings.",
    ANALYSIS_FAILED: isArabic ? "فشل التحليل. حاول مرة أخرى." : "Analysis failed. Try again.",
  };

  return (
    <main className="shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" /> CV Verdict</div>
        <div className="top-actions">
          <button className="lang-switch" type="button" onClick={() => setLanguage(isArabic ? "en" : "ar")}>{isArabic ? "English" : "العربية"}</button>
          <div className="lang-note">PDF · 5MB · Vercel</div>
        </div>
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

          <div className="trust-row" aria-label="Product boundaries">
            <span>{isArabic ? "بدون حساب" : "No account"}</span>
            <span>{isArabic ? "بدون OCR" : "No OCR"}</span>
            <span>{isArabic ? "لا تدريب على CV" : "No CV training"}</span>
          </div>

          <div className="action-panel" id="analysis-form">
            <div className="panel-head">
              <span>{isArabic ? "طلب تحليل جديد" : "New analysis request"}</span>
              <span>{isArabic ? "يعمل من نفس الموقع" : "Runs on this site"}</span>
            </div>

            <form className="upload-form" onSubmit={submit}>
              <div className="privacy-band">
                {isArabic
                  ? "الملفات مؤقتة. لا نستخدم سيرتك لتدريب النماذج، ويمكنك حذف التحليل بعد ظهور النتيجة."
                  : "Files are temporary. Your CV is not used for training, and you can delete the analysis after the result appears."}
              </div>

              <div className="field">
                <label htmlFor="cv_file">{isArabic ? "ملف السيرة PDF" : "CV PDF file"}</label>
                <div className="upload-drop">
                  <input id="cv_file" name="cv_file" type="file" accept="application/pdf" required />
                  <div className="upload-copy">
                    <strong>{isArabic ? "ارفع ملف PDF نصي" : "Upload a text-based PDF"}</strong>
                    <span>{isArabic ? "اسحب الملف هنا أو اختره من جهازك. الحد الأقصى 5MB و3 صفحات." : "Drop the file here or choose it from your device. Max 5MB and 3 pages."}</span>
                  </div>
                </div>
                <span className="hint">{isArabic ? "لو كان الملف صورة ممسوحة ضوئيًا سنطلب نسخة PDF نصية، لأن OCR خارج نطاق النسخة الحالية." : "If the file is scanned, you will be asked for a text-based PDF because OCR is out of scope."}</span>
              </div>

              <div className="form-section-title">{isArabic ? "خيارات التقرير" : "Report options"}</div>
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

              <div className="form-section-title">{isArabic ? "استهداف الوظيفة" : "Role targeting"}</div>
              <div className="field">
                <label htmlFor="target_role">{isArabic ? "الوظيفة المستهدفة — اختيارية" : "Target role — optional"}</label>
                <input id="target_role" name="target_role" type="text" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder={isArabic ? "مثال: AI Automation Intern" : "Example: AI Automation Intern"} />
                {!targetRole.trim() && <span className="warning-note">{isArabic ? "سيتم إنشاء تقييم عام، لكن توافق السيرة مع وظيفة محددة سيكون محدودًا." : "A generic evaluation will be created, but role fit will be limited."}</span>}
              </div>

              <div className="field">
                <label htmlFor="job_description">Job Description — {isArabic ? "اختياري" : "optional"}</label>
                <textarea id="job_description" name="job_description" placeholder={isArabic ? "الصق الوصف الوظيفي هنا إن وجد." : "Paste the job description here if available."} />
              </div>

              {error && (
                <div className="error">
                  <div>{errorCopy[error.code] || errorCopy.ANALYSIS_FAILED}</div>
                  {(error.url || error.status || error.body) && (
                    <details>
                      <summary>{isArabic ? "تفاصيل التشخيص" : "Diagnostic details"}</summary>
                      <pre>{JSON.stringify({ url: error.url, status: error.status, body: error.body }, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}

              {busy && (
                <div className="processing-panel" aria-live="polite">
                  <strong>{isArabic ? "جاري بناء مسار الأدلة" : "Building the evidence trail"}</strong>
                  <span>{isArabic ? "فحص الملف، استخراج النص، قراءة الأقسام، ثم حساب الدرجة." : "Checking the file, extracting text, reading sections, then calculating the score."}</span>
                </div>
              )}

              <button className="primary-button" type="submit" disabled={busy}>
                {busy ? (isArabic ? "جاري التحليل..." : "Analyzing...") : (isArabic ? "ابدأ فحص السيرة" : "Start CV audit")}
              </button>
            </form>
          </div>
        </div>

        <aside className="evidence-rail" aria-label="Evidence rail">
          <div className="audit-strip">
            <span>{isArabic ? "Evidence Rail" : "Evidence Rail"}</span>
            <strong>{isArabic ? "الحكم مبني على دليل." : "The verdict follows evidence."}</strong>
          </div>
          <div className="rail-item"><strong>{isArabic ? "لا نقاط بلا سبب" : "No score without reason"}</strong><span>{isArabic ? "كل خصم أو إضافة يجب أن يستند لما يظهر في السيرة." : "Each gain or loss must come from visible CV evidence."}</span></div>
          <div className="rail-item"><strong>{isArabic ? "الوظيفة اختيارية" : "Role is optional"}</strong><span>{isArabic ? "لكن عدم تحديدها يجعل التقييم عامًا." : "But skipping it makes the evaluation generic."}</span></div>
          <div className="rail-item"><strong>{isArabic ? "البيانات مؤقتة" : "Temporary data"}</strong><span>{isArabic ? "لا حساب، لا تدريب على سيرتك، وزر حذف واضح." : "No account, no model training on your CV, and clear delete control."}</span></div>
          <div className="rail-item"><strong>{isArabic ? "رفض واضح" : "Clear rejection"}</strong><span>{isArabic ? "غير PDF، الملف الكبير، أو PDF المصور يحصل على رسالة إصلاح مباشرة." : "Non-PDF, large files, or scanned PDFs get a direct fix message."}</span></div>
        </aside>
      </section>
    </main>
  );
}
