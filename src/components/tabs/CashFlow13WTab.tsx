import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { AlertTriangle, Clock, DollarSign, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const CashFlow13WTab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const cf = results.cashFlow13W;
  const [selectedEntity, setSelectedEntity] = useState<'platform' | 'salisbury' | 'rocmont' | 'fp'>('platform');

  const chartData = cf.platformWeeks.map((pw) => ({
    week: `W${pw.weekIndex}`,
    date: pw.weekEnding,
    Rocmont: pw.rocmontCash,
    Salisbury: pw.salisburyCash,
    'Flood Pros + FIX': pw.fpFixCash,
    PlatformTotal: pw.totalCash,
  }));

  const activeWeeks =
    selectedEntity === 'salisbury'
      ? cf.salisburyWeeks
      : selectedEntity === 'rocmont'
      ? cf.rocmontWeeks
      : selectedEntity === 'fp'
      ? cf.fpFixWeeks
      : null;

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            13-WEEK LIQUIDITY FORECAST (MODEL 4)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Salisbury goes cash-negative in <span className="text-rose-400 font-mono font-black">Week {cf.salisburyFirstNegativeWeek}</span>, bottoming at{' '}
          <span className="text-rose-400 font-mono font-black">{formatCurrency(cf.salisburyMinCash)}</span>; Platform maintains minimum liquidity of{' '}
          <span className="text-emerald-400 font-mono font-black">{formatCurrency(cf.platformMinCash)}</span> buoyed by Rocmont cash reserves.
        </h2>
      </div>

      {/* Driver Controls Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0d1322] border border-slate-800 font-mono text-xs">
        <div className="space-y-1">
          <span className="text-slate-400">A/R &gt;90 Days 13W Collect %:</span>
          <div className="font-bold text-teal-300">{formatPercent(assumptions.arOver90CollectionPct13W)}</div>
          <input
            type="range"
            min={0.0}
            max={0.75}
            step={0.05}
            value={assumptions.arOver90CollectionPct13W}
            onChange={(e) => setAssumption('arOver90CollectionPct13W', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Salisbury Collection Lag:</span>
          <div className="font-bold text-white">{assumptions.collectionLagWeeksSalisbury} Weeks (DSO)</div>
          <input
            type="range"
            min={4}
            max={14}
            step={1}
            value={assumptions.collectionLagWeeksSalisbury}
            onChange={(e) => setAssumption('collectionLagWeeksSalisbury', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Rocmont Collection Lag:</span>
          <div className="font-bold text-white">{assumptions.collectionLagWeeksRocmont} Weeks</div>
          <input
            type="range"
            min={4}
            max={12}
            step={1}
            value={assumptions.collectionLagWeeksRocmont}
            onChange={(e) => setAssumption('collectionLagWeeksRocmont', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Salisbury Opening Cash:</span>
          <div className="font-bold text-amber-300">{formatCurrency(assumptions.salisburyOpeningCash)}</div>
          <input
            type="range"
            min={0}
            max={500000}
            step={10000}
            value={assumptions.salisburyOpeningCash}
            onChange={(e) => setAssumption('salisburyOpeningCash', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              13-Week Closing Cash Balance by Entity
            </h3>
            <p className="text-[11px] text-slate-400">Starting November 20, 2026. Debt service scheduled on weeks 4, 8, and 13.</p>
          </div>

          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
            {(['platform', 'salisbury', 'rocmont', 'fp'] as const).map((ent) => (
              <button
                key={ent}
                type="button"
                onClick={() => setSelectedEntity(ent)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedEntity === ent ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ent === 'platform' ? 'Platform Total' : ent === 'salisbury' ? 'Salisbury' : ent === 'rocmont' ? 'Rocmont' : 'FP+FIX'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }}
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#f43f5e" strokeWidth={1.5} label={{ value: '$0 Threshold', fill: '#f43f5e', fontSize: 10 }} />
              {selectedEntity === 'platform' ? (
                <>
                  <Area type="monotone" dataKey="Rocmont" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="Flood Pros + FIX" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="Salisbury" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                </>
              ) : selectedEntity === 'salisbury' ? (
                <Area type="monotone" dataKey="Salisbury" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              ) : selectedEntity === 'rocmont' ? (
                <Area type="monotone" dataKey="Rocmont" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
              ) : (
                <Area type="monotone" dataKey="Flood Pros + FIX" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Week-by-Week Table */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          Weekly Cash Ledger ({selectedEntity.toUpperCase()})
        </h3>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-right text-[11px] border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-2">Week</th>
                <th className="text-left py-2">Week Ending</th>
                {selectedEntity === 'platform' ? (
                  <>
                    <th className="py-2">Rocmont</th>
                    <th className="py-2">Salisbury</th>
                    <th className="py-2">FP + FIX</th>
                    <th className="py-2 text-teal-400 font-bold">Platform Total</th>
                  </>
                ) : (
                  <>
                    <th className="py-2">Opening Cash</th>
                    <th className="py-2">Receipts</th>
                    <th className="py-2">Disbursements</th>
                    <th className="py-2">A/P Paydown</th>
                    <th className="py-2">Debt Service</th>
                    <th className="py-2">Net Cash</th>
                    <th className="py-2 font-bold text-white">Closing Cash</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {selectedEntity === 'platform'
                ? cf.platformWeeks.map((pw) => (
                    <tr key={pw.weekIndex} className="hover:bg-slate-850/50">
                      <td className="text-left py-2 font-bold text-white">W{pw.weekIndex}</td>
                      <td className="text-left text-slate-400">{pw.weekEnding}</td>
                      <td>{formatCurrency(pw.rocmontCash)}</td>
                      <td className={pw.salisburyCash < 0 ? 'text-rose-400 font-bold' : ''}>{formatCurrency(pw.salisburyCash)}</td>
                      <td>{formatCurrency(pw.fpFixCash)}</td>
                      <td className="text-teal-300 font-bold">{formatCurrency(pw.totalCash)}</td>
                    </tr>
                  ))
                : activeWeeks?.map((w) => (
                    <tr key={w.weekIndex} className={w.closingCash < 0 ? 'bg-rose-950/20' : 'hover:bg-slate-850/50'}>
                      <td className="text-left py-2 font-bold text-white">W{w.weekIndex}</td>
                      <td className="text-left text-slate-400">{w.weekEnding}</td>
                      <td>{formatCurrency(w.openingCash)}</td>
                      <td className="text-emerald-400">{formatCurrency(w.totalReceipts)}</td>
                      <td className="text-slate-400">{formatCurrency(w.operatingDisbursements)}</td>
                      <td className="text-slate-400">{formatCurrency(w.apPaydown)}</td>
                      <td className="text-rose-400">{w.debtService !== 0 ? formatCurrency(w.debtService) : '—'}</td>
                      <td className={w.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(w.netCashFlow)}</td>
                      <td className={`font-bold ${w.closingCash < 0 ? 'text-rose-400 font-black' : 'text-white'}`}>
                        {formatCurrency(w.closingCash)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
