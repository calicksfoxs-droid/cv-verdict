import { NextResponse } from "next/server";
import { AnalysisError, createAnalysis } from "../../../lib/server/analysis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    return NextResponse.json(await createAnalysis(formData));
  } catch (error) {
    const status = error instanceof AnalysisError ? error.status : 500;
    const detail = error instanceof Error ? error.message : "ANALYSIS_FAILED";
    return NextResponse.json({ detail }, { status });
  }
}
