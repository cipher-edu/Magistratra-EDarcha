export const NAV_GLYPH: Record<string, string> = {
  "/admin": "M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z",
  "/admin/talabalar": "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 11v6M16 14h6",
  "/admin/sorovlar": "M8 3h8l1 3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6M9 15h4",
  "/admin/arizalar": "M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5",
  "/admin/tuzilma": "M4 20V9l8-5 8 5v11M9 20v-6h6v6M4 20h16",
  "/profil": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 20a8 8 0 0 1 16 0",
  "/admin/statistika": "M4 19V9M10 19V5M16 19v-6M22 19H2",
  "/admin/audit": "M12 3 5 6v6c0 4.2 2.9 7.1 7 8.5 4.1-1.4 7-4.3 7-8.5V6zM9 12l2 2 4-4",
  "/magistr": "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  "/magistr/hujjat/yangi": "M12 5v14M5 12h14",
  "/admin/arizalar?status=SUBMITTED": "M4 13h4l2 3h4l2-3h4v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 13l2-8h12l2 8",
};

export function NavGlyph({ d }: { d: string }) {
  return (
    <svg className="nav-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
