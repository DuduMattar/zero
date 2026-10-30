import { describe, expect, it } from 'vitest';
import { computeTracks, TRACK_IDS_TEST } from './helpers';
import { DAY, H, T0, events, profile, relapse, reset, slip } from './fixtures';
import type { AppEvent } from '../../src/domain/types';

function checkInvariants(evs: AppEvent[], now: number) {
  const p = profile();
  const t = computeTracks(p, evs, now);
  for (const id of TRACK_IDS_TEST) {
    const tr = t[id];
    let prevEnd = -Infinity;
    for (const ep of tr.episodes) {
      const end = ep.endAt ?? now;
      expect(end).toBeGreaterThanOrEqual(ep.startAt); // sem duração negativa
      expect(ep.startAt).toBeGreaterThanOrEqual(prevEnd); // sem sobreposição
      prevEnd = end;
    }
    expect(tr.totalFreeMs).toBeLessThanOrEqual(now - p.quitAt + 1); // nunca mais que o tempo decorrido
    expect(tr.currentMs).toBeLessThanOrEqual(tr.totalFreeMs + 1);
    expect(tr.bestMs).toBeLessThanOrEqual(tr.totalFreeMs + 1);
    expect(tr.bestMs).toBeGreaterThanOrEqual(tr.currentMs - 1);
  }
  return t;
}

describe('invariantes das trilhas', () => {
  it('lapso, recaída e novo marco em sequência', () => {
    checkInvariants(events(slip(T0 + 2 * DAY), relapse(T0 + 5 * DAY), reset(T0 + 9 * DAY)), T0 + 12 * DAY);
  });

  it('lapso retroativo dá o mesmo resultado independentemente da ordem de registro', () => {
    const now = T0 + 20 * DAY;
    const a = events(slip(T0 + 3 * DAY), slip(T0 + 10 * DAY));
    const b = events(slip(T0 + 10 * DAY), slip(T0 + 3 * DAY)); // registrado depois, data anterior
    const ta = computeTracks(profile(), a, now).tobaccoOrVape;
    const tb = computeTracks(profile(), b, now).tobaccoOrVape;
    expect(tb.totalFreeMs).toBe(ta.totalFreeMs);
    expect(tb.bestMs).toBe(ta.bestMs);
    expect(tb.currentMs).toBe(ta.currentMs);
    expect(tb.episodes).toEqual(ta.episodes);
  });

  it('lapso antes do marco inicial é ignorado e não conta', () => {
    const t = computeTracks(profile(), events(slip(T0 - 3 * DAY)), T0 + DAY);
    expect(t.tobaccoOrVape.slipCount).toBe(0);
    expect(t.tobaccoOrVape.episodes).toHaveLength(1);
    expect(t.tobaccoOrVape.currentMs).toBe(DAY);
  });

  it('lapso que durou 3 horas não conta essas horas como livres', () => {
    const now = T0 + 2 * DAY;
    const s = slip(T0 + DAY);
    s.untilAt = T0 + DAY + 3 * H;
    const t = computeTracks(profile(), events(s), now).tobaccoOrVape;
    expect(t.totalFreeMs).toBe(2 * DAY - 3 * H);
    expect(t.currentMs).toBe(DAY - 3 * H);
    expect(t.episodes[1].startAt).toBe(T0 + DAY + 3 * H);
  });

  it('lapso isolado não zera a "corrida" da linha do tempo; recaída zera', () => {
    const now = T0 + 30 * DAY;
    const a = computeTracks(profile(), events(slip(T0 + 10 * DAY)), now).tobaccoOrVape;
    expect(a.currentMs).toBe(20 * DAY);
    expect(a.runStartAt).toBe(T0);
    expect(a.runMs).toBe(30 * DAY);
    const b = computeTracks(profile(), events(relapse(T0 + 10 * DAY), reset(T0 + 15 * DAY)), now).tobaccoOrVape;
    expect(b.runStartAt).toBe(T0 + 15 * DAY);
    expect(b.runMs).toBe(15 * DAY);
    const c = computeTracks(profile(), events(relapse(T0 + 10 * DAY)), now).tobaccoOrVape;
    expect(c.runStartAt).toBeNull();
    expect(c.runMs).toBe(0);
  });

  it('NRT ativa + lapso de cigarro: nicotina segue em NRT, cigarro e geral reiniciam', () => {
    const p = profile({ nrt: { uses: true, kind: 'patch' }, nicotineFreeAt: null });
    const t = computeTracks(p, events(slip(T0 + 2 * DAY)), T0 + 3 * DAY);
    expect(t.nicotine.state).toBe('nrt');
    expect(t.nicotine.slipCount).toBe(0);
    expect(t.combustion.currentMs).toBe(DAY);
    expect(t.combustion.slipCount).toBe(1);
    expect(t.tobaccoOrVape.slipCount).toBe(1);
  });

  it('novo marco com data anterior ao fim do episódio aberto não gera sobreposição', () => {
    const now = T0 + 10 * DAY;
    checkInvariants(events(reset(T0 + 5 * DAY, T0 + 2 * DAY)), now);
  });

  it('eventos futuros não alteram o estado atual', () => {
    const t = computeTracks(profile(), events(relapse(T0 + 5 * DAY)), T0 + 2 * DAY).tobaccoOrVape;
    expect(t.state).toBe('free');
    expect(t.relapseCount).toBe(0);
  });
});
