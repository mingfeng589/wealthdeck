import type { Currency, FxRates, Profile, Policy } from '../types';
import { inBase } from './currency';

export interface InsuranceCheckParams {
  profile: Profile;
  policies: Policy[];
  /** Total cash available (already in base currency). */
  cash: number;
  baseCcy: Currency;
  fx: FxRates;
}

/**
 * Run insurance-gap checks and return an array of diagnostic messages.
 *
 * Each message starts with an emoji indicator:
 *   - ✅ = check passed
 *   - ⚠️ = warning / gap detected
 *   - \u{1F6A8} = critical gap
 *
 * If no checks can be run (no profile data), a prompt to fill in
 * income/spend/debt is returned.
 */
export function computeInsuranceChecks(params: InsuranceCheckParams): string[] {
  const { profile, policies, cash, baseCcy, fx } = params;
  const checks: string[] = [];

  const prem = policies.reduce(
    (s, p) => s + inBase(p.prem, p.premCcy, baseCcy, fx),
    0,
  );
  const ci = policies
    .filter((p) => p.type === 'ci')
    .reduce((s, p) => s + inBase(p.sum, p.sumCcy, baseCcy, fx), 0);
  const life = policies
    .filter((p) => p.type === 'life')
    .reduce((s, p) => s + inBase(p.sum, p.sumCcy, baseCcy, fx), 0);

  if (profile.spend) {
    const months = cash / (profile.spend / 12);
    checks.push(
      months >= 6
        ? `✅ 应急金：现金可覆盖约 ${months.toFixed(0)} 个月支出（≥6 个月达标）。`
        : `\u{1F6A8} 应急金：现金仅覆盖约 ${months.toFixed(1)} 个月支出，建议保留 6 个月以上再做高风险投资。`,
    );
  }

  if (profile.income) {
    checks.push(
      ci >= profile.income * 5
        ? '✅ 重疾保障：总保额已达年收入 5 倍的常用基准。'
        : `⚠️ 重疾保障：总保额低于年收入 5 倍的常用基准——重疾的真实成本是「治疗费 + 3-5 年收入中断」。`,
    );
    checks.push(
      prem <= profile.income * 0.15
        ? '✅ 保费负担：年缴保费在年收入 15% 以内。'
        : '⚠️ 保费负担：年缴保费超过年收入 15%，注意现金流压力，优先保障型、压缩储蓄型。',
    );
  }

  if (profile.debt || profile.spend) {
    const need = (profile.debt || 0) + (profile.spend || 0) * 10;
    checks.push(
      life >= need
        ? '✅ 寿险保障：保额足以覆盖「负债 + 10 年家庭支出」。'
        : `⚠️ 寿险保障：家庭支柱保额建议 ≥ 负债 + 10 年支出，当前不足。定期寿险是最便宜的杠杆。`,
    );
  }

  if (!policies.some((p) => p.type === 'med'))
    checks.push(
      '⚠️ 未记录医疗险：百万医疗/高端医疗是最基础的防破产保障，建议优先配置。',
    );

  if (!checks.length)
    checks.push(
      '填写上方家庭年收入/支出/负债后，自动运行保障缺口体检。',
    );

  return checks;
}
