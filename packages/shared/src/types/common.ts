export type Currency = 'USD' | 'CNY' | 'HKD';

export type CategoryKey =
  | 'securities'
  | 'bond'
  | 'commodity'
  | 'realestate'
  | 'pe_equity'
  | 'pe_debt'
  | 'cash'
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
