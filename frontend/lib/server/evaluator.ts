import { AnalysisMode, Evaluation, Issue, ParsedCv, ReportLanguage, ScoreItem } from "./types";

function clean(value?: string | null) {
  return (value || "").trim();
}

export function getAnalysisMode(targetRole?: string | null, jobDescription?: string | null): AnalysisMode {
  if (clean(jobDescription)) return "targeted";
  if (clean(targetRole)) return "role_only";
  return "generic";
}

function classify(score: number, lang: ReportLanguage) {
  const labels = lang === "ar"
    ? [[95, "استثنائية ونادرة"], [90, "ممتازة جدًا"], [85, "قوية"], [80, "جيدة"], [70, "متوسطة"], [60, "ضعيفة نسبيًا"], [50, "غير مقنعة"], [0, "غير جاهزة مهنيًا"]] as const
    : [[95, "Exceptional"], [90, "Very strong"], [85, "Strong"], [80, "Good"], [70, "Average"], [60, "Relatively weak"], [50, "Unconvincing"], [0, "Not ready"]] as const;
  return labels.find(([threshold]) => score >= threshold)?.[1] || labels[labels.length - 1][1];
}

function issue(lang: ReportLanguage, severity: Issue["severity"], titleEn: string, titleAr: string, whyEn: string, whyAr: string, actionEn: string, actionAr: string): Issue {
  return {
    severity,
    title: lang === "ar" ? titleAr : titleEn,
    why: lang === "ar" ? whyAr : whyEn,
    action: lang === "ar" ? actionAr : actionEn,
  };
}

function scoreItem(criterion: string, maxScore: number, score: number, reason: string, priority: string): ScoreItem {
  return {
    criterion,
    max_score: maxScore,
    score: Math.round(Math.min(Math.max(score, 0), maxScore) * 10) / 10,
    reason,
    priority,
  };
}

function keywordOverlap(text: string, jobDescription?: string | null) {
  const jd = clean(jobDescription).toLowerCase();
  if (!jd) return 0;
  const words = new Set((jd.match(/[a-zA-Z][a-zA-Z+#.]{2,}/g) ?? []).filter((word) => word.length > 3));
  if (!words.size) return 0;
  const cvWords = new Set(text.toLowerCase().match(/[a-zA-Z][a-zA-Z+#.]{2,}/g) ?? []);
  return Array.from(words).filter((word) => cvWords.has(word)).length / words.size;
}

export function evaluate(parsed: ParsedCv, targetRole: string | null, jobDescription: string | null, lang: ReportLanguage): Evaluation {
  const sections = parsed.sections;
  const contact = parsed.contact_information;
  const bullets = parsed.bullet_points;
  const numbers = parsed.numbers;
  const links = contact.links;
  const mode = getAnalysisMode(targetRole, jobDescription);
  const searchableText = [bullets.join(" "), clean(targetRole), clean(jobDescription)].join(" ").toLowerCase();
  const overlap = keywordOverlap(searchableText, jobDescription);

  const issues: Issue[] = [];
  const strengths: Evaluation["strengths"] = [];
  const scoreCaps: Evaluation["score_caps"] = [];
  const hasWorkEvidence = Boolean(sections.experience || sections.projects);
  const hasProjectSection = Boolean(sections.projects);
  const hasNumbers = numbers.length > 0;
  const sectionCount = Object.values(sections).filter(Boolean).length;

  const main = [
    scoreItem("job_alignment", 10, ({ targeted: 8.5, role_only: 7, generic: 4 }[mode]) + Math.min(1.5, overlap * 3), "Mode and target clarity", mode === "generic" ? "high" : "medium"),
    scoreItem("experience_achievements", 10, (hasWorkEvidence ? 4 : 1.5) + Math.min(4, bullets.length * 0.7) + (hasNumbers ? 2 : 0), "Experience/project sections and achievement signals", "high"),
    scoreItem("measurable_results", 7, Math.min(7, numbers.length * 1.2), "Visible numeric evidence only", hasNumbers ? "medium" : "high"),
    scoreItem("titles_dates_credibility", 5, (parsed.dates.length ? 2.5 : 1) + (hasWorkEvidence ? 1.5 : 0.5) + (contact.email_found ? 1 : 0), "Dates, roles, and contact extractability", "medium"),
    scoreItem("professional_summary", 6, sections.summary ? 5 : 1.5, "Professional summary presence", "medium"),
    scoreItem("ats_keywords", 7, (sections.skills ? 2 : 0.5) + Math.min(2, sectionCount * 0.25) + (contact.email_found ? 2 : 0.5) + Math.min(1, overlap * 2), "Standard sections, contacts, and JD keyword overlap", "medium"),
    scoreItem("ten_second_readability", 5, (parsed.word_count <= 900 ? 2 : 1) + (sectionCount >= 4 ? 1.5 : 0.5) + (bullets.length >= 3 ? 1.5 : 0.5), "Skimmability from section and bullet structure", "medium"),
    scoreItem("unsupported_claims", 4, Math.max(0.5, 4 - parsed.buzzwords.length * 0.8), "Conservative penalty for unsupported inflated wording", parsed.buzzwords.length ? "medium" : "low"),
    scoreItem("project_evidence", 3, (hasProjectSection ? 1.5 : 0.5) + (links.length ? 1.5 : 0), "Project section and proof links", hasProjectSection && !links.length ? "critical" : "medium"),
    scoreItem("general_professionalism", 3, (contact.email_found ? 1 : 0.3) + (contact.phone_found ? 0.8 : 0.3) + (parsed.word_count <= 1200 ? 1.2 : 0.6), "Basic professional details", "low"),
  ];

  const internal = [
    scoreItem("bullet_quality", 8, Math.min(8, bullets.length * 0.9 + (hasNumbers ? 2 : 0)), "Bullet count and measurable evidence", "high"),
    scoreItem("language_grammar", 5, Math.max(2, 5 - parsed.buzzwords.length * 0.45), "No grammar AI is used in fallback; inflated wording is penalized", "medium"),
    scoreItem("skill_depth", 5, sections.skills && hasWorkEvidence ? 3.5 : sections.skills ? 2 : 1, "Skills are not treated as proof without evidence", "high"),
    scoreItem("section_structure", 5, Math.min(5, sectionCount * 0.75), "Recognized section structure", "medium"),
    scoreItem("visual_consistency", 5, parsed.line_count >= 8 && parsed.word_count <= 1200 ? 3.8 : 2.5, "Text extraction gives limited formatting evidence", "medium"),
    scoreItem("education_certifications", 4, (sections.education ? 2.5 : 0.8) + (sections.certifications ? 1.5 : 0), "Education and certification sections", "medium"),
    scoreItem("recruiter_risks", 5, 5 - (mode === "generic" ? 1.5 : 0) - (hasProjectSection && !links.length ? 1.5 : 0) - (hasNumbers ? 0 : 1), "Likely first-screening objections", "high"),
    scoreItem("small_details", 3, (contact.email_found ? 1 : 0.2) + (links.length ? 1 : 0.4) + (parsed.dates.length ? 1 : 0.4), "Small details visible in extracted text", "low"),
  ];

  if (mode === "generic") {
    issues.push(issue(lang, "high", "Target role is not specified", "الوظيفة المستهدفة غير محددة", "The analysis is generic and cannot fully judge role fit.", "التحليل عام ولا يمكنه قياس التوافق مع وظيفة محددة بدقة.", "Add a target role for a sharper evaluation.", "أضف وظيفة مستهدفة للحصول على تقييم أدق."));
    scoreCaps.push({ cap: 84, reason: "No target role or job description" });
  } else if (mode === "role_only") {
    scoreCaps.push({ cap: 89, reason: "Target role exists without job description" });
  }

  if (hasProjectSection && !links.length) {
    issues.push(issue(lang, "critical", "Projects have no proof links", "المشاريع بلا روابط إثبات", "Project claims are harder to verify without GitHub, portfolio, demo, or case-study links.", "يصعب التحقق من قوة المشاريع بدون GitHub أو Portfolio أو Demo أو Case Study.", "Add proof links and label what each link proves.", "أضف روابط إثبات ووضح ما يثبته كل رابط."));
    scoreCaps.push({ cap: 84, reason: "Projects are core evidence but no proof link exists" });
  }
  if (!hasNumbers) {
    issues.push(issue(lang, "high", "No measurable results", "لا توجد نتائج قابلة للقياس", "The CV describes content without showing measurable impact or scale.", "السيرة تعرض محتوى بدون أثر أو حجم عمل قابل للقياس.", "Add real numbers only where the CV can support them.", "أضف أرقامًا حقيقية فقط عندما يمكن إثباتها."));
    scoreCaps.push({ cap: 84, reason: "No measurable impact metrics" });
  }
  if (!sections.education) {
    issues.push(issue(lang, "high", "Education section is missing or unclear", "قسم التعليم مفقود أو غير واضح", "Education is important for students, fresh graduates, and entry-level applicants.", "التعليم مهم للطلاب والخريجين والمبتدئين.", "Add degree, institution, field, and graduation date/status.", "أضف الدرجة، المؤسسة، التخصص، وتاريخ أو حالة التخرج."));
  }

  if (sections.skills) strengths.push({ title: lang === "ar" ? "قسم المهارات موجود" : "Skills section detected", evidence: "Skills / Technical Skills" });
  if (bullets.length) strengths.push({ title: lang === "ar" ? "توجد نقاط قابلة للتحليل" : "Analyzable bullet points found", evidence: bullets[0].slice(0, 160) });
  if (numbers.length) strengths.push({ title: lang === "ar" ? "توجد أرقام داخل السيرة" : "Numeric evidence exists", evidence: numbers.slice(0, 5).join(", ") });
  if (links.length) strengths.push({ title: lang === "ar" ? "يوجد رابط إثبات" : "Proof link detected", evidence: links[0].slice(0, 120) });

  const mainScore = Math.min(60, Math.round(main.reduce((total, item) => total + item.score, 0) * 10) / 10);
  const internalScore = Math.min(40, Math.round(internal.reduce((total, item) => total + item.score, 0) * 10) / 10);
  const baseScore = Math.round((mainScore + internalScore) * 10) / 10;
  const capValue = Math.min(100, ...scoreCaps.map((cap) => cap.cap));
  const finalScore = Math.min(100, Math.max(0, Math.round(Math.min(baseScore, capValue) * 10) / 10));
  const penalties = Math.round((baseScore - finalScore) * 10) / 10;

  const decisionKey = finalScore >= 85 && hasNumbers && links.length && mode !== "generic" ? "ready" : finalScore >= 75 && !issues.some((item) => item.severity === "critical") ? "limited" : finalScore >= 50 ? "major" : "rebuild";
  const decisions = {
    ar: { ready: "جاهز للتقديم الآن", limited: "قابل للتقديم بعد تعديلات محدودة", major: "يحتاج إلى تعديلات جوهرية قبل التقديم", rebuild: "يحتاج إلى إعادة بناء كاملة" },
    en: { ready: "Ready to apply now", limited: "Submit after limited edits", major: "Needs major revisions before applying", rebuild: "Needs a full rebuild" },
  };

  return {
    analysis_mode: mode,
    scores: { main_score: mainScore, internal_score: internalScore, penalties, final_score: finalScore },
    score_caps: scoreCaps,
    criteria: { main, internal },
    classification: classify(finalScore, lang),
    decision: decisions[lang][decisionKey],
    issues: issues.slice(0, 5),
    strengths: strengths.slice(0, 3),
    ats: {
      estimated_score: Math.min(100, Math.round((main[5].score / 7) * 100)),
      readable_text: true,
      keyword_stuffing: parsed.buzzwords.length >= 4,
      standard_sections_found: Object.entries(sections).filter(([, present]) => present).map(([key]) => key),
      jd_keyword_overlap: jobDescription ? Math.round(overlap * 100) / 100 : null,
    },
  };
}
