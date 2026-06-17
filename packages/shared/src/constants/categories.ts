import type { CategoryKey, Category } from '../types';

export const CATS: Record<CategoryKey, Category> = {
  equity: { label: '权益', color: '#0ea5a4' },
  pe_equity: { label: '私募股权', color: '#5b8def' },
  pe_debt: { label: '私募债权', color: '#7c6bc4' },
  other: { label: '另类资产', color: '#e0552e' },
};
