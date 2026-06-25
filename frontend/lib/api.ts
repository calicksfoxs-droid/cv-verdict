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
  metadata: Record<string, unknown>;
};

export async function fetchReport(id: string): Promise<Report> {
  const response = await fetch(`${API_URL}/api/analysis/${id}/report`, { cache: "no-store" });
  if (!response.ok) throw new Error("REPORT_NOT_READY");
  return response.json();
}
