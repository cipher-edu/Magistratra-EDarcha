import { DecisionMark, DECISION_TEXT, isDecisionStatus } from "@/components/DecisionMark";
import { DocTable, FilterForm, Kpis, StageStrip } from "@/components/ErpBlocks";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { listFaculties, queryDocuments } from "@/lib/db";
import { readFilters, type FilterValues } from "@/lib/filters";

export const dynamic = "force-dynamic";

function navActive(values: FilterValues) {
  const onlyStatus = values.status && !values.q && !values.type && !values.faculty && !values.course && !values.funding;
  return onlyStatus ? `/admin/arizalar?status=${values.status}` : "/admin/arizalar";
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("ADMIN");
  const values = readFilters(await searchParams);
  const [faculties, scoped] = await Promise.all([
    listFaculties(),
    queryDocuments({ q: values.q, faculty: values.faculty, course: values.course, funding: values.funding }),
  ]);
  const stageRows = values.type ? scoped.filter((row) => row.type === values.type) : scoped;
  const rows = stageRows.filter((row) => !values.status || row.status === values.status);
  const decision = isDecisionStatus(values.status) ? values.status : null;

  return (
    <Shell role="ADMIN" name={user.full_name} active={navActive(values)} title="Arizalar">
      {decision ? (
        <section className="decision-hero" data-status={decision}>
          <DecisionMark status={decision} size="hero" />
          <div>
            <p className="eyebrow">Qarorlar</p>
            <h2>{DECISION_TEXT[decision].title}</h2>
            <p className="hint">{DECISION_TEXT[decision].text}</p>
          </div>
        </section>
      ) : null}
      <Kpis rows={stageRows} />
      <StageStrip rows={stageRows} base="/admin/arizalar" values={values} showMarks />
      <FilterForm action="/admin/arizalar" values={values} faculties={faculties.map((item) => item.faculty)} mode="admin" />
      <div className="toolbar">
        <h2>Arizalar reestri</h2>
        <p>{rows.length} ta yozuv</p>
      </div>
      <DocTable rows={rows} showStudent hrefFor={(id) => `/admin/hujjat/${id}`} />
    </Shell>
  );
}
