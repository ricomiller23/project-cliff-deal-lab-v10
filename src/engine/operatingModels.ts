import { Assumptions, OperatingYearData, ScenarioId, ScenarioModelResult } from './types';
import { calcSourcesAndUses, HISTORICAL_BENCHMARKS } from './dealsSourcesUses';

export function calcScenarioModel(scenario: ScenarioId, a: Assumptions): ScenarioModelResult {
  const su = calcSourcesAndUses(a);
  const years: OperatingYearData[] = [];

  const seniorLoan = a.seniorLoanAmount;
  const seniorAmortYears = a.seniorLoanAmortYears;
  const annualSeniorRepayment = seniorAmortYears > 0 ? seniorLoan / seniorAmortYears : 0;

  const rocmontNote = a.rocmontLoi.sellerNote;
  const knighthawkNote = a.includeKnighthawk ? a.knighthawkLoi.sellerNote : 0;
  const salisburyDeferred = a.salisburyLoi.sellerNote;
  const salisburyAnnualInstallment =
    a.salisburyLoi.sellerNoteTermYears > 0
      ? (salisburyDeferred / a.salisburyLoi.sellerNoteTermYears) * a.salisburyTargetAchievement
      : 0;

  // Track debt balances across years
  let currentSeniorBalance = seniorLoan;
  let currentRocmontNote = rocmontNote;
  let currentKnighthawkNote = knighthawkNote;
  let currentSalisburyDeferred = salisburyDeferred;
  let rollingCash = 0;

  // Years: 2025 (index 0), 2026 (index 1), 2027 (index 2), 2028 (index 3), 2029 (index 4), 2030 (index 5)
  for (let yr = 2025; yr <= 2030; yr++) {
    let revFpFix = 0;
    let revSalisbury = 0;
    let revRocmont = 0;
    let revKnighthawk = 0;

    let ebitdaFpFix = 0;
    let ebitdaSalisbury = 0;
    let ebitdaRocmont = 0;
    let ebitdaKnighthawk = 0;

    if (yr === 2025) {
      revFpFix = 3341441.07;
      revSalisbury = 7328348.03;
      revRocmont = 6368267.64;
      revKnighthawk = 0;

      ebitdaFpFix = HISTORICAL_BENCHMARKS.ebitda2025A.fpFix;
      ebitdaSalisbury = HISTORICAL_BENCHMARKS.ebitda2025A.salisbury;
      ebitdaRocmont = HISTORICAL_BENCHMARKS.ebitda2025A.rocmont;
      ebitdaKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.ebitda2025A.knighthawk : 0;
    } else if (yr === 2026) {
      if (scenario === 'mgmt') {
        revFpFix = HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.fpFix;
        revSalisbury = HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.salisbury;
        revRocmont = HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.rocmont;
        revKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.mgmtPlan2026E.revenue.knighthawk : 0;

        ebitdaFpFix = HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.fpFix;
        ebitdaSalisbury = HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.salisbury;
        ebitdaRocmont = HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.rocmont;
        ebitdaKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.knighthawk : 0;
      } else if (scenario === 'base') {
        revFpFix = HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix;
        revSalisbury = HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury;
        revRocmont = HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont;
        revKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.runRate2026.revenue.knighthawk : 0;

        ebitdaFpFix = HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix;
        ebitdaSalisbury = HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury;
        ebitdaRocmont = HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont;
        ebitdaKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.runRate2026.ebitda.knighthawk : 0;
      } else {
        // Downside
        const haircut = a.downsideRevenueHaircut;
        revFpFix = HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix * (1 - haircut);
        revSalisbury = HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury * (1 - haircut);
        revRocmont = HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont * (1 - haircut);
        revKnighthawk = a.includeKnighthawk ? HISTORICAL_BENCHMARKS.runRate2026.revenue.knighthawk * (1 - haircut) : 0;

        // 2026 downside margin = 2026 runrate margin - downsideMarginCutPts
        const marginCut = a.downsideMarginCutPts;
        const rrMarginFp = HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix / HISTORICAL_BENCHMARKS.runRate2026.revenue.fpFix;
        const rrMarginSal = HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury / HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury;
        const rrMarginRoc = HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont / HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont;
        const rrMarginKh = HISTORICAL_BENCHMARKS.runRate2026.ebitda.knighthawk / HISTORICAL_BENCHMARKS.runRate2026.revenue.knighthawk;

        ebitdaFpFix = revFpFix * (rrMarginFp - marginCut);
        ebitdaSalisbury = revSalisbury * (rrMarginSal - marginCut);
        ebitdaRocmont = revRocmont * (rrMarginRoc - marginCut);
        ebitdaKnighthawk = a.includeKnighthawk ? revKnighthawk * (rrMarginKh - marginCut) : 0;
      }
    } else {
      // 2027E to 2030E
      const prevYearData = years[years.length - 1];
      const yrIdx = yr - 2027; // 0 for 2027, 1 for 2028, 2 for 2029, 3 for 2030

      if (scenario === 'mgmt') {
        const mgmtGrowth = [0.09, 0.08, 0.07, 0.06][yrIdx];
        const khGrowth = a.mgmtKnighthawkGrowth[yrIdx];

        revFpFix = prevYearData.revFpFix * (1 + mgmtGrowth);
        revSalisbury = prevYearData.revSalisbury * (1 + mgmtGrowth);
        revRocmont = prevYearData.revRocmont * (1 + mgmtGrowth);
        revKnighthawk = a.includeKnighthawk ? prevYearData.revKnighthawk * (1 + khGrowth) : 0;

        // Mgmt margins per workbook
        const fpMargin = [0.015, 0.03, 0.0472714163883257, 0.0645428327766514][yrIdx];
        const salMargin = [0.16, 0.175, 0.19, 0.205][yrIdx];
        const rocMargin = [0.30, 0.3225, 0.3425, 0.36][yrIdx];
        const khMargin = 0.16;

        ebitdaFpFix = revFpFix * fpMargin;
        ebitdaSalisbury = revSalisbury * salMargin;
        ebitdaRocmont = revRocmont * rocMargin;
        ebitdaKnighthawk = a.includeKnighthawk ? revKnighthawk * khMargin : 0;
      } else if (scenario === 'base') {
        revFpFix = prevYearData.revFpFix * (1 + a.baseGrowthFpFix[yrIdx]);
        revSalisbury = prevYearData.revSalisbury * (1 + a.baseGrowthSalisbury[yrIdx]);
        revRocmont = prevYearData.revRocmont * (1 + a.baseGrowthRocmont[yrIdx]);
        revKnighthawk = a.includeKnighthawk ? prevYearData.revKnighthawk * (1 + a.baseGrowthKnighthawk[yrIdx]) : 0;

        ebitdaFpFix = revFpFix * a.baseMarginFpFix;
        ebitdaSalisbury = revSalisbury * a.baseMarginSalisbury;
        ebitdaRocmont = revRocmont * a.baseMarginRocmont;
        ebitdaKnighthawk = a.includeKnighthawk ? revKnighthawk * a.baseMarginKnighthawk : 0;
      } else {
        // Downside
        revFpFix = prevYearData.revFpFix * (1 + a.downsideGrowth[yrIdx]);
        revSalisbury = prevYearData.revSalisbury * (1 + a.downsideGrowth[yrIdx]);
        revRocmont = prevYearData.revRocmont * (1 + a.downsideGrowth[yrIdx]);
        revKnighthawk = a.includeKnighthawk ? prevYearData.revKnighthawk * (1 + a.downsideGrowth[yrIdx]) : 0;

        ebitdaFpFix = revFpFix * (a.baseMarginFpFix - a.downsideMarginCutPts);
        ebitdaSalisbury = revSalisbury * (a.baseMarginSalisbury - a.downsideMarginCutPts);
        ebitdaRocmont = revRocmont * (a.baseMarginRocmont - a.downsideMarginCutPts);
        ebitdaKnighthawk = a.includeKnighthawk ? revKnighthawk * (a.baseMarginKnighthawk - a.downsideMarginCutPts) : 0;
      }
    }

    const totalRevenue = revFpFix + revSalisbury + revRocmont + revKnighthawk;
    const totalEbitda = ebitdaFpFix + ebitdaSalisbury + ebitdaRocmont + ebitdaKnighthawk;
    const ebitdaMargin = totalRevenue > 0 ? totalEbitda / totalRevenue : 0;

    let revenueGrowthPct = 0;
    if (years.length > 0) {
      const prevRev = years[years.length - 1].totalRevenue;
      revenueGrowthPct = prevRev > 0 ? (totalRevenue - prevRev) / prevRev : 0;
    }

    // Debt & cash calculations only apply post-close (2027+)
    let dna = 0;
    let ebit = 0;
    let seniorInterest = 0;
    let sellerInterest = 0;
    let preTaxIncome = 0;
    let taxDistributions = 0;
    let capex = 0;
    let nwcInvestment = 0;
    let cfads = 0;

    let seniorOpening = 0;
    let seniorRepayment = 0;
    let seniorClosing = 0;

    let rocmontNoteOpening = 0;
    let rocmontNoteRepayment = 0;
    let rocmontNoteClosing = 0;

    let knighthawkNoteOpening = 0;
    let knighthawkNoteRepayment = 0;
    let knighthawkNoteClosing = 0;

    let salisburyDeferredOpening = 0;
    let salisburyDeferredPayment = 0;
    let salisburyDeferredClosing = 0;

    let totalDebtClosing = 0;
    let totalDebtService = 0;
    let dscr = 0;
    let dscrExclBalloons = 0;
    let displayedDscr = 0;
    let totalDebtEbitda = 0;
    let seniorDebtEbitda = 0;
    let fcfAfterDebtService = 0;

    if (yr === 2026) {
      // Pre-close close balances
      seniorClosing = seniorLoan;
      rocmontNoteClosing = rocmontNote;
      knighthawkNoteClosing = knighthawkNote;
      salisburyDeferredClosing = salisburyDeferred;
      totalDebtClosing = seniorClosing + rocmontNoteClosing + knighthawkNoteClosing + salisburyDeferredClosing;
      totalDebtEbitda = totalEbitda > 0 ? totalDebtClosing / totalEbitda : 0;
      seniorDebtEbitda = totalEbitda > 0 ? seniorClosing / totalEbitda : 0;
      rollingCash = 0;
    } else if (yr >= 2027) {
      dna = totalRevenue * a.dnaPct;
      ebit = totalEbitda - dna;

      seniorOpening = currentSeniorBalance;
      seniorInterest = seniorOpening * a.seniorLoanRate;
      seniorRepayment = Math.min(annualSeniorRepayment, seniorOpening);
      seniorClosing = seniorOpening - seniorRepayment;
      currentSeniorBalance = seniorClosing;

      rocmontNoteOpening = currentRocmontNote;
      knighthawkNoteOpening = currentKnighthawkNote;
      salisburyDeferredOpening = currentSalisburyDeferred;

      // Rocmont & KH seller notes carry rate
      sellerInterest =
        rocmontNoteOpening * a.rocmontLoi.sellerNoteRate +
        (a.includeKnighthawk ? knighthawkNoteOpening * a.knighthawkLoi.sellerNoteRate : 0);

      preTaxIncome = ebit - seniorInterest - sellerInterest;
      taxDistributions = preTaxIncome > 0 ? preTaxIncome * a.taxDistributionRate : 0;

      capex = totalRevenue * a.capexPct;
      const prevRev = years[years.length - 1].totalRevenue;
      nwcInvestment = (totalRevenue - prevRev) * a.nwcPct;

      cfads = totalEbitda - taxDistributions - capex - nwcInvestment;

      // Seller repayments: bullet at year 3 (2029)
      if (yr === 2029) {
        rocmontNoteRepayment = rocmontNoteOpening;
        knighthawkNoteRepayment = knighthawkNoteOpening;
      } else {
        rocmontNoteRepayment = 0;
        knighthawkNoteRepayment = 0;
      }
      rocmontNoteClosing = rocmontNoteOpening - rocmontNoteRepayment;
      knighthawkNoteClosing = knighthawkNoteOpening - knighthawkNoteRepayment;
      currentRocmontNote = rocmontNoteClosing;
      currentKnighthawkNote = knighthawkNoteClosing;

      // Salisbury deferred payments
      salisburyDeferredPayment = Math.min(salisburyAnnualInstallment, salisburyDeferredOpening);
      salisburyDeferredClosing = salisburyDeferredOpening - salisburyDeferredPayment;
      currentSalisburyDeferred = salisburyDeferredClosing;

      totalDebtClosing = seniorClosing + rocmontNoteClosing + knighthawkNoteClosing + salisburyDeferredClosing;

      const nonSeniorDebtService =
        sellerInterest + rocmontNoteRepayment + knighthawkNoteRepayment + salisburyDeferredPayment;
      const seniorDebtService = seniorInterest + seniorRepayment;
      totalDebtService = seniorDebtService + nonSeniorDebtService;

      dscr = totalDebtService > 0 ? cfads / totalDebtService : 0;
      const balloonService = rocmontNoteRepayment + knighthawkNoteRepayment;
      const serviceExclBalloons = totalDebtService - balloonService;
      dscrExclBalloons = serviceExclBalloons > 0 ? cfads / serviceExclBalloons : 0;
      displayedDscr = a.countSellerBalloonsAsDebtService ? dscr : dscrExclBalloons;

      totalDebtEbitda = totalEbitda > 0 ? totalDebtClosing / totalEbitda : 0;
      seniorDebtEbitda = totalEbitda > 0 ? seniorClosing / totalEbitda : 0;

      fcfAfterDebtService = cfads - totalDebtService;
      rollingCash += fcfAfterDebtService;
    }

    years.push({
      year: yr,
      revFpFix,
      revSalisbury,
      revRocmont,
      revKnighthawk,
      totalRevenue,
      revenueGrowthPct,

      ebitdaFpFix,
      ebitdaSalisbury,
      ebitdaRocmont,
      ebitdaKnighthawk,
      totalEbitda,
      ebitdaMargin,

      dna,
      ebit,
      seniorInterest,
      sellerInterest,
      preTaxIncome,
      taxDistributions,
      capex,
      nwcInvestment,
      cfads,

      seniorOpening,
      seniorRepayment,
      seniorClosing,

      rocmontNoteOpening,
      rocmontNoteRepayment,
      rocmontNoteClosing,

      knighthawkNoteOpening,
      knighthawkNoteRepayment,
      knighthawkNoteClosing,

      salisburyDeferredOpening,
      salisburyDeferredPayment,
      salisburyDeferredClosing,

      totalDebtClosing,
      totalDebtService,
      dscr,
      dscrExclBalloons,
      displayedDscr,
      totalDebtEbitda,
      seniorDebtEbitda,
      fcfAfterDebtService,
      cumulativeCash: rollingCash,
    });
  }

  const postCloseYears = years.filter(y => y.year >= 2027);
  const minDscrInclBalloons = Math.min(...postCloseYears.map(y => y.dscr));
  const minDscrExclBalloons = Math.min(...postCloseYears.map(y => y.dscrExclBalloons));
  const minDscr = a.countSellerBalloonsAsDebtService ? minDscrInclBalloons : minDscrExclBalloons;

  const exitYearData = years[years.length - 1]; // 2030E
  const exitEbitda = exitYearData.totalEbitda;
  const exitEv = exitEbitda * a.exitMultiple;
  const debtAtExit = exitYearData.totalDebtClosing;
  const accumulatedCashAtExit = exitYearData.cumulativeCash;

  // V2 returns (netting convention: shortfall netted against exit value)
  const exitEquityValue = exitEv - debtAtExit + accumulatedCashAtExit;
  const sponsorRolloverAtEntry = su.sources.sponsorCashEquity;
  const sellerRolloverAtEntry = su.sources.sellerRolloverEquity;
  const platformCashAtEntry = su.sources.platformCash;

  const totalEntryEquity = sponsorRolloverAtEntry + sellerRolloverAtEntry + platformCashAtEntry;
  const rawSponsorOwnershipPct = totalEntryEquity > 0 ? (sponsorRolloverAtEntry + platformCashAtEntry) / totalEntryEquity : 0;
  const sponsorOwnershipPct = rawSponsorOwnershipPct * (1 - a.mgmtEquityPoolPct);

  const sponsorExitProceeds = exitEquityValue * sponsorOwnershipPct;
  const sponsorMoicV2 = sponsorRolloverAtEntry > 0 ? sponsorExitProceeds / sponsorRolloverAtEntry : 0;

  const holdingPeriodYears = a.exitYear - a.closingYear;
  const sponsorIrrV2 =
    sponsorMoicV2 > 0 && holdingPeriodYears > 0
      ? Math.pow(sponsorMoicV2, 1 / holdingPeriodYears) - 1
      : -1.0;

  return {
    scenario,
    years,
    postCloseYears,
    minDscr,
    minDscrInclBalloons,
    minDscrExclBalloons,
    exitEbitda,
    exitEv,
    debtAtExit,
    accumulatedCashAtExit,
    exitEquityValue,
    sponsorRolloverAtEntry,
    sellerRolloverAtEntry,
    sponsorOwnershipPct,
    sponsorExitProceeds,
    sponsorMoicV2,
    sponsorIrrV2,
  };
}
