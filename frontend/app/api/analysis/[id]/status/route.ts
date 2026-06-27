import { NextResponse } from "next/server";
import { STORE } from "../../../../../lib/server/store";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = STORE.get(id);
  if (!item) return NextResponse.json({ detail: "REQUEST_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ request_id: id, status: item.status, progress: item.progress, error: item.error ?? null });
}
