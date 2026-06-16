import React from 'react';
import type { Holding, Currency, Goal } from '@wealthdeck/shared';
import { CATS, GOAL_TYPES, CSYM, fmt, fmt2 } from '@wealthdeck/shared';
import styles from '../../styles/track.module.css';

export interface HoldingsRow {
  h: Holding;
  val: number;
  day: number;
  cost: number | null;
  price: number | null;
  pct: number | null;
  ccy: Currency;
  liveName: string | null;
}

export interface HoldingsTableProps {
  rows: HoldingsRow[];
  baseCcy: Currency;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  goals?: Goal[];
}

/**
 * Look up the display name for an account (goal) id.
 * Falls back to '主组合' for the default main account.
 */
function acctName(id: string, goals: Goal[] = []): string {
  if (id === 'main') return '主组合';
  const g = goals.find((x) => x.id === id);
  return g ? GOAL_TYPES[g.type].icon + g.name : '主组合';
}

/**
 * Holdings detail table.
 * Matches wealthdeck.html lines 180-186 (table) and render() rows logic (lines 670-687).
 */
const HoldingsTable: React.FC<HoldingsTableProps> = ({
  rows,
  baseCcy,
  onEdit,
  onDelete,
  goals = [],
}) => (
  <div className={styles.card}>
    <h3>持仓明细 Holdings</h3>
    <table>
      <thead>
        <tr>
          <th>名称 / 代码</th>
          <th>类别</th>
          <th>账户</th>
          <th>数量</th>
          <th>现价</th>
          <th>日涨跌</th>
          <th>市值({baseCcy})</th>
          <th>盈亏</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const { h } = r;
          const c = CATS[h.cat];
          const pl = r.cost != null ? r.val - r.cost : null;
          const kindTag =
            h.kind === 'lev'
              ? ' ⚡杠杆'
              : h.kind === 'idx'
                ? ' 📊指数'
                : '';

          return (
            <tr key={h.id}>
              <td>
                <div className={styles.nm}>{r.liveName || h.name}</div>
                <div className={styles.cd}>
                  {h.sym || ('ccy' in h ? h.ccy : '')}
                  {kindTag}
                </div>
              </td>
              <td>
                <span className="tag" style={{ background: c.color }}>
                  {c.label.split(' ')[0]}
                </span>
              </td>
              <td>
                <span className="tag ghost">{acctName(h.account, goals)}</span>
              </td>
              <td>{'qty' in h ? fmt2(h.qty) : '--'}</td>
              <td>
                {r.price != null ? CSYM[r.ccy] + fmt2(r.price) : '--'}
              </td>
              <td className={r.pct != null && r.pct >= 0 ? 'up' : 'down'}>
                {r.pct != null
                  ? `${r.pct >= 0 ? '+' : ''}${(+r.pct).toFixed(2)}%`
                  : '--'}
              </td>
              <td>
                <b>{fmt(r.val, baseCcy)}</b>
              </td>
              <td className={pl != null && pl >= 0 ? 'up' : 'down'}>
                {pl != null
                  ? `${pl >= 0 ? '+' : ''}${fmt(pl, baseCcy)}`
                  : '--'}
              </td>
              <td>
                <button className={styles.act} onClick={() => onEdit(h.id)}>
                  编辑
                </button>
                <button className={styles.act} onClick={() => onDelete(h.id)}>
                  删除
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    {rows.length === 0 && (
      <div className={styles.emptyHint}>
        暂无资产，点击右上角「＋ 添加资产」开始。
      </div>
    )}
  </div>
);

export default HoldingsTable;
