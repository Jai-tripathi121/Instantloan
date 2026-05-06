import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8" style={{ background: "var(--bg)" }}>
      <Link href="/" className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--brand)" }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>Cancellation & Refund Policy</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>Last updated: May 2026 · POSTMAC VENTURES PRIVATE LIMITED</p>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <XCircle size={18} style={{ color: "var(--danger)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--ink)" }}>Report Fee — Non-Refundable</p>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>Once the AI eligibility report is generated and delivered, the ₹99 fee cannot be refunded.</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <CheckCircle size={18} style={{ color: "var(--success)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--ink)" }}>Technical Failure — Full Refund</p>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>If the report fails to generate due to a fault on our servers, you receive a 100% refund within 5–7 business days.</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <Clock size={18} style={{ color: "var(--warn)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--ink)" }}>Double Charge — Immediate Refund</p>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>In case of duplicate payment, the excess amount is refunded within 3–5 business days.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {[
          ["1. Service Provider", "This Cancellation & Refund Policy applies to payments made to POSTMAC VENTURES PRIVATE LIMITED (CIN: U66190HR2025PTC129138, GSTIN: 06AAPCP5039G1Z7) for the PostMoney AI Eligibility Report service."],
          ["2. Nature of the Charge", "The ₹99 fee (inclusive of applicable GST) is a one-time charge for AI-based bank statement analysis, profile matching against 33+ bank eligibility criteria, and delivery of a personalised loan eligibility report. This is a digital service delivered instantly upon payment."],
          ["3. Cancellation Policy", "No cancellation is possible once the payment is initiated and the report generation process begins. As this is an instantly delivered digital product, the right to cancellation under the Consumer Protection (E-Commerce) Rules 2020 does not apply once the service has been rendered."],
          ["4. Non-Refundable Cases", "Refunds will NOT be issued for: (a) report delivered successfully but loan application rejected by a bank; (b) user dissatisfied with loan offers; (c) user provided incorrect details leading to inaccurate results; (d) user changes their mind after report delivery; (e) user is ineligible for any bank — the report itself is the service, not a guaranteed offer."],
          ["5. Refundable Cases", "A full refund will be issued if: (a) the report fails to generate due to a technical error on our servers; (b) duplicate/double payment is charged for a single transaction; (c) payment is deducted but the session expires before report delivery due to our system fault."],
          ["6. Refund Process", "To request a refund, email support@postmoney.in with: your registered mobile number, Razorpay payment ID, and a brief description of the issue. We will investigate within 48 hours. Approved refunds are credited to the original payment source within 5–7 business days via Razorpay."],
          ["7. Disputes", "Payment disputes or chargebacks initiated without contacting us first will be contested. Please email us before raising a dispute with your bank or card provider."],
          ["8. Contact", "Refund queries: support@postmoney.in | POSTMAC VENTURES PRIVATE LIMITED, 3rd Floor, Orchid Center, Golf Course Road, Gurugram, Haryana – 122002."],
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
