"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, Loader2, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Shield, ShieldAlert, IndianRupee,
  BarChart2, Activity, FileText, Zap, Info, Sparkles, MessageCircle, Send,
  RefreshCw, Bot,
} from "lucide-react";
import type { StatementIntelligence, MonthSummary, FraudSignal, TxCategory } from "@/lib/statement-engine";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function pct(n: number) { return `${Math.round(n * 100)}%`; }

const DECISION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  STRONG_APPROVE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Strong Approve" },
  APPROVE:        { bg: "bg-blue-100",    text: "text-blue-700",    label: "Approve" },
  MANUAL_REVIEW:  { bg: "bg-amber-100",   text: "text-amber-700",   label: "Manual Review" },
  REJECT:         { bg: "bg-red-100",     text: "text-red-700",     label: "Reject" },
};

const FRAUD_SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const CAT_LABELS: Partial<Record<TxCategory, string>> = {
  SALARY: "Salary", BUSINESS_INFLOW: "Business Inflow", EMI: "EMI",
  NACH_ECS: "NACH/ECS", CREDIT_CARD: "Credit Card", BNPL: "BNPL",
  ATM_CASH: "ATM Cash", INVESTMENT: "Investment", INSURANCE: "Insurance",
  RENT: "Rent", FOOD_DELIVERY: "Food", TRANSPORT: "Transport",
  ECOMMERCE: "E-commerce", UTILITIES: "Utilities", TELECOM: "Telecom",
  MEDICAL: "Medical", EDUCATION: "Education", TAX: "Tax",
  GAMBLING: "Gambling", LOAN_APP: "Loan Apps", WALLET: "Wallet",
  NEFT_RTGS: "NEFT/RTGS", UPI_TRANSFER: "UPI Transfer", OTHER: "Other",
};

const CAT_COLORS: Partial<Record<TxCategory, string>> = {
  SALARY: "#16a34a", BUSINESS_INFLOW: "#0891b2", EMI: "#dc2626",
  NACH_ECS: "#b91c1c", CREDIT_CARD: "#7c3aed", BNPL: "#9333ea",
  ATM_CASH: "#ca8a04", INVESTMENT: "#0f766e", INSURANCE: "#0369a1",
  RENT: "#c2410c", FOOD_DELIVERY: "#ea580c", TRANSPORT: "#0284c7",
  ECOMMERCE: "#7c3aed", GAMBLING: "#991b1b", LOAN_APP: "#be123c",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const pctFill = ((score - 300) / 600) * 100;
  const color = score >= 800 ? "#16a34a" : score >= 700 ? "#2563eb" : score >= 580 ? "#d97706" : "#dc2626";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="48" fill="none" stroke="#e5e7eb" strokeWidth="14" />
          <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${(pctFill / 100) * 301.6} 301.6`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/ 900</span>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <span className={`text-sm font-semibold ${good === true ? "text-emerald-600" : good === false ? "text-red-500" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = score / max * 100;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : pct >= 30 ? "#d97706" : "#dc2626";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function AiTextRenderer({ text, compact }: { text: string; compact?: boolean }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) { nodes.push(<div key={key++} className="h-2" />); continue; }

    // Section headers (ALL CAPS lines or lines ending with colon)
    if (/^[A-Z][A-Z\s\-–—]{4,}$/.test(line) || /^[A-Z][A-Z\s]+:$/.test(line)) {
      nodes.push(
        <p key={key++} className={`font-bold text-gray-900 ${compact ? "text-xs mt-3 mb-1" : "text-sm mt-4 mb-1.5"} tracking-wide`}>
          {line}
        </p>,
      );
      continue;
    }
    // Month lines like "Month 1 — Foundation:" or "Month 1:"
    if (/^Month \d/i.test(line)) {
      nodes.push(
        <p key={key++} className={`font-semibold text-violet-700 ${compact ? "text-xs mt-2" : "text-sm mt-3"}`}>
          {line}
        </p>,
      );
      continue;
    }
    // Bullet / numbered list
    if (/^[\-•*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const content = line.replace(/^[\-•*\d.]\s+/, "");
      nodes.push(
        <div key={key++} className={`flex gap-2 ${compact ? "text-xs" : "text-sm"} text-gray-700`}>
          <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
        </div>,
      );
      continue;
    }
    // Normal paragraph
    nodes.push(
      <p
        key={key++}
        className={`${compact ? "text-xs" : "text-sm"} text-gray-700 leading-relaxed`}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
      />,
    );
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

function MonthTable({ months }: { months: MonthSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            <th className="text-left px-3 py-2 font-medium">Month</th>
            <th className="text-right px-3 py-2 font-medium">Credits</th>
            <th className="text-right px-3 py-2 font-medium">Debits</th>
            <th className="text-right px-3 py-2 font-medium">Salary</th>
            <th className="text-right px-3 py-2 font-medium">EMI</th>
            <th className="text-right px-3 py-2 font-medium">Min Bal</th>
            <th className="text-right px-3 py-2 font-medium">Avg Bal</th>
            <th className="text-center px-3 py-2 font-medium">Bounces</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.monthKey} className="border-t border-gray-50 hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-700">{m.label}</td>
              <td className="px-3 py-2 text-right text-emerald-600">{fmt(m.totalCredits)}</td>
              <td className="px-3 py-2 text-right text-red-500">{fmt(m.totalDebits)}</td>
              <td className="px-3 py-2 text-right text-blue-600">{m.salaryAmount > 0 ? fmt(m.salaryAmount) : "—"}</td>
              <td className="px-3 py-2 text-right text-orange-600">{m.emiTotal > 0 ? fmt(m.emiTotal) : "—"}</td>
              <td className={`px-3 py-2 text-right font-medium ${m.minBalance < 5000 ? "text-red-500" : m.minBalance < 10000 ? "text-amber-500" : "text-gray-700"}`}>
                {fmt(m.minBalance)}
              </td>
              <td className="px-3 py-2 text-right text-gray-600">{fmt(m.avgBalance)}</td>
              <td className="px-3 py-2 text-center">
                {m.bounceCount > 0
                  ? <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 rounded-full font-bold">{m.bounceCount}</span>
                  : <span className="text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "overview" | "income" | "obligations" | "spending" | "fraud" | "monthly" | "debug" | "ai";

export default function StatementAnalyserPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const debugRef = useRef<HTMLInputElement>(null);
  const pwdRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StatementIntelligence | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [income, setIncome] = useState("");
  const [fileName, setFileName] = useState("");
  const [debugData, setDebugData] = useState<{ lines: string[]; preview: string; pages: number; textLength: number } | null>(null);

  // AI state
  const [aiInsights, setAiInsights] = useState("");
  const [aiInsightsLoaded, setAiInsightsLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [debugAiReport, setDebugAiReport] = useState("");
  const [debugAiLoaded, setDebugAiLoaded] = useState(false);

  // Password popup state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  async function runAnalysis(file: File, password?: string) {
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("declaredIncome", income || "0");
      if (password) form.append("password", password);
      const res = await fetch("/api/analyse-statement", { method: "POST", body: form });
      const data = await res.json();
      if (res.status === 422 && data.error?.toLowerCase().includes("password")) {
        // PDF is password-protected — show popup
        setPendingFile(file);
        setPdfPassword("");
        setPwdError("");
        setShowPwdModal(true);
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data as StatementIntelligence);
      setTab("overview");
      setShowPwdModal(false);
      setPendingFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setDebugData(null);
    runAnalysis(file);
  }

  async function handleDebugUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/debug-pdf", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDebugData(data);
      setTab("debug");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Debug failed");
    } finally {
      setLoading(false);
      if (debugRef.current) debugRef.current.value = "";
    }
  }

  async function handlePasswordSubmit() {
    if (!pendingFile) return;
    if (!pdfPassword.trim()) { setPwdError("Please enter the password"); return; }
    setPwdError("");
    setShowPwdModal(false);
    const res = await fetch("/api/analyse-statement", {
      method: "POST",
      body: (() => { const f = new FormData(); f.append("file", pendingFile); f.append("declaredIncome", income || "0"); f.append("password", pdfPassword.trim()); return f; })(),
    });
    setLoading(true);
    try {
      const data = await res.json();
      if (res.status === 422) {
        // Wrong password
        setShowPwdModal(true);
        setPwdError("Incorrect password — try again");
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data as StatementIntelligence);
      setTab("overview");
      setPendingFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadInsights(force = false) {
    if (!result) return;
    if (aiInsightsLoaded && !force) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "insights", statementData: result }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiInsights(data.text ?? "");
      setAiInsightsLoaded(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function loadDebugAi(force = false) {
    if (!result) return;
    if (debugAiLoaded && !force) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "debug",
          statementData: result,
          rawDebugInfo: debugData?.preview ?? "",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDebugAiReport(data.text ?? "");
      setDebugAiLoaded(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || !result || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          message: userMsg,
          history: chatMessages,
          statementData: result,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages((prev) => [...prev, { role: "assistant", text: data.text ?? "" }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err instanceof Error ? err.message : "Request failed"}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const dec = result ? DECISION_COLORS[result.lendingDecision] ?? DECISION_COLORS.MANUAL_REVIEW : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Admin
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#0a3d2e]" />
          <span className="font-semibold text-gray-900">Statement Intelligence Analyser</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Internal</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Password popup modal */}
        {showPwdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PDF is Password Protected</p>
                  <p className="text-xs text-gray-400">{fileName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Enter the PDF password to unlock and analyse the statement.
                <span className="block mt-1 text-xs text-gray-400">Common passwords: Date of Birth (01011990), last 4 digits of mobile, or account number.</span>
              </p>
              <input
                ref={pwdRef}
                type="text"
                placeholder="Enter PDF password"
                value={pdfPassword}
                onChange={(e) => { setPdfPassword(e.target.value); setPwdError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm mb-1 focus:outline-none ${pwdError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#0a3d2e]"}`}
              />
              {pwdError && <p className="text-xs text-red-500 mb-3">{pwdError}</p>}
              {!pwdError && <div className="mb-3" />}
              <div className="flex gap-2">
                <button onClick={() => { setShowPwdModal(false); setPendingFile(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button onClick={handlePasswordSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-[#0a3d2e] text-white text-sm font-medium hover:bg-[#0d4f3a] flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Unlock & Analyse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-60">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Declared Monthly Income (optional)</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="e.g. 50000" value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#0a3d2e]" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer font-medium text-sm text-white transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0a3d2e] hover:bg-[#0d4f3a]"}`}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {loading ? "Analysing…" : "Upload & Analyse"}
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={handleUpload} disabled={loading} />
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ${loading ? "opacity-40 cursor-not-allowed" : ""}`}
                title="Extract raw PDF text to debug parsing issues">
                <FileText size={15} />
                Debug PDF
                <input ref={debugRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={handleDebugUpload} disabled={loading} />
              </label>
            </div>
          </div>
          {fileName && !loading && !showPwdModal && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><FileText size={12} />{fileName}</p>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-sm">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Debug panel */}
        {debugData && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-blue-500" />
                <span className="font-semibold text-gray-900">Raw PDF Text</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{debugData.pages} pages · {debugData.textLength.toLocaleString()} chars · {debugData.lines.length} lines</span>
              </div>
              <button onClick={() => setDebugData(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Close</button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead><tr className="bg-gray-50"><th className="text-left px-2 py-1 text-gray-400 w-10">#</th><th className="text-left px-2 py-1 text-gray-400">Line</th></tr></thead>
                <tbody>
                  {debugData.lines.map((line, idx) => (
                    <tr key={idx} className={`border-t border-gray-50 ${/\d{1,2}[\-\/\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line) || /\d{1,2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}/.test(line) ? "bg-emerald-50" : ""}`}>
                      <td className="px-2 py-1 text-gray-300 select-none">{idx + 1}</td>
                      <td className="px-2 py-1 text-gray-700 break-all">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {debugData.lines.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No text lines extracted — may be a scanned/image PDF.</p>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 rounded-b-2xl text-xs text-gray-400">
              Rows highlighted in green have a recognisable date pattern. Use this to verify date formats before re-analysing.
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-[#0a3d2e] mx-auto mb-4" />
            <p className="font-semibold text-gray-800 mb-1">Analysing Statement…</p>
            <p className="text-sm text-gray-400">Parsing transactions · Categorising · Detecting fraud · Scoring</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Summary hero */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-6">
                <ScoreGauge score={result.lendingScore} />
                <div className="flex-1 min-w-56">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${dec?.bg} ${dec?.text}`}>
                      {dec?.label ?? result.lendingDecision}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                      result.fraudRisk === "high" ? "bg-red-50 text-red-600 border-red-100" :
                      result.fraudRisk === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      Fraud Risk: {result.fraudRisk.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {result.detectedBank} · {result.statementMonths} months · {result.transactionCount} transactions
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${result.parseQuality === "high" ? "bg-green-50 text-green-600" : result.parseQuality === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}>
                      Parse: {result.parseQuality}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <MetricRow label="Avg Monthly Income"  value={fmt(result.avgMonthlyIncome)} good={result.avgMonthlyIncome >= 25000} />
                    <MetricRow label="Avg Balance"          value={fmt(result.avgMonthlyBalance)} good={result.avgMonthlyBalance >= 20000} />
                    <MetricRow label="Min Balance (lowest)" value={fmt(result.minMonthlyBalance)} good={result.minMonthlyBalance >= 5000} />
                    <MetricRow label="FOIR"                 value={pct(result.foir)} good={result.foir <= 0.45} />
                    <MetricRow label="Total EMI / Month"    value={fmt(result.totalObligations)} />
                    <MetricRow label="Bounces"              value={String(result.bounceCount)} good={result.bounceCount === 0} />
                  </div>
                </div>
                {/* Score breakdown */}
                <div className="min-w-56 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Breakdown</p>
                  {result.scoreBreakdown ? (
                    <>
                      <ScoreBar label="Income Stability" score={result.scoreBreakdown.incomeStability ?? 0} max={25} />
                      <ScoreBar label="Bounce History"   score={result.scoreBreakdown.bounceHistory ?? 0}   max={25} />
                      <ScoreBar label="Balance Quality"  score={result.scoreBreakdown.balanceQuality ?? 0}  max={20} />
                      <ScoreBar label="FOIR"             score={result.scoreBreakdown.foirScore ?? 0}        max={15} />
                      <ScoreBar label="Spending Pattern" score={result.scoreBreakdown.spendingPattern ?? 0}  max={15} />
                      <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                        <span className="font-medium text-gray-600">Total</span>
                        <span className="font-bold text-gray-900">{result.scoreBreakdown.total ?? 0}/100</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Score not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 bg-white rounded-2xl border border-gray-200 p-1 mb-5 overflow-x-auto shadow-sm">
              {([
                ["overview",     "Overview",   <BarChart2 size={13} />],
                ["income",       "Income",     <TrendingUp size={13} />],
                ["obligations",  "Obligations",<IndianRupee size={13} />],
                ["spending",     "Spending",   <Activity size={13} />],
                ["fraud",        "Fraud Signals", result.fraudSignals.length > 0
                  ? <ShieldAlert size={13} className="text-red-500" />
                  : <Shield size={13} className="text-emerald-500" />],
                ["monthly",      "Monthly",    <FileText size={13} />],
                ["ai",           "AI Insights", <Sparkles size={13} className="text-violet-500" />],
              ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
                <button key={id} onClick={() => { setTab(id); if (id === "ai") loadInsights(); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    tab === id ? "bg-[#0a3d2e] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  {icon}{label}
                  {id === "fraud" && result.fraudSignals.length > 0 && (
                    <span className="ml-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {result.fraudSignals.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

              {/* ── Overview ── */}
              {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap size={15} className="text-amber-500" />Key Signals</h3>
                    <div className="space-y-0">
                      <MetricRow label="Primary Income Source"  value={result.primaryIncomeSource} />
                      <MetricRow label="Income Stability"       value={`${result.incomeStabilityScore}/100`} good={result.incomeStabilityScore >= 70} />
                      <MetricRow label="Salary Months"          value={`${result.salaryMonths} / ${result.statementMonths}`} good={result.salaryMonths >= result.statementMonths * 0.8} />
                      <MetricRow label="Avg Salary Credit"      value={result.avgSalaryAmount > 0 ? fmt(result.avgSalaryAmount) : "Not detected"} />
                      <MetricRow label="Business Inflow"        value={result.businessInflow > 0 ? fmt(result.businessInflow) + "/mo" : "None"} />
                      <MetricRow label="Has Investments (SIP etc)" value={result.hasInvestments ? "Yes ✓" : "No"} good={result.hasInvestments} />
                      <MetricRow label="Has Insurance"          value={result.hasInsurance ? "Yes ✓" : "No"} good={result.hasInsurance} />
                      <MetricRow label="Loan App Usage"         value={result.loanAppUsage ? "⚠ Detected" : "None"} good={!result.loanAppUsage} />
                      <MetricRow label="Gambling"               value={result.gamblingDetected ? "⚠ Detected" : "None"} good={!result.gamblingDetected} />
                      <MetricRow label="BNPL Usage"             value={result.bnplUsage ? `Yes (${fmt(result.bnplAmount)}/mo)` : "No"} good={!result.bnplUsage} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingDown size={15} className="text-blue-500" />Balance Profile</h3>
                    <div className="space-y-0">
                      <MetricRow label="Avg Monthly Balance"    value={fmt(result.avgMonthlyBalance)} good={result.avgMonthlyBalance >= 20000} />
                      <MetricRow label="Avg Min Monthly Bal"    value={fmt(result.avgMinMonthlyBalance)} good={result.avgMinMonthlyBalance >= 5000} />
                      <MetricRow label="Absolute Min Balance"   value={fmt(result.minMonthlyBalance)} good={result.minMonthlyBalance >= 2000} />
                      <MetricRow label="Cash Withdrawal Ratio"  value={pct(result.cashWithdrawalRatio)} good={result.cashWithdrawalRatio < 0.20} />
                      <MetricRow label="Existing EMIs"          value={fmt(result.existingEMIs) + "/mo"} />
                      <MetricRow label="Credit Card Dues"       value={result.creditCardDues > 0 ? fmt(result.creditCardDues) + "/mo" : "None"} />
                      <MetricRow label="FOIR"                   value={pct(result.foir)} good={result.foir <= 0.45} />
                      <MetricRow label="Total Bounces"          value={String(result.bounceCount)} good={result.bounceCount === 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Income ── */}
              {tab === "income" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><TrendingUp size={15} className="text-emerald-500" />Income Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      ["Avg Monthly Income",   fmt(result.avgMonthlyIncome),   result.avgMonthlyIncome >= 25000],
                      ["Avg Salary",           result.avgSalaryAmount > 0 ? fmt(result.avgSalaryAmount) : "—", true],
                      ["Business Inflow",      result.businessInflow > 0 ? fmt(result.businessInflow) : "None", true],
                      ["Salary Consistency",   `${result.salaryMonths}/${result.statementMonths} mo`, result.salaryMonths >= result.statementMonths * 0.8],
                    ].map(([label, value, good]) => (
                      <div key={String(label)} className={`rounded-xl p-4 border ${good ? "border-emerald-200 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
                        <p className="text-xs text-gray-500 mb-1">{String(label)}</p>
                        <p className={`text-xl font-bold ${good ? "text-emerald-700" : "text-red-600"}`}>{String(value)}</p>
                      </div>
                    ))}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Income Trend</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 text-xs text-gray-500">Month</th><th className="text-right px-3 py-2 text-xs text-gray-500">Total Credits</th><th className="text-right px-3 py-2 text-xs text-gray-500">Salary</th><th className="text-right px-3 py-2 text-xs text-gray-500">Business</th></tr></thead>
                      <tbody>
                        {result.monthlyBreakdown.map((m) => (
                          <tr key={m.monthKey} className="border-t border-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-700">{m.label}</td>
                            <td className="px-3 py-2 text-right text-emerald-600 font-medium">{fmt(m.totalCredits)}</td>
                            <td className="px-3 py-2 text-right text-blue-600">{m.salaryAmount > 0 ? fmt(m.salaryAmount) : "—"}</td>
                            <td className="px-3 py-2 text-right text-teal-600">{m.investmentAmount > 0 ? fmt(m.investmentAmount) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Obligations ── */}
              {tab === "obligations" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><IndianRupee size={15} className="text-red-500" />Obligations & Debt Burden</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {[
                      ["Avg Monthly Income", fmt(result.avgMonthlyIncome)],
                      ["EMI (avg/mo)",        fmt(result.existingEMIs)],
                      ["CC Dues (avg/mo)",    result.creditCardDues > 0 ? fmt(result.creditCardDues) : "None"],
                      ["BNPL (avg/mo)",       result.bnplAmount > 0 ? fmt(result.bnplAmount) : "None"],
                      ["Total Obligations",   fmt(result.totalObligations)],
                      ["FOIR",               pct(result.foir)],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl p-4 border border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400 mb-1">{String(label)}</p>
                        <p className="text-lg font-bold text-gray-800">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                  {/* FOIR bar */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>FOIR: {pct(result.foir)}</span>
                      <span className={result.foir <= 0.45 ? "text-emerald-600" : result.foir <= 0.55 ? "text-amber-600" : "text-red-600"}>
                        {result.foir <= 0.35 ? "Excellent" : result.foir <= 0.45 ? "Good" : result.foir <= 0.55 ? "High" : "Very High"}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${result.foir <= 0.45 ? "bg-emerald-500" : result.foir <= 0.55 ? "bg-amber-400" : "bg-red-500"}`}
                        style={{ width: `${Math.min(result.foir * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span><span>Safe: 50%</span><span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Spending ── */}
              {tab === "spending" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><Activity size={15} className="text-purple-500" />Spending Breakdown (avg/month)</h3>
                  <div className="space-y-2">
                    {Object.entries(result.categorySpend ?? {})
                      .filter(([, v]) => (v ?? 0) > 0)
                      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                      .map(([cat, amount]) => {
                        const label = CAT_LABELS[cat as TxCategory] ?? cat;
                        const color = CAT_COLORS[cat as TxCategory] ?? "#6b7280";
                        const allVals = Object.values(result.categorySpend ?? {}).filter(Boolean) as number[];
                        const maxAmt = allVals.length > 0 ? Math.max(...allVals) : 1;
                        const barW = maxAmt > 0 ? ((amount ?? 0) / maxAmt) * 100 : 0;
                        const isRisk = ["GAMBLING", "LOAN_APP", "BNPL"].includes(cat);
                        return (
                          <div key={cat} className={`flex items-center gap-3 p-2 rounded-xl ${isRisk ? "bg-red-50 border border-red-100" : "hover:bg-gray-50"}`}>
                            <span className="w-28 text-xs text-gray-600 flex-shrink-0">{label}{isRisk && " ⚠"}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${barW}%`, background: color }} />
                            </div>
                            <span className="w-20 text-right text-xs font-semibold text-gray-700">{fmt(amount)}/mo</span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                      <p className="text-xs text-amber-600 mb-1">Cash Withdrawal</p>
                      <p className="font-bold text-amber-700">{pct(result.cashWithdrawalRatio)}</p>
                      <p className="text-xs text-amber-500">of total spend</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${result.hasInvestments ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
                      <p className="text-xs text-gray-500 mb-1">Investments</p>
                      <p className={`font-bold ${result.hasInvestments ? "text-emerald-700" : "text-gray-400"}`}>
                        {result.hasInvestments ? fmt(result.investmentAmount) + "/mo" : "None"}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 border ${result.hasInsurance ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
                      <p className="text-xs text-gray-500 mb-1">Insurance</p>
                      <p className={`font-bold ${result.hasInsurance ? "text-emerald-700" : "text-gray-400"}`}>
                        {result.hasInsurance ? "Detected ✓" : "None found"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Fraud ── */}
              {tab === "fraud" && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ShieldAlert size={15} className={result.fraudRisk === "high" ? "text-red-500" : result.fraudRisk === "medium" ? "text-amber-500" : "text-emerald-500"} />
                      Fraud Detection
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      result.fraudRisk === "high" ? "bg-red-50 text-red-600 border-red-200" :
                      result.fraudRisk === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>
                      Overall Risk: {result.fraudRisk.toUpperCase()}
                    </span>
                  </div>

                  {result.fraudSignals.length === 0 ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                      <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-800">No Fraud Signals Detected</p>
                        <p className="text-sm text-emerald-600 mt-0.5">Income appears genuine, no suspicious patterns found.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.fraudSignals.map((sig: FraudSignal, i: number) => (
                        <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${FRAUD_SEVERITY_COLORS[sig.severity]}`}>
                          {sig.severity === "high" ? <XCircle size={18} className="flex-shrink-0 mt-0.5" /> :
                           sig.severity === "medium" ? <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" /> :
                           <Info size={18} className="flex-shrink-0 mt-0.5" />}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">{sig.type.replace(/_/g, " ")}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                                sig.severity === "high" ? "bg-red-200 text-red-800" :
                                sig.severity === "medium" ? "bg-amber-200 text-amber-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>{sig.severity}</span>
                            </div>
                            <p className="text-sm">{sig.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      ["Loan App Usage", result.loanAppUsage, "KreditBee, Navi, CASHe etc."],
                      ["Gambling",       result.gamblingDetected, "Dream11, Betway etc."],
                      ["BNPL Usage",     result.bnplUsage, "Simpl, Slice, LazyPay etc."],
                      ["High Bounces",   result.bounceCount >= 2, `${result.bounceCount} bounce(s) found`],
                    ].map(([label, flag, sub]) => (
                      <div key={String(label)} className={`rounded-xl p-3 border flex items-start gap-2 ${flag ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                        {flag ? <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /> : <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{String(label)}</p>
                          <p className="text-xs text-gray-400">{String(sub)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Monthly ── */}
              {tab === "monthly" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><FileText size={15} className="text-blue-500" />Monthly Breakdown</h3>
                  {result.monthlyBreakdown.length > 0
                    ? <MonthTable months={result.monthlyBreakdown} />
                    : <p className="text-sm text-gray-400 text-center py-8">No monthly data extracted. PDF parse quality may be low.</p>
                  }
                </div>
              )}

              {/* ── AI Insights ── */}
              {tab === "ai" && (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles size={15} className="text-violet-500" />
                      AI Insights — Powered by Claude
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadDebugAi(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                        title="Run AI parse analysis"
                      >
                        <FileText size={12} /> Parse Debug
                      </button>
                      <button
                        onClick={() => loadInsights(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50"
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                    </div>
                  </div>

                  {/* Error state */}
                  {aiError && (
                    <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">AI Error</p>
                        <p className="text-xs mt-0.5 text-red-600">{aiError}</p>
                      </div>
                    </div>
                  )}

                  {/* Insights section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Score roadmap */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-violet-900 flex items-center gap-2">
                          <Sparkles size={14} /> Score 900 Roadmap
                        </p>
                        <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                          {result.lendingScore} → 900
                        </span>
                      </div>

                      {aiLoading && !aiInsights ? (
                        <div className="flex items-center gap-3 py-8 justify-center">
                          <Loader2 size={20} className="animate-spin text-violet-500" />
                          <span className="text-sm text-violet-600">Claude is analysing your statement…</span>
                        </div>
                      ) : aiInsights ? (
                        <AiTextRenderer text={aiInsights} />
                      ) : (
                        <div className="text-center py-8">
                          <Bot size={32} className="text-violet-200 mx-auto mb-3" />
                          <p className="text-sm text-violet-400">Click a tab to generate insights</p>
                        </div>
                      )}
                    </div>

                    {/* Parse debug report */}
                    {(debugAiLoaded || debugAiReport) && (
                      <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                          <FileText size={14} /> Parse Debug Analysis
                        </p>
                        {aiLoading && !debugAiReport ? (
                          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                            <Loader2 size={16} className="animate-spin" /> Analysing parse quality…
                          </div>
                        ) : (
                          <AiTextRenderer text={debugAiReport} compact />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat */}
                  <div className="mt-5 border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <MessageCircle size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Chat with your Statement</span>
                      <span className="text-xs text-gray-400 ml-auto">Ask anything about the data</span>
                    </div>

                    {/* Messages */}
                    <div className="min-h-48 max-h-80 overflow-y-auto p-4 space-y-3 bg-white">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-6">
                          <MessageCircle size={28} className="text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Ask Claude about your bank statement</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {[
                              "What is my average salary?",
                              "Why is my FOIR high?",
                              "How many bounces do I have?",
                              "What are my top spending categories?",
                            ].map((q) => (
                              <button
                                key={q}
                                onClick={() => { setChatInput(q); }}
                                className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bot size={12} className="text-violet-600" />
                            </div>
                          )}
                          <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                            msg.role === "user"
                              ? "bg-[#0a3d2e] text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Bot size={12} className="text-violet-600" />
                          </div>
                          <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-100 p-3 bg-white flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask about income, EMIs, balance, spending…"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                      />
                      <button
                        onClick={sendChat}
                        disabled={chatLoading || !chatInput.trim()}
                        className="px-3 py-2 bg-[#0a3d2e] text-white rounded-xl hover:bg-[#0d4f3a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <Activity size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-400 mb-1">No statement analysed yet</p>
            <p className="text-sm text-gray-300">Upload a 6-month bank statement PDF to get the full intelligence report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
