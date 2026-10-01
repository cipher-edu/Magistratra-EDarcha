import type { DashDoc, DashPerson, DashReview } from "./db";
import { STATUS_LABEL, TYPE_LABEL, type DocStatus, type DocType } from "./labels";

export type StatPeriod = "week" | "month" | "quarter";
export type StatCut = "faculty" | "specialty";

export type CountRow = { key: string; label: string; value: number };
export type StackRow = { key: string; parts: { status: string; value: number }[] };

const STATUS_ORDER = ["DRAFT", "SUBMITTED", "IN_REVIEW", "REVISION", "APPROVED", "REJECTED"] as const;

export function periodStart(period: StatPeriod, now = new Date()) {
  const days = period === "week" ? 7 : period === "month" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function cutOf(row: { faculty: string | null; specialty: string | null }, cut: StatCut) {
  const value = (cut === "faculty" ? row.faculty : row.specialty)?.trim();
  return value || "Ko‘rsatilmagan";
}

function focused<T extends { faculty: string | null; specialty: string | null }>(rows: T[], cut: StatCut, focus: string) {
  if (!focus) return rows;
  return rows.filter((row) => cutOf(row, cut) === focus);
}

function counts(rows: string[]): CountRow[] {
  const map = new Map<string, number>();
  rows.forEach((key) => map.set(key, (map.get(key) ?? 0) + 1));
  return [...map.entries()]
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => b.value - a.value);
}

function buckets(period: StatPeriod, now: Date) {
  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - index));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const label = start.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
      return { label, start, end };
    });
  }
  if (period === "month") {
    return Array.from({ length: 4 }, (_, index) => {
      const end = new Date(now);
      end.setDate(end.getDate() - (3 - index) * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      return { label: `${index + 1}-hafta`, start, end };
    });
  }
  return Array.from({ length: 3 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (2 - index), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (2 - index) + 1, 1);
    const label = start.toLocaleDateString("uz-UZ", { month: "long" });
    return { label, start, end };
  });
}

export function buildDashboard(
  source: { docs: DashDoc[]; reviews: DashReview[]; people: DashPerson[] },
  period: StatPeriod,
  cut: StatCut,
  focus: string,
  now = new Date(),
) {
  const start = periodStart(period, now);
  const people = focused(source.people, cut, focus);
  const active = people.filter((person) => person.account_status === "ACTIVE");
  const waiting = people.filter((person) => person.account_status === "PENDING");
  const docs = focused(source.docs, cut, focus).filter((doc) => new Date(doc.created_at) >= start);
  const reviews = focused(source.reviews, cut, focus).filter((review) => new Date(review.created_at) >= start);
  const approved = reviews.filter((review) => review.action === "APPROVE").length;
  const revisions = reviews.filter((review) => review.action === "REVISION").length;
  const days = reviews
    .map((review) => (new Date(review.created_at).getTime() - new Date(review.doc_created).getTime()) / 86400000)
    .filter((value) => value >= 0);
  const avgDays = days.length ? Math.round((days.reduce((sum, value) => sum + value, 0) / days.length) * 10) / 10 : null;
  const byStatus = STATUS_ORDER.map((status) => ({
    key: status,
    label: STATUS_LABEL[status],
    value: docs.filter((doc) => doc.status === status).length,
  }));
  const byType: CountRow[] = (Object.keys(TYPE_LABEL) as DocType[])
    .filter((type) => type !== "ARIZA")
    .map((type) => ({ key: type, label: TYPE_LABEL[type], value: docs.filter((doc) => doc.type === type).length }));
  const legacy = docs.filter((doc) => doc.type === "ARIZA").length;
  if (legacy) byType.push({ key: "ARIZA", label: TYPE_LABEL.ARIZA, value: legacy });
  const peopleCut = counts(active.map((person) => cutOf(person, cut)));
  const stackedMap = new Map<string, Record<string, number>>();
  docs.forEach((doc) => {
    const key = cutOf(doc, cut);
    const bag = stackedMap.get(key) ?? {};
    bag[doc.status] = (bag[doc.status] ?? 0) + 1;
    stackedMap.set(key, bag);
  });
  const stacked: StackRow[] = [...stackedMap.entries()]
    .map(([key, bag]) => ({
      key,
      parts: STATUS_ORDER.map((status) => ({ status, value: bag[status] ?? 0 })),
      total: Object.values(bag).reduce((sum, value) => sum + value, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map(({ key, parts }) => ({ key, parts }));
  const trend = buckets(period, now).map((bucket) => ({
    label: bucket.label,
    value: docs.filter((doc) => {
      const time = new Date(doc.created_at).getTime();
      return time >= bucket.start.getTime() && time < bucket.end.getTime();
    }).length,
  }));
  const decisions = [
    { key: "APPROVE", label: "Qabul", value: approved },
    { key: "REVISION", label: "Qayta tahrir", value: revisions },
    { key: "REJECT", label: "Rad", value: reviews.filter((review) => review.action === "REJECT").length },
  ];
  const options = [...new Set(source.people.filter((person) => person.account_status === "ACTIVE").map((person) => cutOf(person, cut)))].sort((a, b) => a.localeCompare(b, "uz"));
  return {
    start,
    active: active.length,
    waiting: waiting.length,
    documents: docs.length,
    reviewCount: reviews.length,
    approveRate: reviews.length ? Math.round((approved / reviews.length) * 100) : 0,
    revisionRate: reviews.length ? Math.round((revisions / reviews.length) * 100) : 0,
    avgDays,
    byStatus,
    byType,
    peopleCut,
    stacked,
    trend,
    decisions,
    options,
    students: active
      .map((person) => ({
        ...person,
        docs: docs.filter((doc) => doc.owner_name === person.full_name).length,
      }))
      .sort((a, b) => b.docs - a.docs || a.full_name.localeCompare(b.full_name, "uz")),
    documentRows: [...docs].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    reviewRows: [...reviews].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

export function statusKey(status: string): DocStatus | null {
  return status in STATUS_LABEL ? (status as DocStatus) : null;
}
