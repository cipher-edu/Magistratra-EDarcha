"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginAvatar } from "@/components/LoginAvatar";
import { ThreeDIcon } from "@/components/ThreeDIcon";
import { ViewBeacon } from "@/components/ViewBeacon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@magister.local");
  const [password, setPassword] = useState("Admin123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [covered, setCovered] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; role?: string; accountStatus?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Kirib bo‘lmadi");
      return;
    }
    if (data.role !== "ADMIN" && data.accountStatus !== "ACTIVE") router.push("/kutish");
    else router.push(data.role === "ADMIN" ? "/admin" : "/magistr");
    router.refresh();
  }

  return (
    <div className="login-screen">
      <ViewBeacon path="/login" />
      <form className="login-card" onSubmit={submit}>
        <LoginAvatar look={email.length} covered={covered} peeking={showPassword} />

        <div className="brand" style={{ justifyContent: "center", marginBottom: "8px" }}>
          <ThreeDIcon kind="dashboard" size="compact" />
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Magistratura ERP</p>
            <strong>E-Darcha tizimi</strong>
          </div>
        </div>

        <h1 style={{ textAlign: "center" }}>Tizimga kirish</h1>
        <p className="lede" style={{ textAlign: "center", marginBottom: "18px" }}>
          Talaba o‘z hujjatlarini yuboradi, bo‘lim ma’muri esa monitoring va baholash olib boradi.
        </p>

        <div className="field">
          <label htmlFor="email">Email manzil</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={() => setCovered(false)}
            placeholder="namuna@magister.local"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Maxfiy parol</label>
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
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="pw-toggle-btn"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? "Parolni yashirish" : "Parolni ko‘rish"}
              aria-label="Parol ko‘rinishini o‘zgartirish"
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

        {error ? <p className="error">{error}</p> : null}

        <button className="btn" type="submit" disabled={pending} style={{ marginTop: "8px" }}>
          {pending ? "Tekshirilmoqda..." : "Kirish"}
        </button>

        <p className="hint" style={{ textAlign: "center", margin: "14px 0 10px" }}>
          Hisobingiz yo‘qmi? <Link href="/register" style={{ fontWeight: 700 }}>Ro‘yxatdan o‘tish</Link>
        </p>

        <div className="accounts">
          <strong>Demo sinov hisoblari:</strong>
          <div>🔑 <strong>Admin:</strong> admin@magister.local / Admin123!</div>
          <div>🎓 <strong>Talaba:</strong> aliyev@magister.local / Magistr123!</div>
          <div>🎓 <strong>Talaba:</strong> karimova@magister.local / Magistr123!</div>
        </div>
      </form>
    </div>
  );
}
