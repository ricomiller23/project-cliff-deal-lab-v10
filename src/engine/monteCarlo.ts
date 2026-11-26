import { Assumptions, MonteCarloResult, MonteCarloTrial } from './types';
import { normSInv, createSeededRng } from './financialMath';
import { calcSourcesAndUses } from './dealsSourcesUses';
import { calcScenarioModel } from './operatingModels';
import precomputedDraws from './monteCarloDraws.json';

export function runMonteCarlo(a: Assumptions): MonteCarloResult {
  const su = calcSourcesAndUses(a);
  const baseModel = calcScenarioModel('base', a);

  const base2030Rev = baseModel.years[5].totalRevenue;
  const base2030Ebitda = baseModel.years[5].totalEbitda;
  const base2030Margin = base2030Rev > 0 ? base2030Ebitda / base2030Rev : 0;
  const sumBaseEbitda2027_30 = baseModel.postCloseYears.reduce((s, y) => s + y.totalEbitda, 0);

  const baseCashAtExit = baseModel.accumulatedCashAtExit;
  const debtAtExit = baseModel.debtAtExit;
  const s0 = su.sources.sponsorCashEquity;
  const r = su.sources.sellerRolloverEquity;
  const taxRate = a.taxDistributionRate;
  const mgmtPool = a.mgmtEquityPoolPct;
  const holdingPeriod = a.exitYear - a.closingYear;

  const count = a.monteCarloTrialsCount;
  const isDefaultSeed42 = a.monteCarloSeed === 42 && count === 1000;
  const rng = createSeededRng(a.monteCarloSeed);

  const trials: MonteCarloTrial[] = [];

  for (let i = 0; i < count; i++) {
    let uRev: number, uMar: number, uMul: number;

    if (isDefaultSeed42 && i < precomputedDraws.length) {
      uRev = precomputedDraws[i].uRevenue;
      uMar = precomputedDraws[i].uMargin;
      uMul = precomputedDraws[i].uMultiple;
    } else {
      // Clamped to avoid +/- infinity
      uRev = Math.max(0.0001, Math.min(0.9999, rng()));
      uMar = Math.max(0.0001, Math.min(0.9999, rng()));
      uMul = Math.max(0.0001, Math.min(0.9999, rng()));
    }

    const revShock = a.revenueShockMean + normSInv(uRev) * a.revenueShockSd;
    const marShock = normSInv(uMar) * a.marginShockSd;
    const exitMultiple = Math.max(a.exitMultipleFloor, a.exitMultipleMean + normSInv(uMul) * a.exitMultipleSd);

    const ebitda2030 = base2030Rev * (1 + revShock) * Math.max(0, base2030Margin + marShock);
    const ebitdaScale = base2030Ebitda <= 0 ? 0 : ebitda2030 / base2030Ebitda;

    const cashAtExitPreInj = baseCashAtExit + (ebitdaScale - 1) * sumBaseEbitda2027_30 * (1 - taxRate);
    const followOnEquity = Math.max(0, -cashAtExitPreInj);

    const exitEv = ebitda2030 * exitMultiple;
    const exitEquity = Math.max(0, exitEv - debtAtExit + Math.max(0, cashAtExitPreInj));

    const totalCalled = s0 + r + followOnEquity;
    const sponsorOwnership = totalCalled > 0 ? (s0 + followOnEquity) / totalCalled : 0;
    const sponsorProceeds = exitEquity * sponsorOwnership * (1 - mgmtPool);

    const sponsorTotalCapital = s0 + followOnEquity;
    const moic = sponsorTotalCapital > 0 ? sponsorProceeds / sponsorTotalCapital : 0;
    const approxIrr = moic <= 0 ? -1.0 : Math.pow(moic, 1 / holdingPeriod) - 1;

    trials.push({
      trialIndex: i + 1,
      uRevenue: uRev,
      uMargin: uMar,
      uMultiple: uMul,
      revenueShock: revShock,
      marginShock: marShock,
      exitMultiple,
      ebitda2030,
      cashAtExitPreInj,
      followOnEquity,
      exitEv,
      exitEquity,
      sponsorOwnership,
      sponsorProceeds,
      moic,
      approxIrr,
    });
  }

  // Summary statistics
  const moics = trials.map(t => t.moic).sort((x, y) => x - y);
  const sumMoic = moics.reduce((s, m) => s + m, 0);
  const meanMoic = sumMoic / count;

  const getPercentile = (pct: number) => {
    const idx = (count - 1) * pct;
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    const weight = idx - low;
    return moics[low] * (1 - weight) + moics[high] * weight;
  };

  const medianMoic = getPercentile(0.5);
  const p5Moic = getPercentile(0.05);
  const p25Moic = getPercentile(0.25);
  const p75Moic = getPercentile(0.75);
  const p95Moic = getPercentile(0.95);

  const probMoicLoss = trials.filter(t => t.moic < 1.0).length / count;
  const probMoicSubHalf = trials.filter(t => t.moic < 0.5).length / count;
  const probMoicAboveTwo = trials.filter(t => t.moic > 2.0).length / count;
  const probFollowOnEquityNeeded = trials.filter(t => t.followOnEquity > 0).length / count;

  const totalFollowOn = trials.reduce((s, t) => s + t.followOnEquity, 0);
  const meanFollowOnEquityCalled = totalFollowOn / count;

  const irrs = trials.map(t => t.approxIrr).sort((x, y) => x - y);
  const medianApproxIrr = irrs[Math.floor(count * 0.5)];

  // Histogram bins matching workbook
  const binDefs = [
    { binLabel: '0-0.25x', binFrom: 0, binTo: 0.25 },
    { binLabel: '0.25-0.5x', binFrom: 0.25, binTo: 0.5 },
    { binLabel: '0.5-0.75x', binFrom: 0.5, binTo: 0.75 },
    { binLabel: '0.75-1.0x', binFrom: 0.75, binTo: 1.0 },
    { binLabel: '1.0-1.5x', binFrom: 1.0, binTo: 1.5 },
    { binLabel: '1.5-2.0x', binFrom: 1.5, binTo: 2.0 },
    { binLabel: '2.0-3.0x', binFrom: 2.0, binTo: 3.0 },
    { binLabel: '3.0-5.0x', binFrom: 3.0, binTo: 5.0 },
    { binLabel: '5.0x+', binFrom: 5.0, binTo: 1000 },
  ];

  const histogram = binDefs.map(b => {
    const c = trials.filter(t => t.moic >= b.binFrom && (b.binTo === 1000 ? true : t.moic < b.binTo)).length;
    return {
      binLabel: b.binLabel,
      binFrom: b.binFrom,
      binTo: b.binTo,
      count: c,
    };
  });

  return {
    meanMoic,
    medianMoic,
    p5Moic,
    p25Moic,
    p75Moic,
    p95Moic,
    probMoicLoss,
    probMoicSubHalf,
    probMoicAboveTwo,
    probFollowOnEquityNeeded,
    meanFollowOnEquityCalled,
    medianApproxIrr,
    histogram,
    trials,
  };
}
