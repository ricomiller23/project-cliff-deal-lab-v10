import { Assumptions } from './types';
import { calcAll } from './calcAll';

export type GoalTargetType = 'moic' | 'min_dscr' | 'zero_follow_on_equity';

export type GoalLeverType =
  | 'seniorLoanAmount'
  | 'exitMultiple'
  | 'salisburyEv'
  | 'salisburyRolloverPct'
  | 'rocmontRolloverPct';

export interface GoalSeekParams {
  targetType: GoalTargetType;
  targetValue: number; // e.g. 2.0 for MOIC 2.0x, 1.25 for min DSCR
  lever: GoalLeverType;
}

export interface GoalSeekResult {
  solved: boolean;
  solutionValue: number;
  finalMetricValue: number;
  steps: { value: number; metric: number }[];
  message: string;
}

export function solveGoalSeek(baseAssumptions: Assumptions, params: GoalSeekParams): GoalSeekResult {
  const { targetType, targetValue, lever } = params;

  // Define search bounds per lever
  let low = 0;
  let high = 0;

  switch (lever) {
    case 'seniorLoanAmount':
      low = 500000;
      high = 6500000;
      break;
    case 'exitMultiple':
      low = 2.0;
      high = 9.0;
      break;
    case 'salisburyEv':
      low = 1000000;
      high = 7000000;
      break;
    case 'salisburyRolloverPct':
      low = 0.05;
      high = 0.60;
      break;
    case 'rocmontRolloverPct':
      low = 0.05;
      high = 0.50;
      break;
  }

  const evaluate = (leverVal: number): { metric: number; diff: number } => {
    const cloned: Assumptions = { ...baseAssumptions };

    if (lever === 'seniorLoanAmount') {
      cloned.seniorLoanAmount = leverVal;
    } else if (lever === 'exitMultiple') {
      cloned.exitMultiple = leverVal;
    } else if (lever === 'salisburyEv') {
      cloned.salisburyLoi = { ...cloned.salisburyLoi, ev: leverVal };
    } else if (lever === 'salisburyRolloverPct') {
      cloned.salisburyLoi = { ...cloned.salisburyLoi, rolloverPct: leverVal };
    } else if (lever === 'rocmontRolloverPct') {
      cloned.rocmontLoi = { ...cloned.rocmontLoi, rolloverPct: leverVal };
    }

    const res = calcAll(cloned);
    let metric = 0;

    if (targetType === 'moic') {
      metric = res.activeEquityInjection.sponsorMoicV3;
    } else if (targetType === 'min_dscr') {
      metric = res.activeModel.minDscr;
    } else if (targetType === 'zero_follow_on_equity') {
      metric = res.activeEquityInjection.totalInjections;
    }

    const target = targetType === 'zero_follow_on_equity' ? 0 : targetValue;
    return { metric, diff: metric - target };
  };

  const steps: { value: number; metric: number }[] = [];
  const maxIter = 40;
  const tol = targetType === 'zero_follow_on_equity' ? 1000 : 0.005;

  let fLow = evaluate(low);
  let fHigh = evaluate(high);

  steps.push({ value: low, metric: fLow.metric });
  steps.push({ value: high, metric: fHigh.metric });

  if (Math.abs(fLow.diff) <= tol) {
    return { solved: true, solutionValue: low, finalMetricValue: fLow.metric, steps, message: 'Found at lower bound' };
  }
  if (Math.abs(fHigh.diff) <= tol) {
    return { solved: true, solutionValue: high, finalMetricValue: fHigh.metric, steps, message: 'Found at upper bound' };
  }

  // Determine direction
  const isIncreasing = fHigh.metric > fLow.metric;
  let left = low;
  let right = high;

  for (let i = 0; i < maxIter; i++) {
    const mid = (left + right) / 2;
    const fMid = evaluate(mid);
    steps.push({ value: mid, metric: fMid.metric });

    if (Math.abs(fMid.diff) <= tol || (right - left) / 2 < 1e-5) {
      return {
        solved: true,
        solutionValue: mid,
        finalMetricValue: fMid.metric,
        steps,
        message: `Solved in ${i + 1} iterations`,
      };
    }

    if (isIncreasing) {
      if (fMid.diff > 0) right = mid;
      else left = mid;
    } else {
      if (fMid.diff > 0) left = mid;
      else right = mid;
    }
  }

  const finalMid = (left + right) / 2;
  const fFinal = evaluate(finalMid);
  return {
    solved: Math.abs(fFinal.diff) <= tol * 5,
    solutionValue: finalMid,
    finalMetricValue: fFinal.metric,
    steps,
    message: Math.abs(fFinal.diff) <= tol * 5 ? 'Converged within acceptable tolerance' : 'Could not converge within bounds',
  };
}
