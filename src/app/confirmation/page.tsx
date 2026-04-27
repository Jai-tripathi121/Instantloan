"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { CheckCircle, Share2, Search, Download, ChevronRight } from "lucide-react";

export default function Confirmation() {
  const router = useRouter();
  const { selectedBank, applicationRef, userDetails, loanRequirement } = useAppStore();

  function shareWA() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://instantloan-ten.vercel.app";
    const text = `Meri loan application ${selectedBank?.bankName} ko submit ho gayi!\n\nRef: ${applicationRef}\nAmount: ₹${selectedBank?.approvedAmount.toLocaleString("en-IN")}\nEMI: ₹${selectedBank?.emi.toLocaleString("en-IN")}/mo\n\nTrack: ${appUrl}/status`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function download() {
    const c = `InstantLoan Confirmation\n\nRef: ${applicationRef}\nBank: ${selectedBank?.bankName}\nAmount: ₹${selectedBank?.approvedAmount.toLocaleString("en-IN")}\nRate: ${selectedBank?.interestRate}% p.a.\nEMI: ₹${selectedBank?.emi.toLocaleString("en-IN")}/month`;
    const blob = new Blob([c], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `InstantLoan_${applicationRef}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Success icon */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <CheckCircle size={56} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-black">✓</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submit Ho Gayi!</h2>
        <p className="text-gray-500 text-sm mb-6">
          {selectedBank?.bankName} ko successfully bhej di gayi. Mobile pe confirmation SMS aayega.
        </p>

        {/* Ref number */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4 w-full mb-5">
          <p className="text-xs text-violet-500 font-bold mb-1 uppercase tracking-wide">Reference Number</p>
          <p className="text-xl font-black text-violet-700 tracking-wider">{applicationRef}</p>
          <p className="text-xs text-gray-400 mt-1">Status track karne ke liye save karo</p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 w-full mb-5 text-left shadow-sm">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Application Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Applicant</span><span className="font-bold">{userDetails.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="font-bold">{selectedBank?.bankName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Loan Type</span><span className="font-bold capitalize">{loanRequirement.loanType}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-black text-emerald-600">₹{selectedBank?.approvedAmount.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Rate</span><span className="font-bold">{selectedBank?.interestRate}% p.a.</span></div>
            <div className="flex justify-between"><span className="text-gray-400">EMI</span><span className="font-black text-violet-600">₹{selectedBank?.emi.toLocaleString("en-IN")}/mo</span></div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 w-full mb-6 text-left">
          <p className="text-sm font-black text-amber-800 mb-2">Aage Kya Hoga?</p>
          <div className="space-y-1.5">
            {["Bank documents verify karega (1-2 working days)", "Bank representative aapko call kar sakta hai", "Approval ke baad 3-5 days mein loan disbursed"].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 font-black text-xs">{i + 1}</span>
                </div>
                <p className="text-xs text-amber-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={shareWA} className="w-full bg-green-500 text-white font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Share2 size={18} /> WhatsApp pe Share Karo
        </button>
        <button onClick={() => router.push("/status")} className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Search size={18} /> Application Track Karo
        </button>
        <button onClick={download} className="w-full bg-gray-100 text-gray-700 font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Download size={18} /> Confirmation Download Karo
        </button>
        <button onClick={() => router.push("/")} className="w-full text-gray-400 py-2 text-sm flex items-center justify-center gap-1">
          <ChevronRight size={14} /> Doosra Loan Check Karo
        </button>
      </div>
    </div>
  );
}
