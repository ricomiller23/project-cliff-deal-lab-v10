import React, { useState, useEffect, useRef } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatMultiple, formatPercent } from '../../utils/formatters';
import { MonteCarloResult } from '../../engine/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Play, RotateCcw, AlertTriangle, ShieldAlert, TrendingUp, DollarSign, Activity } from 'lucide-react';

export const RiskMonteCarloTab: React.FC = () => {
  const { assumptions, results, updateAssumption, setResults } = useDealStore();
  const mc = results.monteCarlo;

  const [isRunning, setIsRunning] = useState(false);
  const [workerProgress, setWorkerProgress] = useState(100);
  const [lastComputeTime, setLastComputeTime] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../../workers/monteCarlo.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'SUCCESS') {
          const res: MonteCarloResult = e.data.result;
          setResults({
            ...results,
            monteCarlo: res,
          });
          setIsRunning(false);
          setWorkerProgress(100);
        } else if (e.data.type === 'ERROR') {
          console.error('Worker error:', e.data.error);
          setIsRunning(false);
        }
      };
    } catch (e) {
      console.warn('Web worker not supported in this environment, using main thread fallback');
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runSimulation = (newTrialsCount?: number, newSeed?: number) => {
    setIsRunning(true);
    setWorkerProgress(30);
    const startTime = performance.now();

    const updatedAssumptions = {
      ...assumptions,
      monteCarloTrialsCount: newTrialsCount ?? assumptions.monteCarloTrialsCount,
      monteCarloSeed: newSeed ?? assumptions.monteCarloSeed,
    };

    if (newTrialsCount !== undefined) {
      updateAssumption('monteCarloTrialsCount', newTrialsCount);
    }
    if (newSeed !== undefined) {
      updateAssumption('monteCarloSeed', newSeed);
    }

    if (workerRef.current) {
      setWorkerProgress(60);
      workerRef.current.postMessage({ assumptions: updatedAssumptions });
      const checkDone = setInterval(() => {
        if (!isRunning) {
          clearInterval(checkDone);
          setLastComputeTime(Math.round(performance.now() - startTime));
        }
      }, 50);
    } else {
      setTimeout(() => {
        useDealStore.getState().recompute();
        setWorkerProgress(100);
        setIsRunning(false);
        setLastComputeTime(Math.round(performance.now() - startTime));
      }, 10);
    }
  };

  const handleResetSeed42 = () => {
    runSimulation(1000, 42);
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000);
    runSimulation(assumptions.monteCarloTrialsCount, randomSeed);
  };

  const trialsCount = mc.trials.length;

  // Format histogram data for chart
  const histData = (mc.histogram || []).map((bin) => ({
    range: bin.binLabel,
    mid: ((bin.binFrom + bin.binTo) / 2).toFixed(2),
    count: bin.count,
    pct: trialsCount > 0 ? (bin.count / trialsCount) * 100 : 0,
    isLoss: (bin.binFrom + bin.binTo) / 2 < 1.0,
  }));

  const quantiles = [
    { p: '5th Percentile (P5 - Downside)', moic: mc.p5Moic },
    { p: '25th Percentile (Q1)', moic: mc.p25Moic },
    { p: '50th Percentile (Median)', moic: mc.medianMoic },
    { p: '75th Percentile (Q3)', moic: mc.p75Moic },
    { p: '95th Percentile (P95 - Upside)', moic: mc.p95Moic },
  ];

  return (
    <div className="space-y-6">
      {/* Headline Takeaway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              Risk & Uncertainty Engine (Sheet: Monte_Carlo)
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {formatPercent(mc.probMoicLoss, 1)} Probability of Capital Loss (<span className="text-rose-400">&lt;1.0x MOIC</span>) across {trialsCount.toLocaleString()} Simulated Trials
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              At signed LOI terms and run-rate baseline, median sponsor return is {formatMultiple(mc.medianMoic)}, but there is an{' '}
              <span className="text-amber-400 font-semibold">{formatPercent(mc.probFollowOnEquityNeeded, 1)} probability</span> that sponsor follow-on equity will be demanded.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => runSimulation()}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Simulating...' : 'Run Simulation'}
            </button>
            <button
              onClick={handleResetSeed42}
              title="Reset to Excel Benchmark (Seed 42, 1000 trials)"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Seed 42
            </button>
          </div>
        </div>

        {/* Worker Progress Indicator */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Running non-blocking Web Worker simulation...</span>
              <span>{workerProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${workerProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase">
              <ShieldAlert className="w-4 h-4" />
              Prob. of Loss
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">Base case only</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatPercent(mc.probMoicLoss, 1)}
          </div>
          <div className="text-xs text-slate-500 mt-1">MOIC &lt; 1.0x (Excel: 38.3%)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
            <AlertTriangle className="w-4 h-4" />
            Follow-on Risk
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatPercent(mc.probFollowOnEquityNeeded, 1)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Shortfall &gt; $0 (Excel: 88%)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase">
            <TrendingUp className="w-4 h-4" />
            Median MOIC
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatMultiple(mc.medianMoic)}
          </div>
          <div className="text-xs text-slate-500 mt-1">50th percentile (Excel: 1.24x)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
            <Activity className="w-4 h-4" />
            Mean MOIC
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatMultiple(mc.meanMoic)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Expected return (V3)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase">
            <DollarSign className="w-4 h-4" />
            Mean Follow-on
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(mc.meanFollowOnEquityCalled)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Average shortfall injection</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Activity className="w-4 h-4" />
            P5 / P95 MOIC Range
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {formatMultiple(mc.p5Moic)} - {formatMultiple(mc.p95Moic)}
          </div>
          <div className="text-xs text-slate-500 mt-1">90% confidence interval</div>
        </div>
      </div>

      {/* Simulator Controls & Shocks Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">Monte Carlo Simulation Assumptions & Shock Distributions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Trial Count
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1000, 2000, 5000, 10000].map((count) => (
                <button
                  key={count}
                  onClick={() => runSimulation(count)}
                  className={`py-1.5 text-xs rounded border transition-colors ${
                    assumptions.monteCarloTrialsCount === count
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {count >= 1000 ? `${count / 1000}k` : count}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              1,000 matches Excel seed 42 exactly.
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Revenue Shock Std Dev</span>
              <span className="text-white font-mono">{formatPercent(assumptions.revenueShockSd, 1)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={assumptions.revenueShockSd}
              onChange={(e) => updateAssumption('revenueShockSd', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-slate-500 mt-1">Normal distribution N(0, σ)</div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Margin Shock Std Dev</span>
              <span className="text-white font-mono">{formatPercent(assumptions.marginShockSd, 1)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={assumptions.marginShockSd}
              onChange={(e) => updateAssumption('marginShockSd', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-slate-500 mt-1">Normal shock on EBITDA margin</div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Exit Multiple Shock Std Dev</span>
              <span className="text-white font-mono">{assumptions.exitMultipleSd.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2.5"
              step="0.1"
              value={assumptions.exitMultipleSd}
              onChange={(e) => updateAssumption('exitMultipleSd', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Seed: {assumptions.monteCarloSeed}</span>
              <button
                onClick={handleRandomSeed}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Random Seed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Chart & Quantiles Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histogram */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Sponsor MOIC Outcome Distribution</h3>
              <p className="text-xs text-slate-400">
                Red bars denote capital impairment (&lt; 1.0x MOIC); green bars denote profitable outcomes.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Loss (&lt;1.0x)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Gain (&ge;1.0x)
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any, _name, item: any) => [
                    `${val} trials (${item.payload.pct.toFixed(1)}%)`,
                    `MOIC ${item.payload.range}`,
                  ]}
                />
                <ReferenceLine x="0.75-1.0x" stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '1.0x Parity', fill: '#f43f5e', fontSize: 10, position: 'top' }} />
                <Bar
                  dataKey="count"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    const fill = payload.isLoss ? '#ef4444' : '#10b981';
                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantiles / Percentiles Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Percentile Outcomes</h3>
            <p className="text-xs text-slate-400 mb-4">
              Distribution quantiles based on {trialsCount.toLocaleString()} trials.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Percentile</th>
                    <th className="pb-2 text-right font-medium">Sponsor MOIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {quantiles.map((q, idx) => (
                    <tr
                      key={q.p}
                      className={idx === 2 ? 'bg-blue-950/40 text-blue-300 font-semibold' : 'text-slate-300'}
                    >
                      <td className="py-2.5 text-slate-400 font-sans">{q.p}</td>
                      <td className={`py-2.5 text-right font-bold ${q.moic < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatMultiple(q.moic)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            {lastComputeTime ? `Last computed in ${lastComputeTime}ms via Web Worker.` : 'Precomputed from seed 42.'}
          </div>
        </div>
      </div>
    </div>
  );
};
