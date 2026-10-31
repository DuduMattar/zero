import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { ZeroDB } from '../../src/data/db';
import { saveCravingSession } from '../../src/data/repos';
import { DEFAULT_SETTINGS, type CravingEvent, type NrtDoseEvent } from '../../src/domain/types';
import { DRAFT_STALE_MS, isStale, readDraft } from '../../src/features/sos/Sos';
import { T0 } from './fixtures';

const craving = (id: string): CravingEvent => ({ id, type: 'craving', at: T0, tz: 'America/Sao_Paulo', createdAt: T0 + 100_000, strategy: 'water', strategies: ['breathing', 'nrt_fast', 'water'], durationSec: 100, intensityBefore: 7, intensityBeforeAtSec: 3, ratings: [], intensityAfter: 4, trigger: null, outcome: 'continued' });
const dose = (id: string): NrtDoseEvent => ({ id, type: 'nrt_dose', at: T0 + 50_000, tz: 'America/Sao_Paulo', createdAt: T0 + 100_000, kind: 'gum', mg: null, note: 'Durante uma vontade (SOS)' });

describe('saveCravingSession', () => {
  it('é uma transação só: falha na dose não deixa o episódio gravado; repetir não duplica', async () => {
    const d = new ZeroDB('zero-test-' + Math.random());
    await d.settings.put({ ...DEFAULT_SETTINGS, sosDraft: { state: { id: 'ep-1' }, updatedAt: T0 } });
    // dose sem chave primária → DataError dentro da transação → tudo aborta
    await expect(saveCravingSession(craving('ep-1'), { ...dose('x'), id: undefined as unknown as string }, d)).rejects.toBeTruthy();
    expect(await d.events.count()).toBe(0);
    expect((await d.settings.get('singleton'))?.sosDraft).not.toBeNull();
    // segunda tentativa, agora válida
    await saveCravingSession(craving('ep-1'), dose('ep-1-nrt'), d);
    expect(await d.events.count()).toBe(2);
    expect((await d.settings.get('singleton'))?.sosDraft).toBeNull();
    // terceira tentativa (toque repetido): mesmos ids, nada novo
    await saveCravingSession(craving('ep-1'), dose('ep-1-nrt'), d);
    expect(await d.events.count()).toBe(2);
  });
});

describe('rascunho do SOS', () => {
  const state = { id: 'ep-9', step: 'relief', startedAt: T0, strategies: ['breathing'], strategy: 'breathing' };
  it('lê o formato atual e o antigo; concluído ou inválido vira null', () => {
    expect(readDraft({ state, updatedAt: T0 + 60_000 })?.updatedAt).toBe(T0 + 60_000);
    expect(readDraft(state)?.updatedAt).toBe(T0); // formato antigo: estado solto
    expect(readDraft({ state: { ...state, step: 'done' }, updatedAt: T0 })).toBeNull();
    expect(readDraft({ state: { ...state, strategies: undefined }, updatedAt: T0 })).toBeNull();
    expect(readDraft(null)).toBeNull();
  });
  it('antigo depois de 6 h desde o último passo, mas continua existindo (a decisão é da pessoa)', () => {
    const d = readDraft({ state, updatedAt: T0 })!;
    expect(isStale(d, T0 + DRAFT_STALE_MS - 1)).toBe(false);
    expect(isStale(d, T0 + DRAFT_STALE_MS + 1)).toBe(true);
    expect(readDraft({ state, updatedAt: T0 })).not.toBeNull();
  });
});
