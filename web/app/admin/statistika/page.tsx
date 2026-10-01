import Link from "next/link";
import { ColumnChart, DonutChart, HBarChart, LineChart, StackChart } from "@/components/Charts";
import { StatControls } from "@/components/StatControls";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { loadDashSource } from "@/lib/db";
import { formatWhen } from "@/lib/filters";
import { STATUS_LABEL, TYPE_LABEL, type DocType } from "@/lib/labels";
import { buildDashboard, type StatCut, type StatPeriod } from "@/lib/stats";

export const dynamic = "force-dynamic";

function readChoice(value: string | string[] | undefined, allowed: string[], fallback: string) {
  const one = Array.isArray(value) ? value[0] : value;
  return one && allowed.includes(one) ? one : fallback;
}

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireUser("ADMIN");
  const params = await searchParams;
  const period = readChoice(params.period, ["week", "month", "quarter"], "week") as StatPeriod;
  const cut = readChoice(params.cut, ["faculty", "specialty"], "faculty") as StatCut;
  const focusRaw = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const source = await loadDashSource();
  const all = buildDashboard(source, period, cut, "");
  const focus = all.options.includes(focusRaw ?? "") ? (focusRaw ?? "") : "";
  const data = focus ? buildDashboard(source, period, cut, focus) : all;
  const from = data.start.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
  const query = new URLSearchParams({ period, cut });
  if (focus) query.set("focus", focus);
  const cutTitle = cut === "faculty" ? "Fakultet kesimi" : "Yo‘nalish kesimi";

  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/statistika" title="Statistika">
      <section className="stat-hero">
        <div>
          <p className="eyebrow">Tahlil</p>
          <h2>Ko‘rsatkichlar va hisobotlar</h2>
          <p className="hint">{from} dan bugungacha. Kesim: {cutTitle.toLowerCase()}{focus ? ` · ${focus}` : ""}.</p>
        </div>
        <Link className="btn tiny ghost" href={`/api/reports?${query}`}>
          CSV
        </Link>
      </section>
      <StatControls period={period} cut={cut} focus={focus} options={all.options} />
      <section className="kpis stat-kpis">
        <article className="kpi"><span>Faol talaba</span><strong>{data.active}</strong></article>
        <article className="kpi"><span>Tasdiq kutilmoqda</span><strong>{data.waiting}</strong></article>
        <article className="kpi"><span>Davrdagi hujjat</span><strong>{data.documents}</strong></article>
        <article className="kpi"><span>Davrdagi qaror</span><strong>{data.reviewCount}</strong></article>
        <article className="kpi"><span>Qabul ulushi</span><strong>{data.approveRate}<small>%</small></strong></article>
        <article className="kpi"><span>O‘rtacha kun</span><strong>{data.avgDays ?? "—"}</strong></article>
      </section>
      <section className="chart-grid">
        <article className="chart-card">
          <header><h3>Talabalar — {cutTitle.toLowerCase()}</h3><p>Hozirgi faol tarkib</p></header>
          <HBarChart rows={all.peopleCut} active={focus || undefined} label={cutTitle} />
        </article>
        <article className="chart-card">
          <header><h3>Qaror ulushi</h3><p>Shu davr</p></header>
          <DonutChart rows={data.decisions} label="Qaror ulushi" />
        </article>
      </section>
      <section className="chart-grid">
        <article className="chart-card">
          <header><h3>Hujjat oqimi</h3><p>{period === "week" ? "Kunlar" : period === "month" ? "Haftalar" : "Oylar"}</p></header>
          <LineChart rows={data.trend.map((row) => ({ ...row, key: row.label }))} label="Hujjat oqimi" />
        </article>
        <article className="chart-card">
          <header><h3>Bosqichlar</h3><p>Davrda yaratilgan hujjat</p></header>
          <ColumnChart rows={data.byStatus} label="Bosqichlar" />
        </article>
      </section>
      <section className="chart-grid">
        <article className="chart-card">
          <header><h3>Hujjat turlari</h3><p>Ustunli kesim</p></header>
          <ColumnChart rows={data.byType} label="Hujjat turlari" />
        </article>
        <article className="chart-card">
          <header><h3>{cutTitle} ichida bosqich</h3><p>Qatlamli ustun</p></header>
          <StackChart rows={data.stacked} label={cutTitle} />
        </article>
      </section>
      <section className="stack">
        <article className="chart-card">
          <header><h3>Talabalar hisoboti</h3><p>{data.students.length} kishi</p></header>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr><th>Talaba</th><th>Fakultet</th><th>Yo‘nalish</th><th>Kurs</th><th>Moliya</th><th>Davrdagi hujjat</th></tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.full_name}>
                    <td>{student.full_name}</td>
                    <td>{student.faculty || "—"}</td>
                    <td>{student.specialty || "—"}</td>
                    <td>{student.course || "—"}</td>
                    <td>{student.funding || "—"}</td>
                    <td>{student.docs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="chart-card">
          <header><h3>Hujjatlar hisoboti</h3><p>{data.documentRows.length} ta</p></header>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr><th>Hujjat</th><th>Talaba</th><th>Tur</th><th>Bosqich</th><th>Sana</th></tr>
              </thead>
              <tbody>
                {data.documentRows.slice(0, 20).map((doc) => (
                  <tr key={doc.id}>
                    <td><Link href={`/admin/hujjat/${doc.id}`}>{doc.title}</Link></td>
                    <td>{doc.owner_name}</td>
                    <td>{TYPE_LABEL[doc.type as DocType] ?? doc.type}</td>
                    <td>{STATUS_LABEL[doc.status as keyof typeof STATUS_LABEL] ?? doc.status}</td>
                    <td>{formatWhen(doc.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="chart-card">
          <header><h3>Qarorlar hisoboti</h3><p>{data.reviewRows.length} ta · qayta tahrir {data.revisionRate}%</p></header>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr><th>Hujjat</th><th>Talaba</th><th>Admin</th><th>Qaror</th><th>Kun</th><th>Sana</th></tr>
              </thead>
              <tbody>
                {data.reviewRows.slice(0, 20).map((review) => {
                  const days = Math.max(0, Math.round((new Date(review.created_at).getTime() - new Date(review.doc_created).getTime()) / 86400000));
                  return (
                    <tr key={`${review.created_at}-${review.title}`}>
                      <td>{review.title}</td>
                      <td>{review.owner_name}</td>
                      <td>{review.admin_name}</td>
                      <td>{review.action === "APPROVE" ? "Qabul" : review.action === "REJECT" ? "Rad" : "Qayta tahrir"}</td>
                      <td>{days}</td>
                      <td>{formatWhen(review.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </Shell>
  );
}
