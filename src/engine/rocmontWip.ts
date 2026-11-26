import { Assumptions, WipJob, WipResult } from './types';
import { HISTORICAL_BENCHMARKS } from './dealsSourcesUses';

interface RawJobData {
  division: string;
  contract: string;
  contractAmount: number;
  billedToDate: number;
  totalEstCost: number;
  costToDate: number;
  start: string; // YYYY-MM-DD
  end: string;
}

const RAW_JOBS: RawJobData[] = [
  { division: 'Insulation', contract: '6232 BYU Fine Arts', contractAmount: 2117704, billedToDate: 1663969, totalEstCost: 860648, costToDate: 590648, start: '2023-12-15', end: '2026-06-15' },
  { division: 'Insulation', contract: '6253 Wasatch HS', contractAmount: 1099206, billedToDate: 798975, totalEstCost: 625410, costToDate: 442784, start: '2024-08-05', end: '2025-12-30' },
  { division: 'Insulation', contract: '6272 Altamont ES', contractAmount: 355070, billedToDate: 0, totalEstCost: 180000, costToDate: 0, start: '2025-10-10', end: '2026-06-30' },
  { division: 'Insulation', contract: '6279 Altamont HS', contractAmount: 206335, billedToDate: 0, totalEstCost: 74000, costToDate: 2294, start: '2025-10-10', end: '2026-06-30' },
  { division: 'Insulation', contract: '6280 Alpine HS', contractAmount: 1409680, billedToDate: 0, totalEstCost: 580000, costToDate: 0, start: '2026-07-01', end: '2027-08-01' },
  { division: 'Insulation', contract: '6281 MTC', contractAmount: 82000, billedToDate: 0, totalEstCost: 34000, costToDate: 0, start: '2025-09-01', end: '2025-12-31' },
  { division: 'Insulation', contract: '6282 MTC II', contractAmount: 126000, billedToDate: 0, totalEstCost: 48000, costToDate: 0, start: '2025-11-15', end: '2026-03-15' },
  { division: 'Abatement', contract: '4643 USU', contractAmount: 1098200, billedToDate: 713830, totalEstCost: 330000, costToDate: 210528, start: '2025-09-01', end: '2025-12-31' },
];

function parseDateDays(dStr: string): number {
  const d = new Date(dStr + 'T00:00:00Z');
  return d.getTime() / (24 * 60 * 60 * 1000);
}

export function calcRocmontWip(a: Assumptions): WipResult {
  const asOfDays = parseDateDays('2025-10-31');
  const testedYearStartDays = parseDateDays('2026-01-01');
  const testedYearEndDays = parseDateDays('2026-12-31');

  const jobs: WipJob[] = RAW_JOBS.map((j) => {
    const costRemaining = j.totalEstCost - j.costToDate;
    const pctComplete = j.totalEstCost > 0 ? j.costToDate / j.totalEstCost : 0;
    const earnedRevenue = pctComplete * j.contractAmount;
    const overUnderBilling = j.billedToDate - earnedRevenue;
    const estGrossProfit = j.contractAmount - j.totalEstCost;
    const gpMargin = j.contractAmount > 0 ? estGrossProfit / j.contractAmount : 0;
    const remainingRevenue = j.contractAmount - earnedRevenue;

    const startDays = parseDateDays(j.start);
    const endDays = parseDateDays(j.end);
    const windowStartDays = Math.max(startDays, asOfDays);

    let shareInYear = 0;
    if (endDays > windowStartDays) {
      const overlapStart = Math.max(windowStartDays, testedYearStartDays);
      const overlapEnd = Math.min(endDays, testedYearEndDays);
      const overlapDays = Math.max(0, overlapEnd - overlapStart);
      const totalWindowDays = endDays - windowStartDays;
      shareInYear = overlapDays / totalWindowDays;
    }

    const revenueInYear = remainingRevenue * shareInYear;

    return {
      division: j.division,
      contract: j.contract,
      contractAmount: j.contractAmount,
      billedToDate: j.billedToDate,
      totalEstCost: j.totalEstCost,
      costToDate: j.costToDate,
      costRemaining,
      startDate: j.start,
      endDate: j.end,
      pctComplete,
      earnedRevenue,
      overUnderBilling,
      estGrossProfit,
      gpMargin,
      remainingRevenue,
      shareInTestedYear: shareInYear,
      revenueInTestedYear: revenueInYear,
    };
  });

  const totalContractAmount = jobs.reduce((s, j) => s + j.contractAmount, 0);
  const totalBilledToDate = jobs.reduce((s, j) => s + j.billedToDate, 0);
  const totalCostRemaining = jobs.reduce((s, j) => s + j.costRemaining, 0);
  const totalOverUnderBilling = jobs.reduce((s, j) => s + j.overUnderBilling, 0);
  const totalRemainingRevenue = jobs.reduce((s, j) => s + j.remainingRevenue, 0);
  const totalRevenueTestedYear = jobs.reduce((s, j) => s + j.revenueInTestedYear, 0);

  const runRateRevenue = HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont;
  const mgmtPlanRevenue = HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont;
  const backlogRunRateCoverageShare = runRateRevenue > 0 ? totalRevenueTestedYear / runRateRevenue : 0;
  const revenueNeededFromNewJobsRunRate = Math.max(0, runRateRevenue - totalRevenueTestedYear);
  const revenueNeededFromNewJobsPlan = Math.max(0, mgmtPlanRevenue - totalRevenueTestedYear);

  return {
    jobs,
    totalContractAmount,
    totalBilledToDate,
    totalCostRemaining,
    totalOverUnderBilling,
    totalRemainingRevenue,
    totalRevenueTestedYear,
    runRateRevenue,
    mgmtPlanRevenue,
    backlogRunRateCoverageShare,
    revenueNeededFromNewJobsRunRate,
    revenueNeededFromNewJobsPlan,
  };
}
