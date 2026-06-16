import React from 'react';
import styles from './styles/topnav.module.css';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lastUpdated: string;
  baseCcy: string;
  onCcyChange: (ccy: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onBackupJson: () => void;
  onImport: () => void;
  onAdd: () => void;
}

export const TABS = [
  { key: 'track', label: '总览', icon: '📊' },
  { key: 'plan', label: '规划', icon: '🎯' },
  { key: 'improve', label: '优化', icon: '⚡' },
  { key: 'more', label: '其他', icon: '☰' },
];

const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  lastUpdated,
  baseCcy,
  onCcyChange,
  onRefresh,
  onExport,
  onBackupJson,
  onImport,
  onAdd,
}) => {
  return (
    <div className={styles.topnav}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? styles.tabbtnOn : styles.tabbtn}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <span className={styles.spacer} />

      <div className={styles.controls}>
        <span className={styles.muted}>{lastUpdated}</span>

        <select
          className={styles.select}
          value={baseCcy}
          onChange={(e) => onCcyChange(e.target.value)}
        >
          <option value="USD">USD $</option>
          <option value="CNY">CNY &yen;</option>
          <option value="HKD">HKD HK$</option>
        </select>

        <button className={styles.btn} onClick={onRefresh}>
          ↻ 刷新
        </button>
        <button className={styles.btn} onClick={onExport}>
          导出Excel
        </button>
        <button className={styles.btn} onClick={onBackupJson}>
          备份
        </button>
        <button className={styles.btn} onClick={onImport}>
          导入
        </button>
        <button className={styles.btnPrimary} onClick={onAdd}>
          ＋ 添加资产
        </button>
      </div>
    </div>
  );
};

export default TopNav;
