import { notFound } from "next/navigation";
import { ArizaForm } from "@/components/ArizaForm";
import { ArizaHistory } from "@/components/ArizaHistory";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { getDocument, listReviews, listRounds } from "@/lib/db";
import { TYPE_LABEL, type DocType } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudentDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("MAGISTR");
  const { id } = await params;
  const document = await getDocument(id);
  if (!document || document.owner_id !== user.id) notFound();
  const [reviews, rounds] = await Promise.all([listReviews(document.id), listRounds(document.id)]);
  const editable = document.status === "DRAFT" || document.status === "REVISION";

  return (
    <Shell role="MAGISTR" name={user.full_name} active="/magistr" title="Ariza">
      <div className="page-head">
        <div>
          <p className="eyebrow">{TYPE_LABEL[document.type as DocType] ?? document.type}</p>
          <h2>{document.title}</h2>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <section className="stack">
        <article className="card">
          <h3>Tarix</h3>
          <ArizaHistory rounds={rounds} reviews={reviews} fallbackBody={rounds.length === 0 ? document.body : ""} />
        </article>
        {editable ? (
          <ArizaForm
            mode="resubmit"
            documentId={document.id}
            initialType={document.type as DocType}
            initialTitle={document.title}
            submitLabel="Qayta yuborish"
          />
        ) : (
          <p className="hint">
            {document.status === "APPROVED" || document.status === "REJECTED"
              ? "Qaror berilgan. Qayta yuborish admin arizani qayta ishlashga yuborganidan keyin ochiladi."
              : "Ariza admin qarorini kutmoqda. Yangi fayl qayta ishlashga yuborilgandan keyin qo‘shiladi."}
          </p>
        )}
      </section>
    </Shell>
  );
}
