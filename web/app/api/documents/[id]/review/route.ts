import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { ReviewError, reviewDocument } from "@/lib/db";
import type { ReviewAction } from "@/lib/labels";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin qaror beradi." }, { status: 403 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { action?: ReviewAction; comment?: string; governanceRef?: string } | null;
  const comment = body?.comment ?? "";
  const action = body?.action;
  const governanceRef = body?.governanceRef;
  if (comment.trim().length < 3) {
    return NextResponse.json(
      { error: "Qaror faqat komment bilan saqlanadi." },
      { status: 400 },
    );
  }
  if (action !== "APPROVE" && action !== "REJECT" && action !== "REVISION") {
    return NextResponse.json({ error: "Noto‘g‘ri qaror." }, { status: 400 });
  }
  try {
    await reviewDocument({ documentId: id, adminId: user.id, action, comment, governanceRef });
  } catch (error) {
    const message = error instanceof ReviewError ? error.message : "Saqlanmadi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  await writeAudit(request, { user, action: "DOCUMENT_REVIEW", path: `/admin/hujjat/${id}`, target: id, ok: true, detail: action });
  return NextResponse.json({ ok: true });
}
