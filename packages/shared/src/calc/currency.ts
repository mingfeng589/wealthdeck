import type { Currency, FxRates } from '../types';

/** Convert a value in currency `c` to USD. */
export function toUSD(v: number, c: Currency, fx: FxRates): number {
  if (c === 'USD') return v;
  if (c === 'CNY') return v / fx.USDCNY;
  if (c === 'HKD') return v / fx.USDHKD;
  return v;
}

/** Convert a value in USD to currency `c`. */
export function fromUSD(v: number, c: Currency, fx: FxRates): number {
  if (c === 'USD') return v;
  if (c === 'CNY') return v * fx.USDCNY;
  if (c === 'HKD') return v * fx.USDHKD;
  return v;
}

/** Convert a value from currency `c` to the base currency. */
export function inBase(
  v: number,
  c: Currency,
  baseCcy: Currency,
  fx: FxRates,
): number {
  return fromUSD(toUSD(v, c, fx), baseCcy, fx);
}
