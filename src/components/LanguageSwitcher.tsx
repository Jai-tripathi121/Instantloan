"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { LANGUAGES, type LangCode } from "@/lib/i18n";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang } = useAppStore();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  function pick(code: LangCode) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-white/20 text-white/90"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <Globe size={13} />
        <span>{current.native}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-52">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bhasha Chunein</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => pick(l.code)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-violet-50 transition-colors ${lang === l.code ? "bg-violet-50" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{l.flag}</span>
                    <div>
                      <p className={`text-sm font-medium leading-none ${lang === l.code ? "text-violet-700" : "text-gray-800"}`}>{l.native}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.name}</p>
                    </div>
                  </div>
                  {lang === l.code && <Check size={14} className="text-violet-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
