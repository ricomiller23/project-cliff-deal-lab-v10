import React, { useState } from 'react';
import { useDealStore } from '../store/useDealStore';
import { INPUT_METADATA, DEFAULT_ASSUMPTIONS } from '../engine/defaults';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  RotateCcw,
  Search,
  DollarSign,
  Briefcase,
  TrendingUp,
  Percent,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatPercent, formatMultiple, formatNumber } from '../utils/formatters';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<SectionProps> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-slate-800/60">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-teal-400">{icon}</span>
        <span>{title}</span>
      </div>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>}
  </div>
);

interface InputRowProps {
  metaKey: string;
  value: number;
  onChange: (val: number) => void;
  onReset: () => void;
  defaultValue: number;
}

const SliderInputRow: React.FC<InputRowProps> = ({ metaKey, value, onChange, onReset, defaultValue }) => {
  const meta = INPUT_METADATA[metaKey];
  const isChanged = value !== defaultValue;

  let displayVal = `${value}`;
  if (meta.unit === '$') displayVal = formatCurrency(value, false, 0);
  else if (meta.unit === '%') displayVal = formatPercent(value, 1);
  else if (meta.unit === 'x') displayVal = formatMultiple(value, 2);
  else if (meta.unit === 'years') displayVal = `${value} yrs`;

  return (
    <div className="space-y-1 group">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-slate-300 font-medium truncate" title={meta.label}>
            {meta.label}
          </span>
          {meta.isAssumption && (
            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1 text-[8.5px] font-bold text-amber-400 shrink-0">
              Assumption
            </span>
          )}
          <div className="relative group/tooltip">
            <Info className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 hidden group-hover/tooltip:block w-56 rounded-lg border border-slate-700 bg-slate-900 p-2 text-[10px] text-slate-300 shadow-2xl z-50">
              {meta.sourceNote}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
          <span className={`font-semibold ${isChanged ? 'text-teal-300 font-bold' : 'text-slate-200'}`}>
            {displayVal}
          </span>
          {isChanged && (
            <button
              type="button"
              onClick={onReset}
              className="text-slate-500 hover:text-amber-400"
              title={`Reset to default (${defaultValue})`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <input
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
      />
    </div>
  );
};

export const LeftRail: React.FC = () => {
  const {
    assumptions,
    setAssumption,
    batchUpdateAssumptions,
    resetField,
    isRailCollapsed,
    toggleRail,
    searchQuery,
    setSearchQuery,
  } = useDealStore();

  const [openSections, setOpenSections] = useState({
    seniorDebt: true,
    deals: true,
    operating: true,
    cashTax: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isRailCollapsed) {
    return (
      <aside className="w-10 border-r border-slate-800 bg-[#070a13] flex flex-col items-center py-3 select-none">
        <button
          type="button"
          onClick={toggleRail}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          title="Expand Deal Controls"
        >
          <ChevronRight className="w-4 h-4 text-teal-400" />
        </button>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-mono text-slate-500 tracking-wider mt-8">
          DEAL LEVERS
        </span>
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-r border-slate-800 bg-[#070a13] flex flex-col h-[calc(100vh-80px)] overflow-y-auto scrollbar-none select-none">
      {/* Search & Collapse Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-[#090e1a]">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search assumptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>
        <button
          type="button"
          onClick={toggleRail}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
          title="Collapse rail"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Accordion 1: Senior Debt Financing */}
      <AccordionSection
        title="Senior Debt Levers"
        icon={<DollarSign className="w-4 h-4" />}
        isOpen={openSections.seniorDebt}
        onToggle={() => toggleSection('seniorDebt')}
      >
        <SliderInputRow
          metaKey="seniorLoanAmount"
          value={assumptions.seniorLoanAmount}
          onChange={(v) => setAssumption('seniorLoanAmount', v)}
          onReset={() => resetField('seniorLoanAmount')}
          defaultValue={DEFAULT_ASSUMPTIONS.seniorLoanAmount}
        />
        <SliderInputRow
          metaKey="seniorLoanRate"
          value={assumptions.seniorLoanRate}
          onChange={(v) => setAssumption('seniorLoanRate', v)}
          onReset={() => resetField('seniorLoanRate')}
          defaultValue={DEFAULT_ASSUMPTIONS.seniorLoanRate}
        />
        <SliderInputRow
          metaKey="seniorLoanAmortYears"
          value={assumptions.seniorLoanAmortYears}
          onChange={(v) => setAssumption('seniorLoanAmortYears', v)}
          onReset={() => resetField('seniorLoanAmortYears')}
          defaultValue={DEFAULT_ASSUMPTIONS.seniorLoanAmortYears}
        />
        <SliderInputRow
          metaKey="targetDscr"
          value={assumptions.targetDscr}
          onChange={(v) => setAssumption('targetDscr', v)}
          onReset={() => resetField('targetDscr')}
          defaultValue={DEFAULT_ASSUMPTIONS.targetDscr}
        />

        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-300">Count Balloons as Debt Service</span>
          <input
            type="checkbox"
            checked={assumptions.countSellerBalloonsAsDebtService}
            onChange={(e) => setAssumption('countSellerBalloonsAsDebtService', e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 accent-teal-400 cursor-pointer"
          />
        </div>
      </AccordionSection>

      {/* Accordion 2: Target LOI & Deal Structure */}
      <AccordionSection
        title="LOI Terms & Add-ons"
        icon={<Briefcase className="w-4 h-4" />}
        isOpen={openSections.deals}
        onToggle={() => toggleSection('deals')}
      >
        {/* Knighthawk Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div>
            <div className="font-semibold text-white">Include Knighthawk?</div>
            <div className="text-[10px] text-slate-400">$5.7M EV • California builder</div>
          </div>
          <input
            type="checkbox"
            checked={assumptions.includeKnighthawk}
            onChange={(e) => setAssumption('includeKnighthawk', e.target.checked)}
            className="h-4 w-4 rounded bg-slate-800 border-slate-700 accent-teal-400 cursor-pointer"
          />
        </div>

        {/* Refinance FP/FIX Legacy Debt */}
        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="text-slate-300">Refi FP/FIX Legacy Debt</span>
            <span className="block text-[9.5px] text-slate-500">$997,426 SBA &amp; vehicle loans</span>
          </div>
          <input
            type="checkbox"
            checked={assumptions.refinanceFpLegacyDebt}
            onChange={(e) => setAssumption('refinanceFpLegacyDebt', e.target.checked)}
            className="h-3.5 w-3.5 rounded bg-slate-800 border-slate-700 accent-teal-400 cursor-pointer"
          />
        </div>

        {/* Buy 50% Salisbury RE */}
        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="text-slate-300">Buy 50% Salisbury RE</span>
            <span className="block text-[9.5px] text-slate-500">$390K appraisal value</span>
          </div>
          <input
            type="checkbox"
            checked={assumptions.buySalisburyRe}
            onChange={(e) => setAssumption('buySalisburyRe', e.target.checked)}
            className="h-3.5 w-3.5 rounded bg-slate-800 border-slate-700 accent-teal-400 cursor-pointer"
          />
        </div>

        {/* Exit multiple */}
        <SliderInputRow
          metaKey="exitMultiple"
          value={assumptions.exitMultiple}
          onChange={(v) => setAssumption('exitMultiple', v)}
          onReset={() => resetField('exitMultiple')}
          defaultValue={DEFAULT_ASSUMPTIONS.exitMultiple}
        />

        {/* Rocmont LOI EV */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Rocmont EV</span>
            <span className="font-mono text-teal-300 font-bold">{formatCurrency(assumptions.rocmontLoi.ev, false, 0)}</span>
          </div>
          <input
            type="range"
            min={3000000}
            max={7000000}
            step={50000}
            value={assumptions.rocmontLoi.ev}
            onChange={(e) => {
              const ev = parseFloat(e.target.value);
              setAssumption('rocmontLoi', { ...assumptions.rocmontLoi, ev });
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Salisbury LOI EV */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Salisbury EV</span>
            <span className="font-mono text-teal-300 font-bold">{formatCurrency(assumptions.salisburyLoi.ev, false, 0)}</span>
          </div>
          <input
            type="range"
            min={2000000}
            max={7000000}
            step={50000}
            value={assumptions.salisburyLoi.ev}
            onChange={(e) => {
              const ev = parseFloat(e.target.value);
              setAssumption('salisburyLoi', { ...assumptions.salisburyLoi, ev });
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Salisbury Rollover % */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Salisbury Rollover %</span>
            <span className="font-mono text-teal-300 font-bold">{formatPercent(assumptions.salisburyLoi.rolloverPct)}</span>
          </div>
          <input
            type="range"
            min={0.10}
            max={0.50}
            step={0.05}
            value={assumptions.salisburyLoi.rolloverPct}
            onChange={(e) => {
              const rolloverPct = parseFloat(e.target.value);
              setAssumption('salisburyLoi', { ...assumptions.salisburyLoi, rolloverPct });
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      </AccordionSection>

      {/* Accordion 3: Operating Margins & Haircuts */}
      <AccordionSection
        title="Operating Levers"
        icon={<TrendingUp className="w-4 h-4" />}
        isOpen={openSections.operating}
        onToggle={() => toggleSection('operating')}
      >
        <SliderInputRow
          metaKey="baseMarginRocmont"
          value={assumptions.baseMarginRocmont}
          onChange={(v) => setAssumption('baseMarginRocmont', v)}
          onReset={() => resetField('baseMarginRocmont')}
          defaultValue={DEFAULT_ASSUMPTIONS.baseMarginRocmont}
        />
        <SliderInputRow
          metaKey="baseMarginSalisbury"
          value={assumptions.baseMarginSalisbury}
          onChange={(v) => setAssumption('baseMarginSalisbury', v)}
          onReset={() => resetField('baseMarginSalisbury')}
          defaultValue={DEFAULT_ASSUMPTIONS.baseMarginSalisbury}
        />
        <SliderInputRow
          metaKey="baseMarginFpFix"
          value={assumptions.baseMarginFpFix}
          onChange={(v) => setAssumption('baseMarginFpFix', v)}
          onReset={() => resetField('baseMarginFpFix')}
          defaultValue={DEFAULT_ASSUMPTIONS.baseMarginFpFix}
        />
        <SliderInputRow
          metaKey="downsideMarginCutPts"
          value={assumptions.downsideMarginCutPts}
          onChange={(v) => setAssumption('downsideMarginCutPts', v)}
          onReset={() => resetField('downsideMarginCutPts')}
          defaultValue={DEFAULT_ASSUMPTIONS.downsideMarginCutPts}
        />
        <SliderInputRow
          metaKey="downsideRevenueHaircut"
          value={assumptions.downsideRevenueHaircut}
          onChange={(v) => setAssumption('downsideRevenueHaircut', v)}
          onReset={() => resetField('downsideRevenueHaircut')}
          defaultValue={DEFAULT_ASSUMPTIONS.downsideRevenueHaircut}
        />
      </AccordionSection>

      {/* Accordion 4: Cash Flow, Capex, Taxes */}
      <AccordionSection
        title="Cash, Capex & Taxes"
        icon={<Percent className="w-4 h-4" />}
        isOpen={openSections.cashTax}
        onToggle={() => toggleSection('cashTax')}
      >
        <SliderInputRow
          metaKey="taxDistributionRate"
          value={assumptions.taxDistributionRate}
          onChange={(v) => setAssumption('taxDistributionRate', v)}
          onReset={() => resetField('taxDistributionRate')}
          defaultValue={DEFAULT_ASSUMPTIONS.taxDistributionRate}
        />
        <SliderInputRow
          metaKey="capexPct"
          value={assumptions.capexPct}
          onChange={(v) => setAssumption('capexPct', v)}
          onReset={() => resetField('capexPct')}
          defaultValue={DEFAULT_ASSUMPTIONS.capexPct}
        />
        <SliderInputRow
          metaKey="dnaPct"
          value={assumptions.dnaPct}
          onChange={(v) => setAssumption('dnaPct', v)}
          onReset={() => resetField('dnaPct')}
          defaultValue={DEFAULT_ASSUMPTIONS.dnaPct}
        />
        <SliderInputRow
          metaKey="nwcPct"
          value={assumptions.nwcPct}
          onChange={(v) => setAssumption('nwcPct', v)}
          onReset={() => resetField('nwcPct')}
          defaultValue={DEFAULT_ASSUMPTIONS.nwcPct}
        />
        <SliderInputRow
          metaKey="minimumCashBalance"
          value={assumptions.minimumCashBalance}
          onChange={(v) => setAssumption('minimumCashBalance', v)}
          onReset={() => resetField('minimumCashBalance')}
          defaultValue={DEFAULT_ASSUMPTIONS.minimumCashBalance}
        />
        <SliderInputRow
          metaKey="diligenceHaircutAddbacks"
          value={assumptions.diligenceHaircutAddbacks}
          onChange={(v) => setAssumption('diligenceHaircutAddbacks', v)}
          onReset={() => resetField('diligenceHaircutAddbacks')}
          defaultValue={DEFAULT_ASSUMPTIONS.diligenceHaircutAddbacks}
        />
        <SliderInputRow
          metaKey="contractLiabilitiesDebtLikePct"
          value={assumptions.contractLiabilitiesDebtLikePct}
          onChange={(v) => setAssumption('contractLiabilitiesDebtLikePct', v)}
          onReset={() => resetField('contractLiabilitiesDebtLikePct')}
          defaultValue={DEFAULT_ASSUMPTIONS.contractLiabilitiesDebtLikePct}
        />
        <SliderInputRow
          metaKey="arOver90ReservePct"
          value={assumptions.arOver90ReservePct}
          onChange={(v) => setAssumption('arOver90ReservePct', v)}
          onReset={() => resetField('arOver90ReservePct')}
          defaultValue={DEFAULT_ASSUMPTIONS.arOver90ReservePct}
        />
      </AccordionSection>
    </aside>
  );
};
