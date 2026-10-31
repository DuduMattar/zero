import { describe, expect, it } from 'vitest';
import { comparable, cravingDrop, cravingReducer, initialCraving, strategyEffectiveness, toCravingEvent, usedNrtStrategy, withoutUse } from '../../src/domain/craving';
import { T0, craving, events } from './fixtures';

const start = () => cravingReducer(initialCraving(), { type: 'start', id: 'ep-1', now: T0, strategy: 'breathing', durationSec: 180 });

describe('cravingReducer (SOS invertido)', () => {
  it('começa em alívio; a primeira avaliação vira "primeira, aos X s", as outras são intermediárias', () => {
    let s = start();
    expect(s.step).toBe('relief');
    expect(s.strategies).toEqual(['breathing']);
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 5_000, intensity: 8 });
    expect(s.intensityBefore).toBe(8);
    expect(s.intensityBeforeAtSec).toBe(5);
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 90_000, intensity: 5 });
    expect(s.ratings).toEqual([{ atSec: 90, intensity: 5 }]);
    s = cravingReducer(s, { type: 'extend', extraSec: 60 });
    expect(s.durationSec).toBe(240);
    s = cravingReducer(s, { type: 'toExit', now: T0 + 200_000, outcome: 'resisted' });
    s = cravingReducer(s, { type: 'setAfter', intensity: 3 });
    s = cravingReducer(s, { type: 'setTrigger', trigger: 'cafe' });
    s = cravingReducer(s, { type: 'finish', now: T0 + 210_000 });
    const e = toCravingEvent(s, 'x', 'America/Sao_Paulo', T0 + 210_000);
    expect(e.id).toBe('ep-1'); // id estável do episódio
    expect(e.outcome).toBe('resisted');
    expect(e.durationSec).toBe(200);
    expect(e.strategies).toEqual(['breathing']);
    expect(cravingDrop(e)).toBe(5); // 8 → 3
    expect(comparable(e)).toBe(true);
  });

  it('trocar estratégia guarda a lista, reinicia o tempo sugerido e tira a sessão da comparação', () => {
    let s = start();
    s = cravingReducer(s, { type: 'rateNow', now: T0 + 2_000, intensity: 8 });
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water', now: T0 + 60_000, durationSec: 120 });
    expect(s.strategies).toEqual(['breathing', 'water']);
    expect(s.strategyStartedAt).toBe(T0 + 60_000);
    expect(s.durationSec).toBe(60 + 120);
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water', now: T0 + 61_000, durationSec: 120 }); // mesma: ignora
    expect(s.strategies).toEqual(['breathing', 'water']);
    s = cravingReducer(s, { type: 'toExit', now: T0 + 120_000, outcome: 'resisted' });
    s = cravingReducer(s, { type: 'setAfter', intensity: 4 });
    const e = toCravingEvent(cravingReducer(s, { type: 'finish', now: T0 + 121_000 }), 'x', 'America/Sao_Paulo', T0 + 121_000);
    expect(cravingDrop(e)).toBe(4); // descritivo, continua existindo
    expect(comparable(e)).toBe(false); // mas não é atribuído à água
  });

  it('ler motivos durante a respiração vira sessão combinada: fica registrada, sai da comparação', () => {
    let s = cravingReducer(start(), { type: 'rateNow', now: T0 + 2_000, intensity: 8 });
    s = cravingReducer(s, { type: 'addAid', aid: 'reasons' });
    s = cravingReducer(s, { type: 'addAid', aid: 'reasons' }); // idempotente
    expect(s.strategy).toBe('breathing'); // a ativa não muda
    expect(s.strategies).toEqual(['breathing', 'reasons']);
    s = cravingReducer(s, { type: 'toExit', now: T0 + 60_000, outcome: 'resisted' });
    s = cravingReducer(s, { type: 'setAfter', intensity: 3 });
    const e = toCravingEvent(cravingReducer(s, { type: 'finish', now: T0 + 61_000 }), 'x', 'America/Sao_Paulo', T0 + 61_000);
    expect(cravingDrop(e)).toBe(5);
    expect(comparable(e)).toBe(false);
  });

  it('não muda estratégia depois de sair do alívio', () => {
    let s = cravingReducer(start(), { type: 'toExit', now: T0 + 1000, outcome: 'resisted' });
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water', now: T0 + 2000, durationSec: 120 });
    expect(s.strategy).toBe('breathing');
  });

  it('"continua": volta ao alívio no mesmo episódio ou sai com desfecho continued', () => {
    let s = cravingReducer(start(), { type: 'rateNow', now: T0 + 1000, intensity: 8 });
    s = cravingReducer(s, { type: 'toExit', now: T0 + 60_000, outcome: 'continued' });
    s = cravingReducer(s, { type: 'backToRelief' });
    expect(s.step).toBe('relief');
    expect(s.outcome).toBeNull();
    expect(s.endedAt).toBeNull();
    s = cravingReducer(s, { type: 'toExit', now: T0 + 120_000, outcome: 'continued' });
    const e = toCravingEvent(cravingReducer(s, { type: 'finish', now: T0 + 121_000 }), 'x', 'America/Sao_Paulo', T0 + 121_000);
    expect(e.outcome).toBe('continued');
    expect(withoutUse(e)).toBe(true);
    expect(cravingDrop(e)).toBeNull(); // uma medida só
  });

  it('fechar sem avaliação final: abandoned; reposição só com confirmação explícita', () => {
    let s = start();
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'nrt_fast', now: T0 + 10_000, durationSec: 300 });
    s = cravingReducer(s, { type: 'setStrategy', strategy: 'water', now: T0 + 70_000, durationSec: 120 });
    expect(usedNrtStrategy(s)).toBe(true); // passou pela reposição, mesmo tendo trocado depois
    expect(s.nrtUsed).toBeNull(); // nada inferido
    s = cravingReducer(s, { type: 'setNrtUsed', kind: 'lozenge', now: T0 + 80_000 });
    expect(s.nrtUsed).toBe('lozenge');
    expect(s.nrtUsedAt).toBe(T0 + 80_000); // horário da confirmação, editável
    s = cravingReducer(s, { type: 'setNrtUsedAt', at: T0 + 30_000 });
    expect(s.nrtUsedAt).toBe(T0 + 30_000);
    const e = toCravingEvent(cravingReducer(s, { type: 'finish', now: T0 + 100_000 }), 'x', 'America/Sao_Paulo', T0 + 100_000);
    expect(e.outcome).toBe('abandoned');
    expect(withoutUse(e)).toBe(false);
  });

  it('variação só com duas medidas; registros antigos sem lista de estratégias ficam fora da comparação', () => {
    expect(cravingDrop(craving(T0, 'breathing', null, null))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', 7, null))).toBeNull();
    expect(cravingDrop(craving(T0, 'breathing', null, 4, 'resisted', [{ atSec: 10, intensity: 9 }]))).toBe(5);
    expect(cravingDrop(craving(T0, 'breathing', 7, 2))).toBe(5);
    expect(comparable(craving(T0, 'breathing', 7, 2))).toBe(false); // sem `strategies`
    expect(comparable({ ...craving(T0, 'breathing', 7, 2), strategies: ['breathing'] })).toBe(true);
    expect(comparable({ ...craving(T0, 'breathing', 7, 2), strategies: ['breathing', 'water'] })).toBe(false);
  });
});

describe('strategyEffectiveness', () => {
  it('tabela descritiva: ordena por uso, conta medidas só de sessões comparáveis, sufficient com ≥ 10', () => {
    const ev = [];
    for (let i = 0; i < 10; i++) ev.push({ ...craving(T0 + i, 'breathing', 8, 3), strategies: ['breathing'] });
    for (let i = 0; i < 12; i++) ev.push({ ...craving(T0 + 100 + i, 'water', 8, 1), strategies: ['breathing', 'water'] }); // trocas: não comparáveis
    ev.push(craving(T0 + 500, 'water', 8, 1)); // antigo, sem lista
    const stats = strategyEffectiveness(events(...ev));
    expect(stats[0].strategy).toBe('water'); // mais usada vem primeiro, não a "melhor"
    const water = stats.find((s) => s.strategy === 'water')!;
    const breathing = stats.find((s) => s.strategy === 'breathing')!;
    expect(water.n).toBe(13);
    expect(water.measured).toBe(0);
    expect(water.avgDrop).toBeNull();
    expect(breathing.n).toBe(10);
    expect(breathing.measured).toBe(10);
    expect(breathing.avgDrop).toBe(5);
    expect(breathing.sufficient).toBe(true);
  });
});
