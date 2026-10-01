import Link from "next/link";
import { DecisionMark, isDecisionStatus } from "./DecisionMark";
import { StatusBadge } from "./StatusBadge";
import type { DocumentRow } from "@/lib/db";
import { buildHref, formatWhen, type FilterValues } from "@/lib/filters";
import { STATUS_LABEL, STATUS_ORDER, TYPE_LABEL, type DocStatus, type DocType } from "@/lib/labels";

export function FilterFold({ applied, children }: { applied: boolean; children: React.ReactNode }) {
  return (
    <details className="filter-fold">
      <summary>
        <span>{applied ? "Filtr qo‘llangan" : "Filtr"}</span>
        <small />
      </summary>
      {children}
    </details>
  );
}

export function FilterForm({
  action,
  values,
  faculties,
  mode,
}: {
  action: string;
  values: FilterValues;
  faculties: string[];
  mode: "admin" | "student";
}) {
  const applied = Boolean(values.q || values.status || values.type || values.faculty || values.course || values.funding);
  const form = (
    <form
      className={`filters ${mode}`}
      method="get"
      action={action}
      key={`${values.q}|${values.status}|${values.type}|${values.faculty}|${values.course}|${values.funding}`}
    >
      <label>
        Qidiruv
        <input name="q" defaultValue={values.q} placeholder="Ism, hujjat, mutaxassislik" />
      </label>
      <label>
        Bosqich
        <select name="status" defaultValue={values.status}>
          <option value="">Barcha bosqichlar</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Hujjat turi
        <select name="type" defaultValue={values.type}>
          <option value="">Barcha turlar</option>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {mode === "admin" ? (
        <>
          <label>
            Fakultet
            <select name="faculty" defaultValue={values.faculty}>
              <option value="">Barcha fakultetlar</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kurs
            <select name="course" defaultValue={values.course}>
              <option value="">Barcha kurslar</option>
              <option value="1">1-kurs</option>
              <option value="2">2-kurs</option>
              <option value="3">3-kurs</option>
            </select>
          </label>
          <label>
            Moliyaviy tur
            <select name="funding" defaultValue={values.funding}>
              <option value="">Grant va kontrakt</option>
              <option value="Grant">Grant</option>
              <option value="Kontrakt">Kontrakt</option>
            </select>
          </label>
        </>
      ) : null}
      <div className="filter-actions">
        <button className="btn" type="submit">
          Filtrlash
        </button>
        <Link className="btn ghost" href={action}>
          Tozalash
        </Link>
      </div>
    </form>
  );
  if (mode === "admin") return <FilterFold applied={applied}>{form}</FilterFold>;
  return form;
}

export function Kpis({ rows }: { rows: DocumentRow[] }) {
  const total = rows.length;
  const awaiting = rows.filter((row) => row.status === "SUBMITTED" || row.status === "IN_REVIEW").length;
  const revision = rows.filter((row) => row.status === "REVISION").length;
  const approved = rows.filter((row) => row.status === "APPROVED").length;
  const rejected = rows.filter((row) => row.status === "REJECTED").length;
  const draft = rows.filter((row) => row.status === "DRAFT").length;
  const items = [
    ["Jami hujjat", total],
    ["Qaror kutilmoqda", awaiting],
    ["Qayta tahrir", revision],
    ["Qabul qilingan", approved],
    ["Rad etilgan", rejected],
    ["Qoralama", draft],
  ];
  return (
    <section className="kpis">
      {items.map(([label, value]) => (
        <article key={label} className="kpi">
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}

export function StageStrip({
  rows,
  base,
  values,
  showMarks = false,
}: {
  rows: DocumentRow[];
  base: string;
  values: FilterValues;
  showMarks?: boolean;
}) {
  const total = rows.length || 1;
  return (
    <section className="stages">
      {STATUS_ORDER.map((status) => {
        const count = rows.filter((row) => row.status === status).length;
        const percent = Math.round((count / total) * 100);
        const active = values.status === status;
        return (
          <Link
            key={status}
            href={buildHref(base, values, { status: active ? "" : status })}
            className={active ? "stage on" : "stage"}
            data-status={status}
          >
            {showMarks ? (
              isDecisionStatus(status) ? <DecisionMark status={status} /> : <span className="d3 d3-gap" aria-hidden="true" />
            ) : null}
            <span>{STATUS_LABEL[status]}</span>
            <strong>{count}</strong>
            <i>
              <b style={{ width: `${percent}%` }} />
            </i>
            <em>{percent}%</em>
          </Link>
        );
      })}
    </section>
  );
}

export function Breakdown({
  title,
  rows,
  pick,
  labelOf,
}: {
  title: string;
  rows: DocumentRow[];
  pick: (row: DocumentRow) => string;
  labelOf?: (key: string) => string;
}) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = pick(row) || "Ko‘rsatilmagan";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] || 1;
  return (
    <article className="panel">
      <h3>{title}</h3>
      <div className="bars">
        {entries.length === 0 ? <p className="hint">Ma’lumot yo‘q.</p> : null}
        {entries.map(([key, count]) => (
          <div key={key} className="bar">
            <span>{labelOf ? labelOf(key) : key}</span>
            <i>
              <b style={{ width: `${Math.round((count / max) * 100)}%` }} />
            </i>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export function DocTable({
  rows,
  hrefFor,
  showStudent,
}: {
  rows: DocumentRow[];
  hrefFor: (id: string) => string;
  showStudent: boolean;
}) {
  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            {showStudent ? <th>Talaba</th> : null}
            {showStudent ? <th>Fakultet</th> : null}
            {showStudent ? <th>Kurs</th> : null}
            <th>Hujjat</th>
            <th>Tur</th>
            <th>Bosqich</th>
            <th>So‘nggi komment</th>
            <th>Yangilangan</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showStudent ? 8 : 5} className="empty">
                Filtr bo‘yicha yozuv topilmadi.
              </td>
            </tr>
          ) : null}
          {rows.map((doc) => (
            <tr key={doc.id}>
              {showStudent ? <td>{doc.owner_name}</td> : null}
              {showStudent ? <td>{doc.faculty}</td> : null}
              {showStudent ? <td>{doc.course}-kurs · {doc.funding}</td> : null}
              <td>
                <Link href={hrefFor(doc.id)}>{doc.title}</Link>
              </td>
              <td>{TYPE_LABEL[doc.type as DocType] ?? doc.type}</td>
              <td>
                <StatusBadge status={doc.status as DocStatus} />
              </td>
              <td className="clip">{doc.last_comment || "—"}</td>
              <td>{formatWhen(doc.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
