import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent, formatMultiple } from '../../utils/formatters';
import { Flame, TrendingUp, Calendar, AlertCircle, ArrowUpRight, BarChart2 } from 'lucide-react';
import { calcAll } from '../../engine/calcAll';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine, CartesianGrid,
} from 'recharts';

export const ReturnsTab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const [selectedHeatmap, setSelectedHeatmap] = useState<'moic' | 'irr'>('moic');

  const eqInj = results.activeEquityInjection;
  const sens = results.sensitivity;
  const baseMoic = eqInj.sponsorMoicV3;

  // Tornado Chart Logic: flex each assumption +/-20% and measure delta on MOIC
  const tornadoLevers = [
    { name: 'Exit Multiple', key: 'exitMultiple', curr: assumptions.exitMultiple, isLoi: false },
    { name: 'Senior Loan Size', key: 'seniorLoanAmount', curr: assumptions.seniorLoanAmount, isLoi: false },
    { name: 'Senior Interest Rate', key: 'seniorLoanRate', curr: assumptions.seniorLoanRate, isLoi: false },
    { name: 'Rocmont Normalized Margin', key: 'baseMarginRocmont', curr: assumptions.baseMarginRocmont, isLoi: false },
    { name: 'Salisbury Normalized Margin', key: 'baseMarginSalisbury', curr: assumptions.baseMarginSalisbury, isLoi: false },
    { name: 'Tax Distribution Rate', key: 'taxDistributionRate', curr: assumptions.taxDistributionRate, isLoi: false },
    { name: 'Rocmont EV', key: 'rocmontEv', curr: assumptions.rocmontLoi.ev, isLoi: true, target: 'rocmontLoi' },
    { name: 'Salisbury EV', key: 'salisburyEv', curr: assumptions.salisburyLoi.ev, isLoi: true, target: 'salisburyLoi' },
  ];

  const tornadoData = tornadoLevers.map((lev) => {
    // Up 20%
    const aUp = { ...assumptions };
    if (!lev.isLoi) {
      (aUp as any)[lev.key] = lev.curr * 1.20;
    } else {
      (aUp as any)[lev.target || "rocmontLoi"] = { ...(aUp as any)[lev.target || "rocmontLoi"], ev: lev.curr * 1.20 };
    }
    const resUp = calcAll(aUp);
    const moicUp = resUp.activeEquityInjection.sponsorMoicV3;

    // Down 20%
    const aDown = { ...assumptions };
    if (!lev.isLoi) {
      (aDown as any)[lev.key] = lev.curr * 0.80;
    } else {
      (aDown as any)[lev.target || "rocmontLoi"] = { ...(aDown as any)[lev.target || "rocmontLoi"], ev: lev.curr * 0.80 };
    }
    const resDown = calcAll(aDown);
    const moicDown = resDown.activeEquityInjection.sponsorMoicV3;

    const deltaUp = moicUp - baseMoic;
    const deltaDown = moicDown - baseMoic;
    const spread = Math.abs(moicUp - moicDown);

    return {
      name: lev.name,
      key: lev.key,
      moicUp,
      moicDown,
      deltaUp,
      deltaDown,
      spread,
    };
  }).sort((a, b) => b.spread - a.spread);

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            EQUITY INJECTIONS &amp; SPONSOR RETURNS (MODEL 1)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Sponsor calls <span className="text-cyan-400 font-mono font-black">{formatCurrency(results.sourcesAndUses.sources.sponsorCashEquity, true)}</span> at close plus{' '}
          <span className="text-rose-400 font-mono font-black">{formatCurrency(eqInj.totalInjections, true)}</span> follow-on cash, yielding{' '}
          <span className="text-teal-300 font-mono font-black">{formatMultiple(eqInj.sponsorMoicV3)}</span> MOIC &amp;{' '}
          <span className="text-teal-300 font-mono font-black">{formatPercent(eqInj.sponsorIrrV3)}</span> IRR on dated capital called.
        </h2>
      </div>

      {/* Capital Call & Exit Timeline */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Sponsor Dated Capital Call &amp; Distribution Timeline</span>
          </span>
          <span className="text-xs font-mono text-slate-400">Total Called: {formatCurrency(eqInj.totalSponsorCapitalCalled)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {eqInj.cashFlowTimeline.map((item) => {
            const isEntry = item.year === 2026;
            const isExit = item.year === 2030;
            return (
              <div
                key={item.year}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  isExit
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isEntry
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-rose-950/15 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-white">{item.year}{isEntry ? 'E (Close)' : 'E'}</span>
                  <span className={`text-[10px] font-bold uppercase ${isExit ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isExit ? 'Exit Net' : isEntry ? 'Initial S0' : 'Capital Call'}
                  </span>
                </div>
                <div className="my-2">
                  <span className={`font-mono text-lg font-black ${item.cashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(item.cashFlow, false, 0)}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {isExit
                    ? `Proceeds (${formatCurrency(eqInj.sponsorExitProceeds, true)}) less injection`
                    : isEntry
                    ? '100% Sponsor Equity'
                    : 'Cash flow deficit plug'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7x7 Sensitivity Heatmaps (MOIC & IRR) */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Sensitivity Heatmap: Exit Multiple vs. 2030E EBITDA</span>
            </h3>
            <p className="text-[11px] text-slate-400">Click any cell to apply that exit multiple and test immediate returns</p>
          </div>

          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedHeatmap('moic')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                selectedHeatmap === 'moic' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              MOIC Heatmap
            </button>
            <button
              type="button"
              onClick={() => setSelectedHeatmap('irr')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                selectedHeatmap === 'irr' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              IRR Heatmap
            </button>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                <th className="p-2 text-left bg-slate-900/80">Exit Multiple (Down) \ EBITDA (Across)</th>
                {sens.ebitdaMultipliers.map((m, i) => (
                  <th key={m} className="p-2 bg-slate-900/60 font-semibold">
                    <div>{m}x Base</div>
                    <div className="text-slate-500 font-normal">{formatCurrency(sens.impliedEbitdas[i], true)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {sens.exitMultiples.map((mult, rIdx) => {
                const isSelectedMult = Math.abs(mult - assumptions.exitMultiple) < 0.05;
                return (
                  <tr key={mult} className={isSelectedMult ? 'bg-teal-500/10' : ''}>
                    <td className="p-2.5 text-left font-bold text-white bg-slate-900/50 flex items-center justify-between">
                      <span>{mult.toFixed(1)}x</span>
                      {isSelectedMult && <span className="text-[9px] text-teal-400 font-mono">LIVE</span>}
                    </td>
                    {sens.ebitdaMultipliers.map((m, cIdx) => {
                      const cellMoic = sens.moicGrid[rIdx][cIdx];
                      const cellIrr = sens.irrGrid[rIdx][cIdx];
                      const valStr = selectedHeatmap === 'moic' ? formatMultiple(cellMoic) : formatPercent(cellIrr);

                      let bg = 'bg-slate-900/30';
                      let textColor = 'text-slate-300';

                      if (selectedHeatmap === 'moic') {
                        if (cellMoic >= 3.0) { bg = 'bg-emerald-950/60'; textColor = 'text-emerald-300'; }
                        else if (cellMoic >= 2.0) { bg = 'bg-emerald-900/40'; textColor = 'text-emerald-400'; }
                        else if (cellMoic >= 1.0) { bg = 'bg-amber-950/50'; textColor = 'text-amber-300'; }
                        else { bg = 'bg-rose-950/60'; textColor = 'text-rose-400'; }
                      } else {
                        if (cellIrr >= 0.25) { bg = 'bg-emerald-950/60'; textColor = 'text-emerald-300'; }
                        else if (cellIrr >= 0.15) { bg = 'bg-emerald-900/40'; textColor = 'text-emerald-400'; }
                        else if (cellIrr >= 0) { bg = 'bg-amber-950/50'; textColor = 'text-amber-300'; }
                        else { bg = 'bg-rose-950/60'; textColor = 'text-rose-400'; }
                      }

                      return (
                        <td
                          key={m}
                          onClick={() => setAssumption('exitMultiple', mult)}
                          className={`p-2.5 cursor-pointer hover:ring-2 hover:ring-teal-400 transition-all font-bold ${bg} ${textColor}`}
                          title={`Click to set exit multiple to ${mult}x`}
                        >
                          {valStr}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Break-Even Multiple Row */}
              <tr className="bg-slate-900 font-bold border-t-2 border-slate-700">
                <td className="p-2.5 text-left text-amber-400">Break-even Multiple (1.0x MOIC)</td>
                {sens.breakEvenMultiplePerRow.map((be, i) => (
                  <td key={i} className="p-2.5 text-amber-300 font-bold">
                    {formatMultiple(be, 2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tornado Sensitivity Chart */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span>Tornado Chart: Sensitivity to &plusmn;20% Flex on Key Assumptions</span>
            </h3>
            <p className="text-[11px] text-slate-400">Ranked by total swing on Sponsor MOIC (Base = {formatMultiple(baseMoic)})</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tornadoData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(2)}x`} />
              <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }}
                formatter={(val: any, name: any) => [`${formatMultiple(Number(val))}`, name === 'deltaUp' ? '+20% Shock' : '-20% Shock']}
              />
              <ReferenceLine x={baseMoic} stroke="#14b8a6" strokeWidth={2} label={{ value: `Base: ${baseMoic.toFixed(2)}x`, fill: '#14b8a6', fontSize: 10, position: 'top' }} />
              <Bar dataKey="moicUp" name="MOIC (+20%)" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="moicDown" name="MOIC (-20%)" fill="#f43f5e" radius={[4, 0, 0, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
