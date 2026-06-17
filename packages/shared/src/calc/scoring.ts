import type { Holding, CorrCache } from '../types';

export interface ScoringRow {
  h: Holding;
  val: number;
  liveName: string | null;
}

export interface PortfolioScore {
  score: number;
  grade: string;
  actions: string[];
  subscores: Array<{ label: string; value: string }>;
}

export interface ScoringParams {
  total: number;
  rows: ScoringRow[];
  catSet: Set<string>;
  corrCache: CorrCache | null;
}

/**
 * Compute a portfolio health score (20-100) with actionable suggestions.
 *
 * This is a pure extraction of the `renderImprove` scoring logic.
 * No DOM access -- returns structured data for the caller to render.
 */
export function computePortfolioScore(params: ScoringParams): PortfolioScore {
  const { total, rows, catSet, corrCache } = params;

  let score = 100;
  const acts: string[] = [];

  const sorted = rows.slice().sort((a, b) => b.val - a.val);
  const top = sorted[0] ?? null;
  const topW = top ? (top.val / total) * 100 : 0;

  if (catSet.size < 3) {
    score -= 12;
    acts.push(
      '\u{1F9E9} 资产类别只有 ' +
        catSet.size +
        ' 类：考虑增加类别分散风险。',
    );
  }

  if (topW > 25) {
    score -= 15;
    const name = top!.liveName || top!.h.name;
    acts.push(
      `⚖️ 单一持仓 ${name} 占净值 ${topW.toFixed(1)}%，集中度偏高，考虑分批减仓或加其他资产稀释。`,
    );
  }

  const lev = rows.filter((r) => r.h.kind === 'lev');
  const levW = (lev.reduce((s, r) => s + r.val, 0) / total) * 100;
  if (levW > 10) {
    score -= 10;
    acts.push(
      `⚡ 杠杆 ETF（SOXL/TQQQ 等）占比 ${levW.toFixed(1)}%：三倍杠杆有波动损耗（volatility decay），不适合长期持有，建议作为短期工具并设止损。`,
    );
  }

  if (corrCache && corrCache.high && corrCache.high.length) {
    score -= Math.min(10, corrCache.high.length * 4);
    acts.push(
      `\u{1F517} 检测到 ${corrCache.high.length} 对高相关持仓（见下方矩阵）：同涨同跌，分散效果有限。`,
    );
  }

  if (!acts.length)
    acts.push(
      '✅ 当前结构未触发预警规则。保持记录，定期（季度）再平衡即可。',
    );

  score = Math.max(20, Math.round(score));

  const grade =
    score >= 85
      ? '良好 Good'
      : score >= 70
        ? '一般 Fair'
        : '待优化 Needs work';

  const subscores = [
    { label: '类别分散', value: catSet.size + '/4' },
    { label: '最大持仓占比', value: topW.toFixed(0) + '%' },
  ];

  return { score, grade, actions: acts, subscores };
}
