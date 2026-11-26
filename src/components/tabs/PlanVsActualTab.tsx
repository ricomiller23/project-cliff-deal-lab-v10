import React from 'react';
import { getPlanVsActualData } from '../../engine/planVsActual';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { AlertTriangle, Users, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const PlanVsActualTab: React.FC = () => {
  const data = getPlanVsActualData();

  // 3 Operating contractors with May 2026 Management Plan vs Actuals (Knighthawk has no 2026 plan)
  const entityComparisonData = [
    {
      name: 'FP + FIX',
      metric: 'Revenue',
      Plan: 2.45,
      Actual: 1.88,
      Gap: -0.57,
    },
    {
      name: 'Salisbury',
      metric: 'Revenue',
      Plan: 4.88,
      Actual: 4.59,
      Gap: -0.29,
    },
    {
      name: 'Rocmont',
      metric: 'Revenue',
      Plan: 3.67,
      Actual: 2.71,
      Gap: -0.96,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Headline Takeaway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-rose-400">
          Variance & Diligence Realities (Sheets: PlanVsActual & Actuals)
        </div>
        <h1 className="text-xl font-bold text-white mt-1">
          YTD 2026 Run-Rate is 23.3% Below Management Plan Across the Platform
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          FP/FIX is operating at a -$312K operating EBITDA loss; Rocmont EBITDA proxy is down 61.7%; Salisbury dropped $101K in August-September 2026.
        </p>
      </div>

      {/* Variance Alert Banner */}
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-200 leading-relaxed">
          <span className="font-semibold text-rose-300">Underwriting Reality Check:</span> The May 2026 Management Plan assumed rapid synergies and sustained growth. However, actual QuickBooks P&Ls through September 2026 show annualized 3-contractor EBITDA of only $1.10M compared to the $2.70M projected in the model. Financing $4.8M of senior debt against $1.10M run-rate EBITDA leaves the platform immediately overleveraged (4.36x leverage vs 1.78x planned).
        </div>
      </div>

      {/* YTD Sep 2026 Actual vs Plan Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">YTD September 2026 Performance vs Management Plan</h3>
          <span className="text-xs text-slate-400">Source: Data Room QB P&Ls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2">Entity</th>
                <th className="pb-2">Metric</th>
                <th className="pb-2 text-right">Actual YTD</th>
                <th className="pb-2 text-right">Plan YTD</th>
                <th className="pb-2 text-right">Variance ($)</th>
                <th className="pb-2 text-right">Variance (%)</th>
                <th className="pb-2">Diligence Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.ytdSep2026.map((row, idx) => {
                const isNegative = row.varianceDollar < 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-medium text-slate-200">{row.entity}</td>
                    <td className="py-2.5 font-sans text-slate-400">{row.metric}</td>
                    <td className="py-2.5 text-right text-white">{formatCurrency(row.actual)}</td>
                    <td className="py-2.5 text-right text-slate-400">{formatCurrency(row.plan)}</td>
                    <td className={`py-2.5 text-right font-semibold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatCurrency(row.varianceDollar)}
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {formatPercent(row.variancePct, 1)}
                      </div>
                    </td>
                    <td className="py-2.5 font-sans text-[11px] text-slate-400 max-w-xs">{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart & Customer Concentration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Gap Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-1">YTD Revenue: Plan vs Actual ($M)</h3>
          <p className="text-xs text-slate-400 mb-4">Contractors with May 2026 Plan (Knighthawk excluded: no plan exists)</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="M" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${val}M`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Plan" fill="#64748b" name="Management Plan" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Actual" fill="#3b82f6" name="Actual Performance" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Concentration Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Workbook Customer Concentration Data</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Verified client revenue breakdowns from Sheet Data_V3 & Actuals.
            </p>

            <div className="space-y-4">
              {/* Rocmont Concentration */}
              <div className="p-3.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Rocmont Industrial — 2025 Revenue by Client</span>
                  <span className="text-amber-400 font-bold font-mono">Top-4 Share = 81.0%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '81.0%' }} />
                </div>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>1. KK Mechanical:</span>
                    <span>$1,891,197 (29.7%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. DFCM (State of Utah):</span>
                    <span>$1,268,491 (19.9%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Utah State University:</span>
                    <span>$1,178,643 (18.5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4. Anderson Geneva, LLC:</span>
                    <span>$818,358 (12.9%)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>5. A & B Mechanical:</span>
                    <span>$500,304 (7.9%)</span>
                  </div>
                  <div className="flex justify-between text-slate-500 border-t border-slate-800 pt-1">
                    <span>All Other (16 clients):</span>
                    <span>$708,484 (11.1%)</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1">
                    <span>Total 2025 Revenue:</span>
                    <span>$6,365,477 (100.0%)</span>
                  </div>
                </div>
              </div>

              {/* Knighthawk Concentration */}
              <div className="p-3.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Knighthawk Engineering — Lennar Homes Share</span>
                  <span className="text-rose-400 font-bold font-mono">Single Customer Risk</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>• 2024 Lennar Share:</span>
                    <span className="font-bold text-rose-300">$2,854,524 of $6,895,561 (41.4%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 2025 YTD Sep Lennar Share:</span>
                    <span className="font-bold text-rose-300">$2,355,997 of $6,337,807 (37.2%)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-sans">
                  Lennar represents ~40% of Knighthawk billings. Any slowdown in homebuilding directly reduces cash flows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
