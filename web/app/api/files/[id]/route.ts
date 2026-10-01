import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { getStoredFile } from "@/lib/db";
import { uploadPath } from "@/lib/uploads";

function downloadName(label: string, original: string) {
  const ext = path.extname(original);
  const base = label.replace(/[\\/:*?"<>|]/g, " ").trim() || "fayl";
  return ext && !base.toLowerCase().endsWith(ext.toLowerCase()) ? `${base}${ext}` : base;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Kirish kerak." }, { status: 401 });
  const { id } = await context.params;
  const file = await getStoredFile(id);
  if (!file) return NextResponse.json({ error: "Fayl topilmadi." }, { status: 404 });
  if (user.role !== "ADMIN" && (user.account_status !== "ACTIVE" || file.owner_id !== user.id)) {
    return NextResponse.json({ error: "Bu faylni ochish mumkin emas." }, { status: 403 });
  }
  const full = uploadPath(file.stored_name);
  if (!fs.existsSync(full)) return NextResponse.json({ error: "Fayl topilmadi." }, { status: 404 });
  const bytes = await fs.promises.readFile(full);
  const name = downloadName(file.label, file.original_name);
  await writeAudit(request, { user, action: "FILE_DOWNLOAD", path: `/api/files/${id}`, target: id, ok: true, detail: file.label });
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
}
