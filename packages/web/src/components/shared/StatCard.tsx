import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

/**
 * Reusable stat card used by PortfolioStats and InsuranceSection.
 * Matches wealthdeck.html .stat styles.
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
  <div
    style={{
      background: 'var(--bg)',
      borderRadius: 10,
      padding: '11px 13px',
    }}
  >
    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{title}</div>
    <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>{value}</div>
    {subtitle && (
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
        {subtitle}
      </div>
    )}
  </div>
);

export default StatCard;
