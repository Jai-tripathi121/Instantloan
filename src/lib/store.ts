import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EmploymentType = "salaried" | "self-employed" | "business";
export type LoanType = "personal" | "home" | "auto" | "business" | "gold" | "education" | "lap";

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
}

export interface AppState {
  step: number;
  userDetails: Partial<UserDetails>;
  loanRequirement: Partial<LoanRequirement>;
  statementAnalysis: StatementAnalysis | null;
  bankOffers: BankOffer[];
  selectedBank: BankOffer | null;
  paymentDone: boolean;
  applicationRef: string;
  otpVerified: boolean;
  lastRoute: string;

  setStep: (step: number) => void;
  setUserDetails: (details: Partial<UserDetails>) => void;
  setLoanRequirement: (req: Partial<LoanRequirement>) => void;
  setStatementAnalysis: (analysis: StatementAnalysis) => void;
  setBankOffers: (offers: BankOffer[]) => void;
  setSelectedBank: (bank: BankOffer) => void;
  setPaymentDone: (done: boolean) => void;
  setApplicationRef: (ref: string) => void;
  setOtpVerified: (v: boolean) => void;
  setLastRoute: (route: string) => void;
  resetSession: () => void;
}

const initialState = {
  step: 1,
  userDetails: {},
  loanRequirement: {},
  statementAnalysis: null,
  bankOffers: [],
  selectedBank: null,
  paymentDone: false,
  applicationRef: "",
  otpVerified: false,
  lastRoute: "",
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
      setPaymentDone: (done) => set({ paymentDone: done }),
      setApplicationRef: (ref) => set({ applicationRef: ref }),
      setOtpVerified: (v) => set({ otpVerified: v }),
      setLastRoute: (route) => set({ lastRoute: route }),
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
      }),
    }
  )
);
