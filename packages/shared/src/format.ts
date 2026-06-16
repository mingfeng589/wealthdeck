import type { Currency } from './types';

/** Currency symbol map. */
export const CSYM: Record<Currency, string> = {
  USD: '$',
  CNY: '¥',
  HKD: 'HK$',
};

/**
 * Format a numeric value as a rounded integer with currency symbol.
 *
 * If no currency is provided, the caller should pass the user's base
 * currency explicitly.
 *
 * Returns `'--'` for null, undefined, or NaN.
 */
export function fmt(v: number | null | undefined, c: Currency): string {
  if (v == null || isNaN(v)) return '--';
  return (CSYM[c] || '') + Math.round(v).toLocaleString('en-US');
}

/**
 * Format a number to at most 2 decimal places (no currency symbol).
 *
 * Returns `'--'` for null, undefined, or NaN.
 */
export function fmt2(v: number | null | undefined): string {
  if (v == null || isNaN(v as number)) return '--';
  return (+v!).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

const ESC_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** HTML-escape a string (ampersand, angle brackets, quotes). */
export function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (m) => ESC_MAP[m]);
}
