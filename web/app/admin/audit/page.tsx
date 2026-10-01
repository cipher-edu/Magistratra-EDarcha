import { FilterFold } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { AUDIT_LABEL } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { queryAudit } from "@/lib/db";
import { formatWhen } from "@/lib/filters";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function dayStart(value: string, fallback: Date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback.toISOString();
  return `${value}T00:00:00.000Z`;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireUser("ADMIN");
  const params = await searchParams;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromInput = one(params.from);
  const toInput = one(params.to);
  const q = one(params.q).trim();
  const role = one(params.role);
  const action = one(params.action);
  const ip = one(params.ip).trim();
  const path = one(params.path).trim();
  const ok = one(params.ok);
  const from = dayStart(fromInput, weekAgo);
  const toDate = /^\d{4}-\d{2}-\d{2}$/.test(toInput) ? new Date(`${toInput}T00:00:00.000Z`) : today;
  toDate.setUTCDate(toDate.getUTCDate() + 1);
  const rows = await queryAudit({ from, to: toDate.toISOString(), q, role, action, ip, path, ok });
  const applied = Boolean(q || role || action || ip || path || ok || fromInput || toInput);
  const fromValue = fromInput || weekAgo.toISOString().slice(0, 10);
  const toValue = toInput || today.toISOString().slice(0, 10);

  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/audit" title="Audit">
      <section className="stat-hero">
        <div>
          <p className="eyebrow">Nazorat</p>
          <h2>Audit hisobi</h2>
          <p className="hint">Kim, qachon, qaysi sahifada va qaysi IP manzildan ish qilgani.</p>
        </div>
        <strong className="stat-count">{rows.length}</strong>
      </section>
      <FilterFold applied={applied}>
        <form className="filters audit-filters" method="get" action="/admin/audit">
          <label>
            Dan
            <input type="date" name="from" defaultValue={fromValue} />
          </label>
          <label>
            Gacha
            <input type="date" name="to" defaultValue={toValue} />
          </label>
          <label>
            Kim
            <input name="q" defaultValue={q} placeholder="Ism yoki email" />
          </label>
          <label>
            Rol
            <select name="role" defaultValue={role}>
              <option value="">Hammasi</option>
              <option value="ADMIN">Administrator</option>
              <option value="MAGISTR">Magistr</option>
            </select>
          </label>
          <label>
            Amal
            <select name="action" defaultValue={action}>
              <option value="">Hammasi</option>
              {Object.entries(AUDIT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            IP
            <input name="ip" defaultValue={ip} placeholder="127.0.0.1" />
          </label>
          <label>
            Sahifa
            <input name="path" defaultValue={path} placeholder="/admin" />
          </label>
          <label>
            Natija
            <select name="ok" defaultValue={ok}>
              <option value="">Hammasi</option>
              <option value="1">Muvaffaqiyatli</option>
              <option value="0">Rad etilgan</option>
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn" type="submit">Filtrlash</button>
            <a className="btn ghost" href="/admin/audit">Tozalash</a>
          </div>
        </form>
      </FilterFold>
      <div className="table-wrap">
        <table className="grid audit-grid">
          <thead>
            <tr>
              <th>Vaqt</th>
              <th>Kim</th>
              <th>Amal</th>
              <th>Sahifa</th>
              <th>IP</th>
              <th>Qayerdan</th>
              <th>Natija</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7}>Bu filtrda yozuv yo‘q.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatWhen(row.created_at)}</td>
                  <td>
                    <strong>{row.user_name || row.user_email || "Mehmon"}</strong>
                    <small>{row.role === "ADMIN" ? "Administrator" : row.role === "MAGISTR" ? "Magistr" : row.user_email || "—"}</small>
                  </td>
                  <td>
                    {AUDIT_LABEL[row.action] ?? row.action}
                    {row.detail ? <small>{row.detail}</small> : null}
                  </td>
                  <td>{row.path || "—"}</td>
                  <td>{row.ip || "—"}</td>
                  <td>{row.user_agent || "—"}</td>
                  <td><span className={row.ok ? "pill ok" : "pill bad"}>{row.ok ? "Bo‘ldi" : "Rad"}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
