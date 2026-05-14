"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { useAppStore, BankOffer } from "@/lib/store";
import type { StatementAnalysis } from "@/lib/store";
import { t } from "@/lib/i18n";
import { CheckCircle, Share2, TrendingDown, ChevronRight, Award, Sparkles, ShieldCheck, FileDown, Loader2, XCircle, AlertTriangle, TrendingUp, RefreshCcw, Info, Brain, Download } from "lucide-react";
import type { RejectionReason, RejectedBank } from "@/lib/store";
import type { RiskGrade } from "@/lib/store";
import { saveSession } from "@/lib/firestore";
import type { StatementIntelligence } from "@/lib/statement-engine";
import { generateReport } from "@/lib/report-generator";

// ─── Convert StatementAnalysis → StatementIntelligence (fills defaults) ───────

function toIntelligence(sa: StatementAnalysis): StatementIntelligence {
  return {
    avgMonthlyIncome: sa.avgMonthlyIncome,
    avgMonthlyBalance: sa.avgMonthlyBalance,
    totalObligations: sa.totalObligations,
    foir: sa.foir,
    bounceCount: sa.bounceCount,
    salaryCredits: sa.salaryCredits,
    transactionCount: sa.transactionCount,
    incomeStabilityScore: 0,
    primaryIncomeSource: "SALARY",
    salaryMonths: sa.salaryCredits,
    avgSalaryAmount: sa.avgMonthlyIncome,
    businessInflow: 0,
    minMonthlyBalance: sa.minMonthlyBalance ?? 0,
    avgMinMonthlyBalance: sa.avgMonthlyBalance,
    existingEMIs: sa.totalObligations,
    creditCardDues: 0,
    bnplUsage: sa.bnplUsage ?? false,
    bnplAmount: sa.bnplAmount ?? 0,
    cashWithdrawalRatio: 0,
    categorySpend: {},
    hasInvestments: sa.hasInvestments ?? false,
    investmentAmount: sa.investmentAmount ?? 0,
    hasInsurance: sa.hasInsurance ?? false,
    fraudSignals: sa.fraudSignals ?? [],
    fraudRisk: (sa.fraudRisk ?? "low") as "low" | "medium" | "high",
    loanAppUsage: sa.loanAppUsage ?? false,
    gamblingDetected: sa.gamblingDetected ?? false,
    lendingScore: sa.lendingScore ?? 600,
    lendingDecision: (sa.lendingDecision ?? "MANUAL_REVIEW") as "STRONG_APPROVE" | "APPROVE" | "MANUAL_REVIEW" | "REJECT",
    scoreBreakdown: sa.scoreBreakdown ?? { incomeStability: 0, bounceHistory: 0, balanceQuality: 0, foirScore: 0, spendingPattern: 0, total: 0 },
    monthlyBreakdown: sa.monthlyBreakdown ?? [],
    statementMonths: sa.statementMonths ?? 0,
    detectedBank: sa.detectedBank ?? "Unknown",
    parseQuality: "medium",
    rawLineCount: 0,
  } as StatementIntelligence;
}

// ─── AI Score Card (shown before bank offers) ─────────────────────────────────

function AiScoreCard({ analysis, lang }: { analysis: StatementAnalysis; lang: string }) {
  const score = analysis.lendingScore ?? 0;
  const decision = analysis.lendingDecision ?? "MANUAL_REVIEW";
  const [loadingEn, setLoadingEn] = useState(false);
  const [loadingHi, setLoadingHi] = useState(false);
  const [insightsCache, setInsightsCache] = useState<{ en?: string; hi?: string }>({});

  if (!score) return null;

  const isGood = score >= 700;
  const scoreColor = score >= 800 ? "#4ade80" : score >= 700 ? "#60a5fa" : score >= 580 ? "#fb923c" : "#f87171";
  const pct = Math.min(100, Math.round(((score - 300) / 600) * 100));

  const DECISION_LABELS: Record<string, { label: string; bg: string; text: string }> = {
    STRONG_APPROVE: { label: "Strong Approve ✓", bg: "#052e16", text: "#4ade80" },
    APPROVE:        { label: "Approved ✓",        bg: "#0c1a3a", text: "#60a5fa" },
    MANUAL_REVIEW:  { label: "Manual Review",     bg: "#1c1208", text: "#fb923c" },
    REJECT:         { label: "Needs Work",         bg: "#1c0606", text: "#f87171" },
  };
  const decisionStyle = DECISION_LABELS[decision] ?? DECISION_LABELS.MANUAL_REVIEW;

  async function downloadPdf(dlLang: "en" | "hi") {
    const setter = dlLang === "en" ? setLoadingEn : setLoadingHi;
    setter(true);
    try {
      let insights = insightsCache[dlLang];
      if (!insights) {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "insights", statementData: toIntelligence(analysis), lang: dlLang }),
        });
        const data = await res.json() as { text?: string; error?: string };
        if (!data.text) throw new Error(data.error ?? "AI error");
        insights = data.text;
        setInsightsCache((prev) => ({ ...prev, [dlLang]: insights }));
      }
      const html = generateReport(toIntelligence(analysis), insights, dlLang);
      const { downloadReportAsPdf } = await import("@/lib/download-pdf");
      await downloadReportAsPdf(html, `PostMoney_AI_Report_${dlLang.toUpperCase()}.pdf`);
    } catch {
      alert("Could not generate AI report. Please try again.");
    } finally {
      setter(false);
    }
  }

  const breakdown = analysis.scoreBreakdown;

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--line-soft)] mb-5"
      style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111827 100%)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1e293b" }}>
              <Brain size={16} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">AI Statement Score</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Post AI Analysis</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: decisionStyle.bg, color: decisionStyle.text, border: `1px solid ${decisionStyle.text}40` }}>
            {decisionStyle.label}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-end gap-3 mb-3">
          <div>
            <span style={{ fontSize: 48, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</span>
            <span style={{ color: "#475569", fontSize: 16, marginLeft: 4 }}>/900</span>
          </div>
          <div className="mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isGood ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
              {isGood ? "● Good" : "● Needs Improvement"}
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-2 rounded-full mb-4" style={{ background: "#1e293b" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, #f87171, #fb923c, ${scoreColor})` }} />
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Income", val: breakdown.incomeStability, max: 25 },
              { label: "Bounces", val: breakdown.bounceHistory, max: 25 },
              { label: "Balance", val: breakdown.balanceQuality, max: 20 },
              { label: "FOIR", val: breakdown.foirScore, max: 15 },
              { label: "Spending", val: breakdown.spendingPattern, max: 15 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-2.5 text-center" style={{ background: "#1e293b" }}>
                <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                <p style={{ color: scoreColor, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{item.val}<span style={{ color: "#475569", fontSize: 9 }}>/{item.max}</span></p>
              </div>
            ))}
            <div className="rounded-xl p-2.5 text-center" style={{ background: "#162032" }}>
              <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</p>
              <p style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{breakdown.total}<span style={{ color: "#475569", fontSize: 9 }}>/100</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Download buttons */}
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold mb-2.5" style={{ color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Download AI Report
        </p>
        <div className="flex gap-2">
          <button onClick={() => downloadPdf("en")} disabled={loadingEn}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(79,70,229,0.5)" }}>
            {loadingEn ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {loadingEn ? "Generating…" : "English PDF"}
          </button>
          <button onClick={() => downloadPdf("hi")} disabled={loadingHi}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(124,58,237,0.5)" }}>
            {loadingHi ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {loadingHi ? "जनरेट हो रहा…" : "हिंदी PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

const GRADE_CONFIG: Record<RiskGrade, { label: string; bg: string; text: string; bar: string }> = {
  A: { label: "Grade A", bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" },
  B: { label: "Grade B", bg: "bg-[var(--brand-soft)]",    text: "text-[var(--brand-2)]",    bar: "bg-[var(--brand-soft)]0" },
  C: { label: "Grade C", bg: "bg-amber-100",   text: "text-amber-700",   bar: "bg-amber-400" },
  D: { label: "Grade D", bg: "bg-red-100",     text: "text-red-700",     bar: "bg-red-400" },
};

function RiskGradeBadge({ grade }: { grade: RiskGrade }) {
  const cfg = GRADE_CONFIG[grade];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <ShieldCheck size={10} /> {cfg.label}
    </span>
  );
}
import BankLogo from "@/components/BankLogo";

const LOGO_BASE = "https://raw.githubusercontent.com/praveenpuglia/indian-banks/master/assets/logos";
const DEMO_OFFERS: BankOffer[] = [
  { bankName: "Axis Bank",  logo: "AXIS", logoUrl: `${LOGO_BASE}/utib/symbol.svg`, approvedAmount: 420000, interestRate: 10.49, tenure: 36, emi: 13655, processingFee: 6300, color: "#7F1D1D" },
  { bankName: "HDFC Bank",  logo: "HDFC", logoUrl: `${LOGO_BASE}/hdfc/symbol.svg`, approvedAmount: 450000, interestRate: 10.50, tenure: 36, emi: 14619, processingFee: 6750, color: "#004C8F" },
  { bankName: "PNB",        logo: "PNB",  logoUrl: `${LOGO_BASE}/punb/symbol.svg`, approvedAmount: 400000, interestRate: 10.40, tenure: 36, emi: 13100, processingFee: 4000, color: "#1D4ED8" },
  { bankName: "ICICI Bank", logo: "ICI",  logoUrl: `${LOGO_BASE}/icic/symbol.svg`, approvedAmount: 480000, interestRate: 10.75, tenure: 36, emi: 15630, processingFee: 9600, color: "#D97706" },
  { bankName: "SBI",        logo: "SBI",  logoUrl: `${LOGO_BASE}/sbin/symbol.svg`, approvedAmount: 400000, interestRate: 11.15, tenure: 36, emi: 13100, processingFee: 4000, color: "#1E3A8A" },
];

function BankCard({ offer, rank, onApply, applyLabel }: { offer: BankOffer; rank: number; onApply: () => void; applyLabel: string }) {
  const isTop = rank === 0;
  return (
    <div className={`rounded-2xl overflow-hidden border-2 transition-all card-hover ${isTop ? "border-[var(--brand-soft)] shadow-lg shadow-blue-100" : "border-[var(--line-soft)]"}`}>
      {/* Bank header */}
      <div className="flex items-center justify-between p-4 pb-3" style={{ background: `${offer.color}15` }}>
        <div className="flex items-center gap-3">
          <BankLogo logoUrl={offer.logoUrl} logo={offer.logo} color={offer.color} size={44} />
          <div>
            <p className="font-semibold text-[var(--ink)]">{offer.bankName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle size={11} /> Pre-Approved
              </div>
              {offer.riskGrade && <RiskGradeBadge grade={offer.riskGrade} />}
            </div>
          </div>
        </div>
        {isTop && (
          <div className="flex items-center gap-1 bg-amber-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Award size={11} /> Best Rate
          </div>
        )}
      </div>

      {/* Approval probability bar */}
      {offer.approvalProbability !== undefined && (
        <div className="px-4 py-2 bg-[var(--surface)] border-t border-gray-50">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-[var(--ink-muted)]">Approval Probability</span>
            <span className={`font-semibold ${offer.approvalProbability >= 70 ? "text-emerald-600" : offer.approvalProbability >= 40 ? "text-amber-600" : "text-red-500"}`}>
              {offer.approvalProbability}%
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                offer.approvalProbability >= 70 ? GRADE_CONFIG.A.bar :
                offer.approvalProbability >= 50 ? GRADE_CONFIG.B.bar :
                offer.approvalProbability >= 30 ? GRADE_CONFIG.C.bar : GRADE_CONFIG.D.bar
              }`}
              style={{ width: `${offer.approvalProbability}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-4 pt-3 bg-[var(--surface)]">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-[var(--ink-muted)] mb-0.5">Approved Amount</p>
            <p className="text-2xl font-semibold text-[var(--ink)]">₹{offer.approvedAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--ink-muted)] mb-0.5">Interest Rate</p>
            <div className="flex items-center gap-1 justify-end">
              <TrendingDown size={14} className="text-emerald-500" />
              <p className="text-2xl font-semibold text-emerald-600">{offer.interestRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[var(--brand-soft)] rounded-xl p-2.5 text-center">
            <p className="text-xs text-blue-400 mb-0.5">EMI/Month</p>
            <p className="text-sm font-semibold text-[var(--brand)]">₹{offer.emi.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-[var(--brand-soft)] rounded-xl p-2.5 text-center">
            <p className="text-xs text-blue-400 mb-0.5">Tenure</p>
            <p className="text-sm font-semibold text-[var(--brand-2)]">{offer.tenure >= 12 ? `${Math.round(offer.tenure / 12)} yr` : `${offer.tenure}m`}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-amber-400 mb-0.5">Proc. Fee</p>
            <p className="text-sm font-semibold text-amber-700">₹{offer.processingFee.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <button onClick={onApply}
          className={`w-full font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${isTop ? "btn-gradient text-white" : "bg-gray-900 text-white"}`}>
          {offer.bankName} {applyLabel} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Rejection reason helpers ─────────────────────────────────────────────
const REASON_META: Record<RejectionReason, { label: string; icon: typeof XCircle; color: string; tip: string }> = {
  income_below_min:             { label: "Income Too Low",                icon: TrendingDown,   color: "text-red-500",    tip: "Increase your declared income or upload a bank statement showing higher average balance." },
  foir_exceeded:                { label: "Existing EMIs Too High (FOIR)", icon: AlertTriangle,  color: "text-amber-500",  tip: "Pay off existing loans to reduce your Fixed Obligation to Income Ratio below 50%." },
  cibil_below_min:              { label: "CIBIL Score Too Low",           icon: XCircle,        color: "text-red-500",    tip: "Clear overdue loans, avoid late payments, and dispute errors on your CIBIL report." },
  bounces_exceeded_global:      { label: "Too Many Cheque Bounces",       icon: XCircle,        color: "text-red-500",    tip: "Maintain a minimum balance to prevent bounces for at least 6 months before applying." },
  bounces_exceeded_strict:      { label: "Cheque Bounces (Strict Bank)",  icon: XCircle,        color: "text-red-600",    tip: "Target banks with more lenient bounce policies, or clear your record over 6 months." },
  salary_credits_insufficient:  { label: "Insufficient Salary Credits",   icon: AlertTriangle,  color: "text-amber-500",  tip: "Ensure salary is credited regularly for at least 3–6 months in the same account." },
  age_out_of_range:             { label: "Age Not in Eligible Range",     icon: Info,           color: "text-blue-500",   tip: "Some banks have stricter age limits. Try a shorter loan tenure." },
  employment_type_not_allowed:  { label: "Employment Type Restricted",    icon: Info,           color: "text-blue-500",   tip: "Some banks don't lend to self-employed. Try salaried-friendly banks." },
  loan_type_not_offered:        { label: "Loan Type Not Offered",         icon: Info,           color: "text-blue-500",   tip: "Select a different loan type or a bank that offers this product." },
  amount_below_min:             { label: "Amount Below Bank Minimum",     icon: AlertTriangle,  color: "text-amber-500",  tip: "Try requesting a higher loan amount to meet bank minimums." },
  inactive:                     { label: "Account History Insufficient",  icon: XCircle,        color: "text-red-500",    tip: "Use an account with at least 6 months of active transactions for upload." },
};

function groupRejections(rejected: RejectedBank[]): { reason: RejectionReason; banks: string[] }[] {
  const map: Record<string, string[]> = {};
  for (const r of rejected) {
    if (!map[r.reason]) map[r.reason] = [];
    map[r.reason].push(r.bankName);
  }
  return Object.entries(map).map(([reason, banks]) => ({ reason: reason as RejectionReason, banks }));
}

function RejectionReport({
  audit, userDetails, loanRequirement, statementAnalysis, onRetry, onDownload, downloading, lang,
}: {
  audit: import("@/lib/store").DecisionAudit | null;
  userDetails: Partial<import("@/lib/store").UserDetails>;
  loanRequirement: Partial<import("@/lib/store").LoanRequirement>;
  statementAnalysis: import("@/lib/store").StatementAnalysis | null;
  onRetry: () => void;
  onDownload: () => void;
  downloading: boolean;
  lang: string;
}) {
  const income = audit?.inputSnapshot.effectiveIncome ?? statementAnalysis?.avgMonthlyIncome ?? userDetails.monthlyIncome ?? 0;
  const foir = audit?.inputSnapshot.foir ?? statementAnalysis?.foir ?? 0;
  const bounces = audit?.inputSnapshot.bounceCount ?? statementAnalysis?.bounceCount ?? 0;
  const cibil = audit?.inputSnapshot.cibilScore ?? userDetails.cibilScore;
  const grouped = audit ? groupRejections(audit.rejectedBanks) : [];
  const totalRejected = audit?.rejectedBanks.length ?? 0;
  const fmt = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-dvh bg-[var(--surface)] w-full max-w-md mx-auto px-4 py-6 pb-10">
      {/* Header */}
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={20} className="text-red-200" />
              <h2 className="text-xl font-semibold">No Banks Eligible</h2>
            </div>
            <p className="text-white/70 text-sm">{totalRejected} banks checked · 0 approved</p>
          </div>
          <button onClick={onDownload} disabled={downloading}
            className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-60">
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
            {downloading ? "Generating…" : "Full Report"}
          </button>
        </div>
        {/* Profile snapshot */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white/60 text-xs mb-0.5">Income</p>
            <p className="text-sm font-semibold">{income >= 100000 ? `₹${(income/100000).toFixed(1)}L` : `₹${(income/1000).toFixed(0)}K`}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white/60 text-xs mb-0.5">FOIR</p>
            <p className={`text-sm font-semibold ${foir > 0.55 ? "text-red-300" : foir > 0.40 ? "text-amber-300" : "text-green-300"}`}>{Math.round(foir * 100)}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white/60 text-xs mb-0.5">Bounces</p>
            <p className={`text-sm font-semibold ${bounces > 2 ? "text-red-300" : bounces > 0 ? "text-amber-300" : "text-green-300"}`}>{bounces}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white/60 text-xs mb-0.5">CIBIL</p>
            <p className={`text-sm font-semibold ${!cibil ? "text-white/50" : cibil >= 700 ? "text-green-300" : cibil >= 650 ? "text-amber-300" : "text-red-300"}`}>{cibil ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {statementAnalysis && <AiScoreCard analysis={statementAnalysis} lang={lang} />}

      {/* Why rejected */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> Reasons for Rejection
        </h3>
        <div className="space-y-2.5">
          {grouped.map(({ reason, banks }) => {
            const meta = REASON_META[reason] ?? { label: reason, icon: Info, color: "text-gray-500", tip: "" };
            const Icon = meta.icon;
            return (
              <div key={reason} className="bg-[var(--bg)] border border-[var(--line-soft)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] mb-0.5">{meta.label}</p>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed mb-2">{meta.tip}</p>
                    <div className="flex flex-wrap gap-1">
                      {banks.slice(0, 6).map((b) => (
                        <span key={b} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">{b}</span>
                      ))}
                      {banks.length > 6 && <span className="text-xs text-[var(--ink-muted)]">+{banks.length - 6} more</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {grouped.length === 0 && (
            <div className="bg-[var(--bg)] border border-[var(--line-soft)] rounded-2xl p-4 text-sm text-[var(--ink-muted)]">
              Profile did not meet minimum eligibility criteria across all 33 banks.
            </div>
          )}
        </div>
      </div>

      {/* How to improve */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
        <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <TrendingUp size={14} /> How to Become Eligible
        </h3>
        <div className="space-y-2.5">
          {foir > 0.50 && (
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-emerald-900">Reduce existing EMIs</p>
                <p className="text-xs text-emerald-700">Your FOIR is {Math.round(foir*100)}%. Pay off loans to bring it below 50%.</p>
              </div>
            </div>
          )}
          {cibil !== undefined && cibil < 700 && (
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{foir > 0.50 ? 2 : 1}</span>
              <div>
                <p className="text-sm font-medium text-emerald-900">Improve CIBIL score</p>
                <p className="text-xs text-emerald-700">Score is {cibil}. Pay dues on time — most banks need 700+.</p>
              </div>
            </div>
          )}
          {bounces > 0 && (
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {[foir > 0.50, cibil !== undefined && cibil < 700].filter(Boolean).length + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-emerald-900">Stop cheque bounces</p>
                <p className="text-xs text-emerald-700">Maintain adequate balance — {bounces} bounce{bounces > 1 ? "s" : ""} found in statement.</p>
              </div>
            </div>
          )}
          {income < 25000 && (
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {[foir > 0.50, cibil !== undefined && cibil < 700, bounces > 0].filter(Boolean).length + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-emerald-900">Declare higher income</p>
                <p className="text-xs text-emerald-700">Most banks need ₹25,000+ monthly. Add all income sources.</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
            <div>
              <p className="text-sm font-medium text-emerald-900">Re-check eligibility in 3–6 months</p>
              <p className="text-xs text-emerald-700">After improvements, run a fresh postmoney check — Zero CIBIL impact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan details applied */}
      <div className="bg-[var(--bg)] border border-[var(--line-soft)] rounded-2xl p-4 mb-5">
        <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3">Loan Applied For</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-[var(--ink-muted)] mb-0.5">Type</p>
            <p className="text-sm font-semibold text-[var(--ink)] capitalize">{loanRequirement.loanType ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-muted)] mb-0.5">Amount</p>
            <p className="text-sm font-semibold text-[var(--ink)]">{loanRequirement.amount ? fmt(loanRequirement.amount) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-muted)] mb-0.5">Tenure</p>
            <p className="text-sm font-semibold text-[var(--ink)]">{loanRequirement.tenure ? `${Math.round(loanRequirement.tenure / 12)}yr` : "—"}</p>
          </div>
        </div>
      </div>

      <button onClick={onRetry}
        className="w-full btn-gradient text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 text-base">
        <RefreshCcw size={18} /> Start Fresh
      </button>
      <p className="text-center text-xs text-[var(--ink-muted)] mt-3">No additional CIBIL impact for re-checking</p>
    </div>
  );
}

function ResultsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { bankOffers, statementAnalysis, userDetails, loanRequirement, decisionAudit, setSelectedBank, setBankOffers, setLastRoute, lang } = useAppStore();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLastRoute("/results");
    if (params.get("demo") === "1" && bankOffers.length === 0) setBankOffers(DEMO_OFFERS);
  }, []);

  const income = statementAnalysis?.avgMonthlyIncome ?? userDetails.monthlyIncome ?? 50000;
  const foir = statementAnalysis?.foir ?? 0.2;

  async function downloadReport() {
    setDownloading(true);
    try {
      const payload = {
        user: {
          name: userDetails.name ?? "",
          mobile: userDetails.mobile ?? "",
          pan: userDetails.pan ?? "",
          employmentType: userDetails.employmentType ?? "salaried",
          dob: userDetails.dob ?? "",
        },
        loan: {
          loanType: loanRequirement.loanType ?? "personal",
          amount: loanRequirement.amount ?? 0,
          tenure: loanRequirement.tenure ?? 36,
        },
        statement: statementAnalysis ?? {
          avgMonthlyIncome: userDetails.monthlyIncome ?? 0,
          avgMonthlyBalance: (userDetails.monthlyIncome ?? 0) * 1.8,
          totalObligations: (userDetails.monthlyIncome ?? 0) * 0.2,
          foir: 0.2, bounceCount: 0, salaryCredits: 6, transactionCount: 0,
        },
        offers: bankOffers,
        audit: decisionAudit,
      };
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `postmoney_Report_${userDetails.name?.replace(/\s+/g, "_") || "Report"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleApply(offer: BankOffer) {
    setSelectedBank(offer);
    saveSession(userDetails.mobile ?? "", {
      step: 5, lastRoute: "/apply", paymentDone: true,
      userDetails: { name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob, employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome, cibilScore: userDetails.cibilScore },
      loanRequirement: { loanType: loanRequirement.loanType, amount: loanRequirement.amount, tenure: loanRequirement.tenure },
    });
    router.push("/apply");
  }

  function shareWA() {
    const best = bankOffers[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://postmoney-ten.vercel.app";
    const text = `I checked my loan eligibility on postmoney!\n\n${best?.bankName} pre-approved ₹${best?.approvedAmount.toLocaleString("en-IN")} @ ${best?.interestRate}% p.a.\n\nCheck yours — Zero CIBIL impact: ${appUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (!bankOffers.length) {
    return <RejectionReport audit={decisionAudit} userDetails={userDetails} loanRequirement={loanRequirement} statementAnalysis={statementAnalysis} onRetry={() => router.push("/")} onDownload={downloadReport} downloading={downloading} lang={lang} />;
  }

  return (
    <div className="min-h-dvh bg-[var(--surface)] w-full max-w-md mx-auto px-5 py-6">
      {/* Hero */}
      <div className="hero-bg rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-yellow-400" />
              <h2 className="text-2xl font-semibold">{t(lang, "resultHeading")}</h2>
            </div>
            <p className="text-white/70 text-sm">{bankOffers.length} {t(lang, "resultSub")}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={shareWA} className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
              <Share2 size={13} /> Share
            </button>
            <button onClick={downloadReport} disabled={downloading}
              className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-60">
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
              {downloading ? "Generating…" : "AI Report"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">Income</p>
            <p className="text-sm font-semibold">₹{(income / 1000).toFixed(0)}K/mo</p>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">FOIR</p>
            <p className="text-sm font-semibold">{Math.round(foir * 100)}%</p>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <p className="text-xs text-white/60 mb-0.5">Banks</p>
            <p className="text-sm font-semibold">{bankOffers.length} Match</p>
          </div>
        </div>
      </div>

      {statementAnalysis && <AiScoreCard analysis={statementAnalysis} lang={lang} />}

      <div className="space-y-4">
        {bankOffers.map((offer, i) => (
          <BankCard key={i} offer={offer} rank={i} onApply={() => handleApply(offer)} applyLabel={t(lang, "applyBtn")} />
        ))}
      </div>

      <p className="text-center text-xs text-[var(--ink-muted)] mt-5 pb-4">
        Hard CIBIL inquiry only occurs when you formally submit an application to a bank
      </p>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><div className="text-[var(--brand)] font-medium">Loading results...</div></div>}>
      <ResultsInner />
    </Suspense>
  );
}
