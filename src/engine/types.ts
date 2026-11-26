export type ScenarioId = 'mgmt' | 'base' | 'downside';

export interface DealLoiTerms {
  ev: number;
  cashAtClosing: number;
  rolloverPct: number;
  sellerNote: number;
  sellerNoteRate: number;
  sellerNoteTermYears: number;
  targetDebtRetired: number;
  realEstateAppraisal: number;
  realEstateAdvanceRate: number;
}

export interface Assumptions {
  // Scenario selector
  activeScenario: ScenarioId;

  // Global Deal levers
  closingYear: number;
  exitYear: number;
  exitMultiple: number;
  taxDistributionRate: number;
  capexPct: number;
  dnaPct: number;
  nwcPct: number;
  mgmtEquityPoolPct: number;
  includeKnighthawk: boolean;
  closingFeePct: number;
  refinanceFpLegacyDebt: boolean;
  fpLegacyDebtAmount: number;
  platformCashContributed: number;
  buySalisburyRe: boolean;
  minimumCashBalance: number;
  sponsorShareInjections: number;

  // Senior Financing levers
  seniorLoanAmount: number;
  seniorLoanRate: number;
  seniorLoanAmortYears: number;
  targetDscr: number;
  countSellerBalloonsAsDebtService: boolean;
  maxTotalDebtEbitdaCovenant: number;

  // Target Deal LOI Terms
  rocmontLoi: DealLoiTerms;
  salisburyLoi: DealLoiTerms;
  knighthawkLoi: DealLoiTerms;
  salisburyTargetAchievement: number;

  // Operating levers - Base
  baseMarginFpFix: number;
  baseMarginSalisbury: number;
  baseMarginRocmont: number;
  baseMarginKnighthawk: number;

  baseGrowthFpFix: number[]; // 2027-2030 (4 items)
  baseGrowthSalisbury: number[];
  baseGrowthRocmont: number[];
  baseGrowthKnighthawk: number[];

  // Downside levers
  downsideMarginCutPts: number;
  downsideRevenueHaircut: number;
  downsideGrowth: number[]; // 2027-2030

  // Mgmt Knighthawk growth
  mgmtKnighthawkGrowth: number[];

  // QoE levers
  diligenceHaircutAddbacks: number;
  includeSalisburyBadDebtAddback: boolean;
  salisburyBadDebtAmount: number;
  contractLiabilitiesDebtLikePct: number;
  arOver90ReservePct: number;

  // 13-Week Cash levers
  arOver90CollectionPct13W: number;
  collectionLagWeeksRocmont: number;
  collectionLagWeeksSalisbury: number;
  collectionLagWeeksFp: number;
  fpOpeningCash: number;
  salisburyOpeningCash: number;
  rocmontOpeningCash: number;

  // Price Optimizer levers
  targetEvRunRateEbitda: number;
  deferredDiscountRate: number;
  altCUpfrontCashPct: number;
  altCEarnoutProb: number;
  altCEarnoutYear: number;

  // Monte Carlo levers
  monteCarloTrialsCount: number;
  monteCarloSeed: number;
  revenueShockMean: number;
  revenueShockSd: number;
  marginShockSd: number;
  exitMultipleMean: number;
  exitMultipleSd: number;
  exitMultipleFloor: number;

  // Tax levers
  buyerTaxRate: number;
  taxShieldDiscountRate: number;
  sec197AmortYears: number;
  sellerLtcgNiitRate: number;
  sellerOrdinaryRate: number;
  sellerStateTaxRate: number;
  sellerTaxBasisPct: number;

  // Three Statement levers
  openingPpe: number;
}

export interface InputMetadata {
  key: keyof Assumptions | string;
  label: string;
  unit: '$' | '%' | 'x' | 'years' | 'weeks' | 'trials' | 'boolean' | 'enum';
  category: 'general' | 'financing' | 'loi' | 'operating' | 'qoe' | 'cash13w' | 'price' | 'risk' | 'tax';
  min?: number;
  max?: number;
  step?: number;
  sourceNote: string;
  isAssumption: boolean;
}

// Result sub-structures
export interface SourcesAndUsesResult {
  uses: {
    rocmontEv: number;
    salisburyEv: number;
    knighthawkEv: number;
    closingFees: number;
    refinanceFpLegacyDebt: number;
    buySalisburyRe: number;
    totalUses: number;
  };
  sources: {
    seniorTermLoan: number;
    sellerNotes: number;
    sellerRolloverEquity: number;
    platformCash: number;
    sponsorCashEquity: number;
    totalSources: number;
    check: number;
  };
  entryMultiples: {
    rocmontEv2025Ebitda: number;
    rocmontEv2026RunRateEbitda: number;
    rocmontEv2026MgmtPlanEbitda: number;
    rocmontEv2026RunRateRevenue: number;

    salisburyEv2025Ebitda: number;
    salisburyEv2026RunRateEbitda: number;
    salisburyEv2026MgmtPlanEbitda: number;
    salisburyEv2026RunRateRevenue: number;

    knighthawkEv2025Ebitda: number;
    knighthawkEv2026RunRateEbitda: number;
    knighthawkEv2026RunRateRevenue: number;

    totalEv2026RunRateEbitda: number;
    totalDebtAtClose2026RunRateEbitda: number;
  };
  realEstateCollateral: {
    rocmontAppraisal: number;
    rocmontBookLand: number;
    rocmontUnrecordedReValue: number;
    salisburyAppraisal: number;
    lendableValue: number;
    seniorLoanPctOfLendable: number;
  };
}

export interface OperatingYearData {
  year: number;
  revFpFix: number;
  revSalisbury: number;
  revRocmont: number;
  revKnighthawk: number;
  totalRevenue: number;
  revenueGrowthPct: number;

  ebitdaFpFix: number;
  ebitdaSalisbury: number;
  ebitdaRocmont: number;
  ebitdaKnighthawk: number;
  totalEbitda: number;
  ebitdaMargin: number;

  dna: number;
  ebit: number;
  seniorInterest: number;
  sellerInterest: number;
  preTaxIncome: number;
  taxDistributions: number;
  capex: number;
  nwcInvestment: number;
  cfads: number;

  seniorOpening: number;
  seniorRepayment: number;
  seniorClosing: number;

  rocmontNoteOpening: number;
  rocmontNoteRepayment: number;
  rocmontNoteClosing: number;

  knighthawkNoteOpening: number;
  knighthawkNoteRepayment: number;
  knighthawkNoteClosing: number;

  salisburyDeferredOpening: number;
  salisburyDeferredPayment: number;
  salisburyDeferredClosing: number;

  totalDebtClosing: number;
  totalDebtService: number;
  dscr: number;
  dscrExclBalloons: number; displayedDscr: number;
  totalDebtEbitda: number;
  seniorDebtEbitda: number;
  fcfAfterDebtService: number;
  cumulativeCash: number;
}

export interface ScenarioModelResult {
  scenario: ScenarioId;
  years: OperatingYearData[]; // 2025A, 2026E, 2027E, 2028E, 2029E, 2030E
  postCloseYears: OperatingYearData[]; // 2027E-2030E
  minDscr: number; minDscrInclBalloons: number; minDscrExclBalloons: number;
  exitEbitda: number;
  exitEv: number;
  debtAtExit: number;
  accumulatedCashAtExit: number;
  exitEquityValue: number;
  sponsorRolloverAtEntry: number;
  sellerRolloverAtEntry: number;
  sponsorOwnershipPct: number;
  sponsorExitProceeds: number;
  sponsorMoicV2: number;
  sponsorIrrV2: number;
}

export interface EquityInjectionResult {
  scenario: ScenarioId;
  years: {
    year: number;
    fcfads: number;
    openingCash: number;
    cashBeforeInjection: number;
    injectionRequired: number;
    closingCash: number;
    cumulativeInjections: number;
  }[];
  totalInjections: number;
  sponsorInjectionsCalled: number;
  totalSponsorCapitalCalled: number;
  exitEquityValue: number;
  sponsorOwnershipPctAtCost: number;
  sponsorExitProceeds: number;
  sponsorMoicV3: number;
  sponsorIrrV3: number;
  cashFlowTimeline: { year: number; cashFlow: number }[];
}

export interface DebtSizingResult {
  scenario: ScenarioId;
  maxSeniorLoanAtCurrentAmort: number;
  convergedDscr: number;
  currentLoan: number;
  headroom: number;
  minDscrAtCurrentLoan: number;
  yearsBreachingLeverage: number;
  amortizationCapacities: {
    amortYears: number;
    capacityPerYear: number[];
    maxLoan: number;
  }[];
  ebitdaCushionBeforeDscrBreachPct: number[];
  leverageByYear: number[];
  leverageBreachedByYear: boolean[];
}

export interface QoEResult {
  rocmontBridge: {
    year: string;
    netIncome: number;
    addbacks: number;
    modelEbitda: number;
    haircut: number;
    adjustedEbitda: number;
    addbacksPct: number;
  }[];
  salisburyBridge: {
    year: string;
    netIncome: number;
    addbacks: number;
    modelEbitda: number;
    haircut: number;
    adjustedEbitda: number;
    addbacksPct: number;
  }[];
  salisburyNetCashToSeller: {
    loiCash: number;
    lessDebt: number;
    lessCreditCards: number;
    lessOverbillings: number;
    lessArReserve: number;
    netCashToSeller: number;
  };
  rocmontNetCashToSeller: {
    loiCash: number;
    lessDebt: number;
    lessCreditCards: number;
    lessOverbillings: number;
    lessArReserve: number;
    netCashToSeller: number;
    shareholderBalancesNetting: number;
  };
}

export interface CashFlow13WWeek {
  weekIndex: number;
  weekEnding: string;
  openingCash: number;
  collectionsOpeningAr: number;
  collectionsNewSales: number;
  totalReceipts: number;
  operatingDisbursements: number;
  apPaydown: number;
  debtService: number;
  netCashFlow: number;
  closingCash: number;
}

export interface CashFlow13WResult {
  rocmontWeeks: CashFlow13WWeek[];
  salisburyWeeks: CashFlow13WWeek[];
  fpFixWeeks: CashFlow13WWeek[];
  platformWeeks: {
    weekIndex: number;
    weekEnding: string;
    rocmontCash: number;
    salisburyCash: number;
    fpFixCash: number;
    totalCash: number;
  }[];
  salisburyMinCash: number;
  salisburyFirstNegativeWeek: number; // 0 if none, else 1..13
  platformMinCash: number;
}

export interface WipJob {
  division: string;
  contract: string;
  contractAmount: number;
  billedToDate: number;
  totalEstCost: number;
  costToDate: number;
  costRemaining: number;
  startDate: string;
  endDate: string;
  pctComplete: number;
  earnedRevenue: number;
  overUnderBilling: number;
  estGrossProfit: number;
  gpMargin: number;
  remainingRevenue: number;
  shareInTestedYear: number;
  revenueInTestedYear: number;
}

export interface WipResult {
  jobs: WipJob[];
  totalContractAmount: number;
  totalBilledToDate: number;
  totalCostRemaining: number;
  totalOverUnderBilling: number;
  totalRemainingRevenue: number;
  totalRevenueTestedYear: number;
  runRateRevenue: number;
  mgmtPlanRevenue: number;
  backlogRunRateCoverageShare: number;
  revenueNeededFromNewJobsRunRate: number;
  revenueNeededFromNewJobsPlan: number;
}

export interface PriceOptimizerDealResult {
  dealName: string;
  altA_Loi: {
    headlineEv: number;
    upfrontCash: number;
    rollover: number;
    deferredFace: number;
    deferredPv: number;
    expectedSellerValue: number;
    evRunRateEbitda: number;
    expectedValueRunRateEbitda: number;
    priceChangePct: number;
    closingFees: number;
  };
  altB_Reprice: {
    headlineEv: number;
    upfrontCash: number;
    rollover: number;
    deferredFace: number;
    deferredPv: number;
    expectedSellerValue: number;
    evRunRateEbitda: number;
    expectedValueRunRateEbitda: number;
    priceChangePct: number;
    closingFees: number;
  };
  altC_EarnoutHeavy: {
    headlineEv: number;
    upfrontCash: number;
    rollover: number;
    deferredFace: number;
    deferredPv: number;
    expectedSellerValue: number;
    evRunRateEbitda: number;
    expectedValueRunRateEbitda: number;
    priceChangePct: number;
    closingFees: number;
  };
}

export interface PriceOptimizerResult {
  rocmont: PriceOptimizerDealResult;
  salisbury: PriceOptimizerDealResult;
  knighthawk: PriceOptimizerDealResult;
  platformCashNeed: {
    altA: { upfrontCash: number; closingFees: number; refiLegacy: number; totalCashUses: number; sponsorCashAtLoanInputs: number; sponsorCashAtCapacity: number };
    altB: { upfrontCash: number; closingFees: number; refiLegacy: number; totalCashUses: number; sponsorCashAtLoanInputs: number; sponsorCashAtCapacity: number };
    altC: { upfrontCash: number; closingFees: number; refiLegacy: number; totalCashUses: number; sponsorCashAtLoanInputs: number; sponsorCashAtCapacity: number };
  };
}

export interface MonteCarloTrial {
  trialIndex: number;
  uRevenue: number;
  uMargin: number;
  uMultiple: number;
  revenueShock: number;
  marginShock: number;
  exitMultiple: number;
  ebitda2030: number;
  cashAtExitPreInj: number;
  followOnEquity: number;
  exitEv: number;
  exitEquity: number;
  sponsorOwnership: number;
  sponsorProceeds: number;
  moic: number;
  approxIrr: number;
}

export interface MonteCarloResult {
  meanMoic: number;
  medianMoic: number;
  p5Moic: number;
  p25Moic: number;
  p75Moic: number;
  p95Moic: number;
  probMoicLoss: number;
  probMoicSubHalf: number;
  probMoicAboveTwo: number;
  probFollowOnEquityNeeded: number;
  meanFollowOnEquityCalled: number;
  medianApproxIrr: number;
  histogram: { binLabel: string; binFrom: number; binTo: number; count: number }[];
  trials: MonteCarloTrial[];
}

export interface TaxStructureResult {
  rocmont: {
    ev: number;
    netFixedAssets: number;
    nwcAcquired: number;
    goodwillIntangibles: number;
    annualAmort: number;
    annualTaxSavings: number;
    pvTaxSavings: number;
    accumulatedDeprec: number;
    extraSellerTax: number;
    sellerGrossUp: number;
    netValueDealStepUp: number;
    netValuePctEv: number;
    sellerCashAtClose: number;
    sellerDebtRetired: number;
    sellerNetCash: number;
    sellerTaxOnCash: number;
    sellerAfterTaxCash: number;
  };
  salisbury: {
    ev: number;
    netFixedAssets: number;
    nwcAcquired: number;
    goodwillIntangibles: number;
    annualAmort: number;
    annualTaxSavings: number;
    pvTaxSavings: number;
    accumulatedDeprec: number;
    extraSellerTax: number;
    sellerGrossUp: number;
    netValueDealStepUp: number;
    netValuePctEv: number;
    sellerCashAtClose: number;
    sellerDebtRetired: number;
    sellerNetCash: number;
    sellerTaxOnCash: number;
    sellerAfterTaxCash: number;
  };
  platformTaxDistributions: {
    years: number[];
    preTaxIncome: number[];
    taxDistributions: number[];
    taxDistPctEbitda: number[];
  };
}

export interface ThreeStatementYear {
  year: number;
  // Income Statement
  revenue: number;
  ebitda: number;
  dna: number;
  ebit: number;
  seniorInterest: number;
  sellerInterest: number;
  gainOnForfeitedDeferred: number;
  netIncomePreTax: number;

  // Cash Flow Statement
  cfo: number;
  capex: number;
  seniorRepayment: number;
  sellerRepayment: number;
  deferredPaid: number;
  taxDistributions: number;
  equityInjections: number;
  cff: number;
  netChangeInCash: number;
  openingCash: number;
  closingCash: number;

  // Balance Sheet
  bsCash: number;
  bsNwc: number;
  bsNetPpe: number;
  bsGoodwill: number;
  totalAssets: number;

  bsSeniorLoan: number;
  bsRocmontNote: number;
  bsKnighthawkNote: number;
  bsSalisburyDeferred: number;
  totalDebt: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  balanceCheck: number; // Must equal 0
}

export interface SensitivityMatrix {
  exitMultiples: number[]; // 3.5 to 6.5
  ebitdaMultipliers: number[]; // 0.6 to 2.6
  impliedEbitdas: number[];
  moicGrid: number[][]; // [multipleIdx][ebitdaIdx]
  irrGrid: number[][];
  breakEvenMultiplePerRow: number[]; // per ebitda factor
}

export interface PlanVsActualItem {
  entity: string;
  metric: string;
  actual: number;
  plan: number;
  varianceDollar: number;
  variancePct: number;
  note: string;
}

export interface ConcentrationClient {
  clientName: string;
  revenue: number;
  pctOfTotal: number;
}

export interface EngineResults {
  sourcesAndUses: SourcesAndUsesResult;
  mgmtModel: ScenarioModelResult;
  baseModel: ScenarioModelResult;
  downsideModel: ScenarioModelResult;
  activeModel: ScenarioModelResult;

  mgmtEquityInjection: EquityInjectionResult;
  baseEquityInjection: EquityInjectionResult;
  downsideEquityInjection: EquityInjectionResult;
  activeEquityInjection: EquityInjectionResult;

  mgmtDebtSizing: DebtSizingResult;
  baseDebtSizing: DebtSizingResult;
  downsideDebtSizing: DebtSizingResult;
  activeDebtSizing: DebtSizingResult;

  qoe: QoEResult;
  cashFlow13W: CashFlow13WResult;
  wipRocmont: WipResult;
  priceOptimizer: PriceOptimizerResult;
  monteCarlo: MonteCarloResult;
  taxStructure: TaxStructureResult;
  threeStatement: ThreeStatementYear[];
  sensitivity: SensitivityMatrix;
  planVsActual: {
    ytdSep2026: PlanVsActualItem[];
    fullYear2026RunRateVsPlan: {
      entity: string;
      runRateRev: number;
      planRev: number;
      gapRevDollar: number;
      gapRevPct: number;
      runRateEbitda: number;
      planEbitda: number;
      gapEbitdaDollar: number;
    }[];
    rocmontConcentration: ConcentrationClient[];
    knighthawkConcentration: { client: string; sales2024: number; sales2025Ytd: number; lennarPct2024: number; lennarPct2025: number };
  };
}
