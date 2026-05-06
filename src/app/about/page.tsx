import Link from "next/link";
import { ArrowLeft, Building2, MapPin, ShieldCheck } from "lucide-react";

const COMPANY = {
  name: "POSTMAC VENTURES PRIVATE LIMITED",
  cin: "U66190HR2025PTC129138",
  pan: "AAPCP5039G",
  tan: "RTKP17505F",
  incorp: "1st March 2025",
  constitution: "Private Limited Company (limited by shares)",
  status: "Unregulated marketplace/aggregator — not an NBFC, bank, or deposit-taking entity",
  office: "3rd Floor, Orchid Center, Golf Course Road, Sector-53, DLF QE, Gurugram, Haryana – 122002",
};

export default function About() {
  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-5 py-8" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Link href="/" className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--brand)" }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--brand)" }}>
          <span className="text-white font-semibold text-2xl">₹</span>
        </div>
        <h1 className="text-2xl font-semibold mb-1">About postmoney</h1>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>by {COMPANY.name}</p>
      </div>

      <div className="rounded-2xl p-5 mb-5 border" style={{ background: "var(--brand-soft)", borderColor: "var(--brand)" }}>
        <h2 className="font-semibold mb-2" style={{ color: "var(--brand)" }}>Our Mission</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          To help every Indian know their exact loan eligibility before applying — without risking their CIBIL score,
          without giving up their financial data, and without downloading any app.
        </p>
      </div>

      <div className="space-y-4 mb-6 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        <div>
          <h2 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>The Problem We Solve</h2>
          <p>Every time you apply for a loan at a bank, they perform a hard CIBIL inquiry. Apply at 5 banks and your score drops 25–50 points before you even get a rupee. We fix this with a soft-check system.</p>
        </div>
        <div>
          <h2 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>How postmoney Works</h2>
          <div className="space-y-2">
            {[
              ["🛡️", "Bank statement analysed on our secure servers — encrypted in transit, never stored permanently"],
              ["🏦", "Only RBI-regulated scheduled commercial banks — no NBFCs or shadow lenders"],
              ["📵", "No app to install — works on any smartphone browser instantly"],
              ["🔒", "Zero CIBIL impact during eligibility check"],
              ["⚡", "AI result in under 90 seconds"],
            ].map(([icon, text]) => (
              <div key={String(text)} className="flex items-start gap-2.5">
                <span>{icon}</span><span>{String(text)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} style={{ color: "var(--brand)" }} />
          <h2 className="font-semibold">Company Details</h2>
        </div>
        <p className="font-semibold text-base mb-3">{COMPANY.name}</p>
        <div className="space-y-2 text-sm">
          {[
            ["CIN", COMPANY.cin],
            ["PAN", COMPANY.pan],
            ["TAN", COMPANY.tan],
            ["Incorporation Date", COMPANY.incorp],
            ["Constitution", COMPANY.constitution],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4">
              <span style={{ color: "var(--ink-muted)" }}>{String(label)}</span>
              <span className="font-medium text-right">{String(value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl p-3 border" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <div className="flex items-start gap-2">
            <ShieldCheck size={14} style={{ color: "var(--warn)", marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              <strong>Regulatory Status:</strong> {COMPANY.status}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <MapPin size={14} style={{ color: "var(--brand)", marginTop: 2 }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            <strong>Registered Office:</strong> {COMPANY.office}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-4 flex-wrap">
        {[["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["Refund Policy", "/refund"], ["Contact", "/contact"]].map(([l, h]) => (
          <Link key={String(l)} href={String(h)} className="text-xs font-medium underline" style={{ color: "var(--brand)" }}>{String(l)}</Link>
        ))}
      </div>
    </div>
  );
}
