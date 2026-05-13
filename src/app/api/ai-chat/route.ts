export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

import { NextRequest, NextResponse } from "next/server";
import type { StatementIntelligence } from "@/lib/statement-engine";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-opus-4-5";

type ClaudeMessage = { role: "user" | "assistant"; content: string };

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildInsightsPrompt(data: StatementIntelligence): string {
  const breakdown = data.scoreBreakdown ?? {};
  const monthSample = data.monthlyBreakdown
    .slice(-6)
    .map(
      (m) =>
        `  ${m.label}: Credits ₹${fmt(m.totalCredits)}, Debits ₹${fmt(m.totalDebits)}, Min Bal ₹${fmt(m.minBalance)}, Bounces ${m.bounceCount}`,
    )
    .join("\n");

  return `You are a senior financial analyst at PostMoney, an Indian fintech lending platform. Give this customer a concrete, numbered 6-month roadmap to reach a lending score of 900.

## Applicant's Statement Data
- Bank: ${data.detectedBank}
- Period: ${data.statementMonths} months | ${data.transactionCount} transactions
- Current Lending Score: ${data.lendingScore}/900 → Target: 900
- Decision: ${data.lendingDecision}
- Avg Monthly Income: ₹${fmt(data.avgMonthlyIncome)}
- Avg Monthly Balance: ₹${fmt(data.avgMonthlyBalance)}
- Min Balance (ever): ₹${fmt(data.minMonthlyBalance)}
- FOIR: ${Math.round(data.foir * 100)}%  (safe = <50%)
- Total Bounces: ${data.bounceCount}
- Fraud Risk: ${data.fraudRisk}
- Loan App Usage: ${data.loanAppUsage ? "YES ⚠️" : "No"}
- Gambling Detected: ${data.gamblingDetected ? "YES ⚠️" : "No"}
- BNPL Usage: ${data.bnplUsage ? `Yes — ₹${fmt(data.bnplAmount)}/mo` : "No"}
- Investments (SIP etc.): ${data.hasInvestments ? `Yes — ₹${fmt(data.investmentAmount)}/mo` : "None"}
- Insurance: ${data.hasInsurance ? "Yes" : "None"}

## Score Breakdown (out of 100 raw points)
- Income Stability: ${breakdown.incomeStability ?? 0}/25
- Bounce History: ${breakdown.bounceHistory ?? 0}/25
- Balance Quality: ${breakdown.balanceQuality ?? 0}/20
- FOIR Score: ${breakdown.foirScore ?? 0}/15
- Spending Pattern: ${breakdown.spendingPattern ?? 0}/15
- Total: ${breakdown.total ?? 0}/100

## Last 6 Months
${monthSample}

---

Respond with this exact structure (plain text, no markdown symbols):

CURRENT SCORE ANALYSIS
[2-3 sentences explaining what's holding the score back with specific numbers]

QUICK WINS — DO THIS WEEK
[3-5 immediate, specific actions. E.g. "Stop all loan app activity — every KreditBee/CASHe enquiry drops your score"]

6-MONTH ROADMAP

Month 1 — [Theme]:
[2-3 specific actions with exact rupee targets]

Month 2 — [Theme]:
[Actions]

Month 3 — [Theme]:
[Actions]

Month 4 — [Theme]:
[Actions]

Month 5 — [Theme]:
[Actions]

Month 6 — [Theme]:
[Actions]

PROJECTED SCORE PROGRESS
Month 1: ${data.lendingScore} → [projected]
Month 2: [projected] → [projected]
[continue through Month 6 → 900]

KEY METRICS TO TRACK
[3-4 specific metrics with exact rupee/percentage targets to hit by month 6]

Be direct and specific to Indian banking. Mention UPI, NACH, SIP, ECS where relevant. Give exact rupee amounts.`;
}

function buildDebugPrompt(data: StatementIntelligence, rawDebugInfo?: string): string {
  return `You are a PDF parsing expert for Indian bank statements. Analyze these parsing results and explain any issues.

## Parse Results
- Bank Detected: ${data.detectedBank}
- Parse Quality: ${data.parseQuality}
- Statement Months: ${data.statementMonths}
- Transaction Count: ${data.transactionCount}
- Engine Version: ${(data as unknown as Record<string, unknown>)["engineVersion"] ?? "unknown"}

## Key Metrics
- Avg Income: ₹${fmt(data.avgMonthlyIncome)}/mo
- Avg Balance: ₹${fmt(data.avgMonthlyBalance)}
- Min Balance: ₹${fmt(data.minMonthlyBalance)}
- Bounces: ${data.bounceCount}

## Monthly Breakdown
${data.monthlyBreakdown
  .map((m) => `  ${m.label}: Credits ₹${fmt(m.totalCredits)}, Debits ₹${fmt(m.totalDebits)}, MinBal ₹${fmt(m.minBalance)}`)
  .join("\n")}
${rawDebugInfo ? `\n## Raw PDF Text Sample\n${rawDebugInfo.slice(0, 2000)}` : ""}

---

Analyze:
1. PARSE QUALITY ASSESSMENT — Is this parse reliable? Confidence level?
2. ANOMALIES FOUND — Unusually large/small amounts? Month gaps? Suspicious patterns?
3. LIKELY ERRORS — What data might be misclassified or wrong?
4. RECOMMENDATIONS — What should be verified manually?

Be specific and technical. Flag header/footer rows being parsed as transactions.`;
}

function buildChatSystem(data: StatementIntelligence): string {
  const monthSample = data.monthlyBreakdown
    .slice(-6)
    .map(
      (m) =>
        `${m.label}: Credits ₹${fmt(m.totalCredits)}, Debits ₹${fmt(m.totalDebits)}, Salary ₹${fmt(m.salaryAmount)}, EMI ₹${fmt(m.emiTotal)}, MinBal ₹${fmt(m.minBalance)}, Bounces ${m.bounceCount}`,
    )
    .join(" | ");

  return `You are a friendly financial analyst at PostMoney, an Indian fintech lending platform. You have analysed this bank statement and can answer questions about it.

Statement Summary:
- Bank: ${data.detectedBank} | Period: ${data.statementMonths} months | ${data.transactionCount} transactions
- Lending Score: ${data.lendingScore}/900 | Decision: ${data.lendingDecision} | Fraud Risk: ${data.fraudRisk}
- Avg Income: ₹${fmt(data.avgMonthlyIncome)}/mo | Avg Balance: ₹${fmt(data.avgMonthlyBalance)} | FOIR: ${Math.round(data.foir * 100)}%
- Bounces: ${data.bounceCount} | Loan Apps: ${data.loanAppUsage ? "Yes" : "No"} | Gambling: ${data.gamblingDetected ? "Yes" : "No"}
- Monthly data: ${monthSample}
${data.fraudSignals.length > 0 ? `- Fraud Signals: ${data.fraudSignals.map((s) => s.type + " (" + s.severity + ")").join(", ")}` : "- No fraud signals"}

Answer questions accurately using this data. Be helpful, concise, and use ₹ for amounts.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!n || isNaN(n)) return "0";
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-IN");
}

async function callClaude(
  messages: ClaudeMessage[],
  system?: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages,
  };
  if (system) body.system = system;

  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  return (
    data.content?.find((c) => c.type === "text")?.text ?? ""
  );
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI not configured. Add ANTHROPIC_API_KEY=<your_key> to your .env.local file (and Firebase environment variables for production). Get a key at https://console.anthropic.com/",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      mode: "insights" | "chat" | "debug";
      message?: string;
      history?: { role: "user" | "assistant"; text: string }[];
      statementData: StatementIntelligence;
      rawDebugInfo?: string;
    };

    const { mode, message, history = [], statementData, rawDebugInfo } = body;

    if (!statementData) {
      return NextResponse.json({ error: "No statement data provided" }, { status: 400 });
    }

    let text = "";

    if (mode === "insights") {
      text = await callClaude([
        { role: "user", content: buildInsightsPrompt(statementData) },
      ]);
    } else if (mode === "debug") {
      text = await callClaude([
        { role: "user", content: buildDebugPrompt(statementData, rawDebugInfo) },
      ]);
    } else if (mode === "chat") {
      if (!message?.trim()) {
        return NextResponse.json({ error: "No message provided" }, { status: 400 });
      }
      const messages: ClaudeMessage[] = [
        ...history.map((h) => ({
          role: h.role,
          content: h.text,
        })),
        { role: "user" as const, content: message },
      ];
      text = await callClaude(messages, buildChatSystem(statementData));
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
