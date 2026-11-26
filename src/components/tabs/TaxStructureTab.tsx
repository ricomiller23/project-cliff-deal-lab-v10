import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Calculator, ShieldCheck, DollarSign, Layers } from 'lucide-react';

export const TaxStructureTab: React.FC = () => {
  const { assumptions, results, updateAssumption } = useDealStore();
  const tax = results.taxStructure;

  const totalPvSavings = tax.rocmont.pvTaxSavings + tax.salisbury.pvTaxSavings;
  const totalGrossUp = tax.rocmont.sellerGrossUp + tax.salisbury.sellerGrossUp;
  const totalNetValue = tax.rocmont.netValueDealStepUp + tax.salisbury.netValueDealStepUp;
  const totalEv = tax.rocmont.ev + tax.salisbury.ev;
  const totalNetValuePct = totalEv > 0 ? totalNetValue / totalEv : 0;
  const totalExcessSec197 = tax.rocmont.goodwillIntangibles + tax.salisbury.goodwillIntangibles;

  return (
    <div className="space-y-6">
      {/* Headline Takeaway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
          Tax Structure & Step-Up Valuation (Sheet: Tax_Structure)
        </div>
        <h1 className="text-xl font-bold text-white mt-1">
          Asset Purchase Delivers {formatCurrency(totalNetValue)} in Net Step-Up Value ({formatPercent(totalNetValuePct, 1)} of Enterprise Value)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Section 197 step-up yields {formatCurrency(totalPvSavings)} in 15-year tax shield PV, offsetting {formatCurrency(totalGrossUp)} in seller depreciation recapture gross-up obligations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase">
            <Calculator className="w-4 h-4" />
            Sec 197 Intangibles Step-Up
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalExcessSec197)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total amortizable excess</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
            <ShieldCheck className="w-4 h-4" />
            PV of Buyer Tax Shield
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalPvSavings)}
          </div>
          <div className="text-xs text-slate-500 mt-1">15 yrs @ {formatPercent(assumptions.taxShieldDiscountRate, 1)} discount</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
            <Layers className="w-4 h-4" />
            Deprec. Recapture Gross-Up
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalGrossUp)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Ordinary rate spread make-whole</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase">
            <DollarSign className="w-4 h-4" />
            Net Buyer Economic Value
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalNetValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{formatPercent(totalNetValuePct, 1)} of total EV</div>
        </div>
      </div>

      {/* Interactive Levers for Tax Rates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">Tax Structure Assumptions & Rate Levers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Buyer Tax Rate</span>
              <span className="text-white font-mono">{formatPercent(assumptions.buyerTaxRate, 1)}</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.35"
              step="0.005"
              value={assumptions.buyerTaxRate}
              onChange={(e) => updateAssumption('buyerTaxRate', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Sec 197 Amort</span>
              <span className="text-white font-mono">{assumptions.sec197AmortYears} yrs</span>
            </div>
            <input
              type="range"
              min="10"
              max="20"
              step="1"
              value={assumptions.sec197AmortYears}
              onChange={(e) => updateAssumption('sec197AmortYears', parseInt(e.target.value, 10))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Discount Rate</span>
              <span className="text-white font-mono">{formatPercent(assumptions.taxShieldDiscountRate, 1)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.18"
              step="0.005"
              value={assumptions.taxShieldDiscountRate}
              onChange={(e) => updateAssumption('taxShieldDiscountRate', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Seller Ordinary</span>
              <span className="text-white font-mono">{formatPercent(assumptions.sellerOrdinaryRate, 1)}</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.45"
              step="0.01"
              value={assumptions.sellerOrdinaryRate}
              onChange={(e) => updateAssumption('sellerOrdinaryRate', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>LTCG + NIIT</span>
              <span className="text-white font-mono">{formatPercent(assumptions.sellerLtcgNiitRate, 1)}</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.30"
              step="0.005"
              value={assumptions.sellerLtcgNiitRate}
              onChange={(e) => updateAssumption('sellerLtcgNiitRate', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Seller Basis %</span>
              <span className="text-white font-mono">{formatPercent(assumptions.sellerTaxBasisPct, 1)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.01"
              value={assumptions.sellerTaxBasisPct}
              onChange={(e) => updateAssumption('sellerTaxBasisPct', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Asset Step-Up Schedule by Entity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Value Creation Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Buyer Section 197 Step-Up & Shield PV</h3>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Asset Deal Basis
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2">Metric</th>
                <th className="pb-2 text-right">Rocmont</th>
                <th className="pb-2 text-right">Salisbury</th>
                <th className="pb-2 text-right text-emerald-400 font-semibold">Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2 text-slate-300 font-sans">Enterprise Value (EV)</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(tax.rocmont.ev)}</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(tax.salisbury.ev)}</td>
                <td className="py-2 text-right text-slate-100 font-bold">{formatCurrency(totalEv)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-2">(-) Net Fixed Assets (PPE)</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.rocmont.netFixedAssets)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.salisbury.netFixedAssets)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.rocmont.netFixedAssets + tax.salisbury.netFixedAssets)})</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-2">(-) Working Capital Acquired</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.rocmont.nwcAcquired)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.salisbury.nwcAcquired)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.rocmont.nwcAcquired + tax.salisbury.nwcAcquired)})</td>
              </tr>
              <tr className="bg-slate-800/40 font-semibold">
                <td className="py-2 text-slate-200 font-sans">Excess Allocable to Sec 197</td>
                <td className="py-2 text-right text-blue-300">{formatCurrency(tax.rocmont.goodwillIntangibles)}</td>
                <td className="py-2 text-right text-blue-300">{formatCurrency(tax.salisbury.goodwillIntangibles)}</td>
                <td className="py-2 text-right text-blue-200">{formatCurrency(totalExcessSec197)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans">Annual Sec 197 Amortization (15y)</td>
                <td className="py-2 text-right text-slate-300">{formatCurrency(tax.rocmont.annualAmort)}</td>
                <td className="py-2 text-right text-slate-300">{formatCurrency(tax.salisbury.annualAmort)}</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(tax.rocmont.annualAmort + tax.salisbury.annualAmort)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans">Annual Tax Shield Savings</td>
                <td className="py-2 text-right text-emerald-400">{formatCurrency(tax.rocmont.annualTaxSavings)}</td>
                <td className="py-2 text-right text-emerald-400">{formatCurrency(tax.salisbury.annualTaxSavings)}</td>
                <td className="py-2 text-right text-emerald-300">{formatCurrency(tax.rocmont.annualTaxSavings + tax.salisbury.annualTaxSavings)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-200 font-sans font-medium">PV of Tax Shield ({formatPercent(assumptions.taxShieldDiscountRate, 0)})</td>
                <td className="py-2 text-right text-emerald-400 font-semibold">{formatCurrency(tax.rocmont.pvTaxSavings)}</td>
                <td className="py-2 text-right text-emerald-400 font-semibold">{formatCurrency(tax.salisbury.pvTaxSavings)}</td>
                <td className="py-2 text-right text-emerald-300 font-bold">{formatCurrency(totalPvSavings)}</td>
              </tr>
              <tr>
                <td className="py-2 text-rose-400 font-sans pl-2">(-) Seller Gross-Up for Recapture</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.rocmont.sellerGrossUp)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.salisbury.sellerGrossUp)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(totalGrossUp)})</td>
              </tr>
              <tr className="bg-emerald-950/40 border-t border-emerald-800 text-emerald-300 font-bold text-sm">
                <td className="py-2.5 font-sans">Net Value to Buyer</td>
                <td className="py-2.5 text-right">{formatCurrency(tax.rocmont.netValueDealStepUp)}</td>
                <td className="py-2.5 text-right">{formatCurrency(tax.salisbury.netValueDealStepUp)}</td>
                <td className="py-2.5 text-right text-emerald-200">{formatCurrency(totalNetValue)}</td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2 font-sans">Net Value % of EV</td>
                <td className="py-2 text-right">{formatPercent(tax.rocmont.netValuePctEv, 1)}</td>
                <td className="py-2 text-right">{formatPercent(tax.salisbury.netValuePctEv, 1)}</td>
                <td className="py-2 text-right font-medium text-slate-200">{formatPercent(totalNetValuePct, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seller After-Tax Cash Proceeds Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Seller Net After-Tax Cash at Closing</h3>
            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
              Cash Proceeds
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2">Metric</th>
                <th className="pb-2 text-right">Rocmont</th>
                <th className="pb-2 text-right">Salisbury</th>
                <th className="pb-2 text-right text-slate-300 font-semibold">Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2 text-slate-300 font-sans">Gross Cash at Closing</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(tax.rocmont.sellerCashAtClose)}</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(tax.salisbury.sellerCashAtClose)}</td>
                <td className="py-2 text-right text-white font-bold">{formatCurrency(tax.rocmont.sellerCashAtClose + tax.salisbury.sellerCashAtClose)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-2">(-) Target Debt Retired</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.rocmont.sellerDebtRetired)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.salisbury.sellerDebtRetired)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.rocmont.sellerDebtRetired + tax.salisbury.sellerDebtRetired)})</td>
              </tr>
              <tr className="bg-slate-800/40 font-semibold">
                <td className="py-2 text-slate-200 font-sans">Net Cash to Seller (Pre-Tax)</td>
                <td className="py-2 text-right text-slate-100">{formatCurrency(tax.rocmont.sellerNetCash)}</td>
                <td className="py-2 text-right text-slate-100">{formatCurrency(tax.salisbury.sellerNetCash)}</td>
                <td className="py-2 text-right text-white font-bold">{formatCurrency(tax.rocmont.sellerNetCash + tax.salisbury.sellerNetCash)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-2">(-) Tax Basis Allocated ({formatPercent(assumptions.sellerTaxBasisPct, 0)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.rocmont.sellerNetCash * assumptions.sellerTaxBasisPct)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency(tax.salisbury.sellerNetCash * assumptions.sellerTaxBasisPct)})</td>
                <td className="py-2 text-right text-slate-400">({formatCurrency((tax.rocmont.sellerNetCash + tax.salisbury.sellerNetCash) * assumptions.sellerTaxBasisPct)})</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans">Taxable Gain on Cash</td>
                <td className="py-2 text-right text-slate-300">{formatCurrency(tax.rocmont.sellerNetCash * (1 - assumptions.sellerTaxBasisPct))}</td>
                <td className="py-2 text-right text-slate-300">{formatCurrency(tax.salisbury.sellerNetCash * (1 - assumptions.sellerTaxBasisPct))}</td>
                <td className="py-2 text-right text-slate-200 font-medium">{formatCurrency((tax.rocmont.sellerNetCash + tax.salisbury.sellerNetCash) * (1 - assumptions.sellerTaxBasisPct))}</td>
              </tr>
              <tr>
                <td className="py-2 text-rose-400 font-sans pl-2">(-) Estimated Taxes on Cash</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.rocmont.sellerTaxOnCash)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.salisbury.sellerTaxOnCash)})</td>
                <td className="py-2 text-right text-rose-400">({formatCurrency(tax.rocmont.sellerTaxOnCash + tax.salisbury.sellerTaxOnCash)})</td>
              </tr>
              <tr className="bg-blue-950/40 border-t border-blue-800 text-blue-300 font-bold text-sm">
                <td className="py-2.5 font-sans">Net After-Tax Cash to Seller</td>
                <td className="py-2.5 text-right">{formatCurrency(tax.rocmont.sellerAfterTaxCash)}</td>
                <td className="py-2.5 text-right">{formatCurrency(tax.salisbury.sellerAfterTaxCash)}</td>
                <td className="py-2.5 text-right text-blue-200">{formatCurrency(tax.rocmont.sellerAfterTaxCash + tax.salisbury.sellerAfterTaxCash)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-slate-800/40 rounded-lg text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Negotiation Note:</div>
            <div>
              Because Salisbury has $1.68M in accumulated depreciation, an asset sale triggers significant ordinary income recapture. If the seller demands a stock deal to avoid recapture, the buyer gives up {formatCurrency(tax.salisbury.pvTaxSavings)} in Salisbury tax shield PV ({formatCurrency(totalPvSavings)} combined).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
