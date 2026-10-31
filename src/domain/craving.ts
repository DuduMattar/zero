import type { AppEvent, CravingEvent, CravingRating } from './types';
import { MIN_CRAVINGS_FOR_STRATEGY } from './thresholds';

// SOS invertido: alívio primeiro (cronômetro + estratégia), dado depois.
// A estratégia começa a agir assim que a tela abre, então NENHUMA avaliação é "pré-intervenção".
// O que o app guarda é: primeira avaliação (aos X s), avaliações seguintes, avaliação final.
// A "variação" é descritiva (primeira − última) e só é comparada entre sessões de estratégia única.

export type CravingStep = 'relief' | 'exit' | 'done';
/** resisted: diminuiu · continued: saiu com a vontade presente · slipped: houve uso · abandoned: encerrada sem avaliação final */
export type CravingOutcome = 'resisted' | 'slipped' | 'continued' | 'abandoned';

export interface CravingState {
  step: CravingStep;
  startedAt: number;
  durationSec: number;
  strategy: string;
  strategies: string[];
  strategyStartedAt: number;
  intensityBefore: number | null;
  intensityBeforeAtSec: number | null;
  ratings: CravingRating[];
  intensityAfter: number | null;
  trigger: string | null;
  /** reposição confirmada na saída (null = não usou / não perguntado) */
  nrtUsed: 'patch' | 'gum' | 'lozenge' | 'other' | null;
  outcome: CravingOutcome | null;
  endedAt: number | null;
}

export type CravingAction =
  | { type: 'start'; now: number; strategy: string; durationSec: number }
  | { type: 'setStrategy'; strategy: string; now: number; durationSec: number }
  | { type: 'rateNow'; now: number; intensity: number }
  | { type: 'extend'; extraSec: number }
  | { type: 'toExit'; now: number; outcome: 'resisted' | 'slipped' | 'continued' }
  | { type: 'backToRelief' }
  | { type: 'setAfter'; intensity: number }
  | { type: 'setTrigger'; trigger: string | null }
  | { type: 'setNrtUsed'; kind: CravingState['nrtUsed'] }
  | { type: 'finish'; now: number; outcome?: CravingOutcome };

export const initialCraving = (): CravingState => ({
  step: 'relief',
  startedAt: 0,
  durationSec: 180,
  strategy: 'breathing',
  strategies: [],
  strategyStartedAt: 0,
  intensityBefore: null,
  intensityBeforeAtSec: null,
  ratings: [],
  intensityAfter: null,
  trigger: null,
  nrtUsed: null,
  outcome: null,
  endedAt: null,
});

const clamp10 = (n: number) => Math.max(0, Math.min(10, Math.round(n)));
const secSince = (now: number, t0: number) => Math.max(0, Math.round((now - t0) / 1000));

export function cravingReducer(s: CravingState, a: CravingAction): CravingState {
  switch (a.type) {
    case 'start':
      return { ...initialCraving(), startedAt: a.now, strategyStartedAt: a.now, durationSec: a.durationSec, strategy: a.strategy, strategies: [a.strategy] };
    case 'setStrategy': {
      if (s.step !== 'relief' || a.strategy === s.strategy) return s;
      // Trocar reinicia o tempo sugerido da nova estratégia; a sessão continua a mesma.
      return { ...s, strategy: a.strategy, strategies: [...s.strategies, a.strategy], strategyStartedAt: a.now, durationSec: secSince(a.now, s.startedAt) + a.durationSec };
    }
    case 'rateNow': {
      if (s.step === 'done') return s;
      const atSec = secSince(a.now, s.startedAt);
      if (s.intensityBefore == null) return { ...s, intensityBefore: clamp10(a.intensity), intensityBeforeAtSec: atSec };
      return { ...s, ratings: [...s.ratings, { atSec, intensity: clamp10(a.intensity) }] };
    }
    case 'extend':
      return s.step === 'relief' ? { ...s, durationSec: s.durationSec + a.extraSec } : s;
    case 'toExit':
      return s.step === 'relief' ? { ...s, step: 'exit', endedAt: a.now, outcome: a.outcome } : s;
    case 'backToRelief':
      return s.step === 'exit' ? { ...s, step: 'relief', endedAt: null, outcome: null, intensityAfter: null } : s;
    case 'setAfter':
      return { ...s, intensityAfter: clamp10(a.intensity) };
    case 'setTrigger':
      return { ...s, trigger: a.trigger };
    case 'setNrtUsed':
      return { ...s, nrtUsed: a.kind };
    case 'finish':
      return { ...s, step: 'done', outcome: a.outcome ?? s.outcome ?? 'abandoned', endedAt: s.endedAt ?? a.now };
  }
}

/** A sessão passou por "Goma ou pastilha de reposição" em algum momento (mesmo que depois tenha trocado). */
export const usedNrtStrategy = (s: CravingState) => s.strategies.includes('nrt_fast');

export function toCravingEvent(s: CravingState, id: string, tz: string, createdAt: number): CravingEvent {
  const end = s.endedAt ?? createdAt;
  return {
    id,
    type: 'craving',
    at: s.startedAt,
    tz,
    createdAt,
    strategy: s.strategy,
    strategies: s.strategies,
    durationSec: Math.max(0, Math.round((end - s.startedAt) / 1000)),
    intensityBefore: s.intensityBefore,
    intensityBeforeAtSec: s.intensityBeforeAtSec,
    ratings: s.ratings,
    intensityAfter: s.intensityAfter,
    trigger: s.trigger,
    outcome: s.outcome ?? 'abandoned',
  };
}

/** Vontade atravessada sem uso registrado (diminuiu ou continuava ao sair). */
export const withoutUse = (e: CravingEvent) => e.outcome === 'resisted' || e.outcome === 'continued';

/** Variação descritiva: primeira avaliação conhecida − última. null com menos de duas medidas. Não é medida pré/pós-intervenção. */
export function cravingDrop(e: CravingEvent): number | null {
  const measures = [...(e.intensityBefore != null ? [e.intensityBefore] : []), ...e.ratings.map((r) => r.intensity), ...(e.intensityAfter != null ? [e.intensityAfter] : [])];
  if (measures.length < 2) return null;
  return measures[0] - measures[measures.length - 1];
}

/** Entra na comparação por estratégia: uma única estratégia conhecida e pelo menos duas medidas. Registros antigos (sem `strategies`) ficam fora. */
export const comparable = (e: CravingEvent) => e.strategies?.length === 1 && cravingDrop(e) != null;

export interface StrategyStat {
  strategy: string;
  /** sessões cuja estratégia final foi esta */
  n: number;
  withoutUse: number;
  /** sessões comparáveis (estratégia única, ≥ 2 medidas) */
  measured: number;
  avgDrop: number | null;
  medianDrop: number | null;
  sufficient: boolean;
}

/** Tabela descritiva por estratégia, ordenada por uso (n). Nunca por "melhor": não é afirmação causal. */
export function strategyEffectiveness(events: AppEvent[]): StrategyStat[] {
  const by = new Map<string, { drops: number[]; n: number; wu: number }>();
  for (const e of events) {
    if (e.type !== 'craving') continue;
    const g = by.get(e.strategy) ?? { drops: [], n: 0, wu: 0 };
    g.n += 1;
    if (withoutUse(e)) g.wu += 1;
    if (comparable(e)) g.drops.push(cravingDrop(e)!);
    by.set(e.strategy, g);
  }
  const out: StrategyStat[] = [];
  for (const [strategy, g] of by) {
    const sorted = g.drops.slice().sort((a, b) => a - b);
    const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : null;
    const med = sorted.length ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : null;
    out.push({ strategy, n: g.n, withoutUse: g.wu, measured: sorted.length, avgDrop: avg, medianDrop: med, sufficient: sorted.length >= MIN_CRAVINGS_FOR_STRATEGY });
  }
  return out.sort((a, b) => b.n - a.n || a.strategy.localeCompare(b.strategy));
}
