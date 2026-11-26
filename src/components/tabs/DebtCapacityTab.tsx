import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent, formatMultiple } from '../../utils/formatters';
import { Zap, ShieldAlert, CheckCircle2, Scale, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const DebtCapacityTab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const ds = results.activeDebtSizing;

  const currentLoan = ds.currentLoan;
  const maxLoan = ds.maxSeniorLoanAtCurrentAmort;
  const headroom = ds.headroom;

  const chartData = ds.amortizationCapacities.map((ac) => ({
    amort: `${ac.amortYears}-Year Amort`,
    maxCapacity: ac.maxLoan,
    currentLoan: currentLoan,
  }));

  const postCloseYears = results.activeModel.postCloseYears;

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            SENIOR DEBT CAPACITY &amp; COVENANT HEADROOM (MODEL 2)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          At {assumptions.seniorLoanAmortYears}-year amort &amp; {formatMultiple(assumptions.targetDscr, 2)} DSCR target, max senior borrowing capacity is{' '}
          <span className="text-teal-300 font-mono font-black">{formatCurrency(maxLoan, false, 0)}</span> vs.{' '}
          <span className="text-cyan-400 font-mono font-black">{formatCurrency(currentLoan, false, 0)}</span> requested loan (
          <span className={headroom >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
            {headroom >= 0 ? `+${formatCurrency(headroom, true)} headroom` : `${formatCurrency(headroom, true)} over-levered`}
          </span>).
        </h2>
      </div>

      {/* Target DSCR Slider & Solve for Loan Action */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 max-w-sm">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">Target DSCR Covenant Slider:</span>
            <span className="text-teal-400 font-bold">{formatMultiple(assumptions.targetDscr, 2)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={1.60}
            step={0.05}
            value={assumptions.targetDscr}
            onChange={(e) => setAssumption('targetDscr', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <input
            type="checkbox"
            checked={assumptions.countSellerBalloonsAsDebtService}
            onChange={(e) => setAssumption('countSellerBalloonsAsDebtService', e.target.checked)}
            className="accent-teal-400 rounded w-4 h-4"
          />
          <div className="text-left">
            <span className="text-xs text-white font-medium block">Count Seller Balloons</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {assumptions.countSellerBalloonsAsDebtService ? "Incl. $500k 2029 balloon" : "Default: excludes balloons"}
            </span>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setAssumption('seniorLoanAmount', Math.round(maxLoan))}
          className="btn-gold px-4 py-2.5 text-xs font-bold font-mono inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Solve for Loan: Set to Capacity ({formatCurrency(maxLoan, true)})</span>
        </button>
      </div>

      {/* Amortization Capacity Chart vs Current Loan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Max Senior Borrowing Capacity by Amortization Schedule
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="amort" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={currentLoan} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `Current: ${formatCurrency(currentLoan, true)}`, fill: '#f43f5e', fontSize: 10 }} />
                <Bar dataKey="maxCapacity" name="Max Capacity" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Covenant Headroom & Cushion Table */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Covenant Compliance &amp; EBITDA Cushion ({assumptions.activeScenario.toUpperCase()})
            </h3>
          </div>

          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-400 text-[10.5px] border-b border-slate-800">
                <th className="text-left py-1.5">Year</th>
                <th className="text-right py-1.5">CFADS ($)</th>
                <th className="text-right py-1.5">Total debt service DSCR</th>
                <th className="text-right py-1.5">EBITDA Cushion</th>
                <th className="text-right py-1.5">Debt / EBITDA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {postCloseYears.map((yr, idx) => {
                const cushion = ds.ebitdaCushionBeforeDscrBreachPct[idx];
                const lev = ds.leverageByYear[idx];
                const isBreached = ds.leverageBreachedByYear[idx];

                return (
                  <tr key={yr.year}>
                    <td className="py-2 text-white font-bold">{yr.year}E</td>
                    <td className="text-right">{formatCurrency(yr.cfads, true)}</td>
                    <td className="text-right font-bold">
                      <span className={yr.dscr >= assumptions.targetDscr ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatMultiple(yr.displayedDscr)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={cushion >= 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {formatPercent(cushion)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={isBreached ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {formatMultiple(lev)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>
              • <strong className="text-white">EBITDA Cushion Formula:</strong> 1 - (Target DSCR &times; Total Debt Service / CFADS).
            </div>
            <div>
              • Negative cushion indicates cash flow is insufficient to support debt service at the covenant target.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
