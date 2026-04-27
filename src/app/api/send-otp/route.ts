import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { mobile } = await req.json();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  try {
    await setDoc(doc(db, "otps", mobile), { otp, expires });
  } catch {
    return NextResponse.json({ error: "OTP storage failed" }, { status: 500 });
  }

  // Try WhatsApp first, fall back to Fast2SMS SMS
  const waSent = await sendWhatsAppOTP(mobile, otp);

  if (!waSent) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (apiKey) {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: { authorization: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          route: "q",
          message: `Your InstantLoan OTP is ${otp}. Valid 5 minutes. Do not share.`,
          language: "english",
          flash: 0,
          numbers: mobile,
        }),
      });
    }
  }

  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json({ success: true, via: waSent ? "whatsapp" : "sms", ...(isDev ? { otp } : {}) });
}
