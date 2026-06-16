import React, { useState, useRef } from 'react';
import type { Currency, LedgerEntry } from '@wealthdeck/shared';
import styles from '../../styles/plan.module.css';

export interface LedgerFormProps {
  ledgerFrom: string;
  onAdd: (entry: LedgerEntry) => void;
}

/**
 * Inline form for adding ledger entries to a goal.
 * Matches wealthdeck.html lines 917-924.
 */
const LedgerForm: React.FC<LedgerFormProps> = ({ ledgerFrom, onAdd }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState('');
  const [amt, setAmt] = useState('');
  const [ccy, setCcy] = useState<Currency>('CNY');
  const [note, setNote] = useState('');
  const amtRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const numAmt = Number(amt);
    if (!numAmt) {
      alert('请输入金额（支出/转投资用负数）');
      return;
    }
    onAdd({
      date: date || new Date().toISOString().slice(0, 10),
      from: from.trim(),
      amt: numAmt,
      ccy,
      note: note.trim(),
    });
    setFrom('');
    setAmt('');
    setNote('');
    amtRef.current?.focus();
  };

  return (
    <>
      <div className={styles.ledgerAdd}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          placeholder={ledgerFrom}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          ref={amtRef}
          type="number"
          step="any"
          placeholder="金额"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
        />
        <select value={ccy} onChange={(e) => setCcy(e.target.value as Currency)}>
          <option>CNY</option>
          <option>USD</option>
          <option>HKD</option>
        </select>
        <button className="btn sm primary" onClick={handleAdd}>
          记一笔
        </button>
      </div>
      <input
        className={styles.noteInput}
        placeholder="备注（可选，如：2026 新年红包）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </>
  );
};

export default LedgerForm;
