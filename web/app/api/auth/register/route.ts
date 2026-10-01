import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { orgLinked, registerMagistr } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    passwordConfirm?: string;
    faculty?: string;
    department?: string;
    specialty?: string;
    course?: number | string;
    funding?: string;
  } | null;

  const fullName = body?.fullName?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const phone = body?.phone?.trim() ?? "";
  const password = body?.password ?? "";
  const faculty = body?.faculty?.trim() ?? "";
  const department = body?.department?.trim() ?? "";
  const specialty = body?.specialty?.trim() ?? "";
  const course = Number(body?.course);
  const funding = body?.funding ?? "";

  if (fullName.length < 3) {
    return NextResponse.json({ error: "F.I.O. kamida 3 ta belgidan iborat bo‘lsin." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email noto‘g‘ri." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json({ error: "Telefon raqamini to‘liq yozing." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 ta belgidan iborat bo‘lsin." }, { status: 400 });
  }
  if (password !== body?.passwordConfirm) {
    return NextResponse.json({ error: "Parollar mos emas." }, { status: 400 });
  }
  if (!(await orgLinked(faculty, department, specialty))) {
    return NextResponse.json({ error: "Fakultet, kafedra va mutaxassislik admin ro‘yxatidan tanlanadi." }, { status: 400 });
  }
  if (![1, 2, 3].includes(course) || (funding !== "Grant" && funding !== "Kontrakt")) {
    return NextResponse.json({ error: "Kurs va moliyaviy turni tanlang." }, { status: 400 });
  }

  const result = await registerMagistr({
    fullName,
    email,
    phone,
    password,
    faculty,
    department,
    specialty,
    course,
    funding,
  });
  if ("error" in result) return NextResponse.json(result, { status: 409 });
  await writeAudit(request, { action: "REGISTER", path: "/register", target: result.id, email, ok: true, detail: fullName });
  return NextResponse.json({ pending: true });
}
