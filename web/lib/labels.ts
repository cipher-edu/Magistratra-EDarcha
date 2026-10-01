export const STATUS_LABEL = {
  DRAFT: "Qoralama",
  SUBMITTED: "Yuborilgan",
  IN_REVIEW: "Ko‘rib chiqilmoqda",
  APPROVED: "Qabul qilindi",
  REVISION: "Qayta tahrir",
  REJECTED: "Rad etildi",
} as const;

export const TYPE_LABEL = {
  ARIZA: "Ariza",
  PLAN: "Kalendar ish rejasi",
  REPORT: "Oylik hisobot",
  DISSERTATION: "Dissertatsiya",
  PRACTICE: "Amaliyot",
  SOCIAL: "Ijtimoiy faoliyat",
} as const;

export const ACTION_LABEL = {
  APPROVE: "Qabul qilindi",
  REJECT: "Rad etildi",
  REVISION: "Qayta tahrirga yuborildi",
} as const;

export type DocStatus = keyof typeof STATUS_LABEL;
export type DocType = keyof typeof TYPE_LABEL;
export const SUBMIT_TYPES = ["PLAN", "REPORT", "DISSERTATION", "PRACTICE", "SOCIAL"] as const satisfies readonly DocType[];
export type ReviewAction = keyof typeof ACTION_LABEL;

export const STATUS_ORDER: DocStatus[] = ["DRAFT", "SUBMITTED", "IN_REVIEW", "REVISION", "APPROVED", "REJECTED"];

export function isAwaiting(status: string) {
  return status === "SUBMITTED" || status === "IN_REVIEW";
}
