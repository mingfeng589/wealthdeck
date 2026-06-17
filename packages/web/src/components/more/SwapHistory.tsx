import { useAppState } from '../../data/context';
import { CATS, fmt } from '@wealthdeck/shared';
import styles from '../../styles/more.module.css';

export function SwapHistory() {
  const { swaps, baseCcy } = useAppState();

  if (!swaps.length) return null;

  const sorted = [...swaps].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className={styles.card}>
      <h3>换仓记录</h3>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>原资产</th>
            <th>类别</th>
            <th>原估值</th>
            <th>新资产</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td className={styles.nm}>{r.fromName}</td>
              <td>
                <span className="tag" style={{ background: CATS[r.fromCat]?.color }}>
                  {CATS[r.fromCat]?.label.split(' ')[0]}
                </span>
              </td>
              <td>{fmt(r.fromVal, baseCcy)}</td>
              <td className={styles.nm}>{r.toName}</td>
              <td className={styles.muted}>{r.note || '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
