import type { GoalType, Goal } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import GoalPicker from './GoalPicker';
import { GoalCard } from './GoalCard';
import styles from '../../styles/plan.module.css';

interface PlanTabProps {
  onNewGoal: (type: GoalType) => void;
  onEditGoal: (g: Goal) => void;
  onAddHolding: (goalId: string) => void;
  onEditHolding: (id: string) => void;
}

export function PlanTab({ onNewGoal, onEditGoal, onAddHolding, onEditHolding }: PlanTabProps) {
  const { goals } = useAppState();

  return (
    <>
      <div className={styles.card}>
        <h3>选择你的储蓄目标（只展示你选择的，不强推）</h3>
        <GoalPicker onSelect={onNewGoal} />
      </div>

      {goals.length === 0 ? (
        <div className={styles.emptyGoals}>
          <div className={styles.muted}>还没有目标，选择上方卡片开始创建。</div>
        </div>
      ) : (
        goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onEdit={onEditGoal}
            onAddHolding={onAddHolding}
            onEditHolding={onEditHolding}
          />
        ))
      )}
    </>
  );
}
