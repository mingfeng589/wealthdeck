import type { Currency, FxRates, Holding, HoldingValuation, Quote, Goal, Policy } from '../types';
import { inBase } from './currency';

/**
 * Compute the valuation of a single holding.
 *
 * For symbol-based holdings the live quote is looked up; for manual holdings
 * the stored value is converted to the base currency.
 */
export function valueOf(
  h: Holding,
  quotes: Map<string, Quote>,
  baseCcy: Currency,
  fx: FxRates,
): HoldingValuation {
  if (h.sym) {
    const q = quotes.get(h.sym) ?? null;
    const price = q ? q.price : null;
    const ccy: Currency = q ? q.ccy : 'USD';
    const val =
      price != null ? inBase(price * h.qty, ccy, baseCcy, fx) : 0;
    const day =
      q && q.change != null
        ? inBase(q.change * h.qty, ccy, baseCcy, fx)
        : q && q.pct != null && q.price
          ? inBase(
              q.price * h.qty * q.pct / (100 + q.pct),
              ccy,
              baseCcy,
              fx,
            )
          : 0;
    const cost =
      h.cost != null ? inBase(h.cost * h.qty, ccy, baseCcy, fx) : null;
    return {
      val,
      day,
      cost,
      price,
      pct: q ? q.pct : null,
      ccy,
      liveName: q ? q.name : null,
    };
  }
  // Manual holding — narrow the union explicitly
  const m = h as import('../types').ManualHolding;
  return {
    val: inBase(m.val, m.ccy, baseCcy, fx),
    day: 0,
    cost: m.costM != null ? inBase(m.costM, m.ccy, baseCcy, fx) : null,
    price: null,
    pct: null,
    ccy: m.ccy,
    liveName: null,
  };
}

/** Sum of a goal's ledger entries, converted to base currency. */
export function goalCash(
  g: Goal,
  baseCcy: Currency,
  fx: FxRates,
): number {
  return (g.ledger || []).reduce(
    (s, e) => s + inBase(e.amt, e.ccy || baseCcy, baseCcy, fx),
    0,
  );
}

/** Total market value of holdings assigned to a goal. */
export function goalHoldingsVal(
  g: Goal,
  holdings: Holding[],
  quotes: Map<string, Quote>,
  baseCcy: Currency,
  fx: FxRates,
): number {
  return holdings
    .filter((h) => h.account === g.id)
    .map((h) => valueOf(h, quotes, baseCcy, fx))
    .reduce((s, r) => s + r.val, 0);
}

/** Goal balance = cash ledger + holdings value. */
export function goalBalance(
  g: Goal,
  holdings: Holding[],
  quotes: Map<string, Quote>,
  baseCcy: Currency,
  fx: FxRates,
): number {
  return (
    goalCash(g, baseCcy, fx) +
    goalHoldingsVal(g, holdings, quotes, baseCcy, fx)
  );
}

/** Total cash value of all insurance policies. */
export function polCVTotal(
  policies: Policy[],
  baseCcy: Currency,
  fx: FxRates,
): number {
  return policies.reduce(
    (s, p) => s + (p.cv ? inBase(p.cv, p.cvCcy, baseCcy, fx) : 0),
    0,
  );
}
