import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Building2, Clock, ShieldCheck } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8" style={{ background: "var(--bg)" }}>
      <Link href="/" className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--brand)" }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>Contact Us</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>POSTMAC VENTURES PRIVATE LIMITED</p>

      {/* Contact cards */}
      <div className="space-y-3 mb-6">
        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <Mail size={18} style={{ color: "var(--brand)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>General Support</p>
            <a href="mailto:support@postmoney.in" className="text-sm font-medium" style={{ color: "var(--brand)" }}>support@postmoney.in</a>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>Loan queries, technical issues, account help</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <ShieldCheck size={18} style={{ color: "var(--brand)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>Privacy & Data Requests</p>
            <a href="mailto:privacy@postmoney.in" className="text-sm font-medium" style={{ color: "var(--brand)" }}>privacy@postmoney.in</a>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>Data access, correction, deletion requests under DPDP Act 2023</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <Mail size={18} style={{ color: "var(--brand)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>Refunds & Billing</p>
            <a href="mailto:support@postmoney.in" className="text-sm font-medium" style={{ color: "var(--brand)" }}>support@postmoney.in</a>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>Include your Razorpay payment ID and registered mobile</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <Mail size={18} style={{ color: "var(--brand)", marginTop: 1 }} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>Legal Notices</p>
            <a href="mailto:legal@postmoney.in" className="text-sm font-medium" style={{ color: "var(--brand)" }}>legal@postmoney.in</a>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>Statutory notices, legal correspondence</p>
          </div>
        </div>
      </div>

      {/* Response time */}
      <div className="rounded-2xl p-4 border flex items-start gap-3 mb-6" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
        <Clock size={16} style={{ color: "var(--warn)", marginTop: 2 }} className="shrink-0" />
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>We respond to all emails within <strong>48 business hours</strong> (Monday–Saturday, 9 AM – 6 PM IST).</p>
      </div>

      {/* Company details */}
      <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} style={{ color: "var(--brand)" }} />
          <h2 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Registered Office</h2>
        </div>
        <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>POSTMAC VENTURES PRIVATE LIMITED</p>
        <div className="flex items-start gap-2">
          <MapPin size={13} style={{ color: "var(--ink-muted)", marginTop: 2 }} className="shrink-0" />
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>3rd Floor, Orchid Center, Golf Course Road, Sector-53, DLF QE, Gurugram, Haryana – 122002</p>
        </div>
        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs" style={{ borderColor: "var(--line-soft)", color: "var(--ink-muted)" }}>
          <div><span className="font-medium" style={{ color: "var(--ink)" }}>CIN</span><br />U66190HR2025PTC129138</div>
          <div><span className="font-medium" style={{ color: "var(--ink)" }}>PAN</span><br />AAPCP5039G</div>
          <div><span className="font-medium" style={{ color: "var(--ink)" }}>GSTIN</span><br />06AAPCP5039G1Z7</div>
          <div><span className="font-medium" style={{ color: "var(--ink)" }}>TAN</span><br />RTKP17505F</div>
        </div>
      </div>
    </div>
  );
}
