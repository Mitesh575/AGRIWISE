/**
 * Retrieval + reasoning helpers shared by every agent.
 *
 * Deliberately NOT a machine-learning model: there is no training step and
 * nothing is fit to data ahead of time. At request time, each agent scores
 * historical records by similarity to the farmer's current inputs (a plain
 * normalized-distance comparison) and reasons over the closest matches.
 */

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Normalized 0..1 distance of `value` from `target`, given the field's realistic span. */
export function normDist(value: number, target: number, span: number): number {
  if (span <= 0) return 0;
  return clamp(Math.abs(value - target) / span, 0, 1);
}

export interface WeightedField {
  value: number;
  target: number;
  span: number;
  weight: number;
}

/** Weighted similarity 0..100 (100 = identical) across several numeric fields. */
export function weightedSimilarity(fields: WeightedField[]): number {
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0) || 1;
  const weightedDist = fields.reduce((sum, f) => sum + f.weight * normDist(f.value, f.target, f.span), 0) / totalWeight;
  return Math.round((1 - weightedDist) * 100);
}

export function mode<T extends string>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  let best: T | undefined;
  let bestCount = -1;
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  }
  return best;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function topK<T>(items: T[], score: (item: T) => number, k: number): T[] {
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, k);
}

/** Numeric field validation helper — returns an error string, or undefined when valid. */
export function validateNumber(label: string, value: number | string, min: number, max: number): string | undefined {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (value === "" || value === null || value === undefined || Number.isNaN(n)) {
    return `${label} is required.`;
  }
  if (n < min || n > max) {
    return `${label} should be between ${min} and ${max}.`;
  }
  return undefined;
}

export function validateRequired(label: string, value: string | undefined | null): string | undefined {
  if (!value || value.trim().length === 0) return `${label} is required.`;
  return undefined;
}

/** Small deterministic string hash (FNV-1a) — used so the same input image/case
 *  consistently resolves to the same agent output rather than re-rolling on every click. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function seededPick<T>(items: readonly T[], seed: number): T {
  const idx = seed % items.length;
  return items[idx] as T;
}
