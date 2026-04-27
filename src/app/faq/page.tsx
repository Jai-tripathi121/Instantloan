"use client";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  { q: "Will checking eligibility affect my CIBIL score?", a: "No. InstantLoan performs a soft eligibility check using your bank statement analysed locally on your device. No inquiry is sent to any credit bureau. Your CIBIL score is unaffected." },
  { q: "What is the ₹99 charge for?", a: "The ₹99 covers AI processing of your bank statement, documentation handling, and matching your profile against 8+ bank eligibility criteria to generate your personalised report." },
  { q: "Is my bank statement safe?", a: "Yes. Your bank statement PDF is opened and analysed entirely within your phone's browser using JavaScript. It never leaves your device — not even one byte is sent to our servers." },
  { q: "Which banks are covered?", a: "SBI, HDFC Bank, ICICI Bank, Axis Bank, PNB, Bank of Baroda, Kotak Mahindra Bank, and Union Bank of India. We only list scheduled commercial banks — no NBFCs or fintech lenders." },
  { q: "What documents do I need to apply?", a: "Aadhaar card (photo/scan), PAN card (photo/scan), 6 months bank statement PDF, and a passport photograph (optional). All documents stay on your device during analysis." },
  { q: "How long does the process take?", a: "The eligibility check takes under 2 minutes. After you apply to a bank, expect document verification in 1-2 working days and disbursement in 3-5 working days upon approval." },
  { q: "Can I apply to multiple banks?", a: "Yes. Our results show all banks where you qualify. However, each bank application triggers one CIBIL hard inquiry. We recommend applying to the best-matched bank first." },
  { q: "What if the PDF parsing fails?", a: "If our AI cannot read your PDF (e.g. scanned image PDFs), we fall back to your self-declared income to estimate eligibility. The result may be less accurate but still useful." },
  { q: "Is there a refund policy?", a: "The ₹99 fee is non-refundable once the AI report is generated. If the report fails to generate due to a technical error on our side, we will issue a full refund within 5-7 business days." },
  { q: "How do I track my loan application?", a: "After submitting your application, you receive a reference number. Use the 'Track Application' page at instantloan.in/status to check your loan status anytime." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-5 py-8 bg-white">
      <Link href="/" className="text-blue-600 text-sm font-medium mb-6 block">← Back to Home</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
      <p className="text-sm text-gray-400 mb-6">Everything you need to know about InstantLoan</p>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-all">
              <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
              <span className={`text-gray-400 transition-transform flex-shrink-0 ${open === i ? "rotate-180" : ""}`}>▼</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 bg-slate-50">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
