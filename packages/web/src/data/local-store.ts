import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
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
import type { DataProvider } from './provider';

interface WealthDeckDB extends DBSchema {
  holdings: { key: 'data'; value: Holding[] };
  goals: { key: 'data'; value: Goal[] };
  policies: { key: 'data'; value: Policy[] };
  profile: { key: 'data'; value: Profile };
  history: { key: string; value: number };
  cache: { key: string; value: unknown };
  settings: { key: string; value: unknown };
  swaps: { key: 'data'; value: SwapRecord[] };
}

const DB_NAME = 'wealthdeck';
const DB_VERSION = 2;

function initDB(): Promise<IDBPDatabase<WealthDeckDB>> {
  return openDB<WealthDeckDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('holdings')) db.createObjectStore('holdings');
      if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals');
      if (!db.objectStoreNames.contains('policies')) db.createObjectStore('policies');
      if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history');
      if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache');
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('swaps')) db.createObjectStore('swaps');
    },
  });
}

export class LocalStore implements DataProvider {
  private dbPromise: Promise<IDBPDatabase<WealthDeckDB>>;

  constructor() {
    this.dbPromise = initDB();
  }

  async getHoldings(): Promise<Holding[]> {
    const db = await this.dbPromise;
    return (await db.get('holdings', 'data')) ?? [];
  }

  async saveHoldings(holdings: Holding[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put('holdings', holdings, 'data');
  }

  async getGoals(): Promise<Goal[]> {
    const db = await this.dbPromise;
    return (await db.get('goals', 'data')) ?? [];
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put('goals', goals, 'data');
  }

  async getPolicies(): Promise<Policy[]> {
    const db = await this.dbPromise;
    return (await db.get('policies', 'data')) ?? [];
  }

  async savePolicies(policies: Policy[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put('policies', policies, 'data');
  }

  async getProfile(): Promise<Profile> {
    const db = await this.dbPromise;
    return (await db.get('profile', 'data')) ?? {};
  }

  async saveProfile(profile: Profile): Promise<void> {
    const db = await this.dbPromise;
    await db.put('profile', profile, 'data');
  }

  async getHistory(): Promise<Record<string, number>> {
    const db = await this.dbPromise;
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const keys = await store.getAllKeys();
    const values = await store.getAll();
    const result: Record<string, number> = {};
    keys.forEach((k, i) => {
      result[k as string] = values[i];
    });
    return result;
  }

  async saveHistory(history: Record<string, number>): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    for (const [date, value] of Object.entries(history)) {
      await store.put(value, date);
    }
    await tx.done;
  }

  async getCorrCache(): Promise<CorrCache | null> {
    const db = await this.dbPromise;
    const data = await db.get('cache', 'correlation');
    if (!data) return null;
    const cache = data as CorrCache;
    if (Date.now() - cache.t > 24 * 3600 * 1000) return null;
    return cache;
  }

  async saveCorrCache(data: CorrCache): Promise<void> {
    const db = await this.dbPromise;
    await db.put('cache', data, 'correlation');
  }

  async getRankings(): Promise<Rankings | null> {
    const db = await this.dbPromise;
    const data = await db.get('cache', 'rankings');
    if (!data) return null;
    const rankings = data as Rankings;
    if (Date.now() - rankings.t > 24 * 3600 * 1000) return null;
    return rankings;
  }

  async saveRankings(rankings: Rankings): Promise<void> {
    const db = await this.dbPromise;
    await db.put('cache', rankings, 'rankings');
  }

  async getNewsCache(key: string): Promise<NewsCache | null> {
    const db = await this.dbPromise;
    const data = await db.get('cache', `news_${key}`);
    if (!data) return null;
    const cache = data as NewsCache;
    if (Date.now() - cache.t > 30 * 60 * 1000) return null;
    return cache;
  }

  async saveNewsCache(key: string, data: NewsCache): Promise<void> {
    const db = await this.dbPromise;
    await db.put('cache', data, `news_${key}`);
  }

  async getBaseCurrency(): Promise<Currency> {
    const db = await this.dbPromise;
    return ((await db.get('settings', 'baseCcy')) as Currency) ?? 'USD';
  }

  async setBaseCurrency(ccy: Currency): Promise<void> {
    const db = await this.dbPromise;
    await db.put('settings', ccy, 'baseCcy');
  }

  async getSwaps(): Promise<SwapRecord[]> {
    const db = await this.dbPromise;
    return (await db.get('swaps', 'data')) ?? [];
  }

  async saveSwaps(swaps: SwapRecord[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put('swaps', swaps, 'data');
  }

  async exportAll(): Promise<ExportData> {
    const [holdings, goals, policies, profile, history, swaps] = await Promise.all([
      this.getHoldings(),
      this.getGoals(),
      this.getPolicies(),
      this.getProfile(),
      this.getHistory(),
      this.getSwaps(),
    ]);
    return { holdings, goals, policies, profile, history, swaps };
  }

  async importAll(data: ExportData): Promise<void> {
    await Promise.all([
      data.holdings && this.saveHoldings(data.holdings),
      data.goals && this.saveGoals(data.goals),
      data.policies && this.savePolicies(data.policies),
      data.profile && this.saveProfile(data.profile),
      data.history && this.saveHistory(data.history),
      data.swaps && this.saveSwaps(data.swaps),
    ]);
  }
}
