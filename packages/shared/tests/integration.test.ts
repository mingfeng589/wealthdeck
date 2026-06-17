/**
 * Integration test: simulate 3 records per module, verify calc logic & consistency.
 *
 * Run: npx tsx packages/shared/tests/integration.test.ts
 *
 * Categories: equity (权益), pe_equity (私募股权), pe_debt (私募债权), other (另类资产)
 */
import type {
  SymbolHolding,
  ManualHolding,
  Holding,
  Quote,
  FxRates,
  Goal,
  Policy,
  Profile,
} from '../src/types';
import { valueOf, goalCash, polCVTotal } from '../src/calc/valuation';
import { inBase, toUSD, fromUSD } from '../src/calc/currency';
import { cls, expRetOf, volOf, divOf, defRho, computePortfolioSigma } from '../src/calc/risk';
import { computePortfolioScore } from '../src/calc/scoring';
import { computeInsuranceChecks } from '../src/calc/insurance';
import { goalProjection, requiredMonthly } from '../src/calc/goals';

const FX: FxRates = { USDCNY: 7.25, USDHKD: 7.8 };
const BASE = 'USD' as const;

let pass = 0;
let fail = 0;

function assert(cond: boolean, label: string) {
  if (cond) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ FAIL: ${label}`);
  }
}

function near(a: number, b: number, tol = 0.01): boolean {
  return Math.abs(a - b) < tol;
}

// ═══════════════════════════════════════════════════════════════
// 1. EQUITY (权益) × 3 — manual holdings
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 1. Equity Holdings (权益) ═══');

const holdings_equity: ManualHolding[] = [
  { id: 'h1', cat: 'equity', account: 'main', name: 'A公司股份', val: 500000, ccy: 'CNY', costM: 300000, coupon: null },
  { id: 'h2', cat: 'equity', account: 'main', name: 'B公司股份', val: 200000, ccy: 'USD', costM: 150000, coupon: null },
  { id: 'h3', cat: 'equity', account: 'main', name: 'C公司期权', val: 80000, ccy: 'HKD', costM: 50000, coupon: null },
];

const quotes = new Map<string, Quote>();

// A公司: 500,000 CNY / 7.25 = $68,965.52 USD
const v1 = valueOf(holdings_equity[0], quotes, BASE, FX);
assert(near(v1.val, 500000 / 7.25, 1), `A公司 val = $${(500000 / 7.25).toFixed(0)} (got ${v1.val.toFixed(2)})`);
assert(v1.day === 0, `Manual holding day change = 0`);
assert(v1.price === null, `Manual holding price = null`);
assert(near(v1.cost!, 300000 / 7.25, 1), `A公司 cost = $${(300000 / 7.25).toFixed(0)} (got ${v1.cost?.toFixed(2)})`);

// B公司: $200,000 USD
const v2 = valueOf(holdings_equity[1], quotes, BASE, FX);
assert(near(v2.val, 200000), `B公司 val = $200,000 (got ${v2.val.toFixed(2)})`);

// C公司: 80,000 HKD / 7.8 = $10,256.41 USD
const v3 = valueOf(holdings_equity[2], quotes, BASE, FX);
assert(near(v3.val, 80000 / 7.8, 1), `C公司 val = $${(80000 / 7.8).toFixed(0)} (got ${v3.val.toFixed(2)})`);

// ═══════════════════════════════════════════════════════════════
// 2. PE_EQUITY (私募股权) × 3
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 2. PE Equity Holdings (私募股权) ═══');

const holdings_pe_eq: ManualHolding[] = [
  { id: 'h4', cat: 'pe_equity', account: 'main', name: 'PE基金A', val: 1000000, ccy: 'USD', costM: 800000, coupon: null },
  { id: 'h5', cat: 'pe_equity', account: 'main', name: 'PE基金B', val: 500000, ccy: 'USD', costM: 500000, coupon: null },
  { id: 'h6', cat: 'pe_equity', account: 'main', name: 'VC基金C', val: 300000, ccy: 'CNY', costM: 300000, coupon: null },
];

const v4 = valueOf(holdings_pe_eq[0], quotes, BASE, FX);
assert(near(v4.val, 1000000), `PE基金A val = $1,000,000 (got ${v4.val.toFixed(2)})`);
assert(near(v4.cost!, 800000), `PE基金A cost = $800,000 (got ${v4.cost?.toFixed(2)})`);

const v5 = valueOf(holdings_pe_eq[1], quotes, BASE, FX);
assert(near(v5.val, 500000), `PE基金B val = $500,000 (got ${v5.val.toFixed(2)})`);

const v6 = valueOf(holdings_pe_eq[2], quotes, BASE, FX);
assert(near(v6.val, 300000 / 7.25, 1), `VC基金C val = $${(300000 / 7.25).toFixed(0)} (got ${v6.val.toFixed(2)})`);

// ═══════════════════════════════════════════════════════════════
// 3. PE_DEBT (私募债权) × 3
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 3. PE Debt Holdings (私募债权) ═══');

const holdings_pe_debt: ManualHolding[] = [
  { id: 'h7', cat: 'pe_debt', account: 'main', name: '信托A', val: 500000, ccy: 'USD', costM: 500000, coupon: null },
  { id: 'h8', cat: 'pe_debt', account: 'main', name: '债权LP B', val: 200000, ccy: 'USD', costM: 200000, coupon: null },
  { id: 'h9', cat: 'pe_debt', account: 'main', name: '夹层基金C', val: 100000, ccy: 'USD', costM: 100000, coupon: null },
];

const v7 = valueOf(holdings_pe_debt[0], quotes, BASE, FX);
assert(near(v7.val, 500000), `信托A val = $500,000 (got ${v7.val.toFixed(2)})`);
const v8 = valueOf(holdings_pe_debt[1], quotes, BASE, FX);
assert(near(v8.val, 200000), `债权LP B val = $200,000 (got ${v8.val.toFixed(2)})`);
const v9 = valueOf(holdings_pe_debt[2], quotes, BASE, FX);
assert(near(v9.val, 100000), `夹层基金C val = $100,000 (got ${v9.val.toFixed(2)})`);

// ═══════════════════════════════════════════════════════════════
// 4. OTHER (另类资产) × 3 — crypto (API) + manual
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 4. Other Holdings (另类资产) ═══');

const holdings_other: Holding[] = [
  { id: 'h10', cat: 'other', account: 'main', sym: 'cg_bitcoin', kind: 'crypto', name: 'BTC', qty: 2, cost: 30000 } as SymbolHolding,
  { id: 'h11', cat: 'other', account: 'main', sym: 'cg_ethereum', kind: 'crypto', name: 'ETH', qty: 50, cost: 1800 } as SymbolHolding,
  { id: 'h12', cat: 'other', account: 'main', name: '黄金实物', val: 50000, ccy: 'USD', costM: 40000, coupon: null } as ManualHolding,
];

const cryptoQuotes = new Map<string, Quote>([
  ['cg_bitcoin', { name: 'BTC', price: 67000, pct: -1.5, change: -1020.3, ccy: 'USD' }],
  ['cg_ethereum', { name: 'ETH', price: 1800, pct: 2.0, change: 35.29, ccy: 'USD' }],
]);

// BTC: 2 × 67,000 = $134,000
const v10 = valueOf(holdings_other[0], cryptoQuotes, BASE, FX);
assert(near(v10.val, 134000), `BTC val = $134,000 (got ${v10.val.toFixed(2)})`);
const btcDay = 2 * -1020.3;
assert(near(v10.day, btcDay, 1), `BTC day = $${btcDay.toFixed(0)} (got ${v10.day.toFixed(2)})`);
assert(near(v10.cost!, 60000), `BTC cost = $60,000 (got ${v10.cost?.toFixed(2)})`);

// ETH: 50 × 1,800 = $90,000
const v11 = valueOf(holdings_other[1], cryptoQuotes, BASE, FX);
assert(near(v11.val, 90000), `ETH val = $90,000 (got ${v11.val.toFixed(2)})`);
assert(v11.liveName === 'ETH', `ETH liveName = ETH`);

// 黄金实物 manual: $50,000
const v12 = valueOf(holdings_other[2], cryptoQuotes, BASE, FX);
assert(near(v12.val, 50000), `黄金实物 val = $50,000 (got ${v12.val.toFixed(2)})`);

// ═══════════════════════════════════════════════════════════════
// 5. CLASSIFICATION (cls) — verify each category maps correctly
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 5. Asset Classification (cls) ═══');

assert(cls(holdings_equity[0]).g === 'equity', `A公司 → equity`);
assert(cls(holdings_equity[1]).g === 'equity', `B公司 → equity`);
assert(cls(holdings_pe_eq[0]).g === 'pe_equity', `PE基金A → pe_equity`);
assert(cls(holdings_pe_eq[1]).g === 'pe_equity', `PE基金B → pe_equity`);
assert(cls(holdings_pe_debt[0]).g === 'pe_debt', `信托A → pe_debt`);
assert(cls(holdings_pe_debt[2]).g === 'pe_debt', `夹层基金C → pe_debt`);
assert(cls(holdings_other[0] as SymbolHolding).g === 'crypto', `BTC → crypto`);
assert(cls(holdings_other[1] as SymbolHolding).g === 'crypto', `ETH → crypto`);
assert(cls(holdings_other[2]).g === 'other', `黄金实物 → other`);

// ═══════════════════════════════════════════════════════════════
// 6. RISK ENGINE — expRet, vol, div, correlation, portfolio sigma
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 6. Risk Engine ═══');

const cEquity = cls(holdings_equity[0]);
const cPE = cls(holdings_pe_eq[0]);
const cPEDebt = cls(holdings_pe_debt[0]);
const cBTC = cls(holdings_other[0] as SymbolHolding);
const cOther = cls(holdings_other[2]);

assert(near(expRetOf(cEquity), 8), `权益 exp ret = 8% (got ${expRetOf(cEquity)})`);
assert(near(expRetOf(cPE), 10), `PE股权 exp ret = 10% (got ${expRetOf(cPE)})`);
assert(near(expRetOf(cPEDebt), 6), `PE债权 exp ret = 6% (got ${expRetOf(cPEDebt)})`);
assert(near(expRetOf(cBTC), 0), `BTC exp ret = 0% (got ${expRetOf(cBTC)})`);

assert(near(volOf(cEquity), 30), `权益 vol = 30% (got ${volOf(cEquity)})`);
assert(near(volOf(cPE), 20), `PE股权 vol = 20% (got ${volOf(cPE)})`);
assert(near(volOf(cPEDebt), 8), `PE债权 vol = 8% (got ${volOf(cPEDebt)})`);
assert(near(volOf(cBTC), 65), `BTC vol = 65% (got ${volOf(cBTC)})`);

assert(near(divOf(cEquity), 2), `权益 div = 2% (got ${divOf(cEquity)})`);
assert(divOf(cBTC) === 0, `BTC div = 0%`);

// Correlations
assert(near(defRho(cEquity, cPE), 0.6), `Equity-PE rho = 0.6`);
assert(near(defRho(cEquity, cPEDebt), 0.3), `Equity-PEDebt rho = 0.3`);
assert(near(defRho(cPE, cPEDebt), 0.4), `PE-PEDebt rho = 0.4`);

// Portfolio sigma with 3 items
const items = [
  { w: 0.4, c: cEquity },
  { w: 0.3, c: cPEDebt },
  { w: 0.3, c: cBTC },
];
const sigma = computePortfolioSigma(items, null);
assert(sigma > 0 && sigma < 100, `Portfolio sigma = ${sigma.toFixed(2)}% (reasonable range)`);
assert(sigma > 10, `Portfolio sigma > 10% (crypto weight, got ${sigma.toFixed(2)})`);

// ═══════════════════════════════════════════════════════════════
// 7. CURRENCY CONVERSION
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 7. Currency Conversion ═══');

assert(near(toUSD(725, 'CNY', FX), 100), `725 CNY → $100 USD`);
assert(near(toUSD(780, 'HKD', FX), 100), `780 HKD → $100 USD`);
assert(near(toUSD(100, 'USD', FX), 100), `100 USD → $100 USD`);
assert(near(fromUSD(100, 'CNY', FX), 725), `$100 USD → 725 CNY`);
assert(near(inBase(7250, 'CNY', 'USD', FX), 1000), `inBase 7250 CNY → $1000 USD`);
assert(near(inBase(7800, 'HKD', 'USD', FX), 1000), `inBase 7800 HKD → $1000 USD`);

// ═══════════════════════════════════════════════════════════════
// 8. GOALS — 3 goals with ledger entries
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 8. Goals (投资目标) ═══');

const goals: Goal[] = [
  {
    id: 'g1', type: 'retire', name: '退休', target: 2000000, year: 2050,
    ret: 7, monthly: 5000, ledger: [
      { date: '2024-01-01', from: '工资', amt: 50000, ccy: 'USD', note: '年终奖' },
      { date: '2024-06-01', from: '工资', amt: 30000, ccy: 'USD', note: '' },
    ],
    ageNow: 35, ageRet: 60, spend: 8000, pension: 2000,
  },
  {
    id: 'g2', type: 'edu', name: '子女教育', target: 500000, year: 2040,
    ret: 5, monthly: 2000, ledger: [
      { date: '2024-03-01', from: '储蓄', amt: 100000, ccy: 'CNY', note: '初始' },
    ],
  },
  {
    id: 'g3', type: 'home', name: '购房首付', target: 300000, year: 2028,
    ret: 3, monthly: 3000, ledger: [],
  },
];

const gc1 = goalCash(goals[0], BASE, FX);
assert(near(gc1, 80000), `退休 goalCash = $80,000 (got ${gc1.toFixed(2)})`);

const gc2 = goalCash(goals[1], BASE, FX);
assert(near(gc2, 100000 / 7.25, 1), `教育 goalCash = $${(100000 / 7.25).toFixed(0)} (got ${gc2.toFixed(2)})`);

const gc3 = goalCash(goals[2], BASE, FX);
assert(gc3 === 0, `购房 goalCash = $0`);

const proj = goalProjection(goals[0], gc1);
assert(proj.pts.length > 0, `退休 projection has ${proj.pts.length} points`);
assert(proj.end > gc1, `退休 projection end > current balance`);

const rm = requiredMonthly(goals[2], 0);
assert(rm > 0, `购房 requiredMonthly = $${rm.toFixed(0)}/mo (positive)`);

// ═══════════════════════════════════════════════════════════════
// 9. POLICIES — 3 insurance policies
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 9. Insurance Policies (保险) ═══');

const policies: Policy[] = [
  { id: 'p1', type: 'ci', insured: '张三', name: '重疾险A', company: '平安',
    sum: 500000, sumCcy: 'CNY', prem: 8000, premCcy: 'CNY', cv: 30000, cvCcy: 'CNY', note: '' },
  { id: 'p2', type: 'life', insured: '张三', name: '定期寿险', company: '友邦',
    sum: 3000000, sumCcy: 'CNY', prem: 5000, premCcy: 'CNY', cv: 0, cvCcy: 'CNY', note: '' },
  { id: 'p3', type: 'med', insured: '李四', name: '百万医疗', company: '众安',
    sum: 6000000, sumCcy: 'CNY', prem: 1500, premCcy: 'CNY', cv: 0, cvCcy: 'CNY', note: '' },
];

const cvTotal = polCVTotal(policies, BASE, FX);
assert(near(cvTotal, 30000 / 7.25, 1), `保单CV合计 = $${(30000 / 7.25).toFixed(0)} (got ${cvTotal.toFixed(2)})`);

const profile: Profile = { income: 300000, spend: 200000, debt: 1000000 };
const checks = computeInsuranceChecks({ profile, policies, cash: 0, baseCcy: 'CNY', fx: FX });
assert(checks.length > 0, `Insurance checks returned ${checks.length} items`);

const emergencyCheck = checks.find(c => c.includes('应急金'));
assert(emergencyCheck !== undefined && emergencyCheck.includes('🚨'), `应急金 warning triggered (cash=0)`);

const ciCheck = checks.find(c => c.includes('重疾'));
assert(ciCheck !== undefined && ciCheck.includes('⚠️'), `重疾保额不足 warning (500k < 1.5M)`);

const medWarning = checks.find(c => c.includes('医疗险'));
assert(medWarning === undefined, `有医疗险记录，不应有医疗险缺失告警`);

// ═══════════════════════════════════════════════════════════════
// 10. SCORING — portfolio health score
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 10. Portfolio Scoring (组合评分) ═══');

const allH: Holding[] = [...holdings_equity, ...holdings_pe_eq, ...holdings_pe_debt, ...holdings_other];
const allQuotes = new Map([...quotes, ...cryptoQuotes]);
const allRows = allH.map(h => {
  const v = valueOf(h, allQuotes, BASE, FX);
  return { h, val: v.val, liveName: v.liveName };
});
const totalVal = allRows.reduce((s, r) => s + r.val, 0);
const catSet = new Set(allRows.filter(r => r.val > 0).map(r => r.h.cat));

const score = computePortfolioScore({
  total: totalVal,
  rows: allRows,
  catSet,
  corrCache: null,
});

assert(score.score >= 20 && score.score <= 100, `Score = ${score.score} (in range 20-100)`);
assert(score.grade.length > 0, `Grade = "${score.grade}"`);
assert(score.actions.length > 0, `${score.actions.length} action items`);
assert(score.subscores.length >= 2, `${score.subscores.length} subscores`);
assert(catSet.size === 4, `Category diversity = ${catSet.size} (should be 4)`);

// ═══════════════════════════════════════════════════════════════
// 11. NET WORTH CONSISTENCY
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 11. Net Worth Consistency ═══');

const holdingsTotal = allRows.reduce((s, r) => s + r.val, 0);
const gCashTotal = goals.reduce((s, g) => s + goalCash(g, BASE, FX), 0);
const polCv = polCVTotal(policies, BASE, FX);
const netWorth = holdingsTotal + gCashTotal + polCv;

console.log(`  Holdings: $${holdingsTotal.toFixed(0)}`);
console.log(`  Goal cash: $${gCashTotal.toFixed(0)}`);
console.log(`  Policy CV: $${polCv.toFixed(0)}`);
console.log(`  Net Worth: $${netWorth.toFixed(0)}`);

// Verify sub-totals by category
const byCat: Record<string, number> = {};
for (const r of allRows) {
  byCat[r.h.cat] = (byCat[r.h.cat] || 0) + r.val;
}
const sumByCat = Object.values(byCat).reduce((s, v) => s + v, 0);
assert(near(sumByCat, holdingsTotal, 1), `Sum by category ($${sumByCat.toFixed(0)}) = holdings total ($${holdingsTotal.toFixed(0)})`);

assert(allRows.filter(r => r.h.cat === 'equity').length === 3, `权益 has 3 items`);
assert(allRows.filter(r => r.h.cat === 'pe_equity').length === 3, `私募股权 has 3 items`);
assert(allRows.filter(r => r.h.cat === 'pe_debt').length === 3, `私募债权 has 3 items`);
assert(allRows.filter(r => r.h.cat === 'other').length === 3, `另类资产 has 3 items`);

// Manual cross-check
const manualCheck =
  (500000 / 7.25) +    // A公司
  200000 +              // B公司
  (80000 / 7.8) +      // C公司
  1000000 +             // PE基金A
  500000 +              // PE基金B
  (300000 / 7.25) +    // VC基金C
  500000 +              // 信托A
  200000 +              // 债权LP B
  100000 +              // 夹层基金C
  134000 +              // BTC
  90000 +               // ETH
  50000;                // 黄金
assert(near(holdingsTotal, manualCheck, 5), `Holdings cross-check: $${holdingsTotal.toFixed(0)} ≈ $${manualCheck.toFixed(0)}`);

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════');
console.log(`  TOTAL: ${pass + fail} tests | ✅ ${pass} passed | ❌ ${fail} failed`);
console.log('══════════════════════════════════\n');

if (fail > 0) process.exit(1);
