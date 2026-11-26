import React, { useState } from 'react';
import { useDealStore } from '../store/useDealStore';
import { solveGoalSeek, GoalTargetType, GoalLeverType, GoalSeekResult } from '../engine/goalSeek';
import { formatCurrency, formatMultiple } from '../utils/formatters';
import { Target, X, Play, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const GoalSeekModal: React.FC = () => {
  const { goalSeekModalOpen, setGoalSeekModalOpen, assumptions, setAssumption } = useDealStore();

  const [targetType, setTargetType] = useState<GoalTargetType>('min_dscr');
  const [targetValue, setTargetValue] = useState<number>(1.25);
  const [lever, setLever] = useState<GoalLeverType>('seniorLoanAmount');
  const [result, setResult] = useState<GoalSeekResult | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  if (!goalSeekModalOpen) return null;

  const handleTargetTypeChange = (type: GoalTargetType) => {
    setTargetType(type);
    setResult(null);
    if (type === 'moic') {
      setTargetValue(2.0);
      setLever('exitMultiple');
    } else if (type === 'min_dscr') {
      setTargetValue(1.25);
      setLever('seniorLoanAmount');
    } else if (type === 'zero_follow_on_equity') {
      setTargetValue(0);
      setLever('seniorLoanAmount');
    }
  };

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = solveGoalSeek(assumptions, {
        targetType,
        targetValue,
        lever,
      });
      setResult(res);
      setIsSolving(false);
    }, 100);
  };

  const handleApply = () => {
    if (!result || !result.solved) return;
    if (lever === 'seniorLoanAmount') {
      setAssumption('seniorLoanAmount', Math.round(result.solutionValue));
    } else if (lever === 'exitMultiple') {
      setAssumption('exitMultiple', +(result.solutionValue.toFixed(2)));
    } else if (lever === 'salisburyEv') {
      setAssumption('salisburyLoi', {
        ...assumptions.salisburyLoi,
        ev: Math.round(result.solutionValue),
      });
    } else if (lever === 'salisburyRolloverPct') {
      setAssumption('salisburyLoi', {
        ...assumptions.salisburyLoi,
        rolloverPct: +(result.solutionValue.toFixed(3)),
      });
    } else if (lever === 'rocmontRolloverPct') {
      setAssumption('rocmontLoi', {
        ...assumptions.rocmontLoi,
        rolloverPct: +(result.solutionValue.toFixed(3)),
      });
    }
    setGoalSeekModalOpen(false);
  };

  const getCurrentLeverValue = () => {
    switch (lever) {
      case 'seniorLoanAmount':
        return formatCurrency(assumptions.seniorLoanAmount);
      case 'exitMultiple':
        return formatMultiple(assumptions.exitMultiple);
      case 'salisburyEv':
        return formatCurrency(assumptions.salisburyLoi.ev);
      case 'salisburyRolloverPct':
        return `${(assumptions.salisburyLoi.rolloverPct * 100).toFixed(1)}%`;
      case 'rocmontRolloverPct':
        return `${(assumptions.rocmontLoi.rolloverPct * 100).toFixed(1)}%`;
    }
  };

  const formatSolutionValue = (val: number) => {
    switch (lever) {
      case 'seniorLoanAmount':
      case 'salisburyEv':
        return formatCurrency(val);
      case 'exitMultiple':
        return formatMultiple(val);
      case 'salisburyRolloverPct':
      case 'rocmontRolloverPct':
        return `${(val * 100).toFixed(2)}%`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Goal Seek Solver</h2>
              <p className="text-xs text-slate-400">Numerical bisection optimizer for deal covenants & returns</p>
            </div>
          </div>
          <button
            onClick={() => setGoalSeekModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Objective Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              1. Select Target Objective
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTargetTypeChange('min_dscr')}
                className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                  targetType === 'min_dscr'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                Target Min DSCR
              </button>
              <button
                type="button"
                onClick={() => handleTargetTypeChange('moic')}
                className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                  targetType === 'moic'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                Target Sponsor MOIC
              </button>
              <button
                type="button"
                onClick={() => handleTargetTypeChange('zero_follow_on_equity')}
                className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                  targetType === 'zero_follow_on_equity'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                Zero Cash Shortfall
              </button>
            </div>
          </div>

          {/* Target Value Input */}
          {targetType !== 'zero_follow_on_equity' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                2. Target Value
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step={targetType === 'moic' ? '0.1' : '0.05'}
                  value={targetValue}
                  onChange={(e) => {
                    setTargetValue(parseFloat(e.target.value) || 0);
                    setResult(null);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white font-mono text-sm rounded-lg px-3 py-2 w-36 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">
                  {targetType === 'min_dscr' ? 'x DSCR covenant (default 1.25x)' : 'x Sponsor MOIC (e.g. 2.0x, 2.5x)'}
                </span>
              </div>
            </div>
          )}

          {/* Decision Lever */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              3. By Changing Variable (Lever)
            </label>
            <select
              value={lever}
              onChange={(e) => {
                setLever(e.target.value as GoalLeverType);
                setResult(null);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="seniorLoanAmount">Senior Loan Borrowing Amount ($)</option>
              <option value="exitMultiple">Platform Exit Multiple (x)</option>
              <option value="salisburyEv">Salisbury Enterprise Value ($)</option>
              <option value="salisburyRolloverPct">Salisbury Rollover Equity %</option>
              <option value="rocmontRolloverPct">Rocmont Rollover Equity %</option>
            </select>
            <div className="text-xs text-slate-400 mt-1 flex justify-between">
              <span>Current Value:</span>
              <span className="font-mono text-slate-300">{getCurrentLeverValue()}</span>
            </div>
          </div>

          {/* Solve Button */}
          <button
            onClick={handleSolve}
            disabled={isSolving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Play className="w-4 h-4" />
            {isSolving ? 'Optimizing via Bisection...' : 'Solve for Lever'}
          </button>

          {/* Solution Display */}
          {result && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                result.solved
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-700 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-semibold text-xs">
                {result.solved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{result.message}</span>
              </div>

              {result.solved && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Solved Value:</span>
                    <span className="font-mono text-base font-bold text-white">
                      {formatSolutionValue(result.solutionValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Iterations:</span>
                    <span className="font-mono">{result.steps.length} steps</span>
                  </div>

                  <button
                    onClick={handleApply}
                    className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow"
                  >
                    <span>Apply Solution to Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
