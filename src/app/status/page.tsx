"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApplicationByRef, LoanApplication } from "@/lib/firestore";
import { ArrowLeft, Search, CheckCircle, Clock, FileText, IndianRupee, XCircle, Loader2 } from "lucide-react";

const STATUS_STEPS = ["submitted", "under_review", "approved", "disbursed"];
const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; grad: string; text: string }> = {
  submitted:    { label: "Application Submit Hui", icon: FileText,     grad: "from-blue-500 to-indigo-500",   text: "text-blue-600" },
  under_review: { label: "Bank Review Mein",        icon: Clock,        grad: "from-amber-400 to-orange-500", text: "text-amber-600" },
  approved:     { label: "Loan Approved",            icon: CheckCircle,  grad: "from-emerald-500 to-teal-500", text: "text-emerald-600" },
  rejected:     { label: "Application Rejected",    icon: XCircle,      grad: "from-red-500 to-rose-500",     text: "text-red-600" },
  disbursed:    { label: "Amount Disbursed",         icon: IndianRupee,  grad: "from-violet-600 to-purple-600","text": "text-violet-600" },
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
      if (!r) setError("Is reference number se koi application nahi mili.");
      else setApp(r);
    } catch { setError("Fetch nahi hua. Connection check karo."); }
    finally { setLoading(false); }
  }

  const currentIdx = app ? STATUS_STEPS.indexOf(app.status) : -1;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/")} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-black text-gray-900">Application Track Karo</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Reference Number</label>
        <div className="flex gap-2">
          <input type="text" placeholder="jaise HDFCBANK12345678" value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-violet-400 uppercase tracking-wider font-bold" />
          <button onClick={handleSearch} disabled={loading || !ref.trim()}
            className="px-4 py-2 btn-gradient text-white rounded-xl font-bold disabled:opacity-60 flex items-center gap-1.5">
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
            <div className={`rounded-2xl p-5 text-center text-white bg-gradient-to-r ${cfg.grad}`}>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon size={28} className="text-white" />
              </div>
              <p className="text-xl font-black">{cfg.label}</p>
              <p className="text-white/70 text-xs mt-1">Ref: {app.referenceNo}</p>
            </div>

            {/* Progress */}
            {app.status !== "rejected" && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-black text-gray-700 mb-4">Application Progress</p>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
                  <div className="space-y-4">
                    {STATUS_STEPS.map((step, i) => {
                      const sCfg = STATUS_CONFIG[step];
                      const SIcon = sCfg.icon;
                      const done = i < currentIdx;
                      const active = i === currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-3 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${done ? `bg-gradient-to-r ${sCfg.grad}` : active ? `bg-gradient-to-r ${sCfg.grad}` : "bg-gray-100"}`}>
                            {done ? <CheckCircle size={16} className="text-white" />
                              : <SIcon size={14} className={active ? "text-white" : "text-gray-400"} />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${done || active ? "text-gray-900" : "text-gray-400"}`}>{sCfg.label}</p>
                          </div>
                          {active && <span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>Current</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Application Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Applicant</span><span className="font-bold">{app.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="font-bold">{app.bankName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-black text-emerald-600">₹{app.approvedAmount.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Rate</span><span className="font-bold">{app.interestRate}% p.a.</span></div>
                <div className="flex justify-between"><span className="text-gray-400">EMI</span><span className="font-black text-violet-600">₹{app.emi.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          </div>
        );
      })()}

      {!app && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search size={36} className="text-violet-300" />
          </div>
          <p className="text-gray-400 text-sm">Reference number dalo aur apni loan application ka status track karo</p>
        </div>
      )}
    </div>
  );
}
