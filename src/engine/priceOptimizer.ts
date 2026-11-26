import { Assumptions, PriceOptimizerDealResult, PriceOptimizerResult } from './types';
import { HISTORICAL_BENCHMARKS } from './dealsSourcesUses';
import { calcDebtSizing } from './debtCapacity';
import { calcScenarioModel } from './operatingModels';
import { calcQoE } from './qoe';

function calcDealOptimizer(
  dealName: string,
  loiEv: number,
  loiCash: number,
  rolloverPct: number,
  deferredTerm: number,
  isAnnuity: boolean,
  salisburyTargetAchieve: number,
  runRateEbitda: number,
  adjusted2025Ebitda: number,
  a: Assumptions
): PriceOptimizerDealResult {
  const targetMultiple = a.targetEvRunRateEbitda;
  const r = a.deferredDiscountRate;
  const feePct = a.closingFeePct;
  const altCUpfrontPct = a.altCUpfrontCashPct;
  const altCEarnoutProb = a.altCEarnoutProb;
  const altCEarnoutYear = a.altCEarnoutYear;

  // PV factors
  const pvFactorBullet = 1 / Math.pow(1 + r, deferredTerm);
  const pvFactorAnnuity = r > 0 ? (1 - Math.pow(1 + r, -deferredTerm)) / (r * deferredTerm) : 1;
  const pvFactorLoi = isAnnuity ? pvFactorAnnuity : pvFactorBullet;
  const pvFactorAltC = 1 / Math.pow(1 + r, altCEarnoutYear);

  // A: LOI
  const aHeadlineEv = loiEv;
  const aUpfrontCash = loiCash;
  const aRollover = aHeadlineEv * rolloverPct;
  const aDeferredFace = aHeadlineEv - aUpfrontCash - aRollover;
  const aProb = isAnnuity ? salisburyTargetAchieve : 1.0;
  const aDeferredPv = aDeferredFace * aProb * pvFactorLoi;
  const aExpectedSellerValue = aUpfrontCash + aRollover + aDeferredPv;
  const aEvRr = runRateEbitda > 0 ? aHeadlineEv / runRateEbitda : 0;
  const aExpectedRr = runRateEbitda > 0 ? aExpectedSellerValue / runRateEbitda : 0;
  const aClosingFees = aHeadlineEv * feePct;

  // B: Reprice, LOI mix
  const bHeadlineEv = Math.max(0, targetMultiple * runRateEbitda);
  const bUpfrontCash = aHeadlineEv > 0 ? bHeadlineEv * (aUpfrontCash / aHeadlineEv) : 0;
  const bRollover = bHeadlineEv * rolloverPct;
  const bDeferredFace = bHeadlineEv - bUpfrontCash - bRollover;
  const bProb = aProb;
  const bDeferredPv = bDeferredFace * bProb * pvFactorLoi;
  const bExpectedSellerValue = bUpfrontCash + bRollover + bDeferredPv;
  const bEvRr = runRateEbitda > 0 ? bHeadlineEv / runRateEbitda : 0;
  const bExpectedRr = runRateEbitda > 0 ? bExpectedSellerValue / runRateEbitda : 0;
  const bPriceChange = aHeadlineEv > 0 ? (bHeadlineEv - aHeadlineEv) / aHeadlineEv : 0;
  const bClosingFees = bHeadlineEv * feePct;

  // C: Reprice, earnout-heavy
  const cHeadlineEv = bHeadlineEv;
  const cUpfrontCash = cHeadlineEv * altCUpfrontPct;
  const cRollover = cHeadlineEv * rolloverPct;
  const cDeferredFace = cHeadlineEv - cUpfrontCash - cRollover;
  const cProb = altCEarnoutProb;
  const cDeferredPv = cDeferredFace * cProb * pvFactorAltC;
  const cExpectedSellerValue = cUpfrontCash + cRollover + cDeferredPv;
  const cEvRr = runRateEbitda > 0 ? cHeadlineEv / runRateEbitda : 0;
  const cExpectedRr = runRateEbitda > 0 ? cExpectedSellerValue / runRateEbitda : 0;
  const cPriceChange = aHeadlineEv > 0 ? (cHeadlineEv - aHeadlineEv) / aHeadlineEv : 0;
  const cClosingFees = cHeadlineEv * feePct;

  return {
    dealName,
    altA_Loi: {
      headlineEv: aHeadlineEv,
      upfrontCash: aUpfrontCash,
      rollover: aRollover,
      deferredFace: aDeferredFace,
      deferredPv: aDeferredPv,
      expectedSellerValue: aExpectedSellerValue,
      evRunRateEbitda: aEvRr,
      expectedValueRunRateEbitda: aExpectedRr,
      priceChangePct: 0,
      closingFees: aClosingFees,
    },
    altB_Reprice: {
      headlineEv: bHeadlineEv,
      upfrontCash: bUpfrontCash,
      rollover: bRollover,
      deferredFace: bDeferredFace,
      deferredPv: bDeferredPv,
      expectedSellerValue: bExpectedSellerValue,
      evRunRateEbitda: bEvRr,
      expectedValueRunRateEbitda: bExpectedRr,
      priceChangePct: bPriceChange,
      closingFees: bClosingFees,
    },
    altC_EarnoutHeavy: {
      headlineEv: cHeadlineEv,
      upfrontCash: cUpfrontCash,
      rollover: cRollover,
      deferredFace: cDeferredFace,
      deferredPv: cDeferredPv,
      expectedSellerValue: cExpectedSellerValue,
      evRunRateEbitda: cEvRr,
      expectedValueRunRateEbitda: cExpectedRr,
      priceChangePct: cPriceChange,
      closingFees: cClosingFees,
    },
  };
}

export function calcPriceOptimizer(a: Assumptions): PriceOptimizerResult {
  const qoe = calcQoE(a);
  const rocmontAdj2025 = qoe.rocmontBridge[3].adjustedEbitda;
  const salisburyAdj2025 = qoe.salisburyBridge[3].adjustedEbitda;

  const rocmont = calcDealOptimizer(
    'Rocmont',
    a.rocmontLoi.ev,
    a.rocmontLoi.cashAtClosing,
    a.rocmontLoi.rolloverPct,
    a.rocmontLoi.sellerNoteTermYears,
    false,
    1.0,
    HISTORICAL_BENCHMARKS.runRate2026.ebitda.rocmont,
    rocmontAdj2025,
    a
  );

  const salisbury = calcDealOptimizer(
    'Salisbury',
    a.salisburyLoi.ev,
    a.salisburyLoi.cashAtClosing,
    a.salisburyLoi.rolloverPct,
    a.salisburyLoi.sellerNoteTermYears,
    true, // 5 equal annual installments
    a.salisburyTargetAchievement,
    HISTORICAL_BENCHMARKS.runRate2026.ebitda.salisbury,
    salisburyAdj2025,
    a
  );

  const knighthawk = calcDealOptimizer(
    'Knighthawk',
    a.knighthawkLoi.ev,
    a.knighthawkLoi.cashAtClosing,
    a.knighthawkLoi.rolloverPct,
    a.knighthawkLoi.sellerNoteTermYears,
    false,
    1.0,
    HISTORICAL_BENCHMARKS.runRate2026.ebitda.knighthawk,
    HISTORICAL_BENCHMARKS.ebitda2025A.knighthawk,
    a
  );

  // Platform cash need (Rocmont + Salisbury; Knighthawk excluded per workbook)
  const refiFp = a.refinanceFpLegacyDebt ? a.fpLegacyDebtAmount : 0;
  const seniorLoanInputs = a.seniorLoanAmount;

  // Base debt capacity
  const baseModel = calcScenarioModel('base', a);
  const baseDebtSizing = calcDebtSizing('base', baseModel, a);
  const loanCapacity = Math.max(0, baseDebtSizing.maxSeniorLoanAtCurrentAmort);

  const alts = ['altA_Loi', 'altB_Reprice', 'altC_EarnoutHeavy'] as const;
  const platformRes: any = {};

  for (const alt of alts) {
    const upfrontCash = rocmont[alt].upfrontCash + salisbury[alt].upfrontCash;
    const fees = rocmont[alt].closingFees + salisbury[alt].closingFees;
    const totalCashUses = upfrontCash + fees + refiFp;
    const sponsorCashAtLoanInputs = totalCashUses - seniorLoanInputs - a.platformCashContributed;
    const sponsorCashAtCapacity = totalCashUses - loanCapacity - a.platformCashContributed;

    const key = alt === 'altA_Loi' ? 'altA' : alt === 'altB_Reprice' ? 'altB' : 'altC';
    platformRes[key] = {
      upfrontCash,
      closingFees: fees,
      refiLegacy: refiFp,
      totalCashUses,
      sponsorCashAtLoanInputs,
      sponsorCashAtCapacity,
    };
  }

  return {
    rocmont,
    salisbury,
    knighthawk,
    platformCashNeed: platformRes,
  };
}
