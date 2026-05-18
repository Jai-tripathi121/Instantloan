export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "postmoney@2026";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";

// ── Firestore REST helpers (no Admin SDK required) ─────────────────────────

function toFirestoreValue(v: unknown): Record<string, unknown> {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(v as Record<string, unknown>)
            .filter(([, val]) => val !== undefined)
            .map(([k, val]) => [k, toFirestoreValue(val)])
        ),
      },
    };
  }
  return { stringValue: String(v) };
}

function fromFirestoreValue(v: Record<string, unknown>): unknown {
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) {
    const arr = (v.arrayValue as { values?: unknown[] }).values ?? [];
    return arr.map((i) => fromFirestoreValue(i as Record<string, unknown>));
  }
  if ("mapValue" in v) {
    const fields = (v.mapValue as { fields?: Record<string, unknown> }).fields ?? {};
    return Object.fromEntries(
      Object.entries(fields).map(([k, fv]) => [k, fromFirestoreValue(fv as Record<string, unknown>)])
    );
  }
  return null;
}

async function firestoreGet(docPath: string): Promise<Record<string, unknown>> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firestore GET ${res.status}: ${await res.text()}`);
  const body = await res.json() as { fields?: Record<string, unknown> };
  if (!body.fields) return {};
  return Object.fromEntries(
    Object.entries(body.fields).map(([k, v]) => [k, fromFirestoreValue(v as Record<string, unknown>)])
  );
}

async function firestorePatch(docPath: string, fields: Record<string, unknown>): Promise<void> {
  const fieldPaths = Object.keys(fields).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}?${fieldPaths}&key=${API_KEY}`;
  const body = {
    fields: Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, toFirestoreValue(v)])
    ),
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Firestore PATCH ${res.status}: ${await res.text()}`);
}

// ── Route handlers ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password: string; settings: Record<string, unknown> };
    if (body.password !== ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!PROJECT_ID) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const clean = Object.fromEntries(
      Object.entries(body.settings).filter(([, v]) => v !== undefined)
    );
    // Add server timestamp as a string (REST API doesn't support serverTimestamp in PATCH easily)
    clean.updatedAt = new Date().toISOString();

    await firestorePatch("config/global", clean);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const pass = req.nextUrl.searchParams.get("password");
  if (pass !== ADMIN_PASS) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!PROJECT_ID) return NextResponse.json({});
  try {
    const data = await firestoreGet("config/global");
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
