export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFParseLib = { PDFParse: new (opts: Record<string, unknown>) => { getText(): Promise<{ text: string; total?: number }> } };

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const password = (form.get("password") as string | null) || undefined;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const lib = require("pdf-parse") as PDFParseLib;
    const parser = new lib.PDFParse({ data: new Uint8Array(buffer), ...(password ? { password } : {}) });
    const result = await parser.getText();
    const text = result.text ?? "";
    const numpages = result.total ?? 0;

    return NextResponse.json({
      pages: numpages,
      textLength: text.length,
      preview: text.slice(0, 4000),
      lines: text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 100),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
