"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore, LoanType } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ArrowLeft, Wallet, Home, Car, Building2, Tag, CheckCircle, ChevronRight, IndianRupee, GraduationCap, Landmark, Coins } from "lucide-react";

const LOAN_TYPES: { type: LoanType; label: string; sub: string; icon: typeof Wallet; color: string; bg: string }[] = [
  { type: "personal",  label: "Personal",   sub: "Bina collateral",      icon: Wallet,       color: "text-violet-600", bg: "bg-violet-100" },
  { type: "home",      label: "Home",        sub: "Ghar kharidne ke liye", icon: Home,         color: "text-emerald-600", bg: "bg-emerald-100" },
  { type: "auto",      label: "Vehicle",     sub: "Car / bike loan",       icon: Car,          color: "text-amber-600", bg: "bg-amber-100" },
  { type: "business",  label: "Business",    sub: "Business ke liye",      icon: Building2,    color: "text-pink-600", bg: "bg-pink-100" },
  { type: "gold",      label: "Gold Loan",   sub: "Sone ke badle loan",    icon: Coins,        color: "text-yellow-600", bg: "bg-yellow-100" },
  { type: "education", label: "Education",   sub: "Padhai ke liye",        icon: GraduationCap,color: "text-blue-600", bg: "bg-blue-100" },
  { type: "lap",       label: "LAP",         sub: "Property pe loan",      icon: Landmark,     color: "text-teal-600", bg: "bg-teal-100" },
];

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
  const { setLoanRequirement, setLastRoute, loanRequirement, lang } = useAppStore();

  const [loanType, setLoanType] = useState<LoanType>(loanRequirement.loanType ?? "personal");
  const [amount, setAmount] = useState(loanRequirement.amount ?? 500000);
  const [tenure, setTenure] = useState(loanRequirement.tenure ?? 36);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [price, setPrice] = useState(99);

  useEffect(() => { setLastRoute("/loan-requirement"); }, []);

  const range = LOAN_RANGES[loanType];
  const clampedAmount = Math.max(range.min, Math.min(amount, range.max));

  function applyPromo() {
    const c = promo.trim().toUpperCase();
    if (PROMOS[c]) { setPrice(PROMOS[c]); setPromoApplied(true); setPromoError(""); }
    else setPromoError("Galat promo code");
  }

  function handleNext() {
    setLoanRequirement({ loanType, amount, tenure });
    setLastRoute("/upload");
    router.push("/upload");
  }

  const fmt = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${v.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Step 2 of 4</span><span>{t(lang, "loanTitle")}</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-2/4 transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">{t(lang, "loanTitle")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t(lang, "loanSub")}</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Loan Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t(lang, "labelLoanType")}</label>
          <div className="grid grid-cols-2 gap-2.5">
            {LOAN_TYPES.map((lt, idx) => {
              const active = loanType === lt.type;
              const isLastOdd = idx === LOAN_TYPES.length - 1 && LOAN_TYPES.length % 2 !== 0;
              return (
                <button key={lt.type}
                  onClick={() => { setLoanType(lt.type); setAmount(LOAN_RANGES[lt.type].min); }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${active ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-gray-200"} ${isLastOdd ? "col-span-2" : ""}`}>
                  <div className={`w-9 h-9 ${active ? "bg-violet-500" : lt.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <lt.icon size={16} className={active ? "text-white" : lt.color} />
                  </div>
                  <div>
                    <p className={`text-sm font-black leading-tight ${active ? "text-violet-700" : "text-gray-800"}`}>{lt.label}</p>
                    <p className={`text-xs mt-0.5 ${active ? "text-violet-500" : "text-gray-400"}`}>{lt.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-4 border border-violet-100">
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <IndianRupee size={14} className="text-violet-500" /> {t(lang, "labelAmount")}
            </label>
            <span className="text-2xl font-black text-violet-600">{fmt(clampedAmount)}</span>
          </div>
          <input type="range" min={range.min} max={range.max} step={range.step}
            value={clampedAmount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{fmt(range.min)}</span><span>{fmt(range.max)}</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t(lang, "labelTenure")}: <span className="text-violet-600">{tenure >= 12 ? `${Math.round(tenure / 12)} Saal` : `${tenure} Mahine`}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TENURES.map((t) => (
              <button key={t} onClick={() => setTenure(t)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${tenure === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-100 text-gray-600"}`}>
                {t < 12 ? `${t}m` : `${Math.round(t / 12)}yr`}
              </button>
            ))}
          </div>
        </div>

        {/* Promo */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <Tag size={14} className="text-pink-500" /> Promo Code <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {!promoApplied ? (
            <div className="flex gap-2">
              <input type="text" placeholder="Code daalo" value={promo}
                onChange={(e) => { setPromo(e.target.value.toUpperCase()); setPromoError(""); }}
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-pink-400 uppercase font-bold" />
              <button onClick={applyPromo} className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold">Apply</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <span className="text-sm text-emerald-700 font-bold">{promo} — Sirf ₹{price}!</span>
              <button onClick={() => { setPromoApplied(false); setPrice(99); setPromo(""); }} className="ml-auto text-xs text-gray-400">Hatao</button>
            </div>
          )}
          {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
        </div>

        {/* Price */}
        <div className={`rounded-2xl p-4 border-2 text-center ${promoApplied ? "bg-emerald-50 border-emerald-200" : "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100"}`}>
          <p className="text-sm font-bold text-gray-600">AI Report Price</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            {promoApplied && <span className="text-xl text-gray-400 line-through">₹99</span>}
            <span className={`text-4xl font-black ${promoApplied ? "text-emerald-600" : "text-violet-600"}`}>₹{price}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">One-time · Non-refundable</p>
        </div>
      </div>

      <button onClick={handleNext}
        className="mt-6 w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
        {t(lang, "btnNext")} <ChevronRight size={22} />
      </button>
    </div>
  );
}
