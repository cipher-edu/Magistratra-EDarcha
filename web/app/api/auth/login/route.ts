import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { COOKIE, signSession } from "@/lib/auth";
import { findUserByEmail, initDb } from "@/lib/db";

export async function POST(request: Request) {
  await initDb();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const user = await findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    await writeAudit(request, { action: "LOGIN", path: "/login", ok: false, email, detail: email || null });
    return NextResponse.json({ error: "Email yoki parol noto‘g‘ri." }, { status: 401 });
  }
  await writeAudit(request, { user, action: "LOGIN", path: "/login", ok: true, detail: user.account_status });
  const response = NextResponse.json({ role: user.role, accountStatus: user.account_status });
  response.cookies.set(COOKIE, signSession(user.id, user.role), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
