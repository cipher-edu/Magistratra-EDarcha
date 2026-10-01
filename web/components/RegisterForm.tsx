"use client";

import Link from "next/link";
import { useState } from "react";
import { LoginAvatar } from "@/components/LoginAvatar";
import { ThreeDIcon } from "@/components/ThreeDIcon";
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
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Parollar bir-biriga mos kelmadi.");
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
      <div className="login-card login-card-wide" style={{ textAlign: "center" }}>
        <LoginAvatar look={0} covered={false} peeking={false} />
        <div className="brand" style={{ justifyContent: "center", marginBottom: "10px" }}>
          <ThreeDIcon kind="students" size="compact" />
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Magistratura</p>
            <strong>E-Darcha tizimi</strong>
          </div>
        </div>
        <h1>Ro‘yxatdan o‘tish so‘rovi yuborildi!</h1>
        <p className="lede" style={{ maxWidth: "480px", margin: "0 auto 20px" }}>
          So‘rovingiz qabul qilindi. Magistratura bo‘limi ma’muri tasdiqlagach, shaxsiy kabinetingiz faollashtiriladi.
        </p>
        <Link className="btn" href="/login">
          Kirish sahifasiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <form className="login-card login-card-wide" onSubmit={submit}>
      <LoginAvatar look={fullName.length + email.length} covered={covered} peeking={showPassword} />

      <div className="brand" style={{ justifyContent: "center", marginBottom: "8px" }}>
        <ThreeDIcon kind="students" size="compact" />
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Magistratura ERP</p>
          <strong>Talabalar ro‘yxati</strong>
        </div>
      </div>

      <h1 style={{ textAlign: "center" }}>Ro‘yxatdan o‘tish</h1>
      <p className="lede" style={{ textAlign: "center", marginBottom: "16px" }}>
        Nizom bo‘yicha magistrant sifatida so‘rov yuboring. Administrator tasdiqlaganidan so‘ng hisob faollashadi.
      </p>

      <div className="field">
        <label htmlFor="fullName">To‘liq F.I.O.</label>
        <input
          id="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          onFocus={() => setCovered(false)}
          placeholder="Familiya Ism Sharifingiz"
          required
        />
      </div>

      <div className="split-fields">
        <div className="field">
          <label htmlFor="email">Email manzil</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={() => setCovered(false)}
            placeholder="magistr@domain.uz"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon raqam</label>
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onFocus={() => setCovered(false)}
            placeholder="+998 90 123 45 67"
            required
          />
        </div>
      </div>

      <div className="split-fields">
        <div className="field">
          <label htmlFor="password">Yangi parol</label>
          <div className="pw-input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setCovered(true)}
              onBlur={() => {
                if (!showPassword) setCovered(false);
              }}
              minLength={6}
              placeholder="Kamida 6 belgi"
              required
            />
            <button
              type="button"
              className="pw-toggle-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Parolni ko‘rsatish/yashirish"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="passwordConfirm">Parolni tasdiqlash</label>
          <input
            id="passwordConfirm"
            type={showPassword ? "text" : "password"}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            onFocus={() => setCovered(true)}
            onBlur={() => {
              if (!showPassword) setCovered(false);
            }}
            minLength={6}
            placeholder="Parolni qayta tering"
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
          <label htmlFor="course">Ta’lim kursi</label>
          <select id="course" value={course} onChange={(event) => setCourse(event.target.value)}>
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="funding">Moliyalashtirish turi</label>
          <select id="funding" value={funding} onChange={(event) => setFunding(event.target.value)}>
            <option value="Grant">Davlat granti</option>
            <option value="Kontrakt">To‘lov-shartnoma</option>
          </select>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="btn" type="submit" disabled={pending} style={{ marginTop: "12px" }}>
        {pending ? "Yuborilmoqda..." : "Ro‘yxatdan o‘tish so‘rovini yuborish"}
      </button>

      <p className="hint" style={{ textAlign: "center", margin: "14px 0 0" }}>
        Hisobingiz bormi? <Link href="/login" style={{ fontWeight: 700 }}>Tizimga kirish</Link>
      </p>
    </form>
  );
}
