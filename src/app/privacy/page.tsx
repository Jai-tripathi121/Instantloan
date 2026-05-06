import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8" style={{ background: "var(--bg)" }}>
      <Link href="/" className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--brand)" }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>Privacy Policy</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>Last updated: May 2026 · POSTMAC VENTURES PRIVATE LIMITED</p>

      <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {[
          ["1. Company Identity", "This Privacy Policy applies to InstantLoan, a product of POSTMAC VENTURES PRIVATE LIMITED (CIN: U66190HR2025PTC129138, PAN: AAPCP5039G), a private limited company incorporated under the Companies Act 2013, registered at 3rd Floor, Orchid Center, Golf Course Road, Sector-53, DLF QE, Gurugram, Haryana – 122002."],
          ["2. What We Collect", "We collect: (a) mobile number for OTP-based authentication; (b) full name, PAN number, date of birth, employment type, and self-declared monthly income; (c) loan preference details (type, amount, tenure). Bank statement files are uploaded to our secure servers solely for the purpose of AI analysis and are not retained after processing is complete."],
          ["3. What We Never Collect", "We do not collect net banking credentials, Aadhaar biometric data, debit/credit card numbers, UPI PINs, or any data not explicitly submitted by you. Your raw bank statement file is deleted from our servers immediately after analysis."],
          ["4. How We Use Your Data", "Your data is used exclusively to: generate your AI loan eligibility report; match your profile against bank eligibility criteria; submit your loan application to the bank you choose; send OTP and confirmation SMS. We do not sell, share, or license your personal data to any third party, advertiser, or data broker."],
          ["5. Data Storage", "Profile data (name, mobile, PAN, loan preference) is stored in Google Firebase Firestore (Mumbai region, ISO 27001 certified). Payment records are processed and stored by Razorpay under their PCI-DSS compliance. No raw bank statement data is stored on our servers."],
          ["6. DPDP Act 2023 Compliance", "We comply with India's Digital Personal Data Protection Act 2023. You have the right to: (a) access your stored data; (b) correct inaccurate data; (c) request erasure of your data; (d) withdraw consent. To exercise these rights, email privacy@instantloan.in."],
          ["7. Cookies", "We use strictly functional session cookies for app state management. No advertising, tracking, or third-party analytics cookies are placed on your device."],
          ["8. Data Retention", "Application data is retained for 7 years as required under RBI guidelines applicable to loan-related marketplace services. After this period, data is permanently deleted."],
          ["9. Security", "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. OTP verification is mandatory for all sessions."],
          ["10. Contact for Privacy", "For privacy concerns or data requests: privacy@instantloan.in | POSTMAC VENTURES PRIVATE LIMITED, 3rd Floor, Orchid Center, Golf Course Road, Gurugram, Haryana – 122002."],
        ].map(([title, body]) => (
          <div key={String(title)}>
            <h2 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>{String(title)}</h2>
            <p>{String(body)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
