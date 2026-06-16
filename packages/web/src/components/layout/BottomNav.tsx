import React from 'react';
import { TABS } from './TopNav';
import styles from './styles/bottomnav.module.css';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className={styles.bottomNav}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? styles.tabActive : styles.tab}
          onClick={() => onTabChange(tab.key)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
