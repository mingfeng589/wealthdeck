import type { NewsItem, NewsCache } from '@wealthdeck/shared';

export async function fetchNews(
  q: string,
  zh: boolean,
): Promise<NewsItem[] | null> {
  const feed =
    'https://news.google.com/rss/search?q=' +
    encodeURIComponent(q) +
    (zh
      ? '&hl=zh-HK&gl=HK&ceid=HK:zh-Hant'
      : '&hl=en-US&gl=US&ceid=US:en');
  try {
    const r = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=' +
        encodeURIComponent(feed),
    );
    const j = await r.json();
    if (j.status !== 'ok') return null;
    return (j.items || []).slice(0, 3).map(
      (i: { title: string; link: string; pubDate?: string }) => {
        const parts = i.title.split(' - ');
        const src = parts.length > 1 ? parts.pop()! : '';
        return {
          title: parts.join(' - '),
          src,
          link: i.link,
          date: (i.pubDate || '').slice(5, 10),
        };
      },
    );
  } catch {
    return null;
  }
}

export function isCacheValid(cache: NewsCache | null): boolean {
  return cache !== null && Date.now() - cache.t < 30 * 60 * 1000;
}
