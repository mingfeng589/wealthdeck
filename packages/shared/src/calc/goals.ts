import type { Goal, GoalProjection } from '../types';

/**
 * Project a goal's balance forward in time.
 *
 * For retirement goals (`type === 'retire'`), two phases are modelled:
 *   1. Accumulation phase: monthly contributions compounded at `g.ret`.
 *   2. Drawdown phase: monthly net spending (spend - pension) until age 90.
 *
 * For other goals, contributions are compounded until the target year.
 *
 * `currentBalance` should be the result of `goalBalance(g, ...)`.
 */
export function goalProjection(
  g: Goal,
  currentBalance: number,
): GoalProjection {
  const now = new Date().getFullYear();
  const r = (g.ret || 0) / 100 / 12;

  if (g.type === 'retire') {
    const yearsAcc = Math.max(0, (g.ageRet ?? 0) - (g.ageNow ?? 0));
    const yearsDraw = Math.max(0, 90 - (g.ageRet ?? 0));
    let bal = currentBalance;
    const pts: Array<{ x: number; y: number }> = [{ x: now, y: bal }];

    for (let y = 1; y <= yearsAcc; y++) {
      for (let m = 0; m < 12; m++) bal = bal * (1 + r) + (g.monthly || 0);
      pts.push({ x: now + y, y: bal });
    }

    const netSpend = Math.max(0, (g.spend || 0) - (g.pension || 0));
    for (let y = 1; y <= yearsDraw; y++) {
      for (let m = 0; m < 12; m++) bal = bal * (1 + r) - netSpend;
      pts.push({ x: now + yearsAcc + y, y: Math.max(0, bal) });
      if (bal <= 0) break;
    }

    return { pts, end: bal, horizon: '至 90 岁' };
  }

  // Non-retirement goals
  const years = Math.max(0, g.year - now);
  let bal = currentBalance;
  const pts: Array<{ x: number; y: number }> = [{ x: now, y: bal }];

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) bal = bal * (1 + r) + (g.monthly || 0);
    pts.push({ x: now + y, y: bal });
  }

  return { pts, end: bal, horizon: g.year + '年' };
}

/**
 * Compute the monthly contribution required to reach `g.target` by `g.year`,
 * given a current balance and expected return `g.ret`.
 *
 * `currentBalance` should be the result of `goalBalance(g, ...)`.
 */
export function requiredMonthly(g: Goal, currentBalance: number): number {
  const now = new Date().getFullYear();
  const months = Math.max(1, (g.year - now) * 12);
  const r = (g.ret || 0) / 100 / 12;
  const fvBal = currentBalance * Math.pow(1 + r, months);
  const need = g.target - fvBal;
  if (need <= 0) return 0;
  const annuity = r > 0 ? (Math.pow(1 + r, months) - 1) / r : months;
  return need / annuity;
}
