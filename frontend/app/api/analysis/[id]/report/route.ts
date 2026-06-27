import { NextResponse } from "next/server";
import { AnalysisError, getReportPayload } from "../../../../../lib/server/analysis";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    return NextResponse.json(getReportPayload(id));
  } catch (error) {
    const status = error instanceof AnalysisError ? error.status : 500;
    const detail = error instanceof Error ? error.message : "REPORT_NOT_READY";
    return NextResponse.json({ detail }, { status });
  }
}
