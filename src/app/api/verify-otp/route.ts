import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const { mobile, otp } = await req.json();

  try {
    const ref = doc(db, "otps", mobile);
    const snap = await getDoc(ref);
    if (!snap.exists()) return NextResponse.json({ error: "OTP not found" }, { status: 400 });

    const data = snap.data();
    if (Date.now() > data.expires) return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    if (data.otp !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    await deleteDoc(ref);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
