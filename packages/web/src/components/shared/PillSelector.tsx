import React from 'react';

export interface PillSelectorProps {
  items: Array<{ key: string; label: string }>;
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Reusable pill selector used by TaxLens and IdentityLens.
 * Matches wealthdeck.html .pillrow + .pill styles.
 */
const PillSelector: React.FC<PillSelectorProps> = ({
  items,
  active,
  onChange,
  className,
}) => (
  <div className={className} style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
    {items.map((item) => (
      <button
        key={item.key}
        onClick={() => onChange(item.key)}
        style={{
          padding: '7px 14px',
          borderRadius: 18,
          border: `1px solid ${item.key === active ? 'var(--accent)' : 'var(--line)'}`,
          background: item.key === active ? 'var(--accent)' : 'var(--card)',
          color: item.key === active ? '#fff' : 'inherit',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export default PillSelector;
