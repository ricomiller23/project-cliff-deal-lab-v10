/**
 * Financial Math & Statistical Utilities
 */

/**
 * Net Present Value (annual periods)
 */
export function calcNpv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

/**
 * Derivative of NPV with respect to discount rate
 */
function npvDerivative(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => (t === 0 ? acc : acc - (t * cf) / Math.pow(1 + rate, t + 1)), 0);
}

/**
 * Internal Rate of Return (IRR) using Newton-Raphson with bisection fallback
 */
export function calcIrr(cashFlows: number[], guess = 0.1): number {
  if (cashFlows.length < 2) return 0;
  
  const hasNegative = cashFlows.some(c => c < 0);
  const hasPositive = cashFlows.some(c => c > 0);
  if (!hasNegative || !hasPositive) {
    return 0;
  }

  let rate = guess;
  const maxIter = 100;
  const tol = 1e-7;

  // Newton-Raphson
  for (let i = 0; i < maxIter; i++) {
    const npv = calcNpv(rate, cashFlows);
    if (Math.abs(npv) < tol) return rate;

    const dNpv = npvDerivative(rate, cashFlows);
    if (Math.abs(dNpv) < 1e-9) break;

    const nextRate = rate - npv / dNpv;
    if (nextRate <= -0.999 || nextRate > 10.0 || isNaN(nextRate)) {
      break; // Fallback to bisection
    }
    if (Math.abs(nextRate - rate) < tol) {
      return nextRate;
    }
    rate = nextRate;
  }

  // Bisection fallback in [-0.99, 5.0]
  let low = -0.99;
  let high = 5.0;
  let npvLow = calcNpv(low, cashFlows);
  let npvHigh = calcNpv(high, cashFlows);

  if (npvLow * npvHigh > 0) {
    // If same sign, try wider range
    high = 20.0;
    npvHigh = calcNpv(high, cashFlows);
    if (npvLow * npvHigh > 0) {
      return (Math.pow(Math.abs(cashFlows[cashFlows.length - 1] / Math.abs(cashFlows[0])), 1 / (cashFlows.length - 1)) - 1);
    }
  }

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npvMid = calcNpv(mid, cashFlows);
    if (Math.abs(npvMid) < tol || (high - low) / 2 < tol) {
      return mid;
    }
    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return (low + high) / 2;
}

/**
 * Standard Normal Quantile Function (Inverse Cumulative Distribution Function, NORMSINV)
 * Uses Peter J. Acklam's algorithm (precision 1.15e-9, matches Excel NORMSINV)
 */
export function normSInv(p: number): number {
  if (p <= 0 || p >= 1) {
    if (p <= 0) return -8.0;
    return 8.0;
  }

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 */
export function createSeededRng(seed: number) {
  let s = Math.floor(seed);
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
