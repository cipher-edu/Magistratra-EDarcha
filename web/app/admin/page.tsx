import Link from "next/link";
import {
  AdminAlertBanner,
  AdminHeroKpis,
  BlueprintAnalyticsGrid,
  Breakdown,
  DocTable,
  FilterForm,
  StageStrip,
} from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { countPendingAccounts, listFaculties, listStudents, queryDocuments } from "@/lib/db";
import { readFilters } from "@/lib/filters";
import { TYPE_LABEL, type DocType } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("ADMIN");
  const values = readFilters(await searchParams);
  const [faculties, scoped, pendingCount, students] = await Promise.all([
    listFaculties(),
    queryDocuments({ q: values.q, faculty: values.faculty, course: values.course, funding: values.funding }),
    countPendingAccounts(),
    listStudents(),
  ]);

  const stageRows = values.type ? scoped.filter((row) => row.type === values.type) : scoped;
  const typeRows = values.status ? scoped.filter((row) => row.status === values.status) : scoped;
  const rows = stageRows.filter((row) => !values.status || row.status === values.status);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.account_status === "ACTIVE").length;
  const pendingDocs = scoped.filter((row) => row.status === "SUBMITTED" || row.status === "IN_REVIEW").length;
  const approvedDocs = scoped.filter((row) => row.status === "APPROVED").length;
  const calculatedKpi =
    scoped.length > 0
      ? Math.min(96, Math.max(65, Math.round((approvedDocs / scoped.length) * 45 + 50)))
      : 78.4;

  return (
    <Shell role="ADMIN" name={user.full_name} active="/admin" title="Boshqaruv paneli">
      <AdminAlertBanner pendingAccounts={pendingCount} pendingDocs={pendingDocs} />

      <AdminHeroKpis
        totalStudents={totalStudents}
        activeStudents={activeStudents}
        pendingDocs={pendingDocs}
        avgKpi={calculatedKpi}
      />

      <div className="toolbar" style={{ marginTop: "4px" }}>
        <h2>Hujjatlar bosqichlari (Workflow)</h2>
        <p>Barcha statuslar bo‘yicha taqsimot</p>
      </div>

      <StageStrip rows={stageRows} base="/admin" values={values} />

      <BlueprintAnalyticsGrid />

      <section className="stats">
        <Breakdown
          title="Hujjat turlari dinamikasi"
          rows={typeRows}
          pick={(row) => row.type}
          labelOf={(key) => TYPE_LABEL[key as DocType] ?? key}
        />
        <Breakdown title="Fakultetlar kesimi" rows={rows} pick={(row) => row.faculty || "—"} />
      </section>

      <FilterForm action="/admin" values={values} faculties={faculties.map((item) => item.faculty)} mode="admin" />

      <div className="toolbar">
        <div>
          <h2>Hujjatlar va arizalar reestri</h2>
          <p className="hint">Magistrantlar tomonidan taqdim etilgan amaliy va ilmiy hujjatlar</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="badge DRAFT">{rows.length} ta yozuv</span>
          <Link className="btn tiny ghost" href="/admin/arizalar">
            Barcha arizalar
          </Link>
        </div>
      </div>

      <DocTable rows={rows} showStudent hrefFor={(id) => `/admin/hujjat/${id}`} />
    </Shell>
  );
}
