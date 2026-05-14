import type { StatementIntelligence } from "@/lib/statement-engine";

// ─── Colour helpers ────────────────────────────────────────────────────────────
const SCORE_COLOR = (s: number) =>
  s >= 800 ? "#4ade80" : s >= 700 ? "#60a5fa" : s >= 580 ? "#fb923c" : "#f87171";

const DECISION_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  STRONG_APPROVE: { bg: "#052e16", text: "#4ade80", border: "#166534" },
  APPROVE:        { bg: "#0c1a3a", text: "#60a5fa", border: "#1e40af" },
  MANUAL_REVIEW:  { bg: "#1c1208", text: "#fb923c", border: "#92400e" },
  REJECT:         { bg: "#1c0606", text: "#f87171", border: "#991b1b" },
};

function fmtN(n: number) {
  if (!n || isNaN(n)) return "₹0";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

type Lang = "en" | "hi";

// ─── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    reportTitle:"Statement Intelligence Report", confidential:"Confidential · Internal",
    poweredBy:"Powered by Post AI", months:"months", transactions:"transactions",
    parseQuality:"Parse Quality", generated:"Generated",
    keyMetrics:"KEY METRICS", scoreBreakdown:"SCORE BREAKDOWN",
    avgIncome:"Avg Monthly Income", avgBalance:"Avg Balance",
    minBalance:"Min Balance", totalEMI:"Total EMI / mo",
    bounces:"Bounces", salaryMonths:"Salary Months",
    incomeSource:"Income Source", foir:"FOIR",
    incomeStability:"Income Stability", bounceHistory:"Bounce History",
    balanceQuality:"Balance Quality", spendingPattern:"Spending Pattern",
    total:"Total", monthlyBreakdown:"MONTHLY BREAKDOWN",
    month:"Month", credits:"Credits", debits:"Debits",
    salary:"Salary", emi:"EMI", minBal:"Min Bal", avgBal:"Avg Bal",
    fraudSignals:"FRAUD SIGNALS", signal:"Signal", severity:"Severity",
    noFraud:"✓ No fraud signals detected",
    obligations:"OBLIGATIONS & BEHAVIOUR",
    existingEMI:"Existing EMIs", ccDues:"Credit Card Dues",
    bnpl:"BNPL", loanApp:"Loan App Usage", gambling:"Gambling",
    investments:"Investments (SIP)", insurance:"Insurance",
    cashRatio:"Cash Withdrawal Ratio",
    none:"None", detected:"⚠ Detected", ofSpend:"of spend",
    aiRoadmap:"POST AI — Score 900 Roadmap",
    fraud:"Fraud Risk", high:"HIGH", medium:"MEDIUM", low:"LOW",
    perMonth:"/mo", decision:"Decision",
  },
  hi: {
    reportTitle:"बैंक स्टेटमेंट विश्लेषण", confidential:"गोपनीय · आंतरिक उपयोग",
    poweredBy:"Post AI द्वारा संचालित", months:"माह", transactions:"लेनदेन",
    parseQuality:"पार्स गुणवत्ता", generated:"तैयार",
    keyMetrics:"मुख्य आंकड़े", scoreBreakdown:"स्कोर विवरण",
    avgIncome:"औसत मासिक आय", avgBalance:"औसत शेष",
    minBalance:"न्यूनतम शेष", totalEMI:"कुल EMI/माह",
    bounces:"बाउंस", salaryMonths:"वेतन माह",
    incomeSource:"आय स्रोत", foir:"FOIR",
    incomeStability:"आय स्थिरता", bounceHistory:"बाउंस इतिहास",
    balanceQuality:"शेष गुणवत्ता", spendingPattern:"खर्च पैटर्न",
    total:"कुल", monthlyBreakdown:"मासिक विवरण",
    month:"माह", credits:"जमा", debits:"निकासी",
    salary:"वेतन", emi:"EMI", minBal:"न्यूनतम", avgBal:"औसत",
    fraudSignals:"धोखाधड़ी संकेत", signal:"संकेत", severity:"गंभीरता",
    noFraud:"✓ कोई धोखाधड़ी संकेत नहीं",
    obligations:"दायित्व एवं व्यवहार",
    existingEMI:"मौजूदा EMI", ccDues:"क्रेडिट कार्ड बकाया",
    bnpl:"BNPL", loanApp:"लोन ऐप", gambling:"जुआ",
    investments:"निवेश (SIP)", insurance:"बीमा",
    cashRatio:"नकद निकासी अनुपात",
    none:"कोई नहीं", detected:"⚠ पाया गया", ofSpend:"खर्च का",
    aiRoadmap:"POST AI — 900 स्कोर का रोडमैप",
    fraud:"धोखाधड़ी जोखिम", high:"उच्च", medium:"मध्यम", low:"निम्न",
    perMonth:"/माह", decision:"निर्णय",
  },
} as const;

const DECISION_LABELS: Record<string, Record<Lang, string>> = {
  STRONG_APPROVE: { en:"Strong Approve", hi:"दृढ़ अनुमोदन" },
  APPROVE:        { en:"Approve",        hi:"अनुमोदित" },
  MANUAL_REVIEW:  { en:"Manual Review",  hi:"मैन्युअल समीक्षा" },
  REJECT:         { en:"Reject",         hi:"अस्वीकृत" },
};

// ─── PostMoney Logo (CSS-rendered, matches brand) ─────────────────────────────
const LOGO_HTML = `<div style="font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;line-height:1;user-select:none">
  <div style="font-size:38px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;line-height:1">post,</div>
  <div style="height:1.5px;background:rgba(255,255,255,0.3);margin:5px 0 4px"></div>
  <div style="font-size:34px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1">Money</div>
</div>`;

// ─── SVG Arc Gauge ─────────────────────────────────────────────────────────────
function buildGauge(score: number, color: string): string {
  const R = 56, cx = 70, cy = 74;
  const START = -135, SWEEP = 270;
  const pct = Math.min(score / 900, 1);

  function pt(deg: number, r = R) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arc(a1: number, a2: number, clr: string, w: number, op = 1) {
    const s = pt(a1), e = pt(a2);
    const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M${s.x.toFixed(2)},${s.y.toFixed(2)} A${R},${R} 0 ${large} 1 ${e.x.toFixed(2)},${e.y.toFixed(2)}"
      fill="none" stroke="${clr}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  }

  const fillEnd = START + SWEEP * pct;
  // Glow effect — slightly wider, semi-transparent
  const glowPath = pct > 0.01 ? arc(START, fillEnd, color, 14, 0.2) : "";
  const trackPath = arc(START, START + SWEEP, "#222222", 8);
  const fillPath  = pct > 0.01 ? arc(START, fillEnd, color, 8) : "";

  // Tick marks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const a = START + SWEEP * p;
    const outer = pt(a, R + 4), inner = pt(a, R - 8);
    return `<line x1="${outer.x.toFixed(1)}" y1="${outer.y.toFixed(1)}"
      x2="${inner.x.toFixed(1)}" y2="${inner.y.toFixed(1)}"
      stroke="#333" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join("");

  return `<svg width="140" height="128" viewBox="0 0 140 128">
    ${ticks}
    ${trackPath}
    ${glowPath}
    ${fillPath}
    <text x="${cx}" y="${cy-10}" text-anchor="middle" font-size="34" font-weight="800"
      fill="${color}" font-family="'Helvetica Neue',Arial,sans-serif">${score}</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="12" fill="#555"
      font-family="'Helvetica Neue',Arial,sans-serif">/ 900</text>
  </svg>`;
}

// ─── AI text → structured HTML ─────────────────────────────────────────────────
function renderAi(raw: string, lang: Lang): string {
  if (!raw.trim()) return "";
  const esc = raw.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const lines = esc.split("\n");
  let out = "";
  for (const line of lines) {
    const l = line.trimEnd();
    if (!l.trim()) { out += `<div style="height:8px"></div>`; continue; }
    const isEnHdr  = /^[A-Z][A-Z\s\-–—]{4,}$/.test(l.trim()) || /^[A-Z][A-Z\s]+:$/.test(l.trim());
    const isHiHdr  = /^(वर्तमान स्कोर|तुरंत करें|6-माह का|अनुमानित स्कोर|ट्रैक करने)/.test(l.trim());
    const isMonth  = /^Month \d/i.test(l.trim()) || /^माह \d/.test(l.trim());
    const isBullet = /^[\d]+[\.\)]\s/.test(l.trim()) || /^[-•]\s/.test(l.trim());

    if ((lang === "en" && isEnHdr) || (lang === "hi" && isHiHdr)) {
      out += `<div class="ai-hdr">${l}</div>`;
    } else if (isMonth) {
      out += `<div class="ai-month">${l}</div>`;
    } else if (isBullet) {
      out += `<div class="ai-bullet">${l}</div>`;
    } else {
      out += `<div class="ai-line">${l}</div>`;
    }
  }
  return out;
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function generateReport(data: StatementIntelligence, aiInsights: string, lang: Lang): string {
  const t = T[lang];
  const sc    = SCORE_COLOR(data.lendingScore);
  const dec   = DECISION_STYLE[data.lendingDecision] ?? DECISION_STYLE.MANUAL_REVIEW;
  const decLbl= DECISION_LABELS[data.lendingDecision]?.[lang] ?? data.lendingDecision;
  const frColor = data.fraudRisk === "high" ? "#f87171" : data.fraudRisk === "medium" ? "#fb923c" : "#4ade80";
  const frLbl   = data.fraudRisk === "high" ? t.high : data.fraudRisk === "medium" ? t.medium : t.low;
  const dateStr = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day:"2-digit", month:"short", year:"numeric" });
  const breakdown = data.scoreBreakdown ?? {};
  const font = lang === "hi"
    ? "'Noto Sans Devanagari','Mangal',Arial,sans-serif"
    : "'Helvetica Neue',Helvetica,Arial,sans-serif";

  // Score bars
  const bars = ([
    [t.incomeStability, breakdown.incomeStability ?? 0, 25],
    [t.bounceHistory,   breakdown.bounceHistory ?? 0,   25],
    [t.balanceQuality,  breakdown.balanceQuality ?? 0,  20],
    [t.foir,            breakdown.foirScore ?? 0,        15],
    [t.spendingPattern, breakdown.spendingPattern ?? 0,  15],
  ] as [string,number,number][]).map(([lbl,score,max]) => {
    const pct = max > 0 ? Math.round((score/max)*100) : 0;
    const clr = pct >= 80 ? "#4ade80" : pct >= 50 ? "#60a5fa" : pct >= 30 ? "#fb923c" : "#f87171";
    return `<div class="bar-row">
      <span class="bar-lbl">${lbl}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${clr}"></div></div>
      <span class="bar-val" style="color:${clr}">${score}/${max}</span>
    </div>`;
  }).join("") + `<div class="bar-total">${t.total}: <b>${breakdown.total ?? 0}/100</b></div>`;

  // Monthly rows
  const mRows = data.monthlyBreakdown.map(m => `<tr>
    <td class="fw">${m.label}</td>
    <td class="cr">${fmtN(m.totalCredits)}</td>
    <td class="dr">${fmtN(m.totalDebits)}</td>
    <td class="sl">${m.salaryAmount > 0 ? fmtN(m.salaryAmount) : "—"}</td>
    <td class="em">${m.emiTotal > 0 ? fmtN(m.emiTotal) : "—"}</td>
    <td style="color:${m.minBalance < 5000 ? "#f87171" : "#d1d5db"}">${fmtN(m.minBalance)}</td>
    <td>${fmtN(m.avgBalance)}</td>
    <td class="tc">${m.bounceCount > 0 ? `<span class="br">${m.bounceCount}</span>` : "—"}</td>
  </tr>`).join("");

  // Fraud rows
  const fRows = data.fraudSignals.length === 0
    ? `<tr><td colspan="2" class="no-fraud">${t.noFraud}</td></tr>`
    : data.fraudSignals.map(s => {
        const sevClr = s.severity === "high" ? "#f87171" : s.severity === "medium" ? "#fb923c" : "#fbbf24";
        const sev = s.severity === "high" ? t.high : s.severity === "medium" ? t.medium : t.low;
        return `<tr>
          <td><div class="ft" style="color:${sevClr}">${s.type.replace(/_/g," ")}</div>
              <div class="fd">${s.detail}</div></td>
          <td><span class="sev" style="color:${sevClr};border-color:${sevClr}">${sev}</span></td>
        </tr>`;
      }).join("");

  // Obligations
  const oRows = ([
    [t.existingEMI,  fmtN(data.existingEMIs)+t.perMonth,                                                   true],
    [t.ccDues,       data.creditCardDues > 0 ? fmtN(data.creditCardDues)+t.perMonth : t.none,               data.creditCardDues === 0],
    [t.bnpl,         data.bnplUsage ? fmtN(data.bnplAmount)+t.perMonth : t.none,                            !data.bnplUsage],
    [t.loanApp,      data.loanAppUsage ? t.detected : t.none,                                               !data.loanAppUsage],
    [t.gambling,     data.gamblingDetected ? t.detected : t.none,                                           !data.gamblingDetected],
    [t.investments,  data.hasInvestments ? fmtN(data.investmentAmount)+t.perMonth+" ✓" : t.none,            data.hasInvestments],
    [t.insurance,    data.hasInsurance ? "✓" : t.none,                                                      data.hasInsurance],
    [t.cashRatio,    Math.round(data.cashWithdrawalRatio*100)+"% "+t.ofSpend,                               data.cashWithdrawalRatio < 0.2],
  ] as [string,string,boolean][]).map(([l,v,good]) =>
    `<tr><td class="ol">${l}</td><td style="color:${good?"#4ade80":v.includes("⚠")?"#f87171":"#9ca3af"};font-weight:600;text-align:right">${v}</td></tr>`
  ).join("");

  // AI section
  const aiHtml = renderAi(aiInsights, lang);
  const aiSection = aiHtml ? `
  <div class="card ai-card">
    <div class="ai-top">
      <div class="ai-icon-wrap">✦</div>
      <div>
        <div class="ai-title">${t.aiRoadmap}</div>
        <div class="ai-sub">Personalised improvement plan based on your statement</div>
      </div>
    </div>
    <div class="ai-body">${aiHtml}</div>
  </div>` : "";

  // Metric cards
  const metrics = ([
    [t.avgIncome,    fmtN(data.avgMonthlyIncome)+t.perMonth,      "#4ade80"],
    [t.avgBalance,   fmtN(data.avgMonthlyBalance),                 "#d1d5db"],
    [t.minBalance,   fmtN(data.minMonthlyBalance),                 data.minMonthlyBalance < 5000 ? "#f87171" : "#d1d5db"],
    [t.foir,         Math.round(data.foir*100)+"%",                data.foir > 0.5 ? "#f87171" : "#4ade80"],
    [t.totalEMI,     fmtN(data.totalObligations),                  "#d1d5db"],
    [t.bounces,      String(data.bounceCount),                     data.bounceCount > 0 ? "#f87171" : "#4ade80"],
    [t.salaryMonths, `${data.salaryMonths}/${data.statementMonths}`, "#d1d5db"],
    [t.incomeSource, data.primaryIncomeSource,                     "#9ca3af"],
  ] as [string,string,string][]).map(([l,v,clr]) =>
    `<div class="mc"><div class="mc-lbl">${l}</div><div class="mc-val" style="color:${clr}">${v}</div></div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${t.reportTitle} — PostMoney</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;
  -webkit-print-color-adjust:exact !important;
  print-color-adjust:exact !important;
  forced-color-adjust:none !important;
}
html{color-scheme:dark;background:#0d0d0d !important}
html,body{
  font-family:${font};
  background:#0d0d0d !important;
  color:#d1d5db;
  font-size:12.5px;
}

/* ── Page wrapper (A4) ── */
.page{
  width:794px;
  min-height:1123px;
  margin:0 auto;
  background:#0d0d0d;
  padding:0;
}

/* ── Header ── */
.hdr{
  padding:28px 36px 24px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid #1f1f1f;
}
.hdr-meta{text-align:right}
.hdr-bank{font-size:17px;font-weight:700;color:#fff;margin-bottom:4px}
.hdr-detail{font-size:10.5px;line-height:1.9;color:#555}
.hdr-q{font-weight:700;color:#4ade80}
.hdr-report{font-size:10px;color:#555;letter-spacing:.5px;text-transform:uppercase;margin-top:2px}

/* ── Cards ── */
.card{
  background:#111;
  border:1px solid #1e1e1e;
  border-radius:14px;
  margin:12px 32px;
  overflow:hidden;
}
.card-hdr{
  padding:12px 20px;
  border-bottom:1px solid #1e1e1e;
  font-size:10px;
  font-weight:700;
  color:#555;
  letter-spacing:1px;
  text-transform:uppercase;
  display:flex;
  align-items:center;
  gap:8px;
  background:#0d0d0d;
}
.card-hdr-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* ── Hero ── */
.hero{margin:12px 32px;background:#111;border:1px solid #1e1e1e;border-radius:14px;padding:24px;display:grid;grid-template-columns:148px 1fr 210px;gap:22px;align-items:start}
.score-col{display:flex;flex-direction:column;align-items:center;gap:8px}
.dec-badge{
  padding:5px 14px;border-radius:20px;font-size:10.5px;font-weight:700;
  background:${dec.bg};color:${dec.text};border:1px solid ${dec.border};
  white-space:nowrap;text-align:center;width:100%
}
.fraud-lbl{font-size:10px;font-weight:600;color:${frColor};text-align:center}

/* ── Metric cards ── */
.metrics-hdr{font-size:9.5px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.mc{background:#161616;border:1px solid #222;border-radius:9px;padding:9px 11px}
.mc-lbl{font-size:9px;color:#555;text-transform:uppercase;letter-spacing:.4px;line-height:1.3}
.mc-val{font-size:13px;font-weight:700;margin-top:3px;line-height:1.2}

/* ── Score bars ── */
.bars-hdr{font-size:9.5px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.bar-row{display:flex;align-items:center;gap:7px;margin-bottom:7px}
.bar-lbl{width:94px;font-size:9.5px;color:#555;flex-shrink:0;line-height:1.3}
.bar-track{flex:1;height:5px;background:#222;border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px}
.bar-val{width:36px;font-size:9.5px;font-weight:700;text-align:right}
.bar-total{font-size:11px;font-weight:700;border-top:1px solid #222;padding-top:7px;margin-top:5px;color:#d1d5db;text-align:right}

/* ── Table ── */
table{width:100%;border-collapse:collapse}
thead th{
  background:#0d0d0d;padding:9px 13px;
  font-size:9.5px;font-weight:600;color:#444;
  text-transform:uppercase;letter-spacing:.5px;
  text-align:left;border-bottom:1px solid #1e1e1e;white-space:nowrap
}
tbody td{padding:8px 13px;font-size:11.5px;border-bottom:1px solid #161616;vertical-align:middle;color:#c9d1d9}
tbody tr:last-child td{border-bottom:none}
tbody tr:nth-child(odd) td{background:#0f0f0f}
.fw{font-weight:600;color:#e5e7eb}
.cr{color:#4ade80;font-weight:600}
.dr{color:#f87171;font-weight:600}
.sl{color:#60a5fa}
.em{color:#fb923c}
.tc{text-align:center}
.br{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;background:#2d0f0f;color:#f87171;border-radius:10px;font-weight:700;font-size:10px;padding:0 5px;border:1px solid #991b1b}
.no-fraud{padding:16px;color:#4ade80;font-weight:600;font-size:11.5px}
.ft{font-size:11px;font-weight:700;margin-bottom:2px}
.fd{font-size:10px;color:#555;line-height:1.4}
.sev{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9.5px;font-weight:700;text-transform:uppercase;border:1px solid;background:transparent}
.ol{color:#9ca3af}

/* ── Two-col ── */
.two-col{margin:12px 32px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.two-col .card{margin:0}

/* ── AI Insights ── */
.ai-card{background:#0d0a14;border-color:#2d1f4e}
.ai-top{
  background:linear-gradient(135deg,#1a0a2e 0%,#2d1654 100%);
  padding:18px 22px;display:flex;align-items:center;gap:14px;
  border-bottom:1px solid #2d1f4e
}
.ai-icon-wrap{
  width:38px;height:38px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);
  border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:18px;color:#a78bfa;flex-shrink:0
}
.ai-title{font-size:13px;font-weight:700;color:#e9d5ff;letter-spacing:.3px}
.ai-sub{font-size:10px;color:#7c3aed;margin-top:2px}
.ai-body{padding:20px 22px}
.ai-hdr{
  font-size:10.5px;font-weight:700;color:#a78bfa;
  text-transform:uppercase;letter-spacing:.8px;
  margin-top:16px;margin-bottom:6px;
  padding-bottom:5px;border-bottom:1px solid #2d1f4e
}
.ai-hdr:first-child{margin-top:0}
.ai-month{
  font-size:11.5px;font-weight:700;color:#c4b5fd;
  margin-top:10px;margin-bottom:4px;
  padding:5px 10px;border-radius:6px;
  background:#1a0a2e;border-left:2px solid #7c3aed
}
.ai-bullet{
  font-size:11px;color:#9ca3af;line-height:1.7;
  padding-left:14px;position:relative;margin-bottom:1px
}
.ai-bullet::before{content:"·";position:absolute;left:3px;color:#7c3aed;font-size:18px;line-height:1.2}
.ai-line{font-size:11px;color:#9ca3af;line-height:1.7;margin-bottom:1px}

/* ── Divider ── */
.divider{height:1px;background:#1e1e1e;margin:4px 32px}

/* ── Footer ── */
.footer{
  margin:14px 32px 32px;padding:11px 0;
  border-top:1px solid #1e1e1e;
  display:flex;justify-content:space-between;
  font-size:9.5px;color:#333
}

/* ── Print ── */
@media print{
  html,body{background:#0d0d0d !important}
  @page{size:A4;margin:0}
  .page{width:100%;min-height:0;background:#0d0d0d !important}
  .hero,.card,.two-col{page-break-inside:avoid}
  /* Ensure all dark backgrounds survive Chrome "Background graphics" unchecked */
  .hdr,.hero,.card,.card-hdr,.mc,.ai-top,.ai-body,.ai-card,.two-col .card{
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
  }
}
</style>
</head>
<body>
<div class="page">

<!-- ══ HEADER ══ -->
<div class="hdr">
  <div>
    ${LOGO_HTML}
    <div class="hdr-report">${t.reportTitle}</div>
  </div>
  <div class="hdr-meta">
    <div class="hdr-bank">${data.detectedBank}</div>
    <div class="hdr-detail">
      ${data.statementMonths} ${t.months} &nbsp;·&nbsp; ${data.transactionCount} ${t.transactions}<br>
      ${t.generated}: ${dateStr}<br>
      ${t.parseQuality}: <span class="hdr-q">${data.parseQuality.toUpperCase()}</span>
    </div>
  </div>
</div>

<!-- ══ HERO ══ -->
<div class="hero">
  <!-- Score gauge -->
  <div class="score-col">
    ${buildGauge(data.lendingScore, sc)}
    <div class="dec-badge">${decLbl}</div>
    <div class="fraud-lbl">${t.fraud}: ${frLbl}</div>
  </div>

  <!-- Metrics grid -->
  <div>
    <div class="metrics-hdr">${t.keyMetrics}</div>
    <div class="mc-grid">${metrics}</div>
  </div>

  <!-- Score bars -->
  <div>
    <div class="bars-hdr">${t.scoreBreakdown}</div>
    ${bars}
  </div>
</div>

<!-- ══ MONTHLY BREAKDOWN ══ -->
<div class="card">
  <div class="card-hdr">
    <div class="card-hdr-dot" style="background:#60a5fa"></div>
    ${t.monthlyBreakdown}
  </div>
  <table>
    <thead><tr>
      <th>${t.month}</th><th>${t.credits}</th><th>${t.debits}</th>
      <th>${t.salary}</th><th>${t.emi}</th>
      <th>${t.minBal}</th><th>${t.avgBal}</th><th class="tc">${t.bounces}</th>
    </tr></thead>
    <tbody>${mRows}</tbody>
  </table>
</div>

<!-- ══ FRAUD + OBLIGATIONS ══ -->
<div class="two-col">
  <div class="card">
    <div class="card-hdr">
      <div class="card-hdr-dot" style="background:#f87171"></div>
      ${t.fraudSignals}
    </div>
    <table>
      <thead><tr><th>${t.signal}</th><th>${t.severity}</th></tr></thead>
      <tbody>${fRows}</tbody>
    </table>
  </div>
  <div class="card">
    <div class="card-hdr">
      <div class="card-hdr-dot" style="background:#4ade80"></div>
      ${t.obligations}
    </div>
    <table><tbody>${oRows}</tbody></table>
  </div>
</div>

<!-- ══ AI INSIGHTS ══ -->
${aiSection}

<!-- ══ FOOTER ══ -->
<div class="footer">
  <span>PostMoney &nbsp;·&nbsp; ${t.confidential}</span>
  <span>${t.poweredBy} &nbsp;·&nbsp; ${new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
</div>

</div><!-- end .page -->
<script>window.onload=function(){window.print()}<\/script>
</body>
</html>`;
}
