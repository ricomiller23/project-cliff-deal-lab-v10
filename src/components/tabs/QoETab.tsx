import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent, formatMultiple } from '../../utils/formatters';
import { ShieldAlert, AlertTriangle, CheckCircle2, DollarSign, Sliders } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const QoETab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const qoe = results.qoe;

  const rocmontChartData = qoe.rocmontBridge.map((b) => ({
    year: b.year,
    'Reported Net Income': b.netIncome,
    'Management Add-backs': b.addbacks,
    'Diligence Haircut': b.haircut,
    'Adjusted EBITDA': b.adjustedEbitda,
  }));

  const salisburyChartData = qoe.salisburyBridge.map((b) => ({
    year: b.year,
    'Reported Net Income': b.netIncome,
    'Management Add-backs': b.addbacks,
    'Diligence Haircut': b.haircut,
    'Adjusted EBITDA': b.adjustedEbitda,
  }));

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            QUALITY OF EARNINGS &amp; DEBT-LIKE ITEMS (MODEL 3)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Rocmont 2024 EBITDA is <span className="text-rose-400 font-mono font-black">108%</span> management add-backs (haircut reduces 2024 EBITDA to{' '}
          <span className="text-teal-300 font-mono font-black">{formatCurrency(qoe.rocmontBridge[2].adjustedEbitda, false, 0)}</span>); Salisbury net cash to seller after debt-like items drops to just{' '}
          <span className="text-amber-400 font-mono font-black">{formatCurrency(qoe.salisburyNetCashToSeller.netCashToSeller, false, 0)}</span>.
        </h2>
      </div>

      {/* Levers Slider Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0d1322] border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Add-Back Haircut:</span>
            <span className="text-teal-400 font-bold">{formatPercent(assumptions.diligenceHaircutAddbacks)}</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={1.0}
            step={0.05}
            value={assumptions.diligenceHaircutAddbacks}
            onChange={(e) => setAssumption('diligenceHaircutAddbacks', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Overbillings Debt-Like %:</span>
            <span className="text-teal-400 font-bold">{formatPercent(assumptions.contractLiabilitiesDebtLikePct)}</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={1.0}
            step={0.10}
            value={assumptions.contractLiabilitiesDebtLikePct}
            onChange={(e) => setAssumption('contractLiabilitiesDebtLikePct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">A/R &gt;90 Days Reserve %:</span>
            <span className="text-teal-400 font-bold">{formatPercent(assumptions.arOver90ReservePct)}</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={1.0}
            step={0.10}
            value={assumptions.arOver90ReservePct}
            onChange={(e) => setAssumption('arOver90ReservePct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      </div>

      {/* Bridges Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rocmont Bridge */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Rocmont: Reported Net Income to Adjusted EBITDA Bridge
            </h3>
            <span className="text-[10px] font-mono text-rose-400 font-bold">2024 Add-backs: 108%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rocmontChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }} formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Reported Net Income" fill="#64748b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Management Add-backs" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Adjusted EBITDA" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salisbury Bridge */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Salisbury: Reported Net Income to Adjusted EBITDA Bridge
            </h3>
            <span className="text-[10px] font-mono text-slate-400">2022-2025</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salisburyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }} formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Reported Net Income" fill="#64748b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Management Add-backs" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Adjusted EBITDA" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Debt-Like Items and Net Cash to Seller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rocmont Cash Free Debt Free */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-white">
            <span>Rocmont Cash-Free / Debt-Free Net Cash to Seller</span>
            <span className="text-emerald-400">{formatCurrency(qoe.rocmontNetCashToSeller.netCashToSeller)}</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">LOI Cash at Closing:</span>
              <span className="text-white font-bold">{formatCurrency(qoe.rocmontNetCashToSeller.loiCash)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: SBA EIDL &amp; Vehicle Notes:</span>
              <span className="text-rose-400">{formatCurrency(qoe.rocmontNetCashToSeller.lessDebt)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: Overbillings Debt-Like ({formatPercent(assumptions.contractLiabilitiesDebtLikePct)}):</span>
              <span className="text-rose-400">{formatCurrency(qoe.rocmontNetCashToSeller.lessOverbillings)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: A/R &gt;90 Days Reserve ({formatPercent(assumptions.arOver90ReservePct)}):</span>
              <span className="text-rose-400">{formatCurrency(qoe.rocmontNetCashToSeller.lessArReserve)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-white bg-slate-900/60 px-2 rounded">
              <span>Net Cash to Seller (Standard):</span>
              <span className="text-emerald-400">{formatCurrency(qoe.rocmontNetCashToSeller.netCashToSeller)}</span>
            </div>
            <div className="flex justify-between py-1 text-[11px] text-amber-300">
              <span>Memo: If Shareholder Balances are Netted ($2.45M):</span>
              <span className="font-bold text-rose-400">{formatCurrency(qoe.rocmontNetCashToSeller.netCashToSeller + qoe.rocmontNetCashToSeller.shareholderBalancesNetting)}</span>
            </div>
          </div>
        </div>

        {/* Salisbury Cash Free Debt Free */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-white">
            <span>Salisbury Cash-Free / Debt-Free Net Cash to Seller</span>
            <span className="text-amber-400">{formatCurrency(qoe.salisburyNetCashToSeller.netCashToSeller)}</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">LOI Cash at Closing:</span>
              <span className="text-white font-bold">{formatCurrency(qoe.salisburyNetCashToSeller.loiCash)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: Notes Payable on Balance Sheet:</span>
              <span className="text-rose-400">{formatCurrency(qoe.salisburyNetCashToSeller.lessDebt)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: Credit Card Balances:</span>
              <span className="text-rose-400">{formatCurrency(qoe.salisburyNetCashToSeller.lessCreditCards)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Less: A/R &gt;90 Reserve (Mark 25 Homes exposure):</span>
              <span className="text-rose-400">{formatCurrency(qoe.salisburyNetCashToSeller.lessArReserve)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-white bg-slate-900/60 px-2 rounded">
              <span>Net Cash to Seller at Close:</span>
              <span className="text-amber-400">{formatCurrency(qoe.salisburyNetCashToSeller.netCashToSeller)}</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              • Seller anticipated receiving $862K net; debt-like liabilities reduce close check to only $35.5K.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
