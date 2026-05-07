"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAppStore, LoanType } from "@/lib/store";
import { t } from "@/lib/i18n";
import { matchBanks, getAgeFromDOB, computeRiskGrade, POLICY_VERSION } from "@/lib/bank-data";
import { saveSession } from "@/lib/firestore";
import { ArrowLeft, Tag, CheckCircle, ChevronRight, IndianRupee, ShieldCheck } from "lucide-react";

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-100",
  B: "text-[var(--brand-2)] bg-[var(--brand-soft)]",
  C: "text-amber-700 bg-amber-100",
  D: "text-red-700 bg-red-100",
};

const LOAN_TYPE_LABELS: Record<string, string> = {
  personal: "Personal Loan", home: "Home Loan", auto: "Vehicle Loan",
  business: "Business Loan", gold: "Gold Loan", education: "Education Loan", lap: "LAP",
};

const LOAN_RANGES: Record<LoanType, { min: number; max: number; step: number }> = {
  personal:  { min: 50000,   max: 4000000,   step: 50000 },
  home:      { min: 500000,  max: 20000000,  step: 500000 },
  auto:      { min: 100000,  max: 5000000,   step: 100000 },
  business:  { min: 100000,  max: 5000000,   step: 100000 },
  gold:      { min: 10000,   max: 5000000,   step: 10000 },
  education: { min: 50000,   max: 10000000,  step: 50000 },
  lap:       { min: 500000,  max: 50000000,  step: 500000 },
};

const TENURES = [12, 24, 36, 48, 60, 84, 120, 180, 240];
const PROMOS: Record<string, number> = { FIRST99: 49, SAVE50: 49, LOAN50: 49, INSTANT: 49 };

export default function LoanRequirement() {
  const router = useRouter();
  const { setLoanRequirement, setLastRoute, loanRequirement, userDetails, lang } = useAppStore();

  const [loanType] = useState<LoanType>(loanRequirement.loanType ?? "personal");
  const [amount, setAmount] = useState(loanRequirement.amount ?? 500000);
  const [tenure, setTenure] = useState(loanRequirement.tenure ?? 36);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [price, setPrice] = useState(99);

  // ── Pre-approval snapshot (computed from profile, no server call) ──
  const preApproval = useMemo(() => {
    const inc = userDetails.monthlyIncome;
    if (!inc || inc < 10000) return null;
    const age = userDetails.dob ? getAgeFromDOB(userDetails.dob) : 30;
    const empType = userDetails.employmentType ?? "salaried";
    const cibil = userDetails.cibilScore;
    const grade = computeRiskGrade(cibil, 0.20, 0);
    const { offers } = matchBanks({
      income: inc, foir: 0.20, age,
      loanType: "personal",
      requestedAmount: inc * 36,  // generous ceiling for preview
      tenure: 36,
      cibilScore: cibil,
      employmentType: empType,
    });
    if (!offers.length) return null;
    return {
      count: offers.length,
      maxAmount: Math.max(...offers.map((o) => o.approvedAmount)),
      bestRate: offers[0].interestRate,
      grade,
    };
  }, [userDetails.monthlyIncome, userDetails.cibilScore, userDetails.employmentType, userDetails.dob]);

  useEffect(() => { setLastRoute("/loan-requirement"); }, []);

  const range = LOAN_RANGES[loanType];
  const clampedAmount = Math.max(range.min, Math.min(amount, range.max));

  function applyPromo() {
    const c = promo.trim().toUpperCase();
    if (PROMOS[c]) { setPrice(PROMOS[c]); setPromoApplied(true); setPromoError(""); }
    else setPromoError("Invalid promo code");
  }

  function handleNext() {
    setLoanRequirement({ loanType, amount: clampedAmount, tenure });
    saveSession(userDetails.mobile ?? "", {
      step: 2,
      lastRoute: "/upload",
      userDetails: {
        name: userDetails.name, pan: userDetails.pan, dob: userDetails.dob,
        employmentType: userDetails.employmentType, monthlyIncome: userDetails.monthlyIncome,
        cibilScore: userDetails.cibilScore,
      },
      loanRequirement: { loanType, amount: clampedAmount, tenure },
    });
    setLastRoute("/upload");
    router.push("/upload");
  }

  const fmt = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${v.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col w-full max-w-md mx-auto px-4 py-5 overflow-x-hidden">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-[var(--bg-deep)] rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-[var(--ink-muted)] mb-1.5"><span>Step 2 of 4</span><span>{t(lang, "loanTitle")}</span></div>
          <div className="h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-2/4 transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{t(lang, "loanTitle")}</h2>
        <p className="text-[var(--ink-muted)] text-sm mt-1">{t(lang, "loanSub")}</p>
      </div>

      {preApproval && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">
              Pre-Approved Profile ✦ {preApproval.count} banks eligible
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Up to ₹{preApproval.maxAmount >= 100000
                ? `${(preApproval.maxAmount / 100000).toFixed(1)}L`
                : preApproval.maxAmount.toLocaleString("en-IN")
              } · from {preApproval.bestRate}% p.a.
            </p>
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${GRADE_COLORS[preApproval.grade]}`}>
            <ShieldCheck size={10} /> {preApproval.grade}
          </span>
        </div>
      )}

      <div className="space-y-6 flex-1">
        {/* Loan Type — read-only, set from landing page */}
        <div className="flex items-center justify-between bg-[var(--brand-soft)] border border-[var(--brand)] rounded-2xl px-4 py-3">
          <span className="text-sm font-medium text-[var(--ink-soft)]">Loan Type</span>
          <span className="text-sm font-semibold text-[var(--brand)] capitalize">
            {LOAN_TYPE_LABELS[loanType] ?? loanType}
          </span>
        </div>

        {/* Amount */}
        <div className="bg-[var(--brand-soft)] rounded-2xl p-4 border border-[var(--brand-soft)]">
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)]">
              <IndianRupee size={14} className="text-[var(--brand-3)]" /> {t(lang, "labelAmount")}
            </label>
            <span className="text-2xl font-semibold text-[var(--brand)]">{fmt(clampedAmount)}</span>
          </div>
          <input type="range" min={range.min} max={range.max} step={range.step}
            value={clampedAmount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-[var(--ink-muted)] mt-2">
            <span>{fmt(range.min)}</span><span>{fmt(range.max)}</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="block text-sm font-medium text-[var(--ink-soft)] mb-2">
            {t(lang, "labelTenure")}: <span className="text-[var(--brand)]">{tenure >= 12 ? `${Math.round(tenure / 12)} Year` : `${tenure} Month`}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TENURES.map((t) => (
              <button key={t} onClick={() => setTenure(t)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${tenure === t ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line-soft)] text-gray-600"}`}>
                {t < 12 ? `${t}m` : `${Math.round(t / 12)}yr`}
              </button>
            ))}
          </div>
        </div>

        {/* Promo */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)] mb-1.5">
            <Tag size={14} className="text-pink-500" /> Promo Code <span className="text-[var(--ink-muted)] font-normal">(optional)</span>
          </label>
          {!promoApplied ? (
            <div className="flex gap-2 w-full">
              <input type="text" placeholder="Enter promo code" value={promo}
                onChange={(e) => { setPromo(e.target.value.toUpperCase()); setPromoError(""); }}
                className="flex-1 min-w-0 border-2 border-[var(--line-soft)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 uppercase font-medium" />
              <button onClick={applyPromo} className="shrink-0 px-4 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium">Apply</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-2.5">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span className="text-sm text-emerald-700 font-medium truncate">{promo} — Only ₹{price}!</span>
              <button onClick={() => { setPromoApplied(false); setPrice(99); setPromo(""); }} className="ml-auto text-xs text-[var(--ink-muted)] shrink-0">Remove</button>
            </div>
          )}
          {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
        </div>

        {/* Price */}
        <div className={`rounded-2xl p-4 border-2 text-center ${promoApplied ? "bg-emerald-50 border-emerald-200" : "bg-[var(--brand-soft)] border-[var(--brand-soft)]"}`}>
          <p className="text-sm font-medium text-gray-600">AI Report Price</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            {promoApplied && <span className="text-xl text-[var(--ink-muted)] line-through">₹99</span>}
            <span className={`text-4xl font-semibold ${promoApplied ? "text-emerald-600" : "text-[var(--brand)]"}`}>₹{price}</span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">One-time · Non-refundable</p>
        </div>
      </div>

      <button onClick={handleNext}
        className="mt-6 w-full btn-gradient text-white font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
        {t(lang, "btnNext")} <ChevronRight size={22} />
      </button>
    </div>
  );
}
