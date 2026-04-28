import Link from "next/link";
import { Zap, Shield, Building2, Lock, Star, ChevronRight } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "60 Seconds", desc: "Turant eligibility report milti hai" },
  { icon: Shield, title: "Zero CIBIL Impact", desc: "Soft check — aapka score safe rehta hai" },
  { icon: Building2, title: "8 Real Banks", desc: "SBI, HDFC, ICICI, Axis, PNB aur aur bhi" },
  { icon: Lock, title: "100% Private", desc: "Statement kabhi aapke device se bahar nahi jaata" },
];

const TESTIMONIALS = [
  {
    name: "Rahul S., Mumbai",
    text: "InstantLoan ke baad HDFC mein pehli baar mein hi apply kiya. ₹4 lakh personal loan 2 din mein approved!",
    stars: 5,
  },
  {
    name: "Priya M., Bangalore",
    text: "Freelancer hoon toh socha koi bank approve nahi karega. InstantLoan ne bataya ki PNB karega — hua bhi!",
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
          Aaj ₹99 do.<br />
          <span className="text-blue-600">Kal lakhs bachao.</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Galat bank mein apply karne se 40 CIBIL points girte hain. Pehle eligibility check karo — sirf wahan apply karo jahan approval pakka ho.
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-center">
        <p className="text-3xl font-medium text-blue-700">10,000+</p>
        <p className="text-sm text-blue-600 mt-1">loan applications poore India mein matched</p>
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
          Eligibility Check Karo — ₹99 <ChevronRight size={20} />
        </Link>
        <p className="text-center text-xs text-gray-400 mt-2">
          Koi app install nahi · 100% private · Zero CIBIL impact
        </p>
      </div>
    </div>
  );
}
