import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LangCode } from "./i18n";

export type EmploymentType = "salaried" | "self-employed" | "business";
export type LoanType = "personal" | "home" | "auto" | "business" | "gold" | "education" | "lap";
export type RiskGrade = "A" | "B" | "C" | "D";

export type RejectionReason =
  | "inactive"
  | "loan_type_not_offered"
  | "income_below_min"
  | "age_out_of_range"
  | "employment_type_not_allowed"
  | "cibil_below_min"
  | "bounces_exceeded_global"
  | "bounces_exceeded_strict"
  | "salary_credits_insufficient"
  | "foir_exceeded"
  | "amount_below_min";

export interface RejectedBank {
  bankId: string;
  bankName: string;
  reason: RejectionReason;
}

export interface DecisionAudit {
  policyVersion: string;
  timestamp: number;
  inputSnapshot: {
    income: number;
    effectiveIncome: number;
    foir: number;
    cibilScore?: number;
    employmentType: string;
    bounceCount: number;
    loanType: string;
    requestedAmount: number;
  };
  riskGrade: RiskGrade;
  rejectedBanks: RejectedBank[];
  eligibleCount: number;
}

export interface UserDetails {
  name: string;
  mobile: string;
  pan: string;
  dob: string;
  employmentType: EmploymentType;
  monthlyIncome: number;
  cibilScore?: number;
}

export interface LoanRequirement {
  loanType: LoanType;
  amount: number;
  tenure: number;
}

export interface StatementAnalysis {
  avgMonthlyIncome: number;
  avgMonthlyBalance: number;
  totalObligations: number;
  foir: number;
  bounceCount: number;
  salaryCredits: number;
  transactionCount: number;
}

export interface BankOffer {
  bankName: string;
  logo: string;
  logoUrl?: string;
  approvedAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  processingFee: number;
  color: string;
  riskGrade?: RiskGrade;
  approvalProbability?: number;
}

export interface AppState {
  step: number;
  userDetails: Partial<UserDetails>;
  loanRequirement: Partial<LoanRequirement>;
  statementAnalysis: StatementAnalysis | null;
  bankOffers: BankOffer[];
  selectedBank: BankOffer | null;
  decisionAudit: DecisionAudit | null;
  paymentDone: boolean;
  applicationRef: string;
  otpVerified: boolean;
  lastRoute: string;
  lang: LangCode;

  setStep: (step: number) => void;
  setUserDetails: (details: Partial<UserDetails>) => void;
  setLoanRequirement: (req: Partial<LoanRequirement>) => void;
  setStatementAnalysis: (analysis: StatementAnalysis) => void;
  setBankOffers: (offers: BankOffer[]) => void;
  setSelectedBank: (bank: BankOffer) => void;
  setDecisionAudit: (audit: DecisionAudit | null) => void;
  setPaymentDone: (done: boolean) => void;
  setApplicationRef: (ref: string) => void;
  setOtpVerified: (v: boolean) => void;
  setLastRoute: (route: string) => void;
  setLang: (lang: LangCode) => void;
  resetSession: () => void;
}

const initialState = {
  step: 1,
  userDetails: {},
  loanRequirement: {},
  statementAnalysis: null,
  bankOffers: [],
  selectedBank: null,
  decisionAudit: null,
  paymentDone: false,
  applicationRef: "",
  otpVerified: false,
  lastRoute: "",
  lang: "en" as LangCode,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setUserDetails: (details) =>
        set((s) => ({ userDetails: { ...s.userDetails, ...details } })),
      setLoanRequirement: (req) =>
        set((s) => ({ loanRequirement: { ...s.loanRequirement, ...req } })),
      setStatementAnalysis: (analysis) => set({ statementAnalysis: analysis }),
      setBankOffers: (offers) => set({ bankOffers: offers }),
      setSelectedBank: (bank) => set({ selectedBank: bank }),
      setDecisionAudit: (audit) => set({ decisionAudit: audit }),
      setPaymentDone: (done) => set({ paymentDone: done }),
      setApplicationRef: (ref) => set({ applicationRef: ref }),
      setOtpVerified: (v) => set({ otpVerified: v }),
      setLastRoute: (route) => set({ lastRoute: route }),
      setLang: (lang) => set({ lang }),
      resetSession: () => set({ ...initialState }),
    }),
    {
      name: "instantloan-v2",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (s) => ({
        userDetails: s.userDetails,
        loanRequirement: s.loanRequirement,
        otpVerified: s.otpVerified,
        lastRoute: s.lastRoute,
        applicationRef: s.applicationRef,
        step: s.step,
        lang: s.lang,
      }),
    }
  )
);
