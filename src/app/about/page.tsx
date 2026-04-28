import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-5 py-8 bg-white">
      <Link href="/" className="text-blue-600 text-sm font-medium mb-6 block">← Back to Home</Link>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-medium text-3xl">₹</span>
        </div>
        <h1 className="text-2xl font-medium text-gray-900">About InstantLoan</h1>
        <p className="text-gray-500 text-sm mt-2">India&apos;s first privacy-first loan eligibility platform</p>
      </div>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="bg-blue-50 rounded-2xl p-5">
          <h2 className="font-medium text-blue-900 text-base mb-2">Our Mission</h2>
          <p className="text-blue-800">To help every Indian know their exact loan eligibility before applying — without risking their CIBIL score, without giving up their financial data, and without downloading any app.</p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">The Problem We Solve</h2>
          <p>Every time you apply for a loan at a bank, they perform a hard CIBIL inquiry. If you apply at 5 banks hoping for approval, your CIBIL score drops by 25-50 points — before you even get a loan. This is unfair and most people don&apos;t know it happens.</p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">How InstantLoan Is Different</h2>
          <div className="space-y-2">
            {[
              { icon: "🛡️", text: "Bank statement processed entirely in your browser — never uploaded" },
              { icon: "🏦", text: "Only real, scheduled commercial banks — no NBFCs or shadow lenders" },
              { icon: "📵", text: "No app to install — works on any phone browser instantly" },
              { icon: "🔒", text: "Zero CIBIL impact during eligibility check" },
              { icon: "🤖", text: "AI matches your exact profile to each bank's criteria" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Contact Us</h2>
          <div className="space-y-1">
            <p>📧 support@instantloan.in</p>
            <p>📧 privacy@instantloan.in</p>
            <p>⏰ Mon–Sat, 10am–6pm IST</p>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 justify-center text-sm">
        <Link href="/terms" className="text-blue-600">Terms</Link>
        <Link href="/privacy" className="text-blue-600">Privacy</Link>
        <Link href="/faq" className="text-blue-600">FAQ</Link>
      </div>
    </div>
  );
}
