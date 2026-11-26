import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatMultiple, formatPercent } from '../../utils/formatters';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Scale,
  Sparkles,
  BarChart3,
  DollarSign,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const CommandCenterTab: React.FC = () => {
  const { results, assumptions, setScenario, setActiveTab, setAssumption } = useDealStore();
  const [showDataTable, setShowDataTable] = useState(false);

  const activeModel = results.activeModel;
  const activeInj = results.activeEquityInjection;
  const su = results.sourcesAndUses;

  const moic = activeInj.sponsorMoicV3;
  const irr = activeInj.sponsorIrrV3;
  const sponsorEquity = su.sources.sponsorCashEquity;
  const followOnEquity = activeInj.totalInjections;
  const minDscr = activeModel.minDscr;
  const totalDebt = activeModel.years[1].totalDebtClosing;
  const runRateEbitda = results.baseModel.years[1].totalEbitda;
  const debtToEbitda = runRateEbitda > 0 ? totalDebt / runRateEbitda : 0;
  const probLoss = results.monteCarlo.probMoicLoss;

  // Chart data: 2026E to 2030E EBITDA for the three cases
  const ebitdaChartData = [2026, 2027, 2028, 2029, 2030].map((yr, idx) => {
    const yrIndex = idx + 1;
    return {
      year: yr === 2026 ? '2026E' : `${yr}E`,
      mgmtEbitda: results.mgmtModel.years[yrIndex]?.totalEbitda || 0,
      baseEbitda: results.baseModel.years[yrIndex]?.totalEbitda || 0,
      downsideEbitda: results.downsideModel.years[yrIndex]?.totalEbitda || 0,
    };
  });

  // Chart data: DSCR 2027-2030 for active scenario vs danger 1.0x & target 1.25x
  const dscrChartData = results.activeModel.postCloseYears.map((yr) => ({
    year: `${yr.year}E`,
    dscr: yr.dscr,
    dscrExclBalloons: yr.dscrExclBalloons,
    target: assumptions.targetDscr,
    danger: 1.0,
  }));

  // Mini Sources & Uses bar data
  const suChartData = [
    {
      category: 'Deal Funding',
      SeniorDebt: su.sources.seniorTermLoan,
      SellerNotes: su.sources.sellerNotes,
      Rollover: su.sources.sellerRolloverEquity,
      SponsorEquity: su.sources.sponsorCashEquity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
              EXECUTIVE PORTFOLIO TAKEAWAY
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {assumptions.activeScenario === 'base' && (
              <>
                Base Case yields <span className="text-teal-300 font-mono font-black">{formatMultiple(moic)}</span> MOIC &amp;{' '}
                <span className="text-teal-300 font-mono font-black">{formatPercent(irr)}</span> IRR, but requires{' '}
                <span className="text-rose-400 font-mono font-black">{formatCurrency(followOnEquity, true)}</span> in follow-on equity injections.
              </>
            )}
            {assumptions.activeScenario === 'mgmt' && (
              <>
                Management Plan delivers <span className="text-emerald-400 font-mono font-black">{formatMultiple(moic)}</span> MOIC with zero follow-on injections and minimum DSCR of{' '}
                <span className="text-emerald-400 font-mono font-black">{formatMultiple(minDscr)}</span>.
              </>
            )}
            {assumptions.activeScenario === 'downside' && (
              <>
                Downside Case results in capital impairment (<span className="text-rose-400 font-mono font-black">{formatMultiple(moic)}</span> MOIC), requiring{' '}
                <span className="text-rose-400 font-mono font-black">{formatCurrency(followOnEquity, true)}</span> follow-on cash to maintain debt service.
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {minDscr < 1.0 && (
            <span className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-300 font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              COVENANT DEFICIT ({formatMultiple(minDscr)})
            </span>
          )}
          {minDscr >= 1.25 && (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              LENDER COMPLIANT
            </span>
          )}
        </div>
      </div>

      {/* Hero KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Sponsor MOIC */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Sponsor MOIC</span>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">{formatMultiple(moic)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={moic >= 2.0 ? 'text-emerald-400' : moic >= 1.0 ? 'text-amber-400' : 'text-rose-400'}>
              {moic >= 2.0 ? 'Strong Target' : moic >= 1.0 ? 'Capital Returned' : 'Loss Position'}
            </span>
            <span className="text-slate-500">V3 Injected</span>
          </div>
        </div>

        {/* Card 2: Sponsor IRR */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Sponsor Net IRR</span>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">{formatPercent(irr)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={irr >= 0.20 ? 'text-emerald-400' : irr >= 0 ? 'text-amber-400' : 'text-rose-400'}>
              {irr >= 0.20 ? 'Above Hurdle' : irr >= 0 ? 'Sub-hurdle' : 'Negative'}
            </span>
            <span className="text-slate-500">4-Yr Hold</span>
          </div>
        </div>

        {/* Card 3: Equity at Close */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Equity at Close</span>
          <div className="my-2">
            <span className="text-xl font-black font-mono text-white tracking-tight">{formatCurrency(sponsorEquity, true)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-300 font-bold">{formatPercent(sponsorEquity / su.uses.totalUses)}</span>
            <span className="text-slate-500">of Uses</span>
          </div>
        </div>

        {/* Card 4: Follow-on Equity */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Follow-on Needed</span>
          <div className="my-2">
            <span className={`text-xl font-black font-mono tracking-tight ${followOnEquity > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {followOnEquity > 0 ? formatCurrency(followOnEquity, true) : '$0'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={followOnEquity > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              {followOnEquity > 0 ? 'Shortfall Call' : 'Fully Funded'}
            </span>
            <span className="text-slate-500">2027-30</span>
          </div>
        </div>

        {/* Card 5: Total Debt Service DSCR */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Total Debt DSCR</span>
            <span className="text-[9px] font-mono text-slate-500">{assumptions.countSellerBalloonsAsDebtService ? "incl. balloons" : "excl. balloons"}</span>
          </div>
          <div className="my-2">
            <span className={`text-xl font-black font-mono tracking-tight ${minDscr >= 1.25 ? 'text-emerald-400' : minDscr >= 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatMultiple(minDscr)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={minDscr >= 1.25 ? 'text-emerald-400' : 'text-rose-400'}>
              {minDscr >= 1.25 ? '>= 1.25x Target' : '< 1.25x Breach'}
            </span>
            <span className="text-slate-500">Covenant</span>
          </div>
        </div>

        {/* Card 6: Leverage at Close */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Debt / Run-Rate EBITDA</span>
          <div className="my-2">
            <span className="text-xl font-black font-mono text-white tracking-tight">{formatMultiple(debtToEbitda)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={debtToEbitda > 4.5 ? 'text-rose-400' : 'text-slate-300'}>
              {debtToEbitda > 4.5 ? 'Heavy Leverage' : 'Moderate'}
            </span>
            <span className="text-slate-500">Close</span>
          </div>
        </div>

        {/* Card 7: Loss Probability */}
        <div className="p-3.5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Loss Prob (P&lt;1.0x)</span>
          <div className="my-2">
            <span className={`text-xl font-black font-mono tracking-tight ${probLoss > 0.30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatPercent(probLoss)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Monte Carlo</span>
            <span className="text-slate-500">1K trials</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Scenario Comparison (EBITDA 2026-2030) */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Platform EBITDA Trajectory (2026E – 2030E)
              </h3>
              <p className="text-[11px] text-slate-400">Comparing Management Plan vs. Run-Rate Base vs. Downside Case</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDataTable(!showDataTable)}
              className="text-[10px] font-mono text-teal-400 hover:underline"
            >
              {showDataTable ? 'Hide Table' : 'Show Data Table'}
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ebitdaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                <Line type="monotone" dataKey="mgmtEbitda" name="Management Plan" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="baseEbitda" name="Run-Rate Base" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="downsideEbitda" name="Downside Case" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {showDataTable && (
            <div className="overflow-x-auto text-xs font-mono border-t border-slate-800 pt-3">
              <table className="w-full text-right text-[11px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left pb-1">Scenario</th>
                    <th className="pb-1">2026E</th>
                    <th className="pb-1">2027E</th>
                    <th className="pb-1">2028E</th>
                    <th className="pb-1">2029E</th>
                    <th className="pb-1">2030E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  <tr>
                    <td className="text-left py-1 text-emerald-400 font-bold">Mgmt Plan</td>
                    {ebitdaChartData.map((d) => (
                      <td key={d.year}>{formatCurrency(d.mgmtEbitda, true)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-left py-1 text-teal-400 font-bold">Run-Rate Base</td>
                    {ebitdaChartData.map((d) => (
                      <td key={d.year}>{formatCurrency(d.baseEbitda, true)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-left py-1 text-rose-400 font-bold">Downside</td>
                    {ebitdaChartData.map((d) => (
                      <td key={d.year}>{formatCurrency(d.downsideEbitda, true)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chart 2: Senior DSCR vs Danger Line & Target */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                TOTAL DEBT DSCR COVERAGE ({assumptions.activeScenario.toUpperCase()})
              </h3>
              <p className="text-[11px] text-slate-400">1.25x Covenant Target vs. 1.00x Cash Breakeven Danger Line</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dscrChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `${v.toFixed(2)}x`}
                  domain={[0, 2.5]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(val: any) => [formatMultiple(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={1.25} stroke="#10b981" strokeDasharray="3 3" label={{ value: '1.25x Target', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={1.00} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '1.00x Danger', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                <Bar dataKey="dscr" name="Total Debt Service DSCR" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="dscrExclBalloons" name="DSCR (Excl. Balloons)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Lender Headroom vs $4.8M Senior Loan:</span>
            <span className={`font-mono font-bold ${results.activeDebtSizing.headroom >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.activeDebtSizing.headroom >= 0 ? '+' : ''}{formatCurrency(results.activeDebtSizing.headroom, false, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Quick Actions Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            const maxLoan = results.activeDebtSizing.maxSeniorLoanAtCurrentAmort;
            setAssumption('seniorLoanAmount', Math.round(maxLoan));
          }}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 transition-all flex items-center justify-between text-left group"
        >
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Auto-Size Loan to 1.25x DSCR</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Set Senior Loan to capacity ({formatCurrency(results.activeDebtSizing.maxSeniorLoanAtCurrentAmort, true)})
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 transition-all flex items-center justify-between text-left group"
        >
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-teal-400" />
              <span>Explore Returns &amp; Heatmaps</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">7x7 exit multiple vs EBITDA sensitivity matrix</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data_room')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 transition-all flex items-center justify-between text-left group"
        >
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Audit Data Room Flags</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">11 critical discrepancies &amp; balance sheet items</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
