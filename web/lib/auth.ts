import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserById, initDb, type Role, type UserRow } from "./db";

const COOKIE = "magister_session";

type Session = { id: string; role: Role; exp: number };

function secret() {
  return process.env.SESSION_SECRET || "magister-local-session-secret";
}

export function signSession(id: string, role: Role) {
  const body = Buffer.from(JSON.stringify({ id, role, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (!data.id || !data.role || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<UserRow | null> {
  await initDb();
  const jar = await cookies();
  const session = readToken(jar.get(COOKIE)?.value);
  if (!session) return null;
  return findUserById(session.id);
}

export function cabinetPath(user: UserRow) {
  if (user.role === "ADMIN") return "/admin";
  if (user.account_status === "ACTIVE") return "/magistr";
  return "/kutish";
}

export async function requireUser(role?: Role) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (role === "MAGISTR" && user.account_status !== "ACTIVE") redirect("/kutish");
  if (role && user.role !== role) redirect(cabinetPath(user));
  return user;
}

export { COOKIE };
