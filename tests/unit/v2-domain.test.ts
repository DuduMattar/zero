import { describe, expect, it } from 'vitest';
import { fromConsumption, monthlyCost, toConsumption } from '../../src/domain/consumption';
import { earnedAchievements, newAchievements } from '../../src/domain/achievements';
import { phaseOf, programDay } from '../../src/domain/program';
import { calendarDays, cravingsByHour, dailySeries } from '../../src/domain/stats';
import { computeTracks } from '../../src/domain/tracks';
import { DAY, H, T0, TZ, craving, events, profile, slip } from './fixtures';
import type { AppEvent } from '../../src/domain/types';

describe('consumption', () => {
  it('pod que dura 3 dias a R$60 → 1/3 pod por dia, R$20/dia', () => {
    const c = toConsumption({ product: 'vape', amount: 3, packPrice: 60 })!;
    expect(c.unitsPerDay).toBeCloseTo(1 / 3);
    expect(c.pricePerUnit).toBe(60);
    expect(monthlyCost(c)).toBeCloseTo(608.8, 0);
    const back = fromConsumption(c);
    expect(back.amount).toBeCloseTo(3);
    expect(back.packPrice).toBe(60);
  });
  it('20 cigarros/dia, maço R$12 → R$0,60 por cigarro', () => {
    const c = toConsumption({ product: 'cigarette', amount: 20, packPrice: 12 })!;
    expect(c.unitsPerDay).toBe(20);
    expect(c.pricePerUnit).toBeCloseTo(0.6);
    expect(fromConsumption(c)).toEqual({ product: 'cigarette', amount: 20, packPrice: 12 });
  });
  it('lata de sachês (20) que dura 2 dias → 10/dia', () => {
    const c = toConsumption({ product: 'pouch', amount: 2, packPrice: 40 })!;
    expect(c.unitsPerDay).toBe(10);
    expect(c.pricePerUnit).toBe(2);
  });
  it('sem quantidade → null', () => {
    expect(toConsumption({ product: 'vape', amount: 0, packPrice: 60 })).toBeNull();
  });
});

describe('achievements', () => {
  it('tempo e comportamento; idempotente', () => {
    const ev: AppEvent[] = events(craving(T0 + H, 'breathing', 8, 2), slip(T0 + DAY)); // episódios: 1 dia e 7 dias
    (ev[1] as Extract<AppEvent, { type: 'slip' }>).lesson = 'não ir ao bar sem jantar';
    const now = T0 + 8 * DAY;
    const earned = earnedAchievements(profile(), ev, now);
    expect(earned).toEqual(expect.arrayContaining(['t24h', 't3d', 't7d', 'c1', 's1']));
    expect(earned).not.toContain('t14d');
    const fresh = newAchievements(profile(), ev, now);
    expect(fresh).toEqual(earned);
    const recorded: AppEvent[] = [...ev, ...earned.map((id, i) => ({ id: 'a' + i, type: 'achievement_unlocked' as const, at: now, tz: TZ, createdAt: now, achievementId: id }))];
    expect(newAchievements(profile(), recorded, now)).toEqual([]);
  });
  it('recorde conta mesmo após lapso', () => {
    const now = T0 + 10 * DAY;
    expect(earnedAchievements(profile(), events(slip(T0 + 8 * DAY)), now)).toContain('t7d');
  });
});

describe('program', () => {
  it('dia do programa por calendário do fuso', () => {
    expect(programDay(T0, T0, TZ)).toBe(0);
    expect(programDay(T0, T0 + 3 * DAY, TZ)).toBe(3);
    expect(programDay(T0 + 5 * DAY, T0, TZ)).toBe(-5);
    expect(phaseOf(-3)).toBe('preparacao');
    expect(phaseOf(7)).toBe('fase1');
    expect(phaseOf(45)).toBe('fase3');
    expect(phaseOf(120)).toBe('manutencao');
  });
});

describe('stats', () => {
  it('série diária agrega vontades, intensidade e humor', () => {
    const ev: AppEvent[] = events(craving(T0 + H, 'breathing', 8, 2), craving(T0 + 2 * H, 'water', 6, 6, 'slipped'));
    const s = dailySeries(ev, TZ, T0 + 3 * H, 3);
    expect(s).toHaveLength(3);
    const today = s[2];
    expect(today.cravings).toBe(2);
    expect(today.resisted).toBe(1);
    expect(today.avgIntensity).toBe(7);
  });
  it('horas só com amostra suficiente', () => {
    const few = events(...Array.from({ length: 5 }, (_, i) => craving(T0 + i * 60_000, 'breathing', 5, 2)));
    expect(cravingsByHour(few, TZ).sufficient).toBe(false);
    const many = events(...Array.from({ length: 15 }, (_, i) => craving(T0 + i * 60_000, 'breathing', 5, 2)));
    const r = cravingsByHour(many, TZ);
    expect(r.sufficient).toBe(true);
    expect(r.peak).toBe(12); // T0 = 12:00 em São Paulo
  });
  it('calendário marca livre, lapso e antes', () => {
    const now = T0 + 4 * DAY;
    const ev = events(slip(T0 + 2 * DAY));
    const t = computeTracks(profile(), ev, now);
    const days = calendarDays(t.tobaccoOrVape.episodes, ev, T0, TZ, now, 7);
    expect(days.map((d) => d.status)).toEqual(['before', 'before', 'free', 'free', 'slip', 'free', 'free']);
  });
});
