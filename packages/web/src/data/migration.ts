import type { Holding, Goal, Policy, Profile, Currency } from '@wealthdeck/shared';
import type { DataProvider } from './provider';

const LS = {
  H: 'wd_holdings',
  HIST: 'wd_history',
  CCY: 'wd_baseccy',
  G: 'wd_goals',
  CORR: 'wd_corr',
  RANKS: 'wd_ranks',
  POL: 'wd_policies',
  PF: 'wd_profile',
  MIGRATED: 'wd_migrated_idb',
};

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function migrateFromLocalStorage(store: DataProvider): Promise<void> {
  if (localStorage.getItem(LS.MIGRATED)) return;
  if (!localStorage.getItem(LS.H) && !localStorage.getItem(LS.G)) return;

  const holdings = safeParse<Holding[]>(LS.H, []).map((h) => ({
    ...h,
    account: h.account || 'main',
  })) as Holding[];
  const goals = safeParse<Goal[]>(LS.G, []);
  const policies = safeParse<Policy[]>(LS.POL, []);
  const profile = safeParse<Profile>(LS.PF, {});
  const history = safeParse<Record<string, number>>(LS.HIST, {});
  const baseCcy = (localStorage.getItem(LS.CCY) as Currency) || 'USD';

  await store.saveHoldings(holdings);
  await store.saveGoals(goals);
  await store.savePolicies(policies);
  await store.saveProfile(profile);
  await store.saveHistory(history);
  await store.setBaseCurrency(baseCcy);

  const corr = safeParse(LS.CORR, null);
  if (corr) await store.saveCorrCache(corr);

  const ranks = safeParse(LS.RANKS, null);
  if (ranks) await store.saveRankings(ranks);

  localStorage.setItem(LS.MIGRATED, '1');
}
