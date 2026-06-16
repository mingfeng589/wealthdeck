import React, { useMemo, useCallback } from 'react';
import { useAppState } from '../../data/context';
import type { HoldingValuation } from '@wealthdeck/shared';
import { valueOf, goalCash, polCVTotal, CATS, fmt } from '@wealthdeck/shared';
import styles from '../../styles/track.module.css';
import KPIRow from './KPIRow';
import NetWorthChart from './NetWorthChart';
import AllocationChart from './AllocationChart';
import type { AllocationCategory } from './AllocationChart';
import HoldingsTable from './HoldingsTable';
import type { HoldingsRow } from './HoldingsTable';
import PortfolioPulse from './PortfolioPulse';

export interface TrackTabProps {
  /** Called when the user clicks the edit button on a holding row. */
  onEditHolding?: (id: string) => void;
  /** Called when the user clicks the delete button on a holding row. */
  onDeleteHolding?: (id: string) => void;
  /** Pre-rendered daily pulse HTML. */
  dailyHtml?: string;
  /** Pre-rendered macro radar HTML. */
  macroHtml?: string;
  /** Pre-rendered general news HTML. */
  generalNewsHtml?: string;
  /** Pre-rendered personalized news HTML. */
  mineNewsHtml?: string;
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
  onDeleteHolding,
  dailyHtml = '行情加载中…',
  macroHtml = '--',
  generalNewsHtml = '<span class="muted">加载中…</span>',
  mineNewsHtml = '<span class="muted">添加持仓后自动生成。</span>',
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
  const { total, day, cash, pct, sortedRows } = useMemo(() => {
    const gCash = goals.reduce((s, g) => s + goalCash(g, baseCcy, fx), 0);
    const polCV = polCVTotal(policies, baseCcy, fx);
    const totalVal = rows.reduce((s, r) => s + r.val, 0) + gCash + polCV;
    const dayVal = rows.reduce((s, r) => s + r.day, 0);
    const cashVal =
      rows.filter((r) => r.h.cat === 'cash').reduce((s, r) => s + r.val, 0) +
      gCash;
    const pctVal =
      totalVal - dayVal > 0 ? (dayVal / (totalVal - dayVal)) * 100 : 0;

    // Sort rows by market value descending for the table
    const sorted = [...rows].sort((a, b) => b.val - a.val);

    return { total: totalVal, day: dayVal, cash: cashVal, pct: pctVal, sortedRows: sorted };
  }, [rows, goals, policies, baseCcy, fx]);

  // Allocation categories for the doughnut chart
  const allocationCategories = useMemo<AllocationCategory[]>(() => {
    const gCash = goals.reduce((s, g) => s + goalCash(g, baseCcy, fx), 0);
    const polCV = polCVTotal(policies, baseCcy, fx);
    const cats: AllocationCategory[] = [];

    for (const [k, c] of Object.entries(CATS)) {
      let v = rows.filter((r) => r.h.cat === k).reduce((s, r) => s + r.val, 0);
      if (k === 'cash') v += gCash;
      if (k === 'other') v += polCV;
      if (v > 0) {
        cats.push({ label: c.label.split(' ')[0], color: c.color, value: v });
      }
    }
    return cats;
  }, [rows, goals, policies, baseCcy, fx]);

  // Format KPI values
  const netWorthStr = fmt(total, baseCcy);
  const dayChangeStr = `${day >= 0 ? '+' : ''}${fmt(day, baseCcy)}`;
  const dayPctStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  const cashStr = fmt(cash, baseCcy);
  const cashPctStr =
    total > 0 ? `${((cash / total) * 100).toFixed(1)}% of net worth` : '';

  const handleEdit = useCallback(
    (id: string) => onEditHolding?.(id),
    [onEditHolding],
  );

  const handleDelete = useCallback(
    (id: string) => onDeleteHolding?.(id),
    [onDeleteHolding],
  );

  return (
    <section>
      <KPIRow
        netWorth={netWorthStr}
        dayChange={dayChangeStr}
        dayPositive={day >= 0}
        dayPct={dayPctStr}
        cash={cashStr}
        cashPct={cashPctStr}
        holdingsCount={holdings.length}
      />

      <div className={styles.trackGrid}>
        <div className={styles.trackLeft}>
          <div className={styles.grid2}>
            <NetWorthChart history={history} baseCcy={baseCcy} fx={fx} />
            <AllocationChart categories={allocationCategories} />
          </div>

          <div className={styles.spacer} />

          <HoldingsTable
            rows={sortedRows}
            baseCcy={baseCcy}
            onEdit={handleEdit}
            onDelete={handleDelete}
            goals={goals}
          />
        </div>

        <PortfolioPulse
          dailyHtml={dailyHtml}
          macroHtml={macroHtml}
          generalNewsHtml={generalNewsHtml}
          mineNewsHtml={mineNewsHtml}
        />
      </div>
    </section>
  );
};

export default TrackTab;
