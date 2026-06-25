from __future__ import annotations

import re
from typing import Any


MAIN_CRITERIA = [
    ("job_alignment", 10),
    ("experience_achievements", 10),
    ("measurable_results", 7),
    ("titles_dates_credibility", 5),
    ("professional_summary", 6),
    ("ats_keywords", 7),
    ("ten_second_readability", 5),
    ("unsupported_claims", 4),
    ("project_evidence", 3),
    ("general_professionalism", 3),
]

INTERNAL_CRITERIA = [
    ("bullet_quality", 8),
    ("language_grammar", 5),
    ("skill_depth", 5),
    ("section_structure", 5),
    ("visual_consistency", 5),
    ("education_certifications", 4),
    ("recruiter_risks", 5),
    ("small_details", 3),
]


def _clean(value: str | None) -> str:
    return (value or "").strip()


def analysis_mode(target_role: str | None, job_description: str | None) -> str:
    if _clean(job_description):
        return "targeted"
    if _clean(target_role):
        return "role_only"
    return "generic"


def classify(score: float, lang: str) -> str:
    labels_ar = [
        (95, "استثنائية ونادرة"), (90, "ممتازة جدًا"), (85, "قوية"), (80, "جيدة"),
        (70, "متوسطة"), (60, "ضعيفة نسبيًا"), (50, "غير مقنعة"), (0, "غير جاهزة مهنيًا"),
    ]
    labels_en = [
        (95, "Exceptional"), (90, "Very strong"), (85, "Strong"), (80, "Good"),
        (70, "Average"), (60, "Relatively weak"), (50, "Unconvincing"), (0, "Not ready"),
    ]
    labels = labels_ar if lang == "ar" else labels_en
    return next(label for threshold, label in labels if score >= threshold)


def _issue(lang: str, severity: str, title_en: str, title_ar: str, why_en: str, why_ar: str, action_en: str, action_ar: str) -> dict[str, Any]:
    return {
        "severity": severity,
        "title": title_ar if lang == "ar" else title_en,
        "why": why_ar if lang == "ar" else why_en,
        "action": action_ar if lang == "ar" else action_en,
    }


def _score_item(key: str, maximum: int, points: float, reason: str, priority: str) -> dict[str, Any]:
    return {
        "criterion": key,
        "max_score": maximum,
        "score": round(min(max(points, 0), maximum), 1),
        "reason": reason,
        "priority": priority,
    }


def _keyword_overlap(text: str, job_description: str | None) -> float:
    jd = _clean(job_description).lower()
    if not jd:
        return 0.0
    words = {word for word in re.findall(r"[a-zA-Z][a-zA-Z+#.]{2,}", jd) if len(word) > 3}
    if not words:
        return 0.0
    cv_words = set(re.findall(r"[a-zA-Z][a-zA-Z+#.]{2,}", text.lower()))
    return len(words & cv_words) / len(words)


def evaluate(parsed: dict[str, Any], target_role: str | None, job_description: str | None, lang: str) -> dict[str, Any]:
    sections = parsed["sections"]
    contact = parsed["contact_information"]
    bullets = parsed["bullet_points"]
    numbers = parsed["numbers"]
    links = contact["links"]
    dates = parsed.get("dates", [])
    buzzwords = parsed.get("buzzwords", [])
    mode = analysis_mode(target_role, job_description)
    searchable_text = " ".join([" ".join(bullets), _clean(target_role), _clean(job_description)]).lower()
    keyword_overlap = _keyword_overlap(searchable_text, job_description)

    issues: list[dict[str, Any]] = []
    strengths: list[dict[str, Any]] = []
    caps: list[dict[str, Any]] = []

    has_work_evidence = sections.get("experience") or sections.get("projects")
    has_project_section = sections.get("projects")
    has_numbers = bool(numbers)
    bullet_count = len(bullets)
    section_count = sum(1 for present in sections.values() if present)

    main_items = [
        _score_item("job_alignment", 10, {"targeted": 8.5, "role_only": 7.0, "generic": 4.0}[mode] + min(1.5, keyword_overlap * 3), "Mode and target clarity", "high" if mode == "generic" else "medium"),
        _score_item("experience_achievements", 10, (4 if has_work_evidence else 1.5) + min(4, bullet_count * 0.7) + (2 if has_numbers else 0), "Experience/project sections and achievement signals", "high"),
        _score_item("measurable_results", 7, min(7, len(numbers) * 1.2), "Visible numeric evidence only", "high" if not has_numbers else "medium"),
        _score_item("titles_dates_credibility", 5, (2.5 if dates else 1) + (1.5 if has_work_evidence else 0.5) + (1 if contact["email_found"] else 0), "Dates, roles, and contact extractability", "medium"),
        _score_item("professional_summary", 6, 5 if sections.get("summary") else 1.5, "Professional summary presence", "medium"),
        _score_item("ats_keywords", 7, (2 if sections.get("skills") else 0.5) + min(2, section_count * 0.25) + (2 if contact["email_found"] else 0.5) + min(1, keyword_overlap * 2), "Standard sections, contacts, and JD keyword overlap", "medium"),
        _score_item("ten_second_readability", 5, (2 if parsed["word_count"] <= 900 else 1) + (1.5 if section_count >= 4 else 0.5) + (1.5 if bullet_count >= 3 else 0.5), "Skimmability from section and bullet structure", "medium"),
        _score_item("unsupported_claims", 4, max(0.5, 4 - len(buzzwords) * 0.8), "Conservative penalty for unsupported inflated wording", "medium" if buzzwords else "low"),
        _score_item("project_evidence", 3, (1.5 if has_project_section else 0.5) + (1.5 if links else 0), "Project section and proof links", "critical" if has_project_section and not links else "medium"),
        _score_item("general_professionalism", 3, (1 if contact["email_found"] else 0.3) + (0.8 if contact["phone_found"] else 0.3) + (1.2 if parsed["word_count"] <= 1200 else 0.6), "Basic professional details", "low"),
    ]

    internal_items = [
        _score_item("bullet_quality", 8, min(8, bullet_count * 0.9 + (2 if has_numbers else 0)), "Bullet count and measurable evidence", "high"),
        _score_item("language_grammar", 5, max(2, 5 - len(buzzwords) * 0.45), "No grammar AI is used in fallback; inflated wording is penalized", "medium"),
        _score_item("skill_depth", 5, 3.5 if sections.get("skills") and has_work_evidence else (2 if sections.get("skills") else 1), "Skills are not treated as proof without evidence", "high"),
        _score_item("section_structure", 5, min(5, section_count * 0.75), "Recognized section structure", "medium"),
        _score_item("visual_consistency", 5, 3.8 if parsed["line_count"] >= 8 and parsed["word_count"] <= 1200 else 2.5, "Text extraction gives limited formatting evidence", "medium"),
        _score_item("education_certifications", 4, (2.5 if sections.get("education") else 0.8) + (1.5 if sections.get("certifications") else 0), "Education and certification sections", "medium"),
        _score_item("recruiter_risks", 5, 5 - (1.5 if mode == "generic" else 0) - (1.5 if has_project_section and not links else 0) - (1 if not has_numbers else 0), "Likely first-screening objections", "high"),
        _score_item("small_details", 3, (1 if contact["email_found"] else 0.2) + (1 if links else 0.4) + (1 if dates else 0.4), "Small details visible in extracted text", "low"),
    ]

    if mode == "generic":
        issues.append(_issue(lang, "high", "Target role is not specified", "الوظيفة المستهدفة غير محددة", "The analysis is generic and cannot fully judge role fit.", "التحليل عام ولا يمكنه قياس التوافق مع وظيفة محددة بدقة.", "Add a target role for a sharper evaluation.", "أضف وظيفة مستهدفة للحصول على تقييم أدق."))
        caps.append({"cap": 84, "reason": "No target role or job description"})
    elif mode == "role_only":
        caps.append({"cap": 89, "reason": "Target role exists without job description"})

    if has_project_section and not links:
        issues.append(_issue(lang, "critical", "Projects have no proof links", "المشاريع بلا روابط إثبات", "Project claims are harder to verify without GitHub, portfolio, demo, or case-study links.", "يصعب التحقق من قوة المشاريع بدون GitHub أو Portfolio أو Demo أو Case Study.", "Add proof links and label what each link proves.", "أضف روابط إثبات ووضح ما يثبته كل رابط."))
        caps.append({"cap": 84, "reason": "Projects are core evidence but no proof link exists"})
    if not has_numbers:
        issues.append(_issue(lang, "high", "No measurable results", "لا توجد نتائج قابلة للقياس", "The CV describes content without showing measurable impact or scale.", "السيرة تعرض محتوى بدون أثر أو حجم عمل قابل للقياس.", "Add real numbers only where the CV can support them.", "أضف أرقامًا حقيقية فقط عندما يمكن إثباتها."))
        caps.append({"cap": 84, "reason": "No measurable impact metrics"})
    if not sections.get("education"):
        issues.append(_issue(lang, "high", "Education section is missing or unclear", "قسم التعليم مفقود أو غير واضح", "Education is important for students, fresh graduates, and entry-level applicants.", "التعليم مهم للطلاب والخريجين والمبتدئين.", "Add degree, institution, field, and graduation date/status.", "أضف الدرجة، المؤسسة، التخصص، وتاريخ أو حالة التخرج."))
    if buzzwords:
        issues.append(_issue(lang, "medium", "Inflated wording needs evidence", "توجد صياغة كبيرة تحتاج دليلًا", "Words like expert, advanced, or specialist reduce credibility when not backed by proof.", "كلمات مثل Expert أو Advanced أو Specialist تضعف المصداقية إذا لم تدعمها أدلة.", "Replace inflated labels with exact evidence from projects or work.", "استبدل الأوصاف الكبيرة بدليل محدد من المشاريع أو العمل."))

    if sections.get("skills"):
        strengths.append({"title": "Skills section detected" if lang == "en" else "قسم المهارات موجود", "evidence": "Skills / Technical Skills"})
    if bullets:
        strengths.append({"title": "Analyzable bullet points found" if lang == "en" else "توجد نقاط قابلة للتحليل", "evidence": bullets[0][:160]})
    if numbers:
        strengths.append({"title": "Numeric evidence exists" if lang == "en" else "توجد أرقام داخل السيرة", "evidence": ", ".join(numbers[:5])})
    if links:
        strengths.append({"title": "Proof link detected" if lang == "en" else "يوجد رابط إثبات", "evidence": links[0][:120]})

    main = round(sum(item["score"] for item in main_items), 1)
    internal = round(sum(item["score"] for item in internal_items), 1)
    main = min(60, main)
    internal = min(40, internal)
    base = round(main + internal, 1)
    cap_value = min([100, *[cap["cap"] for cap in caps]])
    final = min(100, max(0, round(min(base, cap_value), 1)))
    penalties = round(base - final, 1)

    if final >= 85 and has_numbers and links and mode != "generic":
        decision_key = "ready"
    elif final >= 75 and not any(i["severity"] == "critical" for i in issues):
        decision_key = "limited"
    elif final >= 50:
        decision_key = "major"
    else:
        decision_key = "rebuild"

    decisions = {
        "ar": {
            "ready": "جاهز للتقديم الآن",
            "limited": "قابل للتقديم بعد تعديلات محدودة",
            "major": "يحتاج إلى تعديلات جوهرية قبل التقديم",
            "rebuild": "يحتاج إلى إعادة بناء كاملة",
        },
        "en": {
            "ready": "Ready to apply now",
            "limited": "Submit after limited edits",
            "major": "Needs major revisions before applying",
            "rebuild": "Needs a full rebuild",
        },
    }

    return {
        "analysis_mode": mode,
        "scores": {"main_score": main, "internal_score": internal, "penalties": penalties, "final_score": final},
        "score_caps": caps,
        "criteria": {"main": main_items, "internal": internal_items},
        "classification": classify(final, lang),
        "decision": decisions[lang][decision_key],
        "issues": issues[:5],
        "strengths": strengths[:3],
        "ats": {
            "estimated_score": min(100, round((main_items[5]["score"] / 7) * 100)),
            "readable_text": True,
            "keyword_stuffing": len(buzzwords) >= 4,
            "standard_sections_found": [key for key, present in sections.items() if present],
            "jd_keyword_overlap": round(keyword_overlap, 2) if job_description else None,
        },
    }
