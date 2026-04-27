"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAppStore, BankOffer } from "@/lib/store";
import { CheckCircle, Share2, TrendingDown, ChevronRight, Award, Sparkles } from "lucide-react";
import BankLogo from "@/components/BankLogo";

const LOGO_BASE = "https://raw.githubusercontent.com/praveenpuglia/indian-banks/master/assets/logos";
const DEMO_OFFERS: BankOffer[] = [
  { bankName: "Axis Bank",  logo: "AXIS", logoUrl: `${LOGO_BASE}/utib/symbol.svg`, approvedAmount: 420000, interestRate: 10.49, tenure: 36, emi: 13655, processingFee: 6300, color: "#7F1D1D" },
  { bankName: "HDFC Bank",  logo: "HDFC", logoUrl: `${LOGO_BASE}/hdfc/symbol.svg`, approvedAmount: 450000, interestRate: 10.50, tenure: 36, emi: 14619, processingFee: 6750, color: "#004C8F" },
  { bankName: "PNB",        logo: "PNB",  logoUrl: `${LOGO_BASE}/punb/symbol.svg`, approvedAmount: 400000, interestRate: 10.40, tenure: 36, emi: 13100, processingFee: 4000, color: "#1D4ED8" },
  { bankName: "ICICI Bank", logo: "ICI",  logoUrl: `${LOGO_BASE}/icic/symbol.svg`, approvedAmount: 480000, interestRate: 10.75, tenure: 36, emi: 15630, processingFee: 9600, color: "#D97706" },
  { bankName: "SBI",        logo: "SBI",  logoUrl: `${LOGO_BASE}/sbin/symbol.svg`, approvedAmount: 400000, interestRate: 11.15, tenure: 36, emi: 13100, processingFee: 4000, color: "#1E3A8A" },
];

function BankCard({ offer, rank, onApply }: { offer: BankOffer; rank: number; onApply: () => void }) {
  const isTop = rank === 0;
  return (
    <div className={`rounded-2xl overflow-hidden border-2 transition-all card-hover ${isTop ? "border-violet-200 shadow-lg shadow-violet-100" : "border-gray-100"}`}>
      {/* Bank header */}
      <div className="flex items-center justify-between p-4 pb-3" style={{ background: `${offer.color}15` }}>
        <div className="flex items-center gap-3">
          <BankLogo logoUrl={offer.logoUrl} logo={offer.logo} color={offer.color} size={44} />
          <div>
            <p className="font-black text-gray-900">{offer.bankName}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle size={11} /> Pre-Approved
            </div>
          </div>
        </div>
        {isTop && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-2.5 py-1 rounded-full">
            <Award size={11} /> Best Rate
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 pt-3 bg-white">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Approved Amount</p>
            <p className="text-2xl font-black text-gray-900">₹{offer.approvedAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Interest Rate</p>
            <div className="flex items-center gap-1 justify-end">
              <TrendingDown size={14} className="text-emerald-500" />
              <p className="text-2xl font-black text-emerald-600">{offer.interestRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-violet-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-violet-400 mb-0.5">EMI/Month</p>
            <p className="text-sm font-black text-violet-700">₹{offer.emi.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-blue-400 mb-0.5">Tenure</p>
            <p className="text-sm font-black text-blue-700">{offer.tenure >= 12 ? `${Math.round(offer.tenure / 12)} yr` : `${offer.tenure}m`}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-amber-400 mb-0.5">Proc. Fee</p>
            <p className="text-sm font-black text-amber-700">₹{offer.processingFee.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <button onClick={onApply}
          className={`w-full font-black py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${isTop ? "btn-gradient text-white" : "bg-gray-900 text-white"}`}>
          {offer.bankName} mein Apply Karo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ResultsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { bankOffers, statementAnalysis, userDetails, setSelectedBank, setBankOffers, setLastRoute } = useAppStore();

  useEffect(() => {
    setLastRoute("/results");
    if (params.get("demo") === "1" && bankOffers.length === 0) setBankOffers(DEMO_OFFERS);
  }, []);

  const income = statementAnalysis?.avgMonthlyIncome ?? userDetails.monthlyIncome ?? 50000;
  const foir = statementAnalysis?.foir ?? 0.2;

  function handleApply(offer: BankOffer) { setSelectedBank(offer); router.push("/apply"); }

  function shareWA() {
    const best = bankOffers[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://instantloan-ten.vercel.app";
    const text = `Maine InstantLoan pe loan eligibility check ki!\n\n${best?.bankName} se ₹${best?.approvedAmount.toLocaleString("en-IN")} pre-approved @ ${best?.interestRate}% p.a.\n\nApni check karo — Zero CIBIL impact: ${appUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (!bankOffers.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-5 text-center py-6 bg-white">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl">😔</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Koi Eligible Bank Nahi Mila</h2>
        <p className="text-gray-500 text-sm mb-6">Income badhao ya existing EMIs kam karo, phir try karo.</p>
        <button onClick={() => router.push("/")} className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg">Dobara Try Karo</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto px-5 py-6">
      {/* Hero */}
      <div className="hero-bg rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-400" />
              <h2 className="text-2xl font-black">Aap Eligible Ho!</h2>
            </div>
            <p className="text-white/70 text-sm">{bankOffers.length} banks loan approve karne ke liye ready hain</p>
          </div>
          <button onClick={shareWA} className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-black px-3 py-2 rounded-xl">
            <Share2 size={13} /> Share
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">Income</p>
            <p className="text-sm font-black">₹{(income / 1000).toFixed(0)}K/mo</p>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">FOIR</p>
            <p className="text-sm font-black">{Math.round(foir * 100)}%</p>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">Banks</p>
            <p className="text-sm font-black">{bankOffers.length} Match</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bankOffers.map((offer, i) => (
          <BankCard key={i} offer={offer} rank={i} onApply={() => handleApply(offer)} />
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-5 pb-4">
        Hard CIBIL inquiry sirf tab hogi jab aap bank ko application submit karo
      </p>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-violet-600 font-bold">Results load ho rahe hain...</div></div>}>
      <ResultsInner />
    </Suspense>
  );
}
