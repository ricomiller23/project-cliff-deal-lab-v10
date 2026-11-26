import React from 'react';
import { useDealStore } from '../store/useDealStore';
import { formatCurrency, formatMultiple, formatPercent } from '../utils/formatters';
import { X, Layers, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';

export const ScenarioCompareModal: React.FC = () => {
  const {
    scenarioCompareOpen,
    setScenarioCompareOpen,
    results,
    setScenario,
  } = useDealStore();

  if (!scenarioCompareOpen) return null;

  const mgmt = results.mgmtModel;
  const base = results.baseModel;
  const down = results.downsideModel;

  const mgmtInj = results.mgmtEquityInjection;
  const baseInj = results.baseEquityInjection;
  const downInj = results.downsideEquityInjection;

  const mgmtDebt = results.mgmtDebtSizing;
  const baseDebt = results.baseDebtSizing;
  const downDebt = results.downsideDebtSizing;

  const scenarios = [
    {
      id: 'mgmt' as const,
      name: 'Management Plan',
      tag: 'Optimistic Model_Mgmt',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      revenue2030: mgmt.years[5].totalRevenue,
      ebitda2030: mgmt.years[5].totalEbitda,
      margin2030: mgmt.years[5].totalRevenue > 0 ? mgmt.years[5].totalEbitda / mgmt.years[5].totalRevenue : 0,
      minDscr: mgmt.minDscr,
      followOnEquity: mgmtInj.totalInjections,
      sponsorMoic: mgmtInj.sponsorMoicV3,
      sponsorIrr: mgmtInj.sponsorIrrV3,
      maxLoanCapacity: mgmtDebt.maxSeniorLoanAtCurrentAmort,
      summary: 'May 2026 model assuming rapid growth and immediate margin recovery.',
    },
    {
      id: 'base' as const,
      name: 'Run-Rate Base Case',
      tag: 'Underwriting Benchmark (Model_Base)',
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      revenue2030: base.years[5].totalRevenue,
      ebitda2030: base.years[5].totalEbitda,
      margin2030: base.years[5].totalRevenue > 0 ? base.years[5].totalEbitda / base.years[5].totalRevenue : 0,
      minDscr: base.minDscr,
      followOnEquity: baseInj.totalInjections,
      sponsorMoic: baseInj.sponsorMoicV3,
      sponsorIrr: baseInj.sponsorIrrV3,
      maxLoanCapacity: baseDebt.maxSeniorLoanAtCurrentAmort,
      summary: 'Normalized 2026 actual run-rate. Requires $2.13M in cash shortfall injections.',
    },
    {
      id: 'downside' as const,
      name: 'Downside Stress Case',
      tag: 'Recession Stress (Model_Down)',
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      revenue2030: down.years[5].totalRevenue,
      ebitda2030: down.years[5].totalEbitda,
      margin2030: down.years[5].totalRevenue > 0 ? down.years[5].totalEbitda / down.years[5].totalRevenue : 0,
      minDscr: down.minDscr,
      followOnEquity: downInj.totalInjections,
      sponsorMoic: downInj.sponsorMoicV3,
      sponsorIrr: downInj.sponsorIrrV3,
      maxLoanCapacity: downDebt.maxSeniorLoanAtCurrentAmort,
      summary: '10% revenue haircut and 200 bps margin erosion. Severe capital impairment (0.55x MOIC).',
    },
  ];

  const handleSelectScenario = (sc: 'mgmt' | 'base' | 'downside') => {
    setScenario(sc);
    setScenarioCompareOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scenario Comparison Matrix</h2>
              <p className="text-xs text-slate-400">Side-by-side returns, debt capacity, and equity risk comparison</p>
            </div>
          </div>
          <button
            onClick={() => setScenarioCompareOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                className={`bg-slate-950 border ${sc.borderColor} rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${sc.color}`}>{sc.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {sc.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 h-10">{sc.summary}</p>

                  <div className="space-y-3 font-mono text-xs divide-y divide-slate-800/80">
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">2030 Revenue:</span>
                      <span className="text-white font-semibold">{formatCurrency(sc.revenue2030)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">2030 EBITDA:</span>
                      <span className="text-white font-semibold">{formatCurrency(sc.ebitda2030)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">EBITDA Margin:</span>
                      <span className="text-slate-300">{formatPercent(sc.margin2030, 1)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">Min DSCR:</span>
                      <span className={`font-semibold ${sc.minDscr < 1.0 ? 'text-rose-400' : sc.minDscr < 1.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {formatMultiple(sc.minDscr)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">Follow-on Cash Needed:</span>
                      <span className={`font-semibold ${sc.followOnEquity > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {sc.followOnEquity > 0 ? formatCurrency(sc.followOnEquity) : '$0'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-sans">Max Senior Loan (5y):</span>
                      <span className="text-slate-300">{formatCurrency(sc.maxLoanCapacity)}</span>
                    </div>
                    <div className="flex justify-between pt-2 bg-slate-900/60 p-2 rounded">
                      <span className="text-slate-300 font-sans font-medium">Sponsor MOIC (V3):</span>
                      <span className={`text-sm font-bold ${sc.sponsorMoic < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatMultiple(sc.sponsorMoic)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 bg-slate-900/60 p-2 rounded">
                      <span className="text-slate-300 font-sans font-medium">Sponsor IRR (V3):</span>
                      <span className={`text-sm font-bold ${sc.sponsorIrr < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatPercent(sc.sponsorIrr, 1)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectScenario(sc.id)}
                  className="w-full mt-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>Activate Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
