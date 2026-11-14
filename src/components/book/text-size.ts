/**
 * Reading text size, kept in this browser only. Applied as the
 * `--reading-scale` custom property on <html>, which the reading
 * typography multiplies into its font size.
 */

export const TEXT_SIZES = [0.88, 1, 1.12, 1.25, 1.4] as const;
export const DEFAULT_TEXT_SIZE = 1;

const KEY = "bhl:text-size";
const EVENT = "bhl:text-size";

const clampIndex = (index: number): number => Math.min(TEXT_SIZES.length - 1, Math.max(0, index));

export function readTextSize(): number {
  try {
    const raw = window.localStorage.getItem(KEY);
    const value = raw === null ? Number.NaN : Number(raw);
    return Number.isInteger(value) && value >= 0 && value < TEXT_SIZES.length ? value : DEFAULT_TEXT_SIZE;
  } catch {
    return DEFAULT_TEXT_SIZE;
  }
}

export function writeTextSize(index: number): void {
  const next = clampIndex(index);
  document.documentElement.style.setProperty("--reading-scale", String(TEXT_SIZES[next]));
  try {
    window.localStorage.setItem(KEY, String(next));
  } catch {
    // Storage unavailable: the size still applies for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTextSize(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * Inline script for <head>: applies the saved size before first paint, so
 * text never jumps and a resumed reading position stays where it was left.
 */
export const textSizeBootScript = `try{var r=localStorage.getItem(${JSON.stringify(KEY)});var s=${JSON.stringify(TEXT_SIZES)};var i=r===null?-1:Number(r);if(Number.isInteger(i)&&s[i])document.documentElement.style.setProperty("--reading-scale",String(s[i]))}catch(e){}`;
