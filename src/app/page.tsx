"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Wallet, Home, Car, Building2, Coins, GraduationCap, Landmark, CreditCard, ChevronRight, Search, RotateCcw, Shield, BadgeCheck, Clock3, Zap } from "lucide-react";

const LOAN_PRODUCTS = [
  { id: "personal",  label: "Personal",   sub: "No collateral needed",  icon: Wallet,        color: "#0a3d2e", bg: "#dfe7e1" },
  { id: "home",      label: "Home",        sub: "Buy or construct home", icon: Home,          color: "#1e7a4f", bg: "#d1f0e0" },
  { id: "auto",      label: "Vehicle",     sub: "Car or bike loan",      icon: Car,           color: "#c8902a", bg: "#f4ead4" },
  { id: "business",  label: "Business",    sub: "MSME & sole traders",   icon: Building2,     color: "#a83a26", bg: "#f4dbd8" },
  { id: "gold",      label: "Gold",        sub: "Loan against gold",     icon: Coins,         color: "#d4a14a", bg: "#f4ead4" },
  { id: "education", label: "Education",   sub: "India & abroad",        icon: GraduationCap, color: "#1a5540", bg: "#dfe7e1" },
  { id: "lap",       label: "LAP",         sub: "Loan against property", icon: Landmark,      color: "#0a3d2e", bg: "#dfe7e1" },
];

const RESUME_ROUTES: Record<number, string> = {
  1: "/details", 2: "/loan-requirement", 3: "/upload", 4: "/payment", 5: "/results",
};

export default function Landing() {
  const router = useRouter();
  const { userDetails, otpVerified, lastRoute, loanRequirement, step, resetSession, lang } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const hasSession = mounted && otpVerified && !!userDetails.mobile;
  const resumeRoute = lastRoute || RESUME_ROUTES[step] || "/details";

  function handleStart() {
    router.push("/details");
  }

  return (
    <div className="min-h-dvh flex flex-col w-full max-w-md mx-auto" style={{ background: "var(--bg)" }}>

      {/* ── NAV ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="postmoney" style={{ height: 28, width: "auto" }} />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/status"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink-soft)", fontSize: 10 }}>
            <Search size={10} /> Track
          </Link>
        </div>
      </div>

      {/* ── RESUME BANNER ── */}
      {hasSession && (
        <div className="mx-5 mb-4 rounded-2xl p-3.5 border" style={{ background: "var(--brand-soft)", borderColor: "var(--brand)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: "var(--brand)", fontSize: 12 }}>
                Welcome back, {userDetails.name?.split(" ")[0] || "there"} 👋
              </p>
              <p style={{ color: "var(--ink-muted)", fontSize: 10, marginTop: 2 }}>
                {loanRequirement.loanType ? `${loanRequirement.loanType} loan in progress` : "Your session is saved"}
              </p>
            </div>
            <button onClick={resetSession} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--line)" }}>
              <RotateCcw size={12} style={{ color: "var(--ink-soft)" }} />
            </button>
          </div>
          <button onClick={() => router.push(resumeRoute)}
            className="mt-2.5 w-full py-2 rounded-xl flex items-center justify-center gap-1 font-semibold"
            style={{ background: "var(--brand)", color: "#fff", fontSize: 11 }}>
            <ChevronRight size={13} /> Continue where you left off
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="px-5 mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 border" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--warn)", fontSize: 9, fontWeight: 600, letterSpacing: "0.05em" }}>
          <Zap size={9} /> 90-SECOND CHECK · ZERO CIBIL IMPACT
        </div>
        <h1 style={{ fontSize: 32, lineHeight: 1.1, color: "var(--ink)", marginBottom: 8, fontWeight: 600 }}>
          What are we<br />
          <em style={{ color: "var(--brand)" }}>borrowing for?</em>
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 11, lineHeight: 1.6 }}>
          A 90-second eligibility check across 33 RBI-regulated banks — no impact on your CIBIL score.
        </p>
      </div>

      {/* ── LOAN TYPE PICKER ── */}
      <div className="px-5 flex-1">
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {LOAN_PRODUCTS.map((p, idx) => {
            const active = selected === p.id;
            const isLastOdd = idx === LOAN_PRODUCTS.length - 1 && LOAN_PRODUCTS.length % 2 !== 0;
            const Icon = p.icon;
            return (
              <button key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-1.5 ${isLastOdd ? "col-span-2" : ""}`}
                style={{
                  background: active ? p.color : "var(--surface)",
                  borderColor: active ? p.color : "var(--line)",
                  color: active ? "#fff" : "var(--ink)",
                }}>
                <div style={{ color: active ? "var(--accent)" : p.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{p.label}</div>
                <div style={{ fontSize: 9.5, color: active ? "rgba(255,255,255,0.7)" : "var(--ink-muted)", lineHeight: 1.4 }}>{p.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Price pill */}
        <div className="rounded-2xl p-4 mb-4 border text-center" style={{ background: "var(--bg-deep)", borderColor: "var(--line)" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>One-time AI report</p>
          <div className="flex items-baseline justify-center gap-2 mt-1">
            <span style={{ fontSize: 36, color: "var(--brand)", fontWeight: 600 }}>₹99</span>
            <span style={{ color: "var(--ink-muted)", fontSize: 14, textDecoration: "line-through" }}>₹499</span>
            <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--accent-soft)", color: "var(--warn)", fontSize: 9 }}>80% OFF</span>
          </div>
          <p style={{ color: "var(--ink-muted)", fontSize: 9, marginTop: 4 }}>Non-refundable · Instant delivery</p>
          <Link href="/sample-report"
            className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full border"
            style={{ background: "var(--surface)", borderColor: "var(--brand)", color: "var(--brand)", fontSize: 9, fontWeight: 600 }}>
            <span>▶</span> See Sample AI Report
          </Link>
        </div>

        {/* CTA */}
        <button onClick={handleStart}
          className="btn-gradient w-full text-white font-semibold rounded-2xl flex items-center justify-center gap-2 mb-3"
          style={{ height: 52, fontSize: 14 }}>
          {t(lang, "ctaCheck")} <ChevronRight size={18} />
        </button>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-4 mb-6" style={{ fontSize: 9, color: "var(--ink-muted)" }}>
          <span className="flex items-center gap-1"><BadgeCheck size={10} style={{ color: "var(--success)" }} /> RBI Regulated</span>
          <span className="flex items-center gap-1"><Clock3 size={10} style={{ color: "var(--brand)" }} /> 90 seconds</span>
          <span className="flex items-center gap-1"><Shield size={10} style={{ color: "var(--brand)" }} /> DPDP compliant</span>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-4 mb-5 border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>How it works</p>
          {[
            ["Enter your details", "Mobile, PAN, income, loan amount"],
            ["We match 33 banks", "AI finds your best eligible offers"],
            ["Get your report", "₹99 one-time · instant results"],
            ["Apply with confidence", "Only where approval is certain"],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold"
                style={{ background: "var(--brand)", fontSize: 9 }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)" }}>{title}</p>
                <p style={{ fontSize: 9.5, color: "var(--ink-muted)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex justify-center gap-3 flex-wrap mb-2" style={{ fontSize: 9, color: "var(--ink-muted)" }}>
          {[["About", "/about"], ["FAQ", "/faq"], ["Terms", "/terms"], ["Privacy", "/privacy"], ["Refund Policy", "/refund"], ["Contact", "/contact"], ["Admin", "/admin"]].map(([l, h]) => (
            <Link key={l} href={h} className="hover:underline">{l}</Link>
          ))}
        </div>
        <p className="text-center mb-1" style={{ fontSize: 9, color: "var(--ink-muted)" }}>Only RBI Regulated Scheduled Commercial Banks · No NBFCs</p>
        <p className="text-center" style={{ fontSize: 8, color: "var(--ink-muted)" }}>POSTMAC VENTURES PRIVATE LIMITED · CIN U66190HR2025PTC129138</p>
      </div>
    </div>
  );
}
