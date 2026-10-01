import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { loadDashSource } from "@/lib/db";
import { TYPE_LABEL, type DocType } from "@/lib/labels";
import { buildDashboard, type StatCut, type StatPeriod } from "@/lib/stats";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin hisobotni oladi." }, { status: 403 });
  }
  const url = new URL(request.url);
  const period = (["week", "month", "quarter"].includes(url.searchParams.get("period") ?? "") ? url.searchParams.get("period") : "week") as StatPeriod;
  const cut = (url.searchParams.get("cut") === "specialty" ? "specialty" : "faculty") as StatCut;
  const data = buildDashboard(await loadDashSource(), period, cut, url.searchParams.get("focus") ?? "");
  const lines = [
    ["Talaba", "Fakultet", "Yo‘nalish", "Kurs", "Moliya", "Hujjat", "Tur", "Bosqich", "Sana"].map(csvCell).join(","),
    ...data.documentRows.map((doc) =>
      [doc.owner_name, doc.faculty, doc.specialty, doc.course, doc.funding, doc.title, TYPE_LABEL[doc.type as DocType] ?? doc.type, doc.status, doc.created_at]
        .map(csvCell)
        .join(","),
    ),
  ];
  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=hisobot.csv",
    },
  });
}
