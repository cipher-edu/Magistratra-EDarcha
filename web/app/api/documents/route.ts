import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { createAriza } from "@/lib/db";
import { readArizaForm, removeUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.role !== "MAGISTR" || user.account_status !== "ACTIVE") {
    return NextResponse.json({ error: "Hisob tasdiqlanmaguncha ariza yuborilmaydi." }, { status: 403 });
  }
  const parsed = await readArizaForm(request);
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  try {
    const result = await createAriza({
      ownerId: user.id,
      type: parsed.type,
      title: parsed.title,
      note: parsed.note,
      files: parsed.files,
    });
    if ("error" in result) {
      parsed.files.forEach((file) => removeUpload(file.storedName));
      return NextResponse.json(result, { status: 400 });
    }
    await writeAudit(request, { user, action: "DOCUMENT_CREATE", path: "/magistr/hujjat/yangi", target: result.id, ok: true, detail: parsed.title });
    return NextResponse.json({ id: result.id });
  } catch (error) {
    parsed.files.forEach((file) => removeUpload(file.storedName));
    const message = error instanceof Error ? error.message : "Saqlanmadi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
