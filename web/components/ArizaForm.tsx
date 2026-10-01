"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PUBLICATION_DATABASES, SUBMIT_TYPES, TYPE_LABEL, type DocType } from "@/lib/labels";

type Row = { key: string; label: string; file: File | null };

function blankRow(): Row {
  return { key: crypto.randomUUID(), label: "", file: null };
}

export function ArizaForm({
  mode,
  documentId,
  initialType = "PLAN",
  initialTitle = "",
  submitLabel,
}: {
  mode: "create" | "resubmit";
  documentId?: string;
  initialType?: DocType;
  initialTitle?: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<DocType>(SUBMIT_TYPES.includes(initialType as (typeof SUBMIT_TYPES)[number]) ? initialType : "PLAN");
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState("");
  const [pubDb, setPubDb] = useState<string>(PUBLICATION_DATABASES[0]);
  const [journal, setJournal] = useState("");
  const [issue, setIssue] = useState("");
  const [doi, setDoi] = useState("");
  const [coAuthors, setCoAuthors] = useState("");
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function update(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function send() {
    setError("");
    if (title.trim().length < 3) {
      setError("Ariza nomi kamida 3 ta belgidan iborat bo‘lsin.");
      return;
    }
    const ready = rows.filter((row) => row.label.trim() || row.file);
    if (ready.length < 1 || ready.some((row) => !row.file)) {
      setError("Kamida bitta fayl biriktiring.");
      return;
    }
    if (ready.some((row) => row.label.trim().length < 2)) {
      setError("Har bir faylga nom yozing.");
      return;
    }

    let finalNote = note.trim();
    if (type === "ARTICLE") {
      const metaLines = [
        `[ILMIY NASHR MA’LUMOTLARI]`,
        `Baza: ${pubDb}`,
        journal.trim() ? `Jurnal / To‘plam: ${journal.trim()}` : "",
        issue.trim() ? `Jild / Son / Bet: ${issue.trim()}` : "",
        doi.trim() ? `DOI / Havola: ${doi.trim()}` : "",
        coAuthors.trim() ? `Hammualliflar: ${coAuthors.trim()}` : "",
      ].filter(Boolean).join("\n");
      finalNote = finalNote ? `${metaLines}\n\nQo‘shimcha izoh:\n${finalNote}` : metaLines;
    }

    const body = new FormData();
    body.set("type", type);
    body.set("title", title.trim());
    body.set("note", finalNote);
    ready.forEach((row) => {
      body.append("labels", row.label.trim());
      body.append("files", row.file as File);
    });
    setPending(true);
    const response = await fetch(mode === "create" ? "/api/documents" : `/api/documents/${documentId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      body,
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; id?: string };
    setPending(false);
    if (!response.ok || !data.id) {
      setError(data.error || "Yuborilmadi");
      return;
    }
    router.push(`/magistr/hujjat/${data.id}`);
    router.refresh();
  }

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <p className="hint">Qanday hujjat yuborayotganingizni tanlang. Kerakli fayllarni o‘z nomi bilan biriktiring. Qayta yuborilganda eski fayllar shu ariza tarixida qoladi.</p>
      <div className="field">
        <label htmlFor="type">Hujjat turi</label>
        <select id="type" value={type} onChange={(event) => setType(event.target.value as DocType)}>
          {SUBMIT_TYPES.map((value) => (
            <option key={value} value={value}>
              {TYPE_LABEL[value]}
            </option>
          ))}
        </select>
      </div>
      {type === "ARTICLE" ? (
        <fieldset className="article-meta-box" style={{
          border: "1px solid var(--line)",
          borderRadius: "10px",
          padding: "16px",
          background: "var(--bg-subtle, rgba(219, 39, 119, 0.03))",
          margin: "8px 0"
        }}>
          <legend style={{ fontWeight: 600, fontSize: "13px", padding: "0 8px", color: "var(--accent)" }}>
            Ilmiy maqola / Tezis metadatalari (Nizom 36-son)
          </legend>
          <div className="field">
            <label htmlFor="pubDb">Indekslangan ilmiy baza</label>
            <select id="pubDb" value={pubDb} onChange={(e) => setPubDb(e.target.value)}>
              {PUBLICATION_DATABASES.map((db) => (
                <option key={db} value={db}>{db}</option>
              ))}
            </select>
          </div>
          <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="field">
              <label htmlFor="journal">Jurnal yoki to‘plam nomi</label>
              <input
                id="journal"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Masalan: IEEE Access yoki O‘zMU Xabarlari"
              />
            </div>
            <div className="field">
              <label htmlFor="issue">Nashr soni va betlari</label>
              <input
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Masalan: 2025-yil, 3-son, 45-52-betlar"
              />
            </div>
          </div>
          <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
            <div className="field">
              <label htmlFor="doi">DOI yoki nashr havolasi</label>
              <input
                id="doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="https://doi.org/... yoki havola"
              />
            </div>
            <div className="field">
              <label htmlFor="coAuthors">Hammualliflar</label>
              <input
                id="coAuthors"
                value={coAuthors}
                onChange={(e) => setCoAuthors(e.target.value)}
                placeholder="Ixtiyoriy, masalan: dots. A. Karimov"
              />
            </div>
          </div>
        </fieldset>
      ) : null}
      <div className="field">
        <label htmlFor="title">{type === "ARTICLE" ? "Maqola / Tezis mavzusi" : "Ariza nomi"}</label>
        <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="note">Izoh</label>
        <textarea id="note" className="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ixtiyoriy. Shu yuborishga tegishli qisqa izoh" />
      </div>
      <div className="stack">
        {rows.map((row, index) => (
          <div key={row.key} className="file-row">
            <label>
              Fayl nomi
              <input
                value={row.label}
                onChange={(event) => update(row.key, { label: event.target.value })}
                placeholder={index === 0 ? "Masalan, Kalendar reja" : "Fayl nomi"}
              />
            </label>
            <label>
              Fayl
              <input type="file" onChange={(event) => update(row.key, { file: event.target.files?.[0] ?? null })} />
            </label>
            <button
              type="button"
              className="btn ghost tiny"
              disabled={rows.length === 1}
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            >
              Olib tashlash
            </button>
          </div>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn ghost" disabled={pending || rows.length >= 30} onClick={() => setRows((current) => [...current, blankRow()])}>
          Yana fayl qo‘shish
        </button>
        <button type="submit" className="btn" disabled={pending}>
          {submitLabel}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
