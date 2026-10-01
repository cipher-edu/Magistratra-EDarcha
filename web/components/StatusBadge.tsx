import { STATUS_LABEL, type DocStatus } from "@/lib/labels";
import { ThreeDIcon } from "./ThreeDIcon";
import { isDecisionStatus } from "./DecisionMark";

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status as DocStatus] ?? status;
  return (
    <span className={`badge ${status}`}>
      {isDecisionStatus(status) ? <ThreeDIcon kind={status} size="compact" /> : null}
      <span>{label}</span>
    </span>
  );
}
