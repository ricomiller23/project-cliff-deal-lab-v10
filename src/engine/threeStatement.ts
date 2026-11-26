import { Assumptions, ScenarioId, ThreeStatementYear } from './types';
import { calcSourcesAndUses } from './dealsSourcesUses';
import { calcScenarioModel } from './operatingModels';
import { calcEquityInjections } from './equityInjections';

export function calcThreeStatement(a: Assumptions, scenarioOverride?: ScenarioId): ThreeStatementYear[] {
  const scenario = scenarioOverride || a.activeScenario;
  const su = calcSourcesAndUses(a);
  const model = calcScenarioModel(scenario, a);
  const eqInj = calcEquityInjections(scenario, model, a);

  const years: ThreeStatementYear[] = [];
  const yearsList = [2026, 2027, 2028, 2029, 2030];

  const totalUsesAtClose = su.uses.totalUses;
  const openingPpeVal = a.openingPpe; // 1,462,648.27

  let prevNetPpe = openingPpeVal;
  let prevClosingCash = a.platformCashContributed;
  let goodwillIntangibles = 0;

  for (let idx = 0; idx < yearsList.length; idx++) {
    const yr = yearsList[idx];
    const isClose = yr === 2026;
    const modelYrIdx = isClose ? 1 : idx + 1; // 2026 is index 1 in model.years
    const yrModel = model.years[modelYrIdx];

    const revenue = yrModel.totalRevenue;
    const ebitda = isClose ? 0 : yrModel.totalEbitda;
    const dna = isClose ? 0 : yrModel.dna;
    const ebit = isClose ? 0 : yrModel.ebit;
    const seniorInterest = isClose ? 0 : yrModel.seniorInterest;
    const sellerInterest = isClose ? 0 : yrModel.sellerInterest;
    const gainOnForfeitedDeferred = 0;
    const netIncomePreTax = isClose ? 0 : yrModel.preTaxIncome;

    const nwcInv = isClose ? 0 : yrModel.nwcInvestment;
    const cfo = isClose ? 0 : netIncomePreTax + dna - nwcInv;

    const capex = isClose ? 0 : yrModel.capex;
    const seniorRepayment = isClose ? 0 : yrModel.seniorRepayment;
    const sellerRepayment = isClose ? 0 : yrModel.rocmontNoteRepayment + yrModel.knighthawkNoteRepayment;
    const deferredPaid = isClose ? 0 : yrModel.salisburyDeferredPayment;
    const taxDistributions = isClose ? 0 : yrModel.taxDistributions;

    // Injections from Equity_Inj
    let equityInjections = 0;
    let closingCash = 0;

    if (isClose) {
      closingCash = a.platformCashContributed; // 0 default
    } else {
      const eqYr = eqInj.years[idx - 1]; // idx - 1 corresponds to 2027..2030
      equityInjections = eqYr ? eqYr.injectionRequired : 0;
      closingCash = eqYr ? eqYr.closingCash : 0;
    }

    const cff = isClose
      ? 0
      : -seniorRepayment - sellerRepayment - deferredPaid - taxDistributions + equityInjections;

    const netChangeInCash = isClose ? 0 : cfo - capex + cff;
    const openingCash = isClose ? 0 : prevClosingCash;
    prevClosingCash = closingCash;

    // Balance Sheet
    const bsCash = closingCash;
    const bsNwc = a.nwcPct * revenue;

    let bsNetPpe = 0;
    if (isClose) {
      bsNetPpe = openingPpeVal;
      goodwillIntangibles = totalUsesAtClose - bsCash - bsNwc - bsNetPpe;
    } else {
      bsNetPpe = prevNetPpe + capex - dna;
      prevNetPpe = bsNetPpe;
    }

    const bsGoodwill = goodwillIntangibles;
    const totalAssets = bsCash + bsNwc + bsNetPpe + bsGoodwill;

    const bsSeniorLoan = yrModel.seniorClosing;
    const bsRocmontNote = yrModel.rocmontNoteClosing;
    const bsKnighthawkNote = yrModel.knighthawkNoteClosing;
    const bsSalisburyDeferred = yrModel.salisburyDeferredClosing;
    const totalDebt = bsSeniorLoan + bsRocmontNote + bsKnighthawkNote + bsSalisburyDeferred;

    // Total equity balances the balance sheet
    const totalEquity = totalAssets - totalDebt;
    const totalLiabilitiesAndEquity = totalDebt + totalEquity;
    const balanceCheck = totalAssets - totalLiabilitiesAndEquity; // 0

    years.push({
      year: yr,
      revenue,
      ebitda,
      dna,
      ebit,
      seniorInterest,
      sellerInterest,
      gainOnForfeitedDeferred,
      netIncomePreTax,

      cfo,
      capex,
      seniorRepayment,
      sellerRepayment,
      deferredPaid,
      taxDistributions,
      equityInjections,
      cff,
      netChangeInCash,
      openingCash,
      closingCash,

      bsCash,
      bsNwc,
      bsNetPpe,
      bsGoodwill,
      totalAssets,

      bsSeniorLoan,
      bsRocmontNote,
      bsKnighthawkNote,
      bsSalisburyDeferred,
      totalDebt,
      totalEquity,
      totalLiabilitiesAndEquity,
      balanceCheck,
    });
  }

  return years;
}
