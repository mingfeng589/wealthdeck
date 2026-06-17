import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  Holding,
  Goal,
  Policy,
  Profile,
  Currency,
  Quote,
  FxRates,
  CorrCache,
  SwapRecord,
} from '@wealthdeck/shared';
import type { DataProvider } from './provider';
import { LocalStore } from './local-store';
import { migrateFromLocalStorage } from './migration';

export interface AppState {
  holdings: Holding[];
  goals: Goal[];
  policies: Policy[];
  profile: Profile;
  baseCcy: Currency;
  history: Record<string, number>;
  quotes: Map<string, Quote>;
  fx: FxRates;
  corrCache: CorrCache | null;
  swaps: SwapRecord[];
  ready: boolean;

  setHoldings: (h: Holding[]) => void;
  setGoals: (g: Goal[]) => void;
  setPolicies: (p: Policy[]) => void;
  setProfile: (p: Profile) => void;
  setBaseCcy: (c: Currency) => void;
  setHistory: (h: Record<string, number>) => void;
  setQuotes: (q: Map<string, Quote>) => void;
  setFx: (f: FxRates) => void;
  setCorrCache: (c: CorrCache | null) => void;
  setSwaps: (s: SwapRecord[]) => void;
  store: DataProvider;
}

const DataContext = createContext<AppState | null>(null);

export function DataProviderRoot({ children }: { children: ReactNode }) {
  const [store] = useState(() => new LocalStore());
  const [ready, setReady] = useState(false);
  const [holdings, setHoldingsState] = useState<Holding[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [policies, setPoliciesState] = useState<Policy[]>([]);
  const [profile, setProfileState] = useState<Profile>({});
  const [baseCcy, setBaseCcyState] = useState<Currency>('USD');
  const [history, setHistoryState] = useState<Record<string, number>>({});
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());
  const [fx, setFx] = useState<FxRates>({ USDCNY: 7.05, USDHKD: 7.80 });
  const [corrCache, setCorrCache] = useState<CorrCache | null>(null);
  const [swaps, setSwapsState] = useState<SwapRecord[]>([]);

  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage(store);
      const [h, g, p, pf, hist, ccy, corr, sw] = await Promise.all([
        store.getHoldings(),
        store.getGoals(),
        store.getPolicies(),
        store.getProfile(),
        store.getHistory(),
        store.getBaseCurrency(),
        store.getCorrCache(),
        store.getSwaps(),
      ]);
      setHoldingsState(h);
      setGoalsState(g);
      setPoliciesState(p);
      setProfileState(pf);
      setHistoryState(hist);
      setBaseCcyState(ccy);
      setCorrCache(corr);
      setSwapsState(sw);
      setReady(true);
    })();
  }, [store]);

  const setHoldings = (h: Holding[]) => {
    setHoldingsState(h);
    store.saveHoldings(h);
  };
  const setGoals = (g: Goal[]) => {
    setGoalsState(g);
    store.saveGoals(g);
  };
  const setPolicies = (p: Policy[]) => {
    setPoliciesState(p);
    store.savePolicies(p);
  };
  const setProfile = (p: Profile) => {
    setProfileState(p);
    store.saveProfile(p);
  };
  const setBaseCcy = (c: Currency) => {
    setBaseCcyState(c);
    store.setBaseCurrency(c);
  };
  const setHistory = (h: Record<string, number>) => {
    setHistoryState(h);
    store.saveHistory(h);
  };
  const setSwaps = (s: SwapRecord[]) => {
    setSwapsState(s);
    store.saveSwaps(s);
  };

  const value: AppState = {
    holdings,
    goals,
    policies,
    profile,
    baseCcy,
    history,
    quotes,
    fx,
    corrCache,
    swaps,
    ready,
    setHoldings,
    setGoals,
    setPolicies,
    setProfile,
    setBaseCcy,
    setHistory,
    setQuotes,
    setFx,
    setCorrCache,
    setSwaps,
    store,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppState must be used within DataProviderRoot');
  return ctx;
}
