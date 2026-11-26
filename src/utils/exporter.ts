import * as XLSX from 'xlsx';
import { Assumptions, EngineResults } from '../engine/types';

export function exportToJson(assumptions: Assumptions, results: EngineResults) {
  const payload = {
    app: 'Project Cliff Deal Lab',
    timestamp: new Date().toISOString(),
    assumptions,
    keyMetrics: {
      activeScenario: assumptions.activeScenario,
      sponsorMoic: results.activeEquityInjection.sponsorMoicV3,
      sponsorIrr: results.activeEquityInjection.sponsorIrrV3,
      minDscr: results.activeModel.minDscr,
      followOnEquityNeeded: results.activeEquityInjection.totalInjections,
      sponsorEquityAtEntry: results.sourcesAndUses.sources.sponsorCashEquity,
      totalDebtAtClose: results.activeModel.years[1].totalDebtClosing,
      exitEnterpriseValue: results.activeModel.exitEv,
    },
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Project_Cliff_Deal_Lab_${assumptions.activeScenario}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToXlsx(assumptions: Assumptions, results: EngineResults) {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    ['PROJECT CLIFF DEAL LAB - LIVE FINANCIAL MODEL EXPORT'],
    ['Generated At', new Date().toISOString()],
    ['Active Operating Scenario', assumptions.activeScenario.toUpperCase()],
    [''],
    ['KEY PERFORMANCE INDICATORS', 'VALUE'],
    ['Sponsor MOIC (V3 Injected)', results.activeEquityInjection.sponsorMoicV3],
    ['Sponsor IRR (V3 Injected)', results.activeEquityInjection.sponsorIrrV3],
    ['Sponsor Cash Equity at Close ($)', results.sourcesAndUses.sources.sponsorCashEquity],
    ['Follow-on Equity Injections Needed ($)', results.activeEquityInjection.totalInjections],
    ['Total Sponsor Capital Called ($)', results.activeEquityInjection.totalSponsorCapitalCalled],
    ['Minimum Senior DSCR', results.activeModel.minDscr],
    ['Total Uses at Close ($)', results.sourcesAndUses.uses.totalUses],
    ['Senior Term Loan at Close ($)', results.sourcesAndUses.sources.seniorTermLoan],
    ['Total Debt at Close ($)', results.activeModel.years[1].totalDebtClosing],
    ['2030E Exit Enterprise Value ($)', results.activeModel.exitEv],
    ['2030E Exit Equity Value ($)', results.activeEquityInjection.exitEquityValue],
    ['Sponsor Exit Proceeds ($)', results.activeEquityInjection.sponsorExitProceeds],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary_KPIs');

  // 2. Sources and Uses
  const su = results.sourcesAndUses;
  const suData = [
    ['SOURCES & USES AT CLOSE', 'AMOUNT ($)', '% OF TOTAL'],
    ['Rocmont Enterprise Value', su.uses.rocmontEv, su.uses.rocmontEv / su.uses.totalUses],
    ['Salisbury Enterprise Value', su.uses.salisburyEv, su.uses.salisburyEv / su.uses.totalUses],
    ['Knighthawk Enterprise Value', su.uses.knighthawkEv, su.uses.knighthawkEv / su.uses.totalUses],
    ['Closing & Financing Fees', su.uses.closingFees, su.uses.closingFees / su.uses.totalUses],
    ['Refinance FP/FIX Legacy Debt', su.uses.refinanceFpLegacyDebt, su.uses.refinanceFpLegacyDebt / su.uses.totalUses],
    ['Buy 50% Salisbury Real Estate', su.uses.buySalisburyRe, su.uses.buySalisburyRe / su.uses.totalUses],
    ['TOTAL USES', su.uses.totalUses, 1.0],
    [''],
    ['SOURCES', 'AMOUNT ($)', '% OF TOTAL'],
    ['Senior Term Loan', su.sources.seniorTermLoan, su.sources.seniorTermLoan / su.sources.totalSources],
    ['Seller Notes / Deferred', su.sources.sellerNotes, su.sources.sellerNotes / su.sources.totalSources],
    ['Seller Rollover Equity', su.sources.sellerRolloverEquity, su.sources.sellerRolloverEquity / su.sources.totalSources],
    ['Platform Cash Contributed', su.sources.platformCash, su.sources.platformCash / su.sources.totalSources],
    ['Sponsor Cash Equity (Plug)', su.sources.sponsorCashEquity, su.sources.sponsorCashEquity / su.sources.totalSources],
    ['TOTAL SOURCES', su.sources.totalSources, 1.0],
    ['CHECK (Sources - Uses)', su.sources.check, 0],
  ];
  const wsSu = XLSX.utils.aoa_to_sheet(suData);
  XLSX.utils.book_append_sheet(wb, wsSu, 'Sources_and_Uses');

  // 3. Operating Model
  const modelYears = results.activeModel.years;
  const modelHeader = ['Metric', ...modelYears.map(y => y.year.toString())];
  const modelData = [
    modelHeader,
    ['Revenue: Flood Pros + FIX', ...modelYears.map(y => y.revFpFix)],
    ['Revenue: Salisbury Plumbing', ...modelYears.map(y => y.revSalisbury)],
    ['Revenue: Rocmont Industrial', ...modelYears.map(y => y.revRocmont)],
    ['Revenue: Knighthawk', ...modelYears.map(y => y.revKnighthawk)],
    ['Total Platform Revenue', ...modelYears.map(y => y.totalRevenue)],
    ['Revenue Growth %', ...modelYears.map(y => y.revenueGrowthPct)],
    [''],
    ['EBITDA: Flood Pros + FIX', ...modelYears.map(y => y.ebitdaFpFix)],
    ['EBITDA: Salisbury Plumbing', ...modelYears.map(y => y.ebitdaSalisbury)],
    ['EBITDA: Rocmont Industrial', ...modelYears.map(y => y.ebitdaRocmont)],
    ['EBITDA: Knighthawk', ...modelYears.map(y => y.ebitdaKnighthawk)],
    ['Total Platform EBITDA', ...modelYears.map(y => y.totalEbitda)],
    ['EBITDA Margin %', ...modelYears.map(y => y.ebitdaMargin)],
    [''],
    ['Depreciation & Amortization', ...modelYears.map(y => y.dna)],
    ['EBIT', ...modelYears.map(y => y.ebit)],
    ['Senior Term Loan Interest', ...modelYears.map(y => y.seniorInterest)],
    ['Seller Note Interest', ...modelYears.map(y => y.sellerInterest)],
    ['Pre-Tax Income', ...modelYears.map(y => y.preTaxIncome)],
    ['Tax Distributions', ...modelYears.map(y => y.taxDistributions)],
    ['CapEx', ...modelYears.map(y => y.capex)],
    ['Working Capital Investment', ...modelYears.map(y => y.nwcInvestment)],
    ['CFADS (Cash Flow Available for Debt Service)', ...modelYears.map(y => y.cfads)],
    ['Total Debt Service', ...modelYears.map(y => y.totalDebtService)],
    ['DSCR', ...modelYears.map(y => y.dscr)],
    ['Total Debt / EBITDA', ...modelYears.map(y => y.totalDebtEbitda)],
    ['Free Cash Flow After Debt Service', ...modelYears.map(y => y.fcfAfterDebtService)],
    ['Cumulative Cash', ...modelYears.map(y => y.cumulativeCash)],
  ];
  const wsModel = XLSX.utils.aoa_to_sheet(modelData);
  XLSX.utils.book_append_sheet(wb, wsModel, 'Operating_Model');

  // 4. Three Statement
  const stmt = results.threeStatement;
  const stmtHeader = ['Line Item', ...stmt.map(s => s.year.toString())];
  const stmtData = [
    stmtHeader,
    ['[INCOME STATEMENT]'],
    ['Revenue', ...stmt.map(s => s.revenue)],
    ['EBITDA', ...stmt.map(s => s.ebitda)],
    ['D&A', ...stmt.map(s => s.dna)],
    ['Senior Interest', ...stmt.map(s => s.seniorInterest)],
    ['Seller Interest', ...stmt.map(s => s.sellerInterest)],
    ['Pre-Tax Net Income', ...stmt.map(s => s.netIncomePreTax)],
    [''],
    ['[CASH FLOW STATEMENT]'],
    ['Cash Flow from Operations', ...stmt.map(s => s.cfo)],
    ['Capital Expenditures', ...stmt.map(s => -s.capex)],
    ['Senior Loan Repayments', ...stmt.map(s => -s.seniorRepayment)],
    ['Seller Notes Repayments', ...stmt.map(s => -s.sellerRepayment)],
    ['Deferred Consideration Paid', ...stmt.map(s => -s.deferredPaid)],
    ['Tax Distributions', ...stmt.map(s => -s.taxDistributions)],
    ['Equity Injections', ...stmt.map(s => s.equityInjections)],
    ['Net Change in Cash', ...stmt.map(s => s.netChangeInCash)],
    ['Closing Cash', ...stmt.map(s => s.closingCash)],
    [''],
    ['[BALANCE SHEET]'],
    ['Cash', ...stmt.map(s => s.bsCash)],
    ['Net Working Capital', ...stmt.map(s => s.bsNwc)],
    ['Net PP&E', ...stmt.map(s => s.bsNetPpe)],
    ['Goodwill & Intangibles', ...stmt.map(s => s.bsGoodwill)],
    ['TOTAL ASSETS', ...stmt.map(s => s.totalAssets)],
    ['Senior Term Loan', ...stmt.map(s => s.bsSeniorLoan)],
    ['Rocmont Seller Note', ...stmt.map(s => s.bsRocmontNote)],
    ['Knighthawk Seller Note', ...stmt.map(s => s.bsKnighthawkNote)],
    ['Salisbury Deferred Consideration', ...stmt.map(s => s.bsSalisburyDeferred)],
    ['TOTAL DEBT', ...stmt.map(s => s.totalDebt)],
    ['TOTAL EQUITY', ...stmt.map(s => s.totalEquity)],
    ['TOTAL LIABILITIES & EQUITY', ...stmt.map(s => s.totalLiabilitiesAndEquity)],
    ['BALANCE SHEET CHECK (Must be 0)', ...stmt.map(s => s.balanceCheck)],
  ];
  const wsStmt = XLSX.utils.aoa_to_sheet(stmtData);
  XLSX.utils.book_append_sheet(wb, wsStmt, 'Three_Statement');

  XLSX.writeFile(wb, `Project_Cliff_Financial_Model_${assumptions.activeScenario}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function triggerPrintPdf() {
  window.print();
}
