import type { Rankings, MarketItem, MarketCode } from '@wealthdeck/shared';
import { IDX_ETF, US_FALLBACK, HK_FALLBACK, CN_FALLBACK, CG_LIST } from '@wealthdeck/shared';
import { jsonp } from './jsonp';

declare const window: Window & Record<string, unknown>;

interface EmResponse {
  data?: {
    diff?: Array<Record<string, string | number>>;
  };
}

function emPage(market: string, pn: number): Promise<EmResponse | null> {
  return new Promise((resolve) => {
    const cb = '__em' + market + pn + (Date.now() % 1e4);
    (window as Record<string, unknown>)[cb] = (d: EmResponse) => {
      delete (window as Record<string, unknown>)[cb];
      resolve(d);
    };
    const fs =
      market === 'cn'
        ? 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23'
        : market === 'hk'
          ? 'm:128+t:3,m:128+t:4'
          : 'm:105,m:106,m:107';
    const fields = market === 'cn' ? 'f12,f13,f14' : 'f12,f14';
    jsonp(
      `https://push2.eastmoney.com/api/qt/clist/get?cb=${cb}&pn=${pn}&pz=200&po=1&np=1&fltt=2&invt=2&fid=f6&fs=${fs}&fields=${fields}`,
    ).catch(() => {
      delete (window as Record<string, unknown>)[cb];
      resolve(null);
    });
    setTimeout(() => {
      if ((window as Record<string, unknown>)[cb]) {
        delete (window as Record<string, unknown>)[cb];
        resolve(null);
      }
    }, 8000);
  });
}

function rowToItem(
  market: string,
  r: Record<string, string | number>,
): MarketItem | null {
  if (market === 'cn')
    return {
      sym: (r.f13 === 1 ? 'sh' : 'sz') + String(r.f12),
      code: String(r.f12),
      name: String(r.f14),
    };
  if (market === 'hk')
    return { sym: 'hk' + String(r.f12), code: String(r.f12), name: String(r.f14) };
  if (/[._]/.test(String(r.f12))) return null;
  return { sym: 'us' + String(r.f12), code: String(r.f12), name: String(r.f14) };
}

export async function refreshRankLists(): Promise<Rankings> {
  const ranks: Rankings = {
    us: US_FALLBACK.slice(),
    hk: HK_FALLBACK.slice(),
    cn: CN_FALLBACK.slice(),
    t: Date.now(),
  };

  for (const market of ['cn', 'hk', 'us'] as const) {
    try {
      const seen = new Set<string>();
      const list: MarketItem[] = [];
      for (let pn = 1; pn <= 5; pn++) {
        const d = await emPage(market, pn);
        if (!d?.data?.diff) break;
        for (const r of d.data.diff) {
          const it = rowToItem(market, r);
          if (it && !seen.has(it.sym)) {
            seen.add(it.sym);
            list.push(it);
          }
        }
        if (list.length >= 1000) break;
      }
      if (list.length) ranks[market] = list.slice(0, 1000);
    } catch {
      // keep fallback for this market
    }
  }
  ranks.t = Date.now();
  return ranks;
}

export function marketList(
  mk: MarketCode,
  ranks: Rankings | null,
): MarketItem[] {
  if (mk === 'cg') return CG_LIST;
  const rank =
    ranks && ranks[mk]?.length
      ? ranks[mk]
      : mk === 'us'
        ? US_FALLBACK
        : mk === 'hk'
          ? HK_FALLBACK
          : CN_FALLBACK;
  const cur = IDX_ETF[mk] || [];
  const curSyms = new Set(cur.map((x) => x.sym));
  return [...cur, ...rank.filter((x) => !curSyms.has(x.sym))];
}
