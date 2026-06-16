import { useMemo } from 'react';
import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import { computePortfolioScore } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import styles from '../../styles/improve.module.css';

interface PortfolioScoreProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
  total: number;
}

export function PortfolioScore({ rows, total }: PortfolioScoreProps) {
  const { corrCache } = useAppState();

  const result = useMemo(() => {
    if (total <= 0) return null;

    const cash = rows.filter((r) => r.h.cat === 'cash').reduce((s, r) => s + r.val, 0);
    const catSet = new Set(rows.filter((r) => r.val > 0).map((r) => r.h.cat));
    const scoringRows = rows.map((r) => ({
      h: r.h,
      val: r.val,
      liveName: r.liveName,
    }));

    return computePortfolioScore({ total, cash, rows: scoringRows, catSet, corrCache });
  }, [rows, total, corrCache]);

  if (!result) {
    return (
      <div className={styles.card}>
        <h3>组合体检 Portfolio Score</h3>
        <div className={styles.muted}>添加资产后显示评分。</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3>组合体检 Portfolio Score</h3>
      <div className={styles.scoreWrap}>
        <div>
          <div className={styles.scoreNum}>{result.score}</div>
          <div className={styles.muted}>{result.grade}</div>
        </div>
        <div className={styles.subscores}>
          {result.subscores.map((s, i) => (
            <div key={i} className={styles.subscore}>
              <div className={styles.v}>{s.value}</div>
              <div className={styles.t}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <ul className={styles.actions}>
        {result.actions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
