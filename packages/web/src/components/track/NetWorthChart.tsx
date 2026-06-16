import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Currency, FxRates } from '@wealthdeck/shared';
import { fromUSD, fmt } from '@wealthdeck/shared';
import styles from '../../styles/track.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export interface NetWorthChartProps {
  history: Record<string, number>;
  baseCcy: Currency;
  fx: FxRates;
}

/**
 * Line chart showing the last 60 days of net worth history.
 * Matches wealthdeck.html drawCharts() line chart logic (lines 710-715).
 */
const NetWorthChart: React.FC<NetWorthChartProps> = ({ history, baseCcy, fx }) => {
  const { labels, dataPoints } = useMemo(() => {
    const ds = Object.keys(history).sort().slice(-60);
    return {
      labels: ds.map((d) => d.slice(5)),
      dataPoints: ds.map((d) => fromUSD(history[d], baseCcy, fx)),
    };
  }, [history, baseCcy, fx]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: '#1f5eff',
          backgroundColor: 'rgba(31,94,255,.08)',
          fill: true,
          tension: 0.3,
          pointRadius: labels.length > 20 ? 0 : 3,
        },
      ],
    }),
    [labels, dataPoints],
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (v: string | number) => fmt(+v, baseCcy),
          },
        },
      },
    }),
    [baseCcy],
  );

  return (
    <div className={styles.cardFlush}>
      <h3>净值走势</h3>
      <div className={styles.chartBox}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default NetWorthChart;
