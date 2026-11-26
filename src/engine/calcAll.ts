import { Assumptions, EngineResults } from './types';
import { calcSourcesAndUses } from './dealsSourcesUses';
import { calcScenarioModel } from './operatingModels';
import { calcEquityInjections } from './equityInjections';
import { calcDebtSizing } from './debtCapacity';
import { calcQoE } from './qoe';
import { calcCashFlow13W } from './cashFlow13W';
import { calcRocmontWip } from './rocmontWip';
import { calcPriceOptimizer } from './priceOptimizer';
import { runMonteCarlo } from './monteCarlo';
import { calcTaxStructure } from './taxStructure';
import { calcThreeStatement } from './threeStatement';
import { calcSensitivity } from './sensitivity';
import { getPlanVsActualData } from './planVsActual';

export function calcAll(a: Assumptions): EngineResults {
  const sourcesAndUses = calcSourcesAndUses(a);

  // Operating models
  const mgmtModel = calcScenarioModel('mgmt', a);
  const baseModel = calcScenarioModel('base', a);
  const downsideModel = calcScenarioModel('downside', a);
  const activeModel = a.activeScenario === 'mgmt' ? mgmtModel : a.activeScenario === 'downside' ? downsideModel : baseModel;

  // Equity Injections (Model 1)
  const mgmtEquityInjection = calcEquityInjections('mgmt', mgmtModel, a);
  const baseEquityInjection = calcEquityInjections('base', baseModel, a);
  const downsideEquityInjection = calcEquityInjections('downside', downsideModel, a);
  const activeEquityInjection =
    a.activeScenario === 'mgmt'
      ? mgmtEquityInjection
      : a.activeScenario === 'downside'
      ? downsideEquityInjection
      : baseEquityInjection;

  // Debt Sizing (Model 2)
  const mgmtDebtSizing = calcDebtSizing('mgmt', mgmtModel, a);
  const baseDebtSizing = calcDebtSizing('base', baseModel, a);
  const downsideDebtSizing = calcDebtSizing('downside', downsideModel, a);
  const activeDebtSizing =
    a.activeScenario === 'mgmt' ? mgmtDebtSizing : a.activeScenario === 'downside' ? downsideDebtSizing : baseDebtSizing;

  // QoE (Model 3)
  const qoe = calcQoE(a);

  // 13-Week Cash (Model 4)
  const cashFlow13W = calcCashFlow13W(a);

  // Rocmont WIP (Model 5)
  const wipRocmont = calcRocmontWip(a);

  // Price Optimizer (Model 6)
  const priceOptimizer = calcPriceOptimizer(a);

  // Monte Carlo (Model 7)
  const monteCarlo = runMonteCarlo(a);

  // Tax & Structure (Model 8)
  const taxStructure = calcTaxStructure(a);

  // Three Statement (Model 9)
  const threeStatement = calcThreeStatement(a, a.activeScenario);

  // Returns Sensitivity
  const sensitivity = calcSensitivity(a);

  // Plan vs Actuals
  const planVsActual = getPlanVsActualData();

  return {
    sourcesAndUses,
    mgmtModel,
    baseModel,
    downsideModel,
    activeModel,

    mgmtEquityInjection,
    baseEquityInjection,
    downsideEquityInjection,
    activeEquityInjection,

    mgmtDebtSizing,
    baseDebtSizing,
    downsideDebtSizing,
    activeDebtSizing,

    qoe,
    cashFlow13W,
    wipRocmont,
    priceOptimizer,
    monteCarlo,
    taxStructure,
    threeStatement,
    sensitivity,
    planVsActual,
  };
}
