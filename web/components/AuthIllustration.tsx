import React from "react";

export function AuthIllustration({ mode = "login" }: { mode?: "login" | "register" }) {
  return (
    <div className="auth-hero-visual" aria-hidden="true">
      <svg
        className="auth-hero-svg"
        viewBox="0 0 540 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--panel)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--panel)" stopOpacity="0.8" />
          </linearGradient>
          <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#7c3aed" floodOpacity="0.18" />
          </filter>
          <filter id="floatShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Background Decorative Grid Elements */}
        <g opacity="0.4">
          <circle cx="270" cy="230" r="180" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="270" cy="230" r="130" stroke="var(--line)" strokeWidth="1.5" />
          <circle cx="270" cy="230" r="70" stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4" />
        </g>

        {/* Central University / Platform Core Hub */}
        <g filter="url(#heroShadow)">
          <rect x="140" y="100" width="260" height="190" rx="20" fill="url(#cardGrad)" stroke="var(--line)" strokeWidth="1.5" />
          
          {/* Header Bar of the Mock Portal */}
          <rect x="140" y="100" width="260" height="38" rx="20" fill="url(#heroGrad1)" />
          <rect x="140" y="124" width="260" height="14" fill="url(#heroGrad1)" />
          
          {/* Mock Browser Dots */}
          <circle cx="162" cy="119" r="4" fill="#ffffff" opacity="0.9" />
          <circle cx="174" cy="119" r="4" fill="#ffffff" opacity="0.6" />
          <circle cx="186" cy="119" r="4" fill="#ffffff" opacity="0.4" />
          
          <rect x="220" y="113" width="100" height="12" rx="6" fill="#ffffff" opacity="0.25" />

          {/* Academic Portal Emblem / Graduation Cap */}
          <g transform="translate(235, 148)">
            <path d="M35 8L5 22L35 36L65 22L35 8Z" fill="#7c3aed" />
            <path d="M18 28.5V42C18 47.5 25.5 52 35 52C44.5 52 52 47.5 52 42V28.5" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
            <path d="M62 23V40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="62" cy="42" r="2.5" fill="#f59e0b" />
          </g>

          {/* Internal Progress & KPI Bars */}
          <rect x="165" y="215" width="210" height="7" rx="3.5" fill="var(--track)" />
          <rect x="165" y="215" width="158" height="7" rx="3.5" fill="url(#heroGrad1)" />

          <g transform="translate(165, 236)">
            <rect x="0" y="0" width="62" height="36" rx="8" fill="var(--accent-soft)" />
            <rect x="8" y="8" width="34" height="6" rx="3" fill="#7c3aed" opacity="0.5" />
            <rect x="8" y="18" width="46" height="10" rx="3" fill="#7c3aed" />

            <rect x="74" y="0" width="62" height="36" rx="8" fill="var(--ok-soft)" />
            <rect x="82" y="8" width="34" height="6" rx="3" fill="#16a34a" opacity="0.5" />
            <rect x="82" y="18" width="46" height="10" rx="3" fill="#16a34a" />

            <rect x="148" y="0" width="62" height="36" rx="8" fill="var(--wait-soft)" />
            <rect x="156" y="8" width="34" height="6" rx="3" fill="#d97706" opacity="0.5" />
            <rect x="156" y="18" width="46" height="10" rx="3" fill="#d97706" />
          </g>
        </g>

        {/* Floating Card 1: 36-son Nizom & Monitoring Badge (Top Right) */}
        <g filter="url(#floatShadow)" transform="translate(340, 50)">
          <rect width="165" height="68" rx="14" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.2" />
          <circle cx="30" cy="34" r="16" fill="var(--accent-soft)" />
          <path d="M25 34L28.5 37.5L35 30.5" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="56" y="28" fill="var(--ink)" fontSize="12" fontWeight="700" fontFamily="sans-serif">36-son Nizom</text>
          <text x="56" y="44" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="sans-serif">Monitoring mezonlari</text>
        </g>

        {/* Floating Card 2: BMI & Ilmiy tadqiqot (Bottom Left) */}
        <g filter="url(#floatShadow)" transform="translate(35, 260)">
          <rect width="180" height="74" rx="14" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.2" />
          <circle cx="32" cy="37" r="16" fill="var(--ok-soft)" />
          <path d="M26 43V31C26 31 28 29 32 29C36 29 38 31 38 31V43" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          <text x="58" y="30" fill="var(--ink)" fontSize="12" fontWeight="700" fontFamily="sans-serif">BMI & Dissertatsiya</text>
          <text x="58" y="45" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="sans-serif">68% tayyorgarlik darajasi</text>
          <rect x="58" y="52" width="105" height="5" rx="2.5" fill="var(--track)" />
          <rect x="58" y="52" width="71" height="5" rx="2.5" fill="#16a34a" />
        </g>

        {/* Floating Card 3: Workflow Tasdiq Holati (Bottom Right) */}
        <g filter="url(#floatShadow)" transform="translate(330, 310)">
          <rect width="175" height="68" rx="14" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.2" />
          <circle cx="30" cy="34" r="16" fill="var(--wait-soft)" />
          <path d="M30 25V35L35 38" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="56" y="28" fill="var(--ink)" fontSize="12" fontWeight="700" fontFamily="sans-serif">Hujjatlar navbati</text>
          <text x="56" y="44" fill="var(--muted)" fontSize="10" fontWeight="500" fontFamily="sans-serif">Shaffof ekspertiza</text>
        </g>

        {/* Subtle Connecting Pulsing Nodes */}
        <g opacity="0.6">
          <line x1="340" y1="110" x2="310" y2="130" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="180" y1="260" x2="200" y2="240" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="360" y1="310" x2="330" y2="270" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
}
