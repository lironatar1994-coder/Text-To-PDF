import { readFile } from "node:fs/promises";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 4096;

async function signalKey() {
  if (process.env.VISITOR_SIGNAL_KEY?.trim()) return process.env.VISITOR_SIGNAL_KEY.trim();
  try { return (await readFile("/root/.visitor-signal-key", "utf8")).trim(); } catch { return ""; }
}

export async function POST(request: Request) {
  const requestHeaders = await headers();
  try {
    if (new URL(requestHeaders.get("origin") || "").host.toLowerCase() !== (requestHeaders.get("host") || "").toLowerCase()) {
      return NextResponse.json({ error: "Invalid signal origin" }, { status: 403 });
    }
  } catch { return NextResponse.json({ error: "Invalid signal origin" }, { status: 403 }); }
  if (Number(requestHeaders.get("content-length") || 0) > MAX_BODY_BYTES) return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
  const key = await signalKey();
  if (!key) return NextResponse.json({ error: "Signal integration is unavailable" }, { status: 503 });
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
  try { JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid signal payload" }, { status: 400 }); }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(process.env.SERVER_MONITOR_SIGNAL_URL || "http://127.0.0.1:4010/serve-monitor/api/browser-signals/site", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-Signal-Key": key,
        "X-Visitor-IP": (requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for") || "").split(",")[0].trim(),
        "X-Visitor-User-Agent": requestHeaders.get("user-agent") || "",
        "X-Visitor-Site-Url": "https://vee-app.co.il/text-to-pdf",
      },
      body: rawBody,
      signal: controller.signal,
    });
    return response.ok ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Signal rejected" }, { status: 502 });
  } catch { return NextResponse.json({ error: "Signal integration is unavailable" }, { status: 503 }); }
  finally { clearTimeout(timeout); }
}
