import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, AlertCircle, FileSpreadsheet, Layers, Filter } from 'lucide-react';
import { ScenarioId } from '../../engine/types';
import { calcThreeStatement } from '../../engine/threeStatement';

export const ThreeStatementTab: React.FC = () => {
  const { assumptions } = useDealStore();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>(assumptions.activeScenario);

  // Compute 3-statement pro forma for the chosen scenario
  const stmtYears = calcThreeStatement(assumptions, selectedScenario);

  const isAllBalanced = stmtYears.every((y) => Math.abs(y.balanceCheck) < 0.01);

  return (
    <div className="space-y-6">
      {/* Headline Takeaway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Financial Statements (Sheet: ThreeStmt)
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Pro Forma Income Statement, Cash Flow, & Balance Sheet
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Fully reconciled pro forma model across 2026–2030 with continuous working capital and exact balance sheet equality.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAllBalanced ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-semibold rounded-xl shadow">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Balance Check = $0.00 across all 5 years</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs font-semibold rounded-xl shadow">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Balance Sheet Discrepancy Detected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Segmented Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">Selected Financial Statement Scenario:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['mgmt', 'base', 'downside'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setSelectedScenario(sc)}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                selectedScenario === sc
                  ? 'bg-blue-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {sc === 'mgmt' ? 'Management Plan' : sc === 'base' ? 'Run-Rate Base' : 'Downside Stress'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Statements Tables Container */}
      <div className="space-y-8">
        {/* Income Statement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-semibold text-white">
              Income Statement ($) — {selectedScenario === 'mgmt' ? 'Management Plan' : selectedScenario === 'base' ? 'Run-Rate Base' : 'Downside Stress'}
            </h3>
          </div>

          <table className="w-full text-xs text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2 w-1/3">Line Item</th>
                {stmtYears.map((y) => (
                  <th key={y.year} className="pb-2 text-right">
                    {y.year === 2026 ? '2026 Close' : `${y.year}E`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2 text-slate-200 font-sans font-semibold">Total Revenue</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-100 font-semibold">
                    {formatCurrency(y.revenue)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-200 font-sans font-semibold">Adjusted EBITDA</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-emerald-400 font-semibold">
                    {y.year === 2026 ? '—' : formatCurrency(y.ebitda)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Depreciation & Amortization</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.dna)})`}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/30">
                <td className="py-2 text-slate-300 font-sans font-medium">Operating Income (EBIT)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-200">
                    {y.year === 2026 ? '—' : formatCurrency(y.ebit)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Senior Debt Interest</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.seniorInterest)})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Seller Note Interest</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.sellerInterest)})`}
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-950/30 border-t border-blue-900/60 font-bold">
                <td className="py-2 text-blue-200 font-sans">Pre-Tax Net Income</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-blue-300">
                    {y.year === 2026 ? '—' : formatCurrency(y.netIncomePreTax)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cash Flow Statement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Cash Flow Statement ($)</h3>
          </div>

          <table className="w-full text-xs text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2 w-1/3">Line Item</th>
                {stmtYears.map((y) => (
                  <th key={y.year} className="pb-2 text-right">
                    {y.year === 2026 ? '2026 Close' : `${y.year}E`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="font-semibold text-slate-300">
                <td className="py-2 font-sans">Cash Flow from Operations (CFO)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-200">
                    {y.year === 2026 ? '—' : formatCurrency(y.cfo)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Capital Expenditures (Capex)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.capex)})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Senior Debt Principal Repayment</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.seniorRepayment)})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Seller Notes Principal Repayment</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.sellerRepayment)})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Salisbury Deferred Consideration</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.deferredPaid)})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-sans pl-3">(-) Tax Distributions</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-400">
                    {y.year === 2026 ? '—' : `(${formatCurrency(y.taxDistributions)})`}
                  </td>
                ))}
              </tr>
              <tr className="bg-emerald-950/20">
                <td className="py-2 text-emerald-400 font-sans pl-3">(+) Follow-On Equity Injections</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-emerald-400">
                    {formatCurrency(y.equityInjections)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/40 font-bold border-t border-slate-700">
                <td className="py-2 text-white font-sans">Net Cash Flow</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-white">
                    {formatCurrency(y.netChangeInCash)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Balance Sheet */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Balance Sheet ($)</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Assets = Liabilities + Equity
            </div>
          </div>

          <table className="w-full text-xs text-left min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2 w-1/3">Balance Sheet Line Item</th>
                {stmtYears.map((y) => (
                  <th key={y.year} className="pb-2 text-right">
                    {y.year === 2026 ? '2026 Close' : `${y.year}E`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="bg-slate-800/20 text-slate-200 font-semibold">
                <td className="py-2 font-sans" colSpan={6}>ASSETS</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Cash & Cash Equivalents</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-emerald-400">
                    {formatCurrency(y.bsCash)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Net Working Capital (A/R, Inv, A/P)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsNwc)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Net Property, Plant & Equip (PP&E)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsNetPpe)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Goodwill & Intangibles</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsGoodwill)}
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-950/40 text-blue-300 font-bold border-t border-b border-blue-900/60">
                <td className="py-2 font-sans">TOTAL ASSETS</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right">
                    {formatCurrency(y.totalAssets)}
                  </td>
                ))}
              </tr>

              <tr className="bg-slate-800/20 text-slate-200 font-semibold">
                <td className="py-2 font-sans pt-4" colSpan={6}>LIABILITIES & EQUITY</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Senior Term Debt</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsSeniorLoan)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Rocmont Seller Note</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsRocmontNote)}
                  </td>
                ))}
              </tr>
              {assumptions.includeKnighthawk && (
                <tr>
                  <td className="py-2 text-slate-300 font-sans pl-3">Knighthawk Seller Note</td>
                  {stmtYears.map((y) => (
                    <td key={y.year} className="py-2 text-right text-slate-300">
                      {formatCurrency(y.bsKnighthawkNote)}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Salisbury Deferred Consideration</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-300">
                    {formatCurrency(y.bsSalisburyDeferred)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/30 font-semibold">
                <td className="py-2 text-slate-200 font-sans pl-3">Total Debt & Deferred</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-slate-200">
                    {formatCurrency(y.totalDebt)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-slate-300 font-sans pl-3">Book Equity (Capital + Retained Earnings)</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right text-purple-300">
                    {formatCurrency(y.totalEquity)}
                  </td>
                ))}
              </tr>
              <tr className="bg-purple-950/40 text-purple-300 font-bold border-t border-b border-purple-900/60">
                <td className="py-2 font-sans">TOTAL LIABILITIES & EQUITY</td>
                {stmtYears.map((y) => (
                  <td key={y.year} className="py-2 text-right">
                    {formatCurrency(y.totalLiabilitiesAndEquity)}
                  </td>
                ))}
              </tr>

              {/* Exact Balance Check */}
              <tr className="bg-slate-950 font-bold">
                <td className="py-2.5 font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  BALANCE CHECK (Assets - Liab&Eq)
                </td>
                {stmtYears.map((y) => (
                  <td
                    key={y.year}
                    className={`py-2.5 text-right font-mono ${
                      Math.abs(y.balanceCheck) < 0.01 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {Math.abs(y.balanceCheck) < 0.01 ? '$0.00' : formatCurrency(y.balanceCheck)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
