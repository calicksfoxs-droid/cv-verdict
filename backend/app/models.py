from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ReportLanguage(str, Enum):
    ar = "ar"
    en = "en"


class ReportType(str, Enum):
    short = "short"
    medium = "medium"


class ExperienceLevel(str, Enum):
    student = "student"
    fresh_graduate = "fresh_graduate"
    entry_level = "entry_level"
    mid_level = "mid_level"
    senior = "senior"
    not_specified = "not_specified"


class AnalysisStatus(str, Enum):
    uploaded = "uploaded"
    validating_file = "validating_file"
    extracting_text = "extracting_text"
    parsing_cv = "parsing_cv"
    evaluating = "evaluating"
    generating_report = "generating_report"
    completed = "completed"
    failed = "failed"


class AnalysisResponse(BaseModel):
    request_id: str
    status: AnalysisStatus


class StatusResponse(BaseModel):
    request_id: str
    status: AnalysisStatus
    progress: int = Field(ge=0, le=100)
    error: str | None = None


class ScoreBreakdown(BaseModel):
    main_score: float
    internal_score: float
    penalties: float
    final_score: float


class ReportResponse(BaseModel):
    request_id: str
    language: ReportLanguage
    report_type: ReportType
    score: ScoreBreakdown
    classification: str
    decision: str
    executive_judgment: str
    ten_second_test: dict[str, Any]
    strengths: list[dict[str, Any]]
    issues: list[dict[str, Any]]
    repair_plan: list[str]
    ats: dict[str, Any]
    metadata: dict[str, Any]
