/**
 * Risk / return assumptions by asset class.
 *
 * Nested objects keyed by market (us/hk/cn) for equities and indexes;
 * flat numbers for asset-class-wide assumptions.
 * Cash returns are keyed by currency.
 */

/** Expected annual return (%) */
export const RET_A: Record<string, number | Record<string, number>> = {
  eq: { us: 6.5, hk: 7, cn: 7.5 },
  idx: { us: 6.5, hk: 7, cn: 7.5 },
  lev: 0,
  crypto: 0,
  gold: 3,
  silver: 3,
  oil: 2,
  bond: 3.5,
  re: 4,
  pe_equity: 10,
  pe_debt: 6,
  other: 0,
  cash: { USD: 4, HKD: 3.5, CNY: 1.8 },
};

/** Expected annual volatility (%) */
export const VOL_A: Record<string, number | Record<string, number>> = {
  eq: { us: 22, hk: 25, cn: 28 },
  idx: { us: 16, hk: 20, cn: 22 },
  lev: 60,
  crypto: 65,
  gold: 15,
  silver: 28,
  oil: 35,
  bond: 6,
  re: 10,
  pe_equity: 20,
  pe_debt: 8,
  other: 5,
  cash: 0.3,
};

/** Expected annual dividend yield (%) */
export const DIV_A: Record<string, number | Record<string, number>> = {
  eq: { us: 1.3, hk: 3.5, cn: 2.5 },
  idx: { us: 1.3, hk: 3.5, cn: 2.5 },
  re: 2,
};
