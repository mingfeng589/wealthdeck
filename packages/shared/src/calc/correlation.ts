/**
 * Pearson correlation coefficient between two numeric arrays.
 *
 * Returns `null` if either array has fewer than 10 elements or if
 * variance is zero.
 */
export function pearson(a: number[], b: number[]): number | null {
  const n = a.length;
  if (n < 10) return null;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return da && db ? num / Math.sqrt(da * db) : null;
}
