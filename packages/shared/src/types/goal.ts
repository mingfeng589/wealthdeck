import type { Currency } from './common';

export type GoalType = 'edu' | 'retire' | 'home' | 'custom';

export interface LedgerEntry {
  date: string;
  from: string;
  amt: number;
  ccy: Currency;
  note: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  target: number;
  year: number;
  ret: number;
  monthly: number;
  ledger: LedgerEntry[];
  /** Retirement-specific: current age. */
  ageNow?: number;
  /** Retirement-specific: retirement age. */
  ageRet?: number;
  /** Retirement-specific: monthly spend. */
  spend?: number;
  /** Retirement-specific: monthly pension income. */
  pension?: number;
}

export interface GoalTypeConfig {
  icon: string;
  label: string;
  ledgerFrom: string;
  defName: string;
}

export interface GoalProjection {
  pts: Array<{ x: number; y: number }>;
  end: number;
  horizon: string;
}
