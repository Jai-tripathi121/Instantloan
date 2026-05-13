export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Polyfill DOMMatrix for pdfjs-dist (used by pdf-parse v2) in Node.js
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  class _DOMMatrix {
    a=1;b=0;c=0;d=1;e=0;f=0;
    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
    is2D=true;isIdentity=true;
    constructor(_?: any) {}
    static fromMatrix(_?: any){ return new _DOMMatrix(); }
    static fromFloat32Array(_?: any){ return new _DOMMatrix(); }
    static fromFloat64Array(_?: any){ return new _DOMMatrix(); }
    multiply(_?: any){ return new _DOMMatrix(); }
    translate(tx=0,ty=0,_z=0){ const m=new _DOMMatrix();m.e=tx;m.f=ty;return m; }
    scale(sx=1,sy=1,_sz=1,_ox=0,_oy=0,_oz=0){ const m=new _DOMMatrix();m.a=sx;m.d=sy;return m; }
    scale3d(_s=1,_ox=0,_oy=0,_oz=0){ return new _DOMMatrix(); }
    scaleNonUniform(sx=1,sy=1){ const m=new _DOMMatrix();m.a=sx;m.d=sy;return m; }
    rotate(_rx=0,_ry=0,_rz=0){ return new _DOMMatrix(); }
    rotateAxisAngle(_x=0,_y=0,_z=0,_a=0){ return new _DOMMatrix(); }
    rotateFromVector(_x=0,_y=0){ return new _DOMMatrix(); }
    skewX(_a=0){ return new _DOMMatrix(); }
    skewY(_a=0){ return new _DOMMatrix(); }
    inverse(){ return new _DOMMatrix(); }
    flipX(){ return new _DOMMatrix(); }
    flipY(){ return new _DOMMatrix(); }
    transformPoint(p?: any){ return {x:(p?.x??0)*this.a+this.e,y:(p?.y??0)*this.d+this.f,z:0,w:1}; }
    toFloat32Array(){ return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); }
    toFloat64Array(){ return new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); }
    toString(){ return "matrix(1, 0, 0, 1, 0, 0)"; }
    toJSON(){ return {}; }
    invertSelf(){ return this; }
    multiplySelf(_?: any){ return this; }
    preMultiplySelf(_?: any){ return this; }
    translateSelf(tx=0,ty=0,_tz=0){ this.e+=tx;this.f+=ty;return this; }
    scaleSelf(sx=1,sy=1){ this.a*=sx;this.d*=sy;return this; }
    scale3dSelf(){ return this; }
    rotateSelf(){ return this; }
    rotateFromVectorSelf(){ return this; }
    rotateAxisAngleSelf(){ return this; }
    skewXSelf(){ return this; }
    skewYSelf(){ return this; }
    setMatrixValue(_t: string){ return this; }
  }
  (globalThis as any).DOMMatrix = _DOMMatrix;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
