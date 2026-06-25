# 05 — Backend & API Architecture v1.0

## Backend stack
Recommended: FastAPI.

## Core services
- File Service.
- PDF Text Extraction Service.
- Visual Preview Service.
- CV Parser Service.
- Job Description Parser.
- Evaluation Service.
- Report Service.
- Validation Service.
- Cost Control Service.
- Temporary Storage Service.
- Error Handling Service.

## API endpoints
### Create analysis
```http
POST /api/analysis
```
Input:
- PDF file.
- target_role optional.
- job_description optional.
- language: ar/en.
- report_type: short/medium/full.
- experience_level.

Output:
```json
{
  "request_id": "req_123",
  "status": "uploaded"
}
```

### Get status
```http
GET /api/analysis/{request_id}/status
```

### Get report
```http
GET /api/analysis/{request_id}/report
```

### Delete analysis
```http
DELETE /api/analysis/{request_id}
```

## Status flow
```text
uploaded
validating_file
extracting_text
rendering_preview
parsing_cv
parsing_job_description
evaluating
validating_scores
generating_report
completed
failed
```

## MVP file limits
- PDF only.
- Max 3 pages initially.
- Max size: 5–10MB.
- No OCR in MVP.
- Password-protected PDFs rejected.

## Error examples
- INVALID_FILE_TYPE.
- FILE_TOO_LARGE.
- PASSWORD_PROTECTED_PDF.
- CORRUPTED_PDF.
- NO_EXTRACTABLE_TEXT.
- LOW_EXTRACTION_CONFIDENCE.
- INVALID_MODEL_RESPONSE.
- INVALID_SCORE_TOTAL.

