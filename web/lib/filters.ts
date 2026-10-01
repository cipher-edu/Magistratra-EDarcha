import { STATUS_LABEL, TYPE_LABEL, type DocStatus, type DocType } from "./labels";

export type FilterValues = {
  q: string;
  status: string;
  type: string;
  faculty: string;
  course: string;
  funding: string;
};

export function readFilters(sp: Record<string, string | string[] | undefined>): FilterValues {
  const one = (key: string) => {
    const value = sp[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const status = one("status");
  const type = one("type");
  const course = one("course");
  const funding = one("funding");
  return {
    q: one("q").trim(),
    status: status in STATUS_LABEL ? status : "",
    type: type in TYPE_LABEL ? type : "",
    faculty: one("faculty"),
    course: course === "1" || course === "2" || course === "3" ? course : "",
    funding: funding === "Grant" || funding === "Kontrakt" ? funding : "",
  };
}

export function buildHref(base: string, current: FilterValues, patch: Partial<FilterValues>) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  (Object.keys(next) as (keyof FilterValues)[]).forEach((key) => {
    if (next[key]) params.set(key, next[key]);
  });
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isDocStatus(value: string): value is DocStatus {
  return value in STATUS_LABEL;
}

export function isDocType(value: string): value is DocType {
  return value in TYPE_LABEL;
}
