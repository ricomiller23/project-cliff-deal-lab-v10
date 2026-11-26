export function formatCurrency(
  val: number | null | undefined,
  compact = false,
  decimals = 0
): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (!isFinite(val)) return 'n/m';

  const isNeg = val < -0.0001;
  const abs = Math.abs(val);

  let formatted = '';

  if (compact) {
    if (abs >= 1e6) {
      formatted = `$${(abs / 1e6).toFixed(1)}M`;
    } else if (abs >= 1e3) {
      formatted = `$${(abs / 1e3).toFixed(0)}K`;
    } else {
      formatted = `$${abs.toFixed(0)}`;
    }
  } else {
    formatted = `$${abs.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  return isNeg ? `(${formatted})` : formatted;
}

export function formatMultiple(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (!isFinite(val) || val < 0) return 'n/m';
  return `${val.toFixed(decimals)}x`;
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (!isFinite(val)) return 'n/m';
  const isNeg = val < -0.00001;
  const abs = Math.abs(val * 100);
  const formatted = `${abs.toFixed(decimals)}%`;
  return isNeg ? `(${formatted})` : formatted;
}

export function formatNumber(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (!isFinite(val)) return 'n/m';
  const isNeg = val < -0.0001;
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return isNeg ? `(${formatted})` : formatted;
}
