"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBMIT_TYPES, TYPE_LABEL, type DocType } from "@/lib/labels";

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
    const body = new FormData();
    body.set("type", type);
    body.set("title", title.trim());
    body.set("note", note.trim());
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
      <div className="field">
        <label htmlFor="title">Ariza nomi</label>
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
