"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewAction } from "@/lib/labels";

const ACTIONS: { action: ReviewAction; label: string; className: string }[] = [
  { action: "APPROVE", label: "Qabul qilish", className: "btn ok" },
  { action: "REVISION", label: "Qayta tahrirga yuborish", className: "btn wait" },
  { action: "REJECT", label: "Rad etish", className: "btn bad" },
];

export function ReviewForm({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const ready = comment.trim().length >= 3 && !pending;

  async function send(action: ReviewAction) {
    setError("");
    if (comment.trim().length < 3) {
      setError("Qaror faqat komment bilan saqlanadi.");
      return;
    }
    setPending(true);
    const response = await fetch(`/api/documents/${documentId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comment: comment.trim() }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Saqlanmadi");
      return;
    }
    setComment("");
    router.refresh();
  }

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <h3>Qaror</h3>
      <p className="hint">Qabul, rad etish va qayta tahrir faqat komment yozilganda ochiladi.</p>
      <div className="field">
        <label htmlFor="comment">Komment</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Nima uchun qabul qilindi, rad etildi yoki qayta yuborildi"
          required
          minLength={3}
        />
      </div>
      <div className="row">
        {ACTIONS.map((item) => (
          <button
            key={item.action}
            type="button"
            className={item.className}
            disabled={!ready}
            onClick={() => send(item.action)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
