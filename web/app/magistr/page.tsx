import Link from "next/link";
import { Breakdown, DocTable, FilterForm, Kpis, StageStrip } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { queryDocuments } from "@/lib/db";
import { readFilters } from "@/lib/filters";
import { TYPE_LABEL, type DocType } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("MAGISTR");
  const values = readFilters(await searchParams);
  const owned = await queryDocuments({ ownerId: user.id, q: values.q });
  const stageRows = values.type ? owned.filter((row) => row.type === values.type) : owned;
  const rows = stageRows.filter((row) => !values.status || row.status === values.status);

  return (
    <Shell role="MAGISTR" name={user.full_name} active="/magistr" title="Talaba kabineti">
      <article className="card">
        <div className="page-head">
          <div className="meta">
            <div><span>Fakultet</span><strong>{user.faculty}</strong></div>
            <div><span>Kafedra</span><strong>{user.department}</strong></div>
            <div><span>Mutaxassislik</span><strong>{user.specialty}</strong></div>
            <div><span>Kurs</span><strong>{user.course}-kurs · {user.funding}</strong></div>
            <div><span>Email</span><strong>{user.email}</strong></div>
            <div><span>Telefon</span><strong>{user.phone}</strong></div>
          </div>
          <Link className="btn" href="/magistr/hujjat/yangi">Ariza yuborish</Link>
        </div>
      </article>
      <Kpis rows={stageRows} />
      <StageStrip rows={stageRows} base="/magistr" values={values} />
      <Breakdown
        title="Mening hujjat turlarim"
        rows={owned}
        pick={(row) => row.type}
        labelOf={(key) => TYPE_LABEL[key as DocType] ?? key}
      />
      <FilterForm action="/magistr" values={values} faculties={[]} mode="student" />
      <div className="toolbar">
        <h2>Arizalarim</h2>
        <p>{rows.length} ta yozuv</p>
      </div>
      <DocTable rows={rows} showStudent={false} hrefFor={(id) => `/magistr/hujjat/${id}`} />
    </Shell>
  );
}
