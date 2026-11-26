import { Assumptions, EquityInjectionResult, ScenarioId, ScenarioModelResult } from './types';
import { calcIrr } from './financialMath';
import { calcSourcesAndUses } from './dealsSourcesUses';

export function calcEquityInjections(
  scenario: ScenarioId,
  model: ScenarioModelResult,
  a: Assumptions
): EquityInjectionResult {
  const su = calcSourcesAndUses(a);
  const s0 = su.sources.sponsorCashEquity;
  const rolloverEntry = su.sources.sellerRolloverEquity;
  const minCash = a.minimumCashBalance;
  const sponsorShare = a.sponsorShareInjections;

  const postCloseYears = model.postCloseYears; // 2027E to 2030E
  let currentCash = 0;
  let cumulativeInjections = 0;

  const yearsData: EquityInjectionResult['years'] = [];
  const annualInjections: number[] = [];

  for (const yrData of postCloseYears) {
    const fcfads = yrData.fcfAfterDebtService;
    const openingCash = currentCash;
    const cashBeforeInjection = openingCash + fcfads;

    let injectionRequired = 0;
    if (cashBeforeInjection < minCash) {
      injectionRequired = minCash - cashBeforeInjection;
      currentCash = minCash;
    } else {
      injectionRequired = 0;
      currentCash = cashBeforeInjection;
    }

    cumulativeInjections += injectionRequired;
    annualInjections.push(injectionRequired);

    yearsData.push({
      year: yrData.year,
      fcfads,
      openingCash,
      cashBeforeInjection,
      injectionRequired,
      closingCash: currentCash,
      cumulativeInjections,
    });
  }

  const totalInjections = cumulativeInjections;
  const sponsorInjectionsCalled = totalInjections * sponsorShare;
  const totalSponsorCapitalCalled = s0 + sponsorInjectionsCalled;

  // Exit at 2030
  const exitEv = model.exitEv;
  const debtAtExit = model.debtAtExit;
  const cashAtExit = currentCash;
  const exitEquityValue = exitEv - debtAtExit + cashAtExit;

  const totalCapitalCalledAtCost = s0 + rolloverEntry + totalInjections;
  const rawSponsorOwnership =
    totalCapitalCalledAtCost > 0 ? (s0 + sponsorInjectionsCalled) / totalCapitalCalledAtCost : 0;
  const sponsorOwnershipPctAtCost = rawSponsorOwnership * (1 - a.mgmtEquityPoolPct);

  const sponsorExitProceeds = exitEquityValue * sponsorOwnershipPctAtCost;
  const sponsorMoicV3 = totalSponsorCapitalCalled > 0 ? sponsorExitProceeds / totalSponsorCapitalCalled : 0;

  // Dated cash flows: 2026, 2027, 2028, 2029, 2030
  const cashFlowTimeline: { year: number; cashFlow: number }[] = [];
  cashFlowTimeline.push({ year: 2026, cashFlow: -s0 });

  for (let i = 0; i < postCloseYears.length; i++) {
    const yr = postCloseYears[i].year;
    const inj = annualInjections[i] * sponsorShare;
    if (yr === 2030) {
      cashFlowTimeline.push({ year: yr, cashFlow: sponsorExitProceeds - inj });
    } else {
      cashFlowTimeline.push({ year: yr, cashFlow: -inj });
    }
  }

  const rawCashFlows = cashFlowTimeline.map(c => c.cashFlow);
  const sponsorIrrV3 = calcIrr(rawCashFlows);

  return {
    scenario,
    years: yearsData,
    totalInjections,
    sponsorInjectionsCalled,
    totalSponsorCapitalCalled,
    exitEquityValue,
    sponsorOwnershipPctAtCost,
    sponsorExitProceeds,
    sponsorMoicV3,
    sponsorIrrV3,
    cashFlowTimeline,
  };
}
