import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { currentUser } from "@/lib/auth";
import { changeOwnPassword, orgLinked, updateOwnProfile } from "@/lib/db";

function emailOk(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Kirish kerak." }, { status: 401 });
  if (user.role !== "ADMIN" && user.account_status !== "ACTIVE") {
    return NextResponse.json({ error: "Hisob tasdiqlanmaguncha profil yopiq." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    kind?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    faculty?: string;
    department?: string;
    specialty?: string;
    course?: number | string;
    funding?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  } | null;

  if (body?.kind === "password") {
    const next = body.newPassword ?? "";
    if (!body.currentPassword) return NextResponse.json({ error: "Joriy parolni yozing." }, { status: 400 });
    if (next.length < 6) return NextResponse.json({ error: "Yangi parol kamida 6 ta belgidan iborat bo‘lsin." }, { status: 400 });
    if (next !== body.confirmPassword) return NextResponse.json({ error: "Yangi parollar mos emas." }, { status: 400 });
    const result = await changeOwnPassword(user.id, body.currentPassword, next);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    await writeAudit(request, { user, action: "PASSWORD", path: "/profil", ok: true });
    return NextResponse.json({ ok: true });
  }

  const fullName = body?.fullName?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const phone = body?.phone?.trim() ?? "";
  if (fullName.length < 3) return NextResponse.json({ error: "F.I.O. kamida 3 ta belgidan iborat bo‘lsin." }, { status: 400 });
  if (!emailOk(email)) return NextResponse.json({ error: "Email noto‘g‘ri." }, { status: 400 });
  if (phone && phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json({ error: "Telefon raqamini to‘liq yozing." }, { status: 400 });
  }
  if (user.role === "MAGISTR") {
    const course = Number(body?.course);
    const faculty = body?.faculty?.trim() ?? "";
    const department = body?.department?.trim() ?? "";
    const specialty = body?.specialty?.trim() ?? "";
    const funding = body?.funding ?? "";
    if (phone.replace(/\D/g, "").length < 9) {
      return NextResponse.json({ error: "Telefon raqamini to‘liq yozing." }, { status: 400 });
    }
    if (!(await orgLinked(faculty, department, specialty))) {
      return NextResponse.json({ error: "Fakultet, kafedra va mutaxassislik admin ro‘yxatidan tanlanadi." }, { status: 400 });
    }
    if (![1, 2, 3].includes(course) || (funding !== "Grant" && funding !== "Kontrakt")) {
      return NextResponse.json({ error: "Kurs va moliyaviy turni tanlang." }, { status: 400 });
    }
    const result = await updateOwnProfile(user, { fullName, email, phone, faculty, department, specialty, course, funding });
    if ("error" in result) return NextResponse.json(result, { status: 409 });
    await writeAudit(request, { user, action: "PROFILE", path: "/profil", ok: true, detail: email });
    return NextResponse.json({ ok: true });
  }

  const result = await updateOwnProfile(user, { fullName, email, phone });
  if ("error" in result) return NextResponse.json(result, { status: 409 });
  await writeAudit(request, { user, action: "PROFILE", path: "/profil", ok: true, detail: email });
  return NextResponse.json({ ok: true });
}
