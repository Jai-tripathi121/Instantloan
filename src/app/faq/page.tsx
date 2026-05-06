"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

const FAQS = [
  { q: "Will checking eligibility affect my CIBIL score?", a: "No. InstantLoan performs a soft eligibility check using AI analysis of your bank statement. No enquiry is sent to CIBIL or any credit bureau. Your score is completely unaffected until you formally apply to a bank." },
  { q: "What is the ₹99 charge for?", a: "The ₹99 (inclusive of GST) covers AI processing of your bank statement on our secure servers, matching your profile against 33+ bank eligibility criteria, and generating your personalised loan eligibility report with improvement recommendations." },
  { q: "Is my bank statement safe?", a: "Yes. Your bank statement PDF is uploaded to our encrypted servers solely for analysis. It is deleted immediately after processing. It is never shared with any third party, bank, or advertiser." },
  { q: "Which banks are covered?", a: "We cover 33 RBI-regulated scheduled commercial banks including SBI, HDFC Bank, ICICI Bank, Axis Bank, PNB, Bank of Baroda, Kotak Mahindra, Union Bank, Canara Bank, IndusInd Bank, IDFC First, Yes Bank, and Federal Bank. We do not include NBFCs or fintech lenders." },
  { q: "What documents do I need?", a: "For eligibility check: mobile number, PAN card, date of birth, employment type, and 6-months bank statement PDF. For loan application submission: Aadhaar card (photo), PAN card (photo), and passport photograph." },
  { q: "How long does the whole process take?", a: "Eligibility check: under 90 seconds. Bank document verification after application: 1–2 working days. Loan disbursement post-approval: 3–5 working days." },
  { q: "Can I apply to multiple banks?", a: "Yes. Our results show all eligible banks. However, each formal bank application triggers one hard CIBIL enquiry. We recommend applying to your best-matched bank first to protect your credit score." },
  { q: "What if my PDF cannot be parsed?", a: "If our AI cannot extract data from your PDF (e.g. scanned image PDFs), we fall back to your declared income to estimate eligibility. The result may be less precise but still useful for guidance." },
  { q: "Is there a refund if I'm not eligible anywhere?", a: "The ₹99 is non-refundable once the report is generated and delivered. The report itself — including the detailed explanation of why each bank declined and how to improve — is the service you paid for. Please see our full Refund Policy." },
  { q: "Who operates InstantLoan?", a: "InstantLoan is operated by POSTMAC VENTURES PRIVATE LIMITED (CIN: U66190HR2025PTC129138), incorporated on 1st March 2025, registered at 3rd Floor, Orchid Center, Golf Course Road, Sector-53, DLF QE, Gurugram, Haryana – 122002. We are an unregulated marketplace/aggregator — not an NBFC or bank." },
  { q: "How do I track my loan application?", a: "After submitting your application to a bank, you receive a reference number via SMS. Use the Track Application page at eligibility.postmoney.in/status to check status anytime." },
  { q: "How do I contact support?", a: "Email: support@instantloan.in | For privacy requests: privacy@instantloan.in | We respond within 48 business hours." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8" style={{ background: "var(--bg)" }}>
      <Link href="/" className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--brand)" }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>Frequently Asked Questions</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>Everything you need to know about InstantLoan by POSTMAC VENTURES</p>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-4 flex items-center justify-between gap-3">
              <span className="font-medium text-sm" style={{ color: "var(--ink)" }}>{faq.q}</span>
              <ChevronDown size={16} style={{ color: "var(--ink-muted)", transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl p-4 border text-center" style={{ background: "var(--brand-soft)", borderColor: "var(--brand)" }}>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--brand)" }}>Still have questions?</p>
        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>Email us at <strong>support@instantloan.in</strong> — we reply within 48 hours</p>
      </div>
    </div>
  );
}
