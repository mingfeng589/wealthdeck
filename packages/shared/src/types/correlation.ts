/** Cached correlation-matrix result for portfolio holdings. */
export interface CorrCache {
  t: number;
  names: string[];
  syms: string[];
  matrix: (number | null)[][];
  /** Pairs with correlation > 0.75: [nameA, nameB, coefficient]. */
  high: [string, string, number][];
  /** Annualised volatility (%) for each holding. */
  vols: number[];
}
