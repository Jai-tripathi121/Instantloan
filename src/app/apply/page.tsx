"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { saveApplication } from "@/lib/firestore";
import { uploadApplicationDocs } from "@/lib/storage";
import { ArrowLeft, MapPin, Hash, Camera, User, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import BankLogo from "@/components/BankLogo";

export default function Apply() {
  const router = useRouter();
  const { userDetails, selectedBank, loanRequirement, statementAnalysis, setApplicationRef, setLastRoute } = useAppStore();
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setLastRoute("/apply"); }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = "Address chahiye";
    if (!/^\d{6}$/.test(pincode)) e.pincode = "Valid 6-digit pincode daalo";
    if (!aadhaar) e.aadhaar = "Aadhaar upload karo";
    if (!panCard) e.pan = "PAN card upload karo";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const ref = `${selectedBank?.bankName?.replace(/\s/g, "").toUpperCase()}${Date.now().toString().slice(-8)}`;

      // Document upload — best-effort with 6s timeout, never blocks submission
      setSubmitStep("Documents save ho rahe hain (max 6 sec)...");
      let docUrls: { aadhaarUrl?: string; panCardUrl?: string; photoUrl?: string } = {};
      try { docUrls = await uploadApplicationDocs(ref, aadhaar, panCard, photo); } catch { /* proceed without doc URLs */ }

      // Save application to Firestore
      setSubmitStep("Application save ho rahi hai...");
      await saveApplication({
        name: userDetails.name ?? "", mobile: userDetails.mobile ?? "",
        pan: userDetails.pan ?? "", dob: userDetails.dob ?? "",
        employmentType: userDetails.employmentType ?? "salaried",
        monthlyIncome: userDetails.monthlyIncome ?? 0,
        loanType: loanRequirement.loanType ?? "personal",
        requestedAmount: loanRequirement.amount ?? 0,
        approvedAmount: selectedBank?.approvedAmount ?? 0,
        tenure: selectedBank?.tenure ?? 36,
        bankName: selectedBank?.bankName ?? "",
        interestRate: selectedBank?.interestRate ?? 0,
        emi: selectedBank?.emi ?? 0,
        address, pincode, paymentId: "paid", status: "submitted",
        referenceNo: ref, cibilScore: userDetails.cibilScore,
        foir: statementAnalysis?.foir, ...docUrls,
      });

      // Notify (best-effort)
      setSubmitStep("Confirmation SMS bheja ja raha hai...");
      try {
        await fetch("/api/notify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: userDetails.mobile, name: userDetails.name, bankName: selectedBank?.bankName, amount: selectedBank?.approvedAmount, referenceNo: ref }),
        });
      } catch { /* notification failure should not block confirmation */ }

      setApplicationRef(ref);
      router.push("/confirmation");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitting(false);
      setSubmitStep("");
      alert("Application save nahi hui. Internet check karo aur dobara try karo.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-black text-gray-900">Loan Application</h2>
      </div>

      {selectedBank && (
        <div className="rounded-2xl p-4 mb-5 border-2 border-opacity-20" style={{ backgroundColor: `${selectedBank.color}12`, borderColor: selectedBank.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BankLogo logoUrl={selectedBank.logoUrl} logo={selectedBank.logo} color={selectedBank.color} size={44} />
              <div>
                <p className="font-black text-gray-900">{selectedBank.bankName}</p>
                <p className="text-xs font-bold" style={{ color: selectedBank.color }}>₹{selectedBank.approvedAmount.toLocaleString("en-IN")} @ {selectedBank.interestRate}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">EMI</p>
              <p className="font-black text-gray-900">₹{selectedBank.emi.toLocaleString("en-IN")}/mo</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 flex-1">
        {/* Pre-filled */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <User size={14} className="text-violet-500" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Pre-filled Details</p>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-gray-400">Naam</span><span className="font-bold">{userDetails.name}</span>
            <span className="text-gray-400">PAN</span><span className="font-bold">{userDetails.pan}</span>
            <span className="text-gray-400">Mobile</span><span className="font-bold">{userDetails.mobile}</span>
            <span className="text-gray-400">Employment</span><span className="font-bold capitalize">{userDetails.employmentType}</span>
            <span className="text-gray-400">Income</span><span className="font-bold">₹{userDetails.monthlyIncome?.toLocaleString("en-IN")}/mo</span>
            <span className="text-gray-400">Loan Type</span><span className="font-bold capitalize">{loanRequirement.loanType}</span>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <MapPin size={14} className="text-violet-500" /> Current Address
          </label>
          <textarea rows={3} placeholder="House/Flat No., Street, Area, City" value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors((er) => ({ ...er, address: "" })); }}
            className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none resize-none transition-all ${errors.address ? "border-red-400" : "border-gray-100 focus:border-violet-400"}`} />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
            <Hash size={14} className="text-violet-500" /> Pincode
          </label>
          <input type="number" inputMode="numeric" placeholder="6-digit pincode" value={pincode}
            onChange={(e) => { setPincode(e.target.value); setErrors((er) => ({ ...er, pincode: "" })); }}
            className={`w-full border-2 rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all ${errors.pincode ? "border-red-400" : "border-gray-100 focus:border-violet-400"}`} />
          {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
        </div>

        {/* File uploads */}
        {[
          { label: "Aadhaar Card", file: aadhaar, onFile: setAadhaar, ref: aadhaarRef, err: errors.aadhaar, accept: "image/*,application/pdf" },
          { label: "PAN Card", file: panCard, onFile: setPanCard, ref: panRef, err: errors.pan, accept: "image/*,application/pdf" },
          { label: "Passport Photo (Optional)", file: photo, onFile: setPhoto, ref: photoRef, err: undefined, accept: "image/*" },
        ].map((u) => (
          <div key={u.label}>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{u.label}</label>
            <div onClick={() => u.ref.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${u.file ? "border-emerald-400 bg-emerald-50" : u.err ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-violet-300"}`}>
              <input ref={u.ref} type="file" accept={u.accept} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) u.onFile(f); }} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${u.file ? "bg-emerald-100" : "bg-gray-200"}`}>
                {u.file ? <CheckCircle size={20} className="text-emerald-600" /> : <Camera size={20} className="text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">{u.file ? u.file.name : `${u.label} Upload Karo`}</p>
                <p className="text-xs text-gray-400">{u.file ? `${(u.file.size / 1024).toFixed(0)} KB` : "JPG, PNG ya PDF"}</p>
              </div>
            </div>
            {u.err && <p className="text-xs text-red-500 mt-1">{u.err}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {submitting && submitStep && (
          <div className="flex items-center justify-center gap-2 text-xs text-violet-600 mb-2 font-bold">
            <Loader2 size={14} className="animate-spin" /> {submitStep}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mb-3">
          Submit karne par aap {selectedBank?.bankName} ko CIBIL hard inquiry ki permission dete ho
        </p>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full btn-gradient text-white font-black py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-all">
          {submitting ? "Submit ho rahi hai..." : (<>{selectedBank?.bankName ?? "Bank"} ko Submit Karo <ChevronRight size={22} /></>)}
        </button>
      </div>
    </div>
  );
}
