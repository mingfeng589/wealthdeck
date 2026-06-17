import React, { useMemo, useCallback } from 'react';
import { useAppState } from '../../data/context';
import type { HoldingValuation } from '@wealthdeck/shared';
import type { CategoryKey } from '@wealthdeck/shared';
import { valueOf, goalCash, polCVTotal, CATS, fmt } from '@wealthdeck/shared';
import styles from '../../styles/track.module.css';
import KPIRow from './KPIRow';
import NetWorthChart from './NetWorthChart';
import AllocationChart from './AllocationChart';
import type { AllocationCategory } from './AllocationChart';
import HoldingsTable from './HoldingsTable';
import type { HoldingsRow } from './HoldingsTable';

export interface TrackTabProps {
  onEditHolding?: (id: string) => void;
  onSwapHolding?: (id: string) => void;
}

/**
 * Main container for the Track tab.
 * Arranges KPIRow, charts grid, holdings table, and PortfolioPulse
 * in the same layout as the original (wealthdeck.html lines 165-196).
 *
 * Uses useAppState() to access holdings, goals, policies, quotes, fx, baseCcy, and history.
 * Computes all derived values (total, dayChange, cash, etc.) in useMemo.
 */
const TrackTab: React.FC<TrackTabProps> = ({
  onEditHolding,
  onSwapHolding,
}) => {
  const { holdings, goals, policies, quotes, fx, baseCcy, history } =
    useAppState();

  // Compute valuation rows for each holding
  const rows = useMemo<HoldingsRow[]>(
    () =>
      holdings.map((h) => {
        const v: HoldingValuation = valueOf(h, quotes, baseCcy, fx);
        return { h, ...v };
      }),
    [holdings, quotes, baseCcy, fx],
  );

  // Derived totals
  const { total, day, pct, sortedRows, totalCost, totalVal: holdingsVal } = useMemo(() => {
    const polCV = polCVTotal(policies, baseCcy, fx);
    const totalVal = rows.reduce((s, r) => s + r.val, 0)
      + goals.reduce((s, g) => s + goalCash(g, baseCcy, fx), 0)
      + polCV;
    const dayVal = rows.reduce((s, r) => s + r.day, 0);
    const pctVal =
      totalVal - dayVal > 0 ? (dayVal / (totalVal - dayVal)) * 100 : 0;

    const sorted = [...rows].sort((a, b) => b.val - a.val);

    const tCost = rows.reduce((s, r) => s + (r.cost ?? r.val), 0);
    const hVal = rows.reduce((s, r) => s + r.val, 0);

    return { total: totalVal, day: dayVal, pct: pctVal, sortedRows: sorted, totalCost: tCost, totalVal: hVal };
  }, [rows, goals, policies, baseCcy, fx]);

  // Allocation categories for the doughnut chart
  const allocationCategories = useMemo<AllocationCategory[]>(() => {
    const polCV = polCVTotal(policies, baseCcy, fx);
    const cats: AllocationCategory[] = [];

    for (const [k, c] of Object.entries(CATS)) {
      let v = rows.filter((r) => r.h.cat === k).reduce((s, r) => s + r.val, 0);
      if (k === 'other') v += polCV;
      if (v > 0) {
        cats.push({ label: c.label.split(' ')[0], color: c.color, value: v });
      }
    }
    return cats;
  }, [rows, goals, policies, baseCcy, fx]);

  // Category summary data
  const catSummary = useMemo(() => {
    const polCV = polCVTotal(policies, baseCcy, fx);
    const totalH = rows.reduce((s, r) => s + r.val, 0) + polCV;
    return (Object.keys(CATS) as CategoryKey[])
      .map((k) => {
        let val = rows.filter((r) => r.h.cat === k).reduce((s, r) => s + r.val, 0);
        if (k === 'other') val += polCV;
        const count = rows.filter((r) => r.h.cat === k).length;
        return {
          key: k,
          label: CATS[k].label,
          color: CATS[k].color,
          val,
          pct: totalH > 0 ? (val / totalH) * 100 : 0,
          count,
        };
      })
      .filter((c) => c.val > 0);
  }, [rows, policies, baseCcy, fx]);

  // P&L
  const pl = totalCost > 0 ? holdingsVal - totalCost : 0;
  const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;

  // Format KPI values
  const netWorthStr = fmt(total, baseCcy);
  const dayChangeStr = `${day >= 0 ? '+' : ''}${fmt(day, baseCcy)}`;
  const dayPctStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  const catCount = new Set(rows.filter((r) => r.val > 0).map((r) => r.h.cat)).size;

  const handleEdit = useCallback(
    (id: string) => onEditHolding?.(id),
    [onEditHolding],
  );

  const handleSwap = useCallback(
    (id: string) => onSwapHolding?.(id),
    [onSwapHolding],
  );

  return (
    <section>
      <KPIRow
        netWorth={netWorthStr}
        dayChange={dayChangeStr}
        dayPositive={day >= 0}
        dayPct={dayPctStr}
        holdingsCount={holdings.length}
        catCount={catCount}
        showDayChange={day !== 0}
      />

      <div className={styles.trackGrid}>
        <div className={styles.trackLeft}>
          <div className={styles.grid2}>
            <NetWorthChart history={history} baseCcy={baseCcy} fx={fx} />
            <AllocationChart categories={allocationCategories} />
          </div>

          <div className={styles.spacer} />

          {/* Category summary cards */}
          <div className={styles.catCards}>
            {catSummary.map((c) => (
              <div key={c.key} className={styles.catCard}>
                <div className={styles.catDot} style={{ background: c.color }} />
                <div className={styles.catInfo}>
                  <div className={styles.catLabel}>{c.label}</div>
                  <div className={styles.catVal}>{fmt(c.val, baseCcy)}</div>
                  <div className={styles.catSub}>{c.pct.toFixed(1)}% · {c.count} 项持仓</div>
                </div>
              </div>
            ))}
          </div>

          {/* Profit / Loss summary */}
          {totalCost > 0 && (
            <div className={styles.plCard}>
              <div className={styles.plItem}>
                <div className={styles.t}>总买入成本</div>
                <div className={styles.v}>{fmt(totalCost, baseCcy)}</div>
              </div>
              <div className={styles.plItem}>
                <div className={styles.t}>总当前估值</div>
                <div className={styles.v}>{fmt(holdingsVal, baseCcy)}</div>
              </div>
              <div className={styles.plItem}>
                <div className={styles.t}>盈亏</div>
                <div className={`${styles.v} ${pl >= 0 ? 'up' : 'down'}`}>
                  {pl >= 0 ? '+' : ''}{fmt(pl, baseCcy)}
                </div>
                <div className={`${styles.s} ${pl >= 0 ? 'up' : 'down'}`}>
                  {pl >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          <HoldingsTable
            rows={sortedRows}
            baseCcy={baseCcy}
            onEdit={handleEdit}
            onSwap={handleSwap}
            goals={goals}
          />
        </div>
      </div>
    </section>
  );
};

export default TrackTab;
