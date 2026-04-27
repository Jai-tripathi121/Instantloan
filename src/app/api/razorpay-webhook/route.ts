import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    try {
      await addDoc(collection(db, "payments"), {
        razorpayPaymentId: payment.id,
        amount: payment.amount / 100,
        mobile: payment.contact,
        status: "captured",
        createdAt: new Date(),
      });
    } catch {
      return NextResponse.json({ error: "DB save failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
