import { Assumptions, TaxStructureResult } from './types';
import { calcScenarioModel } from './operatingModels';

export function calcTaxStructure(a: Assumptions): TaxStructureResult {
  const buyerTaxRate = a.buyerTaxRate;
  const discountRate = a.taxShieldDiscountRate;
  const amortYears = a.sec197AmortYears;
  const ltcgNiitRate = a.sellerLtcgNiitRate;
  const ordinaryRate = a.sellerOrdinaryRate;
  const stateRate = a.sellerStateTaxRate;
  const basisPct = a.sellerTaxBasisPct;

  // Present value of ordinary annuity of $1 per year for N years at rate r: (1 - (1+r)^-N) / r
  const pvAnnuityFactor = discountRate > 0 ? (1 - Math.pow(1 + discountRate, -amortYears)) / discountRate : amortYears;

  // Rocmont
  const rocmontEv = a.rocmontLoi.ev;
  const rocmontNetFixedAssets = 759609.87;
  const rocmontNwcAcquired = 1002839.39 + 338583.87 - 108033.61 - 820185.0; // 413,204.65
  const rocmontExcess = Math.max(0, rocmontEv - rocmontNetFixedAssets - rocmontNwcAcquired);
  const rocmontAnnualAmort = amortYears > 0 ? rocmontExcess / amortYears : 0;
  const rocmontAnnualSavings = rocmontAnnualAmort * buyerTaxRate;
  const rocmontPvSavings = rocmontAnnualSavings * pvAnnuityFactor;
  const rocmontAccDeprec = 798519.09;
  const rocmontExtraTax = rocmontAccDeprec * (ordinaryRate - ltcgNiitRate);
  const rocmontGrossUp = (1 - ltcgNiitRate - stateRate) > 0 ? rocmontExtraTax / (1 - ltcgNiitRate - stateRate) : 0;
  const rocmontNetValue = rocmontPvSavings - rocmontGrossUp;
  const rocmontNetValuePct = rocmontEv > 0 ? rocmontNetValue / rocmontEv : 0;

  const rocmontCashAtClose = a.rocmontLoi.cashAtClosing;
  const rocmontDebtRetired = a.rocmontLoi.targetDebtRetired;
  const rocmontNetCash = rocmontCashAtClose - rocmontDebtRetired;
  const rocmontBasisAlloc = basisPct * rocmontNetCash;
  const rocmontTaxableGain = Math.max(0, rocmontNetCash - rocmontBasisAlloc);
  const rocmontTaxOnCash = rocmontTaxableGain * (ltcgNiitRate + stateRate);
  const rocmontAfterTaxCash = rocmontNetCash - rocmontTaxOnCash;

  // Salisbury
  const salisburyEv = a.salisburyLoi.ev;
  const salisburyNetFixedAssets = 453038.40;
  const salisburyNwcAcquired = 1640043.29 - 326674.24; // 1,313,369.05
  const salisburyExcess = Math.max(0, salisburyEv - salisburyNetFixedAssets - salisburyNwcAcquired);
  const salisburyAnnualAmort = amortYears > 0 ? salisburyExcess / amortYears : 0;
  const salisburyAnnualSavings = salisburyAnnualAmort * buyerTaxRate;
  const salisburyPvSavings = salisburyAnnualSavings * pvAnnuityFactor;
  const salisburyAccDeprec = 1684724.0;
  const salisburyExtraTax = salisburyAccDeprec * (ordinaryRate - ltcgNiitRate);
  const salisburyGrossUp = (1 - ltcgNiitRate - stateRate) > 0 ? salisburyExtraTax / (1 - ltcgNiitRate - stateRate) : 0;
  const salisburyNetValue = salisburyPvSavings - salisburyGrossUp;
  const salisburyNetValuePct = salisburyEv > 0 ? salisburyNetValue / salisburyEv : 0;

  const salisburyCashAtClose = a.salisburyLoi.cashAtClosing;
  const salisburyDebtRetired = a.salisburyLoi.targetDebtRetired;
  const salisburyNetCash = salisburyCashAtClose - salisburyDebtRetired;
  const salisburyBasisAlloc = basisPct * salisburyNetCash;
  const salisburyTaxableGain = Math.max(0, salisburyNetCash - salisburyBasisAlloc);
  const salisburyTaxOnCash = salisburyTaxableGain * (ltcgNiitRate + stateRate);
  const salisburyAfterTaxCash = salisburyNetCash - salisburyTaxOnCash;

  // Platform tax distributions for Base case
  const baseModel = calcScenarioModel('base', a);
  const basePostClose = baseModel.postCloseYears;
  const years = basePostClose.map(y => y.year);
  const preTaxIncome = basePostClose.map(y => y.preTaxIncome);
  const taxDistributions = basePostClose.map(y => y.taxDistributions);
  const taxDistPctEbitda = basePostClose.map(y => (y.totalEbitda > 0 ? y.taxDistributions / y.totalEbitda : 0));

  return {
    rocmont: {
      ev: rocmontEv,
      netFixedAssets: rocmontNetFixedAssets,
      nwcAcquired: rocmontNwcAcquired,
      goodwillIntangibles: rocmontExcess,
      annualAmort: rocmontAnnualAmort,
      annualTaxSavings: rocmontAnnualSavings,
      pvTaxSavings: rocmontPvSavings,
      accumulatedDeprec: rocmontAccDeprec,
      extraSellerTax: rocmontExtraTax,
      sellerGrossUp: rocmontGrossUp,
      netValueDealStepUp: rocmontNetValue,
      netValuePctEv: rocmontNetValuePct,
      sellerCashAtClose: rocmontCashAtClose,
      sellerDebtRetired: rocmontDebtRetired,
      sellerNetCash: rocmontNetCash,
      sellerTaxOnCash: rocmontTaxOnCash,
      sellerAfterTaxCash: rocmontAfterTaxCash,
    },
    salisbury: {
      ev: salisburyEv,
      netFixedAssets: salisburyNetFixedAssets,
      nwcAcquired: salisburyNwcAcquired,
      goodwillIntangibles: salisburyExcess,
      annualAmort: salisburyAnnualAmort,
      annualTaxSavings: salisburyAnnualSavings,
      pvTaxSavings: salisburyPvSavings,
      accumulatedDeprec: salisburyAccDeprec,
      extraSellerTax: salisburyExtraTax,
      sellerGrossUp: salisburyGrossUp,
      netValueDealStepUp: salisburyNetValue,
      netValuePctEv: salisburyNetValuePct,
      sellerCashAtClose: salisburyCashAtClose,
      sellerDebtRetired: salisburyDebtRetired,
      sellerNetCash: salisburyNetCash,
      sellerTaxOnCash: salisburyTaxOnCash,
      sellerAfterTaxCash: salisburyAfterTaxCash,
    },
    platformTaxDistributions: {
      years,
      preTaxIncome,
      taxDistributions,
      taxDistPctEbitda,
    },
  };
}
