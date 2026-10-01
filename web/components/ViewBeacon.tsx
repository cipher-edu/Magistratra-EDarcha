"use client";

import { useEffect } from "react";

export function ViewBeacon({ path }: { path: string }) {
  useEffect(() => {
    if (!path) return;
    fetch("/api/audit/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => undefined);
  }, [path]);
  return null;
}
