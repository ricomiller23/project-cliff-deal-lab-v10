import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent, formatMultiple } from '../../utils/formatters';
import { CheckCircle2, AlertCircle, Building, DollarSign, Layers, Shield } from 'lucide-react';
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

export const DealStructureTab: React.FC = () => {
  const { results, assumptions, setAssumption } = useDealStore();
  const su = results.sourcesAndUses;

  const chartData = [
    {
      name: 'Total Capital',
      'Senior Loan': su.sources.seniorTermLoan,
      'Seller Notes': su.sources.sellerNotes,
      'Rollover Equity': su.sources.sellerRolloverEquity,
      'Sponsor Equity': su.sources.sponsorCashEquity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            DEAL STRUCTURE &amp; SOURCES &amp; USES
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Total Uses of <span className="text-teal-300 font-mono font-black">{formatCurrency(su.uses.totalUses)}</span> funded by{' '}
          <span className="text-cyan-400 font-mono font-black">{formatCurrency(su.sources.seniorTermLoan)}</span> senior debt,{' '}
          <span className="text-amber-400 font-mono font-black">{formatCurrency(su.sources.sellerNotes)}</span> seller notes/deferred, and{' '}
          <span className="text-emerald-400 font-mono font-black">{formatCurrency(su.sources.sponsorCashEquity)}</span> sponsor cash equity.
        </h2>
      </div>

      {/* Sources & Uses Side-by-Side Tables with Check Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* USES TABLE */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Uses of Funds at Close</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">Total: {formatCurrency(su.uses.totalUses)}</span>
          </div>

          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-400 text-[10.5px] border-b border-slate-800">
                <th className="text-left py-1.5">Use Item</th>
                <th className="text-right py-1.5">Amount ($)</th>
                <th className="text-right py-1.5">% of Total</th>
                <th className="text-right py-1.5">x 2026 Run-rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              <tr>
                <td className="py-2 text-white font-semibold">Rocmont Enterprise Value</td>
                <td className="text-right font-bold text-white">{formatCurrency(su.uses.rocmontEv)}</td>
                <td className="text-right">{formatPercent(su.uses.rocmontEv / su.uses.totalUses)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.uses.rocmontEv / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr>
                <td className="py-2 text-white font-semibold">Salisbury Enterprise Value</td>
                <td className="text-right font-bold text-white">{formatCurrency(su.uses.salisburyEv)}</td>
                <td className="text-right">{formatPercent(su.uses.salisburyEv / su.uses.totalUses)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.uses.salisburyEv / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              {assumptions.includeKnighthawk && (
                <tr>
                  <td className="py-2 text-white font-semibold">Knighthawk Enterprise Value</td>
                  <td className="text-right font-bold text-white">{formatCurrency(su.uses.knighthawkEv)}</td>
                  <td className="text-right">{formatPercent(su.uses.knighthawkEv / su.uses.totalUses)}</td>
                  <td className="text-right text-slate-400">{formatMultiple(su.uses.knighthawkEv / results.baseModel.years[1].totalEbitda)}</td>
                </tr>
              )}
              <tr>
                <td className="py-2">Closing &amp; Financing Fees ({formatPercent(assumptions.closingFeePct)})</td>
                <td className="text-right text-slate-300">{formatCurrency(su.uses.closingFees)}</td>
                <td className="text-right">{formatPercent(su.uses.closingFees / su.uses.totalUses)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.uses.closingFees / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr>
                <td className="py-2">Refinance FP/FIX Legacy Debt</td>
                <td className="text-right text-slate-300">{formatCurrency(su.uses.refinanceFpLegacyDebt)}</td>
                <td className="text-right">{formatPercent(su.uses.refinanceFpLegacyDebt / su.uses.totalUses)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.uses.refinanceFpLegacyDebt / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              {assumptions.buySalisburyRe && (
                <tr>
                  <td className="py-2">Buy 50% Salisbury Real Estate</td>
                  <td className="text-right text-slate-300">{formatCurrency(su.uses.buySalisburyRe)}</td>
                  <td className="text-right">{formatPercent(su.uses.buySalisburyRe / su.uses.totalUses)}</td>
                  <td className="text-right text-slate-400">—</td>
                </tr>
              )}
              <tr className="bg-slate-900/60 font-bold text-white">
                <td className="py-2.5">TOTAL USES</td>
                <td className="text-right text-teal-300">{formatCurrency(su.uses.totalUses)}</td>
                <td className="text-right">100.0%</td>
                <td className="text-right">{formatMultiple(su.uses.totalUses / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SOURCES TABLE */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Sources of Funds at Close</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">Total: {formatCurrency(su.sources.totalSources)}</span>
          </div>

          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-400 text-[10.5px] border-b border-slate-800">
                <th className="text-left py-1.5">Source Item</th>
                <th className="text-right py-1.5">Amount ($)</th>
                <th className="text-right py-1.5">% of Total</th>
                <th className="text-right py-1.5">x 2026 Run-rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              <tr>
                <td className="py-2 text-white font-semibold">Senior Term Loan ({formatPercent(assumptions.seniorLoanRate)})</td>
                <td className="text-right font-bold text-cyan-300">{formatCurrency(su.sources.seniorTermLoan)}</td>
                <td className="text-right">{formatPercent(su.sources.seniorTermLoan / su.sources.totalSources)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.sources.seniorTermLoan / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr>
                <td className="py-2 text-white font-semibold">Seller Notes / Deferred Consideration</td>
                <td className="text-right font-bold text-amber-300">{formatCurrency(su.sources.sellerNotes)}</td>
                <td className="text-right">{formatPercent(su.sources.sellerNotes / su.sources.totalSources)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.sources.sellerNotes / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr>
                <td className="py-2">Seller Rollover Equity</td>
                <td className="text-right text-slate-300">{formatCurrency(su.sources.sellerRolloverEquity)}</td>
                <td className="text-right">{formatPercent(su.sources.sellerRolloverEquity / su.sources.totalSources)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.sources.sellerRolloverEquity / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr>
                <td className="py-2">Platform Cash Contributed</td>
                <td className="text-right text-slate-300">{formatCurrency(su.sources.platformCash)}</td>
                <td className="text-right">{formatPercent(su.sources.platformCash / su.sources.totalSources)}</td>
                <td className="text-right text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2 text-emerald-400 font-bold">Sponsor Cash Equity (Plug)</td>
                <td className="text-right font-bold text-emerald-300">{formatCurrency(su.sources.sponsorCashEquity)}</td>
                <td className="text-right font-bold text-emerald-400">{formatPercent(su.sources.sponsorCashEquity / su.sources.totalSources)}</td>
                <td className="text-right text-slate-400">{formatMultiple(su.sources.sponsorCashEquity / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
              <tr className="bg-slate-900/60 font-bold text-white">
                <td className="py-2.5">TOTAL SOURCES</td>
                <td className="text-right text-teal-300">{formatCurrency(su.sources.totalSources)}</td>
                <td className="text-right">100.0%</td>
                <td className="text-right">{formatMultiple(su.sources.totalSources / results.baseModel.years[1].totalEbitda)}</td>
              </tr>
            </tbody>
          </table>

          {/* Validation Check Box */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sources Minus Uses Reconciliation Check:</span>
            </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(su.sources.check, false, 2)} (Exact 0)
            </span>
          </div>
        </div>
      </div>

      {/* LOI Term Cards per Deal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rocmont Card */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">Rocmont Industrial</h4>
            <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono text-teal-300 font-bold">
              Signed LOI (10/15/25)
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Enterprise Value:</span>
              <span className="font-bold text-white">{formatCurrency(assumptions.rocmontLoi.ev)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Cash at Closing:</span>
              <span className="text-white">{formatCurrency(assumptions.rocmontLoi.cashAtClosing)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Debt Retired:</span>
              <span className="text-rose-400">{formatCurrency(assumptions.rocmontLoi.targetDebtRetired)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Net Cash to Seller:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(assumptions.rocmontLoi.cashAtClosing - assumptions.rocmontLoi.targetDebtRetired)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rollover %:</span>
              <span className="text-white">{formatPercent(assumptions.rocmontLoi.rolloverPct)} ({formatCurrency(assumptions.rocmontLoi.ev * assumptions.rocmontLoi.rolloverPct)})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Seller Note:</span>
              <span className="text-amber-300">{formatCurrency(assumptions.rocmontLoi.sellerNote)} @ {formatPercent(assumptions.rocmontLoi.sellerNoteRate)}, 36mo balloon</span>
            </div>
          </div>
        </div>

        {/* Salisbury Card */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">Salisbury Plumbing</h4>
            <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono text-teal-300 font-bold">
              Signed LOI (9/10/25)
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Enterprise Value:</span>
              <span className="font-bold text-white">{formatCurrency(assumptions.salisburyLoi.ev)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Cash at Closing:</span>
              <span className="text-white">{formatCurrency(assumptions.salisburyLoi.cashAtClosing)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Debt Retired:</span>
              <span className="text-rose-400">{formatCurrency(assumptions.salisburyLoi.targetDebtRetired)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Net Cash to Seller:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(assumptions.salisburyLoi.cashAtClosing - assumptions.salisburyLoi.targetDebtRetired)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rollover %:</span>
              <span className="text-white">{formatPercent(assumptions.salisburyLoi.rolloverPct)} ({formatCurrency(assumptions.salisburyLoi.ev * assumptions.salisburyLoi.rolloverPct)})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Deferred Consideration:</span>
              <span className="text-amber-300">{formatCurrency(assumptions.salisburyLoi.sellerNote)} in 5 equal annual payments</span>
            </div>
          </div>
        </div>

        {/* Real Estate Collateral Card */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Real Estate Collateral</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Appraisals 9/10/26</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rocmont Appraised (As-Is):</span>
              <span className="font-bold text-white">{formatCurrency(su.realEstateCollateral.rocmontAppraisal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rocmont Land on Books:</span>
              <span className="text-slate-400">{formatCurrency(su.realEstateCollateral.rocmontBookLand)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Unrecorded RE Value:</span>
              <span className="text-teal-400 font-bold">{formatCurrency(su.realEstateCollateral.rocmontUnrecordedReValue)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Salisbury Appraised:</span>
              <span className="text-white">{formatCurrency(su.realEstateCollateral.salisburyAppraisal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Lendable RE Value (50% adv):</span>
              <span className="font-bold text-cyan-300">{formatCurrency(su.realEstateCollateral.lendableValue)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Loan % of Lendable RE:</span>
              <span className="text-amber-400 font-bold">{formatPercent(su.realEstateCollateral.seniorLoanPctOfLendable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
