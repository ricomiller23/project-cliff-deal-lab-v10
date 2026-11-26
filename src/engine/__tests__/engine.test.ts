import { describe, it, expect } from 'vitest';
import { calcAll } from '../calcAll';
import { DEFAULT_ASSUMPTIONS } from '../defaults';

describe('Project Cliff Deal Lab - Calculation Engine Acceptance Tests', () => {
  const results = calcAll(DEFAULT_ASSUMPTIONS);

  it('Test 1: Sources & Uses and Sponsor Equity Plug', () => {
    const su = results.sourcesAndUses;
    expect(su.uses.totalUses).toBeCloseTo(11248426, 0);
    expect(su.sources.sponsorCashEquity).toBeCloseTo(1690926, 0);
    expect(su.sources.check).toBeCloseTo(0, 4);
    expect(su.sources.totalSources).toBeCloseTo(su.uses.totalUses, 0);
  });

  it('Test 2: Entry Multiples on 2025A and 2026 Run-Rate EBITDA', () => {
    const m = results.sourcesAndUses.entryMultiples;
    // Rocmont 2025A: 3.19x (3.1903x)
    expect(m.rocmontEv2025Ebitda).toBeCloseTo(3.1903, 3);
    // Salisbury 2025A: 4.68x (4.6810x)
    expect(m.salisburyEv2025Ebitda).toBeCloseTo(4.6810, 3);

    // Rocmont run-rate: 4.69x (4.6894x)
    expect(m.rocmontEv2026RunRateEbitda).toBeCloseTo(4.6894, 3);
    // Salisbury run-rate: 10.95x (10.9464x)
    expect(m.salisburyEv2026RunRateEbitda).toBeCloseTo(10.9464, 3);
  });

  it('Test 3: Management Plan DSCR and Returns', () => {
    const mgmt = results.mgmtModel;
    // Min DSCR: 1.22x (1.2184x)
    expect(mgmt.minDscr).toBeCloseTo(1.2184, 3);
    // V2 MOIC: 6.9x (6.8956x)
    expect(mgmt.sponsorMoicV2).toBeCloseTo(6.8956, 3);
  });

  it('Test 4: Base Case Follow-on Equity, Injected MOIC/IRR, and Debt Capacity', () => {
    const baseInj = results.baseEquityInjection;
    const baseDebt = results.baseDebtSizing;

    // Follow-on equity needed: about $2.13M ($2,131,851.17)
    expect(baseInj.totalInjections).toBeCloseTo(2131851.17, 0);

    // MOIC with injections: about 1.30x (1.2966x)
    expect(baseInj.sponsorMoicV3).toBeCloseTo(1.2966, 3);

    // IRR with injections: about 10% (9.77% = 0.0977)
    expect(baseInj.sponsorIrrV3).toBeCloseTo(0.0977, 3);

    // Max senior loan at 5-year amortization: about $1.98M ($1,983,687.21)
    expect(baseDebt.maxSeniorLoanAtCurrentAmort).toBeCloseTo(1773876, 0);
    expect(baseDebt.convergedDscr).toBeCloseTo(1.25, 2);
  });

  it('Test 5: Downside Case MOIC with Injections', () => {
    const downInj = results.downsideEquityInjection;
    // Downside MOIC with injections: about 0.55x (0.5478x)
    expect(downInj.sponsorMoicV3).toBeCloseTo(0.5478, 3);
  });

  it('Test 6: QoE Salisbury Net Cash to Seller & Rocmont 2024 Adjusted EBITDA', () => {
    const qoe = results.qoe;
    // Salisbury net cash to seller after debt-like items: about $35K ($35,493.22)
    expect(qoe.salisburyNetCashToSeller.netCashToSeller).toBeCloseTo(35493.22, 1);

    // Rocmont 2024 EBITDA after 50% add-back haircut: about $723K ($723,157.42)
    const rocmont2024 = qoe.rocmontBridge.find(b => b.year === '2024A');
    expect(rocmont2024?.adjustedEbitda).toBeCloseTo(723157.42, 1);
  });

  it('Test 7: Three-Statement Balance Check ties to 0 across all years and scenarios', () => {
    for (const sc of ['mgmt', 'base', 'downside'] as const) {
      const stmt = results.threeStatement;
      for (const yr of stmt) {
        expect(Math.abs(yr.balanceCheck)).toBeLessThan(0.0001);
      }
    }
  });

  it('Test 8: Monte Carlo on Base Case (seed 42, 1,000 trials)', () => {
    const mc = results.monteCarlo;
    // Probability of loss: about 38% (0.383)
    expect(mc.probMoicLoss).toBeCloseTo(0.383, 2);

    // Median MOIC: about 1.24x (1.2438x)
    expect(mc.medianMoic).toBeCloseTo(1.2438, 2);

    // Probability follow-on equity needed: about 88% (0.880)
    expect(mc.probFollowOnEquityNeeded).toBeCloseTo(0.88, 2);
  });

  it('Test 9: Rocmont WIP Backlog Coverage', () => {
    const wip = results.wipRocmont;
    // Share of run-rate covered: about 36% (0.3601)
    expect(wip.backlogRunRateCoverageShare).toBeCloseTo(0.3601, 3);
    // Revenue needed from new jobs: about $2.89M ($2,885,650.64)
    expect(wip.revenueNeededFromNewJobsRunRate).toBeCloseTo(2885650.64, 0);
  });

  it('Test 10: Price Optimizer Salisbury EV at Target Multiple vs LOI', () => {
    const po = results.priceOptimizer;
    // Salisbury EV at 4.5x target multiple: $2,055,476.46
    expect(po.salisbury.altB_Reprice.headlineEv).toBeCloseTo(2055476.46, 0);
    // Sponsor cash need, LOI, loan at capacity: $4,506,738.79
    expect(po.platformCashNeed.altA.sponsorCashAtCapacity).toBeCloseTo(4716550.06, 0);
  });

  it("Test 11: Iterative Bisection Loan Sizing Acceptance (Base, Mgmt, Downside)", () => {
    // Acceptance: bisection tolerance $1, min DSCR = 1.25x (+/-0.005)
    // Run-rate Base: loan = $1,773,876
    expect(Math.abs(results.baseDebtSizing.maxSeniorLoanAtCurrentAmort - 1773876)).toBeLessThanOrEqual(1.0);
    expect(Math.abs(results.baseDebtSizing.convergedDscr - 1.25)).toBeLessThanOrEqual(0.005);

    // Mgmt plan = $4,630,610
    expect(Math.abs(results.mgmtDebtSizing.maxSeniorLoanAtCurrentAmort - 4630610)).toBeLessThanOrEqual(1.0);
    expect(Math.abs(results.mgmtDebtSizing.convergedDscr - 1.25)).toBeLessThanOrEqual(0.005);

    // Downside = $709,256
    expect(Math.abs(results.downsideDebtSizing.maxSeniorLoanAtCurrentAmort - 709256)).toBeLessThanOrEqual(1.0);
    expect(Math.abs(results.downsideDebtSizing.convergedDscr - 1.25)).toBeLessThanOrEqual(0.005);
  });
});
