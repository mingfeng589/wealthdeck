import * as XLSX from 'xlsx';
import type { ExportData } from '@wealthdeck/shared';
import { CATS, GOAL_TYPES, POL_TYPES } from '@wealthdeck/shared';

const KIND_LABELS: Record<string, string> = {
  idx: '指数', etf: 'ETF', lev: '杠杆', bond: '债券',
  gold: '黄金', silver: '白银', oil: '原油', crypto: '加密货币',
};

export function exportToXlsx(data: ExportData): void {
  const wb = XLSX.utils.book_new();

  // 1. Holdings sheet
  const holdingsRows = data.holdings.map((h) => {
    const base = {
      '名称': h.name,
      '资产类别': CATS[h.cat]?.label ?? h.cat,
      '账户': h.account === 'main' ? '主组合' : h.account,
    };
    if (h.sym !== undefined) {
      return {
        ...base,
        '代码': h.sym,
        '资产类型': h.kind ? (KIND_LABELS[h.kind] ?? h.kind) : '',
        '数量': h.qty,
        '单位成本': h.cost ?? '',
        '币种': '',
        '手动估值': '',
        '票息': '',
      };
    } else {
      return {
        ...base,
        '代码': '',
        '资产类型': '',
        '数量': '',
        '单位成本': h.costM ?? '',
        '币种': h.ccy,
        '手动估值': h.val,
        '票息': h.coupon ?? '',
      };
    }
  });
  const wsHoldings = XLSX.utils.json_to_sheet(
    holdingsRows.length ? holdingsRows : [{ '名称': '（无数据）' }],
  );
  XLSX.utils.book_append_sheet(wb, wsHoldings, '持仓明细');

  // 2. Goals sheet
  const goalRows = data.goals.map((g) => ({
    '名称': g.name,
    '类型': GOAL_TYPES[g.type]?.label ?? g.type,
    '目标金额': g.target,
    '目标年份': g.year,
    '预期年化收益率(%)': g.ret,
    '月定投': g.monthly,
    '当前年龄': g.ageNow ?? '',
    '退休年龄': g.ageRet ?? '',
    '月支出': g.spend ?? '',
    '月养老金': g.pension ?? '',
  }));
  const wsGoals = XLSX.utils.json_to_sheet(
    goalRows.length ? goalRows : [{ '名称': '（无数据）' }],
  );
  XLSX.utils.book_append_sheet(wb, wsGoals, '投资目标');

  // 3. Ledger sheet (all goals' ledger entries combined)
  const ledgerRows: Record<string, unknown>[] = [];
  for (const g of data.goals) {
    for (const entry of g.ledger) {
      ledgerRows.push({
        '所属目标': g.name,
        '日期': entry.date,
        '来源': entry.from,
        '金额': entry.amt,
        '币种': entry.ccy,
        '备注': entry.note,
      });
    }
  }
  if (ledgerRows.length) {
    const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
    XLSX.utils.book_append_sheet(wb, wsLedger, '目标流水');
  }

  // 4. Policies sheet
  const policyRows = data.policies.map((p) => ({
    '保单名称': p.name,
    '类型': POL_TYPES[p.type] ?? p.type,
    '被保人': p.insured,
    '保险公司': p.company,
    '保额': p.sum,
    '保额币种': p.sumCcy,
    '年保费': p.prem,
    '保费币种': p.premCcy,
    '现金价值': p.cv,
    '现金价值币种': p.cvCcy,
    '备注': p.note,
  }));
  const wsPolicies = XLSX.utils.json_to_sheet(
    policyRows.length ? policyRows : [{ '保单名称': '（无数据）' }],
  );
  XLSX.utils.book_append_sheet(wb, wsPolicies, '保险保单');

  // 5. Profile sheet
  const wsProfile = XLSX.utils.json_to_sheet([{
    '年收入': data.profile.income ?? '',
    '年支出': data.profile.spend ?? '',
    '负债': data.profile.debt ?? '',
  }]);
  XLSX.utils.book_append_sheet(wb, wsProfile, '个人档案');

  // 6. History sheet
  const historyEntries = Object.entries(data.history).sort(([a], [b]) => a.localeCompare(b));
  const historyRows = historyEntries.map(([date, val]) => ({
    '日期': date,
    '净值(USD)': val,
  }));
  const wsHistory = XLSX.utils.json_to_sheet(
    historyRows.length ? historyRows : [{ '日期': '（无数据）' }],
  );
  XLSX.utils.book_append_sheet(wb, wsHistory, '净值历史');

  // 7. Swaps sheet
  if (data.swaps?.length) {
    const swapRows = data.swaps.map((s) => ({
      '日期': s.date,
      '原资产': s.fromName,
      '原类别': CATS[s.fromCat]?.label ?? s.fromCat,
      '原估值': s.fromVal,
      '币种': s.fromCcy,
      '新资产': s.toName,
      '备注': s.note,
    }));
    const wsSwaps = XLSX.utils.json_to_sheet(swapRows);
    XLSX.utils.book_append_sheet(wb, wsSwaps, '换仓记录');
  }

  // Download
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `wealthdeck-${today}.xlsx`);
}
