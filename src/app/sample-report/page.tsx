"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Brain, ChevronRight } from "lucide-react";
import { generateReport } from "@/lib/report-generator";
import type { StatementIntelligence } from "@/lib/statement-engine";

const SAMPLE_INTELLIGENCE: StatementIntelligence = {
  avgMonthlyIncome: 55000,
  avgMonthlyBalance: 42000,
  totalObligations: 13000,
  foir: 0.24,
  bounceCount: 1,
  salaryCredits: 6,
  transactionCount: 187,
  incomeStabilityScore: 78,
  primaryIncomeSource: "SALARY",
  salaryMonths: 6,
  avgSalaryAmount: 55000,
  businessInflow: 0,
  minMonthlyBalance: 8200,
  avgMinMonthlyBalance: 18500,
  existingEMIs: 11000,
  creditCardDues: 2000,
  bnplUsage: false,
  bnplAmount: 0,
  cashWithdrawalRatio: 0.12,
  categorySpend: {},
  hasInvestments: true,
  investmentAmount: 3000,
  hasInsurance: false,
  fraudSignals: [],
  fraudRisk: "low",
  loanAppUsage: false,
  gamblingDetected: false,
  lendingScore: 712,
  lendingDecision: "APPROVE",
  scoreBreakdown: { incomeStability: 19, bounceHistory: 21, balanceQuality: 14, foirScore: 12, spendingPattern: 10, total: 76 },
  monthlyBreakdown: [
    { monthKey: "2024-11", label: "Nov 2024", totalCredits: 57200, totalDebits: 41000, avgBalance: 28000, minBalance: 9100, maxBalance: 52000, bounceCount: 0, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 5000, investmentAmount: 3000, creditCardPaid: 2000 },
    { monthKey: "2024-12", label: "Dec 2024", totalCredits: 55000, totalDebits: 43200, avgBalance: 22000, minBalance: 8200, maxBalance: 49000, bounceCount: 1, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 6000, investmentAmount: 3000, creditCardPaid: 2000 },
    { monthKey: "2025-01", label: "Jan 2025", totalCredits: 55000, totalDebits: 38900, avgBalance: 30000, minBalance: 11400, maxBalance: 53000, bounceCount: 0, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 4500, investmentAmount: 3000, creditCardPaid: 2000 },
    { monthKey: "2025-02", label: "Feb 2025", totalCredits: 58000, totalDebits: 40100, avgBalance: 35000, minBalance: 14200, maxBalance: 58000, bounceCount: 0, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 4000, investmentAmount: 3000, creditCardPaid: 2000 },
    { monthKey: "2025-03", label: "Mar 2025", totalCredits: 55000, totalDebits: 39500, avgBalance: 38000, minBalance: 16700, maxBalance: 55000, bounceCount: 0, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 4500, investmentAmount: 3000, creditCardPaid: 2000 },
    { monthKey: "2025-04", label: "Apr 2025", totalCredits: 55000, totalDebits: 41800, avgBalance: 42000, minBalance: 18500, maxBalance: 56000, bounceCount: 0, salaryAmount: 55000, emiTotal: 11000, cashWithdrawn: 5000, investmentAmount: 3000, creditCardPaid: 2000 },
  ],
  statementMonths: 6,
  detectedBank: "HDFC Bank",
  parseQuality: "high",
  rawLineCount: 1240,
  engineVersion: 3,
} as StatementIntelligence;

const SAMPLE_INSIGHTS_EN = `CURRENT SCORE ANALYSIS
Your lending score of 712/900 is in the Approved range, but there is room to improve significantly. The primary drag is 1 bounce in December 2024 and a moderate FOIR of 24%. Your income stability is strong with consistent ₹55K monthly salary credits across 6 months.

QUICK WINS — DO THIS WEEK
1. Set up NACH auto-debit for your ₹11,000 EMI so bounces cannot recur
2. Link a SIP of ₹2,000–3,000/month — investments add 5–8 points to your score
3. Keep minimum balance above ₹15,000 at all times — month-end dips hurt you
4. Stop any loan app enquiries (KreditBee, CASHe) for at least 60 days
5. Add health insurance — even ₹500/month term plan improves score pattern

6-MONTH ROADMAP

Month 1 — Eliminate Bounce Risk:
Set up NACH for all EMIs. Maintain ₹20,000 minimum balance. Cancel any active loan app accounts.

Month 2 — Build Investment Pattern:
Start SIP ₹3,000/month (Zerodha/Groww). This signals financial discipline to lenders.

Month 3 — Income Boost:
Negotiate a ₹3,000–5,000 increment or add a small side income via UPI. Target income: ₹58,000+/month.

Month 4 — Reduce FOIR:
Pre-pay one EMI to bring total obligations from ₹13,000 to ₹11,000. Target FOIR: under 20%.

Month 5 — Balance Quality:
Maintain minimum balance of ₹25,000 across all days. Avoid large cash withdrawals.

Month 6 — Final Consolidation:
Zero bounces for 5 straight months, SIP active, min balance ₹25K. Re-apply for a premium loan product.

PROJECTED SCORE PROGRESS
Month 1: 712 → 725
Month 2: 725 → 742
Month 3: 742 → 760
Month 4: 760 → 795
Month 5: 795 → 830
Month 6: 830 → 870

KEY METRICS TO TRACK
1. Min Balance: ₹8,200 → ₹25,000+ by Month 6
2. Bounce Count: 1 → 0 (maintain for 6 months)
3. Monthly Investment: ₹3,000 → ₹5,000 via SIP/ELSS
4. FOIR: 24% → 18% via partial prepayment`;

export default function SampleReportPage() {
  const [loadingEn, setLoadingEn] = useState(false);
  const [loadingHi, setLoadingHi] = useState(false);

  const scoreColor = "#60a5fa";
  const pct = Math.round(((712 - 300) / 600) * 100);
  const breakdown = SAMPLE_INTELLIGENCE.scoreBreakdown;

  async function downloadEn() {
    setLoadingEn(true);
    try {
      const html = generateReport(SAMPLE_INTELLIGENCE, SAMPLE_INSIGHTS_EN, "en");
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    } finally {
      setLoadingEn(false);
    }
  }

  async function downloadHi() {
    setLoadingHi(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "insights", statementData: SAMPLE_INTELLIGENCE, lang: "hi" }),
      });
      const data = await res.json() as { text?: string };
      const insights = data.text ?? SAMPLE_INSIGHTS_EN;
      const html = generateReport(SAMPLE_INTELLIGENCE, insights, "hi");
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    } finally {
      setLoadingHi(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col w-full max-w-md mx-auto px-5 py-6" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 bg-[var(--bg-deep)] rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <p className="font-semibold text-[var(--ink)] text-sm">Sample AI Report</p>
          <p style={{ color: "var(--ink-muted)", fontSize: 10 }}>Preview what you get for ₹99</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="rounded-2xl overflow-hidden border border-[var(--line-soft)] mb-5"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111827 100%)" }}>
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1e293b" }}>
                <Brain size={16} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">AI Statement Score</p>
                <p className="text-xs" style={{ color: "#64748b" }}>HDFC Bank · 6 months</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#0c1a3a", color: "#60a5fa", border: "1px solid #1e40af40" }}>
              Approved ✓
            </div>
          </div>

          <div className="flex items-end gap-3 mb-3">
            <div>
              <span style={{ fontSize: 48, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>712</span>
              <span style={{ color: "#475569", fontSize: 16, marginLeft: 4 }}>/900</span>
            </div>
            <div className="mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400">
                ● Good
              </span>
            </div>
          </div>

          <div className="h-2 rounded-full mb-4" style={{ background: "#1e293b" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #f87171, #fb923c, #60a5fa)" }} />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Income", val: breakdown.incomeStability, max: 25 },
              { label: "Bounces", val: breakdown.bounceHistory, max: 25 },
              { label: "Balance", val: breakdown.balanceQuality, max: 20 },
              { label: "FOIR", val: breakdown.foirScore, max: 15 },
              { label: "Spending", val: breakdown.spendingPattern, max: 15 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-2.5 text-center" style={{ background: "#1e293b" }}>
                <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase" }}>{item.label}</p>
                <p style={{ color: scoreColor, fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                  {item.val}<span style={{ color: "#475569", fontSize: 9 }}>/{item.max}</span>
                </p>
              </div>
            ))}
            <div className="rounded-xl p-2.5 text-center" style={{ background: "#162032" }}>
              <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase" }}>Total</p>
              <p style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                76<span style={{ color: "#475569", fontSize: 9 }}>/100</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={downloadEn} disabled={loadingEn}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs disabled:opacity-60 transition-all active:scale-95"
            style={{ background: "#1e293b", color: "#e2e8f0" }}>
            {loadingEn ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {loadingEn ? "Generating…" : "Download Sample (EN)"}
          </button>
          <button onClick={downloadHi} disabled={loadingHi}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs disabled:opacity-60 transition-all active:scale-95"
            style={{ background: "#1e293b", color: "#e2e8f0" }}>
            {loadingHi ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {loadingHi ? "जनरेट हो रहा…" : "सैंपल रिपोर्ट (HI)"}
          </button>
        </div>
      </div>

      {/* AI Insights Preview */}
      <div className="rounded-2xl border border-[var(--line-soft)] p-4 mb-5" style={{ background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)] mb-3">AI Insights Preview</p>
        <div className="space-y-3 text-xs text-[var(--ink-soft)] leading-relaxed">
          <div>
            <p className="font-semibold text-[var(--ink)] mb-1">Score Analysis</p>
            <p>Score of 712/900 is in the Approved range. 1 bounce in Dec 2024 and moderate FOIR of 24% are the main drags. Strong income stability across 6 months.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)] mb-1">Quick Wins This Week</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Set up NACH auto-debit for ₹11,000 EMI</li>
              <li>Start SIP ₹3,000/month (Zerodha/Groww)</li>
              <li>Maintain ₹20,000 min balance</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)] mb-1">6-Month Roadmap</p>
            <p>Projected score: <span className="text-emerald-600 font-semibold">712 → 870</span> in 6 months through bounce elimination, SIP investment, and FOIR reduction.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--brand-soft)] border border-[var(--brand)] rounded-2xl p-4 mb-4 text-center">
        <p className="font-semibold text-[var(--brand)] mb-1 text-sm">Get Your Personalised Report</p>
        <p className="text-xs text-[var(--ink-muted)] mb-3">Upload your actual bank statement for a real AI analysis of your profile</p>
        <Link href="/details"
          className="btn-gradient inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm">
          Check My Eligibility <ChevronRight size={16} />
        </Link>
      </div>

      <p className="text-center text-xs text-[var(--ink-muted)]">₹99 one-time · Zero CIBIL impact · Instant delivery</p>
    </div>
  );
}
