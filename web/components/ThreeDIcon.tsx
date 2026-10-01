import React from "react";
import type { DecisionStatus } from "./DecisionMark";

export type Icon3DKind =
  | "dashboard"
  | "students"
  | "requests"
  | "documents"
  | "structure"
  | "profile"
  | "stats"
  | "audit"
  | "cabinet"
  | "new_doc"
  | "menu"
  | "article"
  | "governance"
  | "DRAFT"
  | DecisionStatus;

export function routeTo3DKind(href: string, mark?: DecisionStatus): Icon3DKind {
  if (mark) return mark;
  if (href === "/admin") return "dashboard";
  if (href.startsWith("/admin/talaba")) return "students";
  if (href.startsWith("/admin/sorov")) return "requests";
  if (href.startsWith("/admin/ariza")) return "documents";
  if (href.startsWith("/admin/tuzilma")) return "structure";
  if (href.startsWith("/admin/statistika")) return "stats";
  if (href.startsWith("/admin/audit")) return "audit";
  if (href === "/profil") return "profile";
  if (href === "/magistr/hujjat/yangi") return "new_doc";
  if (href.startsWith("/magistr")) return "cabinet";
  return "dashboard";
}

function getTopGlyph(kind: Icon3DKind) {
  switch (kind) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" />
          <rect x="11.5" y="2" width="6.5" height="6.5" rx="1.5" opacity="0.85" />
          <rect x="2" y="11.5" width="6.5" height="6.5" rx="1.5" opacity="0.85" />
          <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.5" opacity="0.7" />
        </svg>
      );
    case "students":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M10 2L2 6.5L10 11L18 6.5L10 2Z" />
          <path d="M5 8.5V13.5C5 15.5 7.2 17 10 17C12.8 17 15 15.5 15 13.5V8.5" opacity="0.75" />
          <path d="M17 7V13" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "requests":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M3 4C2.45 4 2 4.45 2 5V15C2 15.55 2.45 16 3 16H17C17.55 16 18 15.55 18 15V5C18 4.45 17.55 4 17 4H3ZM10 10.8L4.2 6.5H15.8L10 10.8ZM4 8.2L9.4 12.2C9.75 12.45 10.25 12.45 10.6 12.2L16 8.2V14.5H4V8.2Z" />
        </svg>
      );
    case "documents":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M4 2C3.4 2 3 2.4 3 3V14C3 14.6 3.4 15 4 15H13C13.6 15 14 14.6 14 14V3C14 2.4 13.6 2 13 2H4Z" />
          <path d="M6 16C6 16.6 6.4 17 7 17H16C16.6 17 17 16.6 17 16V6C17 5.4 16.6 5 16 5" opacity="0.65" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="5.5" y="5" width="6" height="1.5" rx="0.75" fill="#fff" opacity="0.9" />
          <rect x="5.5" y="8" width="6" height="1.5" rx="0.75" fill="#fff" opacity="0.9" />
          <rect x="5.5" y="11" width="4" height="1.5" rx="0.75" fill="#fff" opacity="0.9" />
        </svg>
      );
    case "structure":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M10 2L3 6V8H17V6L10 2Z" />
          <rect x="4.5" y="9.5" width="2" height="6.5" rx="0.5" />
          <rect x="9" y="9.5" width="2" height="6.5" rx="0.5" />
          <rect x="13.5" y="9.5" width="2" height="6.5" rx="0.5" />
          <rect x="2" y="16.5" width="16" height="2" rx="0.5" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <circle cx="10" cy="6.5" r="3.5" />
          <path d="M4 16.5C4 13.8 6.7 11.5 10 11.5C13.3 11.5 16 13.8 16 16.5V17H4V16.5Z" />
        </svg>
      );
    case "stats":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <rect x="3" y="10" width="3" height="7" rx="1" />
          <rect x="8.5" y="5" width="3" height="12" rx="1" />
          <rect x="14" y="2" width="3" height="15" rx="1" />
        </svg>
      );
    case "audit":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M10 2L3 5.5V10.5C3 14.8 6 17.8 10 19C14 17.8 17 14.8 17 10.5V5.5L10 2Z" />
          <path d="M7.5 10.2L9.2 11.9L12.8 8.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "cabinet":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M10 2.5L2.5 8.5V17C2.5 17.5 2.9 18 3.5 18H8V12H12V18H16.5C17.1 18 17.5 17.5 17.5 17V8.5L10 2.5Z" />
        </svg>
      );
    case "new_doc":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <circle cx="10" cy="10" r="7.5" opacity="0.3" />
          <path d="M10 5.5V14.5M5.5 10H14.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="i3d-svg">
          <path d="M3 5H17M3 10H17M3 15H17" />
        </svg>
      );
    case "SUBMITTED":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M3 10L10 3L17 10L14 10V16H6V10H3Z" />
        </svg>
      );
    case "IN_REVIEW":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="i3d-svg">
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5L18 18" />
        </svg>
      );
    case "REVISION":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="i3d-svg">
          <path d="M3 10A7 7 0 1 0 5 5L3 7" />
          <path d="M3 3V7H7" />
        </svg>
      );
    case "APPROVED":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="i3d-svg">
          <path d="M4 10.5L8.5 15L16 5.5" />
        </svg>
      );
    case "DRAFT":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    case "REJECTED":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="i3d-svg">
          <path d="M5 5L15 15M15 5L5 15" />
        </svg>
      );
    case "article":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      );
    case "governance":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="i3d-svg">
          <path fillRule="evenodd" d="M10 2l-7 3.111v4.445c0 4.632 3.033 8.977 7 10.444 3.967-1.467 7-5.812 7-10.444V5.111L10 2zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
  }
}

export function ThreeDIcon({
  kind,
  size = "nav",
  className = "",
}: {
  kind: Icon3DKind;
  size?: "nav" | "compact" | "hero" | "banner";
  className?: string;
}) {
  return (
    <span className={`i3d-wrap size-${size} ${className}`} data-kind={kind} aria-hidden="true">
      <span className="i3d-shadow" />
      <span className="i3d-body">
        <span className="i3d-depth depth-edge" />
        <span className="i3d-depth depth-side" />
        <span className="i3d-top">
          <span className="i3d-gloss" />
          <span className="i3d-glyph">{getTopGlyph(kind)}</span>
        </span>
      </span>
    </span>
  );
}
