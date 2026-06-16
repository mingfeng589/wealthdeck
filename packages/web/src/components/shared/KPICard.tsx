import React from 'react';

export interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueClass?: string;
  subtitleClass?: string;
}

/**
 * Reusable KPI card component.
 * Matches wealthdeck.html .kpi styles.
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  valueClass,
  subtitleClass,
}) => (
  <div
    style={{
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '13px 15px',
    }}
  >
    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{title}</div>
    <div
      className={valueClass}
      style={{
        fontSize: 20,
        fontWeight: 700,
        marginTop: 4,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    {subtitle && (
      <div
        className={subtitleClass}
        style={{ fontSize: 12, marginTop: 2 }}
      >
        {subtitle}
      </div>
    )}
  </div>
);

export default KPICard;
