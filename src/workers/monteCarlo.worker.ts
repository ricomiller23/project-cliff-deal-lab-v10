import { Assumptions, MonteCarloResult } from '../engine/types';
import { runMonteCarlo } from '../engine/monteCarlo';

self.onmessage = (e: MessageEvent<{ assumptions: Assumptions }>) => {
  try {
    const { assumptions } = e.data;
    const result: MonteCarloResult = runMonteCarlo(assumptions);
    self.postMessage({ type: 'SUCCESS', result });
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', error: err.message || 'Worker computation error' });
  }
};
