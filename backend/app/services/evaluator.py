from __future__ import annotations

from typing import Any


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


def evaluate(parsed: dict[str, Any], target_role: str | None, job_description: str | None, lang: str) -> dict[str, Any]:
    sections = parsed["sections"]
    contact = parsed["contact_information"]
    bullets = parsed["bullet_points"]
    numbers = parsed["numbers"]
    links = contact["links"]

    main = 0.0
    internal = 0.0
    issues: list[dict[str, Any]] = []
    strengths: list[dict[str, Any]] = []

    # Main criteria placeholder rubric, intentionally conservative.
    main += 6 if target_role else 4
    main += 5 if len(bullets) >= 4 else 3
    main += min(5, 1 + len(numbers) * 0.6)
    main += 3 if sections.get("experience") or sections.get("projects") else 1
    main += 4 if sections.get("summary") else 1
    main += 5 if sections.get("skills") else 2
    main += 4 if parsed["word_count"] < 900 else 3
    main += 2.5 if links else 1.5
    main += 1.5 if contact["email_found"] else 0.5

    internal += 5 if len(bullets) >= 5 else 3
    internal += 4
    internal += 3.5 if sections.get("skills") else 2
    internal += 3.5 if sections.get("education") else 1.5
    internal += 4
    internal += 2.5 if sections.get("education") else 1
    internal += 3 if links else 2
    internal += 2

    if not target_role:
        issues.append({
            "severity": "high",
            "title": "Target role is not specified" if lang == "en" else "الوظيفة المستهدفة غير محددة",
            "why": "The analysis is generic and cannot fully judge role fit." if lang == "en" else "التحليل سيكون عامًا ولا يمكنه قياس التوافق الوظيفي بدقة.",
            "action": "Add a target role for a sharper evaluation." if lang == "en" else "أضف وظيفة مستهدفة للحصول على تقييم أدق.",
        })
    if not links:
        issues.append({
            "severity": "critical",
            "title": "No portfolio or project evidence" if lang == "en" else "لا توجد روابط أو أدلة للمشاريع",
            "why": "Claims are harder to verify during first screening." if lang == "en" else "يصعب على مسؤول التوظيف التحقق من أقوى ما في السيرة.",
            "action": "Add a portfolio, GitHub, demo, or case study link." if lang == "en" else "أضف Portfolio أو GitHub أو Demo أو Case Study.",
        })
    if not sections.get("education"):
        issues.append({
            "severity": "high",
            "title": "Education section is missing or unclear" if lang == "en" else "قسم التعليم مفقود أو غير واضح",
            "why": "Education is important for students and early candidates." if lang == "en" else "التعليم مهم جدًا للطلاب والمبتدئين.",
            "action": "Add degree, institution, field, and expected graduation." if lang == "en" else "أضف الدرجة، الجامعة، التخصص، والتخرج المتوقع.",
        })

    if sections.get("skills"):
        strengths.append({"title": "Skills section detected" if lang == "en" else "قسم المهارات موجود", "evidence": "Technical skills / Skills"})
    if bullets:
        strengths.append({"title": "Bullet points found" if lang == "en" else "توجد نقاط خبرة قابلة للتحليل", "evidence": bullets[0][:160]})
    if numbers:
        strengths.append({"title": "Numeric evidence exists" if lang == "en" else "توجد أرقام داخل السيرة", "evidence": ", ".join(numbers[:5])})

    main = min(60, round(main, 1))
    internal = min(40, round(internal, 1))
    final = min(100, max(0, round(main + internal, 1)))

    if not target_role:
        final = min(final, 84)
    if not links:
        final = min(final, 84)

    decision_ar = "يحتاج إلى تعديلات جوهرية قبل التقديم" if final < 75 or any(i["severity"] == "critical" for i in issues) else "قابل للتقديم بعد تعديلات محدودة"
    decision_en = "Needs major revisions before applying" if final < 75 or any(i["severity"] == "critical" for i in issues) else "Submit after limited edits"

    return {
        "scores": {"main_score": main, "internal_score": internal, "penalties": 0, "final_score": final},
        "classification": classify(final, lang),
        "decision": decision_ar if lang == "ar" else decision_en,
        "issues": issues[:5],
        "strengths": strengths[:3],
        "ats": {
            "estimated_score": 76 if contact["email_found"] and sections.get("skills") else 58,
            "readable_text": True,
            "keyword_stuffing": False,
        },
    }
