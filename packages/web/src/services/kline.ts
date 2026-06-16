import { jsonp } from './jsonp';

declare const window: Window & Record<string, unknown>;

interface KlinePoint {
  d: string;
  c: number;
}

function klineJsonp(code: string, i: number): Promise<KlinePoint[] | null> {
  return new Promise((resolve) => {
    const v = '__kl' + i + '_' + (Date.now() % 1e4);
    jsonp(
      `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?_var=${v}&param=${code},day,,,120,qfq`,
    )
      .then(() => {
        const d = window[v] as Record<string, Record<string, unknown>> | undefined;
        delete window[v];
        const k = d?.data?.[code] as Record<string, unknown> | undefined;
        const arr = (k?.qfqday ?? k?.day) as string[][] | undefined;
        resolve(
          arr
            ? arr.map((r) => ({ d: r[0], c: +r[2] }))
            : null,
        );
      })
      .catch(() => resolve(null));
  });
}

export async function stockSeries(
  sym: string,
  i: number,
): Promise<KlinePoint[] | null> {
  if (/^(sh|sz|hk)/.test(sym)) return klineJsonp(sym, i);
  if (sym.startsWith('us'))
    return (
      (await klineJsonp(sym + '.OQ', i)) ??
      (await klineJsonp(sym + '.N', i + 500)) ??
      (await klineJsonp(sym + '.AM', i + 900))
    );
  return null;
}

export async function cryptoSeries(id: string): Promise<KlinePoint[] | null> {
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=120&interval=daily`,
    );
    const j = await r.json();
    return (j.prices || []).map((p: [number, number]) => ({
      d: new Date(p[0]).toISOString().slice(0, 10),
      c: p[1],
    }));
  } catch {
    return null;
  }
}
