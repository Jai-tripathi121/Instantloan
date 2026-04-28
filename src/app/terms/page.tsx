import Link from "next/link";

export default function Terms() {
  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8 bg-white">
      <Link href="/" className="text-blue-600 text-sm font-medium mb-6 block">← Back to Home</Link>
      <h1 className="text-2xl font-medium text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-sm text-gray-400 mb-6">Last updated: April 2026</p>
      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        {[
          ["1. Service Description", "InstantLoan is a loan eligibility assessment platform. We analyse your bank statement locally on your device and match your profile against published bank eligibility criteria. We are not a bank, NBFC, or lending institution."],
          ["2. Fee & Payment", "A non-refundable fee of ₹99 (or discounted amount with promo code) is charged for generating the AI eligibility report. Payment is processed securely via Razorpay. Once the report is delivered, refunds are not applicable."],
          ["3. No Guarantee of Approval", "InstantLoan provides eligibility estimates based on stated income and self-declared information. Actual loan approval decisions are made solely by the respective banks. We do not guarantee loan approval or disbursal."],
          ["4. Data Privacy", "Your bank statement is processed entirely within your browser. It is never transmitted to our servers. Basic KYC details (name, mobile, PAN) submitted during application are stored securely in Firebase with encryption at rest."],
          ["5. CIBIL & Credit Score", "Eligibility checks on InstantLoan do not trigger a hard CIBIL inquiry. A hard inquiry occurs only when you submit your formal application to a bank. This may affect your credit score."],
          ["6. User Responsibility", "You are responsible for providing accurate information. Submitting false documents or information may result in legal action and permanent ban from the platform."],
          ["7. Limitation of Liability", "InstantLoan is not liable for any loan rejection, interest rate changes, or bank decisions. Our liability is limited to the ₹99 fee paid for the report."],
          ["8. Governing Law", "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Mumbai, Maharashtra."],
        ].map(([title, body]) => (
          <div key={title as string}>
            <h2 className="font-semibold text-gray-900 mb-1">{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
