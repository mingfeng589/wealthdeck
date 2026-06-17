import { useMemo, useCallback } from 'react';
import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import { fmt, CATS } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import AllocationChart from '../track/AllocationChart';
import type { AllocationCategory } from '../track/AllocationChart';
import styles from '../../styles/improve.module.css';

interface PortfolioStatsProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
  total: number;
}

export function PortfolioStats({ rows, total }: PortfolioStatsProps) {
  const { baseCcy } = useAppState();

  const sortedRows = useMemo(
    () => [...rows].filter((r) => r.val > 0).sort((a, b) => b.val - a.val),
    [rows],
  );

  // Per-holding allocation for the doughnut chart
  const holdingAllocation = useMemo<AllocationCategory[]>(
    () =>
      sortedRows.map((r) => ({
        label: r.liveName || r.h.name,
        color: CATS[r.h.cat].color,
        value: r.val,
      })),
    [sortedRows],
  );

  const fmtValue = useCallback(
    (v: number) => fmt(v, baseCcy),
    [baseCcy],
  );

  return (
    <div className={styles.card}>
      <h3>组合统计</h3>
      {total > 0 ? (
        <>
          <div className={styles.statgrid}>
            <div className={styles.stat}>
              <div className={styles.t}>总仓位</div>
              <div className={styles.v}>{fmt(total, baseCcy)}</div>
            </div>
          </div>

          {/* Doughnut chart — per holding, colored by category */}
          {holdingAllocation.length > 0 && (
            <div className={styles.chartWrap}>
              <AllocationChart categories={holdingAllocation} fmtValue={fmtValue} />
            </div>
          )}

          <h4 className={styles.subTitle}>持仓分布</h4>
          <div className={styles.statgrid}>
            {sortedRows.map((r) => {
              const c = CATS[r.h.cat];
              const pct = total > 0 ? (r.val / total) * 100 : 0;
              return (
                <div key={r.h.id} className={styles.stat}>
                  <div className={styles.t}>
                    <span className="tag" style={{ background: c.color, marginRight: 6 }}>{c.label}</span>
                    {r.liveName || r.h.name}
                  </div>
                  <div className={styles.v}>{fmt(r.val, baseCcy)}</div>
                  <div className={styles.s}>占比 {pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.muted}>添加资产后显示统计数据。</div>
      )}
    </div>
  );
}
