import type { AppEvent, CravingEvent, CravingRating } from './types';
import { MIN_CRAVINGS_FOR_STRATEGY } from './thresholds';

// SOS invertido: alívio primeiro (cronômetro + estratégia), dado depois.

export type CravingStep = 'relief' | 'exit' | 'done';

export interface CravingState {
  step: CravingStep;
  startedAt: number;
  durationSec: number;
  strategy: string;
  intensityBefore: number | null;
  ratings: CravingRating[];
  intensityAfter: number | null;
  trigger: string | null;
  outcome: 'resisted' | 'slipped' | 'abandoned' | null;
  endedAt: number | null;
}

export type CravingAction =
  | { type: 'start'; now: number; strategy: string; durationSec: number; intensityBefore?: number | null }
  | { type: 'setStrategy'; strategy: string }
  | { type: 'rateNow'; now: number; intensity: number }
  | { type: 'extend'; extraSec: number }
  | { type: 'toExit'; now: number }
  | { type: 'setAfter'; intensity: number }
  | { type: 'setTrigger'; trigger: string | null }
  | { type: 'finish'; outcome: 'resisted' | 'slipped' | 'abandoned'; now: number };

export const initialCraving = (): CravingState => ({
  step: 'relief',
  startedAt: 0,
  durationSec: 180,
  strategy: 'breathing',
  intensityBefore: null,
  ratings: [],
  intensityAfter: null,
  trigger: null,
  outcome: null,
  endedAt: null,
});

const clamp10 = (n: number) => Math.max(0, Math.min(10, Math.round(n)));

export function cravingReducer(s: CravingState, a: CravingAction): CravingState {
  switch (a.type) {
    case 'start':
      return {
        ...initialCraving(),
        startedAt: a.now,
        durationSec: a.durationSec,
        strategy: a.strategy,
        intensityBefore: a.intensityBefore == null ? null : clamp10(a.intensityBefore),
      };
    case 'setStrategy':
      return s.step === 'relief' ? { ...s, strategy: a.strategy } : s;
    case 'rateNow': {
      if (s.step === 'done') return s;
      const atSec = Math.max(0, Math.round((a.now - s.startedAt) / 1000));
      return { ...s, ratings: [...s.ratings, { atSec, intensity: clamp10(a.intensity) }] };
    }
    case 'extend':
      return s.step === 'relief' ? { ...s, durationSec: s.durationSec + a.extraSec } : s;
    case 'toExit':
      return s.step === 'relief' ? { ...s, step: 'exit', endedAt: a.now } : s;
    case 'setAfter':
      return { ...s, intensityAfter: clamp10(a.intensity) };
    case 'setTrigger':
      return { ...s, trigger: a.trigger };
    case 'finish':
      return { ...s, step: 'done', outcome: a.outcome, endedAt: s.endedAt ?? a.now };
  }
}

export function toCravingEvent(s: CravingState, id: string, tz: string, createdAt: number): CravingEvent {
  const end = s.endedAt ?? createdAt;
  return {
    id,
    type: 'craving',
    at: s.startedAt,
    tz,
    createdAt,
    strategy: s.strategy,
    durationSec: Math.max(0, Math.round((end - s.startedAt) / 1000)),
    intensityBefore: s.intensityBefore,
    ratings: s.ratings,
    intensityAfter: s.intensityAfter,
    trigger: s.trigger,
    outcome: s.outcome ?? 'abandoned',
  };
}

/** Queda de intensidade de um episódio: primeira medida conhecida − última medida conhecida. null se não houver duas medidas. */
export function cravingDrop(e: CravingEvent): number | null {
  const first = e.intensityBefore ?? e.ratings[0]?.intensity ?? null;
  const last = e.intensityAfter ?? (e.ratings.length ? e.ratings[e.ratings.length - 1].intensity : null);
  if (first == null || last == null) return null;
  if (e.intensityBefore == null && e.intensityAfter == null && e.ratings.length < 2) return null;
  return first - last;
}

export interface StrategyStat {
  strategy: string;
  n: number;
  resisted: number;
  avgDrop: number | null;
  medianDrop: number | null;
  sufficient: boolean;
}

/** Estatística descritiva por estratégia. `sufficient` só com n ≥ limiar. Não é afirmação causal. */
export function strategyEffectiveness(events: AppEvent[]): StrategyStat[] {
  const by = new Map<string, { drops: number[]; n: number; resisted: number }>();
  for (const e of events) {
    if (e.type !== 'craving') continue;
    const g = by.get(e.strategy) ?? { drops: [], n: 0, resisted: 0 };
    g.n += 1;
    if (e.outcome === 'resisted') g.resisted += 1;
    const d = cravingDrop(e);
    if (d != null) g.drops.push(d);
    by.set(e.strategy, g);
  }
  const out: StrategyStat[] = [];
  for (const [strategy, g] of by) {
    const sorted = g.drops.slice().sort((a, b) => a - b);
    const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : null;
    const med = sorted.length ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : null;
    out.push({ strategy, n: g.n, resisted: g.resisted, avgDrop: avg, medianDrop: med, sufficient: sorted.length >= MIN_CRAVINGS_FOR_STRATEGY });
  }
  return out.sort((a, b) => (b.avgDrop ?? -Infinity) - (a.avgDrop ?? -Infinity) || b.n - a.n);
}

/** Estratégia a sugerir primeiro: a de maior queda média entre as com amostra suficiente; null se nenhuma. */
export function bestStrategy(events: AppEvent[]): StrategyStat | null {
  return strategyEffectiveness(events).find((s) => s.sufficient && s.avgDrop != null) ?? null;
}
