import type { AppEvent } from './types';
import { cravingDrop } from './craving';
import { MS_DAY, type Episode } from './tracks';
import { MIN_CRAVINGS_FOR_HOUR } from './thresholds';

const dayKey = (ms: number, tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));

export interface DayPoint {
  key: string; // YYYY-MM-DD
  label: string; // dd/MM
  cravings: number;
  resisted: number;
  avgIntensity: number | null;
  mood: number | null;
  sleep: number | null;
  slips: number;
}

/** Série diária dos últimos `days` dias (inclui hoje). */
export function dailySeries(events: AppEvent[], tz: string, now: number, days: number): DayPoint[] {
  const out: DayPoint[] = [];
  const idx = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const ms = now - i * MS_DAY;
    const key = dayKey(ms, tz);
    const label = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit' }).format(new Date(ms));
    const p: DayPoint = { key, label, cravings: 0, resisted: 0, avgIntensity: null, mood: null, sleep: null, slips: 0 };
    out.push(p);
    idx.set(key, p);
  }
  const ints = new Map<string, number[]>();
  const moods = new Map<string, number[]>();
  const sleeps = new Map<string, number[]>();
  for (const e of events) {
    if (e.at > now) continue;
    const p = idx.get(dayKey(e.at, tz));
    if (!p) continue;
    if (e.type === 'craving') {
      p.cravings++;
      if (e.outcome === 'resisted') p.resisted++;
      const first = e.intensityBefore ?? e.ratings[0]?.intensity ?? e.intensityAfter;
      if (first != null) ints.set(p.key, [...(ints.get(p.key) ?? []), first]);
    } else if (e.type === 'diary') {
      moods.set(p.key, [...(moods.get(p.key) ?? []), e.mood]);
      sleeps.set(p.key, [...(sleeps.get(p.key) ?? []), e.sleep]);
    } else if (e.type === 'slip') p.slips++;
  }
  const avg = (a?: number[]) => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  for (const p of out) {
    p.avgIntensity = avg(ints.get(p.key));
    p.mood = avg(moods.get(p.key));
    p.sleep = avg(sleeps.get(p.key));
  }
  return out;
}

export interface HourStat {
  hour: number;
  n: number;
}

/** Vontades por hora do dia. `sufficient` só com amostra mínima. */
export function cravingsByHour(events: AppEvent[], tz: string): { hours: HourStat[]; total: number; sufficient: boolean; peak: number | null } {
  const hours: HourStat[] = Array.from({ length: 24 }, (_, hour) => ({ hour, n: 0 }));
  let total = 0;
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' });
  for (const e of events) {
    if (e.type !== 'craving') continue;
    const h = Number(fmt.formatToParts(new Date(e.at)).find((p) => p.type === 'hour')?.value ?? 0);
    hours[h].n++;
    total++;
  }
  const sufficient = total >= MIN_CRAVINGS_FOR_HOUR;
  const peak = sufficient ? hours.reduce((a, b) => (b.n > a.n ? b : a)).hour : null;
  return { hours, total, sufficient, peak };
}

export function topTriggers(events: AppEvent[]): { trigger: string; n: number }[] {
  const m = new Map<string, number>();
  for (const e of events) {
    const t = e.type === 'craving' || e.type === 'slip' ? e.trigger : null;
    if (t) m.set(t, (m.get(t) ?? 0) + 1);
  }
  return [...m.entries()].map(([trigger, n]) => ({ trigger, n })).sort((a, b) => b.n - a.n);
}

export function avgDropOverall(events: AppEvent[]): { avg: number | null; n: number } {
  const drops = events.filter((e): e is Extract<AppEvent, { type: 'craving' }> => e.type === 'craving').map(cravingDrop).filter((d): d is number => d != null);
  return { avg: drops.length ? drops.reduce((a, b) => a + b, 0) / drops.length : null, n: drops.length };
}

export type DayStatus = 'free' | 'slip' | 'relapse' | 'before' | 'future';

/** Status de cada dia do calendário: livre / lapso / recaída / antes do início / futuro. */
export function calendarDays(episodes: Episode[], events: AppEvent[], quitAt: number, tz: string, now: number, days: number): { key: string; day: number; status: DayStatus }[] {
  const slipDays = new Set(events.filter((e) => e.type === 'slip').map((e) => dayKey(e.at, tz)));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const ms = now - i * MS_DAY;
    const key = dayKey(ms, tz);
    const day = Number(key.slice(-2));
    let status: DayStatus = 'before';
    if (ms < quitAt - MS_DAY) status = 'before';
    else if (slipDays.has(key)) status = 'slip';
    else {
      const start = ms - (ms % MS_DAY);
      const end = start + MS_DAY;
      const free = episodes.some((ep) => ep.startAt < end && (ep.endAt ?? now) > start);
      status = free ? 'free' : ms >= quitAt ? 'relapse' : 'before';
    }
    out.push({ key, day, status });
  }
  return out;
}
