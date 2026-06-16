import { useMemo } from 'react';
import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import {
  fmt,
  cls,
  expRetOf,
  divOf,
  computePortfolioSigma,
} from '@wealthdeck/shared';
import type { PortfolioItem } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import styles from '../../styles/improve.module.css';

interface PortfolioStatsProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
  total: number;
}

export function PortfolioStats({ rows, total }: PortfolioStatsProps) {
  const { baseCcy, corrCache } = useAppState();

  const stats = useMemo(() => {
    if (total <= 0) return null;

    const cashVal = rows.filter((r) => r.h.cat === 'cash').reduce((s, r) => s + r.val, 0);
    const cashPct = (cashVal / total) * 100;

    const items: PortfolioItem[] = rows
      .filter((r) => r.val > 0)
      .map((r) => ({
        w: r.val / total,
        c: cls(r.h),
        sym: r.h.sym || undefined,
      }));

    const expRet = items.reduce((s, it) => s + it.w * expRetOf(it.c), 0);
    const sigma = computePortfolioSigma(items, corrCache);
    const divYield = items.reduce((s, it) => s + it.w * divOf(it.c), 0);
    const divAmt = total * divYield / 100;

    return {
      total: fmt(total, baseCcy),
      cash: fmt(cashVal, baseCcy),
      cashSub: `${cashPct.toFixed(1)}% of total`,
      ret: `${expRet.toFixed(1)}%`,
      retSub: fmt(total * expRet / 100, baseCcy) + '/yr',
      risk: `${sigma.toFixed(1)}%`,
      riskSub: `1σ = ${fmt(total * sigma / 100, baseCcy)}`,
      div: fmt(divAmt, baseCcy),
      divSub: '每年股息+票息+现金利息',
    };
  }, [rows, total, baseCcy, corrCache]);

  return (
    <div className={styles.card}>
      <h3>Portfolio Stats 组合统计</h3>
      {stats ? (
        <div className={styles.statgrid}>
          <div className={styles.stat}>
            <div className={styles.t}>Total amount 总额</div>
            <div className={styles.v}>{stats.total}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.t}>Cash investable 可投资现金</div>
            <div className={styles.v}>{stats.cash}</div>
            <div className={styles.s}>{stats.cashSub}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.t}>Overall exp. returns 预期收益</div>
            <div className={styles.v}>{stats.ret}</div>
            <div className={styles.s}>{stats.retSub}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.t}>Exp. risk 预期风险（年化σ）</div>
            <div className={styles.v}>{stats.risk}</div>
            <div className={styles.s}>{stats.riskSub}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.t}>Dividend &amp; fixed income</div>
            <div className={styles.v}>{stats.div}</div>
            <div className={styles.s}>{stats.divSub}</div>
          </div>
        </div>
      ) : (
        <div className={styles.muted}>添加资产后显示统计数据。</div>
      )}
      <details className={styles.muted} style={{ fontSize: 12, lineHeight: 1.7 }}>
        <summary style={{ cursor: 'pointer' }}>计算口径与假设（点开）</summary>
        预期收益采用长期资本市场假设：美股 6.5%/港股 7%/A股 7.5%（宽基指数同），债券=票息或 3.5%，房地产 4%（含 2% 净租金），PE 10%，黄金/白银 3%，原油 2%，现金按货币市场利率（USD 4%/HKD 3.5%/CNY 1.8%），加密资产与杠杆 ETF 不设预期收益（按 0 计，视为投机性敞口）。
        预期风险 σ = √(wᵀΣw)：已计算相关性矩阵的持仓使用实测 120 日波动率与相关系数，其余使用类别假设。股息率假设：美股 1.3%/港股 3.5%/A股 2.5%。以上为简化模型，结果随行情与假设变化，不构成投资建议。
      </details>
    </div>
  );
}
