# 02 — Input / Output Data Schema v1.0

## Principle
The system should not treat AI output as free-form prose. It should pass structured JSON between layers.

## Core flow
```text
Analysis Request
↓
Parsed CV
↓
Evaluation Input
↓
Evaluation Result
↓
User Report
```

## Analysis Request
```json
{
  "schema_version": "1.0",
  "request_id": "req_123456",
  "interface_language": "ar",
  "cv_file": {
    "file_id": "file_123",
    "original_filename": "Candidate_CV.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 245000,
    "page_count": 2
  },
  "targeting": {
    "target_role": "AI Automation Intern",
    "job_description": null,
    "target_country": "Qatar",
    "opportunity_type": "internship",
    "experience_level": "student"
  },
  "options": {
    "strict_evaluation": true,
    "include_ats_analysis": true,
    "include_rewriting": false,
    "report_language": "ar",
    "report_tier": "free_medium"
  }
}
```

## Parsed CV
```json
{
  "schema_version": "1.0",
  "request_id": "req_123456",
  "document": {
    "page_count": 2,
    "detected_language": "en",
    "is_text_extractable": true,
    "is_scanned_document": false,
    "has_complex_layout": false
  },
  "contact_information": {},
  "professional_summary": {},
  "experience": [],
  "projects": [],
  "education": [],
  "skills": {},
  "certifications": [],
  "languages": [],
  "additional_sections": [],
  "source_references": [],
  "parsing_quality": {}
}
```

## Important statuses
Use statuses, not guesses:
```json
["found", "missing", "ambiguous", "unreadable"]
```

Example:
```json
{
  "phone": {
    "value": null,
    "status": "missing",
    "source_ref_ids": []
  }
}
```

## Experience type
```json
[
  "employment",
  "internship",
  "freelance",
  "independent_project",
  "volunteer",
  "academic_project",
  "unknown"
]
```

This prevents a personal project from being presented as formal employment.

## Evaluation Result
```json
{
  "schema_version": "1.0",
  "rubric_version": "1.0",
  "request_id": "req_123456",
  "evaluation_status": "completed",
  "analysis_mode": "targeted",
  "scores": {
    "main_criteria": [],
    "internal_criteria": [],
    "main_score": 42,
    "internal_score": 28,
    "base_score": 70,
    "score_caps": [],
    "additional_penalties": [],
    "final_score": 70
  },
  "classification": {
    "score_label": "متوسطة",
    "application_decision": "يحتاج إلى تعديلات جوهرية قبل التقديم",
    "decision_reasons": []
  },
  "strengths": [],
  "issues": {
    "critical": [],
    "high": [],
    "medium": [],
    "low": []
  },
  "ats_analysis": {},
  "credibility_review": {},
  "bullet_reviews": {},
  "score_forecast": {},
  "quality_checks": {}
}
```

## Validation rules
The backend must reject invalid results:
- Main criteria max total must equal 60.
- Internal criteria max total must equal 40.
- Final score must be 0–100.
- No duplicate penalties.
- No judgment without evidence or missing-information basis.
- No invented names, numbers, tools, links, or roles.

