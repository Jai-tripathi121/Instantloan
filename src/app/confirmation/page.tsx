"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { CheckCircle, Share2, Search, Download, ChevronRight } from "lucide-react";

export default function Confirmation() {
  const router = useRouter();
  const { selectedBank, applicationRef, userDetails, loanRequirement } = useAppStore();

  function shareWA() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://instantloan-ten.vercel.app";
    const text = `My loan application has been submitted to ${selectedBank?.bankName}!\n\nRef: ${applicationRef}\nAmount: ₹${selectedBank?.approvedAmount.toLocaleString("en-IN")}\nEMI: ₹${selectedBank?.emi.toLocaleString("en-IN")}/mo\n\nTrack: ${appUrl}/status`;
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
    <div className="min-h-dvh bg-white flex flex-col w-full max-w-md mx-auto px-5 py-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Success icon */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: "#10b981" }}>
            <CheckCircle size={56} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">✓</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Successfully sent to {selectedBank?.bankName}. You will receive a confirmation SMS shortly.
        </p>

        {/* Ref number */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 w-full mb-5">
          <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">Reference Number</p>
          <p className="text-xl font-semibold text-blue-900 tracking-wider">{applicationRef}</p>
          <p className="text-xs text-gray-400 mt-1">Save this to track your application status</p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 w-full mb-5 text-left shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Application Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Applicant</span><span className="font-medium">{userDetails.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="font-medium">{selectedBank?.bankName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Loan Type</span><span className="font-medium capitalize">{loanRequirement.loanType}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-semibold text-emerald-600">₹{selectedBank?.approvedAmount.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Rate</span><span className="font-medium">{selectedBank?.interestRate}% p.a.</span></div>
            <div className="flex justify-between"><span className="text-gray-400">EMI</span><span className="font-semibold text-blue-800">₹{selectedBank?.emi.toLocaleString("en-IN")}/mo</span></div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 w-full mb-6 text-left">
          <p className="text-sm font-semibold text-amber-800 mb-2">What Happens Next?</p>
          <div className="space-y-1.5">
            {["Bank will verify your documents (1–2 working days)", "A bank representative may call you for verification", "Loan disbursed within 3–5 days after approval"].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 font-semibold text-xs">{i + 1}</span>
                </div>
                <p className="text-xs text-amber-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={shareWA} className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Share2 size={18} /> Share on WhatsApp
        </button>
        <button onClick={() => router.push("/status")} className="w-full btn-gradient text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Search size={18} /> Track Application
        </button>
        <button onClick={download} className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95">
          <Download size={18} /> Download Confirmation
        </button>
        <button onClick={() => router.push("/")} className="w-full text-gray-400 py-2 text-sm flex items-center justify-center gap-1">
          <ChevronRight size={14} /> Check Another Loan
        </button>
      </div>
    </div>
  );
}
