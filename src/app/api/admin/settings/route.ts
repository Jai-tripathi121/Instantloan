export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "postmoney@2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password: string; settings: Record<string, unknown> };

    if (body.password !== ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Strip undefined / null values before saving
    const clean = Object.fromEntries(
      Object.entries(body.settings).filter(([, v]) => v !== undefined && v !== null)
    );

    await adminDb.doc("config/global").set(
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
    const snap = await adminDb.doc("config/global").get();
    return NextResponse.json(snap.exists ? snap.data() : {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
