"use client";

import { useEffect, useState } from "react";

const KEY = "magister-theme";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MOON = "M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z";
const SUN = "M12 3v2.2M12 18.8V21M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M3 12h2.2M18.8 12H21M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
    document.cookie = `${KEY}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  const dark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      title={dark ? "Kunduzgi rejim" : "Tungi rejim"}
    >
      <Icon d={dark ? SUN : MOON} />
    </button>
  );
}
