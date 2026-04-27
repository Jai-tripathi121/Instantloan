import { BankOffer, LoanType } from "./store";

const LOGO_BASE = "https://raw.githubusercontent.com/praveenpuglia/indian-banks/master/assets/logos";

export interface BankCriteria {
  id: string;
  bankName: string;
  shortName: string;
  logo: string;
  logoSlug: string;
  color: string;
  sector: "public" | "private";
  minIncome: number;
  maxFoir: number;
  minAge: number;
  maxAge: number;
  minCibil: number;
  minLoanAmount: number;
  maxLoanAmount: { personal: number; home: number; auto: number; business: number; gold: number; education: number; lap: number };
  interestRate: { personal: number; home: number; auto: number; business: number; gold: number; education: number; lap: number };
  processingFeePercent: number;
  loanTypes: LoanType[];
  active: boolean;
}

export const DEFAULT_BANKS: BankCriteria[] = [
  // ─── PUBLIC SECTOR ────────────────────────────────────────────
  {
    id: "sbi", bankName: "State Bank of India", shortName: "SBI", logo: "SBI", logoSlug: "sbin",
    color: "#1E3A8A", sector: "public", minIncome: 15000, maxFoir: 0.55,
    minAge: 21, maxAge: 58, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 2000000, home: 10000000, auto: 5000000, business: 5000000, gold: 5000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 11.15, home: 8.50, auto: 8.75, business: 12.00, gold: 7.50, education: 8.65, lap: 9.20 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "pnb", bankName: "Punjab National Bank", shortName: "PNB", logo: "PNB", logoSlug: "punb",
    color: "#1D4ED8", sector: "public", minIncome: 12000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 630, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 5000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 10.40, home: 8.55, auto: 8.85, business: 11.75, gold: 7.70, education: 8.55, lap: 9.25 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "bob", bankName: "Bank of Baroda", shortName: "BOB", logo: "BOB", logoSlug: "barb",
    color: "#EA580C", sector: "public", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 640, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 5000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 11.05, home: 8.60, auto: 8.90, business: 12.50, gold: 8.00, education: 9.00, lap: 9.35 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "canara", bankName: "Canara Bank", shortName: "CAN", logo: "CAN", logoSlug: "cnrb",
    color: "#0F4C81", sector: "public", minIncome: 10000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 5000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 10.95, home: 8.50, auto: 8.80, business: 11.50, gold: 7.85, education: 8.50, lap: 9.20 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "union", bankName: "Union Bank of India", shortName: "UBI", logo: "UBI", logoSlug: "ubin",
    color: "#15803D", sector: "public", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 4000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 11.35, home: 8.50, auto: 8.80, business: 11.50, gold: 8.00, education: 8.75, lap: 9.30 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "boi", bankName: "Bank of India", shortName: "BOI", logo: "BOI", logoSlug: "bkid",
    color: "#1E40AF", sector: "public", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 630, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 4000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 11.25, home: 8.55, auto: 8.85, business: 12.00, gold: 8.00, education: 8.65, lap: 9.25 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "central", bankName: "Central Bank of India", shortName: "CBI", logo: "CBI", logoSlug: "cbin",
    color: "#7C3AED", sector: "public", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 600, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 7500000, auto: 2500000, business: 3000000, gold: 3000000, education: 7500000, lap: 30000000 },
    interestRate: { personal: 11.50, home: 8.60, auto: 8.90, business: 12.50, gold: 8.50, education: 9.25, lap: 9.50 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "indianbank", bankName: "Indian Bank", shortName: "IB", logo: "IB", logoSlug: "idib",
    color: "#0369A1", sector: "public", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 630, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 10000000, auto: 3000000, business: 5000000, gold: 5000000, education: 10000000, lap: 50000000 },
    interestRate: { personal: 11.00, home: 8.50, auto: 8.75, business: 11.75, gold: 7.90, education: 8.75, lap: 9.25 },
    processingFeePercent: 0.75, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "iob", bankName: "Indian Overseas Bank", shortName: "IOB", logo: "IOB", logoSlug: "ioba",
    color: "#2563EB", sector: "public", minIncome: 10000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 7500000, auto: 2000000, business: 3000000, gold: 3000000, education: 7500000, lap: 30000000 },
    interestRate: { personal: 11.70, home: 8.65, auto: 8.90, business: 12.50, gold: 8.50, education: 9.50, lap: 9.75 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "uco", bankName: "UCO Bank", shortName: "UCO", logo: "UCO", logoSlug: "ucba",
    color: "#4338CA", sector: "public", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 600, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 7500000, auto: 2000000, business: 3000000, gold: 3000000, education: 7500000, lap: 30000000 },
    interestRate: { personal: 11.45, home: 8.55, auto: 8.85, business: 12.00, gold: 8.20, education: 9.25, lap: 9.50 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "bom", bankName: "Bank of Maharashtra", shortName: "BOM", logo: "BOM", logoSlug: "mahb",
    color: "#0C4A6E", sector: "public", minIncome: 10000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 7500000, auto: 2000000, business: 3000000, gold: 3000000, education: 7500000, lap: 30000000 },
    interestRate: { personal: 11.00, home: 8.50, auto: 8.80, business: 12.00, gold: 8.00, education: 8.95, lap: 9.25 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "psb", bankName: "Punjab & Sind Bank", shortName: "PSB", logo: "PSB", logoSlug: "psib",
    color: "#1E3A5F", sector: "public", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 600, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 7500000, auto: 2000000, business: 3000000, gold: 2000000, education: 7500000, lap: 30000000 },
    interestRate: { personal: 11.50, home: 8.60, auto: 8.90, business: 12.00, gold: 8.50, education: 9.50, lap: 9.75 },
    processingFeePercent: 0.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  // ─── PRIVATE SECTOR ───────────────────────────────────────────
  {
    id: "hdfc", bankName: "HDFC Bank", shortName: "HDFC", logo: "HDFC", logoSlug: "hdfc",
    color: "#004C8F", sector: "private", minIncome: 25000, maxFoir: 0.50,
    minAge: 21, maxAge: 60, minCibil: 700, minLoanAmount: 50000,
    maxLoanAmount: { personal: 4000000, home: 15000000, auto: 5000000, business: 5000000, gold: 3000000, education: 7500000, lap: 100000000 },
    interestRate: { personal: 10.50, home: 8.60, auto: 8.75, business: 11.50, gold: 9.50, education: 9.50, lap: 9.50 },
    processingFeePercent: 1.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "icici", bankName: "ICICI Bank", shortName: "ICI", logo: "ICI", logoSlug: "icic",
    color: "#D97706", sector: "private", minIncome: 20000, maxFoir: 0.55,
    minAge: 23, maxAge: 58, minCibil: 700, minLoanAmount: 50000,
    maxLoanAmount: { personal: 5000000, home: 20000000, auto: 5000000, business: 5000000, gold: 3000000, education: 7500000, lap: 100000000 },
    interestRate: { personal: 10.75, home: 8.65, auto: 8.90, business: 12.00, gold: 10.00, education: 10.00, lap: 9.75 },
    processingFeePercent: 2.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "axis", bankName: "Axis Bank", shortName: "AXIS", logo: "AXIS", logoSlug: "utib",
    color: "#7F1D1D", sector: "private", minIncome: 15000, maxFoir: 0.50,
    minAge: 21, maxAge: 60, minCibil: 680, minLoanAmount: 50000,
    maxLoanAmount: { personal: 4000000, home: 10000000, auto: 5000000, business: 3000000, gold: 2000000, education: 5000000, lap: 50000000 },
    interestRate: { personal: 10.49, home: 8.75, auto: 8.80, business: 13.00, gold: 9.00, education: 9.75, lap: 9.90 },
    processingFeePercent: 1.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "kotak", bankName: "Kotak Mahindra Bank", shortName: "KMB", logo: "KMB", logoSlug: "kkbk",
    color: "#991B1B", sector: "private", minIncome: 20000, maxFoir: 0.50,
    minAge: 21, maxAge: 58, minCibil: 700, minLoanAmount: 50000,
    maxLoanAmount: { personal: 4000000, home: 10000000, auto: 5000000, business: 3000000, gold: 2000000, education: 5000000, lap: 50000000 },
    interestRate: { personal: 10.99, home: 8.70, auto: 8.85, business: 13.50, gold: 10.00, education: 10.50, lap: 10.00 },
    processingFeePercent: 2.5, loanTypes: ["personal", "home", "auto", "lap", "education"], active: true,
  },
  {
    id: "yes", bankName: "Yes Bank", shortName: "YES", logo: "YES", logoSlug: "yesb",
    color: "#0F172A", sector: "private", minIncome: 20000, maxFoir: 0.50,
    minAge: 21, maxAge: 60, minCibil: 700, minLoanAmount: 50000,
    maxLoanAmount: { personal: 4000000, home: 10000000, auto: 5000000, business: 5000000, gold: 2000000, education: 5000000, lap: 50000000 },
    interestRate: { personal: 10.99, home: 8.95, auto: 9.00, business: 14.00, gold: 11.00, education: 12.00, lap: 10.50 },
    processingFeePercent: 2.0, loanTypes: ["personal", "home", "auto", "business", "education", "lap"], active: true,
  },
  {
    id: "idfc", bankName: "IDFC First Bank", shortName: "IDFC", logo: "IDFC", logoSlug: "idfb",
    color: "#9B2335", sector: "private", minIncome: 20000, maxFoir: 0.55,
    minAge: 23, maxAge: 60, minCibil: 690, minLoanAmount: 50000,
    maxLoanAmount: { personal: 4000000, home: 10000000, auto: 5000000, business: 5000000, gold: 2000000, education: 5000000, lap: 50000000 },
    interestRate: { personal: 10.99, home: 8.85, auto: 8.90, business: 13.00, gold: 10.50, education: 11.00, lap: 10.50 },
    processingFeePercent: 2.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "indusind", bankName: "IndusInd Bank", shortName: "IIB", logo: "IIB", logoSlug: "indb",
    color: "#1E3A8A", sector: "private", minIncome: 20000, maxFoir: 0.50,
    minAge: 21, maxAge: 60, minCibil: 700, minLoanAmount: 50000,
    maxLoanAmount: { personal: 5000000, home: 10000000, auto: 5000000, business: 5000000, gold: 2000000, education: 5000000, lap: 50000000 },
    interestRate: { personal: 10.49, home: 8.75, auto: 8.85, business: 13.00, gold: 10.00, education: 11.50, lap: 10.50 },
    processingFeePercent: 2.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "federal", bankName: "Federal Bank", shortName: "FED", logo: "FED", logoSlug: "fdrl",
    color: "#0F766E", sector: "private", minIncome: 15000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 50000,
    maxLoanAmount: { personal: 2500000, home: 10000000, auto: 3000000, business: 5000000, gold: 1500000, education: 5000000, lap: 30000000 },
    interestRate: { personal: 12.00, home: 8.70, auto: 9.00, business: 13.00, gold: 9.50, education: 11.00, lap: 10.00 },
    processingFeePercent: 1.5, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "rbl", bankName: "RBL Bank", shortName: "RBL", logo: "RBL", logoSlug: "ratn",
    color: "#059669", sector: "private", minIncome: 20000, maxFoir: 0.50,
    minAge: 23, maxAge: 60, minCibil: 700, minLoanAmount: 100000,
    maxLoanAmount: { personal: 3500000, home: 10000000, auto: 5000000, business: 5000000, gold: 1000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 14.00, home: 9.00, auto: 9.25, business: 14.50, gold: 12.00, education: 12.50, lap: 11.50 },
    processingFeePercent: 3.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "bandhan", bankName: "Bandhan Bank", shortName: "BDN", logo: "BDN", logoSlug: "bdbl",
    color: "#DC2626", sector: "private", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 600, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2000000, business: 3000000, gold: 1000000, education: 3000000, lap: 20000000 },
    interestRate: { personal: 12.00, home: 9.15, auto: 9.50, business: 15.00, gold: 11.00, education: 13.00, lap: 11.00 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "cub", bankName: "City Union Bank", shortName: "CUB", logo: "CUB", logoSlug: "ciub",
    color: "#6B21A8", sector: "private", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.50, home: 9.00, auto: 9.25, business: 13.00, gold: 9.50, education: 11.50, lap: 10.50 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "karnataka", bankName: "Karnataka Bank", shortName: "KBL", logo: "KBL", logoSlug: "karb",
    color: "#0369A1", sector: "private", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.00, home: 8.90, auto: 9.00, business: 13.00, gold: 9.50, education: 11.00, lap: 10.25 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "sib", bankName: "South Indian Bank", shortName: "SIB", logo: "SIB", logoSlug: "sibl",
    color: "#047857", sector: "private", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.50, home: 8.95, auto: 9.25, business: 13.50, gold: 9.50, education: 11.50, lap: 10.50 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "jkbank", bankName: "J&K Bank", shortName: "JKB", logo: "JKB", logoSlug: "jaka",
    color: "#0C4A6E", sector: "private", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 5000000, lap: 30000000 },
    interestRate: { personal: 11.25, home: 8.65, auto: 8.85, business: 12.00, gold: 8.50, education: 9.50, lap: 9.50 },
    processingFeePercent: 0.75, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "dhanlaxmi", bankName: "Dhanlaxmi Bank", shortName: "DLB", logo: "DLB", logoSlug: "dlxb",
    color: "#B45309", sector: "private", minIncome: 10000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 640, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1000000, home: 5000000, auto: 2000000, business: 3000000, gold: 1500000, education: 2000000, lap: 20000000 },
    interestRate: { personal: 12.75, home: 9.25, auto: 9.50, business: 14.00, gold: 10.00, education: 12.00, lap: 11.00 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "kvb", bankName: "Karur Vysya Bank", shortName: "KVB", logo: "KVB", logoSlug: "kvbl",
    color: "#BE123C", sector: "private", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.50, home: 9.00, auto: 9.25, business: 13.00, gold: 9.50, education: 11.50, lap: 10.50 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "nainital", bankName: "Nainital Bank", shortName: "NTB", logo: "NTB", logoSlug: "ntbl",
    color: "#1E40AF", sector: "private", minIncome: 10000, maxFoir: 0.60,
    minAge: 21, maxAge: 60, minCibil: 620, minLoanAmount: 10000,
    maxLoanAmount: { personal: 1000000, home: 5000000, auto: 2000000, business: 3000000, gold: 1500000, education: 2000000, lap: 20000000 },
    interestRate: { personal: 11.75, home: 8.80, auto: 9.00, business: 12.50, gold: 9.00, education: 10.50, lap: 10.00 },
    processingFeePercent: 0.75, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "dcb", bankName: "DCB Bank", shortName: "DCB", logo: "DCB", logoSlug: "dcbl",
    color: "#D97706", sector: "private", minIncome: 15000, maxFoir: 0.55,
    minAge: 23, maxAge: 60, minCibil: 680, minLoanAmount: 50000,
    maxLoanAmount: { personal: 2000000, home: 10000000, auto: 3000000, business: 5000000, gold: 1000000, education: 2000000, lap: 50000000 },
    interestRate: { personal: 13.50, home: 9.25, auto: 9.50, business: 14.00, gold: 11.00, education: 13.00, lap: 11.50 },
    processingFeePercent: 2.0, loanTypes: ["personal", "home", "auto", "business", "gold", "lap"], active: true,
  },
  {
    id: "tmb", bankName: "Tamilnad Mercantile Bank", shortName: "TMB", logo: "TMB", logoSlug: "tmbl",
    color: "#7C2D12", sector: "private", minIncome: 12000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 650, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.25, home: 9.00, auto: 9.25, business: 13.00, gold: 9.50, education: 11.50, lap: 10.50 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "csb", bankName: "CSB Bank", shortName: "CSB", logo: "CSB", logoSlug: "csbk",
    color: "#1E3A5F", sector: "private", minIncome: 10000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 640, minLoanAmount: 25000,
    maxLoanAmount: { personal: 1500000, home: 7500000, auto: 2500000, business: 5000000, gold: 2000000, education: 3000000, lap: 30000000 },
    interestRate: { personal: 12.00, home: 8.90, auto: 9.00, business: 13.00, gold: 9.50, education: 11.00, lap: 10.25 },
    processingFeePercent: 1.0, loanTypes: ["personal", "home", "auto", "business", "gold", "education", "lap"], active: true,
  },
  {
    id: "au", bankName: "AU Small Finance Bank", shortName: "AU", logo: "AU", logoSlug: "aubl",
    color: "#C026D3", sector: "private", minIncome: 15000, maxFoir: 0.55,
    minAge: 21, maxAge: 60, minCibil: 660, minLoanAmount: 50000,
    maxLoanAmount: { personal: 2500000, home: 7500000, auto: 3000000, business: 5000000, gold: 1000000, education: 2000000, lap: 30000000 },
    interestRate: { personal: 13.50, home: 9.00, auto: 9.25, business: 14.00, gold: 11.00, education: 13.50, lap: 12.00 },
    processingFeePercent: 2.0, loanTypes: ["personal", "home", "auto", "business", "gold", "lap"], active: true,
  },
];

function calcEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export function getAgeFromDOB(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

type BankOverride = Omit<Partial<BankCriteria>, "interestRate"> & {
  active?: boolean;
  interestRate?: Partial<BankCriteria["interestRate"]>;
};

export function matchBanks(params: {
  income: number;
  foir: number;
  age: number;
  loanType: LoanType;
  requestedAmount: number;
  tenure: number;
  cibilScore?: number;
  bankOverrides?: Record<string, BankOverride>;
}): BankOffer[] {
  const { income, foir, age, loanType, requestedAmount, tenure, cibilScore, bankOverrides = {} } = params;
  const offers: BankOffer[] = [];

  for (const bank of DEFAULT_BANKS) {
    const ov = bankOverrides[bank.id] ?? {};
    const b: BankCriteria & { active: boolean } = {
      ...bank,
      ...(ov.minIncome !== undefined ? { minIncome: ov.minIncome } : {}),
      ...(ov.maxFoir !== undefined ? { maxFoir: ov.maxFoir } : {}),
      ...(ov.minCibil !== undefined ? { minCibil: ov.minCibil } : {}),
      ...(ov.processingFeePercent !== undefined ? { processingFeePercent: ov.processingFeePercent } : {}),
      ...(ov.loanTypes ? { loanTypes: ov.loanTypes } : {}),
      interestRate: ov.interestRate ? {
        personal: ov.interestRate.personal ?? bank.interestRate.personal,
        home: ov.interestRate.home ?? bank.interestRate.home,
        auto: ov.interestRate.auto ?? bank.interestRate.auto,
        business: ov.interestRate.business ?? bank.interestRate.business,
        gold: ov.interestRate.gold ?? bank.interestRate.gold,
        education: ov.interestRate.education ?? bank.interestRate.education,
        lap: ov.interestRate.lap ?? bank.interestRate.lap,
      } : bank.interestRate,
      active: ov.active ?? bank.active,
    };

    if (b.active === false) continue;
    if (!b.loanTypes.includes(loanType)) continue;
    if (income < b.minIncome) continue;
    if (foir > b.maxFoir) continue;
    if (age < b.minAge || age > b.maxAge) continue;
    if (cibilScore && cibilScore < b.minCibil) continue;

    const maxForBank = b.maxLoanAmount[loanType];
    const availableAfterFoir = Math.floor(income * (b.maxFoir - foir) * tenure);
    const approvedAmount = Math.min(requestedAmount, maxForBank, availableAfterFoir);
    if (approvedAmount < b.minLoanAmount) continue;

    const rate = b.interestRate[loanType];
    const emi = calcEMI(approvedAmount, rate, tenure);
    const processingFee = Math.round((approvedAmount * b.processingFeePercent) / 100);

    offers.push({
      bankName: b.bankName,
      logo: b.logo,
      logoUrl: `${LOGO_BASE}/${b.logoSlug}/symbol.svg`,
      approvedAmount,
      interestRate: rate,
      tenure,
      emi,
      processingFee,
      color: b.color,
    });
  }

  return offers.sort((a, b) => a.interestRate - b.interestRate);
}

export const BANKS = DEFAULT_BANKS;
