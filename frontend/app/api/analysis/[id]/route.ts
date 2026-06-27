import { NextResponse } from "next/server";
import { STORE } from "../../../../lib/server/store";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  STORE.delete(id);
  return NextResponse.json({ deleted: true });
}
