/**
 * Polyfills for browser APIs needed by pdf-parse (pdfjs-dist) in Node.js.
 * Import this at the top of any server-side route that uses pdf-parse.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  class DOMMatrixPolyfill {
    a=1; b=0; c=0; d=1; e=0; f=0;
    m11=1; m12=0; m13=0; m14=0;
    m21=0; m22=1; m23=0; m24=0;
    m31=0; m32=0; m33=1; m34=0;
    m41=0; m42=0; m43=0; m44=1;
    is2D=true; isIdentity=true;

    constructor(_init?: string | number[]) {}

    static fromMatrix(_o?: unknown) { return new DOMMatrixPolyfill(); }
    static fromFloat32Array(_a: Float32Array) { return new DOMMatrixPolyfill(); }
    static fromFloat64Array(_a: Float64Array) { return new DOMMatrixPolyfill(); }

    multiply(_o?: unknown)                         { return new DOMMatrixPolyfill(); }
    translate(tx=0, ty=0, _tz=0)                   { const m=new DOMMatrixPolyfill(); m.e=tx; m.f=ty; return m; }
    scale(sx=1, sy=1, _sz=1, _ox=0, _oy=0, _oz=0) { const m=new DOMMatrixPolyfill(); m.a=sx; m.d=sy; return m; }
    scale3d(_s=1, _ox=0, _oy=0, _oz=0)            { return new DOMMatrixPolyfill(); }
    scaleNonUniform(sx=1, sy=1)                    { const m=new DOMMatrixPolyfill(); m.a=sx; m.d=sy; return m; }
    rotate(_rx=0, _ry=0, _rz=0)                    { return new DOMMatrixPolyfill(); }
    rotateAxisAngle(_x=0,_y=0,_z=0,_a=0)           { return new DOMMatrixPolyfill(); }
    rotateFromVector(_x=0, _y=0)                   { return new DOMMatrixPolyfill(); }
    skewX(_a=0)                                    { return new DOMMatrixPolyfill(); }
    skewY(_a=0)                                    { return new DOMMatrixPolyfill(); }
    inverse()                                      { return new DOMMatrixPolyfill(); }
    flipX()                                        { return new DOMMatrixPolyfill(); }
    flipY()                                        { return new DOMMatrixPolyfill(); }

    transformPoint(p?: {x?: number; y?: number}) {
      return { x: (p?.x ?? 0) * this.a + this.e, y: (p?.y ?? 0) * this.d + this.f, z: 0, w: 1 };
    }

    toFloat32Array() { return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); }
    toFloat64Array() { return new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); }
    toString()       { return "matrix(1, 0, 0, 1, 0, 0)"; }
    toJSON()         { return {}; }

    invertSelf()           { return this; }
    multiplySelf()         { return this; }
    preMultiplySelf()      { return this; }
    translateSelf(tx=0, ty=0, _tz=0) { this.e+=tx; this.f+=ty; return this; }
    scaleSelf(sx=1, sy=1)  { this.a*=sx; this.d*=sy; return this; }
    scale3dSelf()          { return this; }
    rotateSelf()           { return this; }
    rotateFromVectorSelf() { return this; }
    rotateAxisAngleSelf()  { return this; }
    skewXSelf()            { return this; }
    skewYSelf()            { return this; }
    setMatrixValue(_t: string) { return this; }
  }

  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}
