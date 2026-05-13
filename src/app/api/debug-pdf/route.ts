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
import { createRequire } from "module";

// Use createRequire to bypass turbopack's require() interception
const nativeRequire = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFParseLib = { PDFParse: new (opts: Record<string, unknown>) => { getText(): Promise<{ text: string; total?: number }> } };

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const password = (form.get("password") as string | null) || undefined;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const lib = nativeRequire("pdf-parse") as PDFParseLib;
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
