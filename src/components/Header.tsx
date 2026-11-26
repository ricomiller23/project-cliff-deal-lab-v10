import React, { useState } from 'react';
import { useDealStore, TabId } from '../store/useDealStore';
import { formatCurrency, formatMultiple, formatPercent } from '../utils/formatters';
import { exportToJson, exportToXlsx, triggerPrintPdf } from '../utils/exporter';
import {
  Mountain,
  Undo2,
  Redo2,
  RotateCcw,
  Sliders,
  Scale,
  Columns,
  Share2,
  Download,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  FileJson,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DEFAULT_ASSUMPTIONS } from '../engine/defaults';

export const Header: React.FC = () => {
  const {
    assumptions,
    results,
    setScenario,
    applyPreset,
    resetAll,
    undo,
    redo,
    history,
    future,
    theme,
    toggleTheme,
    diffDrawerOpen,
    setDiffDrawerOpen,
    goalSeekModalOpen,
    setGoalSeekModalOpen,
    scenarioCompareOpen,
    setScenarioCompareOpen,
    setTourStep,
    getShareableUrl,
  } = useDealStore();

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Count changed assumptions vs defaults
  const changedCount = Object.keys(DEFAULT_ASSUMPTIONS).filter(k => {
    const key = k as keyof typeof DEFAULT_ASSUMPTIONS;
    return JSON.stringify(assumptions[key]) !== JSON.stringify(DEFAULT_ASSUMPTIONS[key]);
  }).length;

  const activeModel = results.activeModel;
  const activeEquityInj = results.activeEquityInjection;
  const su = results.sourcesAndUses;

  const moic = activeEquityInj.sponsorMoicV3;
  const irr = activeEquityInj.sponsorIrrV3;
  const sponsorEquity = su.sources.sponsorCashEquity;
  const followOnEquity = activeEquityInj.totalInjections;
  const minDscr = activeModel.minDscr;
  const totalDebt = activeModel.years[1].totalDebtClosing;
  const runRateEbitda = results.baseModel.years[1].totalEbitda;
  const debtToEbitda = runRateEbitda > 0 ? totalDebt / runRateEbitda : 0;
  const probLoss = results.monteCarlo.probMoicLoss;

  const handleCopyShare = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070a13]/95 backdrop-blur-md shadow-2xl">
      {/* Top Brand & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-700/10 border border-teal-500/40 text-teal-400 shadow-lg shadow-teal-500/10">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                PROJECT CLIFF <span className="text-teal-400 font-normal">DEAL LAB</span>
              </span>
              <span className="rounded-md bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-300">
                V3 LIVE MODEL
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              4-Contractor M&amp;A Roll-Up • Instant Calculation Engine • Datasite Data Room Sourced
            </p>
          </div>
        </div>

        {/* Operating Scenario Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setScenario('mgmt')}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
              assumptions.activeScenario === 'mgmt'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Management Plan
          </button>
          <button
            type="button"
            onClick={() => setScenario('base')}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
              assumptions.activeScenario === 'base'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Run-Rate Base
          </button>
          <button
            type="button"
            onClick={() => setScenario('downside')}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
              assumptions.activeScenario === 'downside'
                ? 'bg-gradient-to-r from-coral-500 to-rose-600 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Downside
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Presets Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPresetMenuOpen(!presetMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {presetMenuOpen && (
              <div
                className="absolute left-0 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-800 bg-[#0d1322] p-1.5 shadow-2xl z-50 text-xs"
                onMouseLeave={() => setPresetMenuOpen(false)}
              >
                {[
                  { name: 'As signed LOIs', desc: 'Standard Base run-rate model with $4.8M senior debt' },
                  { name: 'Lender-friendly (loan sized to 1.25x DSCR)', desc: 'Senior loan sized to debt capacity ($1.77M)' },
                  { name: 'Reprice to 4.5x run-rate', desc: 'Salisbury to $2.06M, Rocmont to $4.85M' },
                  { name: 'Management case', desc: 'May 2026 management plan projections' },
                  { name: 'Stress', desc: 'Downside with -15% rev haircut & -5 pts margin' },
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      applyPreset(p.name);
                      setPresetMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Goal Seek */}
          <button
            type="button"
            onClick={() => setGoalSeekModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
            title="Goal Seek Solver"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Goal Seek</span>
          </button>

          {/* Scenario Compare */}
          <button
            type="button"
            onClick={() => setScenarioCompareOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
            title="Compare Scenarios"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Compare</span>
          </button>

          {/* Diff Drawer Toggle */}
          <button
            type="button"
            onClick={() => setDiffDrawerOpen(!diffDrawerOpen)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
              changedCount > 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-white'
            }`}
            title="View changed assumptions vs defaults"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diff</span>
            {changedCount > 0 && (
              <span className="rounded-full bg-amber-500/30 text-amber-200 px-1 py-0.2 text-[9px] font-mono font-bold">
                {changedCount}
              </span>
            )}
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Share URL */}
          <button
            type="button"
            onClick={handleCopyShare}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-xs text-slate-300 hover:text-white"
            title="Copy shareable URL hash with live assumptions"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-mono">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/10 px-2.5 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-teal-400" />
            </button>
            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-800 bg-[#0d1322] p-1.5 shadow-2xl z-50 text-xs"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    exportToXlsx(assumptions, results);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export to Excel (XLSX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerPrintPdf();
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
                >
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>Print PDF One-Pager</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportToJson(assumptions, results);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span>Export JSON State</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset All */}
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-1.5 text-slate-400 hover:text-rose-400"
            title="Reset All Assumptions to Defaults (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Tour Walkthrough Button */}
          <button
            type="button"
            onClick={() => setTourStep(0)}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-1.5 text-teal-400 hover:text-white"
            title="Start Guided Tour"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sticky KPI Summary Strip (12-column responsive layout) */}
      <div className="bg-[#0b101c]/90 px-4 py-1.5 text-xs font-mono border-b border-slate-800/40 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between gap-4 min-w-[980px]">
          {/* MOIC */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">SPONSOR MOIC:</span>
            <span className={`font-bold text-xs px-1.5 py-0.2 rounded ${
              moic >= 2.0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : moic >= 1.0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {formatMultiple(moic)}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* IRR */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">SPONSOR IRR:</span>
            <span className={`font-bold text-xs ${irr >= 0.20 ? 'text-emerald-400' : irr >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatPercent(irr)}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Equity Cheque at Close */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">EQUITY AT CLOSE:</span>
            <span className="text-white font-bold text-xs">{formatCurrency(sponsorEquity, true)}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Follow-on Equity Needed */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">FOLLOW-ON NEEDED:</span>
            <span className={`font-bold text-xs ${followOnEquity > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {followOnEquity > 0 ? formatCurrency(followOnEquity, true) : '$0'}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Min Senior DSCR */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">TOTAL DEBT DSCR:</span>
            <span className={`font-bold text-xs px-1.5 py-0.2 rounded ${
              minDscr >= 1.25
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : minDscr >= 1.0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {formatMultiple(minDscr)}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Debt / EBITDA at Close */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">DEBT / RUN-RATE EBITDA:</span>
            <span className={`font-bold text-xs ${debtToEbitda > 4.5 ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatMultiple(debtToEbitda)}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Monte Carlo Loss Probability */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10.5px]">LOSS PROB (P&lt;1.0x):</span>
            <span className={`font-bold text-xs ${probLoss > 0.30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatPercent(probLoss)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
