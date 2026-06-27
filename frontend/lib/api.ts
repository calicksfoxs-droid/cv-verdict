export class ApiError extends Error {
  code: string;
  status?: number;
  url?: string;
  body?: string;

  constructor(code: string, details: { status?: number; url?: string; body?: string } = {}) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = details.status;
    this.url = details.url;
    this.body = details.body;
  }
}

export async function getBackendError(response: Response): Promise<ApiError> {
  const body = await response.text().catch(() => "");
  const payload = body ? tryParseJson(body) : null;
  const detail = typeof payload?.detail === "string" ? payload.detail : `HTTP_${response.status}`;
  return new ApiError(detail, { status: response.status, url: response.url, body });
}

export function getNetworkError(error: unknown, url?: string): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) return new ApiError("BACKEND_UNAVAILABLE", { url, body: error.message });
  if (error instanceof Error && error.message) return new ApiError(error.message, { url, body: error.message });
  return new ApiError("ANALYSIS_FAILED", { url });
}

function tryParseJson(body: string): { detail?: unknown } | null {
  try {
    return JSON.parse(body) as { detail?: unknown };
  } catch {
    return null;
  }
}

export type Report = {
  request_id: string;
  language: "ar" | "en";
  report_type: "short" | "medium";
  score: {
    main_score: number;
    internal_score: number;
    penalties: number;
    final_score: number;
  };
  classification: string;
  decision: string;
  executive_judgment: string;
  ten_second_test: Record<string, unknown>;
  strengths: Array<Record<string, unknown>>;
  issues: Array<Record<string, unknown>>;
  repair_plan: string[];
  ats: Record<string, unknown>;
  metadata: {
    filename?: string;
    target_role?: string | null;
    job_description_available?: boolean;
    analysis_mode?: "generic" | "role_only" | "targeted";
    score_caps?: Array<Record<string, unknown>>;
    criteria?: {
      main?: Array<Record<string, unknown>>;
      internal?: Array<Record<string, unknown>>;
    };
    extraction?: Record<string, unknown>;
    privacy?: string;
    note?: string;
  };
};

export async function fetchReport(id: string): Promise<Report> {
  const url = `/api/analysis/${id}/report`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw await getBackendError(response);
    return response.json();
  } catch (error) {
    throw getNetworkError(error, url);
  }
}
