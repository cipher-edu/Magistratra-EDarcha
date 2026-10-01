import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { addOrgItem, loadOrg, removeOrgItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ faculties: await loadOrg() });
}

export async function POST(request: Request) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin tuzilmani to‘ldiradi." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    kind?: "faculty" | "department" | "specialty";
    name?: string;
    id?: string;
    parentId?: string;
  } | null;
  if (body?.kind !== "faculty" && body?.kind !== "department" && body?.kind !== "specialty") {
    return NextResponse.json({ error: "Noto‘g‘ri bo‘lim." }, { status: 400 });
  }
  if (body.action === "remove") {
    if (!body.id) return NextResponse.json({ error: "Yozuv topilmadi." }, { status: 400 });
    const result = await removeOrgItem({ kind: body.kind, id: body.id });
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    await writeAudit(request, { user: admin, action: "CATALOG", path: "/admin/tuzilma", target: body.id, ok: true, detail: `${body.kind} o‘chirildi` });
    return NextResponse.json({ ok: true });
  }
  const result = await addOrgItem({ kind: body.kind, name: body.name ?? "", parentId: body.parentId });
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  await writeAudit(request, { user: admin, action: "CATALOG", path: "/admin/tuzilma", target: result.id, ok: true, detail: body.name?.trim() ?? body.kind });
  return NextResponse.json({ ok: true });
}
