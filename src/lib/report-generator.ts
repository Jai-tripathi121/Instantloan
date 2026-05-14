import type { StatementIntelligence } from "@/lib/statement-engine";

const SCORE_COLOR = (s: number) =>
  s >= 800 ? "#16a34a" : s >= 700 ? "#2563eb" : s >= 580 ? "#d97706" : "#dc2626";

const DECISION_BG: Record<string, string> = {
  STRONG_APPROVE: "#d1fae5", APPROVE: "#dbeafe",
  MANUAL_REVIEW: "#fef3c7", REJECT: "#fee2e2",
};
const DECISION_TEXT: Record<string, string> = {
  STRONG_APPROVE: "#065f46", APPROVE: "#1e40af",
  MANUAL_REVIEW: "#92400e", REJECT: "#991b1b",
};

function fmtN(n: number) {
  if (!n || isNaN(n)) return "₹0";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

type Lang = "en" | "hi";

const T = {
  en: {
    reportTitle: "Statement Intelligence Report",
    confidential: "Confidential · Internal Use Only",
    poweredBy: "Powered by Post AI",
    months: "months", transactions: "transactions",
    parseQuality: "Parse Quality", generated: "Generated",
    keyMetrics: "KEY METRICS", scoreBreakdown: "SCORE BREAKDOWN",
    avgIncome: "Avg Monthly Income", avgBalance: "Avg Balance",
    minBalance: "Min Balance", totalEMI: "Total EMI / mo",
    bounces: "Bounces", salaryMonths: "Salary Months",
    incomeSource: "Income Source", foir: "FOIR",
    incomeStability: "Income Stability", bounceHistory: "Bounce History",
    balanceQuality: "Balance Quality", spendingPattern: "Spending Pattern",
    total: "Total", monthlyBreakdown: "Monthly Breakdown",
    month: "Month", credits: "Credits", debits: "Debits",
    salary: "Salary", emi: "EMI", minBal: "Min Bal", avgBal: "Avg Bal",
    fraudSignals: "Fraud Signals", signal: "Signal", severity: "Severity",
    noFraud: "✓ No fraud signals detected",
    obligations: "Obligations & Behaviour",
    existingEMI: "Existing EMIs", ccDues: "Credit Card Dues",
    bnpl: "BNPL", loanApp: "Loan App Usage", gambling: "Gambling",
    investments: "Investments (SIP)", insurance: "Insurance",
    cashRatio: "Cash Withdrawal Ratio",
    none: "None", detected: "⚠ Detected", ofSpend: "of spend",
    aiRoadmap: "Post AI · Score 900 Roadmap",
    fraud: "Fraud", high: "HIGH", medium: "MEDIUM", low: "LOW",
    perMonth: "/mo", lendingScore: "Lending Score", decision: "Decision",
  },
  hi: {
    reportTitle: "बैंक स्टेटमेंट विश्लेषण रिपोर्ट",
    confidential: "गोपनीय · केवल आंतरिक उपयोग",
    poweredBy: "Post AI द्वारा संचालित",
    months: "माह", transactions: "लेनदेन",
    parseQuality: "पार्स गुणवत्ता", generated: "तैयार",
    keyMetrics: "मुख्य आंकड़े", scoreBreakdown: "स्कोर विवरण",
    avgIncome: "औसत मासिक आय", avgBalance: "औसत शेष",
    minBalance: "न्यूनतम शेष", totalEMI: "कुल EMI/माह",
    bounces: "बाउंस", salaryMonths: "वेतन माह",
    incomeSource: "आय स्रोत", foir: "FOIR",
    incomeStability: "आय स्थिरता", bounceHistory: "बाउंस इतिहास",
    balanceQuality: "शेष गुणवत्ता", spendingPattern: "खर्च पैटर्न",
    total: "कुल", monthlyBreakdown: "मासिक विवरण",
    month: "माह", credits: "जमा", debits: "निकासी",
    salary: "वेतन", emi: "EMI", minBal: "न्यूनतम शेष", avgBal: "औसत शेष",
    fraudSignals: "धोखाधड़ी संकेत", signal: "संकेत", severity: "गंभीरता",
    noFraud: "✓ कोई धोखाधड़ी संकेत नहीं",
    obligations: "दायित्व एवं व्यवहार",
    existingEMI: "मौजूदा EMI", ccDues: "क्रेडिट कार्ड बकाया",
    bnpl: "BNPL", loanApp: "लोन ऐप", gambling: "जुआ",
    investments: "निवेश (SIP)", insurance: "बीमा",
    cashRatio: "नकद निकासी अनुपात",
    none: "कोई नहीं", detected: "⚠ पाया गया", ofSpend: "खर्च का",
    aiRoadmap: "Post AI · 900 स्कोर का रोडमैप",
    fraud: "धोखाधड़ी", high: "उच्च", medium: "मध्यम", low: "निम्न",
    perMonth: "/माह", lendingScore: "लेंडिंग स्कोर", decision: "निर्णय",
  },
} as const;

const DECISION_LABELS: Record<string, Record<Lang, string>> = {
  STRONG_APPROVE: { en: "Strong Approve", hi: "दृढ़ अनुमोदन" },
  APPROVE:        { en: "Approve",        hi: "अनुमोदित" },
  MANUAL_REVIEW:  { en: "Manual Review",  hi: "मैन्युअल समीक्षा" },
  REJECT:         { en: "Reject",         hi: "अस्वीकृत" },
};

// ─── SVG Score Gauge ─────────────────────────────────────────────────────────

function buildScoreGauge(score: number, color: string): string {
  const R = 52, cx = 66, cy = 70;
  const startAngle = -135; // degrees from 12 o'clock, clockwise → 7:30 position
  const totalSweep = 270;
  const pct = Math.min(score / 900, 1);
  const fillAngle = startAngle + totalSweep * pct;

  function polar(deg: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  }

  function arcPath(a1: number, a2: number) {
    const s = polar(a1), e = polar(a2);
    const sweep = ((a2 - a1) % 360 + 360) % 360;
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  }

  const track = arcPath(startAngle, startAngle + totalSweep);
  const fill  = pct > 0.005 ? arcPath(startAngle, fillAngle) : "";

  // Tick marks at 0, 25%, 50%, 75%, 100% of scale
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const a = startAngle + totalSweep * p;
    const inner = polar_r(a, R - 7);
    const outer = polar_r(a, R + 1);
    return `<line x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join("");

  function polar_r(deg: number, r: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return `<svg width="132" height="126" viewBox="0 0 132 126">
    <path d="${track}" fill="none" stroke="#e2e8f0" stroke-width="9" stroke-linecap="round"/>
    ${fill ? `<path d="${fill}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>` : ""}
    ${ticks}
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="30" font-weight="800" fill="${color}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">${score}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">/ 900</text>
  </svg>`;
}

// ─── AI Insights → Structured HTML ───────────────────────────────────────────

function buildAiHtml(raw: string, lang: Lang): string {
  if (!raw.trim()) return "";

  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const isEnSectionHeader = (l: string) =>
    /^[A-Z][A-Z\s\-–—]{4,}$/.test(l.trim()) || /^[A-Z][A-Z\s]+:$/.test(l.trim());
  const isHiSectionHeader = (l: string) =>
    /^(वर्तमान स्कोर|तुरंत करें|6-माह का|अनुमानित स्कोर|ट्रैक करने)/.test(l.trim());
  const isMonthHeader = (l: string) =>
    /^Month \d/i.test(l.trim()) || /^माह \d/.test(l.trim());
  const isBullet = (l: string) =>
    /^[\d]+[\.\)]\s/.test(l.trim()) || /^[-•]\s/.test(l.trim());

  const lines = escaped.split("\n");
  let html = "";

  for (const raw_line of lines) {
    const line = raw_line.trimEnd();
    if (!line.trim()) { html += `<div class="ai-gap"></div>`; continue; }

    if ((lang === "en" && isEnSectionHeader(line)) || (lang === "hi" && isHiSectionHeader(line))) {
      html += `<div class="ai-sec-hdr">${line}</div>`;
    } else if (isMonthHeader(line)) {
      html += `<div class="ai-month-hdr">${line}</div>`;
    } else if (isBullet(line)) {
      html += `<div class="ai-bullet">${line}</div>`;
    } else {
      html += `<div class="ai-line">${line}</div>`;
    }
  }

  return html;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function generateReport(data: StatementIntelligence, aiInsights: string, lang: Lang): string {
  const t = T[lang];
  const breakdown = data.scoreBreakdown ?? {};
  const sc = SCORE_COLOR(data.lendingScore);
  const decLabel = DECISION_LABELS[data.lendingDecision]?.[lang] ?? data.lendingDecision;
  const decBg = DECISION_BG[data.lendingDecision] ?? "#fef3c7";
  const decTxt = DECISION_TEXT[data.lendingDecision] ?? "#92400e";
  const fraudColor = data.fraudRisk === "high" ? "#dc2626" : data.fraudRisk === "medium" ? "#d97706" : "#16a34a";
  const fraudLabel = data.fraudRisk === "high" ? t.high : data.fraudRisk === "medium" ? t.medium : t.low;
  const dateStr = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const fontFamily = lang === "hi"
    ? "'Noto Sans Devanagari','Mangal',Arial,sans-serif"
    : "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

  // Score gauge SVG
  const gaugeHtml = buildScoreGauge(data.lendingScore, sc);

  // Score breakdown bars
  const scoreRows = ([
    [t.incomeStability, breakdown.incomeStability ?? 0, 25],
    [t.bounceHistory,   breakdown.bounceHistory ?? 0,   25],
    [t.balanceQuality,  breakdown.balanceQuality ?? 0,  20],
    [t.foir,            breakdown.foirScore ?? 0,        15],
    [t.spendingPattern, breakdown.spendingPattern ?? 0,  15],
  ] as [string, number, number][]).map(([label, score, max]) => {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    const clr = pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : pct >= 30 ? "#d97706" : "#dc2626";
    return `<div class="bar-row">
      <span class="bar-lbl">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${clr}"></div></div>
      <span class="bar-val" style="color:${clr}">${score}/${max}</span>
    </div>`;
  }).join("") + `<div class="bar-total">${t.total}: <strong>${breakdown.total ?? 0}/100</strong></div>`;

  // Monthly table rows
  const monthRows = data.monthlyBreakdown.map((m) => `
    <tr>
      <td class="fw6">${m.label}</td>
      <td class="cr">${fmtN(m.totalCredits)}</td>
      <td class="dr">${fmtN(m.totalDebits)}</td>
      <td class="sl">${m.salaryAmount > 0 ? fmtN(m.salaryAmount) : "—"}</td>
      <td class="em">${m.emiTotal > 0 ? fmtN(m.emiTotal) : "—"}</td>
      <td style="color:${m.minBalance < 5000 ? "#dc2626" : "#374151"}">${fmtN(m.minBalance)}</td>
      <td>${fmtN(m.avgBalance)}</td>
      <td class="tc">${m.bounceCount > 0 ? `<span class="badge-red">${m.bounceCount}</span>` : "—"}</td>
    </tr>`).join("");

  // Fraud rows
  const fraudRows = data.fraudSignals.length === 0
    ? `<tr><td colspan="2" class="no-fraud">${t.noFraud}</td></tr>`
    : data.fraudSignals.map((s) => {
        const sev = s.severity === "high" ? t.high : s.severity === "medium" ? t.medium : t.low;
        const sevClr = s.severity === "high" ? "#dc2626" : s.severity === "medium" ? "#d97706" : "#ca8a04";
        const sevBg = s.severity === "high" ? "#fee2e2" : s.severity === "medium" ? "#fef3c7" : "#fefce8";
        return `<tr>
          <td><div class="fraud-type" style="color:${sevClr}">${s.type.replace(/_/g, " ")}</div>
              <div class="fraud-detail">${s.detail}</div></td>
          <td><span class="sev-badge" style="background:${sevBg};color:${sevClr}">${sev}</span></td>
        </tr>`;
      }).join("");

  // Obligations rows
  const yesClr = "#16a34a", noClr = "#6b7280", warnClr = "#dc2626";
  const oblRows = ([
    [t.existingEMI,  fmtN(data.existingEMIs) + t.perMonth, true],
    [t.ccDues,       data.creditCardDues > 0 ? fmtN(data.creditCardDues) + t.perMonth : t.none, data.creditCardDues === 0],
    [t.bnpl,         data.bnplUsage ? fmtN(data.bnplAmount) + t.perMonth : t.none, !data.bnplUsage],
    [t.loanApp,      data.loanAppUsage ? t.detected : t.none, !data.loanAppUsage],
    [t.gambling,     data.gamblingDetected ? t.detected : t.none, !data.gamblingDetected],
    [t.investments,  data.hasInvestments ? fmtN(data.investmentAmount) + t.perMonth + " ✓" : t.none, data.hasInvestments],
    [t.insurance,    data.hasInsurance ? "✓" : t.none, data.hasInsurance],
    [t.cashRatio,    Math.round(data.cashWithdrawalRatio * 100) + "% " + t.ofSpend, data.cashWithdrawalRatio < 0.2],
  ] as [string, string, boolean][]).map(([lbl, val, good]) =>
    `<tr><td class="obl-lbl">${lbl}</td><td style="color:${good ? yesClr : (val.includes("⚠") ? warnClr : noClr)};font-weight:600;text-align:right">${val}</td></tr>`
  ).join("");

  // AI insights section
  const aiBodyHtml = buildAiHtml(aiInsights, lang);
  const aiSection = aiBodyHtml ? `
    <div class="ai-card">
      <div class="ai-card-hdr">
        <div class="ai-hdr-left">
          <div class="ai-icon">✦</div>
          <div>
            <div class="ai-title">${t.aiRoadmap}</div>
            <div class="ai-sub">Personalised 6-month improvement plan</div>
          </div>
        </div>
      </div>
      <div class="ai-body">${aiBodyHtml}</div>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${t.reportTitle} — PostMoney</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:${fontFamily};background:#f1f5f9;color:#1e293b;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── Header ── */
.hdr{background:linear-gradient(135deg,#0a3d2e 0%,#0e5038 60%,#0d6848 100%);padding:22px 40px;display:flex;align-items:center;justify-content:space-between}
.hdr-brand{display:flex;align-items:center;gap:14px}
.brand-icon{width:42px;height:42px;background:rgba(255,255,255,.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}
.brand-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px;line-height:1}
.brand-tagline{font-size:10px;color:rgba(255,255,255,.55);margin-top:2px;letter-spacing:.5px;text-transform:uppercase}
.hdr-meta{text-align:right;color:rgba(255,255,255,.8)}
.hdr-bank{font-size:18px;font-weight:700;color:#fff;margin-bottom:3px}
.hdr-detail{font-size:11px;line-height:1.8;color:rgba(255,255,255,.65)}
.hdr-quality{font-weight:700;color:#4ade80}

/* ── Hero card ── */
.hero{margin:16px 32px;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.07);overflow:hidden}
.hero-inner{padding:24px;display:grid;grid-template-columns:140px 1fr 220px;gap:24px;align-items:start}
.score-col{display:flex;flex-direction:column;align-items:center;gap:6px}
.dec-badge{padding:5px 16px;border-radius:20px;font-size:11px;font-weight:700;background:${decBg};color:${decTxt};white-space:nowrap}
.fraud-pill{font-size:10.5px;font-weight:600;color:${fraudColor};margin-top:2px}

/* ── Metric grid ── */
.metrics-hdr{font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.m-card{background:#f8fafc;border:1px solid #e8edf2;border-radius:10px;padding:9px 11px;border-left:3px solid #e2e8f0}
.m-lbl{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
.m-val{font-size:14px;font-weight:700;color:#1e293b;margin-top:3px;line-height:1.2}

/* ── Score bars ── */
.bars-hdr{font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.bar-lbl{width:98px;font-size:10px;color:#64748b;flex-shrink:0;line-height:1.3}
.bar-track{flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .3s}
.bar-val{width:38px;font-size:10px;font-weight:700;text-align:right}
.bar-total{font-size:12px;font-weight:700;border-top:1px solid #e2e8f0;padding-top:7px;margin-top:5px;color:#1e293b;text-align:right}

/* ── Sections ── */
.section{margin:12px 32px;background:#fff;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.06);overflow:hidden}
.sec-hdr{padding:11px 18px;border-bottom:1px solid #e8edf2;display:flex;align-items:center;gap:9px;background:#fafbfc}
.sec-icon{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.sec-title{font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.6px}
.sec-body{padding:0}

/* ── Table ── */
table{width:100%;border-collapse:collapse}
thead th{background:#f8fafc;padding:9px 14px;font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px;text-align:left;border-bottom:1px solid #e8edf2;white-space:nowrap}
tbody td{padding:8px 14px;font-size:11.5px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
tbody tr:last-child td{border-bottom:none}
tbody tr:nth-child(even) td{background:#fafbfc}
.fw6{font-weight:600;color:#374151}
.cr{color:#16a34a;font-weight:600}
.dr{color:#dc2626;font-weight:600}
.sl{color:#2563eb}
.em{color:#d97706}
.tc{text-align:center}
.badge-red{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;background:#fee2e2;color:#dc2626;border-radius:11px;font-weight:700;font-size:11px;padding:0 5px}
.no-fraud{padding:16px;color:#16a34a;font-weight:600;font-size:12px}
.fraud-type{font-size:11.5px;font-weight:700;margin-bottom:2px}
.fraud-detail{font-size:10.5px;color:#64748b;line-height:1.4}
.sev-badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;white-space:nowrap}
.obl-lbl{color:#374151}

/* ── Two-col layout ── */
.two-col{margin:12px 32px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.two-col .section{margin:0}

/* ── AI Insights ── */
.ai-card{margin:12px 32px;border-radius:14px;overflow:hidden;border:1px solid #ddd6fe;box-shadow:0 2px 8px rgba(124,58,237,.08)}
.ai-card-hdr{background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 100%);padding:16px 22px;display:flex;align-items:center;justify-content:space-between}
.ai-hdr-left{display:flex;align-items:center;gap:12px}
.ai-icon{width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;flex-shrink:0}
.ai-title{font-size:14px;font-weight:700;color:#fff}
.ai-sub{font-size:10.5px;color:rgba(255,255,255,.65);margin-top:1px}
.ai-body{background:#faf5ff;padding:20px 24px}
.ai-sec-hdr{font-size:12px;font-weight:700;color:#5b21b6;text-transform:uppercase;letter-spacing:.5px;margin-top:16px;margin-bottom:6px;padding-bottom:5px;border-bottom:1.5px solid #ddd6fe}
.ai-sec-hdr:first-child{margin-top:0}
.ai-month-hdr{font-size:12px;font-weight:700;color:#6d28d9;margin-top:12px;margin-bottom:4px;background:#ede9fe;padding:5px 10px;border-radius:6px;border-left:3px solid #7c3aed}
.ai-bullet{font-size:11.5px;color:#374151;line-height:1.7;padding-left:16px;position:relative;margin-bottom:2px}
.ai-bullet::before{content:"·";position:absolute;left:4px;color:#7c3aed;font-size:16px;line-height:1.3}
.ai-line{font-size:11.5px;color:#374151;line-height:1.7;margin-bottom:2px}
.ai-gap{height:6px}

/* ── Footer ── */
.footer{margin:12px 32px 32px;padding:11px 0;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}

@media print{
  html,body{background:#fff}
  @page{margin:12mm 10mm;size:A4}
  .hero,.section,.two-col,.ai-card{page-break-inside:avoid}
}
</style>
</head>
<body>

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-brand">
    <div class="brand-icon">💳</div>
    <div>
      <div class="brand-name">PostMoney</div>
      <div class="brand-tagline">${t.reportTitle}</div>
    </div>
  </div>
  <div class="hdr-meta">
    <div class="hdr-bank">${data.detectedBank}</div>
    <div class="hdr-detail">
      ${data.statementMonths} ${t.months} &nbsp;·&nbsp; ${data.transactionCount} ${t.transactions}<br>
      ${t.generated}: ${dateStr}<br>
      ${t.parseQuality}: <span class="hdr-quality">${data.parseQuality.toUpperCase()}</span>
    </div>
  </div>
</div>

<!-- HERO -->
<div class="hero">
  <div class="hero-inner">
    <!-- Score gauge -->
    <div class="score-col">
      ${gaugeHtml}
      <div class="dec-badge">${decLabel}</div>
      <div class="fraud-pill">${t.fraud}: ${fraudLabel}</div>
    </div>

    <!-- Key metrics -->
    <div>
      <div class="metrics-hdr">${t.keyMetrics}</div>
      <div class="metric-grid">
        ${([
          [t.avgIncome,    fmtN(data.avgMonthlyIncome) + t.perMonth, "#0a3d2e"],
          [t.avgBalance,   fmtN(data.avgMonthlyBalance),             "#1e293b"],
          [t.minBalance,   fmtN(data.minMonthlyBalance),             data.minMonthlyBalance < 5000 ? "#dc2626" : "#1e293b"],
          [t.foir,         Math.round(data.foir * 100) + "%",        data.foir > 0.5 ? "#dc2626" : "#1e293b"],
          [t.totalEMI,     fmtN(data.totalObligations),              "#1e293b"],
          [t.bounces,      String(data.bounceCount),                  data.bounceCount > 0 ? "#dc2626" : "#16a34a"],
          [t.salaryMonths, `${data.salaryMonths}/${data.statementMonths}`, "#1e293b"],
          [t.incomeSource, data.primaryIncomeSource,                  "#1e293b"],
        ] as [string, string, string][]).map(([l, v, clr]) =>
          `<div class="m-card"><div class="m-lbl">${l}</div><div class="m-val" style="color:${clr}">${v}</div></div>`
        ).join("")}
      </div>
    </div>

    <!-- Score breakdown -->
    <div>
      <div class="bars-hdr">${t.scoreBreakdown}</div>
      ${scoreRows}
    </div>
  </div>
</div>

<!-- MONTHLY BREAKDOWN -->
<div class="section">
  <div class="sec-hdr">
    <div class="sec-icon" style="background:#eff6ff">📅</div>
    <span class="sec-title">${t.monthlyBreakdown}</span>
  </div>
  <div class="sec-body">
    <table>
      <thead><tr>
        <th>${t.month}</th><th>${t.credits}</th><th>${t.debits}</th>
        <th>${t.salary}</th><th>${t.emi}</th>
        <th>${t.minBal}</th><th>${t.avgBal}</th><th class="tc">${t.bounces}</th>
      </tr></thead>
      <tbody>${monthRows}</tbody>
    </table>
  </div>
</div>

<!-- FRAUD + OBLIGATIONS -->
<div class="two-col">
  <div class="section">
    <div class="sec-hdr">
      <div class="sec-icon" style="background:#fef2f2">🛡️</div>
      <span class="sec-title">${t.fraudSignals}</span>
    </div>
    <div class="sec-body">
      <table>
        <thead><tr><th>${t.signal}</th><th>${t.severity}</th></tr></thead>
        <tbody>${fraudRows}</tbody>
      </table>
    </div>
  </div>
  <div class="section">
    <div class="sec-hdr">
      <div class="sec-icon" style="background:#f0fdf4">💳</div>
      <span class="sec-title">${t.obligations}</span>
    </div>
    <div class="sec-body">
      <table><tbody>${oblRows}</tbody></table>
    </div>
  </div>
</div>

<!-- AI INSIGHTS -->
${aiSection}

<!-- FOOTER -->
<div class="footer">
  <span>PostMoney &nbsp;·&nbsp; ${t.confidential}</span>
  <span>${t.poweredBy} &nbsp;·&nbsp; ${new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
</div>

<script>window.onload=function(){window.print()}<\/script>
</body>
</html>`;
}
