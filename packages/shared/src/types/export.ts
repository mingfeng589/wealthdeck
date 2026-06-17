import type { Goal } from './goal';
import type { Holding, SwapRecord } from './holding';
import type { Policy } from './policy';
import type { Profile } from './profile';

/** Shape of the JSON backup file (export / import). */
export interface ExportData {
  holdings: Holding[];
  goals: Goal[];
  policies: Policy[];
  profile: Profile;
  /** Net-worth history keyed by ISO date string (e.g. "2025-06-15"). */
  history: Record<string, number>;
  swaps?: SwapRecord[];
}
