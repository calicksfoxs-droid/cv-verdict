import { Evaluation, GeneratedReport, ParsedCv, ReportLanguage, ReportType } from "./types";

export function generateReport(evaluation: Evaluation, parsed: ParsedCv, lang: ReportLanguage, reportType: ReportType): GeneratedReport {
  const finalScore = evaluation.scores.final_score;
  const mode = evaluation.analysis_mode;
  const issues = evaluation.issues.slice(0, reportType === "short" ? 3 : 5);
  let strengths = evaluation.strengths.slice(0, 3);

  if (lang === "ar") {
    const modeLabel = { generic: "عام", role_only: "حسب الوظيفة فقط", targeted: "موجه للوصف الوظيفي" }[mode];
    if (!strengths.length) strengths = [{ title: "النص قابل للتحليل", evidence: "تم استخراج نص كافٍ من ملف PDF." }];
    return {
      executive_judgment: `السيرة حصلت على ${finalScore}/100 في وضع تحليل ${modeLabel}. الحكم مبني على النص القابل للاستخراج فقط، ولا يفترض خبرات أو نتائج غير مذكورة. الأولوية الآن هي تقوية الدليل: أرقام حقيقية، روابط إثبات، ووضوح الوظيفة المستهدفة.`,
      ten_second_test: {
        candidate_identity: parsed.word_count ? "يمكن استخراج هوية مهنية مبدئية من النص" : "غير واضحة",
        target_specialization: mode === "generic" ? "غير محدد" : "محدد من المدخلات",
        strongest_signal: strengths[0]?.title || "لا توجد إشارة قوية كافية",
        main_gap: issues[0]?.title || "لا توجد مشكلة حرجة ظاهرة",
        initial_decision: evaluation.decision,
      },
      strengths,
      issues,
      repair_plan: [
        "حدد الوظيفة المستهدفة أو أضف Job Description إذا كان التقييم عامًا.",
        "أضف روابط Portfolio أو GitHub أو Demo للمشاريع المهمة.",
        "حوّل نقاط المهام إلى نتائج قابلة للقياس بدون اختراع أرقام.",
        "وضح التواريخ، نوع الدور، والجهة لكل تجربة أو مشروع.",
        "احذف أو ادعم أي وصف كبير مثل Expert أو Specialist بدليل واضح.",
      ].slice(0, reportType === "short" ? 3 : 5),
    };
  }

  const modeLabel = { generic: "generic", role_only: "role-only", targeted: "targeted" }[mode];
  if (!strengths.length) strengths = [{ title: "Readable text", evidence: "Enough text was extracted from the PDF." }];
  return {
    executive_judgment: `The CV scored ${finalScore}/100 in ${modeLabel} analysis mode. The verdict uses only extractable document evidence and does not assume missing experience or results. The priority is stronger proof: real metrics, proof links, and clearer role targeting.`,
    ten_second_test: {
      candidate_identity: parsed.word_count ? "A professional identity is partially extractable from the text" : "Unclear",
      target_specialization: mode === "generic" ? "Not specified" : "Specified from inputs",
      strongest_signal: strengths[0]?.title || "No strong signal detected",
      main_gap: issues[0]?.title || "No critical gap detected",
      initial_decision: evaluation.decision,
    },
    strengths,
    issues,
    repair_plan: [
      "Add a target role or job description if the analysis is generic.",
      "Add portfolio, GitHub, demo, or case-study links for important projects.",
      "Rewrite task bullets into measurable outcomes without inventing numbers.",
      "Clarify dates, role type, and organization for each experience or project.",
      "Remove or prove inflated labels such as Expert or Specialist.",
    ].slice(0, reportType === "short" ? 3 : 5),
  };
}
