import React from 'react';
import { useDealStore } from '../store/useDealStore';
import { DEFAULT_ASSUMPTIONS, INPUT_METADATA } from '../engine/defaults';
import { X, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface DiffItem {
  key: string;
  label: string;
  currentVal: any;
  defaultVal: any;
  sourceNote?: string;
  isNested?: boolean;
  parentKey?: string;
}

export const DiffDrawer: React.FC = () => {
  const { diffDrawerOpen, setDiffDrawerOpen, assumptions, resetField, resetAll, setAssumption } = useDealStore();

  if (!diffDrawerOpen) return null;

  // Compute all differences between current assumptions and defaults
  const diffs: DiffItem[] = [];

  // Check top-level keys
  (Object.keys(DEFAULT_ASSUMPTIONS) as (keyof typeof DEFAULT_ASSUMPTIONS)[]).forEach((key) => {
    const curr = assumptions[key];
    const def = DEFAULT_ASSUMPTIONS[key];

    if (typeof curr === 'object' && curr !== null && !Array.isArray(curr)) {
      // Nested objects like rocmontLoi, salisburyLoi
      Object.keys(def as any).forEach((subKey) => {
        const subCurr = (curr as any)[subKey];
        const subDef = (def as any)[subKey];
        if (subCurr !== subDef) {
          const metaKey = `${key}.${subKey}`;
          const meta = INPUT_METADATA[metaKey] || {
            label: `${key} ${subKey}`,
            sourceNote: 'LOI transaction term',
          };
          diffs.push({
            key: metaKey,
            label: meta.label,
            currentVal: subCurr,
            defaultVal: subDef,
            sourceNote: meta.sourceNote,
            isNested: true,
            parentKey: key,
          });
        }
      });
    } else {
      if (curr !== def) {
        const meta = INPUT_METADATA[key] || {
          label: key,
          sourceNote: 'Model assumption',
        };
        diffs.push({
          key,
          label: meta.label,
          currentVal: curr,
          defaultVal: def,
          sourceNote: meta.sourceNote,
        });
      }
    }
  });

  const formatVal = (val: any) => {
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'number') {
      if (val >= 10000) return formatCurrency(val);
      if (val <= 1.0 && val > 0) return formatPercent(val, 1);
      return val.toString();
    }
    return String(val);
  };

  const handleResetSingle = (item: DiffItem) => {
    if (item.isNested && item.parentKey) {
      const parent = item.parentKey as keyof typeof DEFAULT_ASSUMPTIONS;
      const subKey = item.key.split('.')[1];
      const defaultSubVal = (DEFAULT_ASSUMPTIONS[parent] as any)[subKey];
      setAssumption(parent, {
        ...(assumptions[parent] as any),
        [subKey]: defaultSubVal,
      });
    } else {
      resetField(item.key as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="text-xs uppercase font-semibold text-blue-400">Audit Trail</div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Assumptions Diff vs Defaults ({diffs.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {diffs.length > 0 && (
              <button
                onClick={resetAll}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset all inputs back to workbook defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            )}
            <button
              onClick={() => setDiffDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {diffs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <CheckCircleIcon className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              All inputs currently match workbook defaults. No modified assumptions.
            </div>
          ) : (
            diffs.map((d) => (
              <div
                key={d.key}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{d.label}</span>
                  <button
                    onClick={() => handleResetSingle(d)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
                    title="Reset this field to default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-mono bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 line-through">
                    {formatVal(d.defaultVal)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-400 font-semibold">
                    {formatVal(d.currentVal)}
                  </span>
                </div>

                {d.sourceNote && (
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span className="text-slate-500 font-sans">Source: </span>
                    {d.sourceNote}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
