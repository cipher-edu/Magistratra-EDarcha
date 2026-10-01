"use client";

import Link from "next/link";
import { useState } from "react";
import { LoginAvatar } from "@/components/LoginAvatar";
import { OrgFields } from "@/components/OrgFields";
import type { OrgFaculty } from "@/lib/db";

export function RegisterForm({ org }: { org: OrgFaculty[] }) {
  const first = org.find((item) => item.departments.some((department) => department.specialties.length)) ?? org[0];
  const firstDepartment = first?.departments.find((department) => department.specialties.length) ?? first?.departments[0];
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [covered, setCovered] = useState(false);
  const [faculty, setFaculty] = useState(first?.name ?? "");
  const [department, setDepartment] = useState(firstDepartment?.name ?? "");
  const [specialty, setSpecialty] = useState(firstDepartment?.specialties[0]?.name ?? "");
  const [course, setCourse] = useState("1");
  const [funding, setFunding] = useState("Grant");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Parollar mos emas.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        passwordConfirm,
        faculty,
        department,
        specialty,
        course,
        funding,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "So‘rov yuborilmadi");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="login-card login-card-wide">
        <LoginAvatar />
        <div className="brand">
          <span className="mark">M</span>
          <div>
            <p className="eyebrow">Magistratura</p>
            <strong>Boshqaruv tizimi</strong>
          </div>
        </div>
        <h1>So‘rov yuborildi</h1>
        <p className="lede">
          Hisob hali ochilmagan. Admin tasdiqlamaguncha profil ochilmaydi va ariza qoldirib bo‘lmaydi.
        </p>
        <Link className="btn" href="/login">
          Kirish sahifasi
        </Link>
      </div>
    );
  }

  return (
    <form className="login-card login-card-wide" onSubmit={submit}>
      <LoginAvatar look={email.length / 2} covered={covered} />
      <div className="brand">
        <span className="mark">M</span>
        <div>
          <p className="eyebrow">Magistratura</p>
          <strong>Boshqaruv tizimi</strong>
        </div>
      </div>
      <h1>Ro‘yxatdan o‘tish</h1>
      <p className="lede">Bu so‘rov admin tasdig‘idan keyin hisobga aylanadi. Tasdiqlanguncha kabinet yopiq turadi.</p>
      <div className="field">
        <label htmlFor="fullName">F.I.O.</label>
        <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </div>
      <div className="split-fields">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+998901234567" required />
        </div>
      </div>
      <div className="split-fields">
        <div className="field">
          <label htmlFor="password">Parol</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={() => setCovered(true)}
            onBlur={() => setCovered(false)}
            minLength={6}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="passwordConfirm">Parolni tasdiqlash</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            onFocus={() => setCovered(true)}
            onBlur={() => setCovered(false)}
            minLength={6}
            required
          />
        </div>
      </div>
      <OrgFields
        org={org}
        faculty={faculty}
        department={department}
        specialty={specialty}
        onChange={(next) => {
          setFaculty(next.faculty);
          setDepartment(next.department);
          setSpecialty(next.specialty);
        }}
      />
      <div className="split-fields">
        <div className="field">
          <label htmlFor="course">Kurs</label>
          <select id="course" value={course} onChange={(event) => setCourse(event.target.value)}>
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="funding">Moliyaviy tur</label>
          <select id="funding" value={funding} onChange={(event) => setFunding(event.target.value)}>
            <option value="Grant">Grant</option>
            <option value="Kontrakt">Kontrakt</option>
          </select>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        So‘rov yuborish
      </button>
      <p className="hint">
        Hisobingiz bormi? <Link href="/login">Kirish</Link>
      </p>
    </form>
  );
}
