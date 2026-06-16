import type { AssetKind, CategoryKey, Currency } from './common';

/** Symbol-based holding (securities, or commodity with a tracked symbol). */
export interface SymbolHolding {
  id: string;
  cat: CategoryKey;
  account: string;
  sym: string;
  kind?: AssetKind;
  name: string;
  qty: number;
  cost: number | null;
}

/** Manually-valued holding (real estate, PE, cash, bonds, etc.). */
export interface ManualHolding {
  id: string;
  cat: CategoryKey;
  account: string;
  sym?: undefined;
  kind?: undefined;
  name: string;
  val: number;
  ccy: Currency;
  costM: number | null;
  coupon?: number | null;
}

/** A holding is either symbol-tracked or manually valued. */
export type Holding = SymbolHolding | ManualHolding;

/** Result of valueOf(h) — the computed valuation of a single holding. */
export interface HoldingValuation {
  val: number;
  day: number;
  cost: number | null;
  price: number | null;
  pct: number | null;
  ccy: Currency;
  liveName: string | null;
}
