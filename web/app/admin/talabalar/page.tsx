import Link from "next/link";
import { FilterFold } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { listFaculties, queryStudents } from "@/lib/db";
import { readFilters } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("ADMIN");
  const values = readFilters(await searchParams);
  const [faculties, students] = await Promise.all([
    listFaculties(),
    queryStudents({ q: values.q, faculty: values.faculty, course: values.course, funding: values.funding }),
  ]);
  const awaiting = students.reduce((sum, student) => sum + student.awaiting, 0);
  const approved = students.reduce((sum, student) => sum + student.approved, 0);

  return (
    <Shell role="ADMIN" name={user.full_name} active="/admin/talabalar" title="Talabalar reestri">
      <section className="kpis">
        <article className="kpi"><span>Talabalar</span><strong>{students.length}</strong></article>
        <article className="kpi"><span>Qaror kutilmoqda</span><strong>{awaiting}</strong></article>
        <article className="kpi"><span>Qabul qilingan hujjat</span><strong>{approved}</strong></article>
        <article className="kpi"><span>Qayta tahrir</span><strong>{students.reduce((sum, student) => sum + student.revision, 0)}</strong></article>
        <article className="kpi"><span>Grant</span><strong>{students.filter((student) => student.funding === "Grant").length}</strong></article>
        <article className="kpi"><span>Kontrakt</span><strong>{students.filter((student) => student.funding === "Kontrakt").length}</strong></article>
      </section>
      <FilterFold applied={Boolean(values.q || values.faculty || values.course || values.funding)}>
      <form className="filters students" method="get" action="/admin/talabalar" key={`${values.q}|${values.faculty}|${values.course}|${values.funding}`}>
        <label>
          Qidiruv
          <input name="q" defaultValue={values.q} placeholder="F.I.O., email, kafedra" />
        </label>
        <label>
          Fakultet
          <select name="faculty" defaultValue={values.faculty}>
            <option value="">Barcha fakultetlar</option>
            {faculties.map((item) => (
              <option key={item.faculty} value={item.faculty}>{item.faculty}</option>
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
        <div className="filter-actions">
          <button className="btn" type="submit">Filtrlash</button>
          <Link className="btn ghost" href="/admin/talabalar">Tozalash</Link>
        </div>
      </form>
      </FilterFold>
      <div className="table-wrap">
        <table className="grid">
          <thead>
            <tr>
              <th>Talaba</th>
              <th>Fakultet</th>
              <th>Kafedra</th>
              <th>Mutaxassislik</th>
              <th>Kurs</th>
              <th>Moliya</th>
              <th>Hujjat</th>
              <th>Kutilmoqda</th>
              <th>Qabul</th>
              <th>Tahrir</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={10} className="empty">Filtr bo‘yicha talaba topilmadi.</td></tr>
            ) : null}
            {students.map((student) => (
              <tr key={student.id}>
                <td><Link href={`/admin/talaba/${student.id}`}>{student.full_name}</Link></td>
                <td>{student.faculty}</td>
                <td>{student.department}</td>
                <td>{student.specialty}</td>
                <td>{student.course}</td>
                <td>{student.funding}</td>
                <td>{student.docs}</td>
                <td>{student.awaiting}</td>
                <td>{student.approved}</td>
                <td>{student.revision}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
