import Link from "next/link";
import { DecisionMark, isDecisionStatus } from "./DecisionMark";
import { StatusBadge } from "./StatusBadge";
import { ThreeDIcon } from "./ThreeDIcon";
import type { DocumentRow } from "@/lib/db";
import { buildHref, formatWhen, type FilterValues } from "@/lib/filters";
import { STATUS_LABEL, STATUS_ORDER, TYPE_LABEL, type DocStatus, type DocType } from "@/lib/labels";

export function AdminHeroKpis({
  totalStudents,
  activeStudents,
  pendingDocs,
  avgKpi = 78.4,
}: {
  totalStudents: number;
  activeStudents: number;
  pendingDocs: number;
  avgKpi?: number;
}) {
  return (
    <section className="admin-hero-grid">
      <article className="admin-hero-card" style={{ "--card-accent": "#0284c7" } as React.CSSProperties}>
        <div className="admin-hero-info">
          <span className="admin-hero-label">Magistrantlar soni</span>
          <strong className="admin-hero-val">{totalStudents}</strong>
          <span className="admin-hero-badge" style={{ "--badge-color": "#0284c7", "--badge-bg": "#e0f2fe" } as React.CSSProperties}>
            Barcha kurslar
          </span>
        </div>
        <ThreeDIcon kind="students" size="banner" />
      </article>

      <article className="admin-hero-card" style={{ "--card-accent": "#16a34a" } as React.CSSProperties}>
        <div className="admin-hero-info">
          <span className="admin-hero-label">Faol foydalanuvchilar</span>
          <strong className="admin-hero-val">{activeStudents}</strong>
          <span className="admin-hero-badge" style={{ "--badge-color": "#16a34a", "--badge-bg": "#dcfce7" } as React.CSSProperties}>
            Faol kabinetlar
          </span>
        </div>
        <ThreeDIcon kind="profile" size="banner" />
      </article>

      <article className="admin-hero-card" style={{ "--card-accent": "#f59e0b" } as React.CSSProperties}>
        <div className="admin-hero-info">
          <span className="admin-hero-label">Navbatdagi arizalar</span>
          <strong className="admin-hero-val">{pendingDocs}</strong>
          <span className="admin-hero-badge" style={{ "--badge-color": "#d97706", "--badge-bg": "#fef3c7" } as React.CSSProperties}>
            Qaror kutmoqda
          </span>
        </div>
        <ThreeDIcon kind="requests" size="banner" />
      </article>

      <article className="admin-hero-card" style={{ "--card-accent": "#7c3aed" } as React.CSSProperties}>
        <div className="admin-hero-info">
          <span className="admin-hero-label">O‘rtacha KPI</span>
          <strong className="admin-hero-val">{avgKpi}%</strong>
          <span className="admin-hero-badge" style={{ "--badge-color": "#7c3aed", "--badge-bg": "#ede9fe" } as React.CSSProperties}>
            Nizom 36-son
          </span>
        </div>
        <ThreeDIcon kind="stats" size="banner" />
      </article>
    </section>
  );
}

export function AdminAlertBanner({
  pendingAccounts,
  pendingDocs,
}: {
  pendingAccounts: number;
  pendingDocs: number;
}) {
  if (pendingAccounts === 0 && pendingDocs === 0) return null;
  return (
    <div className="admin-alert-banner">
      <div className="admin-alert-body">
        <ThreeDIcon kind="requests" size="banner" />
        <div>
          <strong>Boshqaruv e’tiborini talab qiladigan jarayonlar</strong>
          <p>
            {pendingAccounts > 0 ? `${pendingAccounts} ta magistrant ro‘yxatdan o‘tish so‘rovi tasdiq kutilmoqda. ` : ""}
            {pendingDocs > 0 ? `${pendingDocs} ta hujjat admin ko‘rib chiqishi uchun navbatda turibdi.` : ""}
          </p>
        </div>
      </div>
      <div className="filter-actions">
        {pendingAccounts > 0 ? (
          <Link className="btn" href="/admin/sorovlar">
            So‘rovlarni tasdiqlash ({pendingAccounts})
          </Link>
        ) : null}
        {pendingDocs > 0 ? (
          <Link className="btn ghost" href="/admin/arizalar?status=SUBMITTED">
            Navbatni ko‘rish ({pendingDocs})
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function BlueprintAnalyticsGrid({
  scopusCount = 95,
  wosCount = 68,
  oakCount = 82,
}: {
  scopusCount?: number;
  wosCount?: number;
  oakCount?: number;
} = {}) {
  const kpiItems = [
    { label: "O‘quv faoliyati", pct: 25, color: "#2563eb" },
    { label: "Ilmiy faoliyat", pct: 25, color: "#7c3aed" },
    { label: "Amaliyot monitoringi", pct: 20, color: "#059669" },
    { label: "Ijtimoiy faoliyat", pct: 15, color: "#ea580c" },
    { label: "Hisobotlar va rejalar", pct: 15, color: "#eab308" },
  ];

  const topStudents = [
    { name: "Aliyev A.", score: 92.1, faculty: "Amaliy matematika" },
    { name: "Karimova D.", score: 88.7, faculty: "Dasturiy injiniring" },
    { name: "Abdullaev B.", score: 85.4, faculty: "Sun’iy intellekt" },
  ];

  return (
    <section className="analytics-trio">
      <article className="analytic-card">
        <header>
          <div>
            <h3>KPI mezonlari taqsimoti</h3>
            <span className="subtext">Nizom talablari bo‘yicha ulushlar</span>
          </div>
          <ThreeDIcon kind="stats" size="compact" />
        </header>
        <div className="kpi-distribution">
          {kpiItems.map((item) => (
            <div key={item.label} className="kpi-dist-item">
              <span>{item.label}</span>
              <div className="stage-card-bar">
                <b className="stage-card-fill" style={{ width: `${item.pct * 4}%`, backgroundColor: item.color }} />
              </div>
              <strong style={{ color: item.color }}>{item.pct}%</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="analytic-card">
        <header>
          <div>
            <h3>BMI tayyorgarligi & Ilmiy nashrlar</h3>
            <span className="subtext">Bitiruv malakaviy ishi progressi</span>
          </div>
          <ThreeDIcon kind="documents" size="compact" />
        </header>
        <div className="bmi-meter-box">
          <div className="bmi-circle">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--track)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.2"
                strokeDasharray="68, 100"
                strokeLinecap="round"
              />
            </svg>
            <span className="bmi-circle-val">68%</span>
          </div>
          <div>
            <strong>O‘rtacha tayyorgarlik</strong>
            <p className="hint" style={{ margin: "2px 0 8px" }}>
              Nizom talablariga mos ilmiy maqolalar:
            </p>
            <div className="pub-pills">
              <div className="pub-pill">
                <span>Scopus</span>
                <strong>{scopusCount}</strong>
              </div>
              <div className="pub-pill">
                <span>WoS</span>
                <strong>{wosCount}</strong>
              </div>
              <div className="pub-pill">
                <span>OAK</span>
                <strong>{oakCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="analytic-card">
        <header>
          <div>
            <h3>Eng faol magistrantlar</h3>
            <span className="subtext">TOP 3 reyting ko‘rsatkichi</span>
          </div>
          <ThreeDIcon kind="students" size="compact" />
        </header>
        <ul className="top-students-list">
          {topStudents.map((st, idx) => (
            <li key={st.name} className="top-student-item">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="top-student-badge">{idx + 1}</span>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>{st.name}</strong>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>{st.faculty}</span>
                </div>
              </div>
              <span className="top-student-score">{st.score}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

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
}: {
  rows: DocumentRow[];
  base: string;
  values: FilterValues;
  showMarks?: boolean;
}) {
  const total = rows.length || 1;
  return (
    <section className="stages-modern">
      {STATUS_ORDER.map((status) => {
        const count = rows.filter((row) => row.status === status).length;
        const percent = Math.round((count / total) * 100);
        const active = values.status === status;
        return (
          <Link
            key={status}
            href={buildHref(base, values, { status: active ? "" : status })}
            className={active ? "stage-card on" : "stage-card"}
            data-status={status}
          >
            <div className="stage-card-head">
              <span className="stage-card-title">{STATUS_LABEL[status]}</span>
              <ThreeDIcon kind={status} size="compact" />
            </div>
            <div className="stage-card-count">{count}</div>
            <div className="stage-card-bar">
              <b
                className="stage-card-fill"
                style={{
                  width: `${percent}%`,
                  backgroundColor:
                    status === "APPROVED"
                      ? "var(--ok)"
                      : status === "REJECTED"
                      ? "var(--bad)"
                      : status === "REVISION"
                      ? "var(--revision)"
                      : status === "DRAFT"
                      ? "var(--draft)"
                      : "var(--wait)",
                }}
              />
            </div>
            <div className="stage-card-foot">
              <span>Ulush:</span>
              <strong>{percent}%</strong>
            </div>
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
              <td style={{ verticalAlign: "middle" }}>
                <Link href={hrefFor(doc.id)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                  <ThreeDIcon kind={doc.type === "ARTICLE" ? "article" : "documents"} size="compact" />
                  <span>{doc.title}</span>
                </Link>
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
