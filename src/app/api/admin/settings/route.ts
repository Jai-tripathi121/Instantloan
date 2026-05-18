export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "postmoney@2026";

// Lazy-init Admin SDK using Application Default Credentials (ADC).
// On Firebase App Hosting / Google Cloud this works with zero extra env vars.
// Falls back to explicit service-account env vars if set.
let _db: import("firebase-admin/firestore").Firestore | null = null;

async function getDb(): Promise<import("firebase-admin/firestore").Firestore> {
  if (_db) return _db;

  const { getApps, initializeApp, cert, applicationDefault } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ) {
      // Explicit service-account credentials
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Application Default Credentials — works automatically on Firebase App Hosting
      initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    }
  }

  _db = getFirestore();
  return _db;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password: string; settings: Record<string, unknown> };

    if (body.password !== ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const { FieldValue } = await import("firebase-admin/firestore");

    const clean = Object.fromEntries(
      Object.entries(body.settings).filter(([, v]) => v !== undefined && v !== null)
    );

    await db.doc("config/global").set(
      { ...clean, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

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
  try {
    const db = await getDb();
    const snap = await db.doc("config/global").get();
    return NextResponse.json(snap.exists ? snap.data() : {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
