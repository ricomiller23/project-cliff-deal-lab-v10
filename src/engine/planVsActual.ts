import { PlanVsActualItem, ConcentrationClient } from './types';
import { HISTORICAL_BENCHMARKS } from './dealsSourcesUses';

export function getPlanVsActualData() {
  const ytdSep2026: PlanVsActualItem[] = [
    {
      entity: 'Flood Pros + FIX',
      metric: 'Revenue',
      actual: 1878326.06,
      plan: 2449321.63,
      varianceDollar: -570995.57,
      variancePct: -0.2331,
      note: 'Jan-Sep actuals from combined QB P&L',
    },
    {
      entity: 'Flood Pros + FIX',
      metric: 'EBITDA (Operating)',
      actual: -312448.40,
      plan: 569.27,
      varianceDollar: -313017.67,
      variancePct: -5.4986,
      note: 'Actual excludes $222k other income',
    },
    {
      entity: 'Salisbury Plumbing',
      metric: 'Revenue',
      actual: 4588036.36,
      plan: 4880789.95,
      varianceDollar: -292753.59,
      variancePct: -0.0600,
      note: 'Jan 1 - Oct 1 YTD actual',
    },
    {
      entity: 'Salisbury Plumbing',
      metric: 'EBITDA',
      actual: 342579.41,
      plan: 350909.43,
      varianceDollar: -8330.02,
      variancePct: -0.0237,
      note: 'Net income fell $101k in Aug-Sep (loss-making)',
    },
    {
      entity: 'Rocmont Industrial',
      metric: 'Revenue (excl. Aug)',
      actual: 2708387.91,
      plan: 3672780.99,
      varianceDollar: -964393.08,
      variancePct: -0.2626,
      note: 'August 2026 P&L missing from data room',
    },
    {
      entity: 'Rocmont Industrial',
      metric: 'Net Income / EBITDA Proxy',
      actual: 538900.98,
      plan: 1406809.66,
      varianceDollar: -867908.68,
      variancePct: -0.6169,
      note: 'YTD Oct-26 NI less Oct 1-26 NI (no monthly D&A/int)',
    },
  ];

  const fullYear2026RunRateVsPlan = [
    {
      entity: 'Flood Pros + FIX',
      runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix,
      planRev: HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.fpFix,
      gapRevDollar: HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.fpFix,
      gapRevPct: (HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.fpFix) / HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.fpFix,
      runRateEbitda: HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix,
      planEbitda: HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.fpFix,
      gapEbitdaDollar: HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix - HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.fpFix,
    },
    {
      entity: 'Salisbury Plumbing',
      runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury,
      planRev: HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.salisbury,
      gapRevDollar: HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.salisbury,
      gapRevPct: (HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.salisbury) / HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.salisbury,
      runRateEbitda: HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury,
      planEbitda: HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.salisbury,
      gapEbitdaDollar: HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury - HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.salisbury,
    },
    {
      entity: 'Rocmont Industrial',
      runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont,
      planRev: HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont,
      gapRevDollar: HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont,
      gapRevPct: (HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont - HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont) / HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont,
      runRateEbitda: HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont,
      planEbitda: HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.rocmont,
      gapEbitdaDollar: HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont - HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.rocmont,
    },
  ];

  const rocmontConcentration: ConcentrationClient[] = [
    { clientName: 'KK Mechanical', revenue: 1891197.47, pctOfTotal: 0.2971 },
    { clientName: 'DFCM (State of Utah)', revenue: 1268490.53, pctOfTotal: 0.1993 },
    { clientName: 'Utah State University', revenue: 1178643.00, pctOfTotal: 0.1852 },
    { clientName: 'Anderson Geneva, LLC', revenue: 818358.10, pctOfTotal: 0.1286 },
    { clientName: 'A & B Mechanical', revenue: 500303.85, pctOfTotal: 0.0786 },
    { clientName: 'All other (16 clients)', revenue: 708484.19, pctOfTotal: 0.1113 },
  ];

  const knighthawkConcentration = {
    client: 'Lennar Homes',
    sales2024: 2854524,
    sales2025Ytd: 2355997,
    lennarPct2024: 0.414,
    lennarPct2025: 0.372,
  };

  return {
    ytdSep2026,
    fullYear2026RunRateVsPlan,
    rocmontConcentration,
    knighthawkConcentration,
  };
}
