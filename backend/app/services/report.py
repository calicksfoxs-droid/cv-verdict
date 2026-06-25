from __future__ import annotations

from typing import Any


def generate_report(evaluation: dict[str, Any], parsed: dict[str, Any], lang: str, report_type: str) -> dict[str, Any]:
    final_score = evaluation["scores"]["final_score"]
    if lang == "ar":
        executive = (
            f"السيرة حصلت على {final_score}/100. التقييم الحالي يعتمد على ما يظهر داخل الملف فقط. "
            "أقوى إشارة هي وجود محتوى قابل للتحليل، وأكبر خطر هو أي ادعاء غير مدعوم بروابط أو نتائج واضحة."
        )
        repair = [
            "حدد الوظيفة المستهدفة إن أردت تقييمًا أدق.",
            "أضف روابط تثبت المشاريع أو نماذج العمل.",
            "حوّل نقاط الخبرة من مهام إلى نتائج قابلة للقياس.",
        ]
        ten_second = {
            "candidate_identity": "مرشح بسيرة قابلة للتحليل",
            "target_specialization": "غير محدد" if not parsed else "حسب محتوى السيرة",
            "initial_decision": "مراجعة إضافية",
        }
    else:
        executive = (
            f"The CV scored {final_score}/100. The current evaluation is based only on what is visible in the document. "
            "The strongest signal is analyzable content; the biggest risk is unsupported claims or missing project evidence."
        )
        repair = [
            "Add a target role for a sharper evaluation.",
            "Add portfolio, GitHub, demo, or work-sample links.",
            "Rewrite task bullets into measurable outcomes.",
        ]
        ten_second = {
            "candidate_identity": "Candidate with analyzable CV content",
            "target_specialization": "Not specified" if not parsed else "Based on CV content",
            "initial_decision": "Additional review",
        }

    if report_type == "short":
        issues = evaluation["issues"][:3]
    else:
        issues = evaluation["issues"][:5]

    return {
        "executive_judgment": executive,
        "ten_second_test": ten_second,
        "strengths": evaluation["strengths"],
        "issues": issues,
        "repair_plan": repair,
    }
