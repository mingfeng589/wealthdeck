export type Currency = 'USD' | 'CNY' | 'HKD';

export type CategoryKey =
  | 'equity'
  | 'pe_equity'
  | 'pe_debt'
  | 'other';

export interface Category {
  label: string;
  color: string;
}

export type MarketCode = 'us' | 'hk' | 'cn' | 'cg';

export type AssetKind =
  | 'idx'
  | 'etf'
  | 'lev'
  | 'bond'
  | 'gold'
  | 'silver'
  | 'oil'
  | 'crypto';

export interface AssetClassification {
  g: string;
  mkt?: string;
  ccy?: Currency;
  coupon?: number;
}
