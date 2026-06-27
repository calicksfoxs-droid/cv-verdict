export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(code: string, status?: number) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function getBackendError(response: Response): Promise<ApiError> {
  const payload = await response.json().catch(() => null);
  const detail = typeof payload?.detail === "string" ? payload.detail : `HTTP_${response.status}`;
  return new ApiError(detail, response.status);
}

export function getNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) return new ApiError("BACKEND_UNAVAILABLE");
  if (error instanceof Error && error.message) return new ApiError(error.message);
  return new ApiError("ANALYSIS_FAILED");
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
  try {
    const response = await fetch(`/api/analysis/${id}/report`, { cache: "no-store" });
    if (!response.ok) throw await getBackendError(response);
    return response.json();
  } catch (error) {
    throw getNetworkError(error);
  }
}
