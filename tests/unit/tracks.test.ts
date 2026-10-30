import { describe, expect, it } from 'vitest';
import { computeTracks } from '../../src/domain/tracks';
import { DAY, H, T0, events, nrtEnded, profile, relapse, reset, slip } from './fixtures';

describe('computeTracks', () => {
  it('sem eventos: todas as trilhas aplicáveis contam desde quitAt', () => {
    const t = computeTracks(profile(), [], T0 + 3 * DAY);
    expect(t.tobaccoOrVape.currentMs).toBe(3 * DAY);
    expect(t.combustion.currentMs).toBe(3 * DAY);
    expect(t.vape.currentMs).toBe(3 * DAY);
    expect(t.nicotine.currentMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.totalFreeMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.bestMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.state).toBe('free');
  });

  it('trilha não aplicável quando a pessoa nunca usou aquela classe', () => {
    const t = computeTracks(profile({ products: ['vape'] }), [], T0 + DAY);
    expect(t.combustion.state).toBe('not_applicable');
    expect(t.vape.state).toBe('free');
    expect(t.tobaccoOrVape.state).toBe('free');
  });

  it('lapso de cigarro encerra combustion, tobaccoOrVape e nicotine; vape fica intacta; reinicia no instante do lapso', () => {
    const now = T0 + 5 * DAY;
    const t = computeTracks(profile(), events(slip(T0 + 2 * DAY)), now);
    expect(t.combustion.currentMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.currentMs).toBe(3 * DAY);
    expect(t.nicotine.currentMs).toBe(3 * DAY);
    expect(t.vape.currentMs).toBe(5 * DAY);
    expect(t.combustion.totalFreeMs).toBe(5 * DAY);
    expect(t.combustion.bestMs).toBe(3 * DAY);
    expect(t.combustion.episodes).toHaveLength(2);
    expect(t.combustion.episodes[0]).toMatchObject({ startAt: T0, endAt: T0 + 2 * DAY, endedBy: 'slip' });
    expect(t.combustion.slipCount).toBe(1);
  });

  it('vape 0 mg encerra vape e tobaccoOrVape, mas não nicotine nem combustion', () => {
    const now = T0 + 4 * DAY;
    const t = computeTracks(profile(), events(slip(T0 + DAY, 'vape', false)), now);
    expect(t.vape.currentMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.currentMs).toBe(3 * DAY);
    expect(t.nicotine.currentMs).toBe(4 * DAY);
    expect(t.combustion.currentMs).toBe(4 * DAY);
  });

  it('sachê de nicotina encerra só a trilha de nicotina', () => {
    const now = T0 + 4 * DAY;
    const t = computeTracks(profile(), events(slip(T0 + DAY, 'pouch', true)), now);
    expect(t.nicotine.currentMs).toBe(3 * DAY);
    expect(t.tobaccoOrVape.currentMs).toBe(4 * DAY);
    expect(t.combustion.currentMs).toBe(4 * DAY);
    expect(t.vape.currentMs).toBe(4 * DAY);
  });

  it('recorde preservado após lapso; total soma intervalos sem sobreposição com 3 lapsos', () => {
    const now = T0 + 20 * DAY;
    const t = computeTracks(profile(), events(slip(T0 + 7 * DAY), slip(T0 + 9 * DAY), slip(T0 + 9 * DAY + H)), now);
    expect(t.tobaccoOrVape.bestMs).toBe(11 * DAY - H); // último episódio: 9d+1h → 20d
    expect(t.tobaccoOrVape.totalFreeMs).toBe(20 * DAY);
    expect(t.tobaccoOrVape.episodes).toHaveLength(4);
    expect(t.tobaccoOrVape.currentMs).toBe(11 * DAY - H);
  });

  it('recaída deixa "em recaída" sem contador até novo marco; período de recaída fica fora do total', () => {
    const now = T0 + 30 * DAY;
    const ev = events(relapse(T0 + 10 * DAY), reset(T0 + 20 * DAY));
    const mid = computeTracks(profile(), ev, T0 + 15 * DAY);
    expect(mid.tobaccoOrVape.state).toBe('relapse');
    expect(mid.tobaccoOrVape.currentMs).toBe(0);
    expect(mid.tobaccoOrVape.currentStartAt).toBeNull();
    expect(mid.tobaccoOrVape.totalFreeMs).toBe(10 * DAY);
    const t = computeTracks(profile(), ev, now);
    expect(t.tobaccoOrVape.state).toBe('free');
    expect(t.tobaccoOrVape.currentMs).toBe(10 * DAY);
    expect(t.tobaccoOrVape.totalFreeMs).toBe(20 * DAY);
    expect(t.tobaccoOrVape.bestMs).toBe(10 * DAY);
    expect(t.tobaccoOrVape.episodes).toHaveLength(2);
    expect(t.tobaccoOrVape.relapseCount).toBe(1);
  });

  it('NRT ativa: nicotine em estado nrt sem contador; nrt_ended abre a trilha; lapso de cigarro durante NRT não mexe na nicotina', () => {
    const p = profile({ nrt: { uses: true, kind: 'patch' }, nicotineFreeAt: null });
    const a = computeTracks(p, events(slip(T0 + DAY)), T0 + 2 * DAY);
    expect(a.nicotine.state).toBe('nrt');
    expect(a.nicotine.currentMs).toBe(0);
    expect(a.nicotine.slipCount).toBe(0);
    expect(a.combustion.currentMs).toBe(DAY);
    const b = computeTracks(p, events(nrtEnded(T0 + 10 * DAY)), T0 + 12 * DAY);
    expect(b.nicotine.state).toBe('free');
    expect(b.nicotine.currentMs).toBe(2 * DAY);
    expect(b.nicotine.totalFreeMs).toBe(2 * DAY);
  });

  it('eventos no futuro são ignorados; marco de parada futuro gera contador zero', () => {
    const t = computeTracks(profile({ quitAt: T0 + DAY, nicotineFreeAt: T0 + DAY }), events(slip(T0 + 5 * DAY)), T0);
    expect(t.tobaccoOrVape.currentMs).toBe(0);
    expect(t.tobaccoOrVape.slipCount).toBe(0);
  });
});
