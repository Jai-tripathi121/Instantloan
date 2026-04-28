"use client";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { mergeWithDeclared } from "@/lib/pdf-parser";
import { saveSession } from "@/lib/firestore";
import { t } from "@/lib/i18n";
import { ArrowLeft, Shield, FileText, Lock, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

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
    if (f.type !== "application/pdf") { alert("Sirf PDF file upload karo"); return; }
    setFile(f); setParseError("");
  }

  async function handleAnalyse() {
    if (!file) { alert("Bank statement upload karo pehle"); return; }
    setParsing(true); setParseError("");
    try {
      const { parsePDF, mergeWithDeclared: merge } = await import("@/lib/pdf-parser");
      const parsed = await parsePDF(file);
      const final = merge(parsed, userDetails.monthlyIncome ?? 0);
      setStatementAnalysis(final);
      saveSession(userDetails.mobile ?? "", {
        step: 3, lastRoute: "/payment",
        userDetails: {
          name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob,
          employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome,
          cibilScore: userDetails.cibilScore,
        },
        loanRequirement: { loanType: loanRequirement.loanType, amount: loanRequirement.amount, tenure: loanRequirement.tenure },
      });
      router.push("/payment");
    } catch {
      const declared = userDetails.monthlyIncome ?? 0;
      const fallback = mergeWithDeclared({
        avgMonthlyIncome: 0, avgMonthlyBalance: Math.round(declared * 1.8),
        totalObligations: Math.round(declared * 0.2), foir: 0.2,
        bounceCount: 0, salaryCredits: 6, transactionCount: 100,
      }, declared);
      setStatementAnalysis(fallback);
      setParseError("PDF nahi pada — declared income use ho rahi hai.");
      saveSession(userDetails.mobile ?? "", {
        step: 3, lastRoute: "/payment",
        userDetails: {
          name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob,
          employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome,
          cibilScore: userDetails.cibilScore,
        },
        loanRequirement: { loanType: loanRequirement.loanType, amount: loanRequirement.amount, tenure: loanRequirement.tenure },
      });
      router.push("/payment");
    } finally { setParsing(false); }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Step 3 of 4</span><span>{t(lang, "uploadTitle")}</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-3/4 transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">{t(lang, "uploadTitle")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t(lang, "uploadSub")}</p>
      </div>

      {/* Privacy notice */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">{t(lang, "uploadPrivacy")}</p>
          <p className="text-xs text-emerald-700 mt-0.5">{t(lang, "uploadPrivacyDesc")}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${dragging ? "border-violet-500 bg-violet-50" : file ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50"}`}>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <>
            <CheckCircle size={44} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-700">{file.name}</p>
            <p className="text-xs text-emerald-500 mt-1">{(file.size / 1024).toFixed(0)} KB · Tap karke change karo</p>
          </>
        ) : (
          <>
            <FileText size={44} className="text-violet-300 mx-auto mb-2" />
            <p className="font-bold text-gray-600">{t(lang, "uploadBtn")}</p>
            <p className="text-xs text-gray-400 mt-1">{t(lang, "uploadDrop")}</p>
          </>
        )}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
          <Lock size={14} className="text-violet-500" /> PDF Password <span className="text-gray-400 font-normal">(agar protected hai)</span>
        </label>
        <input type="password" placeholder="Blank chhodo agar password nahi hai" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-violet-400" />
        <p className="text-xs text-gray-400 mt-1">Zyaadatar banks: DOB (DDMMYYYY) ya mobile ke last 4 digits</p>
      </div>

      {/* Bank chips */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Supported Banks</p>
        <div className="flex flex-wrap gap-2">
          {BANKS.map((b) => (
            <span key={b} className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-semibold">{b}</span>
          ))}
          <span className="text-xs bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1 text-violet-600 font-semibold">+20 more</span>
        </div>
      </div>

      {parseError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />{parseError}
        </div>
      )}

      <button onClick={handleAnalyse} disabled={!file || parsing}
        className={`w-full font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all ${file && !parsing ? "btn-gradient text-white" : "bg-gray-200 text-gray-400"}`}>
        {parsing ? t(lang, "loading") : (<>{t(lang, "btnAnalyse")} <ChevronRight size={22} /></>)}
      </button>
    </div>
  );
}
