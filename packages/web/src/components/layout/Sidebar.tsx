import React, { useState } from 'react';
import styles from './styles/sidebar.module.css';

interface SidebarProps {
  netWorth: string;
  dayChange: string;
  dayPositive: boolean;
  categories: Array<{
    key: string;
    label: string;
    color: string;
    items: Array<{ id: string; name: string; value: string; onClick: () => void }>;
    extras?: Array<{ label: string; value: string; onClick: () => void }>;
    subtotal: string;
    onAdd: () => void;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ netWorth, dayChange, dayPositive, categories }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          <div>
            WealthDeck
            <br />
            <small>个人资产管理台</small>
          </div>
        </div>

        <div className={styles.nwBlock}>
          <div className={styles.nwLabel}>NET WORTH 总净值</div>
          <div className={styles.nwValue}>{netWorth}</div>
          <div
            className={styles.nwChg}
            style={{ color: dayPositive ? 'var(--green)' : 'var(--red)' }}
          >
            {dayChange}
          </div>
        </div>

        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? '收起' : '展开'}
        >
          {expanded ? '▲ 收起' : '▼ 资产分类'}
        </button>
      </div>

      <div className={expanded ? styles.catListExpanded : styles.catList}>
        {categories.map((cat) => (
          <div key={cat.key} className={styles.catBlock}>
            <div className={styles.catHead} onClick={cat.onAdd} style={{ cursor: 'pointer' }}>
              <b className={styles.catHeadLabel}>
                <span className={styles.swatch} style={{ background: cat.color }} />
                {cat.label}
              </b>
              <span className={styles.catAdd} title="添加">
                +
              </span>
            </div>

            {cat.items.map((item) => (
              <div key={item.id} className={styles.catRow} onClick={item.onClick}>
                <span>{item.name}</span>
                <span className={styles.catRowValue}>{item.value}</span>
              </div>
            ))}

            {cat.extras?.map((extra, i) => (
              <div key={i} className={styles.catRow} onClick={extra.onClick}>
                <span>{extra.label}</span>
                <span className={styles.catRowValue}>{extra.value}</span>
              </div>
            ))}

            <div className={styles.catSub}>{cat.subtotal}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
