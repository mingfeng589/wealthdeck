import { useMemo, useState } from 'react';
import type { Policy } from '@wealthdeck/shared';
import { fmt, POL_TYPES, computeInsuranceChecks, inBase } from '@wealthdeck/shared';
import { useAppState } from '../../data/context';
import styles from '../../styles/more.module.css';

interface InsuranceSectionProps {
  onAddPolicy: () => void;
  onEditPolicy: (p: Policy) => void;
  onDeletePolicy: (id: string) => void;
}

export function InsuranceSection({ onAddPolicy, onEditPolicy, onDeletePolicy }: InsuranceSectionProps) {
  const { policies, profile, setProfile, baseCcy, fx } = useAppState();

  const [income, setIncome] = useState(String(profile.income || ''));
  const [spend, setSpend] = useState(String(profile.spend || ''));
  const [debt, setDebt] = useState(String(profile.debt || ''));

  const saveProfile = () => {
    setProfile({
      income: Number(income) || undefined,
      spend: Number(spend) || undefined,
      debt: Number(debt) || undefined,
    });
  };

  const checks = useMemo(
    () => computeInsuranceChecks({ profile, policies, cash: 0, baseCcy, fx }),
    [profile, policies, baseCcy, fx],
  );

  const prem = useMemo(
    () => policies.reduce((s, p) => s + inBase(p.prem, p.premCcy, baseCcy, fx), 0),
    [policies, baseCcy, fx],
  );
  const ciSum = useMemo(
    () => policies.filter((p) => p.type === 'ci').reduce((s, p) => s + inBase(p.sum, p.sumCcy, baseCcy, fx), 0),
    [policies, baseCcy, fx],
  );
  const lifeSum = useMemo(
    () => policies.filter((p) => p.type === 'life').reduce((s, p) => s + inBase(p.sum, p.sumCcy, baseCcy, fx), 0),
    [policies, baseCcy, fx],
  );
  const cvTotal = useMemo(
    () => policies.reduce((s, p) => s + (p.cv ? inBase(p.cv, p.cvCcy, baseCcy, fx) : 0), 0),
    [policies, baseCcy, fx],
  );

  const premPct = profile.income ? ((prem / profile.income) * 100).toFixed(1) + '% of income' : '';

  return (
    <div className={styles.card}>
      <h3>🛡️ 保险与健康保障 Insurance &amp; Protection</h3>
      <div className={styles.muted} style={{ marginBottom: 8 }}>
        填入家庭基础数据后，下方体检规则自动运行（数据仅存本机）：
      </div>

      <div className={styles.profileRow}>
        <input
          type="number"
          placeholder="家庭年收入（基准币）"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="number"
          placeholder="家庭年支出（基准币）"
          value={spend}
          onChange={(e) => setSpend(e.target.value)}
        />
        <input
          type="number"
          placeholder="家庭负债余额（房贷等）"
          value={debt}
          onChange={(e) => setDebt(e.target.value)}
        />
        <button className="btn sm primary" onClick={saveProfile}>保存</button>
      </div>

      <div className={styles.statgrid}>
        <div className={styles.stat}>
          <div className={styles.t}>年缴保费合计</div>
          <div className={styles.v}>{fmt(prem, baseCcy)}</div>
          <div className={styles.s}>{premPct}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.t}>重疾总保额</div>
          <div className={styles.v}>{fmt(ciSum, baseCcy)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.t}>寿险总保额</div>
          <div className={styles.v}>{fmt(lifeSum, baseCcy)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.t}>保单现金价值（计入净值）</div>
          <div className={styles.v}>{fmt(cvTotal, baseCcy)}</div>
        </div>
      </div>

      <ul className={styles.actions}>
        {checks.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <div className={styles.policyTitle}>
        <h3 style={{ margin: 0 }}>保单清单</h3>
        <button className={styles.catAdd} onClick={onAddPolicy}>＋</button>
      </div>

      {policies.length > 0 ? (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>类型</th>
              <th>保单 / 公司</th>
              <th>被保险人</th>
              <th>保额</th>
              <th>年缴保费</th>
              <th>现金价值</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onEditPolicy(p)}>
                <td>{POL_TYPES[p.type]}</td>
                <td>
                  <span className={styles.nm}>{p.name}</span>
                  <br />
                  <span className={styles.cd}>{p.company}</span>
                </td>
                <td>{p.insured}</td>
                <td>{fmt(p.sum, p.sumCcy)}</td>
                <td>{fmt(p.prem, p.premCcy)}</td>
                <td>{p.cv ? fmt(p.cv, p.cvCcy) : '—'}</td>
                <td>
                  <button
                    className={styles.act}
                    onClick={(e) => { e.stopPropagation(); onDeletePolicy(p.id); }}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.muted} style={{ padding: '12px 6px' }}>
          还没有保单记录。点 ＋ 添加重疾/寿险/医疗/意外/年金保单。
        </div>
      )}
    </div>
  );
}
