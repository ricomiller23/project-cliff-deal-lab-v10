import { Assumptions, DebtSizingResult, ScenarioId, ScenarioModelResult } from "./types";

export function calcDebtSizing(
  scenario: ScenarioId,
  model: ScenarioModelResult,
  a: Assumptions
): DebtSizingResult {
  const targetDscr = a.targetDscr;
  const seniorRate = a.seniorLoanRate;
  const currentLoan = a.seniorLoanAmount;
  const currentAmort = a.seniorLoanAmortYears;
  const maxCovenant = a.maxTotalDebtEbitdaCovenant;
  const countBalloons = a.countSellerBalloonsAsDebtService;
  const taxRate = a.taxDistributionRate;

  const postCloseYears = model.postCloseYears; // 4 years: 2027E..2030E

  // Core DSCR evaluation function for candidate loan L and amortization period amort
  function evalDscrForLoan(L: number, amort: number) {
    let minDscr = Infinity;
    const dscrByYear: number[] = [];

    for (let k = 0; k < postCloseYears.length; k++) {
      const yr = postCloseYears[k];
      const openingBal = k < amort ? L * (1 - k / amort) : 0;
      const principal = k < amort ? L / amort : 0;
      const interest = openingBal * seniorRate;

      const taxableIncome = Math.max(0, yr.ebit - yr.sellerInterest - interest);
      const tax = taxRate * taxableIncome;
      const cfads = yr.totalEbitda - tax - yr.capex - yr.nwcInvestment;

      const sellerBalloons = countBalloons ? (yr.rocmontNoteRepayment + yr.knighthawkNoteRepayment) : 0;
      const nonSeniorService = yr.sellerInterest + yr.salisburyDeferredPayment + sellerBalloons;
      const totalService = principal + interest + nonSeniorService;

      const dscr = totalService > 0 ? cfads / totalService : 1e12;
      dscrByYear.push(dscr);
      if (dscr < minDscr) {
        minDscr = dscr;
      }
    }
    return { minDscr, dscrByYear };
  }

  // Iterative bisection solver: max 50 iterations, tolerance $1
  function solveLoanForAmort(amort: number) {
    // If even with L = 0 the DSCR is below target, capacity is 0
    const zeroLoanDscr = evalDscrForLoan(0, amort).minDscr;
    if (zeroLoanDscr < targetDscr) {
      return { loan: 0, convergedDscr: zeroLoanDscr };
    }

    let low = 0;
    let high = 50_000_000;
    while (evalDscrForLoan(high, amort).minDscr > targetDscr && high < 1e9) {
      high *= 2;
    }

    for (let iter = 0; iter < 50; iter++) {
      const mid = (low + high) / 2;
      const evalRes = evalDscrForLoan(mid, amort);
      if (evalRes.minDscr < targetDscr) {
        high = mid; // Loan is too big (DSCR too low)
      } else {
        low = mid; // Loan can be larger (DSCR >= target)
      }
      if (high - low <= 1.0) {
        break;
      }
    }

    const finalLoan = (low + high) / 2;
    const convergedDscr = evalDscrForLoan(finalLoan, amort).minDscr;
    return { loan: finalLoan, convergedDscr };
  }

  // Also solve capacity per individual year k for each amort schedule
  // (matches the workbook Debt_Sizing sheet rows)
  function solveCapacityPerYear(amort: number) {
    const capacities: number[] = [];
    for (let k = 0; k < postCloseYears.length; k++) {
      const yr = postCloseYears[k];
      const yearFromClose = k + 1;
      if (yearFromClose > amort) {
        capacities.push(1e12); // unconstrained
        continue;
      }

      function evalYearDscr(L: number) {
        const openingBal = L * (1 - k / amort);
        const principal = L / amort;
        const interest = openingBal * seniorRate;
        const taxableIncome = Math.max(0, yr.ebit - yr.sellerInterest - interest);
        const tax = taxRate * taxableIncome;
        const cfads = yr.totalEbitda - tax - yr.capex - yr.nwcInvestment;
        const sellerBalloons = countBalloons ? (yr.rocmontNoteRepayment + yr.knighthawkNoteRepayment) : 0;
        const nonSeniorService = yr.sellerInterest + yr.salisburyDeferredPayment + sellerBalloons;
        const totalService = principal + interest + nonSeniorService;
        return totalService > 0 ? cfads / totalService : 1e12;
      }

      if (evalYearDscr(0) < targetDscr) {
        capacities.push(0);
        continue;
      }
      let low = 0;
      let high = 50_000_000;
      while (evalYearDscr(high) > targetDscr && high < 1e9) {
        high *= 2;
      }
      for (let iter = 0; iter < 50; iter++) {
        const mid = (low + high) / 2;
        if (evalYearDscr(mid) < targetDscr) {
          high = mid;
        } else {
          low = mid;
        }
        if (high - low <= 1.0) break;
      }
      capacities.push((low + high) / 2);
    }
    return capacities;
  }

  // 1. Solve for current amortization schedule (e.g. 5-year)
  const currentAmortSolve = solveLoanForAmort(currentAmort);
  const maxSeniorLoanAtCurrentAmort = currentAmortSolve.loan;
  const convergedDscr = currentAmortSolve.convergedDscr;
  const headroom = maxSeniorLoanAtCurrentAmort - currentLoan;

  // 2. Multi-schedule capacities: 3, 5, 7, 10 years
  const testAmorts = [3, 5, 7, 10];
  const amortizationCapacities = testAmorts.map((amort) => {
    const solve = solveLoanForAmort(amort);
    const capacityPerYear = solveCapacityPerYear(amort);
    return {
      amortYears: amort,
      capacityPerYear,
      maxLoan: solve.loan,
    };
  });

  // 3. EBITDA cushions and covenant compliance at current loan
  const cushions: number[] = [];
  const leverages: number[] = [];
  const breaches: boolean[] = [];

  for (let k = 0; k < postCloseYears.length; k++) {
    const yr = postCloseYears[k];
    const cfads = yr.cfads;
    const sellerBalloons = countBalloons ? (yr.rocmontNoteRepayment + yr.knighthawkNoteRepayment) : 0;
    const nonSeniorService = yr.sellerInterest + yr.salisburyDeferredPayment + sellerBalloons;
    const seniorService = yr.seniorInterest + yr.seniorRepayment;
    const totalService = seniorService + nonSeniorService;

    const cushion = cfads <= 0 ? -1 : 1 - (targetDscr * totalService) / cfads;
    cushions.push(cushion);

    const lev = yr.totalDebtEbitda;
    leverages.push(lev);
    breaches.push(lev > maxCovenant);
  }

  const minDscrAtCurrentLoan = model.minDscr;
  const yearsBreachingLeverage = breaches.filter(Boolean).length;

  return {
    scenario,
    maxSeniorLoanAtCurrentAmort,
    convergedDscr,
    currentLoan,
    headroom,
    minDscrAtCurrentLoan,
    yearsBreachingLeverage,
    amortizationCapacities,
    ebitdaCushionBeforeDscrBreachPct: cushions,
    leverageByYear: leverages,
    leverageBreachedByYear: breaches,
  };
}
