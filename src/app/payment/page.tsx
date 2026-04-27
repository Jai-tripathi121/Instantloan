"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, Lock, CheckCircle, ChevronRight, Sparkles } from "lucide-react";

declare global {
  interface Window { Razorpay: new (o: Record<string, unknown>) => { open: () => void }; }
}

const BENEFITS = [
  "AI se aapka bank statement analyse hoga",
  "33 scheduled banks mein eligibility match",
  "Exact loan amount jo aap qualify karte ho",
  "Sabhi banks ka interest rate comparison",
  "Har bank ke liye EMI calculator",
  "Zero CIBIL impact guaranteed",
  "Instant eligibility report",
];

export default function Payment() {
  const router = useRouter();
  const { setPaymentDone, userDetails, setLastRoute } = useAppStore();
  const [loading, setLoading] = useState(false);

  async function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true); s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function handlePay() {
    setLoading(true);
    const ok = await loadRazorpay();
    if (!ok) { alert("Payment load nahi hua."); setLoading(false); return; }
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
      amount: 9900, currency: "INR", name: "InstantLoan",
      description: "AI Eligibility Report",
      prefill: { name: userDetails.name ?? "", contact: userDetails.mobile ?? "" },
      theme: { color: "#7c3aed" },
      handler: () => { setPaymentDone(true); setLastRoute("/results"); router.push("/processing"); },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open(); setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Step 4 of 4</span><span>Payment</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-full transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Report Unlock Karo</h2>
        <p className="text-gray-500 text-sm mt-1">One-time payment — aur puri zindagi ka faida</p>
      </div>

      {/* Price hero card */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #2563eb 100%)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative p-6 text-white text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Sparkles size={12} /> AI Eligibility Report
          </div>
          <div className="flex items-end justify-center gap-2 mb-1">
            <span className="text-6xl font-black">₹99</span>
            <span className="text-white/50 text-xl line-through mb-2">₹499</span>
          </div>
          <p className="text-white/70 text-xs">One-time · Non-refundable · Instant delivery</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-slate-50 rounded-2xl p-5 mb-6">
        <p className="text-sm font-black text-gray-800 mb-3">₹99 mein kya milega</p>
        <div className="space-y-2.5">
          {BENEFITS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={13} className="text-violet-600" />
              </div>
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="flex justify-center gap-3 mb-6">
        {["UPI", "Credit Card", "Debit Card", "Net Banking"].map((m) => (
          <span key={m} className="text-xs bg-gray-100 rounded-lg px-2.5 py-1.5 text-gray-500 font-semibold">{m}</span>
        ))}
      </div>

      <button onClick={handlePay} disabled={loading}
        className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? "Payment open ho rahi hai..." : (<>₹99 Pay Karo & Report Lo <ChevronRight size={22} /></>)}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Lock size={12} className="text-gray-400" />
        <p className="text-xs text-gray-400">Razorpay se secured · PCI-DSS compliant</p>
      </div>
    </div>
  );
}
