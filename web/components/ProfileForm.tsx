"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrgFields } from "@/components/OrgFields";
import type { OrgFaculty, Role } from "@/lib/db";

export function ProfileForm({
  role,
  fullName,
  email,
  phone,
  faculty,
  department,
  specialty,
  course,
  funding,
  org = [],
}: {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  specialty: string;
  course: number;
  funding: string;
  org?: OrgFaculty[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState({ fullName, email, phone, faculty, department, specialty, course: String(course || 1), funding: funding || "Grant" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileError, setProfileError] = useState("");
  const [profileOk, setProfileOk] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordOk, setPasswordOk] = useState("");
  const [pending, setPending] = useState<"profile" | "password" | "">("");

  function setField(key: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileError("");
    setProfileOk("");
    setPending("profile");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "profile", ...profile, course: Number(profile.course) }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending("");
    if (!response.ok) {
      setProfileError(data.error || "Saqlanmadi");
      return;
    }
    setProfileOk("Profil saqlandi.");
    router.refresh();
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setPasswordOk("");
    setPending("password");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "password", ...passwords }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending("");
    if (!response.ok) {
      setPasswordError(data.error || "Parol yangilanmadi");
      return;
    }
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordOk("Parol yangilandi.");
  }

  return (
    <div className="split">
      <form className="card" onSubmit={saveProfile}>
        <h3>Profil</h3>
        <p className="hint">Ism, aloqa va o‘qish ma’lumotlari shu yerdan yangilanadi.</p>
        <div className="field">
          <label htmlFor="fullName">F.I.O.</label>
          <input id="fullName" value={profile.fullName} onChange={(event) => setField("fullName", event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={profile.email} onChange={(event) => setField("email", event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" value={profile.phone} onChange={(event) => setField("phone", event.target.value)} />
        </div>
        {role === "MAGISTR" ? (
          <>
            <OrgFields
              org={org}
              faculty={profile.faculty}
              department={profile.department}
              specialty={profile.specialty}
              onChange={(next) => setProfile((current) => ({ ...current, ...next }))}
            />
            <div className="split-fields">
              <div className="field">
                <label htmlFor="course">Kurs</label>
                <select id="course" value={profile.course} onChange={(event) => setField("course", event.target.value)}>
                  <option value="1">1-kurs</option>
                  <option value="2">2-kurs</option>
                  <option value="3">3-kurs</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="funding">Moliyaviy tur</label>
                <select id="funding" value={profile.funding} onChange={(event) => setField("funding", event.target.value)}>
                  <option value="Grant">Grant</option>
                  <option value="Kontrakt">Kontrakt</option>
                </select>
              </div>
            </div>
          </>
        ) : null}
        {profileError ? <p className="error">{profileError}</p> : null}
        {profileOk ? <p className="hint">{profileOk}</p> : null}
        <button className="btn" type="submit" disabled={pending === "profile"}>
          Saqlash
        </button>
      </form>
      <form className="card" onSubmit={savePassword}>
        <h3>Parol</h3>
        <p className="hint">Joriy parolni yozmasdan yangi parol saqlanmaydi.</p>
        <div className="field">
          <label htmlFor="currentPassword">Joriy parol</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newPassword">Yangi parol</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={passwords.newPassword}
            onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Yangi parolni tasdiqlash</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={passwords.confirmPassword}
            onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
            required
          />
        </div>
        {passwordError ? <p className="error">{passwordError}</p> : null}
        {passwordOk ? <p className="hint">{passwordOk}</p> : null}
        <button className="btn" type="submit" disabled={pending === "password"}>
          Parolni yangilash
        </button>
      </form>
    </div>
  );
}
