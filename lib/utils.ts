export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** 入力長制限とHTMLとして危険な文字の素朴な無害化（描画は常にテキストとして行う前提）。 */
export function sanitizeInput(text: string, maxLen = 80): string {
  return text.replace(/[<>]/g, "").slice(0, maxLen);
}
