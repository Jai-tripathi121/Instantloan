import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { mobile, name, bankName, amount, referenceNo } = await req.json();

  const message =
    `✅ *InstantLoan — Application Submitted!*\n\n` +
    `Hi ${name}! Aapki loan application successfully submit ho gayi.\n\n` +
    `🏦 *Bank:* ${bankName}\n` +
    `💰 *Amount:* ₹${Number(amount).toLocaleString("en-IN")}\n` +
    `🔖 *Reference:* ${referenceNo}\n\n` +
    `Bank aapko 24-48 ghante mein contact karega.\n\n` +
    `Status track karein: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://instantloan-ten.vercel.app"}/status`;

  // Try WhatsApp first
  const waSent = await sendWhatsAppMessage(mobile, message);

  if (!waSent) {
    // Fall back to Fast2SMS
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) return NextResponse.json({ skipped: true });

    const smsText = `Hi ${name}, your loan application to ${bankName} for Rs.${Number(amount).toLocaleString("en-IN")} submitted. Ref: ${referenceNo}. Bank will contact in 24-48 hrs. - InstantLoan`;
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "q", message: smsText, language: "english", flash: 0, numbers: mobile }),
    });
    const data = await res.json();
    return NextResponse.json({ success: data.return ?? false, via: "sms" });
  }

  return NextResponse.json({ success: true, via: "whatsapp" });
}
