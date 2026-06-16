import React, { useState, useEffect, useCallback } from 'react';
import type { Goal, GoalType } from '@wealthdeck/shared';
import { GOAL_TYPES } from '@wealthdeck/shared';
import ModalOverlay from './ModalOverlay';
import styles from '../../styles/modals.module.css';

export interface GoalModalProps {
  show: boolean;
  onClose: () => void;
  editGoal: Goal | null;
  goalType: GoalType;
  onSave: (goal: Goal) => void;
  onDelete?: (id: string) => void;
}

/**
 * Goal create/edit modal -- mirrors the HTML lines 359-383.
 *
 * Has special fields for the "retire" goal type (ageNow, ageRet, spend, pension).
 * Default values match `openGoalModal()` lines 831-842.
 * Save logic mirrors `saveGoal()` lines 844-848.
 */
const GoalModal: React.FC<GoalModalProps> = ({
  show,
  onClose,
  editGoal,
  goalType,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [year, setYear] = useState('');
  const [ret, setRet] = useState('5');
  const [monthly, setMonthly] = useState('0');

  // Retire-specific fields
  const [ageNow, setAgeNow] = useState('35');
  const [ageRet, setAgeRet] = useState('60');
  const [spend, setSpend] = useState('20000');
  const [pension, setPension] = useState('5000');

  // Populate form on open (mirrors openGoalModal lines 830-842)
  useEffect(() => {
    if (!show) return;
    const t = GOAL_TYPES[goalType];
    const g = editGoal;

    setName(g ? g.name : t.defName);

    setTarget(
      g
        ? String(g.target)
        : String(
            goalType === 'edu'
              ? 1500000
              : goalType === 'home'
                ? 800000
                : goalType === 'retire'
                  ? 5000000
                  : 100000,
          ),
    );

    setYear(
      g
        ? String(g.year)
        : String(
            new Date().getFullYear() +
              (goalType === 'edu'
                ? 15
                : goalType === 'home'
                  ? 5
                  : goalType === 'retire'
                    ? 25
                    : 5),
          ),
    );

    setRet(g ? String(g.ret) : '5');
    setMonthly(g ? String(g.monthly) : '0');
    setAgeNow(g?.ageNow ? String(g.ageNow) : '35');
    setAgeRet(g?.ageRet ? String(g.ageRet) : '60');
    setSpend(g?.spend ? String(g.spend) : '20000');
    setPension(g?.pension ? String(g.pension) : '5000');
  }, [show, editGoal, goalType]);

  // Save (mirrors saveGoal lines 844-848)
  const handleSave = useCallback(() => {
    const existingLedger = editGoal?.ledger || [];

    const g: Goal = {
      id: editGoal?.id || 'g' + Date.now(),
      type: goalType,
      name: name.trim() || '目标',
      target: Number(target) || 0,
      year: Number(year) || new Date().getFullYear() + 5,
      ret: Number(ret) || 0,
      monthly: Number(monthly) || 0,
      ledger: existingLedger,
    };

    if (goalType === 'retire') {
      g.ageNow = Number(ageNow);
      g.ageRet = Number(ageRet);
      g.spend = Number(spend);
      g.pension = Number(pension);
      // For retire, year is computed from ages
      g.year = new Date().getFullYear() + (g.ageRet! - g.ageNow!);
    }

    onSave(g);
  }, [
    editGoal,
    goalType,
    name,
    target,
    year,
    ret,
    monthly,
    ageNow,
    ageRet,
    spend,
    pension,
    onSave,
  ]);

  const handleDelete = useCallback(() => {
    if (editGoal && onDelete) {
      onDelete(editGoal.id);
    }
  }, [editGoal, onDelete]);

  const typeConfig = GOAL_TYPES[goalType];
  const title = (editGoal ? '编辑：' : '新建：') + typeConfig.icon + ' ' + typeConfig.label;

  return (
    <ModalOverlay show={show} onClose={onClose}>
      <h2>{title}</h2>

      <div className={styles.f}>
        <label>名称</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>目标金额（基准货币）</label>
          <input
            type="number"
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>目标年份</label>
          <input
            type="number"
            step="1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>预期年化收益 %</label>
          <input
            type="number"
            step="any"
            value={ret}
            onChange={(e) => setRet(e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>计划每月追加</label>
          <input
            type="number"
            step="any"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
          />
        </div>
      </div>

      {/* Retire-specific fields */}
      {goalType === 'retire' && (
        <div>
          <div className={styles.row2}>
            <div className={styles.f}>
              <label>当前年龄</label>
              <input
                type="number"
                value={ageNow}
                onChange={(e) => setAgeNow(e.target.value)}
              />
            </div>
            <div className={styles.f}>
              <label>退休年龄</label>
              <input
                type="number"
                value={ageRet}
                onChange={(e) => setAgeRet(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.row2}>
            <div className={styles.f}>
              <label>退休后每月支出（今天的钱）</label>
              <input
                type="number"
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
              />
            </div>
            <div className={styles.f}>
              <label>退休后每月其他收入（社保/年金）</label>
              <input
                type="number"
                value={pension}
                onChange={(e) => setPension(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={styles.foot}>
        {editGoal && onDelete && (
          <button
            className="btn"
            type="button"
            style={{ color: 'var(--red)' }}
            onClick={handleDelete}
          >
            删除目标
          </button>
        )}
        <button className="btn" type="button" onClick={onClose}>
          取消
        </button>
        <button className="btn primary" type="button" onClick={handleSave}>
          保存
        </button>
      </div>
    </ModalOverlay>
  );
};

export default GoalModal;
