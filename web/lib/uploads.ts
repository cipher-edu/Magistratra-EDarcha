import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { NewFile } from "./db";
import { SUBMIT_TYPES, type DocType } from "./labels";

const BLOCKED = new Set(["exe", "bat", "cmd", "com", "msi", "dll", "scr", "ps1", "js", "vbs", "jar", "sh", "html", "htm"]);
const MAX_BYTES = 20 * 1024 * 1024;

function rootDir() {
  return path.resolve(process.cwd(), "data", "uploads");
}

export function uploadPath(storedName: string) {
  return path.join(rootDir(), path.basename(storedName));
}

export function removeUpload(storedName: string) {
  fs.rmSync(uploadPath(storedName), { force: true });
}

export async function storeUpload(file: File): Promise<Omit<NewFile, "label">> {
  if (file.size <= 0) throw new Error("Bo‘sh fayl biriktirilmaydi.");
  if (file.size > MAX_BYTES) throw new Error("Har bir fayl 20 MB dan oshmasin.");
  const originalName = path.basename(file.name || "fayl").slice(0, 180);
  const ext = path.extname(originalName).toLowerCase();
  const bare = ext.replace(".", "");
  if (!/^\.[a-z0-9]{1,8}$/.test(ext) || BLOCKED.has(bare)) {
    throw new Error("Bu turdagi fayl qabul qilinmaydi.");
  }
  const storedName = `${crypto.randomUUID()}${ext}`;
  await fs.promises.mkdir(rootDir(), { recursive: true });
  await fs.promises.writeFile(uploadPath(storedName), Buffer.from(await file.arrayBuffer()));
  return {
    storedName,
    originalName,
    mime: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function readArizaForm(request: Request): Promise<{ error: string } | { type: DocType; title: string; note: string; files: NewFile[] }> {
  const form = await request.formData().catch(() => null);
  if (!form) return { error: "Ariza o‘qilmadi." };
  const type = String(form.get("type") ?? "");
  const title = String(form.get("title") ?? "");
  const note = String(form.get("note") ?? "");
  if (!(SUBMIT_TYPES as readonly string[]).includes(type)) return { error: "Hujjat turini tanlang." };
  if (title.trim().length < 3) return { error: "Ariza nomi kamida 3 ta belgidan iborat bo‘lsin." };
  if (note.trim().length > 4000) return { error: "Izoh juda uzun." };
  const labels = form.getAll("labels").map((item) => String(item));
  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (labels.length !== files.length) return { error: "Har bir faylga nom yozing va faylni tanlang." };
  if (files.length < 1) return { error: "Kamida bitta fayl biriktiring." };
  if (files.length > 30) return { error: "Bir yuborishda 30 tadan oshiq fayl biriktirilmaydi." };
  const saved: NewFile[] = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const label = labels[index]?.trim() ?? "";
      if (label.length < 2) throw new Error("Har bir faylga nom yozing.");
      const stored = await storeUpload(files[index]);
      saved.push({ ...stored, label });
    }
  } catch (error) {
    saved.forEach((file) => removeUpload(file.storedName));
    return { error: error instanceof Error ? error.message : "Fayl saqlanmadi." };
  }
  return { type: type as DocType, title, note, files: saved };
}
