"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { matchBanks, getAgeFromDOB, EmploymentType } from "@/lib/bank-data";
import { getAllBankConfigs, getGlobalSettings } from "@/lib/firestore";
import { CheckCircle } from "lucide-react";

const STEPS = [
  { label: "Reading bank statement...", duration: 1600 },
  { label: "Detecting income & salary credits...", duration: 1400 },
  { label: "Calculating monthly obligations & FOIR...", duration: 1300 },
  { label: "Checking bounce history...", duration: 1100 },
  { label: "Matching eligibility across 33 banks...", duration: 2000 },
  { label: "Preparing your personalised offers...", duration: 1100 },
];

export default function Processing() {
  const router = useRouter();
  const { statementAnalysis, userDetails, loanRequirement, setBankOffers, setDecisionAudit } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let prog = 0;
    const total = STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setCurrentStep(i), elapsed));
      elapsed += s.duration;
    });

    const progInterval = setInterval(() => {
      prog = Math.min(prog + 100 / (total / 100), 99);
      setProgress(prog);
    }, 100);

    timers.push(setTimeout(async () => {
      clearInterval(progInterval);
      setProgress(100);

      const income = statementAnalysis?.avgMonthlyIncome ?? userDetails.monthlyIncome ?? 0;
      const foir = statementAnalysis?.foir ?? 0.2;
      const age = userDetails.dob ? getAgeFromDOB(userDetails.dob) : 30;
      const loanType = loanRequirement.loanType ?? "personal";
      const amount = loanRequirement.amount ?? 500000;
      const tenure = loanRequirement.tenure ?? 36;
      const cibilScore = userDetails.cibilScore;

      const [bankOverrides, globalSettings] = await Promise.all([
        getAllBankConfigs().catch(() => ({})),
        getGlobalSettings().catch(() => ({})),
      ]);
      const { offers, audit } = matchBanks({
        income, foir, age, loanType, requestedAmount: amount, tenure, cibilScore,
        employmentType: (userDetails.employmentType ?? "salaried") as EmploymentType,
        bounceCount: statementAnalysis?.bounceCount,
        salaryCredits: statementAnalysis?.salaryCredits,
        bankOverrides,
        globalSettings,
      });
      setBankOffers(offers);
      setDecisionAudit(audit);

      setTimeout(() => router.push("/results"), 500);
    }, elapsed));

    return () => { timers.forEach(clearTimeout); clearInterval(progInterval); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-5 py-6" style={{ background: "#EFF6FF" }}>
      {/* Circle progress */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="68" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle cx="80" cy="80" r="68" fill="none" strokeWidth="8" strokeLinecap="round"
            stroke="url(#pg)"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - progress / 100)}`}
            className="transition-all duration-100" />
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0F2554" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-blue-800">{Math.round(progress)}%</span>
          <span className="text-xs text-gray-400 font-medium">analysing</span>
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-900 mb-2 text-center">AI is Analysing</h2>
      <p className="text-gray-400 text-sm text-center mb-8">Everything on your device — no data leaves your phone</p>

      <div className="w-full space-y-3">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < currentStep ? "bg-emerald-500" : i === currentStep ? "bg-blue-800" : "bg-gray-100"}`}>
              {i < currentStep
                ? <CheckCircle size={16} className="text-white" />
                : <span className={`text-xs font-black ${i === currentStep ? "text-white" : "text-gray-400"}`}>{i + 1}</span>
              }
            </div>
            <p className={`text-sm transition-all font-medium ${i === currentStep ? "text-blue-900 font-bold" : i < currentStep ? "text-emerald-600" : "text-gray-400"}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
