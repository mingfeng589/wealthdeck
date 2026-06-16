import type { MarketItem, AssetKind } from '../types';

/* ---- CoinGecko crypto mapping ---- */

export const CG_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  TRX: 'tron',
  TON: 'the-open-network',
  LINK: 'chainlink',
  LTC: 'litecoin',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  USDT: 'tether',
  USDC: 'usd-coin',
};

export const CG_LIST: MarketItem[] = Object.entries(CG_MAP).map(([c, id]) => ({
  sym: 'cg_' + id,
  code: c,
  name: c,
  kind: 'crypto' as const,
}));

/* ---- Major market indexes ---- */

export const INDEXES: string[] = ['sh000001', 'hkHSI', 'usDJI', 'usIXIC'];

/* ---- Index & ETF catalogue by market ---- */

export const IDX_ETF: Record<string, MarketItem[]> = {
  us: [
    { sym: 'usDJI', code: 'DJI', name: '道琼斯指数', kind: 'idx' },
    { sym: 'usIXIC', code: 'IXIC', name: '纳斯达克综合指数', kind: 'idx' },
    { sym: 'usINX', code: 'INX', name: '标普500指数', kind: 'idx' },
    { sym: 'usSPY', code: 'SPY', name: '标普500ETF-SPDR', kind: 'etf' },
    { sym: 'usVOO', code: 'VOO', name: '标普500ETF-Vanguard', kind: 'etf' },
    { sym: 'usIVV', code: 'IVV', name: '标普500ETF-iShares', kind: 'etf' },
    { sym: 'usQQQ', code: 'QQQ', name: '纳指100ETF', kind: 'etf' },
    { sym: 'usVTI', code: 'VTI', name: '全市场ETF-Vanguard', kind: 'etf' },
    { sym: 'usDIA', code: 'DIA', name: '道指ETF', kind: 'etf' },
    { sym: 'usIWM', code: 'IWM', name: '罗素2000ETF', kind: 'etf' },
    { sym: 'usSOXX', code: 'SOXX', name: '费城半导体ETF-iShares', kind: 'etf' },
    { sym: 'usSMH', code: 'SMH', name: '半导体ETF-VanEck', kind: 'etf' },
    { sym: 'usSOXL', code: 'SOXL', name: '半导体3倍做多 Direxion', kind: 'lev' },
    { sym: 'usSOXS', code: 'SOXS', name: '半导体3倍做空 Direxion', kind: 'lev' },
    { sym: 'usTQQQ', code: 'TQQQ', name: '纳指100三倍做多', kind: 'lev' },
    { sym: 'usSQQQ', code: 'SQQQ', name: '纳指100三倍做空', kind: 'lev' },
    { sym: 'usARKK', code: 'ARKK', name: 'ARK创新ETF', kind: 'etf' },
    { sym: 'usGLD', code: 'GLD', name: 'SPDR黄金ETF', kind: 'gold' },
    { sym: 'usSLV', code: 'SLV', name: 'iShares白银ETF', kind: 'silver' },
    { sym: 'usUSO', code: 'USO', name: '美国原油基金', kind: 'oil' },
    { sym: 'usTLT', code: 'TLT', name: '20年+美债ETF', kind: 'bond' },
    { sym: 'usIEF', code: 'IEF', name: '7-10年美债ETF', kind: 'bond' },
    { sym: 'usSHY', code: 'SHY', name: '1-3年美债ETF', kind: 'bond' },
    { sym: 'usHYG', code: 'HYG', name: '高收益债ETF', kind: 'bond' },
    { sym: 'usLQD', code: 'LQD', name: '投资级公司债ETF', kind: 'bond' },
    { sym: 'usAGG', code: 'AGG', name: '综合债券ETF', kind: 'bond' },
    { sym: 'usEEM', code: 'EEM', name: '新兴市场ETF', kind: 'etf' },
    { sym: 'usFXI', code: 'FXI', name: '中国大盘ETF', kind: 'etf' },
    { sym: 'usKWEB', code: 'KWEB', name: '中概互联ETF', kind: 'etf' },
    { sym: 'usMCHI', code: 'MCHI', name: 'MSCI中国ETF', kind: 'etf' },
    { sym: 'usYINN', code: 'YINN', name: '富时中国3倍做多', kind: 'lev' },
    { sym: 'usYANG', code: 'YANG', name: '富时中国3倍做空', kind: 'lev' },
    { sym: 'usIBIT', code: 'IBIT', name: 'iShares比特币ETF', kind: 'crypto' },
    { sym: 'usFBTC', code: 'FBTC', name: '富达比特币ETF', kind: 'crypto' },
    { sym: 'usETHA', code: 'ETHA', name: 'iShares以太坊ETF', kind: 'crypto' },
  ],
  hk: [
    { sym: 'hkHSI', code: 'HSI', name: '恒生指数', kind: 'idx' },
    { sym: 'hkHSCEI', code: 'HSCEI', name: '恒生中国企业指数', kind: 'idx' },
    { sym: 'hkHSTECH', code: 'HSTECH', name: '恒生科技指数', kind: 'idx' },
    { sym: 'hk02800', code: '02800', name: '盈富基金', kind: 'etf' },
    { sym: 'hk02828', code: '02828', name: '恒生中国企业ETF', kind: 'etf' },
    { sym: 'hk03033', code: '03033', name: '南方恒生科技ETF', kind: 'etf' },
    { sym: 'hk03067', code: '03067', name: '安硕恒生科技ETF', kind: 'etf' },
    { sym: 'hk02822', code: '02822', name: '南方富时中国A50ETF', kind: 'etf' },
    { sym: 'hk03188', code: '03188', name: '华夏沪深300ETF', kind: 'etf' },
    { sym: 'hk02840', code: '02840', name: 'SPDR金ETF', kind: 'gold' },
    { sym: 'hk03110', code: '03110', name: '恒生高股息ETF', kind: 'etf' },
  ],
  cn: [
    { sym: 'sh000001', code: '000001', name: '上证指数', kind: 'idx' },
    { sym: 'sh000300', code: '000300', name: '沪深300指数', kind: 'idx' },
    { sym: 'sh000905', code: '000905', name: '中证500指数', kind: 'idx' },
    { sym: 'sh000688', code: '000688', name: '科创50指数', kind: 'idx' },
    { sym: 'sz399001', code: '399001', name: '深证成指', kind: 'idx' },
    { sym: 'sz399006', code: '399006', name: '创业板指', kind: 'idx' },
    { sym: 'sh588000', code: '588000', name: '科创50ETF华夏', kind: 'etf' },
    { sym: 'sh510300', code: '510300', name: '沪深300ETF', kind: 'etf' },
    { sym: 'sh510500', code: '510500', name: '中证500ETF', kind: 'etf' },
    { sym: 'sz159915', code: '159915', name: '创业板ETF', kind: 'etf' },
    { sym: 'sh512480', code: '512480', name: '半导体ETF', kind: 'etf' },
    { sym: 'sh512760', code: '512760', name: '芯片ETF', kind: 'etf' },
    { sym: 'sh513100', code: '513100', name: '纳指ETF', kind: 'etf' },
    { sym: 'sh518880', code: '518880', name: '黄金ETF', kind: 'gold' },
    { sym: 'sh511010', code: '511010', name: '国债ETF', kind: 'bond' },
    { sym: 'sh511260', code: '511260', name: '十年国债ETF', kind: 'bond' },
  ],
};

/* ---- Fallback stock lists (built-in top stocks per market) ---- */

export const US_FALLBACK: MarketItem[] = [
  'AAPL|Apple',
  'MSFT|Microsoft',
  'NVDA|NVIDIA',
  'GOOGL|Alphabet',
  'AMZN|Amazon',
  'META|Meta',
  'TSLA|Tesla',
  'AVGO|Broadcom',
  'LLY|Eli Lilly',
  'JPM|JPMorgan',
  'V|Visa',
  'XOM|Exxon',
  'MA|Mastercard',
  'ORCL|Oracle',
  'COST|Costco',
  'NFLX|Netflix',
  'BAC|BofA',
  'CRM|Salesforce',
  'AMD|AMD',
  'KO|Coca-Cola',
  'WMT|Walmart',
  'ADBE|Adobe',
  'QCOM|Qualcomm',
  'INTC|Intel',
  'PLTR|Palantir',
  'COIN|Coinbase',
  'MSTR|MicroStrategy',
  'BABA|Alibaba ADR',
  'PDD|PDD',
  'TSM|TSMC',
  'MU|美光科技',
  'MRVL|迈威尔科技',
].map((s) => {
  const [c, n] = s.split('|');
  return { sym: 'us' + c, code: c, name: n };
});

export const HK_FALLBACK: MarketItem[] = [
  '09988|阿里巴巴-W',
  '00700|腾讯控股',
  '00981|中芯国际',
  '01299|友邦保险',
  '00388|香港交易所',
  '09992|泡泡玛特',
  '00883|中国海洋石油',
  '00992|联想集团',
  '02899|紫金矿业',
  '01810|小米集团-W',
  '03750|宁德时代',
  '03690|美团-W',
  '00005|汇丰控股',
  '01024|快手-W',
  '09999|网易-S',
  '00939|建设银行',
  '01211|比亚迪股份',
  '01398|工商银行',
  '00175|吉利汽车',
  '02318|中国平安',
  '09618|京东集团-SW',
  '09868|小鹏汽车-W',
  '00941|中国移动',
  '09888|百度集团-SW',
  '03988|中国银行',
  '02015|理想汽车-W',
  '00857|中国石油股份',
  '03968|招商银行',
  '02628|中国人寿',
].map((s) => {
  const [c, n] = s.split('|');
  return { sym: 'hk' + c, code: c, name: n };
});

export const CN_FALLBACK: MarketItem[] = [
  'sz300502|新易盛',
  'sz300308|中际旭创',
  'sh600487|亨通光电',
  'sz000725|京东方A',
  'sh600522|中天科技',
  'sh603986|兆易创新',
  'sz002384|东山精密',
  'sh688256|寒武纪',
  'sh688041|海光信息',
  'sh601138|工业富联',
  'sz300750|宁德时代',
  'sz002463|沪电股份',
  'sh688008|澜起科技',
  'sh600519|贵州茅台',
].map((s) => {
  const [c, n] = s.split('|');
  return { sym: c, code: c.slice(2), name: n };
});

/* ---- Display labels for asset kinds ---- */

export const KIND_TAG: Partial<Record<AssetKind, string>> = {
  idx: '📊指数',
  etf: 'ETF',
  lev: '⚡杠杆ETF',
  bond: '债券ETF',
  gold: '黄金',
  silver: '白银',
  oil: '原油',
  crypto: '加密ETF',
};
