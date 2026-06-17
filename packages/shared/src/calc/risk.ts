import type { AssetClassification, Holding, CorrCache } from '../types';
import { RET_A, VOL_A, DIV_A } from '../constants';

/**
 * Classify a holding for risk/return assumption lookup.
 *
 * Cash and bond categories are always manual holdings (they carry `ccy` /
 * `coupon`), but TypeScript cannot narrow the union on `cat` alone, so we
 * use the `'ccy' in h` / `'coupon' in h` guards to satisfy the type checker.
 */
export function cls(h: Holding): AssetClassification {
  if (h.cat === 'equity') return { g: 'equity' };
  if (h.cat === 'pe_equity') return { g: 'pe_equity' };
  if (h.cat === 'pe_debt') return { g: 'pe_debt' };
  // other (另类资产)
  if (h.sym && h.sym.startsWith('cg_')) return { g: 'crypto' };
  if (h.kind === 'crypto') return { g: 'crypto' };
  if (h.kind === 'gold') return { g: 'gold' };
  if (h.kind === 'silver') return { g: 'silver' };
  if (h.kind === 'oil') return { g: 'oil' };
  return { g: 'other' };
}

/** Expected annual return (%) for an asset classification. */
export function expRetOf(c: AssetClassification): number {
  if (c.g === 'cash')
    return (RET_A.cash as Record<string, number>)[c.ccy!] ?? 2;
  if (c.g === 'bond') return c.coupon || (RET_A.bond as number);
  if (c.g === 'eq' || c.g === 'idx')
    return (RET_A[c.g] as Record<string, number>)[c.mkt!] ?? 6.5;
  return (RET_A[c.g] as number) ?? 0;
}

/** Expected annual volatility (%) for an asset classification. */
export function volOf(c: AssetClassification): number {
  if (c.g === 'cash') return VOL_A.cash as number;
  if (c.g === 'eq' || c.g === 'idx')
    return (VOL_A[c.g] as Record<string, number>)[c.mkt!] ?? 22;
  return (VOL_A[c.g] as number) ?? 10;
}

/** Expected annual dividend yield (%) for an asset classification. */
export function divOf(c: AssetClassification): number {
  if (c.g === 'cash')
    return (RET_A.cash as Record<string, number>)[c.ccy!] ?? 2;
  if (c.g === 'bond') return c.coupon || (RET_A.bond as number);
  if (c.g === 'eq' || c.g === 'idx')
    return (DIV_A[c.g] as Record<string, number>)[c.mkt!] ?? 1.5;
  if (c.g === 'equity') return DIV_A.equity as number;
  return 0;
}

/** Default correlation between two asset classifications. */
export function defRho(A: AssetClassification, B: AssetClassification): number {
  const eqlike = (x: AssetClassification) =>
    x.g === 'eq' || x.g === 'idx' || x.g === 'lev';

  if (A.g === 'cash' || B.g === 'cash') return 0;

  if (eqlike(A) && eqlike(B))
    return A.mkt && A.mkt === B.mkt ? 0.8 : 0.6;

  const other = eqlike(A) ? B.g : eqlike(B) ? A.g : null;
  if (other != null)
    return (
      ({
        crypto: 0.4,
        gold: 0.05,
        silver: 0.15,
        oil: 0.3,
        bond: 0.1,
        equity: 0.6,
        pe_equity: 0.7,
        pe_debt: 0.3,
        other: 0.1,
      } as Record<string, number>)[other] ?? 0.2
    );

  const pair = (x: string, y: string) =>
    (A.g === x && B.g === y) || (A.g === y && B.g === x);
  if (pair('gold', 'silver')) return 0.8;
  if (pair('gold', 'crypto')) return 0.1;
  if (pair('equity', 'pe_equity')) return 0.6;
  if (pair('equity', 'pe_debt')) return 0.3;
  if (pair('pe_equity', 'pe_debt')) return 0.4;
  if (A.g === 'bond' || B.g === 'bond') return 0.1;
  return 0.2;
}

export interface PortfolioItem {
  w: number;
  c: AssetClassification;
  sym?: string;
}

/**
 * Portfolio risk: sigma = sqrt(w^T * Sigma * w).
 *
 * When a `corrCache` is provided, measured volatilities and pairwise
 * correlations are used for holdings present in the cache; otherwise
 * default assumptions from `volOf` / `defRho` are used.
 */
export function computePortfolioSigma(
  items: PortfolioItem[],
  corrCache: CorrCache | null,
): number {
  const symIdx: Record<string, number> = {};
  if (corrCache && corrCache.syms)
    corrCache.syms.forEach((s, i) => {
      symIdx[s] = i;
    });

  let varp = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      let va = volOf(a.c);
      let vb = volOf(b.c);
      let rho: number;

      if (i === j) {
        rho = 1;
      } else if (
        corrCache &&
        a.sym &&
        b.sym &&
        symIdx[a.sym] != null &&
        symIdx[b.sym] != null &&
        corrCache.matrix[symIdx[a.sym]][symIdx[b.sym]] != null
      ) {
        rho = corrCache.matrix[symIdx[a.sym]][symIdx[b.sym]]!;
      } else {
        rho = defRho(a.c, b.c);
      }

      if (
        corrCache &&
        a.sym &&
        symIdx[a.sym] != null &&
        corrCache.vols[symIdx[a.sym]]
      )
        va = corrCache.vols[symIdx[a.sym]];
      if (
        corrCache &&
        b.sym &&
        symIdx[b.sym] != null &&
        corrCache.vols[symIdx[b.sym]]
      )
        vb = corrCache.vols[symIdx[b.sym]];

      varp += a.w * b.w * va * vb * rho;
    }
  }
  return Math.sqrt(Math.max(0, varp));
}
