from __future__ import annotations

from typing import Any


def generate_report(evaluation: dict[str, Any], parsed: dict[str, Any], lang: str, report_type: str) -> dict[str, Any]:
    final_score = evaluation["scores"]["final_score"]
    mode = evaluation["analysis_mode"]
    issues = evaluation["issues"][:3 if report_type == "short" else 5]
    strengths = evaluation["strengths"][:3]

    if lang == "ar":
        mode_label = {"generic": "عام", "role_only": "حسب الوظيفة فقط", "targeted": "موجه للوصف الوظيفي"}[mode]
        executive = (
            f"السيرة حصلت على {final_score}/100 في وضع تحليل {mode_label}. "
            "الحكم مبني على النص القابل للاستخراج فقط، ولا يفترض خبرات أو نتائج غير مذكورة. "
            "الأولوية الآن هي تقوية الدليل: أرقام حقيقية، روابط إثبات، ووضوح الوظيفة المستهدفة."
        )
        repair = [
            "حدد الوظيفة المستهدفة أو أضف Job Description إذا كان التقييم عامًا.",
            "أضف روابط Portfolio أو GitHub أو Demo للمشاريع المهمة.",
            "حوّل نقاط المهام إلى نتائج قابلة للقياس بدون اختراع أرقام.",
            "وضح التواريخ، نوع الدور، والجهة لكل تجربة أو مشروع.",
            "احذف أو ادعم أي وصف كبير مثل Expert أو Specialist بدليل واضح.",
        ]
        ten_second = {
            "candidate_identity": "يمكن استخراج هوية مهنية مبدئية من النص" if parsed["word_count"] else "غير واضحة",
            "target_specialization": "غير محدد" if mode == "generic" else "محدد من المدخلات",
            "strongest_signal": strengths[0]["title"] if strengths else "لا توجد إشارة قوية كافية",
            "main_gap": issues[0]["title"] if issues else "لا توجد مشكلة حرجة ظاهرة",
            "initial_decision": evaluation["decision"],
        }
        fallback_strength = {"title": "النص قابل للتحليل", "evidence": "تم استخراج نص كافٍ من ملف PDF."}
    else:
        mode_label = {"generic": "generic", "role_only": "role-only", "targeted": "targeted"}[mode]
        executive = (
            f"The CV scored {final_score}/100 in {mode_label} analysis mode. "
            "The verdict uses only extractable document evidence and does not assume missing experience or results. "
            "The priority is stronger proof: real metrics, proof links, and clearer role targeting."
        )
        repair = [
            "Add a target role or job description if the analysis is generic.",
            "Add portfolio, GitHub, demo, or case-study links for important projects.",
            "Rewrite task bullets into measurable outcomes without inventing numbers.",
            "Clarify dates, role type, and organization for each experience or project.",
            "Remove or prove inflated labels such as Expert or Specialist.",
        ]
        ten_second = {
            "candidate_identity": "A professional identity is partially extractable from the text" if parsed["word_count"] else "Unclear",
            "target_specialization": "Not specified" if mode == "generic" else "Specified from inputs",
            "strongest_signal": strengths[0]["title"] if strengths else "No strong signal detected",
            "main_gap": issues[0]["title"] if issues else "No critical gap detected",
            "initial_decision": evaluation["decision"],
        }
        fallback_strength = {"title": "Readable text", "evidence": "Enough text was extracted from the PDF."}

    if not strengths:
        strengths = [fallback_strength]

    return {
        "executive_judgment": executive,
        "ten_second_test": ten_second,
        "strengths": strengths,
        "issues": issues,
        "repair_plan": repair[:3 if report_type == "short" else 5],
    }
