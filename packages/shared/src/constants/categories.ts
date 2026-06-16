import type { CategoryKey, Category } from '../types';

export const CATS: Record<CategoryKey, Category> = {
  securities: { label: '证券', color: '#3b6ff5' },
  bond: { label: '债券', color: '#8a5cf6' },
  commodity: { label: '商品', color: '#e8a13c' },
  realestate: { label: '房地产', color: '#0ea5a4' },
  pe_equity: { label: '私募股权', color: '#5b8def' },
  pe_debt: { label: '私募债权', color: '#7c6bc4' },
  cash: { label: '现金', color: '#14803c' },
  other: { label: '其他资产', color: '#e0552e' },
};
