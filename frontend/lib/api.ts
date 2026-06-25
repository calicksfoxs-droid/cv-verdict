export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const response = await fetch(`${API_URL}/api/analysis/${id}/report`, { cache: "no-store" });
  if (!response.ok) throw new Error("REPORT_NOT_READY");
  return response.json();
}
