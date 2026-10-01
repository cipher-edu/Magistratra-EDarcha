"use client";

import React from "react";

export function LoginAvatar({
  look = 0,
  covered = false,
  peeking = false,
}: {
  look?: number;
  covered?: boolean;
  peeking?: boolean;
}) {
  // Clamp look value between -10 and 10 for smooth horizontal eye tracking
  const lookX = Math.max(-8, Math.min(8, (look - 10) * 0.7));
  const lookY = covered ? 0 : 3.5;

  let stateClass = "login-yeti";
  if (covered && peeking) {
    stateClass += " is-peeking";
  } else if (covered) {
    stateClass += " is-covered";
  }

  return (
    <div className={stateClass} aria-label="Interaktiv login qahramoni" role="img">
      <svg
        className="yeti-svg"
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ambient Halo / Backdrop */}
        <circle cx="110" cy="110" r="102" className="yeti-halo" />

        {/* Torso / Shoulders */}
        <path
          d="M44 175 C52 145, 78 135, 110 135 C142 135, 168 145, 176 175 C180 190, 168 206, 150 206 H70 C52 206, 40 190, 44 175 Z"
          className="yeti-fur-body"
        />

        {/* Left Ear */}
        <g className="yeti-ear-left">
          <circle cx="56" cy="74" r="18" className="yeti-fur-main" />
          <circle cx="56" cy="74" r="11" className="yeti-inner-ear" />
        </g>

        {/* Right Ear */}
        <g className="yeti-ear-right">
          <circle cx="164" cy="74" r="18" className="yeti-fur-main" />
          <circle cx="164" cy="74" r="11" className="yeti-inner-ear" />
        </g>

        {/* Head Base & Tufts */}
        <path
          d="M62 108 
             C56 82, 70 52, 95 44 
             C100 42, 105 35, 110 35 
             C115 35, 120 42, 125 44 
             C150 52, 164 82, 158 108 
             C155 125, 146 148, 110 148 
             C74 148, 65 125, 62 108 Z"
          className="yeti-fur-main"
        />

        {/* Forehead Fluff Highlight */}
        <path
          d="M88 56 C98 50, 122 50, 132 56 C124 53, 96 53, 88 56 Z"
          className="yeti-fur-light"
        />

        {/* Snout / Muzzle */}
        <ellipse cx="110" cy="116" rx="28" ry="20" className="yeti-snout" />

        {/* Nose */}
        <path
          d="M103 109 C103 107, 107 105, 110 105 C113 105, 117 107, 117 109 C117 113, 113 116, 110 116 C107 116, 103 113, 103 109 Z"
          className="yeti-nose"
        />

        {/* Mouth / Smile */}
        <path
          d="M102 123 C106 127, 114 127, 118 123"
          className="yeti-mouth"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Eyes Group */}
        <g className="yeti-eyes">
          {/* Left Eye */}
          <g className="yeti-eye-left">
            <ellipse cx="88" cy="94" rx="10" ry="11" className="yeti-eye-white" />
            <g
              className="yeti-pupil-group"
              style={{
                transform: `translate(${lookX}px, ${lookY}px)`,
                transition: "transform 0.16s ease-out",
              }}
            >
              <circle cx="88" cy="94" r="5.5" className="yeti-pupil" />
              <circle cx="86" cy="92" r="1.8" fill="#ffffff" />
            </g>
            {/* Sleeping / Closed Eye Arc (shown when covered and not peeking) */}
            <path
              d="M80 95 C84 99, 92 99, 96 95"
              className="yeti-eye-closed"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Right Eye */}
          <g className="yeti-eye-right">
            <ellipse cx="132" cy="94" rx="10" ry="11" className="yeti-eye-white" />
            <g
              className="yeti-pupil-group"
              style={{
                transform: `translate(${lookX}px, ${lookY}px)`,
                transition: "transform 0.16s ease-out",
              }}
            >
              <circle cx="132" cy="94" r="5.5" className="yeti-pupil" />
              <circle cx="130" cy="92" r="1.8" fill="#ffffff" />
            </g>
            {/* Sleeping / Closed Eye Arc (shown when covered and not peeking) */}
            <path
              d="M124 95 C128 99, 136 99, 140 95"
              className="yeti-eye-closed"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Interactive Paws / Arms */}
        {/* Left Paw */}
        <g className="yeti-paw yeti-paw-left">
          <ellipse cx="78" cy="180" rx="22" ry="16" className="yeti-paw-base" />
          <ellipse cx="78" cy="180" rx="14" ry="9" className="yeti-paw-pad" />
          <circle cx="68" cy="170" r="3.5" className="yeti-paw-toe" />
          <circle cx="78" cy="167" r="3.5" className="yeti-paw-toe" />
          <circle cx="88" cy="170" r="3.5" className="yeti-paw-toe" />
        </g>

        {/* Right Paw */}
        <g className="yeti-paw yeti-paw-right">
          <ellipse cx="142" cy="180" rx="22" ry="16" className="yeti-paw-base" />
          <ellipse cx="142" cy="180" rx="14" ry="9" className="yeti-paw-pad" />
          <circle cx="132" cy="170" r="3.5" className="yeti-paw-toe" />
          <circle cx="142" cy="167" r="3.5" className="yeti-paw-toe" />
          <circle cx="152" cy="170" r="3.5" className="yeti-paw-toe" />
        </g>
      </svg>
    </div>
  );
}
