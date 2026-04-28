"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getSession, saveSession, clearSession, UserSession } from "@/lib/firestore";
import {
  User, Phone, CreditCard, Calendar, Briefcase, IndianRupee,
  CheckCircle, Send, ArrowLeft, ChevronRight, RotateCcw, MapPin, Loader2,
} from "lucide-react";

const STEP_LABELS: Record<string, { label: string; step: string }> = {
  "/loan-requirement": { label: "Loan Type & Amount",   step: "Step 2" },
  "/upload":           { label: "Bank Statement",        step: "Step 3" },
  "/payment":          { label: "Payment",               step: "Step 4" },
  "/processing":       { label: "AI Processing",         step: "Step 5" },
  "/results":          { label: "Loan Offers",           step: "Step 5" },
  "/apply":            { label: "Application Form",      step: "Step 6" },
  "/confirmation":     { label: "Application Submitted", step: "Done ✓" },
};

type Phase = "login" | "checking" | "resume" | "form";

export default function Details() {
  const router = useRouter();
  const {
    setUserDetails, setOtpVerified, setLastRoute, setLoanRequirement,
    setPaymentDone, resetSession, userDetails, otpVerified, lang,
  } = useAppStore();

  // ── Login phase state ─────────────────────────────────────────
  const [mobile, setMobile] = useState(userDetails.mobile ?? "");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(otpVerified && !!userDetails.mobile);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [mobileError, setMobileError] = useState("");

  // ── Session resume state ──────────────────────────────────────
  const [phase, setPhase] = useState<Phase>(
    (otpVerified && !!userDetails.mobile) ? "checking" : "login",
  );
  const [existingSession, setExistingSession] = useState<UserSession | null>(null);

  // ── Form state (phase = "form") ───────────────────────────────
  const [name, setName] = useState(userDetails.name ?? "");
  const [pan, setPan] = useState(userDetails.pan ?? "");
  const [dob, setDob] = useState(userDetails.dob ?? "");
  const [employmentType, setEmploymentType] = useState<"salaried" | "self-employed" | "business">(
    userDetails.employmentType ?? "salaried",
  );
  const [monthlyIncome, setMonthlyIncome] = useState(
    userDetails.monthlyIncome ? String(userDetails.monthlyIncome) : "",
  );
  const [cibilScore, setCibilScore] = useState(
    userDetails.cibilScore ? String(userDetails.cibilScore) : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setLastRoute("/details"); }, []);

  // If already verified from localStorage, immediately check session
  useEffect(() => {
    if (phase === "checking" && userDetails.mobile) {
      checkSession(userDetails.mobile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function checkSession(mob: string) {
    const session = await getSession(mob);
    if (session && session.step > 0 && session.lastRoute && session.lastRoute !== "/details") {
      setExistingSession(session);
      setPhase("resume");
    } else {
      setPhase("form");
    }
  }

  async function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) { setMobileError("Enter a valid 10-digit mobile number"); return; }
    setMobileError(""); setOtpLoading(true); setOtpError("");
    const res = await fetch("/api/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    setOtpLoading(false);
    if (res.ok) { setOtpSent(true); if (data.otp) setOtp(data.otp); }
    else setOtpError("Could not send OTP. Please try again.");
  }

  async function verifyOtp() {
    setOtpLoading(true); setOtpError("");
    const res = await fetch("/api/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
    setOtpLoading(false);
    if (res.ok) {
      setVerified(true);
      setOtpVerified(true);
      setUserDetails({ mobile });
      setPhase("checking");
      checkSession(mobile);
    } else {
      setOtpError("Incorrect or expired OTP. Please try again.");
    }
  }

  function handleResume() {
    if (!existingSession) return;
    const ud = existingSession.userDetails ?? {};
    setUserDetails({
      mobile: existingSession.mobile,
      name: ud.name,
      pan: ud.pan,
      dob: ud.dob,
      employmentType: (ud.employmentType as "salaried" | "self-employed" | "business") ?? "salaried",
      monthlyIncome: ud.monthlyIncome,
      cibilScore: ud.cibilScore,
    });
    if (existingSession.loanRequirement) {
      setLoanRequirement({
        loanType: existingSession.loanRequirement.loanType as "personal" | "home" | "auto" | "business" | "gold" | "education" | "lap" | undefined,
        amount: existingSession.loanRequirement.amount,
        tenure: existingSession.loanRequirement.tenure,
      });
    }
    if (existingSession.paymentDone) setPaymentDone(true);
    setOtpVerified(true);
    router.push(existingSession.lastRoute);
  }

  function handleStartFresh() {
    resetSession();
    clearSession(mobile);
    setUserDetails({ mobile });
    setOtpVerified(true);
    setName(""); setPan(""); setDob(""); setMonthlyIncome(""); setCibilScore("");
    setEmploymentType("salaried"); setErrors({});
    setPhase("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) e.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (!dob) e.dob = "Date of birth is required";
    if (!monthlyIncome || Number(monthlyIncome) < 10000) e.monthlyIncome = "Minimum income ₹10,000";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const details = {
      name: name.trim(), mobile, pan: pan.toUpperCase(), dob,
      employmentType, monthlyIncome: Number(monthlyIncome),
      cibilScore: cibilScore ? Number(cibilScore) : undefined,
    };
    setUserDetails(details);
    saveSession(mobile, {
      step: 1,
      lastRoute: "/loan-requirement",
      userDetails: {
        name: details.name, pan: details.pan, dob: details.dob,
        employmentType: details.employmentType, monthlyIncome: details.monthlyIncome,
        cibilScore: details.cibilScore,
      },
    });
    setLastRoute("/loan-requirement");
    router.push("/loan-requirement");
  }

  const inp = (field: string) =>
    `w-full border-2 rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all bg-white ${
      errors[field] ? "border-red-400 focus:border-red-400" : "border-gray-100 focus:border-blue-400"
    }`;

  // ── PHASE: LOGIN / CHECKING ───────────────────────────────────
  if (phase === "login" || phase === "checking") {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center pb-10">
          {/* App logo */}
          <div className="w-16 h-16 btn-gradient rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
            <span className="text-white font-black text-2xl">₹</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1.5">Check Your Eligibility</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Log in with your mobile — if you've applied before, we'll resume right where you left off
          </p>

          {/* Mobile input */}
          <div className="mb-3">
            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
              <Phone size={14} className="text-blue-500" /> Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center border-2 border-gray-100 rounded-xl px-3.5 bg-slate-50 min-w-[52px]">
                <span className="text-sm font-bold text-gray-500">+91</span>
              </div>
              <input
                type="tel" inputMode="numeric" placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setOtpSent(false); setVerified(false); setMobileError("");
                }}
                className={`flex-1 border-2 rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all ${
                  mobileError ? "border-red-400" : "border-gray-100 focus:border-blue-400"
                }`}
              />
            </div>
            {mobileError && <p className="text-xs text-red-500 mt-1">{mobileError}</p>}
          </div>

          {!verified && (
            <button onClick={sendOtp} disabled={otpLoading || mobile.length !== 10}
              className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-base mb-4 disabled:opacity-60 flex items-center justify-center gap-2">
              <Send size={16} />
              {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : t(lang, "btnSendOtp")}
            </button>
          )}

          {otpSent && !verified && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-800 font-bold mb-3">OTP sent to +91 {mobile}</p>
              <div className="flex gap-2 mb-1">
                <input
                  type="number" inputMode="numeric" placeholder="6-digit OTP"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 border-2 border-blue-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 bg-white font-black tracking-[0.3em] text-center"
                />
                <button onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                  className="px-5 bg-emerald-500 text-white rounded-xl font-black disabled:opacity-60 flex items-center gap-1.5 text-sm">
                  {otpLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><CheckCircle size={15} /> {t(lang, "btnVerify")}</>
                  }
                </button>
              </div>
              {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
            </div>
          )}

          {phase === "checking" && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-800 font-bold mt-5 bg-blue-50 rounded-2xl py-4">
              <Loader2 size={16} className="animate-spin" /> Checking your saved progress...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: RESUME ─────────────────────────────────────────────
  if (phase === "resume" && existingSession) {
    const routeInfo = STEP_LABELS[existingSession.lastRoute] ?? {
      label: existingSession.lastRoute, step: "Step ?",
    };
    const ud = existingSession.userDetails ?? {};
    const lr = existingSession.loanRequirement;

    return (
      <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setPhase("login")}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center pb-10">
          {/* Welcome back */}
          <div className="text-center mb-7">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
              👋
            </div>
            <h2 className="text-2xl font-black text-gray-900">Welcome back!</h2>
            <p className="text-gray-400 text-sm mt-1">+91 {mobile} · {t(lang, "verified")}</p>
          </div>

          {/* Progress card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-100 rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">
                  You were here — {routeInfo.step}
                </p>
                <p className="font-black text-gray-900 text-base">{routeInfo.label}</p>
              </div>
            </div>

            {/* Snapshot of saved data */}
            <div className="bg-white rounded-2xl p-3.5 space-y-2">
              {ud.name && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Name</span>
                  <span className="font-bold text-gray-900">{ud.name}</span>
                </div>
              )}
              {ud.employmentType && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Employment</span>
                  <span className="font-bold text-gray-900 capitalize">{ud.employmentType}</span>
                </div>
              )}
              {ud.monthlyIncome && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Income</span>
                  <span className="font-bold text-gray-900">
                    ₹{ud.monthlyIncome.toLocaleString("en-IN")}/mo
                  </span>
                </div>
              )}
              {lr?.loanType && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Loan Type</span>
                  <span className="font-bold text-gray-900 capitalize">{lr.loanType}</span>
                </div>
              )}
              {lr?.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Amount</span>
                  <span className="font-bold text-gray-900">
                    ₹{lr.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {existingSession.paymentDone && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold pt-1 border-t border-gray-100">
                  <CheckCircle size={13} /> Payment complete
                </div>
              )}
            </div>
          </div>

          <button onClick={handleResume}
            className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 mb-3">
            <ChevronRight size={20} /> Continue from {routeInfo.label}
          </button>

          <button onClick={handleStartFresh}
            className="w-full flex items-center justify-center gap-2 text-gray-500 font-bold py-3.5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all">
            <RotateCcw size={15} /> Start Fresh
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: FORM ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setPhase("login")}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Step 1 of 4</span><span>{t(lang, "detailsTitle")}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-1/4 transition-all" />
          </div>
        </div>
      </div>

      {/* Verified mobile badge */}
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mb-5">
        <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
        <span className="text-xs font-bold text-emerald-700">+91 {mobile} — verified</span>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-900">{t(lang, "detailsTitle")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t(lang, "detailsSub")}</p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Name */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <User size={14} className="text-blue-500" /> {t(lang, "labelName")}
          </label>
          <input type="text" placeholder="As per PAN card" value={name}
            onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
            className={inp("name")} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* PAN */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <CreditCard size={14} className="text-blue-500" /> {t(lang, "labelPan")}
          </label>
          <input type="text" placeholder="ABCDE1234F" value={pan}
            onChange={(e) => { setPan(e.target.value.toUpperCase()); setErrors((er) => ({ ...er, pan: "" })); }}
            className={inp("pan")} />
          {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
        </div>

        {/* DOB */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <Calendar size={14} className="text-blue-500" /> {t(lang, "labelDob")}
          </label>
          <input type="date" value={dob}
            onChange={(e) => { setDob(e.target.value); setErrors((er) => ({ ...er, dob: "" })); }}
            className={inp("dob")} />
          {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
        </div>

        {/* Employment */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-2">
            <Briefcase size={14} className="text-blue-500" /> {t(lang, "labelEmpType")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["salaried", "self-employed", "business"] as const).map((et) => (
              <button key={et} onClick={() => setEmploymentType(et)}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  employmentType === et
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-100 text-gray-600"
                }`}>
                {et === "salaried" ? "Salaried" : et === "self-employed" ? "Self Emp." : "Business"}
              </button>
            ))}
          </div>
        </div>

        {/* Income */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <IndianRupee size={14} className="text-blue-500" /> {t(lang, "labelIncome")}
          </label>
          <input type="number" inputMode="numeric" placeholder="jaise 50000" value={monthlyIncome}
            onChange={(e) => { setMonthlyIncome(e.target.value); setErrors((er) => ({ ...er, monthlyIncome: "" })); }}
            className={inp("monthlyIncome")} />
          {errors.monthlyIncome && <p className="text-xs text-red-500 mt-1">{errors.monthlyIncome}</p>}
        </div>

        {/* CIBIL */}
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1.5 block">
            {t(lang, "labelCibil")} <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="number" inputMode="numeric" placeholder="300–900, jaise 750"
            value={cibilScore} onChange={(e) => setCibilScore(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-400 bg-white" />
          <p className="text-xs text-gray-400 mt-1">Check free at mycibil.com</p>
        </div>
      </div>

      <button onClick={handleNext}
        className="mt-6 w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
        {t(lang, "btnNext")} <ChevronRight size={22} />
      </button>
    </div>
  );
}
