/**
 * postmoney — Bank Statement Intelligence Engine
 * Rule-based categorisation + fraud detection + underwriting scoring
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TxCategory =
  | "SALARY" | "BUSINESS_INFLOW" | "EMI" | "NACH_ECS" | "RENT"
  | "FOOD_DELIVERY" | "TRANSPORT" | "ECOMMERCE" | "INVESTMENT" | "INSURANCE"
  | "UTILITIES" | "TELECOM" | "ATM_CASH" | "NEFT_RTGS" | "UPI_TRANSFER"
  | "GAMBLING" | "LOAN_APP" | "BOUNCE" | "WALLET" | "MEDICAL"
  | "EDUCATION" | "TAX" | "CREDIT_CARD" | "BNPL" | "SALARY_REVERSAL"
  | "OTHER";

export interface ParsedTx {
  date: string;       // raw date string from statement
  monthKey: string;   // "2026-01"
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  category: TxCategory;
  isBounce: boolean;
}

export interface MonthSummary {
  monthKey: string;
  label: string;           // "Jan 2026"
  totalCredits: number;
  totalDebits: number;
  avgBalance: number;
  minBalance: number;
  maxBalance: number;
  bounceCount: number;
  emiTotal: number;
  salaryAmount: number;
  cashWithdrawn: number;
  investmentAmount: number;
  creditCardPaid: number;
}

export type FraudType =
  | "FAKE_SALARY" | "IMMEDIATE_REVERSAL" | "BALANCE_PARKING"
  | "CIRCULAR_TXN" | "LOAN_APP_USAGE" | "GAMBLING_DETECTED"
  | "BOUNCE_CLUSTER" | "NO_SALARY_HISTORY" | "INCOME_SPIKE";

export interface FraudSignal {
  type: FraudType;
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface ScoreBreakdown {
  incomeStability: number;   // 0–25
  bounceHistory: number;     // 0–25
  balanceQuality: number;    // 0–20
  foirScore: number;         // 0–15
  spendingPattern: number;   // 0–15
  total: number;             // 0–100
}

export type LendingDecision = "STRONG_APPROVE" | "APPROVE" | "MANUAL_REVIEW" | "REJECT";

export interface StatementIntelligence {
  // ── Backwards-compatible base fields (matches existing StatementAnalysis) ──
  avgMonthlyIncome: number;
  avgMonthlyBalance: number;
  totalObligations: number;
  foir: number;
  bounceCount: number;
  salaryCredits: number;
  transactionCount: number;

  // ── Income ────────────────────────────────────────────────────────────────
  incomeStabilityScore: number;        // 0–100
  primaryIncomeSource: "SALARY" | "BUSINESS" | "MIXED" | "UNKNOWN";
  salaryMonths: number;                // how many months had salary credit
  avgSalaryAmount: number;
  businessInflow: number;              // avg monthly business credits

  // ── Balance ───────────────────────────────────────────────────────────────
  minMonthlyBalance: number;           // lowest single balance across all months
  avgMinMonthlyBalance: number;        // avg of each month's minimum balance

  // ── Obligations ───────────────────────────────────────────────────────────
  existingEMIs: number;                // avg monthly EMI deductions
  creditCardDues: number;              // avg monthly CC payments
  bnplUsage: boolean;
  bnplAmount: number;

  // ── Spending ──────────────────────────────────────────────────────────────
  cashWithdrawalRatio: number;         // cash withdrawn / total debits
  categorySpend: Partial<Record<TxCategory, number>>;  // avg monthly spend per category
  hasInvestments: boolean;
  investmentAmount: number;            // avg monthly investment amount
  hasInsurance: boolean;

  // ── Risk / Fraud ──────────────────────────────────────────────────────────
  fraudSignals: FraudSignal[];
  fraudRisk: "low" | "medium" | "high";
  loanAppUsage: boolean;
  gamblingDetected: boolean;

  // ── Lending Score ─────────────────────────────────────────────────────────
  lendingScore: number;                // 300–900
  lendingDecision: LendingDecision;
  scoreBreakdown: ScoreBreakdown;

  // ── Monthly Breakdown ─────────────────────────────────────────────────────
  monthlyBreakdown: MonthSummary[];
  statementMonths: number;

  // ── Metadata ──────────────────────────────────────────────────────────────
  detectedBank: string;
  parseQuality: "high" | "medium" | "low";  // how well we parsed the PDF
  rawLineCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Rules
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_RULES: Array<{ cat: TxCategory; kw: string[] }> = [
  { cat: "BOUNCE",          kw: ["bounce", "return", "dishonour", "dishonor", "insufficient", "ecs rtn", "nach rtn", "chq rtn", "cheque return", "failed emi", "rtgs return", "neft return", "unpaid", "inward return"] },
  { cat: "SALARY",          kw: ["salary", "sal/", "sal ", "payroll", "pay credit", "employer credit", "monthly pay", "wage", "stipend"] },
  { cat: "SALARY_REVERSAL", kw: ["salary reversal", "salary return", "sal reversal"] },
  { cat: "EMI",             kw: ["emi", "equated monthly", "home loan emi", "hl emi", "car loan", "personal loan emi", "pl emi", "emi payment", "loan repayment"] },
  { cat: "NACH_ECS",        kw: ["nach", "ecs debit", "ecs cr", "auto debit", "mandate", "standing instruction", "si debit", "auto pay"] },
  { cat: "CREDIT_CARD",     kw: ["credit card", "cc bill", "cc payment", "hdfc cc", "icici cc", "sbi card", "axis cc", "credit card emi", "cc outstanding", "amex"] },
  { cat: "BNPL",            kw: ["simpl", "slice", "uni card", "postpe", "lazypay", "bnpl", "buy now pay", "capital float", "axio"] },
  { cat: "LOAN_APP",        kw: ["cashe", "navi ", "kreditbee", "moneyview", "fibe ", "paysense", "freopay", "moneytap", "earlysalary", "indialends", "ring by"] },
  { cat: "GAMBLING",        kw: ["betway", "dream11", "myfab11", "mpokerhub", "casino", "1xbet", "parimatch", "betkaro", "fantasy sport", "rummy", "teen patti", "poker", "bet365", "wolfbet", "ludo cash"] },
  { cat: "INVESTMENT",      kw: ["zerodha", "groww", "upstox", "mutual fund", "sip ", "mf ", "nps ", "ppf ", "fd ", "fixed deposit", "nsc", "elss", "demat", "icicidirect", "hdfcsec", "angelone", "kotak sec"] },
  { cat: "INSURANCE",       kw: ["insurance", "lic ", "premium", "policy premium", "bajaj allianz", "hdfc life", "icici pru", "star health", "niacl", "sbi life", "max life"] },
  { cat: "RENT",            kw: ["rent", "house rent", "housing", "rental", "flat rent", "pg rent", "property rent"] },
  { cat: "FOOD_DELIVERY",   kw: ["swiggy", "zomato", "blinkit", "dunzo", "zepto", "bigbasket", "instamart", "grofers", "jiomart", "milkbasket"] },
  { cat: "TRANSPORT",       kw: ["uber", "ola ", "rapido", "metro", "irctc", "makemytrip", "goibibo", "yatra", "redbus", "railway", "air india", "indigo", "vistara", "spicejet"] },
  { cat: "ECOMMERCE",       kw: ["amazon", "flipkart", "myntra", "meesho", "ajio", "nykaa", "snapdeal", "shopclues", "firstcry", "tatacliq", "pepperfry", "ikea"] },
  { cat: "UTILITIES",       kw: ["electricity", "water bill", "gas bill", "bescom", "bses", "msedcl", "tata power", "adani elec", "torrent power", "brpl", "discoms"] },
  { cat: "TELECOM",         kw: ["airtel", "jio ", "bsnl", "vodafone", "vi ", "tata tele", "recharge", "postpaid", "mobile bill"] },
  { cat: "ATM_CASH",        kw: ["atm ", "atm/", "cash wdl", "cash withdrawal", "atm wdl", "cash drawn", "cash dep", "atm debit", "cash cdm"] },
  { cat: "WALLET",          kw: ["paytm", "phonepe", "mobikwik", "amazon pay", "freecharge", "gpay", "googlepay", "bhim"] },
  { cat: "MEDICAL",         kw: ["pharmacy", "hospital", "clinic", "medplus", "apollo pharm", "netmeds", "1mg", "practo", "medibuddy"] },
  { cat: "EDUCATION",       kw: ["school fee", "college fee", "tuition", "admission fee", "byju", "unacademy", "coursera", "udemy"] },
  { cat: "TAX",             kw: ["income tax", "tds", "advance tax", "gst payment", "tax challan", "oltas"] },
  { cat: "NEFT_RTGS",       kw: ["neft", "rtgs", "wire transfer", "fund transfer"] },
  { cat: "UPI_TRANSFER",    kw: ["upi/", "upi-", "upi cr", "upi dr", "imps", "imps cr", "imps dr"] },
  { cat: "BUSINESS_INFLOW", kw: ["vendor payment", "invoice", "business credit", "gst refund", "export proceeds", "trade credit", "b2b payment", "pvt ltd", "private limited", "pvt. ltd", "ltd-", "limited-", "company cr", "firm cr"] },
];

function categorise(narration: string): TxCategory {
  const n = narration.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.kw.some((k) => n.includes(k))) return rule.cat;
  }
  return "OTHER";
}

// ─────────────────────────────────────────────────────────────────────────────
// Bank detection
// ─────────────────────────────────────────────────────────────────────────────

const BANK_SIGNATURES: Array<{ name: string; kw: string[] }> = [
  { name: "SBI",          kw: ["state bank of india", "sbi"] },
  { name: "HDFC Bank",    kw: ["hdfc bank"] },
  { name: "ICICI Bank",   kw: ["icici bank"] },
  { name: "Axis Bank",    kw: ["axis bank"] },
  { name: "PNB",          kw: ["punjab national bank", "pnb"] },
  { name: "Kotak",        kw: ["kotak mahindra"] },
  { name: "Yes Bank",     kw: ["yes bank"] },
  { name: "Canara Bank",  kw: ["canara bank"] },
  { name: "IDFC First",   kw: ["idfc first", "idfc bank"] },
  { name: "IndusInd",     kw: ["indusind"] },
  { name: "Bank of Baroda", kw: ["bank of baroda", "bob"] },
  { name: "Union Bank",   kw: ["union bank of india"] },
  { name: "Federal Bank", kw: ["federal bank"] },
];

function detectBank(text: string): string {
  const lower = text.toLowerCase().slice(0, 2000); // check header only
  for (const b of BANK_SIGNATURES) {
    if (b.kw.some((k) => lower.includes(k))) return b.name;
  }
  return "Unknown Bank";
}

// ─────────────────────────────────────────────────────────────────────────────
// Date matching — supports numeric (DD/MM/YYYY) and string-month (DD-MMM-YYYY)
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_NUM: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

// DD/MM/YYYY · DD-MM-YYYY · DD.MM.YYYY (1 or 2 digit day)
const DATE_NUM_RE = /\b(\d{1,2})[\/\-\.](\d{2})[\/\-\.](\d{2,4})\b/;
// DD-MMM-YYYY · DD/MMM/YYYY · DD MMM YYYY · DD MMM YY (e.g. 01-May-2026)
const DATE_STR_RE = /\b(\d{1,2})[\-\/\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\-\/\s](\d{2,4})\b/i;

interface DateMatch { monthKey: string; raw: string; }

function getDateMatch(line: string): DateMatch | null {
  // String-month format first (more specific — avoids mis-parsing DD-MM-YYYY as string)
  const sm = line.match(DATE_STR_RE);
  if (sm) {
    const day = parseInt(sm[1]);
    const month = MONTH_NUM[sm[2].toLowerCase().slice(0, 3)];
    const yr = sm[3].length === 2 ? "20" + sm[3] : sm[3];
    const y = parseInt(yr);
    if (day >= 1 && day <= 31 && month && y >= 2018 && y <= 2032)
      return { monthKey: `${yr}-${month}`, raw: sm[0] };
  }
  // Numeric format
  const nm = line.match(DATE_NUM_RE);
  if (nm) {
    const day = parseInt(nm[1]), mo = parseInt(nm[2]);
    const yr = nm[3].length === 2 ? "20" + nm[3] : nm[3];
    const y = parseInt(yr);
    if (day >= 1 && day <= 31 && mo >= 1 && mo <= 12 && y >= 2018 && y <= 2032)
      return { monthKey: `${yr}-${nm[2].padStart(2, "0")}`, raw: nm[0] };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Amount extraction
// ─────────────────────────────────────────────────────────────────────────────

function extractAmounts(str: string): number[] {
  // Strip 10+ digit strings (bank reference/cheque numbers like 0000193219109797)
  // before amount extraction so they don't get partially matched.
  const noRef = str.replace(/\b\d{10,}\b/g, " ");
  // Pattern 1: Indian comma format with ≥1 comma  (e.g. 1,50,000.00 / 50,000 / 1,979.77)
  // Pattern 2: plain 4-9 digit integer or decimal  (e.g. 50000, 15000.00)
  // Pattern 3: any digits + mandatory 2 decimal places (e.g. 327.81, 5.00, 590.00)
  return (noRef.match(/\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\b\d{4,9}(?:\.\d{1,2})?\b|\b\d+\.\d{2}\b/g) ?? [])
    .map((s) => parseFloat(s.replace(/,/g, "")))
    .filter((n) => !isNaN(n) && n >= 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata line detection — bank statement headers/footers that should never
// be parsed as transactions.  The HDFC header repeats on every page and
// contains dates (e.g. A/C Open Date 19/10/2022) plus numeric codes (MICR,
// Branch Code) that get mis-identified as transaction amounts.
// ─────────────────────────────────────────────────────────────────────────────

const METADATA_PATTERNS = [
  /a\/c open date/i,
  /statement of account/i,
  /account status/i,
  /account branch/i,
  /branch code/i,
  /\bmicr\b/i,
  /\bifsc\b/i,
  /od limit/i,
  /cust(?:omer)?\s*id/i,
  /account\s*no\s*:/i,
  /account type/i,
  /nomination\s*:/i,
  /opening balance/i,
  /closing balance/i,
  /rtgs\/neft ifsc/i,
  /page no\s*\./i,
  /^--\s*\d+\s*of\s*\d+\s*--$/,          // "-- 1 of 22 --"
  /^date\s+narration/i,                   // column header row
];

function isMetadataLine(line: string): boolean {
  return METADATA_PATTERNS.some((p) => p.test(line));
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-line merger — some banks put date on one line, amounts on the next
// ─────────────────────────────────────────────────────────────────────────────

function mergeTransactionLines(lines: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Never start a merge from a metadata/header line — it can only produce
    // fake transactions when the engine absorbs subsequent number-bearing lines.
    if (isMetadataLine(line)) { out.push(line); i++; continue; }
    const dm = getDateMatch(line);
    if (dm) {
      const hasAmounts = extractAmounts(line.replace(dm.raw, " ")).length >= 2;
      if (!hasAmounts) {
        // Try merging with next 1-3 lines to get a parseable combined line
        let merged = line;
        let consumed = 0;
        for (let j = 1; j <= 3 && i + j < lines.length; j++) {
          merged += " " + lines[i + j];
          if (extractAmounts(merged.replace(dm.raw, " ")).length >= 2) {
            consumed = j;
            break;
          }
        }
        out.push(merged);
        i += consumed + 1;
        continue;
      }
    }
    out.push(line);
    i++;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction line parser
// ─────────────────────────────────────────────────────────────────────────────

function parseTx(line: string): ParsedTx | null {
  if (isMetadataLine(line)) return null;
  const dm = getDateMatch(line);
  if (!dm) return null;

  // Strip ALL date occurrences (transaction date + value date that HDFC places on same line)
  const noDate = line
    .replace(new RegExp(DATE_STR_RE.source, "gi"), " ")
    .replace(new RegExp(DATE_NUM_RE.source, "g"), " ");
  const amounts = extractAmounts(noDate);
  if (amounts.length < 2) return null;

  const lower = line.toLowerCase();
  const balance = amounts[amounts.length - 1];
  const txAmount = amounts[amounts.length - 2];
  if (txAmount === 0 || balance === 0) return null;

  // Determine debit vs credit
  let debit = 0, credit = 0;
  const isCredit = /\bcr\b/.test(lower) || lower.includes(" cr ") || lower.includes("credit") || lower.includes("deposit");
  const isDebit  = /\bdr\b/.test(lower) || lower.includes(" dr ") || lower.includes("debit")  || lower.includes("withdrawal");

  if (isCredit && !isDebit) {
    credit = txAmount;
  } else if (isDebit && !isCredit) {
    debit = txAmount;
  } else if (amounts.length >= 3) {
    // Typical 4-col: [narration_amounts…, debit_or_credit, balance]
    const a = amounts[amounts.length - 3];
    const b = amounts[amounts.length - 2];
    if (b === 0 || b === balance) {
      debit = a;
    } else if (a === 0) {
      credit = b;
    } else {
      debit = a;
      credit = 0;
    }
  } else {
    // Only 2 amounts — treat as debit (conservative)
    debit = txAmount;
  }

  // Narration = date-stripped line minus ref numbers and numeric tokens
  const narration = noDate
    .replace(/\b\d{10,}\b/g, "")
    .replace(/\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\b\d{4,9}(?:\.\d{1,2})?\b|\b\d+\.\d{2}\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const cat = categorise(line);
  const isBounce = cat === "BOUNCE";

  return {
    date: dm.raw,
    monthKey: dm.monthKey,
    narration: narration || line.slice(0, 60),
    debit,
    credit,
    balance,
    category: cat,
    isBounce,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fraud detection
// ─────────────────────────────────────────────────────────────────────────────

function detectFraud(txs: ParsedTx[], monthSummaries: MonthSummary[]): FraudSignal[] {
  const signals: FraudSignal[] = [];

  // 1. Loan app usage
  const loanAppTxs = txs.filter((t) => t.category === "LOAN_APP");
  if (loanAppTxs.length > 0) {
    signals.push({ type: "LOAN_APP_USAGE", severity: "medium", detail: `${loanAppTxs.length} transactions linked to loan apps (KreditBee, Navi, CASHe etc.)` });
  }

  // 2. Gambling
  const gamblingTxs = txs.filter((t) => t.category === "GAMBLING");
  if (gamblingTxs.length > 0) {
    const totalGamble = gamblingTxs.reduce((s, t) => s + t.debit, 0);
    signals.push({ type: "GAMBLING_DETECTED", severity: "high", detail: `${gamblingTxs.length} gambling transactions totalling ₹${totalGamble.toLocaleString("en-IN")}` });
  }

  // 3. Bounce cluster (3+ bounces in a single month)
  for (const ms of monthSummaries) {
    if (ms.bounceCount >= 3) {
      signals.push({ type: "BOUNCE_CLUSTER", severity: "high", detail: `${ms.bounceCount} bounces detected in ${ms.label}` });
    }
  }

  // 4. Fake salary — salary credit with no recurrence (only 1 instance over 6 months)
  const salaryTxs = txs.filter((t) => t.category === "SALARY" && t.credit > 5000);
  const salaryMonths = new Set(salaryTxs.map((t) => t.monthKey)).size;
  if (salaryTxs.length > 0 && salaryMonths === 1 && monthSummaries.length >= 3) {
    signals.push({ type: "FAKE_SALARY", severity: "high", detail: "Salary credit found in only 1 of 3+ months — may not be genuine recurring salary" });
  }

  // 5. Immediate reversal — credit followed by similar debit within same month
  const largeTxsByMonth: Record<string, { credits: number[]; debits: number[] }> = {};
  for (const tx of txs) {
    if (!largeTxsByMonth[tx.monthKey]) largeTxsByMonth[tx.monthKey] = { credits: [], debits: [] };
    if (tx.credit > 10000) largeTxsByMonth[tx.monthKey].credits.push(tx.credit);
    if (tx.debit  > 10000) largeTxsByMonth[tx.monthKey].debits.push(tx.debit);
  }
  for (const [, { credits, debits }] of Object.entries(largeTxsByMonth)) {
    for (const c of credits) {
      const match = debits.find((d) => Math.abs(d - c) / c < 0.03);
      if (match) {
        signals.push({ type: "IMMEDIATE_REVERSAL", severity: "medium", detail: `Credit of ₹${c.toLocaleString("en-IN")} immediately reversed in same month` });
        break;
      }
    }
  }

  // 6. Balance parking — single massive inflow (>5x avg) near end of statement period
  if (monthSummaries.length >= 2) {
    const lastMonth = monthSummaries[monthSummaries.length - 1];
    const avgCredits = monthSummaries.slice(0, -1).reduce((s, m) => s + m.totalCredits, 0) / (monthSummaries.length - 1);
    if (avgCredits > 0 && lastMonth.totalCredits > avgCredits * 5) {
      signals.push({ type: "BALANCE_PARKING", severity: "medium", detail: `Unusual large inflow of ₹${lastMonth.totalCredits.toLocaleString("en-IN")} in last month vs avg ₹${Math.round(avgCredits).toLocaleString("en-IN")}` });
    }
  }

  // 7. Income spike — sudden salary jump >80% vs previous months
  const salaryByMonth = monthSummaries.map((m) => m.salaryAmount).filter((v) => v > 0);
  if (salaryByMonth.length >= 3) {
    const prevAvg = salaryByMonth.slice(0, -1).reduce((a, b) => a + b, 0) / (salaryByMonth.length - 1);
    const lastSal = salaryByMonth[salaryByMonth.length - 1];
    if (lastSal > prevAvg * 1.8 && prevAvg > 0) {
      signals.push({ type: "INCOME_SPIKE", severity: "low", detail: `Last month salary ₹${lastSal.toLocaleString("en-IN")} is ${Math.round(lastSal / prevAvg * 100)}% of previous average — verify with HR letter` });
    }
  }

  return signals;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score calculation
// ─────────────────────────────────────────────────────────────────────────────

function calcScore(
  salaryMonths: number,
  totalMonths: number,
  bounces: number,
  avgMinBal: number,
  foir: number,
  fraudSignals: FraudSignal[],
  hasInvestments: boolean,
  gamblingDetected: boolean,
  loanAppUsage: boolean,
): ScoreBreakdown {

  // 1. Income stability (0–25)
  const salaryRatio = totalMonths > 0 ? salaryMonths / totalMonths : 0;
  const incomeStability = Math.round(salaryRatio * 25);

  // 2. Bounce history (0–25)
  let bounceHistory = 25;
  if (bounces >= 6) bounceHistory = 0;
  else if (bounces >= 4) bounceHistory = 5;
  else if (bounces >= 2) bounceHistory = 12;
  else if (bounces === 1) bounceHistory = 18;

  // 3. Balance quality (0–20)
  let balanceQuality = 0;
  if (avgMinBal >= 100000)     balanceQuality = 20;
  else if (avgMinBal >= 50000) balanceQuality = 16;
  else if (avgMinBal >= 25000) balanceQuality = 12;
  else if (avgMinBal >= 10000) balanceQuality = 8;
  else if (avgMinBal >= 5000)  balanceQuality = 4;

  // 4. FOIR score (0–15)
  let foirScore = 0;
  if (foir <= 0.30)      foirScore = 15;
  else if (foir <= 0.40) foirScore = 12;
  else if (foir <= 0.50) foirScore = 8;
  else if (foir <= 0.60) foirScore = 4;

  // 5. Spending pattern (0–15)
  let spendingPattern = 10; // base
  if (hasInvestments) spendingPattern += 3;
  if (gamblingDetected) spendingPattern -= 5;
  if (loanAppUsage) spendingPattern -= 3;
  const highRiskFraud = fraudSignals.filter((f) => f.severity === "high").length;
  if (highRiskFraud >= 2) spendingPattern -= 4;
  spendingPattern = Math.max(0, Math.min(15, spendingPattern));

  const total = incomeStability + bounceHistory + balanceQuality + foirScore + spendingPattern;
  return { incomeStability, bounceHistory, balanceQuality, foirScore, spendingPattern, total };
}

function scoreToLendingScore(pct: number): number {
  // Map 0–100 to 300–900
  return Math.round(300 + pct * 6);
}

function scoreToDecision(score: number): LendingDecision {
  if (score >= 800) return "STRONG_APPROVE";
  if (score >= 700) return "APPROVE";
  if (score >= 580) return "MANUAL_REVIEW";
  return "REJECT";
}

// ─────────────────────────────────────────────────────────────────────────────
// Month summary builder
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function buildMonthlySummaries(txs: ParsedTx[]): MonthSummary[] {
  const byMonth: Record<string, ParsedTx[]> = {};
  for (const tx of txs) {
    if (!byMonth[tx.monthKey]) byMonth[tx.monthKey] = [];
    byMonth[tx.monthKey].push(tx);
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mk, mTxs]) => {
      const [yr, mo] = mk.split("-");
      const balances = mTxs.map((t) => t.balance).filter((b) => b > 0);
      return {
        monthKey: mk,
        label: `${MONTH_LABELS[mo] ?? mo} ${yr}`,
        totalCredits:      mTxs.reduce((s, t) => s + t.credit, 0),
        totalDebits:       mTxs.reduce((s, t) => s + t.debit, 0),
        avgBalance:        balances.length ? Math.round(balances.reduce((a, b) => a + b, 0) / balances.length) : 0,
        minBalance:        balances.length ? Math.min(...balances) : 0,
        maxBalance:        balances.length ? Math.max(...balances) : 0,
        bounceCount:       mTxs.filter((t) => t.isBounce).length,
        emiTotal:          mTxs.filter((t) => t.category === "EMI" || t.category === "NACH_ECS").reduce((s, t) => s + t.debit, 0),
        salaryAmount:      mTxs.filter((t) => t.category === "SALARY").reduce((s, t) => s + t.credit, 0),
        cashWithdrawn:     mTxs.filter((t) => t.category === "ATM_CASH").reduce((s, t) => s + t.debit, 0),
        investmentAmount:  mTxs.filter((t) => t.category === "INVESTMENT").reduce((s, t) => s + t.debit, 0),
        creditCardPaid:    mTxs.filter((t) => t.category === "CREDIT_CARD").reduce((s, t) => s + t.debit, 0),
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

export function analyseStatement(text: string, declaredIncome = 0): StatementIntelligence {
  const rawLines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const lines = mergeTransactionLines(rawLines);
  const detectedBank = detectBank(text);

  // Parse all transactions
  const allParsed: ParsedTx[] = [];
  for (const line of lines) {
    const tx = parseTx(line);
    if (tx) allParsed.push(tx);
  }

  // ── Balance-range sanity filter ───────────────────────────────────────────
  // Removes transactions whose debit/credit is far larger than the highest
  // balance ever seen.  This catches cases where a bank-header number (e.g.
  // MICR code 110240433) slips through and gets mis-identified as an amount.
  // We use maxBalance * 3 as the ceiling; a single tx can legitimately exceed
  // max balance (e.g. a large inflow) but not by orders of magnitude.
  const maxObservedBalance = allParsed.reduce((m, t) => Math.max(m, t.balance), 0);
  const amountCap = Math.max(maxObservedBalance * 3, 2_000_000); // floor of ₹20L
  const rawTxs = allParsed.filter(
    (t) => t.debit <= amountCap && t.credit <= amountCap && t.balance <= amountCap * 10,
  );

  // ── Balance-comparison correction ────────────────────────────────────────
  // Many banks (HDFC, SBI etc.) don't always include CR/DR markers in narrations.
  // Compare consecutive balances to correct debit/credit direction.
  const txs: ParsedTx[] = rawTxs.map((tx, i) => {
    if (i === 0) return tx;
    const prevBalance = rawTxs[i - 1].balance;
    const diff = tx.balance - prevBalance;
    // If both debit and credit are 0 (shouldn't happen) or if the direction contradicts the balance:
    if (tx.credit === 0 && tx.debit === 0) return tx;
    const isBalanceUp = diff > 0;
    const isBalanceDown = diff < 0;
    const txAmt = tx.credit > 0 ? tx.credit : tx.debit;
    // Only correct when one direction is already assigned and balance contradicts it
    if (tx.debit > 0 && isBalanceUp && Math.abs(diff - tx.debit) < tx.debit * 0.05) {
      // Balance went up but we assigned debit — flip to credit
      return { ...tx, debit: 0, credit: tx.debit };
    }
    if (tx.credit > 0 && isBalanceDown && Math.abs(Math.abs(diff) - tx.credit) < tx.credit * 0.05) {
      // Balance went down but we assigned credit — flip to debit
      return { ...tx, credit: 0, debit: tx.credit };
    }
    // For ambiguous txs where both were 0: use balance direction
    if (tx.credit === 0 && tx.debit === 0 && txAmt > 0) {
      return isBalanceUp ? { ...tx, credit: txAmt, debit: 0 } : { ...tx, debit: txAmt, credit: 0 };
    }
    return tx;
  });

  const monthlyBreakdown = buildMonthlySummaries(txs);
  const totalMonths = monthlyBreakdown.length || 1;

  // ── Income ────────────────────────────────────────────────────────────────
  const salaryTxs = txs.filter((t) => t.category === "SALARY");
  const salaryMonths = new Set(salaryTxs.map((t) => t.monthKey)).size;
  const salaryAmounts = monthlyBreakdown.map((m) => m.salaryAmount).filter((v) => v > 0);
  const avgSalaryAmount = salaryAmounts.length ? Math.round(salaryAmounts.reduce((a, b) => a + b, 0) / salaryAmounts.length) : 0;

  // Business inflow: explicit BUSINESS_INFLOW + large NEFT_RTGS/IMPS credits (≥5000)
  // Many small-business owners receive payments via RTGS/IMPS without "business" keywords
  const businessTxs = txs.filter((t) =>
    t.category === "BUSINESS_INFLOW" ||
    ((t.category === "NEFT_RTGS" || t.category === "UPI_TRANSFER") && t.credit >= 5000)
  );
  const businessByMonth: Record<string, number> = {};
  for (const tx of businessTxs) businessByMonth[tx.monthKey] = (businessByMonth[tx.monthKey] ?? 0) + tx.credit;
  const businessInflow = Object.keys(businessByMonth).length
    ? Math.round(Object.values(businessByMonth).reduce((a, b) => a + b, 0) / Object.keys(businessByMonth).length)
    : 0;

  // Use total credits per month as income proxy
  const monthlyCredits = monthlyBreakdown.map((m) => m.totalCredits).filter((v) => v > 0);
  const avgMonthlyIncome = monthlyCredits.length
    ? Math.round(monthlyCredits.reduce((a, b) => a + b, 0) / monthlyCredits.length)
    : declaredIncome;

  const primaryIncomeSource =
    avgSalaryAmount > 0 && businessInflow > 0 ? "MIXED" :
    avgSalaryAmount > 0 ? "SALARY" :
    businessInflow > 0 ? "BUSINESS" : "UNKNOWN";

  const incomeStabilityScore = salaryMonths >= totalMonths * 0.8 ? 90 :
    salaryMonths >= totalMonths * 0.5 ? 65 : salaryMonths > 0 ? 40 : 20;

  // ── Balance ───────────────────────────────────────────────────────────────
  const allBalances = txs.map((t) => t.balance).filter((b) => b > 0);
  const avgMonthlyBalance = allBalances.length
    ? Math.round(allBalances.reduce((a, b) => a + b, 0) / allBalances.length)
    : 0;
  const minMonthlyBalance = allBalances.length ? Math.min(...allBalances) : 0;
  const avgMinMonthlyBalance = monthlyBreakdown.length
    ? Math.round(monthlyBreakdown.map((m) => m.minBalance).filter(Boolean).reduce((a, b) => a + b, 0) / monthlyBreakdown.length)
    : 0;

  // ── Obligations ───────────────────────────────────────────────────────────
  const emiAmounts = monthlyBreakdown.map((m) => m.emiTotal).filter((v) => v > 0);
  const existingEMIs = emiAmounts.length
    ? Math.round(emiAmounts.reduce((a, b) => a + b, 0) / emiAmounts.length)
    : 0;

  const ccAmounts = monthlyBreakdown.map((m) => m.creditCardPaid).filter((v) => v > 0);
  const creditCardDues = ccAmounts.length ? Math.round(ccAmounts.reduce((a, b) => a + b, 0) / ccAmounts.length) : 0;

  const totalObligations = existingEMIs + creditCardDues;
  const effectiveIncome = avgMonthlyIncome || declaredIncome || 1;
  const foir = Math.min((totalObligations || declaredIncome * 0.2) / effectiveIncome, 0.95);

  const bnplTxs = txs.filter((t) => t.category === "BNPL");
  const bnplAmount = bnplTxs.reduce((s, t) => s + t.debit, 0) / (totalMonths || 1);

  // ── Spending ──────────────────────────────────────────────────────────────
  const totalDebits = txs.reduce((s, t) => s + t.debit, 0);
  const cashDebits = txs.filter((t) => t.category === "ATM_CASH").reduce((s, t) => s + t.debit, 0);
  const cashWithdrawalRatio = totalDebits > 0 ? cashDebits / totalDebits : 0;

  // Category spend (avg monthly)
  const categoryTotals: Partial<Record<TxCategory, number>> = {};
  for (const tx of txs) {
    if (tx.debit > 0) categoryTotals[tx.category] = (categoryTotals[tx.category] ?? 0) + tx.debit;
  }
  const categorySpend: Partial<Record<TxCategory, number>> = {};
  for (const [cat, total] of Object.entries(categoryTotals)) {
    categorySpend[cat as TxCategory] = Math.round(total / totalMonths);
  }

  const investAmounts = monthlyBreakdown.map((m) => m.investmentAmount).filter((v) => v > 0);
  const investmentAmount = investAmounts.length ? Math.round(investAmounts.reduce((a, b) => a + b, 0) / investAmounts.length) : 0;
  const hasInvestments = investmentAmount > 0;
  const hasInsurance = txs.some((t) => t.category === "INSURANCE");
  const loanAppUsage = txs.some((t) => t.category === "LOAN_APP");
  const gamblingDetected = txs.some((t) => t.category === "GAMBLING");

  // ── Fraud ─────────────────────────────────────────────────────────────────
  const fraudSignals = detectFraud(txs, monthlyBreakdown);
  const highCount = fraudSignals.filter((f) => f.severity === "high").length;
  const fraudRisk: "low" | "medium" | "high" =
    highCount >= 2 ? "high" : highCount >= 1 || fraudSignals.length >= 2 ? "medium" : "low";

  // ── Score ─────────────────────────────────────────────────────────────────
  const bounceCount = txs.filter((t) => t.isBounce).length;
  const scoreBreakdown = calcScore(
    salaryMonths, totalMonths, bounceCount,
    avgMinMonthlyBalance, foir, fraudSignals,
    hasInvestments, gamblingDetected, loanAppUsage,
  );
  const lendingScore = scoreToLendingScore(scoreBreakdown.total);
  const lendingDecision = scoreToDecision(lendingScore);

  // ── Parse quality ─────────────────────────────────────────────────────────
  const parseQuality = txs.length >= 50 ? "high" : txs.length >= 20 ? "medium" : "low";

  return {
    // Base fields
    avgMonthlyIncome: Math.round(effectiveIncome),
    avgMonthlyBalance,
    totalObligations: Math.round(totalObligations),
    foir: Math.round(foir * 100) / 100,
    bounceCount,
    salaryCredits: salaryMonths,
    transactionCount: txs.length,

    // Income
    incomeStabilityScore,
    primaryIncomeSource,
    salaryMonths,
    avgSalaryAmount,
    businessInflow,

    // Balance
    minMonthlyBalance,
    avgMinMonthlyBalance,

    // Obligations
    existingEMIs,
    creditCardDues,
    bnplUsage: bnplTxs.length > 0,
    bnplAmount: Math.round(bnplAmount),

    // Spending
    cashWithdrawalRatio: Math.round(cashWithdrawalRatio * 100) / 100,
    categorySpend,
    hasInvestments,
    investmentAmount,
    hasInsurance,

    // Risk
    fraudSignals,
    fraudRisk,
    loanAppUsage,
    gamblingDetected,

    // Score
    lendingScore,
    lendingDecision,
    scoreBreakdown,

    // Monthly
    monthlyBreakdown,
    statementMonths: totalMonths,

    // Meta
    detectedBank,
    parseQuality,
    rawLineCount: rawLines.length,
  };
}
