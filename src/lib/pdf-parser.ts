import { StatementAnalysis } from "./store";

interface Transaction {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

function extractAmount(str: string): number {
  const clean = str.replace(/[,\s]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function isEMIKeyword(desc: string): boolean {
  const keywords = ["emi", "loan", "equated", "installment", "hdfc loan", "icici loan", "sbi loan", "ecs", "nach", "auto debit"];
  return keywords.some((k) => desc.toLowerCase().includes(k));
}

function isSalaryKeyword(desc: string): boolean {
  const keywords = ["salary", "sal ", "sal/", "payroll", "pay credit", "neft cr", "imps cr", "inward neft", "employer"];
  return keywords.some((k) => desc.toLowerCase().includes(k));
}

function isBounce(desc: string): boolean {
  const keywords = ["bounce", "return", "dishonour", "insufficient", "ecs rtn", "nach rtn"];
  return keywords.some((k) => desc.toLowerCase().includes(k));
}

export async function parsePDF(file: File): Promise<StatementAnalysis> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }

  return analyzeText(fullText);
}

function analyzeText(text: string): StatementAnalysis {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const transactions: Transaction[] = [];
  let bounceCount = 0;
  let salaryCredits = 0;
  const monthlyCredits: Record<string, number> = {};
  const monthlyBalances: number[] = [];

  // Regex patterns for common Indian bank statement formats
  const amountPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  const datePattern = /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/;

  for (const line of lines) {
    if (isBounce(line)) bounceCount++;

    const amounts = [...line.matchAll(amountPattern)].map((m) => extractAmount(m[1]));

    if (datePattern.test(line) && amounts.length >= 2) {
      const credit = isSalaryKeyword(line) || line.toLowerCase().includes("cr") ? amounts[0] : 0;
      const debit = isEMIKeyword(line) ? amounts[0] : 0;
      const balance = amounts[amounts.length - 1];

      if (balance > 0) monthlyBalances.push(balance);

      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        const parts = dateMatch[0].split(/[\/\-]/);
        const monthKey = `${parts[1]}-${parts[2] ?? parts[1]}`;
        monthlyCredits[monthKey] = (monthlyCredits[monthKey] ?? 0) + credit;
      }

      if (isSalaryKeyword(line) && credit > 5000) salaryCredits++;

      transactions.push({ date: dateMatch?.[0] ?? "", description: line, debit, credit, balance });
    }
  }

  // Derive metrics
  const creditValues = Object.values(monthlyCredits).filter((v) => v > 0);
  const avgMonthlyIncome = creditValues.length > 0
    ? Math.round(creditValues.reduce((a, b) => a + b, 0) / creditValues.length)
    : 0;

  const avgMonthlyBalance = monthlyBalances.length > 0
    ? Math.round(monthlyBalances.reduce((a, b) => a + b, 0) / monthlyBalances.length)
    : 0;

  const emiDebits = transactions.filter((t) => isEMIKeyword(t.description));
  const totalObligations = emiDebits.length > 0
    ? Math.round(emiDebits.reduce((a, t) => a + t.debit, 0) / Math.max(creditValues.length, 1))
    : 0;

  const foir = avgMonthlyIncome > 0 ? totalObligations / avgMonthlyIncome : 0;

  // Fallback: if PDF parsing yielded no data, use income declared by user (handled in calling code)
  return {
    avgMonthlyIncome,
    avgMonthlyBalance,
    totalObligations,
    foir: Math.min(foir, 0.95),
    bounceCount,
    salaryCredits,
    transactionCount: transactions.length,
  };
}

// Merge self-declared income when PDF parse yields nothing
export function mergeWithDeclared(
  parsed: StatementAnalysis,
  declaredIncome: number
): StatementAnalysis {
  if (parsed.avgMonthlyIncome > 0) return parsed;
  return {
    ...parsed,
    avgMonthlyIncome: declaredIncome,
    foir: parsed.totalObligations / declaredIncome,
  };
}
