"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginAvatar } from "@/components/LoginAvatar";
import { ViewBeacon } from "@/components/ViewBeacon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@magister.local");
  const [password, setPassword] = useState("Admin123!");
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
        <LoginAvatar look={email.length / 2} covered={covered} />
        <div className="brand">
          <span className="mark">M</span>
          <div>
            <p className="eyebrow">Magistratura</p>
            <strong>Boshqaruv tizimi</strong>
          </div>
        </div>
        <h1>Kirish</h1>
        <p className="lede">Talaba o‘z hujjatini yuboradi. Admin uni komment bilan qabul qiladi, rad etadi yoki qayta tahrirga yuboradi.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onFocus={() => setCovered(false)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Parol</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={() => setCovered(true)}
            onBlur={() => setCovered(false)}
            required
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={pending}>
          Kirish
        </button>
        <p className="hint">
          Hisobingiz yo‘qmi? <Link href="/register">Ro‘yxatdan o‘tish</Link>
        </p>
        <div className="accounts">
          <div>Admin: admin@magister.local / Admin123!</div>
          <div>Talaba: aliyev@magister.local / Magistr123!</div>
          <div>Talaba: karimova@magister.local / Magistr123!</div>
        </div>
      </form>
    </div>
  );
}
