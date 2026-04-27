"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
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

const FEATURES = [
  { icon: Shield,      label: "Zero CIBIL Impact",  desc: "Soft check only — score safe",    grad: "from-violet-500 to-violet-600" },
  { icon: Zap,         label: "Result in 60 Sec",   desc: "AI eligibility turant milti hai", grad: "from-amber-400 to-orange-500"  },
  { icon: Smartphone,  label: "No App Chahiye",      desc: "Seedha browser se karo",          grad: "from-emerald-500 to-teal-500"  },
  { icon: Lock,        label: "100% Private",        desc: "Data sirf aapke phone pe",        grad: "from-pink-500 to-rose-500"     },
];

const RESUME_ROUTES: Record<number, string> = {
  1: "/details", 2: "/loan-requirement", 3: "/upload", 4: "/payment", 5: "/results",
};

export default function Landing() {
  const router = useRouter();
  const { userDetails, otpVerified, lastRoute, loanRequirement, step, resetSession } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hasSession = mounted && otpVerified && !!userDetails.mobile;
  const resumeRoute = lastRoute || RESUME_ROUTES[step] || "/details";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ───────────────────────────────── */}
      <div className="hero-bg text-white px-5 pt-8 pb-10">
        <div className="max-w-md mx-auto">

          {/* Nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>₹</div>
              <div>
                <p className="text-white font-black text-lg leading-none">InstantLoan</p>
                <p className="text-white/50 text-xs">Loan Eligibility Checker</p>
              </div>
            </div>
            <Link href="/status"
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white/90 border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <Search size={13} /> Track
            </Link>
          </div>

          {/* Resume Banner */}
          {hasSession && (
            <div className="mb-6 rounded-2xl p-4 border border-white/20" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black">Welcome back, {userDetails.name?.split(" ")[0] || "User"}! 👋</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {loanRequirement.loanType ? `${loanRequirement.loanType} loan check adhoori hai` : "Aapka session saved hai"}
                  </p>
                </div>
                <button onClick={resetSession} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <RotateCcw size={14} className="text-white/70" />
                </button>
              </div>
              <button onClick={() => router.push(resumeRoute)}
                className="mt-3 w-full bg-white text-violet-700 font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5">
                <ChevronRight size={15} /> Wahan se shuru karo jahan chhoda tha
              </button>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/20"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <Sparkles size={11} className="text-yellow-400" />
            33 Banks · AI Powered · Zero CIBIL Impact
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] font-black leading-[1.1] mb-3">
            Loan Milega?<br />
            <span className="gradient-text">2 min mein pata karo!</span>
          </h1>
          <p className="text-white/65 text-sm leading-relaxed mb-6">
            AI aapka bank statement locally analyse karta hai. 33 banks mein match hoti hai. Aapka koi data server pe nahi jata.
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
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white/50 text-xs font-bold border border-white/20"
              style={{ background: "rgba(255,255,255,0.08)" }}>+21</div>
          </div>

          {/* Price card */}
          <div className="rounded-2xl p-4 mb-5 border border-white/20" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium mb-1">AI Eligibility Report</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">₹99</span>
                  <span className="text-white/35 text-base line-through">₹499</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-emerald-400 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-full mb-1">80% OFF</div>
                <p className="text-white/50 text-xs">One-time · Non-refundable</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button onClick={() => router.push(hasSession ? "/details" : "/details")}
            className="btn-gradient w-full text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-2 mb-4">
            {hasSession ? "Naya Check Karo" : "Abhi Check Karo"} <ChevronRight size={22} />
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 text-xs text-white/50">
            <span className="flex items-center gap-1"><BadgeCheck size={12} className="text-emerald-400" /> Secure</span>
            <span className="flex items-center gap-1"><Clock3 size={12} className="text-blue-300" /> 2 min result</span>
            <span className="flex items-center gap-1"><Smartphone size={12} className="text-violet-300" /> No app</span>
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────── */}
      <div className="max-w-md mx-auto px-5 py-8">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-5">Kyun InstantLoan?</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${f.grad}`}>
                <f.icon size={20} className="text-white" />
              </div>
              <p className="font-black text-gray-900 text-sm leading-tight">{f.label}</p>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* 33 Banks */}
        <div className="mt-5 rounded-2xl overflow-hidden shadow-sm">
          <div className="text-white text-center px-5 py-5" style={{ background: "linear-gradient(135deg, #6d28d9, #4338ca)" }}>
            <p className="text-5xl font-black">33</p>
            <p className="text-violet-200 text-sm font-semibold mt-1">Scheduled Commercial Banks</p>
          </div>
          <div className="bg-white px-5 py-3.5 flex justify-around text-center border border-t-0 border-gray-100 rounded-b-2xl">
            {[["12", "Public Sector", "text-blue-700"], ["21", "Private Sector", "text-violet-700"], ["0", "NBFCs (Clean)", "text-emerald-600"]].map(([n, l, c]) => (
              <div key={l}>
                <p className={`text-xl font-black ${c}`}>{n}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-black text-gray-800 mb-4">Kaise Kaam Karta Hai?</p>
          {[
            ["1", "Details bharein", "Naam, PAN, income — 1 min mein"],
            ["2", "Statement upload karein", "AI locally analyse karta hai — data safe"],
            ["3", "Banks match hongi", "Best offers instant milenge"],
            ["4", "Apply karein", "Sirf approve hone par hard inquiry"],
          ].map(([num, title, desc]) => (
            <div key={num} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4338ca)" }}>{num}</div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-5 max-w-md mx-auto">
        <div className="flex justify-center gap-5 flex-wrap text-xs text-gray-400 mb-2">
          {[["About","/about"],["FAQ","/faq"],["Terms","/terms"],["Privacy","/privacy"],["Admin","/admin"]].map(([l,h]) => (
            <Link key={l} href={h} className="hover:text-violet-600 transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-center text-xs text-gray-300">Only RBI Regulated Scheduled Commercial Banks · No NBFCs</p>
      </div>
    </div>
  );
}
