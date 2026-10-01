export const DECISION_TEXT = {
  SUBMITTED: { title: "Yuborilganlar", text: "Navbatga tushgan hujjatlar qaror kutmoqda." },
  IN_REVIEW: { title: "Ko‘rib chiqilmoqda", text: "Hujjat hozir administrator qo‘lida." },
  REVISION: { title: "Qayta ishlash", text: "Talaba tuzatib, shu hujjat ichida qayta yuboradi." },
  APPROVED: { title: "Qabul qilingan", text: "Qaror qabul bilan yopilgan." },
  REJECTED: { title: "Rad etilgan", text: "Qaror rad bilan yopilgan." },
} as const;

export type DecisionStatus = keyof typeof DECISION_TEXT;

export function isDecisionStatus(value: string): value is DecisionStatus {
  return Object.prototype.hasOwnProperty.call(DECISION_TEXT, value);
}

export function DecisionMark({ status, size = "nav" }: { status: DecisionStatus; size?: "nav" | "hero" }) {
  return (
    <span className={size === "hero" ? "d3 hero" : "d3"} data-status={status} aria-hidden="true">
      <span className="d3-piece">
        <span className="d3-side" />
        <span className="d3-top" />
      </span>
    </span>
  );
}
