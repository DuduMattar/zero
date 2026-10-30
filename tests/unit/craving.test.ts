import { describe, expect, it } from 'vitest';
import { bestStrategy, cravingDrop, cravingReducer, initialCraving, strategyEffectiveness, toCravingEvent } from '../../src/domain/craving';
import { T0, craving, events } from './fixtures';

describe('cravingReducer (SOS invertido)', () => {
  it('começa em alívio, aceita avaliações intermediárias, sai e finaliza', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 180 });
    expect(s.step).toBe('relief');
    expect(s.intensityBefore).toBeNull();
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 30_000, intensity: 8 });
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 90_000, intensity: 5 });
    s = cravingReducer(s, { type: 'extend', extraSec: 60 });
    expect(s.durationSec).toBe(240);
    s = cravingReducer(s, { type: 'toExit', now: T0 + 200_000 });
    expect(s.step).toBe('exit');
    s = cravingReducer(s, { type: 'setAfter', intensity: 3 });
    s = cravingReducer(s, { type: 'setTrigger', trigger: 'cafe' });
    s = cravingReducer(s, { type: 'finish', outcome: 'resisted', now: T0 + 210_000 });
    expect(s.step).toBe('done');
    const e = toCravingEvent(s, 'x', 'America/Sao_Paulo', T0 + 210_000);
    expect(e.durationSec).toBe(200);
    expect(e.ratings).toEqual([{ atSec: 30, intensity: 8 }, { atSec: 90, intensity: 5 }]);
    expect(e.intensityAfter).toBe(3);
    expect(cravingDrop(e)).toBe(5); // primeira medida 8 → última 3
  });

  it('não muda estratégia depois de sair do alívio', () => {
    let s = cravingReducer(initialCraving(), { type: 'start', now: T0, strategy: 'breathing', durationSec: 60 });
    s = cravingReducer(s, { type: 'toExit', now: T0 + 1000 });
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water' });
    expect(s.strategy).toBe('breathing');
  });

  it('queda é null sem duas medidas', () => {
    expect(cravingDrop(craving(T0, 'breathing', null, null))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', 7, null))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', null, 4, 'resisted', [{ atSec: 10, intensity: 9 }]))).toBe(5);
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
    expect(bestStrategy(events(...ev))?.strategy).toBe('breathing');
  });

  it('sem eventos: nenhuma sugestão', () => {
    expect(bestStrategy([])).toBeNull();
  });
});
