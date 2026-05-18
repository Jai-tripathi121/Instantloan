export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

let _db: import("firebase-admin/firestore").Firestore | null = null;
async function getDb() {
  if (_db) return _db;
  const { getApps, initializeApp, cert, applicationDefault } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  if (!getApps().length) {
    if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
    } else {
      initializeApp({ credential: applicationDefault(), projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    }
  }
  _db = getFirestore();
  return _db;
}

export async function POST(req: NextRequest) {
  const { mobile, otp } = await req.json() as { mobile: string; otp: string };

  if (!mobile || !otp) {
    return NextResponse.json({ error: "Mobile and OTP required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const ref = db.doc(`otps/${mobile}`);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "OTP not found or already used" }, { status: 400 });
    }

    const data = snap.data()!;
    if (Date.now() > data.expires) {
      await ref.delete().catch(() => {});
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });
    }

    await ref.delete().catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
