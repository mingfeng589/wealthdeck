import React from 'react';
import styles from '../../styles/track.module.css';

export interface PortfolioPulseProps {
  dailyHtml: string;
  macroHtml: string;
  generalNewsHtml: string;
  mineNewsHtml: string;
}

/**
 * Right-side pulse panel with daily update, general news, macro radar,
 * and personalized news. Uses dangerouslySetInnerHTML for pre-formatted
 * HTML content.
 * Matches wealthdeck.html lines 188-194.
 */
const PortfolioPulse: React.FC<PortfolioPulseProps> = ({
  dailyHtml,
  macroHtml,
  generalNewsHtml,
  mineNewsHtml,
}) => (
  <div className={`${styles.cardFlush} ${styles.pulse}`}>
    <h3>📡 Portfolio Pulse</h3>
    <div className={styles.pulseSec}>
      <div className={styles.ttl}>📅 Daily Update</div>
      <p dangerouslySetInnerHTML={{ __html: dailyHtml }} />
    </div>
    <div className={styles.pulseSec}>
      <div className={styles.ttl}>🌐 General Market News</div>
      <div dangerouslySetInnerHTML={{ __html: generalNewsHtml }} />
    </div>
    <div className={styles.pulseSec}>
      <div className={styles.ttl}>🎯 Macro Radar</div>
      <p dangerouslySetInnerHTML={{ __html: macroHtml }} />
    </div>
    <div className={styles.pulseSec}>
      <div className={styles.ttl}>
        🔗 News related to you{' '}
        <span className={styles.muted} style={{ fontWeight: 400 }}>
          基于持仓自动匹配
        </span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: mineNewsHtml }} />
    </div>
  </div>
);

export default PortfolioPulse;
