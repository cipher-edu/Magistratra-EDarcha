import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { COOKIE, currentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await currentUser();
  if (user) await writeAudit(request, { user, action: "LOGOUT", path: "/api/auth/logout", ok: true });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
