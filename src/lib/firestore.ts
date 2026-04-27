import { db } from "./firebase";
import {
  collection, addDoc, updateDoc, doc, getDoc, setDoc,
  getDocs, query, orderBy, serverTimestamp, where,
} from "firebase/firestore";

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
  interestRate?: { personal?: number; home?: number; auto?: number; business?: number; gold?: number; education?: number; lap?: number };
  processingFeePercent?: number;
  updatedAt?: unknown;
}

// ─── Applications ─────────────────────────────────────────────

export async function saveApplication(data: Omit<LoanApplication, "id" | "createdAt" | "updatedAt">) {
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
  const ref = await withTimeout(addDoc(collection(db, "applications"), {
    ...data,
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
    updatedAt: serverTimestamp(),
  }, { merge: true }));
}
