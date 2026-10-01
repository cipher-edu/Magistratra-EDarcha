"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgFaculty } from "@/lib/db";

export function OrgEditor({ org }: { org: OrgFaculty[] }) {
  const router = useRouter();
  const [facultyId, setFacultyId] = useState(org[0]?.id ?? "");
  const faculty = org.find((item) => item.id === facultyId) ?? org[0];
  const [departmentId, setDepartmentId] = useState(faculty?.departments[0]?.id ?? "");
  const department = faculty?.departments.find((item) => item.id === departmentId) ?? faculty?.departments[0];
  const [facultyName, setFacultyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [specialtyName, setSpecialtyName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(body: Record<string, string>) {
    setError("");
    setPending(true);
    const response = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Saqlanmadi");
      return;
    }
    setFacultyName("");
    setDepartmentName("");
    setSpecialtyName("");
    router.refresh();
  }

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <section className="org-grid">
        <article className="card">
          <h3>Fakultet</h3>
          <p className="hint">Ro‘yxatdan o‘tishdagi fakultetlar shu yerdan chiqadi.</p>
          <form
            className="org-add"
            onSubmit={(event) => {
              event.preventDefault();
              void send({ action: "add", kind: "faculty", name: facultyName });
            }}
          >
            <input value={facultyName} onChange={(event) => setFacultyName(event.target.value)} placeholder="Fakultet nomi" required />
            <button className="btn" type="submit" disabled={pending}>Qo‘shish</button>
          </form>
          <ul className="org-list">
            {org.map((item) => (
              <li key={item.id} data-on={item.id === faculty?.id}>
                <button type="button" onClick={() => { setFacultyId(item.id); setDepartmentId(item.departments[0]?.id ?? ""); }}>
                  {item.name}
                </button>
                <button className="btn tiny ghost" type="button" disabled={pending} onClick={() => void send({ action: "remove", kind: "faculty", id: item.id })}>
                  O‘chirish
                </button>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Kafedra</h3>
          <p className="hint">{faculty ? faculty.name : "Fakultet tanlanmagan"}</p>
          <form
            className="org-add"
            onSubmit={(event) => {
              event.preventDefault();
              if (!faculty) return;
              void send({ action: "add", kind: "department", name: departmentName, parentId: faculty.id });
            }}
          >
            <input value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} placeholder="Kafedra nomi" required />
            <button className="btn" type="submit" disabled={pending || !faculty}>Qo‘shish</button>
          </form>
          <ul className="org-list">
            {(faculty?.departments ?? []).map((item) => (
              <li key={item.id} data-on={item.id === department?.id}>
                <button type="button" onClick={() => setDepartmentId(item.id)}>{item.name}</button>
                <button className="btn tiny ghost" type="button" disabled={pending} onClick={() => void send({ action: "remove", kind: "department", id: item.id })}>
                  O‘chirish
                </button>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Mutaxassislik</h3>
          <p className="hint">{department ? department.name : "Kafedra tanlanmagan"}</p>
          <form
            className="org-add"
            onSubmit={(event) => {
              event.preventDefault();
              if (!department) return;
              void send({ action: "add", kind: "specialty", name: specialtyName, parentId: department.id });
            }}
          >
            <input value={specialtyName} onChange={(event) => setSpecialtyName(event.target.value)} placeholder="Mutaxassislik nomi" required />
            <button className="btn" type="submit" disabled={pending || !department}>Qo‘shish</button>
          </form>
          <ul className="org-list">
            {(department?.specialties ?? []).map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <button className="btn tiny ghost" type="button" disabled={pending} onClick={() => void send({ action: "remove", kind: "specialty", id: item.id })}>
                  O‘chirish
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
