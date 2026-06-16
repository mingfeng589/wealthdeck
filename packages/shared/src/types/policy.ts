import type { Currency } from './common';

export type PolicyType = 'ci' | 'life' | 'med' | 'acc' | 'ann' | 'oth';

export interface Policy {
  id: string;
  type: PolicyType;
  insured: string;
  name: string;
  company: string;
  sum: number;
  sumCcy: Currency;
  prem: number;
  premCcy: Currency;
  cv: number;
  cvCcy: Currency;
  note: string;
}
