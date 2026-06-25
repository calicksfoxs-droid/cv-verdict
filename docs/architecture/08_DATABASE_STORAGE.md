# 08 — Database & Temporary Storage v1.0

## Storage model
No accounts in MVP. Use temporary request-based storage.

## Tables
### analysis_requests
- request_id.
- created_at.
- status.
- language.
- target_role.
- has_job_description.
- experience_level.
- report_type.
- final_score.
- decision.
- expires_at.

### uploaded_files
- file_id.
- request_id.
- original_filename.
- file_size.
- page_count.
- file_type.
- storage_path.
- uploaded_at.
- delete_at.

### extracted_texts
- request_id.
- extracted_text.
- extraction_confidence.
- is_scanned.
- warnings.
- created_at.
- delete_at.

### parsed_cvs
- request_id.
- parsed_cv_json.
- parsing_quality.
- created_at.
- delete_at.

### evaluation_results
- request_id.
- evaluation_json.
- main_score.
- internal_score.
- final_score.
- classification.
- decision.
- confidence.
- created_at.
- delete_at.

### reports
- report_id.
- request_id.
- report_type.
- language.
- report_json.
- created_at.
- delete_at.

## Deletion
- Original CV: 24 hours.
- Extracted text: 24–48 hours.
- Evaluation/report: 7 days.
- Manual delete: immediate.

## Cache key
Same file + same role + same job description + same language + same report type = use cached result.

