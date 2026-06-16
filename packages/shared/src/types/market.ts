import type { AssetKind, Currency } from './common';

/** Live quote for a single symbol. */
export interface Quote {
  name: string;
  price: number;
  pct: number | null;
  change: number | null;
  ccy: Currency;
}

/** USD-based foreign-exchange rates. */
export interface FxRates {
  USDCNY: number;
  USDHKD: number;
}

/** An item in a market list (index, ETF, or ranked stock). */
export interface MarketItem {
  sym: string;
  code: string;
  name: string;
  kind?: AssetKind;
}

/** Cached top-volume stock rankings by market. */
export interface Rankings {
  us: MarketItem[];
  hk: MarketItem[];
  cn: MarketItem[];
  t: number;
}

/** A single news headline. */
export interface NewsItem {
  title: string;
  src: string;
  link: string;
  date: string;
}

/** Cached news response for a query. */
export interface NewsCache {
  t: number;
  items: NewsItem[];
}
