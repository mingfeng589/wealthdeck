import type { GoalType, GoalTypeConfig, PolicyType } from '../types';

export const GOAL_TYPES: Record<GoalType, GoalTypeConfig> = {
  edu: { icon: '🎓', label: '孩子教育基金', ledgerFrom: '红包来自（如：爷爷奶奶）', defName: '宝宝教育基金' },
  retire: { icon: '🌅', label: '养老规划', ledgerFrom: '来源', defName: '我的养老金' },
  home: { icon: '🏠', label: '购房储蓄', ledgerFrom: '来源', defName: '首付基金' },
  custom: { icon: '🎯', label: '自定义目标', ledgerFrom: '来源', defName: '新目标' },
};

export const POL_TYPES: Record<PolicyType, string> = {
  ci: '重疾险',
  life: '寿险',
  med: '医疗险',
  acc: '意外险',
  ann: '年金/储蓄',
  oth: '其他',
};
