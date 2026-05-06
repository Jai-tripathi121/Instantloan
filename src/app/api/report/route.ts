export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportInput {
  user: { name: string; mobile: string; pan: string; employmentType: string; dob: string };
  loan: { loanType: string; amount: number; tenure: number };
  statement: {
    avgMonthlyIncome: number;
    avgMonthlyBalance: number;
    totalObligations: number;
    foir: number;
    bounceCount: number;
    salaryCredits: number;
    transactionCount: number;
  };
  offers: Array<{ bankName: string; approvedAmount: number; interestRate: number; emi: number; tenure: number; approvalProbability?: number }>;
  audit: {
    riskGrade: string;
    rejectedBanks: Array<{ bankName: string; reason: string }>;
    eligibleCount: number;
    inputSnapshot: { cibilScore?: number; income: number; foir: number };
  } | null;
}

// ── Rejection reason → human readable ────────────────────────────────────────

const REJECTION_LABELS: Record<string, string> = {
  income_below_min: "Income below bank minimum",
  foir_exceeded: "Debt-to-income ratio too high",
  cibil_below_min: "CIBIL score below bank minimum",
  bounces_exceeded_global: "Too many cheque bounces",
  bounces_exceeded_strict: "Bounce history fails strict policy",
  salary_credits_insufficient: "Insufficient salary credits",
  age_out_of_range: "Age outside eligible range",
  employment_type_not_allowed: "Employment type not accepted",
  loan_type_not_offered: "Loan type not offered by bank",
  amount_below_min: "Requested amount below minimum",
  inactive: "Account inactive",
};

// ── Improvement tips based on reasons ────────────────────────────────────────

function getTips(audit: ReportInput["audit"], foir: number, bounceCount: number): string[] {
  const tips: string[] = [];
  if (!audit) return [];

  const reasons = audit.rejectedBanks.map((r) => r.reason);
  const unique = [...new Set(reasons)];

  if (unique.includes("foir_exceeded") || foir > 0.5) {
    tips.push("Pay off existing EMIs to reduce your FOIR below 40% — this unlocks the most banks.");
  }
  if (unique.includes("cibil_below_min") || (audit.inputSnapshot.cibilScore && audit.inputSnapshot.cibilScore < 700)) {
    tips.push("Improve your CIBIL score: pay all EMIs on time, reduce credit card usage below 30% of limit, and avoid multiple loan applications.");
  }
  if (unique.includes("income_below_min")) {
    tips.push("A co-applicant with higher income can help you qualify for banks with ₹30,000+ minimum income requirements.");
  }
  if (bounceCount > 2 || unique.includes("bounces_exceeded_global") || unique.includes("bounces_exceeded_strict")) {
    tips.push("Maintain a minimum balance of ₹5,000 in your account to prevent cheque bounces — banks penalise this heavily.");
  }
  if (unique.includes("salary_credits_insufficient")) {
    tips.push("Make sure your salary is credited directly to your bank account (not cash) for at least 6 consecutive months.");
  }
  if (tips.length === 0) {
    tips.push("You already qualify for multiple banks. Apply now to lock in your rate before it changes.");
  }
  tips.push("Check your free CIBIL report at mycibil.com — errors on credit reports affect eligibility and can be disputed.");
  tips.push("Avoid applying at multiple banks simultaneously — each hard enquiry drops your CIBIL score by 5–10 points.");
  return tips;
}

// ── PDF drawing helpers ───────────────────────────────────────────────────────

const BRAND  = rgb(0.04, 0.24, 0.18);   // #0a3d2e
const ACCENT = rgb(0.83, 0.63, 0.29);   // #d4a14a
const INK    = rgb(0.06, 0.12, 0.09);   // #0f1f17
const MUTED  = rgb(0.48, 0.52, 0.49);   // #7a857d
const GREEN  = rgb(0.12, 0.48, 0.31);   // #1e7a4f
const RED    = rgb(0.66, 0.23, 0.15);   // #a83a26
const AMBER  = rgb(0.78, 0.56, 0.16);   // #c8902a
const WHITE  = rgb(1, 1, 1);
const LIGHT  = rgb(0.96, 0.95, 0.91);   // #f5f1e8
const LINEC  = rgb(0.86, 0.83, 0.75);   // #dcd4bf

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>, radius = 0) {
  if (radius > 0) {
    // rounded rect via clipping: approximate with inset
    page.drawRectangle({ x: x + radius, y, width: w - radius * 2, height: h, color });
    page.drawRectangle({ x, y: y + radius, width: w, height: h - radius * 2, color });
    page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
    page.drawCircle({ x: x + w - radius, y: y + radius, size: radius, color });
    page.drawCircle({ x: x + radius, y: y + h - radius, size: radius, color });
    page.drawCircle({ x: x + w - radius, y: y + h - radius, size: radius, color });
  } else {
    page.drawRectangle({ x, y, width: w, height: h, color });
  }
}

function drawText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) {
  page.drawText(text, { x, y, font, size, color });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function gradeColor(grade: string) {
  if (grade === "A") return GREEN;
  if (grade === "B") return BRAND;
  if (grade === "C") return AMBER;
  return RED;
}

// ── Main PDF builder ──────────────────────────────────────────────────────────

async function buildPDF(data: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const W = 595, H = 842; // A4

  // ── PAGE 1: Cover + Summary ─────────────────────────────────────────────────
  const p1 = doc.addPage([W, H]);

  // Header bar
  drawRect(p1, 0, H - 80, W, 80, BRAND);
  drawText(p1, "postmoney", 36, H - 42, bold, 22, WHITE);
  drawText(p1, "AI Eligibility Report", 36, H - 62, normal, 11, rgb(1,1,1));
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const dateW = bold.widthOfTextAtSize(date, 10);
  drawText(p1, date, W - 36 - dateW, H - 50, normal, 10, rgb(1,1,1));

  // User info
  let cy = H - 110;
  drawText(p1, data.user.name || "Applicant", 36, cy, bold, 18, INK); cy -= 20;
  drawText(p1, `+91 ${data.user.mobile}  ·  PAN: ${data.user.pan || "N/A"}  ·  ${data.user.employmentType}`, 36, cy, normal, 10, MUTED); cy -= 8;
  drawRect(p1, 36, cy, W - 72, 1, LINEC);  cy -= 20;

  // Risk grade pill
  const grade = data.audit?.riskGrade ?? "B";
  const gColor = gradeColor(grade);
  drawRect(p1, 36, cy - 36, 110, 44, LIGHT, 8);
  drawText(p1, "Risk Grade", 44, cy - 16, normal, 8, MUTED);
  drawText(p1, `Grade ${grade}`, 44, cy - 36, bold, 22, gColor);

  // Key metrics row
  const metrics = [
    { label: "Monthly Income", value: `₹${(data.statement.avgMonthlyIncome / 1000).toFixed(0)}K` },
    { label: "Avg Balance", value: `₹${(data.statement.avgMonthlyBalance / 1000).toFixed(0)}K` },
    { label: "FOIR", value: `${Math.round(data.statement.foir * 100)}%` },
    { label: "Bounce Count", value: String(data.statement.bounceCount) },
    { label: "Banks Eligible", value: String(data.audit?.eligibleCount ?? data.offers.length) },
  ];
  const mBox = 80, mGap = 8, mStart = 160;
  metrics.forEach((m, i) => {
    const mx = mStart + i * (mBox + mGap);
    drawRect(p1, mx, cy - 36, mBox, 44, LIGHT, 8);
    const lw = normal.widthOfTextAtSize(m.label, 7);
    const vw = bold.widthOfTextAtSize(m.value, 13);
    drawText(p1, m.label, mx + (mBox - lw) / 2, cy - 16, normal, 7, MUTED);
    drawText(p1, m.value, mx + (mBox - vw) / 2, cy - 34, bold, 13, INK);
  });
  cy -= 58;

  // Loan request
  drawRect(p1, 36, cy - 50, W - 72, 54, BRAND, 10);
  drawText(p1, "Loan Request", 52, cy - 18, normal, 9, rgb(1,1,1));
  drawText(p1, `${data.loan.loanType.toUpperCase()} LOAN`, 52, cy - 34, bold, 14, WHITE);
  const amtStr = `₹${data.loan.amount.toLocaleString("en-IN")}`;
  drawText(p1, amtStr, 52, cy - 50, bold, 22, ACCENT);
  const tenStr = `${data.loan.tenure} months`;
  const tenW = normal.widthOfTextAtSize(tenStr, 10);
  drawText(p1, tenStr, W - 72 - tenW, cy - 36, normal, 10, rgb(1,1,1));
  cy -= 70;

  // ── Eligible Banks ──────────────────────────────────────────────────────────
  drawText(p1, "ELIGIBLE BANK OFFERS", 36, cy, bold, 10, BRAND); cy -= 6;
  drawRect(p1, 36, cy, W - 72, 1, ACCENT); cy -= 14;

  const cols = ["Bank", "Amount", "Rate", "EMI/mo", "Probability"];
  const colX = [36, 200, 310, 390, 465];
  cols.forEach((c, i) => drawText(p1, c, colX[i], cy, bold, 9, MUTED));
  cy -= 14;

  data.offers.slice(0, 8).forEach((o, idx) => {
    const rowBg = idx % 2 === 0 ? LIGHT : WHITE;
    drawRect(p1, 36, cy - 2, W - 72, 18, rowBg);
    drawText(p1, o.bankName, colX[0] + 4, cy + 4, normal, 9, INK);
    drawText(p1, `₹${(o.approvedAmount / 1000).toFixed(0)}K`, colX[1], cy + 4, bold, 9, GREEN);
    drawText(p1, `${o.interestRate}%`, colX[2], cy + 4, normal, 9, INK);
    drawText(p1, `₹${o.emi.toLocaleString("en-IN")}`, colX[3], cy + 4, normal, 9, INK);
    const prob = o.approvalProbability;
    const probStr = prob !== undefined ? `${prob}%` : "—";
    const probColor = prob !== undefined ? (prob >= 70 ? GREEN : prob >= 40 ? AMBER : RED) : MUTED;
    drawText(p1, probStr, colX[4], cy + 4, bold, 9, probColor);
    cy -= 18;
  });
  cy -= 10;

  // ── Why Banks Rejected ──────────────────────────────────────────────────────
  if (data.audit && data.audit.rejectedBanks.length > 0) {
    if (cy < 200) {
      // Not enough space, skip to page 2
    } else {
      drawText(p1, "WHY SOME BANKS DECLINED", 36, cy, bold, 10, RED); cy -= 6;
      drawRect(p1, 36, cy, W - 72, 1, RED); cy -= 14;

      // Group by reason
      const byReason: Record<string, string[]> = {};
      for (const rb of data.audit.rejectedBanks) {
        if (!byReason[rb.reason]) byReason[rb.reason] = [];
        byReason[rb.reason].push(rb.bankName);
      }
      for (const [reason, banks] of Object.entries(byReason)) {
        if (cy < 80) break;
        const label = REJECTION_LABELS[reason] ?? reason;
        const bankStr = banks.slice(0, 4).join(", ") + (banks.length > 4 ? ` +${banks.length - 4}` : "");
        drawText(p1, `• ${label}`, 44, cy, bold, 9, INK); cy -= 13;
        drawText(p1, `  Affects: ${bankStr}`, 44, cy, normal, 8, MUTED); cy -= 16;
      }
    }
  }

  // Footer p1
  drawRect(p1, 0, 0, W, 36, LIGHT);
  drawText(p1, "postmoney AI Report — Confidential · Not for circulation", 36, 13, normal, 8, MUTED);
  const p1Pg = normal.widthOfTextAtSize("Page 1 of 2", 8);
  drawText(p1, "Page 1 of 2", W - 36 - p1Pg, 13, normal, 8, MUTED);

  // ── PAGE 2: Analysis + Improvement Plan ─────────────────────────────────────
  const p2 = doc.addPage([W, H]);

  // Header
  drawRect(p2, 0, H - 50, W, 50, BRAND);
  drawText(p2, "postmoney", 36, H - 24, bold, 14, WHITE);
  drawText(p2, "AI Eligibility Report — Detailed Analysis & Improvement Plan", 120, H - 24, normal, 10, rgb(1,1,1));

  cy = H - 75;

  // ── Financial Health Scorecard ───────────────────────────────────────────────
  drawText(p2, "FINANCIAL HEALTH SCORECARD", 36, cy, bold, 11, BRAND); cy -= 6;
  drawRect(p2, 36, cy, W - 72, 1, ACCENT); cy -= 20;

  const health = [
    {
      label: "Income",
      value: `₹${data.statement.avgMonthlyIncome.toLocaleString("en-IN")}/mo`,
      status: data.statement.avgMonthlyIncome >= 30000 ? "✓ Good" : "⚠ Below ideal",
      ok: data.statement.avgMonthlyIncome >= 30000,
      detail: data.statement.avgMonthlyIncome >= 30000
        ? "Meets minimum income criteria for most banks"
        : "Below ₹30,000 threshold — fewer banks available",
    },
    {
      label: "FOIR (Debt Ratio)",
      value: `${Math.round(data.statement.foir * 100)}%`,
      status: data.statement.foir <= 0.45 ? "✓ Healthy" : data.statement.foir <= 0.6 ? "⚠ Moderate" : "✗ High",
      ok: data.statement.foir <= 0.45,
      detail: data.statement.foir <= 0.45
        ? "Excellent — less than 45% of income goes to EMIs"
        : data.statement.foir <= 0.6
        ? "Moderate — reduce existing EMIs for better rates"
        : "High — most banks will decline. Pay off existing loans first.",
    },
    {
      label: "Account Balance",
      value: `₹${data.statement.avgMonthlyBalance.toLocaleString("en-IN")} avg`,
      status: data.statement.avgMonthlyBalance >= 10000 ? "✓ Good" : "⚠ Low",
      ok: data.statement.avgMonthlyBalance >= 10000,
      detail: data.statement.avgMonthlyBalance >= 10000
        ? "Adequate balance history"
        : "Low average balance — maintain ₹10,000+ for better scoring",
    },
    {
      label: "Bounce Count",
      value: `${data.statement.bounceCount} bounces`,
      status: data.statement.bounceCount === 0 ? "✓ Clean" : data.statement.bounceCount <= 2 ? "⚠ Minor" : "✗ High",
      ok: data.statement.bounceCount <= 2,
      detail: data.statement.bounceCount === 0
        ? "No bounces — excellent banking behaviour"
        : data.statement.bounceCount <= 2
        ? "1–2 bounces is acceptable for most banks"
        : "3+ bounces causes automatic rejection at strict banks",
    },
    {
      label: "CIBIL Score",
      value: data.audit?.inputSnapshot.cibilScore ? String(data.audit.inputSnapshot.cibilScore) : "Not provided",
      status: !data.audit?.inputSnapshot.cibilScore ? "? Unknown" :
        data.audit.inputSnapshot.cibilScore >= 750 ? "✓ Excellent" :
        data.audit.inputSnapshot.cibilScore >= 700 ? "~ Good" : "✗ Below ideal",
      ok: (data.audit?.inputSnapshot.cibilScore ?? 0) >= 700,
      detail: !data.audit?.inputSnapshot.cibilScore
        ? "Provide your CIBIL score for more accurate bank matching"
        : data.audit.inputSnapshot.cibilScore >= 750
        ? "Score ≥750 qualifies for all major banks"
        : data.audit.inputSnapshot.cibilScore >= 700
        ? "Score 700–749 — most banks approve with slightly higher rates"
        : "Score <700 — limited to select NBFCs and small finance banks",
    },
  ];

  for (const row of health) {
    if (cy < 100) break;
    const rowH = 42;
    drawRect(p2, 36, cy - rowH, W - 72, rowH, row.ok ? rgb(0.9, 0.97, 0.93) : rgb(1, 0.97, 0.9), 6);
    drawText(p2, row.label, 48, cy - 12, bold, 10, INK);
    drawText(p2, row.value, 48, cy - 26, normal, 9, MUTED);
    const sw = bold.widthOfTextAtSize(row.status, 9);
    drawText(p2, row.status, W - 72 - sw, cy - 18, bold, 9, row.ok ? GREEN : AMBER);
    const detail = wrapText(row.detail, normal, 8, 340);
    detail.slice(0, 1).forEach((d) => drawText(p2, d, 48, cy - 38, normal, 8, MUTED));
    cy -= rowH + 6;
  }

  cy -= 10;

  // ── Improvement Plan ─────────────────────────────────────────────────────────
  drawText(p2, "YOUR PERSONALISED IMPROVEMENT PLAN", 36, cy, bold, 11, BRAND); cy -= 6;
  drawRect(p2, 36, cy, W - 72, 1, ACCENT); cy -= 16;

  const tips = getTips(data.audit, data.statement.foir, data.statement.bounceCount);
  tips.forEach((tip, i) => {
    if (cy < 80) return;
    // Tip box
    drawRect(p2, 36, cy - 34, W - 72, 38, LIGHT, 6);
    // Number badge
    drawRect(p2, 36, cy - 34, 28, 38, BRAND, 6);
    const nw = bold.widthOfTextAtSize(String(i + 1), 14);
    drawText(p2, String(i + 1), 36 + (28 - nw) / 2, cy - 22, bold, 14, WHITE);
    // Tip text
    const lines = wrapText(tip, normal, 9, W - 72 - 44);
    lines.slice(0, 2).forEach((l, li) => drawText(p2, l, 72, cy - 12 - li * 13, normal, 9, INK));
    cy -= 46;
  });

  // ── Disclaimer ───────────────────────────────────────────────────────────────
  if (cy > 80) {
    cy -= 10;
    drawRect(p2, 36, cy - 50, W - 72, 54, LIGHT, 8);
    drawText(p2, "Important Disclaimer", 48, cy - 14, bold, 9, MUTED);
    const disc = "This report is generated by an AI system and is for informational purposes only. Actual loan approval is subject to";
    const disc2 = "the bank's internal credit assessment. postmoney does not guarantee approval. All figures are estimates.";
    drawText(p2, disc, 48, cy - 28, normal, 8, MUTED);
    drawText(p2, disc2, 48, cy - 40, normal, 8, MUTED);
  }

  // Footer p2
  drawRect(p2, 0, 0, W, 36, LIGHT);
  drawText(p2, `Generated for ${data.user.name} · eligibility.postmoney.in`, 36, 13, normal, 8, MUTED);
  const p2Pg = normal.widthOfTextAtSize("Page 2 of 2", 8);
  drawText(p2, "Page 2 of 2", W - 36 - p2Pg, 13, normal, 8, MUTED);

  const bytes = await doc.save();
  return bytes;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const data: ReportInput = await req.json();
    const pdf = await buildPDF(data);

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="postmoney_Report_${data.user.name?.replace(/\s+/g, "_") || "Report"}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[report]", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
