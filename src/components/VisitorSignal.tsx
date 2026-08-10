"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "text-to-pdf.monitor.visitor";
const SESSION_KEY = "text-to-pdf.monitor.session";
const LAST_KEY = "text-to-pdf.monitor.last-signal";
const TTL = 30 * 24 * 60 * 60 * 1000;

function randomId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

function visitorId() {
  try {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(VISITOR_KEY) || "null") as { id?: string; expiresAt?: number } | null;
    if (stored?.id && Number(stored.expiresAt) > now) return stored.id;
    const id = randomId();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, expiresAt: now + TTL }));
    return id;
  } catch { return randomId(); }
}

function sessionId() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch { return randomId(); }
}

export default function VisitorSignal() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    try {
      const last = JSON.parse(sessionStorage.getItem(LAST_KEY) || "null") as { path?: string; at?: number } | null;
      if (last?.path === pathname && Date.now() - Number(last.at || 0) < 3000) return;
      sessionStorage.setItem(LAST_KEY, JSON.stringify({ path: pathname, at: Date.now() }));
    } catch {}
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    void fetch("/text-to-pdf/api/visit-signal", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: randomId(), visitor_id: visitorId(), session_id: sessionId(), path: pathname, webdriver: navigator.webdriver === true }),
      signal: controller.signal,
    }).catch(() => undefined).finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [pathname]);
  return null;
}
