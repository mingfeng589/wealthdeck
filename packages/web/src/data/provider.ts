import type {
  Holding,
  Goal,
  Policy,
  Profile,
  Currency,
  CorrCache,
  Rankings,
  NewsCache,
  ExportData,
  SwapRecord,
} from '@wealthdeck/shared';

export interface DataProvider {
  getHoldings(): Promise<Holding[]>;
  saveHoldings(holdings: Holding[]): Promise<void>;

  getGoals(): Promise<Goal[]>;
  saveGoals(goals: Goal[]): Promise<void>;

  getPolicies(): Promise<Policy[]>;
  savePolicies(policies: Policy[]): Promise<void>;

  getProfile(): Promise<Profile>;
  saveProfile(profile: Profile): Promise<void>;

  getHistory(): Promise<Record<string, number>>;
  saveHistory(history: Record<string, number>): Promise<void>;

  getSwaps(): Promise<SwapRecord[]>;
  saveSwaps(swaps: SwapRecord[]): Promise<void>;

  getCorrCache(): Promise<CorrCache | null>;
  saveCorrCache(data: CorrCache): Promise<void>;

  getRankings(): Promise<Rankings | null>;
  saveRankings(rankings: Rankings): Promise<void>;

  getNewsCache(key: string): Promise<NewsCache | null>;
  saveNewsCache(key: string, data: NewsCache): Promise<void>;

  getBaseCurrency(): Promise<Currency>;
  setBaseCurrency(ccy: Currency): Promise<void>;

  exportAll(): Promise<ExportData>;
  importAll(data: ExportData): Promise<void>;
}
