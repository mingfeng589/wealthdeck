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
  cash: number;
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
  const { total, cash, rows, catSet, corrCache } = params;

  let score = 100;
  const acts: string[] = [];

  const sorted = rows.slice().sort((a, b) => b.val - a.val);
  const top = sorted[0] ?? null;
  const topW = top ? (top.val / total) * 100 : 0;
  const cashW = (cash / total) * 100;

  if (catSet.size < 3) {
    score -= 12;
    acts.push(
      '\u{1F9E9} 资产类别只有 ' +
        catSet.size +
        ' 类：考虑加入债券或商品类对冲股票波动。',
    );
  }

  if (topW > 25) {
    score -= 15;
    const name = top!.liveName || top!.h.name;
    acts.push(
      `⚖️ 单一持仓 ${name} 占净值 ${topW.toFixed(1)}%，集中度偏高，考虑分批减仓或加其他资产稀释。`,
    );
  }

  if (cashW > 40) {
    score -= 10;
    acts.push(
      `\u{1F4A4} 现金占比 ${cashW.toFixed(1)}%，存在闲置拖累：可配置货基/短债/国债逆回购等低风险生息资产。`,
    );
  }

  if (cashW < 5) {
    score -= 5;
    acts.push(
      '\u{1F6A8} 现金占比不足 5%，应急流动性偏弱，建议保留 3-6 个月开支。',
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

  const eq = rows.filter(
    (r) => r.h.sym && /^(us|hk|sh|sz)/.test(r.h.sym!),
  );
  const mkts = new Set(
    eq.map((r) =>
      r.h.sym!.startsWith('us') ? 'us' : r.h.sym!.startsWith('hk') ? 'hk' : 'cn',
    ),
  );
  if (eq.length >= 2 && mkts.size === 1) {
    score -= 6;
    acts.push(
      '\u{1F30D} 股票全部集中在单一市场，可跨美/港/A 分散单一市场政策与汇率风险。',
    );
  }

  if (!catSet.has('bond') && !rows.some((r) => r.h.kind === 'bond')) {
    score -= 4;
    acts.push(
      '\u{1F4C9} 暂无债券类资产（可用 TLT/AGG/国债ETF）：股债相关性长期偏低，是改善风险调整后收益最直接的工具。',
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
    { label: '类别分散', value: catSet.size + '/7' },
    { label: '最大持仓占比', value: topW.toFixed(0) + '%' },
    { label: '现金占比', value: cashW.toFixed(0) + '%' },
  ];

  return { score, grade, actions: acts, subscores };
}
