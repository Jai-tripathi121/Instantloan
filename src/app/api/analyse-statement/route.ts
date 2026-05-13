export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { analyseStatement } from "@/lib/statement-engine";

const SAFE_FALLBACK = {
  avgMonthlyIncome: 0,
  avgMonthlyBalance: 0,
  totalObligations: 0,
  foir: 0.2,
  bounceCount: 0,
  salaryCredits: 0,
  transactionCount: 0,
  incomeStabilityScore: 0,
  primaryIncomeSource: "UNKNOWN",
  salaryMonths: 0,
  avgSalaryAmount: 0,
  businessInflow: 0,
  minMonthlyBalance: 0,
  avgMinMonthlyBalance: 0,
  existingEMIs: 0,
  creditCardDues: 0,
  bnplUsage: false,
  bnplAmount: 0,
  cashWithdrawalRatio: 0,
  categorySpend: {},
  hasInvestments: false,
  investmentAmount: 0,
  hasInsurance: false,
  fraudSignals: [],
  fraudRisk: "low",
  loanAppUsage: false,
  gamblingDetected: false,
  lendingScore: 600,
  lendingDecision: "MANUAL_REVIEW",
  scoreBreakdown: { incomeStability: 0, bounceHistory: 0, balanceQuality: 0, foirScore: 0, spendingPattern: 0, total: 0 },
  monthlyBreakdown: [],
  statementMonths: 0,
  detectedBank: "Unknown",
  parseQuality: "low",
  rawLineCount: 0,
};

function isPasswordError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("password") || msg.includes("encrypted") || msg.includes("encrypt")
    || msg.includes("protected") || msg.includes("bad xref") || msg.includes("decod");
}

export async function POST(req: NextRequest) {
  let declaredIncome = 0;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    declaredIncome = Number(form.get("declaredIncome") ?? 0);
    const password = (form.get("password") as string | null) || undefined;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Lazy-load to avoid DOMMatrix / pdfjs-dist build-time errors
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer, opts?: { password?: string }) => Promise<{ text: string; numpages: number }>;

    let parsed: { text: string; numpages: number };
    try {
      parsed = await pdfParse(buffer, password ? { password } : undefined);
    } catch (pdfErr) {
      if (isPasswordError(pdfErr)) {
        return NextResponse.json(
          { error: "PDF is password-protected. Enter the password (usually DOB like 01011990 or last 4 digits of mobile) and try again." },
          { status: 422 }
        );
      }
      throw pdfErr; // re-throw non-password errors
    }

    if (!parsed.text || parsed.text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. It may be a scanned image PDF. Please download a text-based statement from your bank's internet banking portal." },
        { status: 422 }
      );
    }

    const intelligence = analyseStatement(parsed.text, declaredIncome);
    return NextResponse.json(intelligence);

  } catch (err) {
    console.error("[analyse-statement]", err);
    return NextResponse.json({
      ...SAFE_FALLBACK,
      avgMonthlyIncome: declaredIncome,
      avgMonthlyBalance: Math.round(declaredIncome * 1.8),
      totalObligations: Math.round(declaredIncome * 0.2),
    });
  }
}
