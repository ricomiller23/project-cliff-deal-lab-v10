import { Assumptions, CashFlow13WResult, CashFlow13WWeek } from './types';
import { HISTORICAL_BENCHMARKS } from './dealsSourcesUses';

function calcPmt(monthlyRate: number, numMonths: number, presentValue: number): number {
  if (monthlyRate === 0) return presentValue / numMonths;
  return (presentValue * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numMonths));
}

interface Entity13WParams {
  name: string;
  openingCash: number;
  openingAr: number;
  arOver90: number;
  openingAp: number;
  runRateRev: number;
  runRateMargin: number;
  lagWeeks: number;
  debtBalance: number;
  debtRate: number;
  debtTermMonths: number;
}

function simulate13Weeks(
  p: Entity13WParams,
  ar90CollectPct: number,
  startDate: Date
): { weeks: CashFlow13WWeek[]; minCash: number; firstNegWeek: number } {
  const weeklySales = p.runRateRev / 52;
  const cashCostRatio = 1 - p.runRateMargin;
  const operatingDisbursements = -weeklySales * cashCostRatio;
  const weeklyApPaydown = -p.openingAp / 4;
  const monthlyDebt = calcPmt(p.debtRate / 12, p.debtTermMonths, p.debtBalance);

  // Collectible A/R = openingAr - arOver90 * (1 - ar90CollectPct)
  const collectibleAr = p.openingAr - p.arOver90 * (1 - ar90CollectPct);
  const weeklyArCollection = p.lagWeeks > 0 ? collectibleAr / p.lagWeeks : 0;

  let currentCash = p.openingCash;
  const weeks: CashFlow13WWeek[] = [];
  let minCash = currentCash;
  let firstNegWeek = 0;

  for (let w = 1; w <= 13; w++) {
    const d = new Date(startDate.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnding = d.toISOString().slice(0, 10);
    const openingCash = currentCash;

    const collectionsOpeningAr = w <= p.lagWeeks ? weeklyArCollection : 0;
    const collectionsNewSales = w > p.lagWeeks ? weeklySales : 0;
    const totalReceipts = collectionsOpeningAr + collectionsNewSales;

    const apPaydown = w <= 4 ? weeklyApPaydown : 0;
    const debtService = w === 4 || w === 8 || w === 13 ? -monthlyDebt : 0;

    const netCashFlow = totalReceipts + operatingDisbursements + apPaydown + debtService;
    const closingCash = openingCash + netCashFlow;
    currentCash = closingCash;

    if (w === 1) minCash = closingCash;
    else if (closingCash < minCash) minCash = closingCash;

    if (closingCash < 0 && firstNegWeek === 0) {
      firstNegWeek = w;
    }

    weeks.push({
      weekIndex: w,
      weekEnding,
      openingCash,
      collectionsOpeningAr,
      collectionsNewSales,
      totalReceipts,
      operatingDisbursements,
      apPaydown,
      debtService,
      netCashFlow,
      closingCash,
    });
  }

  return { weeks, minCash, firstNegWeek };
}

export function calcCashFlow13W(a: Assumptions): CashFlow13WResult {
  const startDate = new Date(2026, 10, 20); // 2026-11-20
  const ar90Pct = a.arOver90CollectionPct13W;

  // Rocmont
  const rocmontParams: Entity13WParams = {
    name: 'Rocmont',
    openingCash: a.rocmontOpeningCash,
    openingAr: 1002839.39,
    arOver90: 296084.27,
    openingAp: 108033.61,
    runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont,
    runRateMargin: HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont / HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont,
    lagWeeks: a.collectionLagWeeksRocmont,
    debtBalance: 1934632.32,
    debtRate: 0.0375,
    debtTermMonths: 360,
  };

  // Salisbury
  const salisburyParams: Entity13WParams = {
    name: 'Salisbury',
    openingCash: a.salisburyOpeningCash,
    openingAr: 1640043.29,
    arOver90: 942540.24,
    openingAp: 326674.24,
    runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury,
    runRateMargin: HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury / HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury,
    lagWeeks: a.collectionLagWeeksSalisbury,
    debtBalance: 692448.77,
    debtRate: 0.07,
    debtTermMonths: 60,
  };

  // FP + FIX
  const fpFixParams: Entity13WParams = {
    name: 'Flood Pros + FIX',
    openingCash: a.fpOpeningCash,
    openingAr: 252339.47,
    arOver90: 57095.74,
    openingAp: 69952.75,
    runRateRev: HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix,
    runRateMargin: HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix / HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix,
    lagWeeks: a.collectionLagWeeksFp,
    debtBalance: 997426.0,
    debtRate: 0.08,
    debtTermMonths: 84,
  };

  const rocRes = simulate13Weeks(rocmontParams, ar90Pct, startDate);
  const salRes = simulate13Weeks(salisburyParams, ar90Pct, startDate);
  const fpRes = simulate13Weeks(fpFixParams, ar90Pct, startDate);

  const platformWeeks = rocRes.weeks.map((rw, i) => {
    const sw = salRes.weeks[i];
    const fw = fpRes.weeks[i];
    const totalCash = rw.closingCash + sw.closingCash + fw.closingCash;
    return {
      weekIndex: rw.weekIndex,
      weekEnding: rw.weekEnding,
      rocmontCash: rw.closingCash,
      salisburyCash: sw.closingCash,
      fpFixCash: fw.closingCash,
      totalCash,
    };
  });

  const platformMinCash = Math.min(...platformWeeks.map(p => p.totalCash));

  return {
    rocmontWeeks: rocRes.weeks,
    salisburyWeeks: salRes.weeks,
    fpFixWeeks: fpRes.weeks,
    platformWeeks,
    salisburyMinCash: salRes.minCash,
    salisburyFirstNegativeWeek: salRes.firstNegWeek,
    platformMinCash,
  };
}
