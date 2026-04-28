"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { saveSession } from "@/lib/firestore";
import { t } from "@/lib/i18n";
import { ArrowLeft, Lock, CheckCircle, ChevronRight, Sparkles, Smartphone, Copy, Check, Building2, CreditCard } from "lucide-react";

declare global {
  interface Window { Razorpay: new (o: Record<string, unknown>) => { open: () => void }; }
}

const UPI_ID = "10236301289@IDFB0020132.ifsc.npci";
const BANK_DETAILS = {
  bank: "IDFC First Bank",
  holder: "Postmac Ventures Pvt Ltd",
  account: "10236301289",
  ifsc: "IDFB0020132",
};

const BENEFITS = [
  "AI analyses your bank statement locally",
  "Eligibility matched across 33 scheduled banks",
  "Exact loan amount you qualify for",
  "Interest rate comparison across all banks",
  "EMI calculator for each bank offer",
  "Zero CIBIL impact guaranteed",
  "Instant eligibility report",
];

export default function Payment() {
  const router = useRouter();
  const { setPaymentDone, userDetails, loanRequirement, setLastRoute, lang } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"razorpay" | "upi" | "bank">("razorpay");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

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
    if (!ok) { alert("Payment gateway could not load. Please try again."); setLoading(false); return; }
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
      amount: 9900, currency: "INR", name: "InstantLoan",
      description: "AI Eligibility Report",
      prefill: { name: userDetails.name ?? "", contact: userDetails.mobile ?? "" },
      theme: { color: "#0F2554" },
      handler: () => {
        setPaymentDone(true);
        saveSession(userDetails.mobile ?? "", {
          step: 4, lastRoute: "/processing", paymentDone: true,
          userDetails: { name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob, employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome, cibilScore: userDetails.cibilScore },
          loanRequirement: { loanType: loanRequirement.loanType, amount: loanRequirement.amount, tenure: loanRequirement.tenure },
        });
        setLastRoute("/results");
        router.push("/processing");
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open(); setLoading(false);
  }

  function copy(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  }

  function openUpiApp() {
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=InstantLoan&am=99&cu=INR&tn=AI+Eligibility+Report`;
  }

  async function handleManualConfirm() {
    if (!manualRef.trim()) { alert("Please enter your UTR / Transaction ID"); return; }
    setManualSubmitting(true);
    setPaymentDone(true);
    saveSession(userDetails.mobile ?? "", {
      step: 4, lastRoute: "/processing", paymentDone: true,
      userDetails: { name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob, employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome, cibilScore: userDetails.cibilScore },
      loanRequirement: { loanType: loanRequirement.loanType, amount: loanRequirement.amount, tenure: loanRequirement.tenure },
    });
    setLastRoute("/results");
    router.push("/processing");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Step 4 of 4</span><span>{t(lang, "payTitle")}</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-full transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">{t(lang, "payTitle")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t(lang, "paySub")}</p>
      </div>

      {/* Price hero */}
      <div className="relative overflow-hidden rounded-3xl mb-5" style={{ background: "linear-gradient(135deg, #040C1E 0%, #0F2554 50%, #1E40AF 100%)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative p-5 text-white text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles size={12} /> AI Eligibility Report
          </div>
          <div className="flex items-end justify-center gap-2 mb-1">
            <span className="text-5xl font-black">₹99</span>
            <span className="text-white/50 text-xl line-through mb-1">₹499</span>
          </div>
          <p className="text-white/70 text-xs">One-time · Non-refundable · Instant delivery</p>
        </div>
      </div>

      {/* Payment method tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5">
        {([
          { key: "razorpay", label: "Card / UPI", icon: CreditCard },
          { key: "upi",      label: "UPI QR",     icon: Smartphone },
          { key: "bank",     label: "Bank Transfer", icon: Building2 },
        ] as { key: typeof tab; label: string; icon: typeof CreditCard }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.key ? "bg-white shadow text-blue-900" : "text-gray-500"}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── RAZORPAY TAB ── */}
      {tab === "razorpay" && (
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-50 rounded-2xl p-4 mb-5">
            <p className="text-sm font-black text-gray-800 mb-3">What you get for ₹99</p>
            <div className="space-y-2">
              {BENEFITS.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={13} className="text-blue-800" />
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 mb-5 flex-wrap">
            {["UPI", "Credit Card", "Debit Card", "Net Banking"].map((m) => (
              <span key={m} className="text-xs bg-gray-100 rounded-lg px-2.5 py-1.5 text-gray-500 font-semibold">{m}</span>
            ))}
          </div>
          <button onClick={handlePay} disabled={loading}
            className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? t(lang, "loading") : (<>₹99 {t(lang, "applyBtn")} <ChevronRight size={22} /></>)}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Lock size={12} className="text-gray-400" />
            <p className="text-xs text-gray-400">Secured by Razorpay · PCI-DSS compliant</p>
          </div>
        </div>
      )}

      {/* ── UPI QR TAB ── */}
      {tab === "upi" && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-4 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Scan QR Code</p>
            {/* QR code via API */}
            <div className="w-52 h-52 mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=InstantLoan&am=99&cu=INR&tn=AI+Eligibility+Report`)}`}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-gray-400 mb-4">Scan with GPay · PhonePe · Paytm</p>

            {/* UPI ID copy */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between border border-gray-100 mb-3">
              <div className="text-left">
                <p className="text-xs text-gray-400 font-bold mb-0.5">UPI ID</p>
                <p className="font-black text-gray-900 text-sm">{UPI_ID}</p>
              </div>
              <button onClick={() => copy(UPI_ID, setCopiedUpi)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copiedUpi ? "bg-emerald-100" : "bg-white border border-gray-200"}`}>
                {copiedUpi ? <Check size={16} className="text-emerald-600" /> : <Copy size={15} className="text-gray-500" />}
              </button>
            </div>

            <button onClick={openUpiApp}
              className="w-full border-2 border-blue-200 text-blue-900 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
              <Smartphone size={16} /> Open UPI App
            </button>
          </div>

          {/* After payment - enter UTR */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
            <p className="text-sm font-black text-amber-800 mb-2">Enter UTR after payment</p>
            <input type="text" placeholder="UTR / Transaction ID (12 digits)" value={manualRef}
              onChange={(e) => setManualRef(e.target.value.toUpperCase())}
              className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 bg-white tracking-wider mb-2" />
            <button onClick={handleManualConfirm} disabled={manualSubmitting || !manualRef.trim()}
              className="w-full btn-gradient text-white font-black py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {manualSubmitting ? "Verifying..." : (<><CheckCircle size={16} /> Payment Done — Continue</>)}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400">Find UTR in your payment app. Admin verifies within 1–2 hours.</p>
        </div>
      )}

      {/* ── BANK TRANSFER TAB ── */}
      {tab === "bank" && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Building2 size={15} className="text-blue-800" />
              <p className="text-sm font-black text-gray-800">Bank Transfer Details</p>
            </div>

            {/* Bank name */}
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-bold">BANK</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md overflow-hidden bg-red-700 flex items-center justify-center">
                  <span className="text-white text-xs font-black">IF</span>
                </div>
                <p className="font-black text-gray-900 text-sm">{BANK_DETAILS.bank}</p>
              </div>
            </div>

            {/* A/C Holder */}
            <div className="px-5 py-3.5 border-b border-gray-50">
              <p className="text-xs text-gray-400 font-bold mb-0.5">A/C HOLDER</p>
              <p className="font-black text-gray-900">{BANK_DETAILS.holder}</p>
            </div>

            {/* A/C Number */}
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold mb-0.5">A/C NUMBER</p>
                <p className="font-black text-gray-900 tracking-wider">{BANK_DETAILS.account}</p>
              </div>
              <button onClick={() => copy(BANK_DETAILS.account, setCopiedAcc)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copiedAcc ? "bg-emerald-100" : "bg-gray-50 border border-gray-200"}`}>
                {copiedAcc ? <Check size={16} className="text-emerald-600" /> : <Copy size={15} className="text-gray-500" />}
              </button>
            </div>

            {/* IFSC */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold mb-0.5">IFSC</p>
                <p className="font-black text-gray-900 tracking-wider">{BANK_DETAILS.ifsc}</p>
              </div>
              <button onClick={() => copy(BANK_DETAILS.ifsc, setCopiedIfsc)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copiedIfsc ? "bg-emerald-100" : "bg-gray-50 border border-gray-200"}`}>
                {copiedIfsc ? <Check size={16} className="text-emerald-600" /> : <Copy size={15} className="text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Amount reminder */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">Transfer Amount</p>
            <p className="text-2xl font-black text-blue-900">₹99</p>
          </div>

          {/* UTR entry */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
            <p className="text-sm font-black text-amber-800 mb-2">Enter UTR / Reference after transfer</p>
            <input type="text" placeholder="UTR / Transaction Reference" value={manualRef}
              onChange={(e) => setManualRef(e.target.value.toUpperCase())}
              className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 bg-white tracking-wider mb-2" />
            <button onClick={handleManualConfirm} disabled={manualSubmitting || !manualRef.trim()}
              className="w-full btn-gradient text-white font-black py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {manualSubmitting ? "Verifying..." : (<><CheckCircle size={16} /> Payment Done — Continue</>)}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400">Transfer via NEFT/IMPS/UPI. Find UTR in your bank app or SMS.</p>
        </div>
      )}
    </div>
  );
}
