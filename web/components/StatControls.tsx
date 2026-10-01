"use client";

import { useRouter } from "next/navigation";
import type { StatCut, StatPeriod } from "@/lib/stats";

const PERIODS: { id: StatPeriod; label: string }[] = [
  { id: "week", label: "Haftalik" },
  { id: "month", label: "Oylik" },
  { id: "quarter", label: "3 oylik" },
];

export function StatControls({
  period,
  cut,
  focus,
  options,
}: {
  period: StatPeriod;
  cut: StatCut;
  focus: string;
  options: string[];
}) {
  const router = useRouter();

  function go(next: { period?: StatPeriod; cut?: StatCut; focus?: string }) {
    const params = new URLSearchParams();
    const periodValue = next.period ?? period;
    const cutValue = next.cut ?? cut;
    const focusValue = next.focus ?? focus;
    params.set("period", periodValue);
    params.set("cut", cutValue);
    if (focusValue) params.set("focus", focusValue);
    router.push(`/admin/statistika?${params}`);
  }

  return (
    <div className="stat-controls">
      <div className="seg" role="group" aria-label="Davr">
        {PERIODS.map((item) => (
          <button key={item.id} type="button" data-active={period === item.id} onClick={() => go({ period: item.id })}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="seg" role="group" aria-label="Kesim">
        <button type="button" data-active={cut === "faculty"} onClick={() => go({ cut: "faculty", focus: "" })}>
          Fakultet
        </button>
        <button type="button" data-active={cut === "specialty"} onClick={() => go({ cut: "specialty", focus: "" })}>
          Yo‘nalish
        </button>
      </div>
      <label className="stat-focus">
        <span>{cut === "faculty" ? "Fakultet" : "Yo‘nalish"}</span>
        <select value={focus} onChange={(event) => go({ focus: event.target.value })}>
          <option value="">Barchasi</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
