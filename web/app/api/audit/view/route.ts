import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await currentUser();
  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/api")) return NextResponse.json({ ok: true });
  await writeAudit(request, { user, action: "PAGE_VIEW", path, ok: true });
  return NextResponse.json({ ok: true });
}
