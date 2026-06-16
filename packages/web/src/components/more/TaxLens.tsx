import { useState } from 'react';
import { PillSelector } from '../shared';
import { TAX } from '../../content/tax';
import styles from '../../styles/more.module.css';

const TAX_ITEMS = [
  { key: 'cn', label: '中国内地' },
  { key: 'hk', label: '香港' },
  { key: 'sg', label: '新加坡' },
  { key: 'us', label: '美国' },
];

export function TaxLens() {
  const [active, setActive] = useState('cn');

  return (
    <div className={styles.card}>
      <h3>税务视角 Tax Lens</h3>
      <PillSelector items={TAX_ITEMS} active={active} onChange={setActive} />
      <div
        className={styles.guide}
        dangerouslySetInnerHTML={{ __html: TAX[active] || '' }}
      />
    </div>
  );
}
