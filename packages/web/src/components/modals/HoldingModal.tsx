import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Holding,
  SymbolHolding,
  ManualHolding,
  MarketItem,
  CategoryKey,
  Currency,
} from '@wealthdeck/shared';
import { CATS, CG_MAP, CG_LIST } from '@wealthdeck/shared';
import ModalOverlay from './ModalOverlay';
import SearchSuggest from '../shared/SearchSuggest';
import styles from '../../styles/modals.module.css';

export interface HoldingModalProps {
  show: boolean;
  onClose: () => void;
  editHolding: Holding | null;
  defaultCat?: CategoryKey;
  onSave: (holding: Holding) => void;
}

const CURRENCIES: Currency[] = ['USD', 'CNY', 'HKD'];

const HoldingModal: React.FC<HoldingModalProps> = ({
  show,
  onClose,
  editHolding,
  defaultCat,
  onSave,
}) => {
  const [cat, setCat] = useState<CategoryKey>('equity');

  // Crypto search fields (另类资产 crypto mode)
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{
    sym: string;
    name: string;
    kind?: string;
  } | null>(null);
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  // Manual fields
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [ccy, setCcy] = useState<Currency>('USD');
  const [costM, setCostM] = useState('');

  // 另类资产 sub-mode
  const [otherMode, setOtherMode] = useState<'crypto' | 'manual'>('crypto');

  useEffect(() => {
    if (!show) return;

    if (editHolding) {
      const h = editHolding;
      setCat(h.cat);

      if (h.sym) {
        setOtherMode('crypto');
        setSearch(h.name);
        setSelected({ sym: h.sym, name: h.name, kind: (h as SymbolHolding).kind });
        setQty(String((h as SymbolHolding).qty));
        setCost((h as SymbolHolding).cost ? String((h as SymbolHolding).cost) : '');
      } else {
        if (h.cat === 'other') setOtherMode('manual');
        const m = h as ManualHolding;
        setName(m.name);
        setVal(String(m.val));
        setCcy(m.ccy);
        setCostM(m.costM ? String(m.costM) : '');
      }
    } else {
      setCat(defaultCat || 'equity');
      setSearch('');
      setSelected(null);
      setQty('');
      setCost('');
      setName('');
      setVal('');
      setCcy('USD');
      setCostM('');
      setOtherMode('crypto');
    }
  }, [show, editHolding, defaultCat]);

  const showCryptoFields = cat === 'other' && otherMode === 'crypto';

  const items: MarketItem[] = useMemo(() => {
    return showCryptoFields ? CG_LIST : [];
  }, [showCryptoFields]);

  const handleSelect = useCallback((item: MarketItem) => {
    setSelected({ sym: item.sym, name: item.name, kind: item.kind });
  }, []);

  const handleSave = useCallback(() => {
    if (showCryptoFields) {
      let sym = selected?.sym || '';
      const t = search.trim();

      if (!sym) {
        if (!t) {
          alert('请选择或输入代码');
          return;
        }
        const id = CG_MAP[t.toUpperCase()];
        if (!id) {
          alert('暂支持：' + Object.keys(CG_MAP).join('/'));
          return;
        }
        sym = 'cg_' + id;
      }

      if (!Number(qty)) {
        alert('请输入数量');
        return;
      }

      const h: SymbolHolding = {
        id: editHolding?.id || 'h' + Date.now(),
        cat: 'other',
        account: 'main',
        sym,
        kind: 'crypto',
        name: t || sym,
        qty: Number(qty),
        cost: Number(cost) || null,
      };
      onSave(h);
    } else {
      const costNum = Number(costM) || 0;
      const valNum = Number(val) || costNum;
      if (!name.trim() || !valNum) {
        alert('请填写名称与买入金额');
        return;
      }

      const h: ManualHolding = {
        id: editHolding?.id || 'h' + Date.now(),
        cat,
        account: 'main',
        name: name.trim(),
        val: valNum,
        ccy,
        costM: costNum || null,
        coupon: null,
      };
      onSave(h);
    }
  }, [
    cat, selected, search, qty, cost,
    showCryptoFields, name, val, ccy, costM,
    editHolding, onSave,
  ]);

  const title = editHolding ? '编辑资产' : '添加资产';

  return (
    <ModalOverlay show={show} onClose={onClose}>
      <h2>{title}</h2>

      <div className={styles.f}>
        <label>资产类别</label>
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryKey)}>
          {(Object.keys(CATS) as CategoryKey[]).map((k) => (
            <option key={k} value={k}>
              {CATS[k].label}
            </option>
          ))}
        </select>
      </div>

      {cat === 'other' && (
        <div className={styles.f}>
          <label>录入方式</label>
          <select value={otherMode} onChange={(e) => setOtherMode(e.target.value as 'crypto' | 'manual')}>
            <option value="crypto">加密货币（自动行情）</option>
            <option value="manual">手动估值</option>
          </select>
        </div>
      )}

      {showCryptoFields && (
        <div>
          <div className={styles.f}>
            <label>搜索 / 代码</label>
            <SearchSuggest
              value={search}
              onChange={(v) => {
                setSearch(v);
                setSelected(null);
              }}
              placeholder="如 BTC / ETH / SOL"
              items={items}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
          <div className={styles.row2}>
            <div className={styles.f}>
              <label>数量</label>
              <input
                type="number"
                step="any"
                placeholder="100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className={styles.f}>
              <label>单位成本 USD（可选）</label>
              <input
                type="number"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {!showCryptoFields && (
        <div>
          <div className={styles.f}>
            <label>名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={cat === 'equity' ? '如：某公司股份' : cat === 'other' ? '如：黄金实物 / 收藏品' : '如：基金LP份额'}
            />
          </div>
          <div className={styles.f}>
            <label>币种</label>
            <select value={ccy} onChange={(e) => setCcy(e.target.value as Currency)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.f}>
            <label>买入金额</label>
            <input
              type="number"
              step="any"
              value={costM}
              onChange={(e) => setCostM(e.target.value)}
              placeholder="总投入成本"
            />
          </div>
          <div className={styles.f}>
            <label>当前估值（可选，不填则等于买入金额）</label>
            <input
              type="number"
              step="any"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="最新估值"
            />
          </div>
        </div>
      )}

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

export default HoldingModal;
