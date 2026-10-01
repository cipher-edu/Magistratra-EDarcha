import { insertAudit, type UserRow } from "./db";

export const AUDIT_LABEL: Record<string, string> = {
  LOGIN: "Kirish",
  LOGOUT: "Chiqish",
  PAGE_VIEW: "Sahifa",
  REGISTER: "Ro‘yxat so‘rovi",
  ACCOUNT_APPROVE: "Hisob tasdiq",
  ACCOUNT_REJECT: "Hisob rad",
  PROFILE: "Profil",
  PASSWORD: "Parol",
  DOCUMENT_CREATE: "Ariza",
  DOCUMENT_RESUBMIT: "Qayta yuborish",
  DOCUMENT_REVIEW: "Qaror",
  FILE_DOWNLOAD: "Fayl",
  CATALOG: "Tuzilma",
};

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function writeAudit(
  request: Request,
  input: {
    user?: Pick<UserRow, "id" | "full_name" | "email" | "role"> | null;
    action: string;
    path?: string | null;
    target?: string | null;
    ok?: boolean;
    detail?: string | null;
    email?: string | null;
  },
) {
  try {
    await insertAudit({
      userId: input.user?.id ?? null,
      userName: input.user?.full_name ?? null,
      userEmail: input.user?.email ?? input.email ?? null,
      role: input.user?.role ?? null,
      action: input.action,
      path: input.path ?? null,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      target: input.target ?? null,
      ok: input.ok !== false,
      detail: input.detail ?? null,
    });
  } catch (error) {
    console.error("audit", error);
  }
}
