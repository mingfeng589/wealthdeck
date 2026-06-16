import type { Quote, FxRates, Currency, Holding } from '@wealthdeck/shared';
import { INDEXES, CG_MAP } from '@wealthdeck/shared';
import { jsonp } from './jsonp';

declare const window: Window & Record<string, string | undefined>;

function parseQuote(sym: string, raw: string | undefined): Quote | null {
  if (!raw) return null;
  if (sym.startsWith('hf_')) {
    const a = raw.split(',');
    return { name: a[13] || sym, price: +a[0], pct: +a[1], change: null, ccy: 'USD' };
  }
  const a = raw.split('~');
  if (sym.startsWith('wh')) return { name: sym, price: +a[3], pct: null, change: null, ccy: 'USD' };
  const ccy: Currency = sym.startsWith('us') ? 'USD' : sym.startsWith('hk') ? 'HKD' : 'CNY';
  return { name: a[1], price: +a[3], change: +a[31], pct: +a[32], ccy };
}

export async function fetchStockQuotes(
  holdings: Holding[],
  currentFx: FxRates,
): Promise<{ quotes: Map<string, Quote>; fx: FxRates }> {
  const syms = [
    ...new Set(
      holdings
        .filter((h) => h.sym && !h.sym.startsWith('cg_'))
        .map((h) => h.sym!),
    ),
  ];
  const all = [...syms, ...INDEXES, 'whUSDCNY', 'whUSDHKD'];
  const newQuotes = new Map<string, Quote>();
  const newFx: FxRates = { ...currentFx };

  try {
    await jsonp('https://qt.gtimg.cn/q=' + all.join(',') + '&_=' + Date.now(), 'GBK');
    for (const sym of all) {
      const raw = window['v_' + sym];
      if (raw === undefined) continue;
      const q = parseQuote(sym, raw);
      if (!q) continue;
      if (sym === 'whUSDCNY') {
        if (q.price > 0) newFx.USDCNY = q.price;
      } else if (sym === 'whUSDHKD') {
        if (q.price > 0) newFx.USDHKD = q.price;
      } else {
        newQuotes.set(sym, q);
      }
    }
  } catch {
    // quote fetch failed, return empty
  }

  return { quotes: newQuotes, fx: newFx };
}

export async function fetchCryptoQuotes(
  holdings: Holding[],
): Promise<Map<string, Quote>> {
  const ids = [
    ...new Set(
      holdings
        .filter((h) => h.sym && h.sym.startsWith('cg_'))
        .map((h) => h.sym!.slice(3)),
    ),
  ];
  if (!ids.length) return new Map();

  const result = new Map<string, Quote>();
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
        ids.join(',') +
        '&vs_currencies=usd&include_24hr_change=true',
    );
    const j = await r.json();
    for (const id of ids) {
      const d = j[id];
      if (!d) continue;
      const code =
        Object.entries(CG_MAP).find(([, v]) => v === id)?.[0] ?? id;
      result.set('cg_' + id, {
        name: code,
        price: d.usd,
        pct: d.usd_24h_change,
        change: d.usd * d.usd_24h_change / (100 + d.usd_24h_change),
        ccy: 'USD',
      });
    }
  } catch {
    // crypto fetch failed
  }
  return result;
}
