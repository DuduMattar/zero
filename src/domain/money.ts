import type { AppEvent, Profile } from './types';
import { computeTracks, MS_DAY } from './tracks';

export interface RateSegment {
  from: number;
  to: number | null;
  unitsPerDay: number;
  pricePerUnit: number;
}

export interface MoneyResult {
  /** economia líquida (intervalos livres × taxa − lapsos) */
  saved: number;
  /** taxa diária vigente agora */
  perDay: number;
  /** unidades não consumidas (estimativa bruta pelos intervalos livres) */
  unitsNotConsumed: number;
  /** unidades consumidas em lapsos */
  unitsSlipped: number;
  segments: RateSegment[];
}

function segmentsFor(profile: Profile, events: AppEvent[]): RateSegment[] {
  const changes = events
    .filter((e): e is Extract<AppEvent, { type: 'price_change' }> => e.type === 'price_change')
    .sort((a, b) => a.effectiveFrom - b.effectiveFrom);
  const segs: RateSegment[] = [
    { from: -Infinity, to: null, unitsPerDay: profile.consumption.unitsPerDay, pricePerUnit: profile.consumption.pricePerUnit },
  ];
  for (const c of changes) {
    const last = segs[segs.length - 1];
    last.to = c.effectiveFrom;
    segs.push({ from: c.effectiveFrom, to: null, unitsPerDay: c.unitsPerDay, pricePerUnit: c.pricePerUnit });
  }
  return segs;
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/** Economia estimada com base nos intervalos livres da trilha geral (tabaco ou vape). */
export function money(profile: Profile, events: AppEvent[], now: number): MoneyResult {
  const segs = segmentsFor(profile, events);
  const track = computeTracks(profile, events, now).tobaccoOrVape;
  let units = 0;
  let saved = 0;
  for (const ep of track.episodes) {
    const end = ep.endAt ?? now;
    for (const s of segs) {
      const ms = overlap(ep.startAt, end, s.from, s.to ?? Infinity);
      if (ms <= 0) continue;
      const u = (ms / MS_DAY) * s.unitsPerDay;
      units += u;
      saved += u * s.pricePerUnit;
    }
  }
  let unitsSlipped = 0;
  for (const e of events) {
    if (e.type !== 'slip' || e.at > now) continue;
    const seg = segs.find((s) => e.at >= s.from && e.at < (s.to ?? Infinity)) ?? segs[segs.length - 1];
    unitsSlipped += e.units;
    saved -= e.units * seg.pricePerUnit;
  }
  const cur = segs[segs.length - 1];
  return {
    saved: Math.max(0, saved),
    perDay: cur.unitsPerDay * cur.pricePerUnit,
    unitsNotConsumed: units,
    unitsSlipped,
    segments: segs,
  };
}

export function projectSavings(perDay: number, horizonDays: number): number {
  return perDay * horizonDays;
}
