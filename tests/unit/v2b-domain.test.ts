import { describe, expect, it } from 'vitest';
import { activityForDay, PLAN } from '../../src/content/plan90.pt-BR';
import { eventsToCsv } from '../../src/domain/csv';
import { isSunday, weekKey, weeklyReview } from '../../src/domain/review';
import { DAY, T0, TZ, craving, events, slip } from './fixtures';

describe('plano de 90 dias', () => {
  it('tem atividade para todo dia de −7 a 90 e nenhuma passa de 10 min', () => {
    for (let d = -7; d <= 90; d++) {
      const a = activityForDay(d);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.minutes).toBeLessThanOrEqual(10);
    }
    expect(activityForDay(0).id).toBe('d0');
    expect(activityForDay(9).id).toBe('d8'); // repete a mais próxima anterior
    expect(activityForDay(200).id).toBe('maint');
    expect(new Set(PLAN.map((a) => a.id)).size).toBe(PLAN.length);
  });
});

describe('revisão semanal', () => {
  it('compara esta semana com a anterior de forma descritiva', () => {
    const now = T0 + 14 * DAY;
    const ev = events(
      craving(T0 + 2 * DAY, 'breathing', 8, 3), craving(T0 + 3 * DAY, 'breathing', 7, 4), craving(T0 + 4 * DAY, 'water', 6, 6, 'slipped'),
      craving(T0 + 9 * DAY, 'breathing', 5, 1), slip(T0 + 10 * DAY),
    );
    const r = weeklyReview(ev, now);
    expect(r.lastWeek.cravings).toBe(3);
    expect(r.thisWeek.cravings).toBe(1);
    expect(r.thisWeek.slips).toBe(1);
    expect(r.lines.join(' ')).toMatch(/Menos vontades registradas: 1 contra 3/);
    expect(r.lines.join(' ')).toMatch(/1 lapso registrado/);
    expect(r.lines.some((l) => /causa|comprova/.test(l))).toBe(false);
  });
  it('chave da semana e domingo', () => {
    expect(weekKey(T0, TZ)).toBe('2026-09-28'); // 1/10/2026 é quinta → segunda 28/9
    expect(isSunday(Date.UTC(2026, 9, 25, 15), TZ)).toBe(true);
    expect(isSunday(T0, TZ)).toBe(false);
  });
});

describe('csv', () => {
  it('uma linha por evento, com BOM e aspas escapadas', () => {
    const c = craving(T0, 'breathing', 8, 2);
    const s = slip(T0 + DAY);
    s.note = 'disse "só um", e não foi';
    const csv = eventsToCsv(events(c, s), TZ);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('﻿data_hora,tipo,resumo,detalhes');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain('só um'); expect(lines[2].startsWith('"')).toBe(true);
    expect(lines[1]).toContain('craving');
  });
});
