"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApplicationByRef, LoanApplication } from "@/lib/firestore";
import { ArrowLeft, Search, CheckCircle, Clock, FileText, IndianRupee, XCircle, Loader2 } from "lucide-react";

const STATUS_STEPS = ["submitted", "under_review", "approved", "disbursed"];
const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; bg: string; text: string }> = {
  submitted:    { label: "Application Submitted",  icon: FileText,     bg: "bg-[var(--brand)]",    text: "text-[var(--brand-3)]" },
  under_review: { label: "Under Bank Review",       icon: Clock,        bg: "bg-amber-500",   text: "text-amber-600" },
  approved:     { label: "Loan Approved",           icon: CheckCircle,  bg: "bg-emerald-600", text: "text-emerald-600" },
  rejected:     { label: "Application Rejected",   icon: XCircle,      bg: "bg-red-600",     text: "text-red-600" },
  disbursed:    { label: "Amount Disbursed",        icon: IndianRupee,  bg: "bg-[var(--brand)]",    text: "text-[var(--brand)]" },
};

export default function StatusPage() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState<LoanApplication | null>(null);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!ref.trim()) return;
    setLoading(true); setError(""); setApp(null);
    try {
      const r = await getApplicationByRef(ref.trim().toUpperCase());
      if (!r) setError("No application found for this reference number.");
      else setApp(r);
    } catch { setError("Could not fetch. Please check your connection and try again."); }
    finally { setLoading(false); }
  }

  const currentIdx = app ? STATUS_STEPS.indexOf(app.status) : -1;

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col w-full max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/")} className="w-9 h-9 bg-[var(--bg-deep)] rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Track Application</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Reference Number</label>
        <div className="flex gap-2">
          <input type="text" placeholder="e.g. HDFCBANK12345678" value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            className="flex-1 border-2 border-[var(--line-soft)] rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-[var(--brand)] uppercase tracking-wider font-medium" />
          <button onClick={handleSearch} disabled={loading || !ref.trim()}
            className="px-4 py-2 btn-gradient text-white rounded-xl font-medium disabled:opacity-60 flex items-center gap-1.5">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {!loading && "Track"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {app && (() => {
        const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted;
        const Icon = cfg.icon;
        return (
          <div className="space-y-4">
            {/* Status banner */}
            <div className={`rounded-2xl p-5 text-center text-white ${cfg.bg}`}>
              <div className="w-14 h-14 bg-[var(--surface)]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon size={28} className="text-white" />
              </div>
              <p className="text-xl font-semibold">{cfg.label}</p>
              <p className="text-white/70 text-xs mt-1">Ref: {app.referenceNo}</p>
            </div>

            {/* Progress */}
            {app.status !== "rejected" && (
              <div className="bg-[var(--surface)] border border-[var(--line-soft)] rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--ink-soft)] mb-4">Application Progress</p>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--bg-deep)]" />
                  <div className="space-y-4">
                    {STATUS_STEPS.map((step, i) => {
                      const sCfg = STATUS_CONFIG[step];
                      const SIcon = sCfg.icon;
                      const done = i < currentIdx;
                      const active = i === currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-3 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${done || active ? sCfg.bg : "bg-[var(--bg-deep)]"}`}>
                            {done ? <CheckCircle size={16} className="text-white" />
                              : <SIcon size={14} className={active ? "text-white" : "text-[var(--ink-muted)]"} />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${done || active ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"}`}>{sCfg.label}</p>
                          </div>
                          {active && <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-[var(--brand)]">Current</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-[var(--bg)] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3">Application Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--ink-muted)]">Applicant</span><span className="font-medium">{app.name}</span></div>
                <div className="flex justify-between"><span className="text-[var(--ink-muted)]">Bank</span><span className="font-medium">{app.bankName}</span></div>
                <div className="flex justify-between"><span className="text-[var(--ink-muted)]">Amount</span><span className="font-semibold text-emerald-600">₹{app.approvedAmount.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-[var(--ink-muted)]">Rate</span><span className="font-medium">{app.interestRate}% p.a.</span></div>
                <div className="flex justify-between"><span className="text-[var(--ink-muted)]">EMI</span><span className="font-semibold text-[var(--brand)]">₹{app.emi.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          </div>
        );
      })()}

      {!app && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[var(--brand-soft)] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search size={36} className="text-[var(--brand-soft)]" />
          </div>
          <p className="text-[var(--ink-muted)] text-sm">Enter your reference number to track your loan application status</p>
        </div>
      )}
    </div>
  );
}
