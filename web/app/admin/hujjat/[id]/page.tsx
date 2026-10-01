import Link from "next/link";
import { notFound } from "next/navigation";
import { ArizaHistory } from "@/components/ArizaHistory";
import { ReviewForm } from "@/components/ReviewForm";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { findUserById, getDocument, listReviews, listRounds, markInReview } from "@/lib/db";
import { isAwaiting, TYPE_LABEL, type DocType } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireUser("ADMIN");
  const { id } = await params;
  await markInReview(id);
  const document = await getDocument(id);
  if (!document) notFound();
  const [student, reviews, rounds] = await Promise.all([
    findUserById(document.owner_id),
    listReviews(document.id),
    listRounds(document.id),
  ]);

  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/arizalar" title="Ariza qarori">
      <div className="page-head">
        <div>
          <p className="eyebrow">{TYPE_LABEL[document.type as DocType] ?? document.type}</p>
          <h2>{document.title}</h2>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <div className="split">
        <section className="stack">
          <article className="card">
            <p className="hint">
              Talaba:{" "}
              <Link href={`/admin/talaba/${document.owner_id}`}>
                <strong>{student?.full_name}</strong>
              </Link>
            </p>
            <h3>Tarix</h3>
            <ArizaHistory rounds={rounds} reviews={reviews} fallbackBody={rounds.length === 0 ? document.body : ""} />
          </article>
        </section>
        {isAwaiting(document.status) ? (
          <ReviewForm documentId={document.id} />
        ) : (
          <aside className="rule">
            <h3>Qaror berilgan</h3>
            <p>Bu hujjat yopilgan. Yangi qaror talaba hujjatni qayta yuborgandan keyin ochiladi.</p>
          </aside>
        )}
      </div>
    </Shell>
  );
}
