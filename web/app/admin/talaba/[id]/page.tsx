import { notFound } from "next/navigation";
import { DocTable, Kpis, StageStrip } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { findUserById, queryDocuments } from "@/lib/db";
import { readFilters } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireUser("ADMIN");
  const { id } = await params;
  const student = await findUserById(id);
  if (!student || student.role !== "MAGISTR") notFound();
  const values = readFilters(await searchParams);
  const owned = await queryDocuments({ ownerId: student.id });
  const stageRows = values.type ? owned.filter((row) => row.type === values.type) : owned;
  const rows = stageRows.filter((row) => !values.status || row.status === values.status);
  const base = `/admin/talaba/${student.id}`;

  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/talabalar" title={student.full_name}>
      <article className="card">
        <div className="meta">
          <div><span>Email</span><strong>{student.email}</strong></div>
          <div><span>Telefon</span><strong>{student.phone}</strong></div>
          <div><span>Fakultet</span><strong>{student.faculty}</strong></div>
          <div><span>Kafedra</span><strong>{student.department}</strong></div>
          <div><span>Mutaxassislik</span><strong>{student.specialty}</strong></div>
          <div><span>Kurs</span><strong>{student.course}-kurs · {student.funding}</strong></div>
        </div>
      </article>
      <Kpis rows={stageRows} />
      <StageStrip rows={stageRows} base={base} values={values} />
      <form className="filters student" method="get" action={base} key={`${values.status}|${values.type}`}>
        <label>
          Bosqich
          <select name="status" defaultValue={values.status}>
            <option value="">Barcha bosqichlar</option>
            <option value="DRAFT">Qoralama</option>
            <option value="SUBMITTED">Yuborilgan</option>
            <option value="IN_REVIEW">Ko‘rib chiqilmoqda</option>
            <option value="REVISION">Qayta tahrir</option>
            <option value="APPROVED">Qabul qilindi</option>
            <option value="REJECTED">Rad etildi</option>
          </select>
        </label>
        <label>
          Hujjat turi
          <select name="type" defaultValue={values.type}>
            <option value="">Barcha turlar</option>
            <option value="PLAN">Kalendar ish rejasi</option>
            <option value="REPORT">Oylik hisobot</option>
            <option value="DISSERTATION">Dissertatsiya</option>
            <option value="PRACTICE">Amaliyot</option>
            <option value="SOCIAL">Ijtimoiy faoliyat</option>
          </select>
        </label>
        <div className="filter-actions">
          <button className="btn" type="submit">Filtrlash</button>
          <a className="btn ghost" href={base}>Tozalash</a>
        </div>
      </form>
      <div className="toolbar">
        <h2>Talaba hujjatlari</h2>
        <p>{rows.length} ta yozuv</p>
      </div>
      <DocTable rows={rows} showStudent={false} hrefFor={(docId) => `/admin/hujjat/${docId}`} />
    </Shell>
  );
}
