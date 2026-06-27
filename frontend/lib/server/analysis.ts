import { randomUUID } from "crypto";
import { evaluate } from "./evaluator";
import { extractPdfText, PdfReadError } from "./pdf";
import { parseCvText } from "./parser";
import { generateReport } from "./report";
import { STORE } from "./store";
import { ExperienceLevel, ReportLanguage, ReportType } from "./types";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_JOB_DESCRIPTION_CHARS = 12000;

export class AnalysisError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AnalysisError";
    this.status = status;
  }
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function enumValue<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}

export async function createAnalysis(formData: FormData) {
  const file = formData.get("cv_file");
  if (!(file instanceof File) || !isPdf(file)) throw new AnalysisError("INVALID_FILE_TYPE");
  if (file.size > MAX_FILE_BYTES) throw new AnalysisError("FILE_TOO_LARGE");

  const language = enumValue<ReportLanguage>(fieldValue(formData, "language"), ["ar", "en"], "ar");
  const reportType = enumValue<ReportType>(fieldValue(formData, "report_type"), ["short", "medium"], "medium");
  const experienceLevel = enumValue<ExperienceLevel>(fieldValue(formData, "experience_level"), ["student", "fresh_graduate", "entry_level", "mid_level", "senior", "not_specified"], "not_specified");
  const targetRole = fieldValue(formData, "target_role") || null;
  const jobDescription = fieldValue(formData, "job_description") || null;

  if (jobDescription && jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
    throw new AnalysisError("JOB_DESCRIPTION_TOO_LONG");
  }

  const requestId = `req_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  STORE.set(requestId, { status: "extracting_text", progress: 25 });

  try {
    const raw = Buffer.from(await file.arrayBuffer());
    const extracted = await extractPdfText(raw);
    STORE.set(requestId, { status: "parsing_cv", progress: 50 });
    const parsed = parseCvText(extracted.text);
    STORE.set(requestId, { status: "evaluating", progress: 72 });
    const evaluation = evaluate(parsed, targetRole, jobDescription, language);
    STORE.set(requestId, { status: "generating_report", progress: 90 });
    const report = generateReport(evaluation, parsed, language, reportType);

    const { text: _text, ...safeExtraction } = extracted;
    void _text;
    STORE.set(requestId, {
      status: "completed",
      progress: 100,
      language,
      report_type: reportType,
      experience_level: experienceLevel,
      target_role: targetRole,
      job_description_available: Boolean(jobDescription),
      extracted: safeExtraction,
      parsed,
      evaluation,
      report,
      filename: file.name,
    });
  } catch (error) {
    const detail = error instanceof PdfReadError ? error.message : error instanceof AnalysisError ? error.message : "ANALYSIS_FAILED";
    STORE.set(requestId, { status: "failed", progress: 100, error: detail });
    throw new AnalysisError(detail);
  }

  return { request_id: requestId, status: "completed" };
}

export function getReportPayload(requestId: string) {
  const item = STORE.get(requestId);
  if (!item) throw new AnalysisError("REQUEST_NOT_FOUND", 404);
  if (item.status !== "completed" || !item.evaluation || !item.report) throw new AnalysisError("REPORT_NOT_READY", 409);

  return {
    request_id: requestId,
    language: item.language,
    report_type: item.report_type,
    score: item.evaluation.scores,
    classification: item.evaluation.classification,
    decision: item.evaluation.decision,
    executive_judgment: item.report.executive_judgment,
    ten_second_test: item.report.ten_second_test,
    strengths: item.report.strengths,
    issues: item.report.issues,
    repair_plan: item.report.repair_plan,
    ats: item.evaluation.ats,
    metadata: {
      filename: item.filename,
      target_role: item.target_role,
      job_description_available: item.job_description_available,
      analysis_mode: item.evaluation.analysis_mode,
      score_caps: item.evaluation.score_caps,
      criteria: item.evaluation.criteria,
      extraction: item.extracted,
      privacy: "Files are temporary. CVs are not used for training.",
      note: "MVP deterministic evaluator running inside Next.js; AI engine can be added later.",
    },
  };
}
