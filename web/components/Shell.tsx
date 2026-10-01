"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { DecisionStatus } from "./DecisionMark";
import { ThreeDIcon, routeTo3DKind } from "./ThreeDIcon";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./LogoutButton";
import { ViewBeacon } from "./ViewBeacon";
import type { Role } from "@/lib/db";

export function Shell({
  role,
  name,
  active,
  title,
  children,
}: {
  role: Role;
  name: string;
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const groups: { label: string; links: { href: string; label: string; mark?: DecisionStatus }[] }[] =
    role === "ADMIN"
      ? [
          {
            label: "Panel",
            links: [
              { href: "/admin", label: "Boshqaruv paneli" },
              { href: "/admin/talabalar", label: "Talabalar reestri" },
              { href: "/admin/sorovlar", label: "Ro‘yxat so‘rovlari" },
              { href: "/admin/arizalar", label: "Arizalar" },
              { href: "/admin/tuzilma", label: "Tuzilma" },
              { href: "/profil", label: "Profil" },
            ],
          },
          {
            label: "Tahlil",
            links: [
              { href: "/admin/statistika", label: "Statistika" },
              { href: "/admin/audit", label: "Audit" },
            ],
          },
          {
            label: "Qarorlar",
            links: [
              { href: "/admin/arizalar?status=SUBMITTED", label: "Yuborilganlar", mark: "SUBMITTED" },
              { href: "/admin/arizalar?status=IN_REVIEW", label: "Ko‘rib chiqilmoqda", mark: "IN_REVIEW" },
              { href: "/admin/arizalar?status=REVISION", label: "Qayta ishlash", mark: "REVISION" },
              { href: "/admin/arizalar?status=APPROVED", label: "Qabul qilingan", mark: "APPROVED" },
              { href: "/admin/arizalar?status=REJECTED", label: "Rad etilgan", mark: "REJECTED" },
            ],
          },
        ]
      : [
          {
            label: "Kabinet",
            links: [
              { href: "/magistr", label: "Kabinet" },
              { href: "/magistr/hujjat/yangi", label: "Ariza yuborish" },
              { href: "/profil", label: "Profil" },
            ],
          },
        ];
  const tabs =
    role === "ADMIN"
      ? [
          { href: "/admin", label: "Panel" },
          { href: "/admin/talabalar", label: "Talabalar" },
          { href: "/admin/arizalar", label: "Arizalar" },
          { href: "/admin/arizalar?status=SUBMITTED", label: "Navbat" },
        ]
      : [
          { href: "/magistr", label: "Kabinet" },
          { href: "/magistr/hujjat/yangi", label: "Ariza" },
          { href: "/profil", label: "Profil" },
        ];

  return (
    <div className={open ? "erp menu-open" : "erp"}>
      {open ? <button className="nav-backdrop" type="button" aria-label="Menyuni yopish" onClick={() => setOpen(false)} /> : null}
      <aside className={open ? "nav open" : "nav"}>
        <div className="nav-head">
          <Link href={role === "ADMIN" ? "/admin" : "/magistr"} className="brand" onClick={() => setOpen(false)}>
            <ThreeDIcon kind="dashboard" size="nav" />
            <span>
              <strong>Magistratura</strong>
              <small>E-DARCHA ERP</small>
            </span>
          </Link>
          <button className="nav-close" type="button" aria-label="Yopish" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <nav>
          {groups.map((group) => (
            <div key={group.label} className="nav-block">
              <p className="nav-group">{group.label}</p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={link.mark ? "nav-item nav-decision" : "nav-item"}
                  data-active={active === link.href}
                  onClick={() => setOpen(false)}
                >
                  <ThreeDIcon kind={routeTo3DKind(link.href, link.mark)} size="nav" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="menu-toggle" type="button" aria-label="Menyu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <span />
            <span />
            <span />
          </button>
          <div className="top-title">
            <p className="crumb">Magistratura bo‘limi</p>
            <h1>{title}</h1>
          </div>
          <div className="top-user">
            <div>
              <strong>{name}</strong>
              <span>{role === "ADMIN" ? "Administrator" : "Magistr"}</span>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <ViewBeacon path={pathname} />
        <div className="content">{children}</div>
      </div>
      <nav className="tabbar" aria-label="Pastki menyu">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} data-active={active === tab.href}>
            <ThreeDIcon kind={routeTo3DKind(tab.href)} size="compact" />
            <span>{tab.label}</span>
          </Link>
        ))}
        <button type="button" onClick={() => setOpen(true)}>
          <ThreeDIcon kind="menu" size="compact" />
          <span>Menyu</span>
        </button>
      </nav>
    </div>
  );
}
