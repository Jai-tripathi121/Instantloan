import Link from "next/link";
import { Zap, Shield, Building2, Lock, Star, ChevronRight } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "60 Seconds", desc: "Instant eligibility report" },
  { icon: Shield, title: "Zero CIBIL Impact", desc: "Soft check — your score stays safe" },
  { icon: Building2, title: "33 Real Banks", desc: "SBI, HDFC, ICICI, Axis, PNB and more" },
  { icon: Lock, title: "100% Private", desc: "Statement never leaves your device" },
];

const TESTIMONIALS = [
  {
    name: "Rahul S., Mumbai",
    text: "Applied to HDFC on the first try after using InstantLoan. ₹4 lakh personal loan approved in 2 days!",
    stars: 5,
  },
  {
    name: "Priya M., Bangalore",
    text: "As a freelancer I thought no bank would approve me. InstantLoan showed PNB would — and it did!",
    stars: 5,
  },
];

export default function Campaign() {
  return (
    <div className="min-h-dvh flex flex-col w-full max-w-md mx-auto px-5 py-8 bg-white">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-medium text-lg">₹</span>
        </div>
        <span className="text-xl font-medium text-gray-900">InstantLoan</span>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-medium text-gray-900 leading-tight mb-3">
          Pay ₹99 today.<br />
          <span className="text-blue-600">Save lakhs tomorrow.</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Applying to the wrong bank drops your CIBIL by 40 points. Check eligibility first — apply only where approval is certain.
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-center">
        <p className="text-3xl font-medium text-blue-700">10,000+</p>
        <p className="text-sm text-blue-600 mt-1">loan applications matched across India</p>
      </div>

      <div className="space-y-3 mb-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-4 bg-slate-50 rounded-2xl px-4 py-3.5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <f.icon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-gray-700 italic mb-2">&ldquo;{t.text}&rdquo;</p>
            <p className="text-xs text-gray-400 font-medium">— {t.name}</p>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4">
        <Link
          href="/?utm_source=campaign"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-medium py-4 rounded-2xl text-lg shadow-lg shadow-blue-200"
        >
          Check Eligibility — ₹99 <ChevronRight size={20} />
        </Link>
        <p className="text-center text-xs text-gray-400 mt-2">
          No app install · 100% private · Zero CIBIL impact
        </p>
      </div>
    </div>
  );
}
