"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Shield, Zap, Smartphone, Lock, ChevronRight, Search, RotateCcw, Sparkles, BadgeCheck, Clock3 } from "lucide-react";

const LOGO_BASE = "https://raw.githubusercontent.com/praveenpuglia/indian-banks/master/assets/logos";
const BANKS_SCROLL = [
  { name: "SBI",   slug: "sbin", color: "#1E3A8A" }, { name: "HDFC",  slug: "hdfc", color: "#004C8F" },
  { name: "ICICI", slug: "icic", color: "#D97706" }, { name: "AXIS",  slug: "utib", color: "#7F1D1D" },
  { name: "PNB",   slug: "punb", color: "#1D4ED8" }, { name: "BOB",   slug: "barb", color: "#EA580C" },
  { name: "KMB",   slug: "kkbk", color: "#991B1B" }, { name: "IDFC",  slug: "idfb", color: "#9B2335" },
  { name: "IIB",   slug: "indb", color: "#1E3A8A" }, { name: "YES",   slug: "yesb", color: "#0F172A" },
  { name: "FED",   slug: "fdrl", color: "#0F766E" }, { name: "RBL",   slug: "ratn", color: "#059669" },
];

const FEATURE_ICONS = [
  { icon: Shield,     bg: "bg-blue-900",    lk: "feat1" as const, dk: "feat1d" as const },
  { icon: Zap,        bg: "bg-amber-500",   lk: "feat2" as const, dk: "feat2d" as const },
  { icon: Smartphone, bg: "bg-emerald-700", lk: "feat3" as const, dk: "feat3d" as const },
  { icon: Lock,       bg: "bg-blue-800",    lk: "feat4" as const, dk: "feat4d" as const },
];

const RESUME_ROUTES: Record<number, string> = {
  1: "/details", 2: "/loan-requirement", 3: "/upload", 4: "/payment", 5: "/results",
};

export default function Landing() {
  const router = useRouter();
  const { userDetails, otpVerified, lastRoute, loanRequirement, step, resetSession, lang } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hasSession = mounted && otpVerified && !!userDetails.mobile;
  const resumeRoute = lastRoute || RESUME_ROUTES[step] || "/details";

  return (
    <div className="min-h-dvh bg-slate-50">

      {/* ── HERO ───────────────────────────────── */}
      <div className="hero-bg text-white px-5 pt-8 pb-10">
        <div className="w-full max-w-md mx-auto">

          {/* Nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg"
                style={{ background: "#0F2554" }}>₹</div>
              <div>
                <p className="text-white font-semibold text-lg leading-none">InstantLoan</p>
                <p className="text-white/50 text-xs">Loan Eligibility Checker</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/status"
                className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl text-white/90 border border-white/20"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <Search size={13} /> Track
              </Link>
            </div>
          </div>

          {/* Resume Banner */}
          {hasSession && (
            <div className="mb-6 rounded-2xl p-4 border border-white/20" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t(lang, "welcomeBack")}, {userDetails.name?.split(" ")[0] || "User"}! 👋</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {loanRequirement.loanType ? `${loanRequirement.loanType} loan check in progress` : "Your session is saved"}
                  </p>
                </div>
                <button onClick={resetSession} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <RotateCcw size={14} className="text-white/70" />
                </button>
              </div>
              <button onClick={() => router.push(resumeRoute)}
                className="mt-3 w-full bg-white text-blue-900 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5">
                <ChevronRight size={15} /> {t(lang, "ctaResume")}
              </button>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/20"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <Sparkles size={11} className="text-yellow-400" />
            {t(lang, "heroBadge")}
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] font-semibold leading-[1.1] mb-3">
            {t(lang, "heroHeading").split("\n")[0]}<br />
            <span className="gradient-text">{t(lang, "heroHeading").split("\n")[1] ?? ""}</span>
          </h1>
          <p className="text-white/65 text-sm leading-relaxed mb-6">
            {t(lang, "heroSub")}
          </p>

          {/* Bank logos */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-0.5">
            {BANKS_SCROLL.map((b) => (
              <div key={b.name} className="flex-shrink-0 w-11 h-11 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center">
                <img src={`${LOGO_BASE}/${b.slug}/symbol.svg`} alt={b.name} style={{ width: 28, height: 28, objectFit: "contain" }}
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    (el.parentElement as HTMLElement).style.backgroundColor = b.color;
                    (el.parentElement as HTMLElement).innerHTML = `<span style="color:white;font-size:8px;font-weight:900;padding:2px">${b.name}</span>`;
                  }} />
              </div>
            ))}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white/50 text-xs font-medium border border-white/20"
              style={{ background: "rgba(255,255,255,0.08)" }}>+21</div>
          </div>

          {/* Price card */}
          <div className="rounded-2xl p-4 mb-5 border border-white/20" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium mb-1">{t(lang, "priceLabel")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold">₹99</span>
                  <span className="text-white/35 text-base line-through">₹499</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-emerald-400 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full mb-1">{t(lang, "priceOff")}</div>
                <p className="text-white/50 text-xs">{t(lang, "nonRefundable")}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button onClick={() => router.push("/details")}
            className="btn-gradient w-full text-white font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 mb-4">
            {t(lang, "ctaCheck")} <ChevronRight size={22} />
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 text-xs text-white/50">
            <span className="flex items-center gap-1"><BadgeCheck size={12} className="text-emerald-400" /> {t(lang, "trustSecure")}</span>
            <span className="flex items-center gap-1"><Clock3 size={12} className="text-blue-300" /> {t(lang, "trustSpeed")}</span>
            <span className="flex items-center gap-1"><Smartphone size={12} className="text-blue-300" /> {t(lang, "trustNoApp")}</span>
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-5 py-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">{t(lang, "whyTitle")}</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURE_ICONS.map((f) => (
            <div key={f.lk} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${f.bg}`}>
                <f.icon size={20} className="text-white" />
              </div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{t(lang, f.lk)}</p>
              <p className="text-xs text-gray-500 mt-1">{t(lang, f.dk)}</p>
            </div>
          ))}
        </div>

        {/* 33 Banks */}
        <div className="mt-5 rounded-2xl overflow-hidden shadow-sm">
          <div className="text-white text-center px-5 py-5" style={{ background: "#0F2554" }}>
            <p className="text-5xl font-semibold">33</p>
            <p className="text-blue-200 text-sm font-semibold mt-1">Scheduled Commercial Banks</p>
          </div>
          <div className="bg-white px-5 py-3.5 flex justify-around text-center border border-t-0 border-gray-100 rounded-b-2xl">
            {[["12", "Public Sector", "text-blue-700"], ["21", "Private Sector", "text-blue-900"], ["0", "NBFCs (Clean)", "text-emerald-600"]].map(([n, l, c]) => (
              <div key={l}>
                <p className={`text-xl font-semibold ${c}`}>{n}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-4">{t(lang, "howTitle")}</p>
          {([
            ["step1","step1d"], ["step2","step2d"], ["step3","step3d"], ["step4","step4d"],
          ] as const).map(([sk, skd], i) => (
            <div key={sk} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold"
                style={{ background: "#0F2554" }}>{i + 1}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t(lang, sk)}</p>
                <p className="text-xs text-gray-500">{t(lang, skd)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-5 w-full max-w-md mx-auto">
        <div className="flex justify-center gap-5 flex-wrap text-xs text-gray-400 mb-2">
          {[["About","/about"],["FAQ","/faq"],["Terms","/terms"],["Privacy","/privacy"],["Admin","/admin"]].map(([l,h]) => (
            <Link key={l} href={h} className="hover:text-blue-800 transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-center text-xs text-gray-300">Only RBI Regulated Scheduled Commercial Banks · No NBFCs</p>
      </div>
    </div>
  );
}
