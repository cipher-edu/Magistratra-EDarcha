import { STATUS_LABEL, type DocStatus } from "@/lib/labels";

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status as DocStatus] ?? status;
  return <span className={`badge ${status}`}>{label}</span>;
}
