"use client";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { saveSession } from "@/lib/firestore";
import { t } from "@/lib/i18n";
import { ArrowLeft, Shield, FileText, Lock, ChevronRight, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

const BANKS = ["SBI", "PNB", "HDFC", "ICICI", "Axis", "BOB", "Kotak", "Union", "Canara", "IndusInd", "IDFC", "Yes", "Federal"];

export default function Upload() {
  const router = useRouter();
  const { setStatementAnalysis, userDetails, loanRequirement, setLastRoute, lang } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLastRoute("/upload"); }, []);

  function handleFile(f: File) {
    if (f.type !== "application/pdf") { alert("Please upload a PDF file"); return; }
    setFile(f); setParseError("");
  }

  async function handleAnalyse() {
    if (!file) { alert("Please upload your bank statement first"); return; }
    setParsing(true); setParseError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("declaredIncome", String(userDetails.monthlyIncome ?? 0));
      if (password) form.append("password", password);

      const res = await fetch("/api/analyse-statement", { method: "POST", body: form });

      let analysis;
      if (res.ok) {
        analysis = await res.json();
      } else {
        // Fallback: use declared income
        const declared = userDetails.monthlyIncome ?? 0;
        analysis = {
          avgMonthlyIncome: declared,
          avgMonthlyBalance: Math.round(declared * 1.8),
          totalObligations: Math.round(declared * 0.2),
          foir: 0.2,
          bounceCount: 0,
          salaryCredits: 6,
          transactionCount: 100,
        };
        setParseError("Could not read PDF — using your declared income instead.");
      }

      setStatementAnalysis(analysis);
      saveSession(userDetails.mobile ?? "", {
        step: 3, lastRoute: "/payment",
        userDetails: {
          name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob,
          employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome,
          cibilScore: userDetails.cibilScore,
        },
        loanRequirement: {
          loanType: loanRequirement.loanType,
          amount: loanRequirement.amount,
          tenure: loanRequirement.tenure,
        },
      });
      router.push("/payment");
    } catch {
      setParseError("Network error — please try again.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col w-full max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-[var(--bg-deep)] rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-[var(--ink-muted)] mb-1.5"><span>Step 3 of 4</span><span>{t(lang, "uploadTitle")}</span></div>
          <div className="h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-3/4 transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{t(lang, "uploadTitle")}</h2>
        <p className="text-[var(--ink-muted)] text-sm mt-1">{t(lang, "uploadSub")}</p>
      </div>

      {/* Privacy notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">{t(lang, "uploadPrivacy")}</p>
          <p className="text-xs text-emerald-700 mt-0.5">Analysed on our secure servers · never stored</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${
          dragging ? "border-[var(--brand)] bg-[var(--brand-soft)]"
          : file ? "border-emerald-400 bg-emerald-50"
          : "border-[var(--line)] bg-[var(--bg-deep)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
        }`}>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <>
            <CheckCircle size={44} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-emerald-700">{file.name}</p>
            <p className="text-xs text-emerald-500 mt-1">{(file.size / 1024).toFixed(0)} KB · Tap to change</p>
          </>
        ) : (
          <>
            <FileText size={44} className="text-[var(--ink-muted)] mx-auto mb-2" />
            <p className="font-medium text-gray-600">{t(lang, "uploadBtn")}</p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">{t(lang, "uploadDrop")}</p>
          </>
        )}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)] mb-1.5">
          <Lock size={14} className="text-[var(--brand-2)]" /> PDF Password <span className="text-[var(--ink-muted)] font-normal">(optional)</span>
        </label>
        <input type="password" placeholder="Leave blank if not password protected" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-[var(--line-soft)] rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-[var(--brand)]" />
        <p className="text-xs text-[var(--ink-muted)] mt-1">Most banks use DOB (DDMMYYYY) or last 4 digits of mobile</p>
      </div>

      {/* Bank chips */}
      <div className="bg-[var(--bg)] rounded-2xl p-4 mb-5">
        <p className="text-xs font-medium text-[var(--ink-muted)] mb-2 uppercase tracking-wide">Supported Banks</p>
        <div className="flex flex-wrap gap-2">
          {BANKS.map((b) => (
            <span key={b} className="text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2.5 py-1 text-gray-600 font-semibold">{b}</span>
          ))}
          <span className="text-xs bg-[var(--brand-soft)] border border-[var(--brand-soft)] rounded-lg px-2.5 py-1 text-[var(--brand)] font-semibold">+20 more</span>
        </div>
      </div>

      {parseError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />{parseError}
        </div>
      )}

      <button onClick={handleAnalyse} disabled={!file || parsing}
        className={`w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all ${
          file && !parsing ? "btn-gradient text-white" : "bg-gray-200 text-[var(--ink-muted)]"
        }`}>
        {parsing
          ? <><Loader2 size={18} className="animate-spin" /> Analysing on server…</>
          : <>{t(lang, "btnAnalyse")} <ChevronRight size={22} /></>
        }
      </button>
    </div>
  );
}
