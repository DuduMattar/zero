import { describe, expect, it } from 'vitest';
import { BASELINE_WINDOW_SEC, bestStrategy, cravingDrop, cravingReducer, initialCraving, strategyEffectiveness, toCravingEvent } from '../../src/domain/craving';
import { T0, craving, events } from './fixtures';

describe('cravingReducer (SOS invertido)', () => {
  it('começa em alívio, aceita avaliações intermediárias, sai e finaliza', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 180 });
    expect(s.step).toBe('relief');
    expect(s.intensityBefore).toBeNull();
    s = cravingReducer(s, { type: 'rateBefore', now: T0 + 5_000, intensity: 8 });
    expect(s.intensityBefore).toBe(8);
    expect(s.intensityBeforeAtSec).toBe(5);
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 30_000, intensity: 8 });
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 90_000, intensity: 5 });
    s = cravingReducer(s, { type: 'extend', extraSec: 60 });
    expect(s.durationSec).toBe(240);
    s = cravingReducer(s, { type: 'toExit', now: T0 + 200_000, outcome: 'resisted' });
    expect(s.step).toBe('exit');
    s = cravingReducer(s, { type: 'setAfter', intensity: 3 });
    s = cravingReducer(s, { type: 'setTrigger', trigger: 'cafe' });
    s = cravingReducer(s, { type: 'finish', outcome: 'resisted', now: T0 + 210_000 });
    expect(s.step).toBe('done');
    const e = toCravingEvent(s, 'x', 'America/Sao_Paulo', T0 + 210_000);
    expect(e.durationSec).toBe(200);
    expect(e.ratings).toEqual([{ atSec: 30, intensity: 8 }, { atSec: 90, intensity: 5 }]);
    expect(e.intensityAfter).toBe(3);
    expect(cravingDrop(e)).toBe(5); // linha de base 8 → última 3
  });

  it('não muda estratégia depois de sair do alívio', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 60 });
    s = cravingReducer(s, { type: 'toExit', now: T0 + 1000, outcome: 'resisted' });
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water' });
    expect(s.strategy).toBe('breathing');
  });

  it('avaliação fora da janela inicial vira intermediária, nunca linha de base', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 180 });
    s = cravingReducer(s, { type: 'rateBefore', now: T0 + (BASELINE_WINDOW_SEC + 1) * 1000, intensity: 9 });
    expect(s.intensityBefore).toBeNull();
    expect(s.ratings).toEqual([{ atSec: BASELINE_WINDOW_SEC + 1, intensity: 9 }]);
    // segunda "linha de base" também vira intermediária
    let t = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 180 });
    t = cravingReducer(t, { type: 'rateBefore', now: T0 + 2000, intensity: 7 });
    t = cravingReducer(t, { type: 'rateBefore', now: T0 + 4000, intensity: 6 });
    expect(t.intensityBefore).toBe(7);
    expect(t.ratings).toEqual([{ atSec: 4, intensity: 6 }]);
  });

  it('"continua": volta ao alívio no mesmo episódio ou sai com desfecho continued', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 180 });
    s = cravingReducer(s, { type: 'rateBefore', now: T0 + 1000, intensity: 8 });
    s = cravingReducer(s, { type: 'toExit', now: T0 + 60_000, outcome: 'continued' });
    expect(s.step).toBe('exit');
    s = cravingReducer(s, { type: 'backToRelief' });
    expect(s.step).toBe('relief');
    expect(s.outcome).toBeNull();
    expect(s.endedAt).toBeNull();
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water' });
    expect(s.strategy).toBe('water');
    s = cravingReducer(s, { type: 'toExit', now: T0 + 120_000, outcome: 'continued' });
    s = cravingReducer(s, { type: 'finish', now: T0 + 121_000 });
    const e = toCravingEvent(s, 'x', 'America/Sao_Paulo', T0 + 121_000);
    expect(e.outcome).toBe('continued');
    expect(e.durationSec).toBe(120);
    expect(e.intensityBefore).toBe(8);
    expect(cravingDrop(e)).toBeNull(); // sem medida final
  });

  it('queda só existe com linha de base real e uma medida posterior', () => {
    expect(cravingDrop(craving(T0, 'breathing', null, null))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', 7, null))).toBeNull();
    // avaliações só durante a intervenção não viram linha de base
    expect(cravingDrop(craving(T0, 'breathing', null, 4, 'resisted', [{ atSec: 10, intensity: 9 }]))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', 7, null, 'continued', [{ atSec: 60, intensity: 4 }]))).toBe(3);
    expect(cravingDrop(craving(T0, 'breathing', 7, 2))).toBe(5);
  });
});

describe('strategyEffectiveness', () => {
  it('só marca sufficient com n ≥ 10 medidas e ordena por queda média', () => {
    const ev = [];
    for (let i = 0; i < 10; i++) ev.push(craving(T0 + i, 'breathing', 8, 3));
    for (let i = 0; i < 9; i++) ev.push(craving(T0 + 100 + i, 'water', 8, 1));
    const stats = strategyEffectiveness(events(...ev));
    const water = stats.find((s) => s.strategy === 'water')!;
    const breathing = stats.find((s) => s.strategy === 'breathing')!;
    expect(water.avgDrop).toBe(7);
    expect(water.sufficient).toBe(false);
    expect(breathing.avgDrop).toBe(5);
    expect(breathing.sufficient).toBe(true);
    // episódios sem linha de base contam em n, mas não em medidas
    const withUnmeasured = events(...ev, craving(T0 + 500, 'breathing', null, 2), craving(T0 + 501, 'breathing', null, 2));
    const b2 = strategyEffectiveness(withUnmeasured).find((s) => s.strategy === 'breathing')!;
    expect(b2.n).toBe(12);
    expect(b2.measured).toBe(10);
    expect(b2.avgDrop).toBe(5);
    expect(bestStrategy(events(...ev))?.strategy).toBe('breathing');
  });

  it('sem eventos: nenhuma sugestão', () => {
    expect(bestStrategy([])).toBeNull();
  });
});
