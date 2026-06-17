import React from 'react';
import styles from '../../styles/track.module.css';

export interface KPIRowProps {
  netWorth: string;
  dayChange: string;
  dayPositive: boolean;
  dayPct: string;
  holdingsCount: number;
  catCount: number;
  showDayChange?: boolean;
}

const KPIRow: React.FC<KPIRowProps> = ({
  netWorth,
  dayChange,
  dayPositive,
  dayPct,
  holdingsCount,
  catCount,
  showDayChange = true,
}) => (
  <div className={styles.kpis}>
    <div className={styles.kpi}>
      <div className={styles.t}>总净值 Net Worth</div>
      <div className={styles.v}>{netWorth}</div>
    </div>
    {showDayChange && (
      <div className={styles.kpi}>
        <div className={styles.t}>今日变动 Day Change</div>
        <div className={`${styles.v} ${dayPositive ? 'up' : 'down'}`}>
          {dayChange}
        </div>
        <div className={`${styles.s} ${dayPositive ? 'up' : 'down'}`}>
          {dayPct}
        </div>
      </div>
    )}
    <div className={styles.kpi}>
      <div className={styles.t}>持仓项 Holdings</div>
      <div className={styles.v}>{holdingsCount}</div>
      <div className={`${styles.s} ${styles.muted}`}>{catCount} 个资产类别</div>
    </div>
  </div>
);

export default KPIRow;
