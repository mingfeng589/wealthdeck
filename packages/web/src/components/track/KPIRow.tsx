import React from 'react';
import styles from '../../styles/track.module.css';

export interface KPIRowProps {
  netWorth: string;
  dayChange: string;
  dayPositive: boolean;
  dayPct: string;
  cash: string;
  cashPct: string;
  holdingsCount: number;
}

/**
 * 4 KPI cards: Net Worth, Day Change, Cash, Holdings count.
 * Matches wealthdeck.html lines 167-171.
 */
const KPIRow: React.FC<KPIRowProps> = ({
  netWorth,
  dayChange,
  dayPositive,
  dayPct,
  cash,
  cashPct,
  holdingsCount,
}) => (
  <div className={styles.kpis}>
    <div className={styles.kpi}>
      <div className={styles.t}>总净值 Net Worth</div>
      <div className={styles.v}>{netWorth}</div>
      <div className={`${styles.s} ${styles.muted}`}></div>
    </div>
    <div className={styles.kpi}>
      <div className={styles.t}>今日变动 Day Change</div>
      <div className={`${styles.v} ${dayPositive ? 'up' : 'down'}`}>
        {dayChange}
      </div>
      <div className={`${styles.s} ${dayPositive ? 'up' : 'down'}`}>
        {dayPct}
      </div>
    </div>
    <div className={styles.kpi}>
      <div className={styles.t}>现金 Cash</div>
      <div className={styles.v}>{cash}</div>
      <div className={`${styles.s} ${styles.muted}`}>{cashPct}</div>
    </div>
    <div className={styles.kpi}>
      <div className={styles.t}>持仓项 Holdings</div>
      <div className={styles.v}>{holdingsCount}</div>
      <div className={`${styles.s} ${styles.muted}`}>7 个资产类别</div>
    </div>
  </div>
);

export default KPIRow;
