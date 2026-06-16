export function jsonp(src: string, charset?: string, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    if (charset) s.charset = charset;
    s.src = src;

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        s.remove();
        reject(new Error('JSONP timeout: ' + src.slice(0, 120)));
      }
    }, timeoutMs);

    s.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        s.remove();
        resolve();
      }
    };
    s.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        s.remove();
        reject(new Error('JSONP load failed: ' + src.slice(0, 120)));
      }
    };
    document.head.appendChild(s);
  });
}
