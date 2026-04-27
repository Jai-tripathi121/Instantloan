import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-5 py-8 bg-white">
      <Link href="/" className="text-blue-600 text-sm font-medium mb-6 block">← Back to Home</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-6">Last updated: April 2026</p>
      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        {[
          ["What We Collect", "Mobile number, name, PAN number, date of birth, employment type, and declared monthly income. Bank statements are processed locally in your browser — we never receive or store them."],
          ["What We Never Collect", "Your full bank statement, account number, net banking credentials, Aadhaar biometrics, or actual CIBIL report. Your financial data stays on your device."],
          ["How We Use Your Data", "To generate your eligibility report, submit your loan application to the selected bank, and send you a confirmation SMS. We do not sell your data to third parties."],
          ["Firebase Storage", "Application details including PAN, mobile, loan details, and uploaded KYC documents are stored in Firebase Firestore and Firebase Storage, both compliant with SOC 2 and ISO 27001."],
          ["DPDP Act Compliance", "We comply with India's Digital Personal Data Protection Act 2023. You have the right to access, correct, and delete your data by contacting us at privacy@instantloan.in."],
          ["Cookies", "We use minimal session cookies for app functionality. No tracking or advertising cookies are used."],
          ["Data Retention", "Application data is retained for 7 years as per RBI guidelines for loan-related records. You may request deletion after this period."],
          ["Contact", "For privacy concerns: privacy@instantloan.in | For support: support@instantloan.in"],
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
