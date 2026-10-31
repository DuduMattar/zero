import type { AppEvent, CravingEvent, CravingRating } from './types';
import { MIN_CRAVINGS_FOR_STRATEGY } from './thresholds';

// SOS invertido: alívio primeiro (cronômetro + estratégia), dado depois.
// A estratégia começa a agir assim que a tela abre. Por isso, uma avaliação só vale como
// "antes" se for feita nos primeiros segundos; depois disso ela é avaliação intermediária.

/** Janela, em segundos, em que uma avaliação ainda conta como linha de base. */
export const BASELINE_WINDOW_SEC = 20;

export type CravingStep = 'relief' | 'exit' | 'done';
export type CravingOutcome = 'resisted' | 'slipped' | 'continued' | 'abandoned';

export interface CravingState {
  step: CravingStep;
  startedAt: number;
  durationSec: number;
  strategy: string;
  intensityBefore: number | null;
  intensityBeforeAtSec: number | null;
  ratings: CravingRating[];
  intensityAfter: number | null;
  trigger: string | null;
  outcome: CravingOutcome | null;
  endedAt: number | null;
}

export type CravingAction =
  | { type: 'start'; now: number; strategy: string; durationSec: number }
  | { type: 'setStrategy'; strategy: string }
  | { type: 'rateBefore'; now: number; intensity: number }
  | { type: 'rateNow'; now: number; intensity: number }
  | { type: 'extend'; extraSec: number }
  | { type: 'toExit'; now: number; outcome: 'resisted' | 'slipped' | 'continued' }
  | { type: 'backToRelief' }
  | { type: 'setAfter'; intensity: number }
  | { type: 'setTrigger'; trigger: string | null }
  | { type: 'finish'; now: number; outcome?: CravingOutcome };

export const initialCraving = (): CravingState => ({
  step: 'relief',
  startedAt: 0,
  durationSec: 180,
  strategy: 'breathing',
  intensityBefore: null,
  intensityBeforeAtSec: null,
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
      return { ...initialCraving(), startedAt: a.now, durationSec: a.durationSec, strategy: a.strategy };
    case 'setStrategy':
      return s.step === 'relief' ? { ...s, strategy: a.strategy } : s;
    case 'rateBefore': {
      // Só é "antes" dentro da janela e se ainda não houver linha de base; fora disso vira avaliação intermediária.
      const atSec = Math.max(0, Math.round((a.now - s.startedAt) / 1000));
      if (s.step !== 'relief' || s.intensityBefore != null || atSec > BASELINE_WINDOW_SEC) return cravingReducer(s, { type: 'rateNow', now: a.now, intensity: a.intensity });
      return { ...s, intensityBefore: clamp10(a.intensity), intensityBeforeAtSec: atSec };
    }
    case 'rateNow': {
      if (s.step === 'done') return s;
      const atSec = Math.max(0, Math.round((a.now - s.startedAt) / 1000));
      return { ...s, ratings: [...s.ratings, { atSec, intensity: clamp10(a.intensity) }] };
    }
    case 'extend':
      return s.step === 'relief' ? { ...s, durationSec: s.durationSec + a.extraSec } : s;
    case 'toExit':
      return s.step === 'relief' ? { ...s, step: 'exit', endedAt: a.now, outcome: a.outcome } : s;
    case 'backToRelief':
      // "Continua" → trocar estratégia ou ler motivos e seguir. O registro continua o mesmo episódio.
      return s.step === 'exit' ? { ...s, step: 'relief', endedAt: null, outcome: null, intensityAfter: null } : s;
    case 'setAfter':
      return { ...s, intensityAfter: clamp10(a.intensity) };
    case 'setTrigger':
      return { ...s, trigger: a.trigger };
    case 'finish':
      return { ...s, step: 'done', outcome: a.outcome ?? s.outcome ?? 'abandoned', endedAt: s.endedAt ?? a.now };
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
    intensityBeforeAtSec: s.intensityBeforeAtSec,
    ratings: s.ratings,
    intensityAfter: s.intensityAfter,
    trigger: s.trigger,
    outcome: s.outcome ?? 'abandoned',
  };
}

/**
 * Queda de intensidade: linha de base (avaliada antes de a estratégia agir) − última medida.
 * Sem linha de base real, null: o episódio fica registrado, mas não entra na comparação.
 */
export function cravingDrop(e: CravingEvent): number | null {
  if (e.intensityBefore == null) return null;
  const last = e.intensityAfter ?? (e.ratings.length ? e.ratings[e.ratings.length - 1].intensity : null);
  if (last == null) return null;
  return e.intensityBefore - last;
}

export interface StrategyStat {
  strategy: string;
  n: number;
  resisted: number;
  avgDrop: number | null;
  medianDrop: number | null;
  measured: number;
  sufficient: boolean;
}

/** Estatística descritiva por estratégia. `sufficient` só com medidas ≥ limiar. Não é afirmação causal. */
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
    out.push({ strategy, n: g.n, resisted: g.resisted, avgDrop: avg, medianDrop: med, measured: sorted.length, sufficient: sorted.length >= MIN_CRAVINGS_FOR_STRATEGY });
  }
  return out.sort((a, b) => (b.avgDrop ?? -Infinity) - (a.avgDrop ?? -Infinity) || b.n - a.n);
}

/** Estratégia a sugerir primeiro: a de maior queda média entre as com amostra suficiente; null se nenhuma. */
export function bestStrategy(events: AppEvent[]): StrategyStat | null {
  return strategyEffectiveness(events).find((s) => s.sufficient && s.avgDrop != null) ?? null;
}
