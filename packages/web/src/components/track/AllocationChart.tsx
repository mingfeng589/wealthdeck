import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from '../../styles/track.module.css';

ChartJS.register(ArcElement, Legend, Tooltip);

export interface AllocationCategory {
  label: string;
  color: string;
  value: number;
}

export interface AllocationChartProps {
  categories: AllocationCategory[];
}

/**
 * Doughnut chart of asset allocation by category.
 * Matches wealthdeck.html drawCharts() doughnut logic (lines 698-709).
 */
const AllocationChart: React.FC<AllocationChartProps> = ({ categories }) => {
  const data = useMemo(
    () => ({
      labels: categories.map((c) => c.label),
      datasets: [
        {
          data: categories.map((c) => Math.round(c.value)),
          backgroundColor: categories.map((c) => c.color),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    }),
    [categories],
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            boxWidth: 10,
            font: { size: 11 },
            generateLabels(chart: ChartJS<'doughnut'>) {
              const ds = chart.data.datasets[0].data as number[];
              const total = ds.reduce((a, b) => a + b, 0) || 1;
              return (chart.data.labels || []).map((l, i) => ({
                text: `${l as string} ${((ds[i] / total) * 100).toFixed(1)}%`,
                fillStyle: (chart.data.datasets[0].backgroundColor as string[])[i],
                lineWidth: 0,
              }));
            },
          },
        },
      },
    }),
    [],
  );

  return (
    <div className={styles.cardFlush}>
      <h3>资产配置 Asset Classes</h3>
      <div className={styles.chartBox}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default AllocationChart;
