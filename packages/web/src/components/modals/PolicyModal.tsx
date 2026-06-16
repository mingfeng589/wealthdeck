import React, { useState, useEffect, useCallback } from 'react';
import type { Policy, PolicyType, Currency } from '@wealthdeck/shared';
import { POL_TYPES } from '@wealthdeck/shared';
import ModalOverlay from './ModalOverlay';
import styles from '../../styles/modals.module.css';

export interface PolicyModalProps {
  show: boolean;
  onClose: () => void;
  editPolicy: Policy | null;
  onSave: (policy: Policy) => void;
}

const CURRENCIES: Currency[] = ['CNY', 'USD', 'HKD'];

/**
 * Insurance policy create/edit modal -- mirrors lines 386-412 of the original HTML.
 *
 * Open/populate logic from `openPolicy()` lines 1072-1079.
 * Save logic from `savePolicy()` lines 1081-1086.
 */
const PolicyModal: React.FC<PolicyModalProps> = ({
  show,
  onClose,
  editPolicy,
  onSave,
}) => {
  const [type, setType] = useState<PolicyType>('ci');
  const [insured, setInsured] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [sum, setSum] = useState('');
  const [sumCcy, setSumCcy] = useState<Currency>('CNY');
  const [prem, setPrem] = useState('');
  const [premCcy, setPremCcy] = useState<Currency>('CNY');
  const [cv, setCv] = useState('');
  const [cvCcy, setCvCcy] = useState<Currency>('CNY');
  const [note, setNote] = useState('');

  // Populate form on open (mirrors openPolicy lines 1072-1079)
  useEffect(() => {
    if (!show) return;

    const p = editPolicy;
    setType(p ? p.type : 'ci');
    setInsured(p ? p.insured : '');
    setName(p ? p.name : '');
    setCompany(p ? p.company : '');
    setSum(p ? String(p.sum) : '');
    setSumCcy(p ? p.sumCcy : 'CNY');
    setPrem(p ? String(p.prem) : '');
    setPremCcy(p ? p.premCcy : 'CNY');
    setCv(p?.cv ? String(p.cv) : '');
    setCvCcy(p ? p.cvCcy : 'CNY');
    setNote(p?.note || '');
  }, [show, editPolicy]);

  // Save (mirrors savePolicy lines 1081-1086)
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      alert('请填写保单名称');
      return;
    }

    const p: Policy = {
      id: editPolicy?.id || 'p' + Date.now(),
      type,
      insured: insured.trim(),
      name: name.trim(),
      company: company.trim(),
      sum: Number(sum) || 0,
      sumCcy,
      prem: Number(prem) || 0,
      premCcy,
      cv: Number(cv) || 0,
      cvCcy,
      note: note.trim(),
    };

    onSave(p);
  }, [editPolicy, type, insured, name, company, sum, sumCcy, prem, premCcy, cv, cvCcy, note, onSave]);

  const title = editPolicy ? '编辑保单' : '添加保单';

  return (
    <ModalOverlay show={show} onClose={onClose}>
      <h2>{title}</h2>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as PolicyType)}>
            {(Object.keys(POL_TYPES) as PolicyType[]).map((k) => (
              <option key={k} value={k}>
                {POL_TYPES[k]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.f}>
          <label>被保险人</label>
          <input
            value={insured}
            onChange={(e) => setInsured(e.target.value)}
            placeholder="本人 / 配偶 / 孩子"
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>保单名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如 XX重疾2025"
          />
        </div>
        <div className={styles.f}>
          <label>保险公司</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>保额</label>
          <input
            type="number"
            step="any"
            value={sum}
            onChange={(e) => setSum(e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>保额币种</label>
          <select value={sumCcy} onChange={(e) => setSumCcy(e.target.value as Currency)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>年缴保费</label>
          <input
            type="number"
            step="any"
            value={prem}
            onChange={(e) => setPrem(e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>保费币种</label>
          <select value={premCcy} onChange={(e) => setPremCcy(e.target.value as Currency)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.f}>
          <label>当前现金价值（储蓄型，可选）</label>
          <input
            type="number"
            step="any"
            value={cv}
            onChange={(e) => setCv(e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>现金价值币种</label>
          <select value={cvCcy} onChange={(e) => setCvCcy(e.target.value as Currency)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.f}>
        <label>备注（缴费年限/到期日等）</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Footer */}
      <div className={styles.foot}>
        <button className="btn" type="button" onClick={onClose}>
          取消
        </button>
        <button className="btn primary" type="button" onClick={handleSave}>
          保存
        </button>
      </div>
    </ModalOverlay>
  );
};

export default PolicyModal;
