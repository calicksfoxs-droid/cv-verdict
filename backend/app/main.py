from __future__ import annotations

from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import AnalysisResponse, StatusResponse, ReportResponse, ReportLanguage, ReportType, ExperienceLevel, AnalysisStatus
from app.services.pdf_text import extract_pdf_text, PdfReadError
from app.services.parser import parse_cv_text
from app.services.evaluator import evaluate
from app.services.report import generate_report

app = FastAPI(title="CV Verdict API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORE: dict[str, dict] = {}
MAX_FILE_BYTES = 10 * 1024 * 1024


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/api/analysis", response_model=AnalysisResponse)
async def create_analysis(
    cv_file: UploadFile = File(...),
    language: ReportLanguage = Form(ReportLanguage.ar),
    report_type: ReportType = Form(ReportType.medium),
    experience_level: ExperienceLevel = Form(ExperienceLevel.not_specified),
    target_role: str | None = Form(None),
    job_description: str | None = Form(None),
) -> AnalysisResponse:
    if cv_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="INVALID_FILE_TYPE")

    raw = await cv_file.read()
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="FILE_TOO_LARGE")

    request_id = f"req_{uuid4().hex[:12]}"
    STORE[request_id] = {"status": AnalysisStatus.extracting_text, "progress": 20}

    try:
        extracted = extract_pdf_text(raw)
        parsed = parse_cv_text(extracted["text"])
        evaluation = evaluate(parsed, target_role, job_description, language.value)
        report = generate_report(evaluation, parsed, language.value, report_type.value)
    except PdfReadError as exc:
        STORE[request_id] = {"status": AnalysisStatus.failed, "progress": 100, "error": str(exc)}
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    STORE[request_id] = {
        "status": AnalysisStatus.completed,
        "progress": 100,
        "language": language,
        "report_type": report_type,
        "experience_level": experience_level,
        "target_role": target_role,
        "job_description_available": bool(job_description),
        "extracted": {k: v for k, v in extracted.items() if k != "text"},
        "parsed": parsed,
        "evaluation": evaluation,
        "report": report,
        "filename": cv_file.filename,
    }
    return AnalysisResponse(request_id=request_id, status=AnalysisStatus.completed)


@app.get("/api/analysis/{request_id}/status", response_model=StatusResponse)
def get_status(request_id: str) -> StatusResponse:
    item = STORE.get(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="REQUEST_NOT_FOUND")
    return StatusResponse(
        request_id=request_id,
        status=item.get("status", AnalysisStatus.failed),
        progress=item.get("progress", 0),
        error=item.get("error"),
    )


@app.get("/api/analysis/{request_id}/report", response_model=ReportResponse)
def get_report(request_id: str) -> ReportResponse:
    item = STORE.get(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="REQUEST_NOT_FOUND")
    if item.get("status") != AnalysisStatus.completed:
        raise HTTPException(status_code=409, detail="REPORT_NOT_READY")

    evaluation = item["evaluation"]
    report = item["report"]
    return ReportResponse(
        request_id=request_id,
        language=item["language"],
        report_type=item["report_type"],
        score=evaluation["scores"],
        classification=evaluation["classification"],
        decision=evaluation["decision"],
        executive_judgment=report["executive_judgment"],
        ten_second_test=report["ten_second_test"],
        strengths=report["strengths"],
        issues=report["issues"],
        repair_plan=report["repair_plan"],
        ats=evaluation["ats"],
        metadata={
            "filename": item.get("filename"),
            "target_role": item.get("target_role"),
            "job_description_available": item.get("job_description_available"),
            "extraction": item.get("extracted"),
            "note": "MVP deterministic evaluator; replace with AI Evaluation Engine in next phase.",
        },
    )


@app.delete("/api/analysis/{request_id}")
def delete_analysis(request_id: str) -> dict:
    if request_id in STORE:
        del STORE[request_id]
    return {"deleted": True}
