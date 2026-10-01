"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthIllustration } from "@/components/AuthIllustration";
import { ThreeDIcon } from "@/components/ThreeDIcon";
import { ViewBeacon } from "@/components/ViewBeacon";

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"ADMIN" | "MAGISTR">("ADMIN");
  const [email, setEmail] = useState("admin@magister.local");
  const [password, setPassword] = useState("Admin123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function pickDemo(r: "ADMIN" | "MAGISTR", em: string, pw: string) {
    setRoleTab(r);
    setEmail(em);
    setPassword(pw);
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      role?: string;
      accountStatus?: string;
    };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Kirib bo‘lmadi");
      return;
    }
    if (data.role !== "ADMIN" && data.accountStatus !== "ACTIVE") {
      router.push("/kutish");
    } else {
      router.push(data.role === "ADMIN" ? "/admin" : "/magistr");
    }
    router.refresh();
  }

  return (
    <div className="auth-page">
      <ViewBeacon path="/login" />
      <div className="auth-wrapper">
        {/* Left Side: System Architecture & Institutional Visuals */}
        <section className="auth-hero-pane">
          <div className="auth-hero-header">
            <Link href="/" className="auth-hero-brand">
              <ThreeDIcon kind="dashboard" size="banner" />
              <div>
                <span className="auth-hero-tag">Oliy Ta’lim Platformasi</span>
                <h2>Magistratura E-Darcha</h2>
              </div>
            </Link>
          </div>

          <div className="auth-hero-content">
            <h1>Magistratura bo‘limi faoliyatini boshqarish va monitoring tizimi</h1>
            <p className="auth-hero-desc">
              Vazirlar Mahkamasining 2015-yil 2-martdagi 36-son nizomi talablari asosida
              ilmiy tadqiqot, dissertatsiya (BMI), oylik reja va KPI ko‘rsatkichlarini
              yagona raqamli maydonda yuritish.
            </p>

            <AuthIllustration mode="login" />

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <span className="auth-feat-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2L2 6.5L10 11L18 6.5L10 2Z" />
                    <path d="M5 8.5V13.5C5 15.5 7.2 17 10 17C12.8 17 15 15.5 15 13.5V8.5" opacity="0.75" />
                  </svg>
                </span>
                <div>
                  <strong>Magistrant kabineti</strong>
                  <small>Shaxsiy reja, dissertatsiya progressi va amaliyot</small>
                </div>
              </div>

              <div className="auth-feature-item">
                <span className="auth-feat-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="3" y="10" width="3" height="7" rx="1" />
                    <rect x="8.5" y="5" width="3" height="12" rx="1" />
                    <rect x="14" y="2" width="3" height="15" rx="1" />
                  </svg>
                </span>
                <div>
                  <strong>Real vaqt KPI reytingi</strong>
                  <small>O‘quv, ilmiy (Scopus, WoS, OAK) va jamoat faoliyati</small>
                </div>
              </div>

              <div className="auth-feature-item">
                <span className="auth-feat-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2L3 5.5V10.5C3 14.8 6 17.8 10 19C14 17.8 17 14.8 17 10.5V5.5L10 2Z" />
                  </svg>
                </span>
                <div>
                  <strong>Ekspertiza va tasdiqlash</strong>
                  <small>Kommentlar bilan tasdiqlash, qaytarish va rad etish</small>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-foot">
            <p>© 2026 Magistratura E-Darcha ERP · Barcha huquqlar himoyalangan</p>
          </div>
        </section>

        {/* Right Side: Professional Enterprise Login Card */}
        <section className="auth-form-pane">
          <div className="auth-form-box">
            <div className="auth-form-head">
              <span className="auth-form-badge">Yagona hisob tizimi</span>
              <h2>Tizimga kirish</h2>
              <p className="hint">Kabinetga kirish uchun tizim ma’lumotlaringizni kiriting</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="auth-role-tabs">
              <button
                type="button"
                className={`auth-role-tab ${roleTab === "ADMIN" ? "active" : ""}`}
                onClick={() => pickDemo("ADMIN", "admin@magister.local", "Admin123!")}
              >
                <ThreeDIcon kind="dashboard" size="compact" />
                <span>Administrator</span>
              </button>
              <button
                type="button"
                className={`auth-role-tab ${roleTab === "MAGISTR" ? "active" : ""}`}
                onClick={() => pickDemo("MAGISTR", "aliyev@magister.local", "Magistr123!")}
              >
                <ThreeDIcon kind="students" size="compact" />
                <span>Magistrant</span>
              </button>
            </div>

            <form onSubmit={submit} className="auth-clean-form">
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
                    placeholder="foydalanuvchi@magister.local"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Maxfiy parol</label>
                </div>
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Parolni yashirish" : "Parolni ko‘rish"}
                    aria-label="Parol ko‘rinishini almashtirish"
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

              <button className="auth-submit-btn" type="submit" disabled={pending}>
                {pending ? (
                  <span>Tekshirilmoqda...</span>
                ) : (
                  <>
                    <span>Tizimga kirish</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>Yangi magistrantmisiz?</span>
              <Link href="/register">Ro‘yxatdan o‘tish so‘rovini yuborish</Link>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="auth-demo-pills">
              <span className="auth-demo-title">Tezkor sinov hisoblari (1-klik):</span>
              <div className="auth-pills-row">
                <button
                  type="button"
                  className="auth-pill-btn"
                  onClick={() => pickDemo("ADMIN", "admin@magister.local", "Admin123!")}
                >
                  <ThreeDIcon kind="dashboard" size="compact" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  className="auth-pill-btn"
                  onClick={() => pickDemo("MAGISTR", "aliyev@magister.local", "Magistr123!")}
                >
                  <ThreeDIcon kind="students" size="compact" />
                  <span>Aliyev A.</span>
                </button>
                <button
                  type="button"
                  className="auth-pill-btn"
                  onClick={() => pickDemo("MAGISTR", "karimova@magister.local", "Magistr123!")}
                >
                  <ThreeDIcon kind="students" size="compact" />
                  <span>Karimova D.</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
