import { ACTION_LABEL, type ReviewAction } from "@/lib/labels";
import type { ReviewRow, SubmissionRound } from "@/lib/db";
import { formatWhen } from "@/lib/filters";

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArizaHistory({
  rounds,
  reviews,
  fallbackBody,
}: {
  rounds: SubmissionRound[];
  reviews: ReviewRow[];
  fallbackBody?: string;
}) {
  const events = [
    ...rounds.map((round) => ({ at: round.created_at, kind: "round" as const, round })),
    ...reviews.map((review) => ({ at: review.created_at, kind: "review" as const, review })),
  ].sort((left, right) => left.at.localeCompare(right.at) || (left.kind === "round" ? -1 : 1));

  if (events.length === 0 && !fallbackBody?.trim()) {
    return <p className="hint">Hali yuborish yo‘q.</p>;
  }

  return (
    <div className="timeline">
      {events.length === 0 && fallbackBody?.trim() ? (
        <article className="event">
          <header>
            <strong>Dastlabki matn</strong>
          </header>
          <p className="body-text">{fallbackBody}</p>
        </article>
      ) : null}
      {events.map((event) =>
        event.kind === "round" ? (
          <article key={event.round.id} className="event">
            <header>
              <strong>{event.round.version}-yuborish</strong>
              <small>{formatWhen(event.round.created_at)}</small>
            </header>
            {event.round.note ? <p className="body-text">{event.round.note}</p> : <p className="hint">Izoh yozilmagan.</p>}
            {event.round.files.length > 0 ? (
              <ul className="file-list">
                {event.round.files.map((file) => (
                  <li key={file.id}>
                    <a href={`/api/files/${file.id}`}>
                      <span>{file.label}</span>
                      <small>
                        {file.original_name} · {formatSize(file.size)}
                      </small>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">Bu yuborishda fayl biriktirilmagan.</p>
            )}
          </article>
        ) : (
          <article key={event.review.id} className="event review">
            <header>
              <strong>{ACTION_LABEL[event.review.action as ReviewAction] ?? event.review.action}</strong>
              <small>{formatWhen(event.review.created_at)}</small>
            </header>
            <p>{event.review.comment}</p>
            <small>{event.review.admin_name}</small>
          </article>
        ),
      )}
    </div>
  );
}
