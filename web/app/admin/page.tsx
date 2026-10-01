import Link from "next/link";
import { Breakdown, DocTable, FilterForm, Kpis, StageStrip } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { countPendingAccounts, listFaculties, queryDocuments } from "@/lib/db";
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
  const [faculties, scoped, pendingCount] = await Promise.all([
    listFaculties(),
    queryDocuments({ q: values.q, faculty: values.faculty, course: values.course, funding: values.funding }),
    countPendingAccounts(),
  ]);
  const stageRows = values.type ? scoped.filter((row) => row.type === values.type) : scoped;
  const typeRows = values.status ? scoped.filter((row) => row.status === values.status) : scoped;
  const rows = stageRows.filter((row) => !values.status || row.status === values.status);

  return (
    <Shell role="ADMIN" name={user.full_name} active="/admin" title="Boshqaruv paneli">
      {pendingCount > 0 ? (
        <p className="rule">
          <Link href="/admin/sorovlar">{pendingCount} ta ro‘yxat so‘rovi tasdiq kutilmoqda.</Link>
        </p>
      ) : null}
      <Kpis rows={stageRows} />
      <StageStrip rows={stageRows} base="/admin" values={values} />
      <section className="stats">
        <Breakdown
          title="Hujjat turlari"
          rows={typeRows}
          pick={(row) => row.type}
          labelOf={(key) => TYPE_LABEL[key as DocType] ?? key}
        />
        <Breakdown title="Fakultetlar kesimi" rows={rows} pick={(row) => row.faculty || "—"} />
      </section>
      <FilterForm action="/admin" values={values} faculties={faculties.map((item) => item.faculty)} mode="admin" />
      <div className="toolbar">
        <h2>Hujjatlar reestri</h2>
        <p>{rows.length} ta yozuv</p>
      </div>
      <DocTable rows={rows} showStudent hrefFor={(id) => `/admin/hujjat/${id}`} />
    </Shell>
  );
}
