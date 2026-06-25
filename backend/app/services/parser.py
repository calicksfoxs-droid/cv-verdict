from __future__ import annotations

import re
from typing import Any

SECTION_ALIASES = {
    "contact": ["contact", "contact information"],
    "summary": ["summary", "professional summary", "profile"],
    "experience": ["experience", "work experience", "project experience"],
    "projects": ["projects", "project"],
    "education": ["education"],
    "skills": ["skills", "technical skills"],
    "certifications": ["certifications", "certificates"],
    "languages": ["languages"],
}


def parse_cv_text(text: str) -> dict[str, Any]:
    lower = text.lower()
    email = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    phone = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
    links = re.findall(r"https?://\S+|(?:linkedin\.com/\S+)|(?:github\.com/\S+)", text, flags=re.I)

    detected_sections: dict[str, bool] = {}
    for key, aliases in SECTION_ALIASES.items():
        detected_sections[key] = any(alias in lower for alias in aliases)

    bullet_lines = [line.strip(" -•\t") for line in text.splitlines() if line.strip().startswith(("-", "•"))]
    numbers = re.findall(r"\b\d+(?:[,.]\d+)?%?\b", text)

    return {
        "raw_text": text,
        "contact_information": {
            "email_found": bool(email),
            "phone_found": bool(phone),
            "links": links,
        },
        "sections": detected_sections,
        "bullet_points": bullet_lines,
        "numbers": numbers,
        "word_count": len(text.split()),
        "source_references": [],
        "parsing_quality": {
            "overall_confidence": 0.78,
            "warnings": ["MVP parser: structured extraction will be expanded in the AI parser phase."],
        },
    }
