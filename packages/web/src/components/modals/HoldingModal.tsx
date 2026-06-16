import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Holding,
  SymbolHolding,
  ManualHolding,
  Goal,
  Rankings,
  MarketItem,
  CategoryKey,
  MarketCode,
  Currency,
  AssetKind,
} from '@wealthdeck/shared';
import { CATS, CG_MAP, GOAL_TYPES } from '@wealthdeck/shared';
import { marketList } from '../../services/rankings';
import ModalOverlay from './ModalOverlay';
import SearchSuggest from '../shared/SearchSuggest';
import styles from '../../styles/modals.module.css';

export interface HoldingModalProps {
  show: boolean;
  onClose: () => void;
  editHolding: Holding | null; // null = adding new
  defaultCat?: CategoryKey;
  defaultAccount?: string;
  goals: Goal[];
  rankings: Rankings | null;
  onSave: (holding: Holding) => void;
}

/** Commodity-linked futures symbols. */
const CMD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'hf_GC', label: '纽约黄金 COMEX Gold（美元/盎司）' },
  { value: 'hf_SI', label: '纽约白银 COMEX Silver（美元/盎司）' },
  { value: 'hf_CL', label: '纽约原油 WTI（美元/桶）' },
  { value: 'manual', label: '手动估值（不联动）' },
];

const MARKET_OPTIONS: Array<{ value: MarketCode; label: string }> = [
  { value: 'us', label: '美股 US（个股前1000 + 指数/ETF）' },
  { value: 'hk', label: '港股 HK（个股前1000 + 指数/ETF）' },
  { value: 'cn', label: 'A股 CN（个股前1000 + 指数/ETF）' },
  { value: 'cg', label: '加密货币 Crypto' },
];

const CURRENCIES: Currency[] = ['USD', 'CNY', 'HKD'];

/**
 * The holding create/edit modal -- the most complex modal in the app.
 *
 * Three display modes determined by category & commodity selector:
 *   1. Securities mode  (cat === 'securities')
 *   2. Commodity-linked (cat === 'commodity' && cmd !== 'manual')
 *   3. Manual mode      (all other cats, or commodity with manual)
 */
const HoldingModal: React.FC<HoldingModalProps> = ({
  show,
  onClose,
  editHolding,
  defaultCat,
  defaultAccount,
  goals,
  rankings,
  onSave,
}) => {
  // ---- form state ----
  const [cat, setCat] = useState<CategoryKey>('securities');
  const [account, setAccount] = useState<string>('main');

  // Securities fields
  const [market, setMarket] = useState<MarketCode>('us');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{
    sym: string;
    name: string;
    kind?: string;
  } | null>(null);
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  // Commodity-linked fields
  const [cmd, setCmd] = useState('hf_GC');
  const [cmdQty, setCmdQty] = useState('');
  const [cmdCost, setCmdCost] = useState('');

  // Manual fields
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [ccy, setCcy] = useState<Currency>('USD');
  const [costM, setCostM] = useState('');
  const [coupon, setCoupon] = useState('');

  // ---- populate form when opening ----
  useEffect(() => {
    if (!show) return;

    if (editHolding) {
      const h = editHolding;
      setCat(h.cat);
      setAccount(h.account || 'main');

      if (h.sym && h.sym.startsWith('hf_')) {
        // Commodity-linked edit
        setCmd(h.sym);
        setCmdQty(String((h as SymbolHolding).qty));
        setCmdCost((h as SymbolHolding).cost ? String((h as SymbolHolding).cost) : '');
      } else if (h.sym) {
        // Securities edit
        const sym = h.sym;
        const mk: MarketCode = sym.startsWith('cg_')
          ? 'cg'
          : sym.startsWith('us')
            ? 'us'
            : sym.startsWith('hk')
              ? 'hk'
              : 'cn';
        setMarket(mk);
        setSearch(h.name);
        setSelected({ sym: h.sym, name: h.name, kind: (h as SymbolHolding).kind });
        setQty(String((h as SymbolHolding).qty));
        setCost((h as SymbolHolding).cost ? String((h as SymbolHolding).cost) : '');
      } else {
        // Manual edit
        if (h.cat === 'commodity') setCmd('manual');
        const m = h as ManualHolding;
        setName(m.name);
        setVal(String(m.val));
        setCcy(m.ccy);
        setCostM(m.costM ? String(m.costM) : '');
        setCoupon(m.coupon ? String(m.coupon) : '');
      }
    } else {
      // Adding new -- reset all fields
      setCat(defaultCat || 'securities');
      setAccount(defaultAccount || 'main');
      setMarket('us');
      setSearch('');
      setSelected(null);
      setQty('');
      setCost('');
      setCmd('hf_GC');
      setCmdQty('');
      setCmdCost('');
      setName('');
      setVal('');
      setCcy('USD');
      setCostM('');
      setCoupon('');
    }
  }, [show, editHolding, defaultCat, defaultAccount]);

  // ---- derived visibility flags (mirrors syncFields lines 1245-1252) ----
  const isCmd = cat === 'commodity';
  const cmdManual = isCmd && cmd === 'manual';
  const showSecFields = cat === 'securities';
  const showCmdFields = isCmd;
  const showCmdQtyRow = isCmd && !cmdManual;
  const showManFields = cat !== 'securities' && !(isCmd && !cmdManual);
  const showCoupon = cat === 'bond';

  // ---- market list for search suggestions ----
  const items: MarketItem[] = useMemo(
    () => marketList(market, rankings),
    [market, rankings],
  );

  const handleSelect = useCallback((item: MarketItem) => {
    setSelected({ sym: item.sym, name: item.name, kind: item.kind });
  }, []);

  // ---- save (mirrors save() lines 1253-1277) ----
  const handleSave = useCallback(() => {
    const acct = account;

    if (cat === 'securities') {
      let sym = selected?.sym || '';
      let kind: AssetKind | undefined = (selected?.kind as AssetKind) || undefined;
      const t = search.trim();

      if (!sym) {
        if (!t) {
          alert('请选择或输入代码');
          return;
        }
        if (market === 'cg') {
          const id = CG_MAP[t.toUpperCase()];
          if (!id) {
            alert('暂支持：' + Object.keys(CG_MAP).join('/'));
            return;
          }
          sym = 'cg_' + id;
          kind = 'crypto';
        } else {
          // Auto-detect crypto even when market is not 'cg'
          const cgId = CG_MAP[t.toUpperCase()];
          if (cgId) {
            sym = 'cg_' + cgId;
            kind = 'crypto';
          } else if (market === 'us') {
            sym = 'us' + t.toUpperCase();
          } else if (market === 'hk') {
            sym = 'hk' + t.padStart(5, '0');
          } else {
            sym = (t.startsWith('6') || t.startsWith('5') ? 'sh' : 'sz') + t;
          }
        }
      }

      if (!Number(qty)) {
        alert('请输入数量');
        return;
      }

      const saveCat = kind === 'crypto' ? 'other' : cat;

      const h: SymbolHolding = {
        id: editHolding?.id || 'h' + Date.now(),
        cat: saveCat,
        account: acct,
        sym,
        kind,
        name: t || sym,
        qty: Number(qty),
        cost: Number(cost) || null,
      };
      onSave(h);
    } else if (cat === 'commodity' && cmd !== 'manual') {
      if (!Number(cmdQty)) {
        alert('请输入数量');
        return;
      }
      const cmdLabel =
        CMD_OPTIONS.find((o) => o.value === cmd)?.label.split('（')[0] || cmd;

      const h: SymbolHolding = {
        id: editHolding?.id || 'h' + Date.now(),
        cat,
        account: acct,
        sym: cmd,
        name: cmdLabel,
        qty: Number(cmdQty),
        cost: Number(cmdCost) || null,
      };
      onSave(h);
    } else {
      // Manual mode
      if (!name.trim() || !Number(val)) {
        alert('请填写名称与估值');
        return;
      }

      const h: ManualHolding = {
        id: editHolding?.id || 'h' + Date.now(),
        cat,
        account: acct,
        name: name.trim(),
        val: Number(val),
        ccy,
        costM: Number(costM) || null,
        coupon: Number(coupon) || null,
      };
      onSave(h);
    }
  }, [
    cat,
    account,
    selected,
    search,
    market,
    qty,
    cost,
    cmd,
    cmdQty,
    cmdCost,
    name,
    val,
    ccy,
    costM,
    coupon,
    editHolding,
    onSave,
  ]);

  const title = editHolding ? '编辑资产' : '添加资产';

  return (
    <ModalOverlay show={show} onClose={onClose}>
      <h2>{title}</h2>

      {/* Category & Account */}
      <div className={styles.row2}>
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
        <div className={styles.f}>
          <label>所属账户</label>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="main">主组合</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {GOAL_TYPES[g.type].icon} {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Securities fields ---- */}
      {showSecFields && (
        <div>
          <div className={styles.f}>
            <label>市场</label>
            <select
              value={market}
              onChange={(e) => {
                setMarket(e.target.value as MarketCode);
                setSelected(null);
              }}
            >
              {MARKET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.f}>
            <label>搜索 / 代码</label>
            <SearchSuggest
              value={search}
              onChange={(v) => {
                setSearch(v);
                // Clear selection when user types (mirrors original behavior)
                setSelected(null);
              }}
              placeholder="如 700 / 腾讯 / SOXL / 科创50 / BTC"
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
              <label>单位成本（原币种，可选）</label>
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

      {/* ---- Commodity-linked fields ---- */}
      {showCmdFields && (
        <div>
          <div className={styles.f}>
            <label>报价联动</label>
            <select value={cmd} onChange={(e) => setCmd(e.target.value)}>
              {CMD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {showCmdQtyRow && (
            <div className={styles.row2}>
              <div className={styles.f}>
                <label>数量（盎司/桶）</label>
                <input
                  type="number"
                  step="any"
                  value={cmdQty}
                  onChange={(e) => setCmdQty(e.target.value)}
                />
              </div>
              <div className={styles.f}>
                <label>单位成本 USD（可选）</label>
                <input
                  type="number"
                  step="any"
                  value={cmdCost}
                  onChange={(e) => setCmdCost(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Manual fields ---- */}
      {showManFields && (
        <div>
          <div className={styles.f}>
            <label>名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：上海某公寓 / 美元货基 / 基金LP份额"
            />
          </div>
          <div className={styles.row2}>
            <div className={styles.f}>
              <label>当前估值</label>
              <input
                type="number"
                step="any"
                value={val}
                onChange={(e) => setVal(e.target.value)}
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
          </div>
          <div className={styles.row2}>
            <div className={styles.f}>
              <label>成本（可选）</label>
              <input
                type="number"
                step="any"
                value={costM}
                onChange={(e) => setCostM(e.target.value)}
              />
            </div>
            {showCoupon && (
              <div className={styles.f}>
                <label>票息率 %（可选）</label>
                <input
                  type="number"
                  step="any"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Footer buttons ---- */}
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
