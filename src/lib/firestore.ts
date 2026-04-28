import { db } from "./firebase";
import {
  collection, addDoc, updateDoc, doc, getDoc, setDoc,
  getDocs, query, orderBy, serverTimestamp, where,
} from "firebase/firestore";
import type { EmploymentType } from "./bank-data";
import type { DecisionAudit } from "./store";

function isFirebaseConfigured() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "placeholder"
  );
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firebase timeout")), ms)
    ),
  ]);
}

export interface LoanApplication {
  id?: string;
  name: string;
  mobile: string;
  pan: string;
  dob: string;
  employmentType: string;
  monthlyIncome: number;
  loanType: string;
  requestedAmount: number;
  approvedAmount: number;
  tenure: number;
  bankName: string;
  interestRate: number;
  emi: number;
  address: string;
  pincode: string;
  paymentId: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "disbursed";
  referenceNo: string;
  aadhaarUrl?: string;
  panCardUrl?: string;
  photoUrl?: string;
  cibilScore?: number;
  foir?: number;
  decisionAudit?: DecisionAudit;
  policyVersion?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BankConfig {
  bankId: string;
  bankName: string;
  active: boolean;
  minIncome?: number;
  maxFoir?: number;
  minCibil?: number;
  minCibilSalaried?: number;
  minCibilSelfEmployed?: number;
  minCibilBusiness?: number;
  allowedEmploymentTypes?: EmploymentType[];
  interestRate?: { personal?: number; home?: number; auto?: number; business?: number; gold?: number; education?: number; lap?: number };
  processingFeePercent?: number;
  updatedAt?: unknown;
}

export interface GlobalSettings {
  globalFoirCap?: number;
  incomeMultiplierSalaried?: number;
  incomeMultiplierSelfEmployed?: number;
  incomeMultiplierBusiness?: number;
  maxBouncesStrict?: number;
  maxBouncesAll?: number;
  platformActive?: boolean;
  updatedAt?: unknown;
}

// ─── Applications ─────────────────────────────────────────────

/** Remove undefined fields — Firestore rejects them */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export async function saveApplication(data: Omit<LoanApplication, "id" | "createdAt" | "updatedAt">) {
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
  const ref = await withTimeout(addDoc(collection(db, "applications"), {
    ...clean(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function getApplication(id: string): Promise<LoanApplication | null> {
  if (!isFirebaseConfigured()) return null;
  const snap = await withTimeout(getDoc(doc(db, "applications", id)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as LoanApplication;
}

export async function getApplicationByRef(ref: string): Promise<LoanApplication | null> {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, "applications"), where("referenceNo", "==", ref));
  const snap = await withTimeout(getDocs(q));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as LoanApplication;
}

export async function getAllApplications(): Promise<LoanApplication[]> {
  if (!isFirebaseConfigured()) return [];
  const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
  const snap = await withTimeout(getDocs(q));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LoanApplication);
}

export async function updateApplicationStatus(id: string, status: LoanApplication["status"]) {
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
  await withTimeout(updateDoc(doc(db, "applications", id), { status, updatedAt: serverTimestamp() }));
}

export async function savePaymentRecord(data: {
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  amount: number;
  mobile: string;
}) {
  if (!isFirebaseConfigured()) return;
  await withTimeout(addDoc(collection(db, "payments"), { ...data, createdAt: serverTimestamp() }));
}

// ─── Global Settings ──────────────────────────────────────────

export async function getGlobalSettings(): Promise<GlobalSettings> {
  if (!isFirebaseConfigured()) return {};
  try {
    const snap = await withTimeout(getDoc(doc(db, "config", "global")));
    if (!snap.exists()) return {};
    return snap.data() as GlobalSettings;
  } catch { return {}; }
}

export async function saveGlobalSettings(settings: Omit<GlobalSettings, "updatedAt">) {
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
  await withTimeout(setDoc(doc(db, "config", "global"), {
    ...clean(settings as object),
    configVersion: Date.now().toString(36),
    updatedAt: serverTimestamp(),
  }, { merge: true }));
}

// ─── User Sessions ────────────────────────────────────────────

export interface UserSession {
  mobile: string;
  step: number;
  lastRoute: string;
  userDetails: {
    name?: string;
    pan?: string;
    dob?: string;
    employmentType?: string;
    monthlyIncome?: number;
    cibilScore?: number;
  };
  loanRequirement?: {
    loanType?: string;
    amount?: number;
    tenure?: number;
  };
  paymentDone?: boolean;
  applicationRef?: string;
  updatedAt?: unknown;
}

/** Fire-and-forget session save — never throws, never blocks the user */
export async function saveSession(
  mobile: string,
  data: Omit<UserSession, "mobile" | "updatedAt">,
) {
  if (!isFirebaseConfigured() || !mobile) return;
  try {
    await withTimeout(
      setDoc(doc(db, "sessions", mobile), {
        mobile, ...clean(data as object), updatedAt: serverTimestamp(),
      }, { merge: true }),
      4000,
    );
  } catch { /* non-critical */ }
}

export async function getSession(mobile: string): Promise<UserSession | null> {
  if (!isFirebaseConfigured() || !mobile) return null;
  try {
    const snap = await withTimeout(getDoc(doc(db, "sessions", mobile)), 4000);
    if (!snap.exists()) return null;
    return { mobile, ...snap.data() } as UserSession;
  } catch { return null; }
}

export async function clearSession(mobile: string) {
  if (!isFirebaseConfigured() || !mobile) return;
  try {
    await withTimeout(
      setDoc(doc(db, "sessions", mobile), {
        mobile, step: 0, lastRoute: "", updatedAt: serverTimestamp(),
      }),
      4000,
    );
  } catch { }
}

// ─── Bank Config ──────────────────────────────────────────────

export async function getAllBankConfigs(): Promise<Record<string, BankConfig>> {
  if (!isFirebaseConfigured()) return {};
  try {
    const snap = await withTimeout(getDocs(collection(db, "bankConfig")));
    const result: Record<string, BankConfig> = {};
    snap.docs.forEach((d) => { result[d.id] = { bankId: d.id, ...d.data() } as BankConfig; });
    return result;
  } catch { return {}; }
}

export async function saveBankConfig(config: BankConfig) {
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
  await withTimeout(setDoc(doc(db, "bankConfig", config.bankId), {
    ...config,
    configVersion: Date.now().toString(36),
    updatedAt: serverTimestamp(),
  }, { merge: true }));
}
