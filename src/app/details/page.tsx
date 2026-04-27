"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { User, Phone, CreditCard, Calendar, Briefcase, IndianRupee, CheckCircle, Send, ArrowLeft, ChevronRight } from "lucide-react";

export default function Details() {
  const router = useRouter();
  const { setUserDetails, setOtpVerified, setLastRoute, userDetails, otpVerified } = useAppStore();

  const [name, setName] = useState(userDetails.name ?? "");
  const [mobile, setMobile] = useState(userDetails.mobile ?? "");
  const [pan, setPan] = useState(userDetails.pan ?? "");
  const [dob, setDob] = useState(userDetails.dob ?? "");
  const [employmentType, setEmploymentType] = useState<"salaried" | "self-employed" | "business">(userDetails.employmentType ?? "salaried");
  const [monthlyIncome, setMonthlyIncome] = useState(userDetails.monthlyIncome ? String(userDetails.monthlyIncome) : "");
  const [cibilScore, setCibilScore] = useState(userDetails.cibilScore ? String(userDetails.cibilScore) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(otpVerified && userDetails.mobile === mobile);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => { setLastRoute("/details"); }, []);

  async function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) { setErrors((e) => ({ ...e, mobile: "Valid 10-digit mobile daalo" })); return; }
    setOtpLoading(true); setOtpError("");
    const res = await fetch("/api/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile }) });
    const data = await res.json();
    setOtpLoading(false);
    if (res.ok) { setOtpSent(true); if (data.otp) setOtp(data.otp); }
    else setOtpError("OTP nahi aaya. Dobara try karo.");
  }

  async function verifyOtp() {
    setOtpLoading(true); setOtpError("");
    const res = await fetch("/api/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile, otp }) });
    setOtpLoading(false);
    if (res.ok) { setVerified(true); setOtpVerified(true); }
    else setOtpError("Galat ya expired OTP");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Naam chahiye";
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = "Valid 10-digit mobile daalo";
    if (!verified) e.otp = "Mobile verify karo pehle";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) e.pan = "Valid PAN daalo";
    if (!dob) e.dob = "Date of birth chahiye";
    if (!monthlyIncome || Number(monthlyIncome) < 10000) e.monthlyIncome = "Min income ₹10,000";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setUserDetails({ name: name.trim(), mobile, pan: pan.toUpperCase(), dob, employmentType, monthlyIncome: Number(monthlyIncome), cibilScore: cibilScore ? Number(cibilScore) : undefined });
    setLastRoute("/loan-requirement");
    router.push("/loan-requirement");
  }

  const inp = (field: string) =>
    `w-full border-2 rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all bg-white ${errors[field] ? "border-red-400 focus:border-red-400" : "border-gray-100 focus:border-violet-400"}`;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Step 1 of 4</span><span>Aapki Details</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full w-1/4 transition-all" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Aapke Baare Mein Batao</h2>
        <p className="text-gray-500 text-sm mt-1">Sirf bank eligibility match ke liye use hoga</p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Name */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <User size={14} className="text-violet-500" /> Poora Naam
          </label>
          <input type="text" placeholder="PAN card ke anusaar" value={name} onChange={(e) => setName(e.target.value)} className={inp("name")} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Mobile + OTP */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <Phone size={14} className="text-violet-500" /> Mobile Number
          </label>
          <div className="flex gap-2">
            <input type="tel" inputMode="numeric" placeholder="10-digit mobile" value={mobile}
              onChange={(e) => { setMobile(e.target.value); setOtpSent(false); setVerified(false); setOtpVerified(false); }}
              className={`flex-1 border-2 rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all ${errors.mobile ? "border-red-400" : "border-gray-100 focus:border-violet-400"}`} />
            {!verified ? (
              <button onClick={sendOtp} disabled={otpLoading}
                className="px-4 py-2 btn-gradient text-white rounded-xl text-sm font-bold whitespace-nowrap disabled:opacity-60 flex items-center gap-1.5">
                <Send size={13} /> {otpLoading ? "..." : otpSent ? "Resend" : "OTP Lo"}
              </button>
            ) : (
              <div className="flex items-center px-3 gap-1 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <CheckCircle size={18} className="text-emerald-500 fill-emerald-100" />
                <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
            )}
          </div>
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}

          {otpSent && !verified && (
            <div className="mt-2 bg-violet-50 rounded-xl p-3 border border-violet-100">
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" placeholder="6-digit OTP" value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 border-2 border-violet-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-violet-500 bg-white" />
                <button onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {otpLoading ? "..." : "Verify"}
                </button>
              </div>
              {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
              <p className="text-xs text-violet-500 mt-1.5">OTP bheja +91 {mobile} pe</p>
            </div>
          )}
          {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
        </div>

        {/* PAN */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <CreditCard size={14} className="text-violet-500" /> PAN Number
          </label>
          <input type="text" placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} className={inp("pan")} />
          {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
        </div>

        {/* DOB */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <Calendar size={14} className="text-violet-500" /> Date of Birth
          </label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inp("dob")} />
          {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
        </div>

        {/* Employment */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-2">
            <Briefcase size={14} className="text-violet-500" /> Employment Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["salaried", "self-employed", "business"] as const).map((t) => (
              <button key={t} onClick={() => setEmploymentType(t)}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${employmentType === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-100 text-gray-600"}`}>
                {t === "salaried" ? "Salaried" : t === "self-employed" ? "Self Emp." : "Business"}
              </button>
            ))}
          </div>
        </div>

        {/* Income */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <IndianRupee size={14} className="text-violet-500" /> Monthly Income (₹)
          </label>
          <input type="number" inputMode="numeric" placeholder="jaise 50000" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className={inp("monthlyIncome")} />
          {errors.monthlyIncome && <p className="text-xs text-red-500 mt-1">{errors.monthlyIncome}</p>}
        </div>

        {/* CIBIL */}
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1.5 block">
            CIBIL Score <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="number" inputMode="numeric" placeholder="300–900, jaise 750" value={cibilScore}
            onChange={(e) => setCibilScore(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-violet-400 bg-white" />
          <p className="text-xs text-gray-400 mt-1">mycibil.com pe free check karo</p>
        </div>
      </div>

      <button onClick={handleNext}
        className="mt-6 w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
        Aage Badho <ChevronRight size={22} />
      </button>
    </div>
  );
}
