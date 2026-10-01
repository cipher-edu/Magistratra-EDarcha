"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthIllustration } from "@/components/AuthIllustration";
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
      setError("Kiritilgan parollar bir-biriga mos kelmadi.");
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
      setError(data.error || "So‘rovni yuborib bo‘lmadi.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-wrapper">
        <section className="auth-hero-pane">
          <div className="auth-hero-header">
            <Link href="/" className="auth-hero-brand">
              <ThreeDIcon kind="students" size="banner" />
              <div>
                <span className="auth-hero-tag">Magistrant Ro‘yxati</span>
                <h2>Magistratura E-Darcha</h2>
              </div>
            </Link>
          </div>
          <div className="auth-hero-content">
            <h1>So‘rovingiz qabul qilindi</h1>
            <p className="auth-hero-desc">
              Vazirlar Mahkamasining 36-son nizomiga binoan, magistrantning akkaunti
              bo‘lim ma’muri tomonidan tekshirilib tasdiqlangach faollashadi.
            </p>
            <AuthIllustration mode="register" />
          </div>
        </section>

        <section className="auth-form-pane">
          <div className="auth-form-box" style={{ textAlign: "center" }}>
            <div style={{ margin: "0 auto 16px", display: "inline-block" }}>
              <ThreeDIcon kind="APPROVED" size="hero" />
            </div>
            <h2>So‘rov muvaffaqiyatli yuborildi!</h2>
            <p className="hint" style={{ margin: "8px 0 24px" }}>
              Administrator ma’lumotlaringizni tasdiqlaganidan keyin, email va parolingiz
              orqali tizimga kirib shaxsiy reja va BMI dissertatsiyangizni yuritishingiz mumkin.
            </p>
            <Link className="auth-submit-btn" href="/login" style={{ textDecoration: "none", display: "inline-flex" }}>
              Kirish sahifasiga o‘tish
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      {/* Left Column: Registration Rules and Guidance based on Nizom */}
      <section className="auth-hero-pane">
        <div className="auth-hero-header">
          <Link href="/" className="auth-hero-brand">
            <ThreeDIcon kind="students" size="banner" />
            <div>
              <span className="auth-hero-tag">36-son Nizom Asosida</span>
              <h2>Magistratura E-Darcha</h2>
            </div>
          </Link>
        </div>

        <div className="auth-hero-content">
          <h1>Magistrant sifatida ro‘yxatdan o‘tish tartibi</h1>
          <p className="auth-hero-desc">
            Magistratura bo‘limida shaffof elektron boshqaruv va ilmiy hisobotlar yuritish uchun
            quyidagi ma’lumotlarni to‘liq va to‘g‘ri shaklda kiriting.
          </p>

          <AuthIllustration mode="register" />

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <span className="auth-feat-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <div>
                <strong>Administrator tekshiruvi</strong>
                <small>Hisob tasdiqlangach barcha modullar ochiladi</small>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="auth-feat-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4h12v12H4z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 8h12M8 4v12" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <div>
                <strong>Kafedra va mutaxassislik</strong>
                <small>Tizim tuzilmasiga muvofiq biriktiriladi</small>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-hero-foot">
          <p>© 2026 Magistratura E-Darcha ERP · Barcha huquqlar himoyalangan</p>
        </div>
      </section>

      {/* Right Column: Clean Multi-field Register Form */}
      <section className="auth-form-pane">
        <div className="auth-form-box" style={{ maxWidth: "560px" }}>
          <div className="auth-form-head">
            <span className="auth-form-badge">Yangi magistrant arizasi</span>
            <h2>Ro‘yxatdan o‘tish</h2>
            <p className="hint">Akademik ma’lumotlaringizni mos ravishda tanlang</p>
          </div>

          <form onSubmit={submit} className="auth-clean-form">
            <div className="auth-field">
              <label htmlFor="fullName">To‘liq F.I.O.</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Familiya Ism Sharifingiz"
                  required
                />
              </div>
            </div>

            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="email">Email manzil</label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="talaba@domain.uz"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="phone">Telefon raqam</label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="password">Maxfiy parol</label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    placeholder="Kamida 6 belgi"
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Yashirish" : "Ko‘rish"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="passwordConfirm">Parolni tasdiqlash</label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    id="passwordConfirm"
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    minLength={6}
                    placeholder="Qayta tering"
                    required
                  />
                </div>
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

            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="course">Ta’lim bosqichi</label>
                <select id="course" value={course} onChange={(e) => setCourse(e.target.value)}>
                  <option value="1">1-kurs magistrant</option>
                  <option value="2">2-kurs magistrant</option>
                  <option value="3">3-kurs magistrant</option>
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="funding">Moliyalashtirish turi</label>
                <select id="funding" value={funding} onChange={(e) => setFunding(e.target.value)}>
                  <option value="Grant">Davlat granti</option>
                  <option value="Kontrakt">To‘lov-shartnoma</option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="auth-error-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <button className="auth-submit-btn" type="submit" disabled={pending} style={{ marginTop: "10px" }}>
              {pending ? (
                <span>So‘rov yuborilmoqda...</span>
              ) : (
                <>
                  <span>Ro‘yxatdan o‘tish so‘rovini yuborish</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            <span>Allaqachon hisobingiz bormi?</span>
            <Link href="/login">Tizimga kirish</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
