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
  const name = (err instanceof Error ? (err as Error & { name: string }).name : "").toLowerCase();
  return (
    msg.includes("password") || msg.includes("encrypted") || msg.includes("encrypt") ||
    msg.includes("protected") || msg.includes("bad xref") || msg.includes("decod") ||
    msg.includes("need_password") || msg.includes("incorrect_password") ||
    name.includes("password")
  );
}

// pdf-parse v2.x: class-based API. getText() returns { text, total (page count), pages[] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFParseLib = { PDFParse: new (opts: Record<string, unknown>) => { getText(): Promise<{ text: string; total?: number }> }; PasswordException: new (...a: unknown[]) => Error };

async function parsePdf(buffer: Buffer, password?: string): Promise<{ text: string; numpages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lib = require("pdf-parse") as PDFParseLib;
  const parser = new lib.PDFParse({ data: new Uint8Array(buffer), ...(password ? { password } : {}) });
  const result = await parser.getText();
  return { text: result.text ?? "", numpages: result.total ?? 0 };
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

    let parsed: { text: string; numpages: number };
    try {
      parsed = await parsePdf(buffer, password);
    } catch (pdfErr) {
      if (isPasswordError(pdfErr)) {
        return NextResponse.json(
          { error: "PDF is password-protected. Enter the password (usually DOB like 01011990 or last 4 digits of mobile) and try again." },
          { status: 422 }
        );
      }
      throw pdfErr;
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
    // Final safety net — also check for password errors that slipped past inner catch
    if (isPasswordError(err)) {
      return NextResponse.json(
        { error: "PDF is password-protected. Enter the password (usually DOB like 01011990 or last 4 digits of mobile) and try again." },
        { status: 422 }
      );
    }
    return NextResponse.json({
      ...SAFE_FALLBACK,
      avgMonthlyIncome: declaredIncome,
      avgMonthlyBalance: Math.round(declaredIncome * 1.8),
      totalObligations: Math.round(declaredIncome * 0.2),
    });
  }
}
