import React from 'react';
import styles from './styles/footernote.module.css';

const FooterNote: React.FC = () => {
  return (
    <div className={styles.footerNote}>
      数据来源：股票/ETF/指数/期货/汇率 — 腾讯财经公开接口（约3-5秒延迟，港股免费源约15分钟）；美/港/A股成交额前1000排名
      — 东方财富，每日缓存；加密货币 — CoinGecko；新闻 — Google News RSS
      聚合（CoinDesk/CNBC/Reuters 等，经 rss2json 转换）；K线 —
      腾讯历史K线。所有数据仅存于本机浏览器
      localStorage。本工具不构成投资建议。
    </div>
  );
};

export default FooterNote;
