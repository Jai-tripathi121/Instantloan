"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useMemo } from "react";
import { getAllApplications, updateApplicationStatus, LoanApplication, BankConfig, GlobalSettings, getAllBankConfigs, saveBankConfig, getGlobalSettings, saveGlobalSettings } from "@/lib/firestore";
import { DEFAULT_BANKS, BankCriteria } from "@/lib/bank-data";
import BankLogo from "@/components/BankLogo";
import {
  LayoutDashboard, Users, IndianRupee, TrendingUp, RefreshCw, Search,
  ChevronDown, X, CheckCircle, Clock, FileText, XCircle, Banknote,
  Eye, BarChart2, Download, Lock, Shield, Building2, Edit3, Save, ToggleLeft, ToggleRight, Sparkles
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  submitted:    { label: "Submitted",    color: "text-blue-700",   bg: "bg-blue-100",   dot: "bg-blue-500" },
  under_review: { label: "Under Review", color: "text-amber-700",  bg: "bg-amber-100",  dot: "bg-amber-500" },
  approved:     { label: "Approved",     color: "text-emerald-700",bg: "bg-emerald-100",dot: "bg-emerald-500" },
  rejected:     { label: "Rejected",     color: "text-red-700",    bg: "bg-red-100",    dot: "bg-red-500" },
  disbursed:    { label: "Disbursed",    color: "text-blue-900", bg: "bg-blue-100", dot: "bg-blue-700" },
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  submitted: FileText, under_review: Clock, approved: CheckCircle, rejected: XCircle, disbursed: Banknote,
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  const Icon = STATUS_ICONS[status] ?? FileText;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

type Tab = "applications" | "analytics" | "banks";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LoanApplication | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("applications");

  // Bank management
  const [bankConfigs, setBankConfigs] = useState<Record<string, BankConfig>>({});
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BankConfig>>({});
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  // Global settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({});
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [globalEdit, setGlobalEdit] = useState<GlobalSettings>({});
  const [savingGlobal, setSavingGlobal] = useState(false);

  const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "instantloan@2026";
  const firebaseReady = !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "placeholder");

  async function load() {
    setLoading(true);
    try { setApps(await getAllApplications()); } catch { } finally { setLoading(false); }
  }

  async function loadBankConfigs() {
    try { setBankConfigs(await getAllBankConfigs()); } catch { }
  }

  async function loadGlobalSettings() {
    try { setGlobalSettings(await getGlobalSettings()); } catch { }
  }

  async function saveGlobal() {
    setSavingGlobal(true);
    try { await saveGlobalSettings(globalEdit); setGlobalSettings(globalEdit); setEditingGlobal(false); } catch { }
    setSavingGlobal(false);
  }

  function handleLogin() {
    if (password === ADMIN_PASS) { setAuthed(true); load(); loadBankConfigs(); loadGlobalSettings(); }
    else { setPassword(""); alert("Incorrect password"); }
  }

  async function handleStatusChange(id: string, status: LoanApplication["status"]) {
    await updateApplicationStatus(id, status);
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
  }

  function getBankEffective(bank: BankCriteria): BankCriteria & { active: boolean } {
    const cfg = bankConfigs[bank.id];
    if (!cfg) return { ...bank, active: bank.active };
    return {
      ...bank,
      ...(cfg.minIncome !== undefined ? { minIncome: cfg.minIncome } : {}),
      ...(cfg.maxFoir !== undefined ? { maxFoir: cfg.maxFoir } : {}),
      ...(cfg.minCibil !== undefined ? { minCibil: cfg.minCibil } : {}),
      ...(cfg.minCibilSalaried !== undefined ? { minCibilSalaried: cfg.minCibilSalaried } : {}),
      ...(cfg.minCibilSelfEmployed !== undefined ? { minCibilSelfEmployed: cfg.minCibilSelfEmployed } : {}),
      ...(cfg.minCibilBusiness !== undefined ? { minCibilBusiness: cfg.minCibilBusiness } : {}),
      ...(cfg.allowedEmploymentTypes !== undefined ? { allowedEmploymentTypes: cfg.allowedEmploymentTypes } : {}),
      ...(cfg.processingFeePercent !== undefined ? { processingFeePercent: cfg.processingFeePercent } : {}),
      interestRate: cfg.interestRate ? {
        personal: cfg.interestRate.personal ?? bank.interestRate.personal,
        home: cfg.interestRate.home ?? bank.interestRate.home,
        auto: cfg.interestRate.auto ?? bank.interestRate.auto,
        business: cfg.interestRate.business ?? bank.interestRate.business,
        gold: cfg.interestRate.gold ?? bank.interestRate.gold,
        education: cfg.interestRate.education ?? bank.interestRate.education,
        lap: cfg.interestRate.lap ?? bank.interestRate.lap,
      } : bank.interestRate,
      active: cfg.active ?? bank.active,
    };
  }

  async function toggleBank(bankId: string, currentActive: boolean) {
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)!;
    const existing = bankConfigs[bankId] ?? {};
    const cfg: BankConfig = { ...existing, bankId, bankName: bank.bankName, active: !currentActive };
    await saveBankConfig(cfg).catch(() => {});
    setBankConfigs((prev) => ({ ...prev, [bankId]: cfg }));
  }

  async function saveEdit(bankId: string) {
    setBankSaving(true);
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)!;
    const existing = bankConfigs[bankId] ?? { bankId, bankName: bank.bankName, active: true };
    const cfg: BankConfig = { ...existing, ...editValues };
    await saveBankConfig(cfg).catch(() => {});
    setBankConfigs((prev) => ({ ...prev, [bankId]: cfg }));
    setEditingBank(null); setEditValues({});
    setBankSaving(false);
  }

  const filtered = useMemo(() => {
    let list = filter === "all" ? apps : apps.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name?.toLowerCase().includes(q) || a.mobile?.includes(q) || a.referenceNo?.toLowerCase().includes(q) || a.bankName?.toLowerCase().includes(q));
    }
    return list;
  }, [apps, filter, search]);

  const stats = useMemo(() => {
    const total = apps.length;
    const approved = apps.filter((a) => ["approved", "disbursed"].includes(a.status)).length;
    const disbursed = apps.filter((a) => a.status === "disbursed").length;
    const revenue = total * 99;
    const totalDisbursed = apps.filter((a) => a.status === "disbursed").reduce((s, a) => s + (a.approvedAmount ?? 0), 0);
    const byStatus = Object.keys(STATUS_CONFIG).map((k) => ({ key: k, count: apps.filter((a) => a.status === k).length }));
    const byBank: Record<string, number> = {};
    apps.forEach((a) => { byBank[a.bankName] = (byBank[a.bankName] ?? 0) + 1; });
    return { total, approved, disbursed, revenue, totalDisbursed, byStatus, byBank };
  }, [apps]);

  function exportCSV() {
    const header = ["Ref No", "Name", "Mobile", "Bank", "Loan Type", "Amount", "Rate", "EMI", "Status"].join(",");
    const rows = apps.map((a) => [a.referenceNo, a.name, a.mobile, a.bankName, a.loanType, a.approvedAmount, a.interestRate, a.emi, a.status].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `instantloan_${Date.now()}.csv`; link.click();
    URL.revokeObjectURL(url);
  }

  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return DEFAULT_BANKS;
    const q = bankSearch.toLowerCase();
    return DEFAULT_BANKS.filter((b) => b.bankName.toLowerCase().includes(q) || b.shortName.toLowerCase().includes(q));
  }, [bankSearch]);

  const activeCount = DEFAULT_BANKS.filter((b) => getBankEffective(b).active).length;

  // ─── Login ────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-5" style={{ background: "#0A1628" }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 btn-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-1">InstantLoan Dashboard</p>
          </div>
          <div className="relative mb-4">
            <input type={showPass ? "text" : "password"} placeholder="Admin password" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-400 pr-12" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Eye size={18} /></button>
          </div>
          <button onClick={handleLogin} className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
            <Lock size={16} /> Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">₹</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-sm">InstantLoan Admin</span>
            <span className="text-xs text-gray-400 ml-2">{apps.length} applications</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-all">
            <Download size={13} /> Export
          </button>
          <button onClick={() => { load(); loadBankConfigs(); loadGlobalSettings(); }} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {!firebaseReady && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          <p className="text-xs text-amber-800 font-medium">Firebase not connected — add env vars to see live data</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 py-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 p-1 rounded-xl w-fit mb-5 shadow-sm">
          {([
            { key: "applications", label: "Applications", icon: Users },
            { key: "analytics", label: "Analytics", icon: BarChart2 },
            { key: "banks", label: `Banks (${activeCount}/33)`, icon: Building2 },
          ] as { key: Tab; label: string; icon: typeof Users }[]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "btn-gradient text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { icon: Users, label: "Total Applications", val: stats.total, color: "bg-blue-700" },
            { icon: IndianRupee, label: "Revenue Earned", val: `₹${stats.revenue.toLocaleString("en-IN")}`, color: "bg-emerald-600" },
            { icon: CheckCircle, label: "Approved", val: stats.approved, color: "bg-blue-900" },
            { icon: Banknote, label: "Disbursed", val: `₹${(stats.totalDisbursed / 100000).toFixed(1)}L`, color: "bg-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ─── ANALYTICS TAB ─── */}
        {tab === "analytics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-800" />
                <h3 className="font-semibold text-gray-900 text-sm">Status Breakdown</h3>
              </div>
              <div className="space-y-3">
                {stats.byStatus.map((s) => {
                  const cfg = STATUS_CONFIG[s.key];
                  const pct = stats.total ? Math.round((s.count / stats.total) * 100) : 0;
                  return (
                    <div key={s.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{cfg.label}</span>
                        <span className="text-gray-500">{s.count} ({pct}%)</span>
                      </div>
                      <MiniBar pct={pct} color={cfg.dot} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-blue-800" />
                <h3 className="font-semibold text-gray-900 text-sm">Bank-wise Applications</h3>
              </div>
              {Object.keys(stats.byBank).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.byBank).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([bank, count]) => {
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={bank}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{bank}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <MiniBar pct={pct} color="bg-blue-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── BANKS TAB ─── */}
        {tab === "banks" && (
          <>
          {/* Global Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-800" />
                <h3 className="font-semibold text-gray-900">Global Eligibility Settings</h3>
                {globalSettings.platformActive === false && (
                  <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">Platform Off</span>
                )}
              </div>
              {!editingGlobal ? (
                <button onClick={() => { setGlobalEdit({ ...globalSettings }); setEditingGlobal(true); }}
                  className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-all">
                  <Edit3 size={12} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveGlobal} disabled={savingGlobal}
                    className="flex items-center gap-1.5 text-xs btn-gradient text-white px-3 py-1.5 rounded-lg font-medium">
                    <Save size={12} /> {savingGlobal ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingGlobal(false)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium">Cancel</button>
                </div>
              )}
            </div>
            {!editingGlobal ? (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ["Global FOIR Cap", globalSettings.globalFoirCap ? `${Math.round(globalSettings.globalFoirCap * 100)}%` : "Default (55%)"],
                  ["Income Mult. Salaried", globalSettings.incomeMultiplierSalaried != null ? `×${globalSettings.incomeMultiplierSalaried}` : "×1.00"],
                  ["Income Mult. Self-Emp", globalSettings.incomeMultiplierSelfEmployed != null ? `×${globalSettings.incomeMultiplierSelfEmployed}` : "×0.90"],
                  ["Income Mult. Business", globalSettings.incomeMultiplierBusiness != null ? `×${globalSettings.incomeMultiplierBusiness}` : "×0.85"],
                  ["Max Bounces (Strict)", globalSettings.maxBouncesStrict != null ? String(globalSettings.maxBouncesStrict) : "2"],
                  ["Max Bounces (All)", globalSettings.maxBouncesAll != null ? String(globalSettings.maxBouncesAll) : "4"],
                  ["Platform Active", globalSettings.platformActive === false ? "❌ Off" : "✅ On"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5 font-medium">{label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Global FOIR Cap (%)", val: globalEdit.globalFoirCap ? Math.round(globalEdit.globalFoirCap * 100) : "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, globalFoirCap: v ? Number(v) / 100 : undefined })) },
                    { label: "Income Mult. Salaried", val: globalEdit.incomeMultiplierSalaried ?? "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, incomeMultiplierSalaried: v ? Number(v) : undefined })) },
                    { label: "Income Mult. Self-Emp", val: globalEdit.incomeMultiplierSelfEmployed ?? "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, incomeMultiplierSelfEmployed: v ? Number(v) : undefined })) },
                    { label: "Income Mult. Business", val: globalEdit.incomeMultiplierBusiness ?? "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, incomeMultiplierBusiness: v ? Number(v) : undefined })) },
                    { label: "Max Bounces (Strict)", val: globalEdit.maxBouncesStrict ?? "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, maxBouncesStrict: v ? Number(v) : undefined })) },
                    { label: "Max Bounces (All Banks)", val: globalEdit.maxBouncesAll ?? "", onChange: (v: string) => setGlobalEdit((p) => ({ ...p, maxBouncesAll: v ? Number(v) : undefined })) },
                  ].map(({ label, val, onChange }) => (
                    <div key={label}>
                      <label className="text-xs text-gray-500 font-medium block mb-0.5">{label}</label>
                      <input type="number" step="0.01" value={val as number} onChange={(e) => onChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={globalEdit.platformActive !== false}
                    onChange={(e) => setGlobalEdit((p) => ({ ...p, platformActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-800" />
                  <span className="text-sm font-medium text-gray-700">Platform Active (uncheck to disable new applications)</span>
                </label>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-800" />
                <h3 className="font-semibold text-gray-900">Bank Management</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">{activeCount} Active</span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Bank search..." value={bankSearch} onChange={(e) => setBankSearch(e.target.value)}
                  className="border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-blue-400 w-44" />
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredBanks.map((bank) => {
                const eff = getBankEffective(bank);
                const isEditing = editingBank === bank.id;
                const cfg = bankConfigs[bank.id] ?? {};

                return (
                  <div key={bank.id} className={`p-4 transition-all ${!eff.active ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <BankLogo logoUrl={`https://raw.githubusercontent.com/praveenpuglia/indian-banks/master/assets/logos/${bank.logoSlug}/symbol.svg`} logo={bank.logo} color={bank.color} size={40} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm truncate">{bank.bankName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bank.sector === "public" ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-900"}`}>
                            {bank.sector === "public" ? "Govt" : "Pvt"}
                          </span>
                        </div>
                        {!isEditing && (
                          <p className="text-xs text-gray-400">
                            Min ₹{(eff.minIncome / 1000).toFixed(0)}K · FOIR {Math.round(eff.maxFoir * 100)}% · Personal {eff.interestRate.personal}%
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isEditing && (
                          <button onClick={() => { setEditingBank(bank.id); setEditValues({ minIncome: eff.minIncome, maxFoir: eff.maxFoir, processingFeePercent: eff.processingFeePercent, minCibilSalaried: (eff as BankCriteria & { minCibilSalaried?: number }).minCibilSalaried ?? bank.minCibil, minCibilSelfEmployed: (eff as BankCriteria & { minCibilSelfEmployed?: number }).minCibilSelfEmployed ?? bank.minCibil, minCibilBusiness: (eff as BankCriteria & { minCibilBusiness?: number }).minCibilBusiness ?? bank.minCibil, allowedEmploymentTypes: (eff as BankCriteria & { allowedEmploymentTypes?: string[] }).allowedEmploymentTypes ?? bank.allowedEmploymentTypes ?? ["salaried", "self-employed", "business"], interestRate: { personal: eff.interestRate.personal, home: eff.interestRate.home, auto: eff.interestRate.auto, business: eff.interestRate.business, gold: eff.interestRate.gold, education: eff.interestRate.education, lap: eff.interestRate.lap } }); }}
                            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all">
                            <Edit3 size={13} className="text-gray-500" />
                          </button>
                        )}
                        <button onClick={() => toggleBank(bank.id, eff.active)} className="flex-shrink-0">
                          {eff.active
                            ? <ToggleRight size={28} className="text-emerald-500" />
                            : <ToggleLeft size={28} className="text-gray-300" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Edit panel */}
                    {isEditing && (
                      <div className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> Edit {bank.bankName} Config
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { label: "Min Income (₹)", val: editValues.minIncome ?? "", onChange: (v: string) => setEditValues((p) => ({ ...p, minIncome: Number(v) })), step: "1" },
                            { label: "Max FOIR (%)", val: editValues.maxFoir ? Math.round(editValues.maxFoir * 100) : "", onChange: (v: string) => setEditValues((p) => ({ ...p, maxFoir: Number(v) / 100 })), step: "1" },
                            { label: "Processing Fee (%)", val: editValues.processingFeePercent ?? "", onChange: (v: string) => setEditValues((p) => ({ ...p, processingFeePercent: Number(v) })), step: "0.01" },
                          ].map(({ label, val, onChange, step }) => (
                            <div key={label}>
                              <label className="text-xs text-gray-500 font-medium block mb-0.5">{label}</label>
                              <input type="number" step={step} value={val as number} onChange={(e) => onChange(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                            </div>
                          ))}
                        </div>
                        {/* Employment Types */}
                        <p className="text-xs font-semibold text-blue-800 mb-1.5 mt-1">Allowed Employment Types</p>
                        <div className="flex gap-4 mb-2">
                          {(["salaried", "self-employed", "business"] as const).map((emp) => (
                            <label key={emp} className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox"
                                checked={(editValues.allowedEmploymentTypes ?? ["salaried", "self-employed", "business"]).includes(emp)}
                                onChange={(e) => {
                                  const cur = editValues.allowedEmploymentTypes ?? ["salaried", "self-employed", "business"];
                                  setEditValues((p) => ({ ...p, allowedEmploymentTypes: e.target.checked ? [...cur, emp] : cur.filter((x) => x !== emp) }));
                                }}
                                className="w-3.5 h-3.5 accent-blue-800" />
                              <span className="text-xs font-medium text-gray-700 capitalize">{emp}</span>
                            </label>
                          ))}
                        </div>

                        {/* Per-employment CIBIL */}
                        <p className="text-xs font-semibold text-blue-800 mb-1.5">Min CIBIL by Employment</p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {([
                            { label: "Salaried", key: "minCibilSalaried" as const },
                            { label: "Self-Emp", key: "minCibilSelfEmployed" as const },
                            { label: "Business", key: "minCibilBusiness" as const },
                          ]).map(({ label, key }) => (
                            <div key={key}>
                              <label className="text-xs text-gray-500 font-medium block mb-0.5">{label}</label>
                              <input type="number" step="1" value={editValues[key] ?? ""}
                                onChange={(e) => setEditValues((p) => ({ ...p, [key]: e.target.value ? Number(e.target.value) : undefined }))}
                                placeholder={String(bank.minCibil ?? 650)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                            </div>
                          ))}
                        </div>

                        <p className="text-xs font-semibold text-blue-800 mb-1.5 mt-1">Interest Rates (% p.a.)</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {(["personal", "home", "auto", "business", "gold", "education", "lap"] as const).map((key) => (
                            <div key={key}>
                              <label className="text-xs text-gray-500 font-medium block mb-0.5 capitalize">{key === "lap" ? "LAP" : key.charAt(0).toUpperCase() + key.slice(1)} %</label>
                              <input type="number" step="0.01"
                                value={(editValues.interestRate as Record<string, number> | undefined)?.[key] ?? ""}
                                onChange={(e) => setEditValues((v) => ({ ...v, interestRate: { ...(v.interestRate ?? eff.interestRate), [key]: Number(e.target.value) } }))}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(bank.id)} disabled={bankSaving}
                            className="flex-1 btn-gradient text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1">
                            <Save size={12} /> {bankSaving ? "Saving..." : "Save Changes"}
                          </button>
                          <button onClick={() => { setEditingBank(null); setEditValues({}); }}
                            className="px-3 py-2 bg-gray-200 rounded-lg text-xs font-medium text-gray-600">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}

        {/* ─── APPLICATIONS TAB ─── */}
        {tab === "applications" && (
          <>
            {/* Filter + Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Name, mobile, ref no or bank..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["all", ...Object.keys(STATUS_CONFIG)].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "btn-gradient text-white" : "bg-gray-100 text-gray-600"}`}>
                      {f === "all" ? "Sab" : STATUS_CONFIG[f].label}
                      {f !== "all" && <span className="ml-1 opacity-60">({apps.filter((a) => a.status === f).length})</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      {["Ref No.", "Name", "Mobile", "Bank", "Amount", "Rate", "EMI", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">Applications load ho rahi hain...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No applications found</td></tr>
                    ) : filtered.map((a) => (
                      <tr key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${selected?.id === a.id ? "bg-blue-50" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-blue-800 font-semibold">{a.referenceNo}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{a.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{a.mobile}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap text-xs">{a.bankName}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{a.approvedAmount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{a.interestRate}%</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">₹{a.emi.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select value={a.status} onChange={(e) => handleStatusChange(a.id!, e.target.value as LoanApplication["status"])}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none pr-6 cursor-pointer font-medium">
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                            </select>
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-800" />
                    <h3 className="font-semibold text-gray-900">Application Detail</h3>
                    <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg">{selected.referenceNo}</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                    {[
                      ["Name", selected.name], ["Mobile", selected.mobile], ["PAN", selected.pan], ["DOB", selected.dob],
                      ["Employment", selected.employmentType], ["Income", `₹${selected.monthlyIncome.toLocaleString("en-IN")}/mo`],
                      ["Loan Type", selected.loanType], ["Requested", `₹${selected.requestedAmount.toLocaleString("en-IN")}`],
                      ["Approved", `₹${selected.approvedAmount.toLocaleString("en-IN")}`], ["Bank", selected.bankName],
                      ["Rate", `${selected.interestRate}%`], ["EMI", `₹${selected.emi.toLocaleString("en-IN")}`],
                      ["FOIR", selected.foir ? `${Math.round(selected.foir * 100)}%` : "—"],
                      ["CIBIL", selected.cibilScore ?? "—"], ["Pincode", selected.pincode],
                      ["Status", STATUS_CONFIG[selected.status]?.label ?? selected.status],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5 font-medium">{label}</p>
                        <p className="font-semibold text-gray-900 capitalize text-sm truncate">{val as string}</p>
                      </div>
                    ))}
                  </div>
                  {selected.address && (
                    <div className="bg-slate-50 rounded-xl p-3 text-sm">
                      <p className="text-xs text-gray-400 mb-0.5 font-medium">Address</p>
                      <p className="font-medium text-gray-900">{selected.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
