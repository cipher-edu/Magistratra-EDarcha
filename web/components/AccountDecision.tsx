"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountDecision({ userId, rejectable }: { userId: string; rejectable: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const ready = note.trim().length >= 3 && !pending;

  async function send(action: "APPROVE" | "REJECT") {
    setError("");
    if (note.trim().length < 3) {
      setError("Qaror faqat komment bilan saqlanadi.");
      return;
    }
    setPending(true);
    const response = await fetch(`/api/accounts/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note.trim() }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Saqlanmadi");
      return;
    }
    setNote("");
    router.refresh();
  }

  return (
    <div className="field">
      <label htmlFor={`note-${userId}`}>Komment</label>
      <textarea
        id={`note-${userId}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Nima uchun tasdiqlandi yoki rad etildi"
        minLength={3}
      />
      <div className="row">
        <button className="btn ok" type="button" disabled={!ready} onClick={() => send("APPROVE")}>
          Tasdiqlash
        </button>
        {rejectable ? (
          <button className="btn bad" type="button" disabled={!ready} onClick={() => send("REJECT")}>
            Rad etish
          </button>
        ) : null}
      </div>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
