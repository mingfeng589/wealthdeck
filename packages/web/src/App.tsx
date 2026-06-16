import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  Holding,
  Goal,
  GoalType,
  Policy,
  Currency,
  CategoryKey,
  Rankings,
} from '@wealthdeck/shared';
import { CATS, GOAL_TYPES, valueOf, goalCash, polCVTotal, fmt } from '@wealthdeck/shared';
import { useAppState } from './data/context';
import { fetchStockQuotes, fetchCryptoQuotes } from './services/quotes';
import { refreshRankLists } from './services/rankings';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import FooterNote from './components/layout/FooterNote';
import { TrackTab } from './components/track';
import { PlanTab } from './components/plan/PlanTab';
import { ImproveTab } from './components/improve/ImproveTab';
import { MoreTab } from './components/more/MoreTab';
import { HoldingModal, GoalModal, PolicyModal } from './components/modals';
import appStyles from './styles/app.module.css';

type TabKey = 'track' | 'plan' | 'improve' | 'more';

export default function App() {
  const state = useAppState();
  const {
    holdings, goals, policies, baseCcy, fx, quotes, history,
    setHoldings, setGoals, setPolicies, setQuotes, setFx, setHistory,
    ready, store,
  } = state;

  const [activeTab, setActiveTab] = useState<TabKey>('track');
  const [lastUpdated, setLastUpdated] = useState('未更新');
  const [rankings, setRankings] = useState<Rankings | null>(null);

  // Modal state
  const [holdingModalOpen, setHoldingModalOpen] = useState(false);
  const [editHolding, setEditHolding] = useState<Holding | null>(null);
  const [holdingDefaultCat, setHoldingDefaultCat] = useState<CategoryKey | undefined>();
  const [holdingDefaultAcct, setHoldingDefaultAcct] = useState<string | undefined>();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [goalType, setGoalType] = useState<GoalType>('custom');

  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed valuations
  const rows = useMemo(() => {
    return holdings.map((h) => ({ h, ...valueOf(h, quotes, baseCcy, fx) }));
  }, [holdings, quotes, baseCcy, fx]);

  const gCash = useMemo(
    () => goals.reduce((s, g) => s + goalCash(g, baseCcy, fx), 0),
    [goals, baseCcy, fx],
  );
  const polCV = useMemo(
    () => polCVTotal(policies, baseCcy, fx),
    [policies, baseCcy, fx],
  );
  const total = useMemo(
    () => rows.reduce((s, r) => s + r.val, 0) + gCash + polCV,
    [rows, gCash, polCV],
  );
  const dayChange = useMemo(() => rows.reduce((s, r) => s + r.day, 0), [rows]);

  // Quote refresh
  const refreshQuotes = useCallback(async () => {
    const { quotes: sq, fx: newFx } = await fetchStockQuotes(holdings, fx);
    const cq = await fetchCryptoQuotes(holdings);
    const merged = new Map(sq);
    cq.forEach((v, k) => merged.set(k, v));
    setQuotes(merged);
    setFx(newFx);
    setLastUpdated('更新于 ' + new Date().toLocaleTimeString());
  }, [holdings, fx, setQuotes, setFx]);

  // Init: load rankings + fetch quotes
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const cached = await store.getRankings();
      if (cached) setRankings(cached);
      refreshRankLists().then((r) => {
        setRankings(r);
        store.saveRankings(r);
      }).catch(() => {});
      await refreshQuotes().catch(() => {});
    })();
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // 30s polling
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(refreshQuotes, 30000);
    return () => clearInterval(id);
  }, [ready, refreshQuotes]);

  // Save history on total change
  useEffect(() => {
    if (!ready || (!holdings.length && !goals.length && !policies.length)) return;
    const today = new Date().toISOString().slice(0, 10);
    const usdTotal = baseCcy === 'USD' ? total : total / (baseCcy === 'CNY' ? fx.USDCNY : fx.USDHKD);
    const newHist = { ...history, [today]: Math.round(usdTotal) };
    setHistory(newHist);
  }, [total, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sidebar categories
  const sidebarCategories = useMemo(() => {
    return Object.entries(CATS).map(([k, c]) => {
      const catRows = rows.filter((r) => r.h.cat === k);
      let sub = catRows.reduce((s, r) => s + r.val, 0);
      const items = catRows.map((r) => ({
        id: r.h.id,
        name: r.liveName || r.h.name,
        value: fmt(r.val, baseCcy),
        onClick: () => { setEditHolding(r.h); setHoldingModalOpen(true); },
      }));
      const extras: Array<{ label: string; value: string; onClick: () => void }> = [];
      if (k === 'cash' && gCash > 0) {
        sub += gCash;
        goals.filter((g) => goalCash(g, baseCcy, fx) !== 0).forEach((g) => {
          extras.push({
            label: `${GOAL_TYPES[g.type].icon} ${g.name}·现金`,
            value: fmt(goalCash(g, baseCcy, fx), baseCcy),
            onClick: () => setActiveTab('plan'),
          });
        });
      }
      if (k === 'other' && polCV > 0) {
        sub += polCV;
        extras.push({
          label: '🛡️ 保单现金价值',
          value: fmt(polCV, baseCcy),
          onClick: () => setActiveTab('more'),
        });
      }
      return {
        key: k,
        label: c.label,
        color: c.color,
        items,
        extras,
        subtotal: items.length || extras.length ? fmt(sub, baseCcy) : '',
        onAdd: () => {
          setEditHolding(null);
          setHoldingDefaultCat(k as CategoryKey);
          setHoldingDefaultAcct(undefined);
          setHoldingModalOpen(true);
        },
      };
    });
  }, [rows, baseCcy, gCash, polCV, goals, fx]);

  // Handlers
  const handleSaveHolding = (h: Holding) => {
    if (editHolding) {
      setHoldings(holdings.map((x) => (x.id === editHolding.id ? h : x)));
    } else {
      setHoldings([...holdings, h]);
    }
    setHoldingModalOpen(false);
    refreshQuotes();
  };

  const handleDeleteHolding = (id: string) => {
    if (confirm('删除该资产？')) {
      setHoldings(holdings.filter((x) => x.id !== id));
    }
  };

  const handleSaveGoal = (g: Goal) => {
    if (editGoal) {
      setGoals(goals.map((x) => (x.id === editGoal.id ? g : x)));
    } else {
      setGoals([...goals, g]);
    }
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (!confirm('删除目标？其名下资产将归入主组合。')) return;
    const updated = holdings.map((h) => (h.account === id ? { ...h, account: 'main' } : h));
    setHoldings(updated);
    setGoals(goals.filter((x) => x.id !== id));
    setGoalModalOpen(false);
  };

  const handleSavePolicy = (p: Policy) => {
    if (editPolicy) {
      setPolicies(policies.map((x) => (x.id === editPolicy.id ? p : x)));
    } else {
      setPolicies([...policies, p]);
    }
    setPolicyModalOpen(false);
  };

  const handleExport = async () => {
    const data = await store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wealthdeck-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = () => fileInputRef.current?.click();

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await store.importAll(data);
      const [h, g, p, pf, hist] = await Promise.all([
        store.getHoldings(), store.getGoals(), store.getPolicies(),
        store.getProfile(), store.getHistory(),
      ]);
      setHoldings(h);
      setGoals(g);
      setPolicies(p);
      state.setProfile(pf);
      setHistory(hist);
      refreshQuotes();
    } catch {
      alert('文件格式错误');
    }
    e.target.value = '';
  };

  const handleRefresh = () => {
    refreshQuotes();
  };

  if (!ready) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7686' }}>加载中…</div>;
  }

  return (
    <div className={appStyles.layout}>
      <Sidebar
        netWorth={fmt(total, baseCcy)}
        dayChange={(dayChange >= 0 ? '▲ +' : '▼ ') + fmt(dayChange, baseCcy) + ' 今日'}
        dayPositive={dayChange >= 0}
        categories={sidebarCategories}
      />

      <main className={appStyles.main}>
        <TopNav
          activeTab={activeTab}
          onTabChange={(t: string) => setActiveTab(t as TabKey)}
          lastUpdated={lastUpdated}
          baseCcy={baseCcy}
          onCcyChange={(c: string) => state.setBaseCcy(c as Currency)}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onImport={handleImport}
          onAdd={() => { setEditHolding(null); setHoldingDefaultCat(undefined); setHoldingModalOpen(true); }}
        />

        {activeTab === 'track' && (
          <TrackTab
            onEditHolding={(id: string) => {
              setEditHolding(holdings.find((h) => h.id === id) ?? null);
              setHoldingModalOpen(true);
            }}
            onDeleteHolding={handleDeleteHolding}
          />
        )}
        {activeTab === 'plan' && (
          <PlanTab
            onNewGoal={(type) => { setGoalType(type); setEditGoal(null); setGoalModalOpen(true); }}
            onEditGoal={(g) => { setGoalType(g.type); setEditGoal(g); setGoalModalOpen(true); }}
            onAddHolding={(goalId) => {
              setEditHolding(null);
              setHoldingDefaultCat('securities');
              setHoldingDefaultAcct(goalId);
              setHoldingModalOpen(true);
            }}
            onEditHolding={(id: string) => {
              setEditHolding(holdings.find((h) => h.id === id) ?? null);
              setHoldingModalOpen(true);
            }}
          />
        )}
        {activeTab === 'improve' && <ImproveTab rows={rows} total={total} />}
        {activeTab === 'more' && (
          <MoreTab
            onAddPolicy={() => { setEditPolicy(null); setPolicyModalOpen(true); }}
            onEditPolicy={(p) => { setEditPolicy(p); setPolicyModalOpen(true); }}
            onDeletePolicy={(id) => {
              if (confirm('删除该保单？')) {
                setPolicies(policies.filter((x) => x.id !== id));
              }
            }}
          />
        )}

        <FooterNote />
      </main>

      <HoldingModal
        show={holdingModalOpen}
        onClose={() => setHoldingModalOpen(false)}
        editHolding={editHolding}
        defaultCat={holdingDefaultCat}
        defaultAccount={holdingDefaultAcct}
        goals={goals}
        rankings={rankings}
        onSave={handleSaveHolding}
      />
      <GoalModal
        show={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        editGoal={editGoal}
        goalType={goalType}
        onSave={handleSaveGoal}
        onDelete={editGoal ? handleDeleteGoal : undefined}
      />
      <PolicyModal
        show={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        editPolicy={editPolicy}
        onSave={handleSavePolicy}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={(t: string) => setActiveTab(t as TabKey)}
      />
    </div>
  );
}
