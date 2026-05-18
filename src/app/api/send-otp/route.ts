export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

// ── Lazy Admin SDK (ADC on Firebase App Hosting, no extra env vars needed) ──
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
  const { mobile, channel = "sms" } = await req.json() as { mobile: string; channel?: "whatsapp" | "sms" };

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store OTP via Admin SDK (bypasses Firestore security rules)
  try {
    const db = await getDb();
    await db.doc(`otps/${mobile}`).set({ otp, expires });
  } catch (err) {
    console.error("[send-otp] Firestore error:", err);
    return NextResponse.json({ error: "OTP storage failed" }, { status: 500 });
  }

  let delivered = false;
  let via = "none";

  if (channel === "whatsapp") {
    delivered = await sendWhatsAppOTP(mobile, otp);
    if (delivered) via = "whatsapp";
  }

  if (!delivered) {
    // SMS via Fast2SMS
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (apiKey) {
      try {
        const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: { authorization: apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            route: "q",
            message: `Your PostMoney OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
            language: "english",
            flash: 0,
            numbers: mobile,
          }),
        });
        if (smsRes.ok) { delivered = true; via = "sms"; }
      } catch { /* ignore */ }
    }
  }

  if (!delivered) {
    // WhatsApp fallback if SMS failed or channel is default
    if (channel !== "whatsapp") {
      const waDelivered = await sendWhatsAppOTP(mobile, otp);
      if (waDelivered) { delivered = true; via = "whatsapp"; }
    }
  }

  const isDev = process.env.NODE_ENV === "development" || !delivered;
  return NextResponse.json({
    success: true,
    via,
    delivered,
    ...(isDev ? { otp } : {}), // show OTP in response if delivery not configured
  });
}
