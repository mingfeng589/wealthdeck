import { useState, useCallback } from 'react';
import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import { pearson } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import { stockSeries, cryptoSeries } from '../../services/kline';
import { CG_MAP } from '@wealthdeck/shared';
import styles from '../../styles/improve.module.css';

interface CorrelationMatrixProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
}

export function CorrelationMatrix({ rows }: CorrelationMatrixProps) {
  const { corrCache, setCorrCache, store } = useAppState();
  const [computing, setComputing] = useState(false);
  const [status, setStatus] = useState('');

  const compute = useCallback(async () => {
    const syms = rows
      .filter((r) => r.h.sym && r.val > 0)
      .map((r) => ({ sym: r.h.sym!, name: r.liveName || r.h.name }));

    if (syms.length < 2) {
      setStatus('需至少 2 个有行情的持仓。');
      return;
    }

    setComputing(true);
    setStatus(`拉取 K 线数据中... 0/${syms.length}`);

    const allSeries: Array<number[] | null> = [];
    for (let i = 0; i < syms.length; i++) {
      setStatus(`拉取 K 线数据中... ${i + 1}/${syms.length}`);
      const s = syms[i].sym;
      let pts: Array<{ d: string; c: number }> | null = null;

      if (s.startsWith('cg_')) {
        const cgId = Object.entries(CG_MAP).find(([, v]) => v === s.replace('cg_', ''))?.[0] || s.replace('cg_', '');
        pts = await cryptoSeries(cgId);
      } else {
        pts = await stockSeries(s, i);
      }

      allSeries.push(pts ? pts.map((p) => p.c) : null);
    }

    const n = syms.length;
    const matrix: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
    const vols: number[] = Array(n).fill(0);
    const high: [string, string, number][] = [];

    for (let i = 0; i < n; i++) {
      const si = allSeries[i];
      if (!si || si.length < 10) continue;

      const rets = si.slice(1).map((c, j) => (c - si[j]) / si[j]);
      const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
      vols[i] = Math.sqrt(variance * 252) * 100;

      matrix[i][i] = 1;

      for (let j = i + 1; j < n; j++) {
        const sj = allSeries[j];
        if (!sj || sj.length < 10) continue;

        const minLen = Math.min(si.length, sj.length);
        const ri = si.slice(si.length - minLen + 1).map((c, k) => (c - si[si.length - minLen + k]) / si[si.length - minLen + k]);
        const rj = sj.slice(sj.length - minLen + 1).map((c, k) => (c - sj[sj.length - minLen + k]) / sj[sj.length - minLen + k]);

        const rho = pearson(ri, rj);
        matrix[i][j] = rho;
        matrix[j][i] = rho;

        if (rho !== null && rho > 0.75) {
          high.push([syms[i].name, syms[j].name, rho]);
        }
      }
    }

    const cache = {
      t: Date.now(),
      names: syms.map((s) => s.name),
      syms: syms.map((s) => s.sym),
      matrix,
      high,
      vols,
    };

    setCorrCache(cache);
    store.saveCorrCache(cache);
    setComputing(false);
    setStatus(`计算完成 · ${n} 个持仓 · ${high.length} 对高相关`);
  }, [rows, setCorrCache, store]);

  const cellColor = (v: number | null) => {
    if (v === null) return 'transparent';
    if (v === 1) return '#f5f5f5';
    const abs = Math.abs(v);
    if (abs > 0.75) return 'rgba(239,68,68,0.15)';
    if (abs > 0.5) return 'rgba(245,158,11,0.08)';
    return 'transparent';
  };

  return (
    <div className={styles.card}>
      <h3>风险调整后收益 · 相关性矩阵</h3>
      <p className={styles.muted} style={{ lineHeight: 1.7 }}>
        基于近 120 个交易日日收益率实算（腾讯K线 + CoinGecko），按需计算、缓存 24 小时。相关系数 &gt;0.75 的持仓对将被标记，并自动用于上方「预期风险」的计算。
      </p>
      <div style={{ marginTop: 10 }}>
        <button
          className="btn primary"
          onClick={compute}
          disabled={computing}
        >
          {computing ? '计算中...' : '计算 / 更新相关性'}
        </button>{' '}
        <span className={styles.muted}>{status}</span>
      </div>

      {corrCache && corrCache.names.length > 0 && (
        <>
          <div className={styles.corrTable}>
            <table>
              <thead>
                <tr>
                  <th></th>
                  {corrCache.names.map((n, i) => (
                    <th key={i}>{n}</th>
                  ))}
                  <th>σ</th>
                </tr>
              </thead>
              <tbody>
                {corrCache.names.map((name, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, textAlign: 'left' }}>{name}</td>
                    {corrCache.matrix[i].map((v, j) => (
                      <td key={j} style={{ background: cellColor(v) }}>
                        {v !== null ? (i === j ? '—' : v.toFixed(2)) : '·'}
                      </td>
                    ))}
                    <td style={{ fontWeight: 600 }}>
                      {corrCache.vols[i] ? corrCache.vols[i].toFixed(1) + '%' : '·'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {corrCache.high.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {corrCache.high.map((h, i) => (
                <div key={i} className={styles.muted} style={{ marginBottom: 4 }}>
                  🔗 <b>{h[0]}</b> ↔ <b>{h[1]}</b> 相关系数 {h[2].toFixed(2)}（高相关，同涨同跌概率大）
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
