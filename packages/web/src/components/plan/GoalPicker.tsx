import React from 'react';
import type { GoalType } from '@wealthdeck/shared';
import { GOAL_TYPES } from '@wealthdeck/shared';
import styles from '../../styles/plan.module.css';

export interface GoalPickerProps {
  onSelect: (type: GoalType) => void;
}

/**
 * 4 goal type cards for selecting a savings goal.
 * Matches wealthdeck.html lines 202-207.
 */
const GoalPicker: React.FC<GoalPickerProps> = ({ onSelect }) => {
  const types: GoalType[] = ['edu', 'retire', 'home', 'custom'];

  return (
    <div className={styles.goalPick}>
      {types.map((type) => {
        const t = GOAL_TYPES[type];
        return (
          <div
            key={type}
            className={styles.gp}
            onClick={() => onSelect(type)}
          >
            <div className={styles.ic}>{t.icon}</div>
            <div className={styles.nm}>{t.label}</div>
            <div className={styles.ds}>
              {type === 'edu' && '红包记账 + 独立账户 + 留学/读书目标'}
              {type === 'retire' && '退休年龄、月供、退休后支出推演'}
              {type === 'home' && '首付目标、期限、每月需储蓄额'}
              {type === 'custom' && '任意目标金额与期限'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoalPicker;
