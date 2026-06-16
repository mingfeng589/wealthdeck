import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { MarketItem } from '@wealthdeck/shared';
import { KIND_TAG } from '@wealthdeck/shared';
import styles from '../../styles/modals.module.css';

export interface SearchSuggestProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  items: MarketItem[];
  onSelect: (item: MarketItem) => void;
  selected: { sym: string; name: string; kind?: string } | null;
}

/**
 * Reusable search input with dropdown suggestions.
 * Mirrors the `suggest()` / `pick()` behavior from lines 1279-1287 of the original.
 */
const SearchSuggest: React.FC<SearchSuggestProps> = ({
  value,
  onChange,
  placeholder,
  items,
  onSelect,
  selected,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hits = useMemo(() => {
    const t = value.trim().toLowerCase();
    if (!t) return [];
    return items
      .filter(
        (x) =>
          x.code.toLowerCase().includes(t) ||
          x.name.toLowerCase().includes(t),
      )
      .slice(0, 14);
  }, [value, items]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setOpen(true);
  };

  const handlePick = (item: MarketItem) => {
    onSelect(item);
    onChange(item.name);
    setOpen(false);
  };

  const showDropdown = open && hits.length > 0;

  return (
    <div ref={wrapRef}>
      <input
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (hits.length > 0) setOpen(true);
        }}
      />
      <div className={`${styles.sugg} ${showDropdown ? styles.suggShow : ''}`}>
        {hits.map((x) => (
          <div
            key={x.sym}
            className={styles.suggItem}
            onClick={() => handlePick(x)}
          >
            <span>{x.name}</span>
            <small>
              {x.code}
              {x.kind && KIND_TAG[x.kind] ? ` · ${KIND_TAG[x.kind]}` : ''}
            </small>
          </div>
        ))}
      </div>
      {selected && (
        <div className={styles.hint}>
          已选：{selected.name}（{selected.sym}）
          {selected.kind && KIND_TAG[selected.kind as keyof typeof KIND_TAG]
            ? ` · ${KIND_TAG[selected.kind as keyof typeof KIND_TAG]}`
            : ''}
        </div>
      )}
    </div>
  );
};

export default SearchSuggest;
