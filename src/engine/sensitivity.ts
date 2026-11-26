import { Assumptions, SensitivityMatrix } from './types';
import { calcScenarioModel } from './operatingModels';
import { calcSourcesAndUses } from './dealsSourcesUses';
import { calcEquityInjections } from './equityInjections';

export function calcSensitivity(a: Assumptions): SensitivityMatrix {
  const su = calcSourcesAndUses(a);
  const baseModel = calcScenarioModel('base', a);
  const baseEquityInj = calcEquityInjections('base', baseModel, a);

  const base2030Ebitda = baseModel.years[5].totalEbitda;
  const debtAtExit = baseModel.debtAtExit;
  // Accumulated cash at exit after accounting for injections and minimum cash balance
  const cashAtExit = baseEquityInj.years.length > 0 ? baseEquityInj.years[baseEquityInj.years.length - 1].closingCash : 0;
  
  const totalSponsorCapitalCalled = baseEquityInj.totalSponsorCapitalCalled;
  const sponsorOwnershipPctAtCost = baseEquityInj.sponsorOwnershipPctAtCost;
  const holdingPeriod = a.exitYear - a.closingYear;

  const exitMultiples = [3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5];
  const ebitdaMultipliers = [0.6, 0.8, 1.0, 1.25, 1.5, 2.0, 2.6];
  const impliedEbitdas = ebitdaMultipliers.map(m => m * base2030Ebitda);

  const moicGrid: number[][] = [];
  const irrGrid: number[][] = [];

  for (let r = 0; r < exitMultiples.length; r++) {
    const mult = exitMultiples[r];
    const moicRow: number[] = [];
    const irrRow: number[] = [];

    for (let c = 0; c < impliedEbitdas.length; c++) {
      const ebitda = impliedEbitdas[c];
      const exitEv = mult * ebitda;
      const exitEquityValue = exitEv - debtAtExit + cashAtExit;
      const sponsorExitProceeds = exitEquityValue * sponsorOwnershipPctAtCost;
      const moic = totalSponsorCapitalCalled > 0 ? Math.max(0, sponsorExitProceeds / totalSponsorCapitalCalled) : 0;
      const irr = moic > 0 && holdingPeriod > 0 ? Math.pow(moic, 1 / holdingPeriod) - 1 : -1.0;

      moicRow.push(moic);
      irrRow.push(irr);
    }

    moicGrid.push(moicRow);
    irrGrid.push(irrRow);
  }

  // Break-even multiple for 1.0x MOIC per EBITDA multiplier column (using equity-injection logic)
  const breakEvenMultiplePerRow: number[] = impliedEbitdas.map(ebitda => {
    if (sponsorOwnershipPctAtCost <= 0 || ebitda <= 0) return 0;
    const requiredExitEquity = totalSponsorCapitalCalled / sponsorOwnershipPctAtCost;
    const requiredExitEv = requiredExitEquity + debtAtExit - cashAtExit;
    return Math.max(0, requiredExitEv / ebitda);
  });

  return {
    exitMultiples,
    ebitdaMultipliers,
    impliedEbitdas,
    moicGrid,
    irrGrid,
    breakEvenMultiplePerRow,
  };
}
