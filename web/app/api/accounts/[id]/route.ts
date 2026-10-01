import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { decideAccount } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin so‘rovni ko‘rib chiqadi." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { action?: string; note?: string } | null;
  if (body?.action !== "APPROVE" && body?.action !== "REJECT") {
    return NextResponse.json({ error: "Noto‘g‘ri qaror." }, { status: 400 });
  }
  const { id } = await context.params;
  const result = await decideAccount({ id, action: body.action, note: body.note ?? "" });
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  await writeAudit(request, {
    user: admin,
    action: body.action === "APPROVE" ? "ACCOUNT_APPROVE" : "ACCOUNT_REJECT",
    path: "/admin/sorovlar",
    target: id,
    ok: true,
    detail: (body.note ?? "").trim().slice(0, 180),
  });
  return NextResponse.json({ ok: true });
}
