import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { AlertTriangle, HardHat, Calendar, DollarSign, Layers } from 'lucide-react';
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

export const RocmontWipTab: React.FC = () => {
  const { results } = useDealStore();
  const wip = results.wipRocmont;

  const chartData = wip.jobs.map((j) => ({
    name: j.contract.split(' ')[0],
    fullName: j.contract,
    'Earned to Date': j.earnedRevenue,
    'Remaining Revenue': j.remainingRevenue,
    '2026 Tested Revenue': j.revenueInTestedYear,
  }));

  const coverageShare = wip.backlogRunRateCoverageShare;

  return (
    <div className="space-y-6">
      {/* Live Takeaway Headline */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            ROCMONT WIP &amp; BACKLOG REVENUE TIMING (MODEL 5)
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
          Known WIP backlog covers only <span className="text-rose-400 font-mono font-black">{formatPercent(coverageShare)}</span> of 2026 run-rate revenue ({formatCurrency(wip.totalRevenueTestedYear, true)} of {formatCurrency(wip.runRateRevenue, true)});{' '}
          <span className="text-amber-400 font-mono font-black">{formatCurrency(wip.revenueNeededFromNewJobsRunRate, true)}</span> must come from new uncontracted jobs.
        </h2>
      </div>

      {/* Coverage Gauge & Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Coverage Card */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-2 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Run-Rate Backlog Coverage</span>
          <div>
            <div className="text-2xl font-black font-mono text-amber-400">{formatPercent(coverageShare)}</div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, coverageShare * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">64% uncontracted exposure</span>
        </div>

        {/* Total Backlog */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-2 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Total Open Backlog</span>
          <div>
            <div className="text-2xl font-black font-mono text-white">{formatCurrency(wip.totalRemainingRevenue, true)}</div>
            <span className="text-xs text-slate-400">across 8 open contracts</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">0.56 years of 2025 rev</span>
        </div>

        {/* Net Overbilling */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-2 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">WIP Net Overbillings</span>
          <div>
            <div className="text-2xl font-black font-mono text-rose-400">{formatCurrency(wip.totalOverUnderBilling, true)}</div>
            <span className="text-xs text-slate-400">vs $820K on Oct-26 balance sheet</span>
          </div>
          <span className="text-[10px] font-mono text-rose-400">Stale since July 2026</span>
        </div>

        {/* New Revenue Needed */}
        <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-2 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">New Job Revenue Needed</span>
          <div>
            <div className="text-2xl font-black font-mono text-teal-400">{formatCurrency(wip.revenueNeededFromNewJobsRunRate, true)}</div>
            <span className="text-xs text-slate-400">or {formatCurrency(wip.revenueNeededFromNewJobsPlan, true)} for Mgmt Plan</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Run-rate basis</span>
        </div>
      </div>

      {/* Contract Revenue Chart */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          Contract Revenue Composition (Earned vs. Remaining vs. 2026 Allocation)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070a13', borderColor: '#334155', borderRadius: 8 }}
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Earned to Date" fill="#475569" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Remaining Revenue" fill="#38bdf8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="2026 Tested Revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Contracts Table */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Rocmont WIP Schedule (as of 10/31/2025)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Total Contract Value: {formatCurrency(wip.totalContractAmount)}</span>
        </div>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-right text-[11px] border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-2">Contract</th>
                <th className="text-left py-2">Division</th>
                <th className="py-2">Contract ($)</th>
                <th className="py-2">Billed ($)</th>
                <th className="py-2">% Done</th>
                <th className="py-2">Over/(Under)</th>
                <th className="py-2">GP %</th>
                <th className="py-2">Window</th>
                <th className="py-2 text-teal-400 font-bold">2026 Rev ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {wip.jobs.map((j) => (
                <tr key={j.contract} className="hover:bg-slate-850/50">
                  <td className="text-left py-2 font-bold text-white">{j.contract}</td>
                  <td className="text-left text-slate-400">{j.division}</td>
                  <td>{formatCurrency(j.contractAmount)}</td>
                  <td>{formatCurrency(j.billedToDate)}</td>
                  <td className="font-semibold text-white">{formatPercent(j.pctComplete)}</td>
                  <td className={j.overUnderBilling >= 0 ? 'text-amber-400' : 'text-slate-400'}>
                    {formatCurrency(j.overUnderBilling)}
                  </td>
                  <td className="text-slate-300">{formatPercent(j.gpMargin)}</td>
                  <td className="text-slate-400 text-[10px]">{j.startDate.slice(5)} to {j.endDate.slice(5)}</td>
                  <td className="text-teal-300 font-bold">{formatCurrency(j.revenueInTestedYear)}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 font-bold text-white border-t border-slate-700">
                <td className="text-left py-2">TOTAL OPEN JOBS</td>
                <td className="text-left">—</td>
                <td>{formatCurrency(wip.totalContractAmount)}</td>
                <td>{formatCurrency(wip.totalBilledToDate)}</td>
                <td>{formatPercent(wip.totalBilledToDate / wip.totalContractAmount)}</td>
                <td className="text-amber-400">{formatCurrency(wip.totalOverUnderBilling)}</td>
                <td>—</td>
                <td>—</td>
                <td className="text-teal-400">{formatCurrency(wip.totalRevenueTestedYear)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
