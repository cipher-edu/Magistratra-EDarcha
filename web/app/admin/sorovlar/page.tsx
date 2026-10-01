import { AccountDecision } from "@/components/AccountDecision";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { listAccountsByStatus, type AccountRequest } from "@/lib/db";
import { formatWhen } from "@/lib/filters";

export const dynamic = "force-dynamic";

function RequestCard({ person, rejectable }: { person: AccountRequest; rejectable: boolean }) {
  return (
    <article className="card">
      <div className="page-head">
        <div>
          <p className="eyebrow">{rejectable ? "Tasdiq kutilmoqda" : "Rad etilgan"}</p>
          <h2>{person.full_name}</h2>
        </div>
        <p className="hint">{formatWhen(person.created_at)}</p>
      </div>
      <div className="meta">
        <div><span>Email</span><strong>{person.email}</strong></div>
        <div><span>Telefon</span><strong>{person.phone || "—"}</strong></div>
        <div><span>Fakultet</span><strong>{person.faculty || "—"}</strong></div>
        <div><span>Kafedra</span><strong>{person.department || "—"}</strong></div>
        <div><span>Mutaxassislik</span><strong>{person.specialty || "—"}</strong></div>
        <div><span>Kurs</span><strong>{person.course}-kurs · {person.funding}</strong></div>
      </div>
      {person.status_note ? <p className="rule">{person.status_note}</p> : null}
      <AccountDecision userId={person.id} rejectable={rejectable} />
    </article>
  );
}

export default async function AccountRequestsPage() {
  const admin = await requireUser("ADMIN");
  const [pending, rejected] = await Promise.all([listAccountsByStatus("PENDING"), listAccountsByStatus("REJECTED")]);

  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/sorovlar" title="Ro‘yxat so‘rovlari">
      <div className="page-head">
        <div>
          <p className="eyebrow">Yangi hisoblar</p>
          <h2>Admin tasdiqlamaguncha kabinet yopiq</h2>
        </div>
      </div>
      <section className="stack">
        {pending.length === 0 ? <p className="hint">Tasdiq kutilayotgan so‘rov yo‘q.</p> : pending.map((person) => <RequestCard key={person.id} person={person} rejectable />)}
      </section>
      {rejected.length > 0 ? (
        <section className="stack">
          <h2>Rad etilgan so‘rovlar</h2>
          {rejected.map((person) => (
            <RequestCard key={person.id} person={person} rejectable={false} />
          ))}
        </section>
      ) : null}
    </Shell>
  );
}
