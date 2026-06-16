import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
} from 'chart.js';
import type { Goal } from '@wealthdeck/shared';
import {
  GOAL_TYPES,
  fmt,
  goalBalance,
  goalProjection,
  requiredMonthly,
} from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import LedgerForm from './LedgerForm';
import styles from '../../styles/plan.module.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler);

interface GoalCardProps {
  goal: Goal;
  onEdit: (g: Goal) => void;
  onAddHolding: (goalId: string) => void;
  onEditHolding: (id: string) => void;
}

export function GoalCard({ goal, onEdit, onAddHolding, onEditHolding }: GoalCardProps) {
  const { holdings, quotes, baseCcy, fx, goals, setGoals } = useAppState();

  const g = goal;
  const tc = GOAL_TYPES[g.type];
  const bal = goalBalance(g, holdings, quotes, baseCcy, fx);
  const pct = g.target > 0 ? Math.min(100, (bal / g.target) * 100) : 0;
  const proj = goalProjection(g, bal);
  const reqM = g.type !== 'retire' ? requiredMonthly(g, bal) : 0;

  const goalHoldings = useMemo(
    () => holdings.filter((h) => h.account === g.id),
    [holdings, g.id],
  );

  const handleAddLedger = (entry: { date: string; from: string; amt: number; ccy: any; note: string }) => {
    const updated: Goal = {
      ...g,
      ledger: [...(g.ledger || []), entry],
    };
    setGoals(goals.map((x) => (x.id === g.id ? updated : x)));
  };

  const handleDeleteLedger = (idx: number) => {
    const updated: Goal = {
      ...g,
      ledger: (g.ledger || []).filter((_, i) => i !== idx),
    };
    setGoals(goals.map((x) => (x.id === g.id ? updated : x)));
  };

  const chartData = useMemo(() => ({
    labels: proj.pts.map((p) => String(p.x)),
    datasets: [
      {
        data: proj.pts.map((p) => Math.round(p.y)),
        borderColor: '#1f5eff',
        backgroundColor: 'rgba(31,94,255,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  }), [proj]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 10 } } },
    },
  }), []);

  return (
    <div className={styles.goalCard}>
      <div className={styles.ghead}>
        <h3>{tc.icon} {g.name}</h3>
        <div>
          <button className={styles.act} onClick={() => onEdit(g)}>✏️ 编辑</button>
        </div>
      </div>

      <div className={styles.gstats}>
        <div className={styles.gstat}>
          <div className={styles.t}>目标金额</div>
          <div className={styles.v}>{fmt(g.target, baseCcy)}</div>
        </div>
        <div className={styles.gstat}>
          <div className={styles.t}>当前余额</div>
          <div className={styles.v}>{fmt(bal, baseCcy)}</div>
        </div>
        <div className={styles.gstat}>
          <div className={styles.t}>{g.type === 'retire' ? '推演终值' : '需月存'}</div>
          <div className={styles.v}>{g.type === 'retire' ? fmt(proj.end, baseCcy) : fmt(reqM, baseCcy)}</div>
        </div>
        <div className={styles.gstat}>
          <div className={styles.t}>进度</div>
          <div className={styles.v}>{pct.toFixed(0)}%</div>
        </div>
      </div>

      <div className={styles.gbar}>
        <span className={styles.gbarFill} style={{ width: pct + '%' }} />
      </div>

      <div className={styles.gcols}>
        <div>
          <div className={styles.sectionTitle}>推演曲线（{proj.horizon}）</div>
          <div className={styles.chartBox}>
            <Line data={chartData} options={chartOptions as any} />
          </div>

          <div className={styles.holdingsTitle}>
            持仓
            <button className={styles.catAdd} onClick={() => onAddHolding(g.id)}>＋</button>
          </div>
          {goalHoldings.length === 0 ? (
            <div className={styles.muted}>暂无持仓，点 ＋ 添加</div>
          ) : (
            goalHoldings.map((h) => (
              <div
                key={h.id}
                className={styles.catRow}
                onClick={() => onEditHolding(h.id)}
              >
                <span>{h.name}</span>
              </div>
            ))
          )}
        </div>

        <div>
          <div className={styles.sectionTitle}>记账（{tc.ledgerFrom}）</div>
          <LedgerForm ledgerFrom={tc.ledgerFrom} onAdd={handleAddLedger} />
          {(g.ledger || []).length > 0 && (
            <table style={{ marginTop: 8, width: '100%' }}>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>{tc.ledgerFrom}</th>
                  <th>金额</th>
                  <th>备注</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(g.ledger || []).map((e, i) => (
                  <tr key={i}>
                    <td>{e.date}</td>
                    <td>{e.from}</td>
                    <td>{e.amt > 0 ? '+' : ''}{e.amt.toLocaleString()} {e.ccy}</td>
                    <td>{e.note}</td>
                    <td>
                      <button className={styles.act} onClick={() => handleDeleteLedger(i)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
