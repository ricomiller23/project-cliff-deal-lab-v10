import { Assumptions, SourcesAndUsesResult } from './types';

export const HISTORICAL_BENCHMARKS = {
  ebitda2025A: {
    rocmont: 1582911.72,
    salisbury: 1068155.79,
    knighthawk: 1054875.0, // 2024A from QB P&L
    fpFix: 251286.09,
    total3Entities: 2902353.60,
  },
  runRate2026: {
    revenue: {
      fpFix: 2504434.74666667,
      salisbury: 6117381.81333333,
      rocmont: 4509464.82175183,
      knighthawk: 7299464.98666667,
    },
    ebitda: {
      fpFix: -416597.866666667,
      salisbury: 456772.546666667,
      rocmont: 1076893.65245902,
      knighthawk: 1186829.33333333,
    },
  },
  mgmtPlan2026E: {
    revenue: {
      fpFix: 3384000.1065,
      salisbury: 7181781.0694,
      rocmont: 6495632.9928,
      knighthawk: 7299464.98666667,
    },
    ebitda: {
      fpFix: 2996.51513999997,
      salisbury: 646360.296246001,
      rocmont: 2078602.557696,
      knighthawk: 1186829.33333333,
    },
  },
};

export function calcSourcesAndUses(a: Assumptions): SourcesAndUsesResult {
  const rocmontEv = a.rocmontLoi.ev;
  const salisburyEv = a.salisburyLoi.ev;
  const knighthawkEv = a.includeKnighthawk ? a.knighthawkLoi.ev : 0;
  const totalDealEv = rocmontEv + salisburyEv + knighthawkEv;

  const closingFees = totalDealEv * a.closingFeePct;
  const refiDebt = a.refinanceFpLegacyDebt ? a.fpLegacyDebtAmount : 0;
  const buySalisburyRe = a.buySalisburyRe ? a.salisburyLoi.realEstateAppraisal * 0.5 : 0;

  const totalUses = rocmontEv + salisburyEv + knighthawkEv + closingFees + refiDebt + buySalisburyRe;

  const seniorTermLoan = a.seniorLoanAmount;
  const rocmontSellerNote = a.rocmontLoi.sellerNote;
  const salisburyDeferred = a.salisburyLoi.sellerNote;
  const knighthawkSellerNote = a.includeKnighthawk ? a.knighthawkLoi.sellerNote : 0;
  const totalSellerNotes = rocmontSellerNote + salisburyDeferred + knighthawkSellerNote;

  const rocmontRollover = rocmontEv * a.rocmontLoi.rolloverPct;
  const salisburyRollover = salisburyEv * a.salisburyLoi.rolloverPct;
  const knighthawkRollover = a.includeKnighthawk ? knighthawkEv * a.knighthawkLoi.rolloverPct : 0;
  const totalRollover = rocmontRollover + salisburyRollover + knighthawkRollover;

  const platformCash = a.platformCashContributed;
  const sponsorCashEquity = totalUses - seniorTermLoan - totalSellerNotes - totalRollover - platformCash;
  const totalSources = seniorTermLoan + totalSellerNotes + totalRollover + platformCash + sponsorCashEquity;
  const check = totalSources - totalUses;

  // Entry multiples
  const rocmont2025Ebitda = HISTORICAL_BENCHMARKS.ebitda2025A.rocmont;
  const salisbury2025Ebitda = HISTORICAL_BENCHMARKS.ebitda2025A.salisbury;
  const knighthawk2025Ebitda = HISTORICAL_BENCHMARKS.ebitda2025A.knighthawk;

  const rocmontRunRateEbitda = HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont;
  const salisburyRunRateEbitda = HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury;
  const knighthawkRunRateEbitda = HISTORICAL_BENCHMARKS.runRate2026.ebitda.knighthawk;

  const rocmontMgmtPlanEbitda = HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.rocmont;
  const salisburyMgmtPlanEbitda = HISTORICAL_BENCHMARKS.mgmtPlan2026E.ebitda.salisbury;

  const rocmontRunRateRev = HISTORICAL_BENCHMARKS.runRate2026.revenue.rocmont;
  const salisburyRunRateRev = HISTORICAL_BENCHMARKS.runRate2026.revenue.salisbury;
  const knighthawkRunRateRev = HISTORICAL_BENCHMARKS.runRate2026.revenue.knighthawk;

  const platformTotalRunRateEbitda =
    HISTORICAL_BENCHMARKS.runRate2026.ebitda.fpFix +
    salisburyRunRateEbitda +
    rocmontRunRateEbitda +
    (a.includeKnighthawk ? knighthawkRunRateEbitda : 0);

  const totalDebtAtClose = seniorTermLoan + totalSellerNotes;

  // Real estate collateral
  const rocmontAppraisal = a.rocmontLoi.realEstateAppraisal;
  const rocmontBookLand = 335609.04; // Oct-26 balance sheet
  const rocmontUnrecorded = rocmontAppraisal - rocmontBookLand;
  const salisburyAppraisal = a.salisburyLoi.realEstateAppraisal;
  const lendableValue = (rocmontAppraisal + salisburyAppraisal) * a.rocmontLoi.realEstateAdvanceRate;
  const seniorLoanPctOfLendable = lendableValue > 0 ? seniorTermLoan / lendableValue : 0;

  return {
    uses: {
      rocmontEv,
      salisburyEv,
      knighthawkEv,
      closingFees,
      refinanceFpLegacyDebt: refiDebt,
      buySalisburyRe,
      totalUses,
    },
    sources: {
      seniorTermLoan,
      sellerNotes: totalSellerNotes,
      sellerRolloverEquity: totalRollover,
      platformCash,
      sponsorCashEquity,
      totalSources,
      check,
    },
    entryMultiples: {
      rocmontEv2025Ebitda: rocmontEv / rocmont2025Ebitda,
      rocmontEv2026RunRateEbitda: rocmontEv / rocmontRunRateEbitda,
      rocmontEv2026MgmtPlanEbitda: rocmontEv / rocmontMgmtPlanEbitda,
      rocmontEv2026RunRateRevenue: rocmontEv / rocmontRunRateRev,

      salisburyEv2025Ebitda: salisburyEv / salisbury2025Ebitda,
      salisburyEv2026RunRateEbitda: salisburyEv / salisburyRunRateEbitda,
      salisburyEv2026MgmtPlanEbitda: salisburyEv / salisburyMgmtPlanEbitda,
      salisburyEv2026RunRateRevenue: salisburyEv / salisburyRunRateRev,

      knighthawkEv2025Ebitda: a.knighthawkLoi.ev / knighthawk2025Ebitda,
      knighthawkEv2026RunRateEbitda: a.knighthawkLoi.ev / knighthawkRunRateEbitda,
      knighthawkEv2026RunRateRevenue: a.knighthawkLoi.ev / knighthawkRunRateRev,

      totalEv2026RunRateEbitda: (rocmontEv + salisburyEv + knighthawkEv) / platformTotalRunRateEbitda,
      totalDebtAtClose2026RunRateEbitda: totalDebtAtClose / platformTotalRunRateEbitda,
    },
    realEstateCollateral: {
      rocmontAppraisal,
      rocmontBookLand,
      rocmontUnrecordedReValue: rocmontUnrecorded,
      salisburyAppraisal,
      lendableValue,
      seniorLoanPctOfLendable,
    },
  };
}
