import { useState } from 'react';
import { PillSelector } from '../shared';
import { IDENTITY } from '../../content/identity';
import styles from '../../styles/more.module.css';

const ID_ITEMS = [
  { key: 'hk', label: '香港' },
  { key: 'us', label: '美国' },
  { key: 'sg', label: '新加坡' },
  { key: 'jp', label: '日本' },
  { key: 'pt', label: '葡萄牙' },
  { key: 'xs', label: '小国护照' },
];

export function IdentityLens() {
  const [active, setActive] = useState('hk');

  return (
    <div className={styles.card}>
      <h3>身份规划 Identity Lens</h3>
      <PillSelector items={ID_ITEMS} active={active} onChange={setActive} />
      <div
        className={styles.guide}
        dangerouslySetInnerHTML={{ __html: IDENTITY[active] || '' }}
      />
    </div>
  );
}
