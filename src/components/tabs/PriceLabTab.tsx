import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent, formatMultiple } from '../../utils/formatters';
import { DollarSign, Scale, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export const PriceLabTab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const po = results.priceOptimizer;

  const deals = [po.rocmont, po.salisbury];
  if (assumptions.includeKnighthawk) {
    deals.push(po.knighthawk);
  }

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            PURCHASE PRICE &amp; STRUCTURE OPTIMIZER (MODEL 6)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Repricing Salisbury to {formatMultiple(assumptions.targetEvRunRateEbitda, 1)} run-rate EBITDA cuts enterprise value by{' '}
          <span className="text-rose-400 font-mono font-black">{formatPercent(po.salisbury.altB_Reprice.priceChangePct)}</span> (to{' '}
          <span className="text-teal-300 font-mono font-black">{formatCurrency(po.salisbury.altB_Reprice.headlineEv)}</span>), reducing platform closing cash need by{' '}
          <span className="text-emerald-400 font-mono font-black">{formatCurrency(po.platformCashNeed.altA.totalCashUses - po.platformCashNeed.altB.totalCashUses, true)}</span>.
        </h2>
      </div>

      {/* Target Levers Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0d1322] border border-slate-800 font-mono text-xs">
        <div className="space-y-1">
          <span className="text-slate-400">Target EV / Run-Rate EBITDA:</span>
          <div className="font-bold text-teal-300">{formatMultiple(assumptions.targetEvRunRateEbitda, 1)}</div>
          <input
            type="range"
            min={3.0}
            max={6.5}
            step={0.25}
            value={assumptions.targetEvRunRateEbitda}
            onChange={(e) => setAssumption('targetEvRunRateEbitda', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Deferred Discount Rate:</span>
          <div className="font-bold text-white">{formatPercent(assumptions.deferredDiscountRate)}</div>
          <input
            type="range"
            min={0.06}
            max={0.16}
            step={0.01}
            value={assumptions.deferredDiscountRate}
            onChange={(e) => setAssumption('deferredDiscountRate', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Alt C: Upfront Cash %:</span>
          <div className="font-bold text-white">{formatPercent(assumptions.altCUpfrontCashPct)}</div>
          <input
            type="range"
            min={0.30}
            max={0.70}
            step={0.05}
            value={assumptions.altCUpfrontCashPct}
            onChange={(e) => setAssumption('altCUpfrontCashPct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Alt C: Earnout Probability:</span>
          <div className="font-bold text-amber-300">{formatPercent(assumptions.altCEarnoutProb)}</div>
          <input
            type="range"
            min={0.25}
            max={0.90}
            step={0.05}
            value={assumptions.altCEarnoutProb}
            onChange={(e) => setAssumption('altCEarnoutProb', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      </div>

      {/* Side-by-Side Deal Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {deals.map((deal) => (
          <div key={deal.dealName} className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">{deal.dealName}: Structure Comparison</h3>
              <span className="text-[10px] text-teal-400 font-bold">A vs B vs C</span>
            </div>

            <table className="w-full text-right text-[11px] border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-1.5">Metric</th>
                  <th className="py-1.5 text-slate-300">A: LOI</th>
                  <th className="py-1.5 text-teal-400">B: Reprice (Mix)</th>
                  <th className="py-1.5 text-cyan-400">C: Earnout-Heavy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                <tr>
                  <td className="text-left py-1.5 text-white font-semibold">Headline EV</td>
                  <td className="font-bold text-white">{formatCurrency(deal.altA_Loi.headlineEv)}</td>
                  <td className="font-bold text-teal-300">{formatCurrency(deal.altB_Reprice.headlineEv)}</td>
                  <td className="font-bold text-cyan-300">{formatCurrency(deal.altC_EarnoutHeavy.headlineEv)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Upfront Cash (inc. debt)</td>
                  <td>{formatCurrency(deal.altA_Loi.upfrontCash)}</td>
                  <td>{formatCurrency(deal.altB_Reprice.upfrontCash)}</td>
                  <td>{formatCurrency(deal.altC_EarnoutHeavy.upfrontCash)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Seller Rollover Equity</td>
                  <td>{formatCurrency(deal.altA_Loi.rollover)}</td>
                  <td>{formatCurrency(deal.altB_Reprice.rollover)}</td>
                  <td>{formatCurrency(deal.altC_EarnoutHeavy.rollover)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Deferred / Earnout (Face)</td>
                  <td>{formatCurrency(deal.altA_Loi.deferredFace)}</td>
                  <td>{formatCurrency(deal.altB_Reprice.deferredFace)}</td>
                  <td>{formatCurrency(deal.altC_EarnoutHeavy.deferredFace)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Expected PV of Deferred</td>
                  <td>{formatCurrency(deal.altA_Loi.deferredPv)}</td>
                  <td>{formatCurrency(deal.altB_Reprice.deferredPv)}</td>
                  <td>{formatCurrency(deal.altC_EarnoutHeavy.deferredPv)}</td>
                </tr>
                <tr className="bg-slate-900/60 font-bold text-white">
                  <td className="text-left py-2">Expected Value to Seller</td>
                  <td className="text-slate-200">{formatCurrency(deal.altA_Loi.expectedSellerValue)}</td>
                  <td className="text-teal-300">{formatCurrency(deal.altB_Reprice.expectedSellerValue)}</td>
                  <td className="text-cyan-300">{formatCurrency(deal.altC_EarnoutHeavy.expectedSellerValue)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">EV / Run-Rate EBITDA</td>
                  <td>{formatMultiple(deal.altA_Loi.evRunRateEbitda)}</td>
                  <td className="text-teal-400 font-bold">{formatMultiple(deal.altB_Reprice.evRunRateEbitda)}</td>
                  <td className="text-cyan-400 font-bold">{formatMultiple(deal.altC_EarnoutHeavy.evRunRateEbitda)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Expected Val / Run-Rate</td>
                  <td>{formatMultiple(deal.altA_Loi.expectedValueRunRateEbitda)}</td>
                  <td>{formatMultiple(deal.altB_Reprice.expectedValueRunRateEbitda)}</td>
                  <td>{formatMultiple(deal.altC_EarnoutHeavy.expectedValueRunRateEbitda)}</td>
                </tr>
                <tr>
                  <td className="text-left py-1.5">Price Change vs LOI</td>
                  <td>—</td>
                  <td className={deal.altB_Reprice.priceChangePct < 0 ? 'text-rose-400 font-bold' : ''}>
                    {formatPercent(deal.altB_Reprice.priceChangePct)}
                  </td>
                  <td className={deal.altC_EarnoutHeavy.priceChangePct < 0 ? 'text-rose-400 font-bold' : ''}>
                    {formatPercent(deal.altC_EarnoutHeavy.priceChangePct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Platform Cash Need vs Debt Capacity */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3 font-mono text-xs">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          Platform Cash Need at Close Under Each Alternative (Rocmont + Salisbury)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Alternative A: As Signed LOIs', data: po.platformCashNeed.altA, color: 'text-white' },
            { title: 'Alternative B: Repriced to 4.5x Run-Rate', data: po.platformCashNeed.altB, color: 'text-teal-300' },
            { title: 'Alternative C: Repriced & Earnout-Heavy', data: po.platformCashNeed.altC, color: 'text-cyan-300' },
          ].map((alt) => (
            <div key={alt.title} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className={`font-bold text-xs block ${alt.color}`}>{alt.title}</span>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between py-0.5 border-b border-slate-850">
                  <span className="text-slate-400">Upfront Cash to Sellers:</span>
                  <span>{formatCurrency(alt.data.upfrontCash)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-850">
                  <span className="text-slate-400">Closing Fees:</span>
                  <span>{formatCurrency(alt.data.closingFees)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-850">
                  <span className="text-slate-400">Refinance Legacy Debt:</span>
                  <span>{formatCurrency(alt.data.refiLegacy)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-white bg-slate-850 px-1.5 rounded">
                  <span>Total Cash Uses:</span>
                  <span>{formatCurrency(alt.data.totalCashUses)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Sponsor Cash (Loan = $4.8M):</span>
                  <span className="font-bold text-white">{formatCurrency(alt.data.sponsorCashAtLoanInputs)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-amber-300 bg-amber-950/20 px-1.5 rounded">
                  <span>Sponsor Cash (Loan @ Capacity {formatCurrency(results.baseDebtSizing.maxSeniorLoanAtCurrentAmort, true)}):</span>
                  <span>{formatCurrency(alt.data.sponsorCashAtCapacity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
