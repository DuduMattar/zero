import type { AppEvent, Profile, SlipEvent, RelapseEvent, QuitMarkerResetEvent, NrtEndedEvent, CravingEvent, PriceChangeEvent, ProductId } from '../../src/domain/types';

export const TZ = 'America/Sao_Paulo';
export const DAY = 86_400_000;
export const H = 3_600_000;
/** 2026-10-01T12:00:00-03:00 */
export const T0 = Date.UTC(2026, 9, 1, 15, 0, 0);

let seq = 0;
const id = () => `ev${++seq}`;

export function profile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'singleton',
    products: ['cigarette', 'vape'],
    consumption: { product: 'cigarette', unitsPerDay: 10, pricePerUnit: 1 },
    currency: 'BRL',
    quitAt: T0,
    nicotineFreeAt: T0,
    nrt: { uses: false },
    triggers: [],
    reasons: [],
    goals: [],
    tz: TZ,
    createdAt: T0,
    updatedAt: T0,
    ...over,
  };
}

export function slip(at: number, product: ProductId = 'cigarette', hadNicotine = true, units = 1): SlipEvent {
  return { id: id(), type: 'slip', at, tz: TZ, createdAt: at, product, hadNicotine, units, trigger: null, feeling: null, note: '', lesson: '' };
}
export function relapse(at: number, products: ProductId[] = ['cigarette']): RelapseEvent {
  return { id: id(), type: 'relapse', at, tz: TZ, createdAt: at, products, hadNicotine: true, note: '' };
}
export function reset(at: number, newQuitAt = at, newNicotineFreeAt: number | null = null): QuitMarkerResetEvent {
  return { id: id(), type: 'quit_marker_reset', at, tz: TZ, createdAt: at, newQuitAt, newNicotineFreeAt, reason: '' };
}
export function nrtEnded(at: number, nicotineFreeAt = at): NrtEndedEvent {
  return { id: id(), type: 'nrt_ended', at, tz: TZ, createdAt: at, nicotineFreeAt };
}
export function priceChange(at: number, unitsPerDay: number, pricePerUnit: number): PriceChangeEvent {
  return { id: id(), type: 'price_change', at, tz: TZ, createdAt: at, unitsPerDay, pricePerUnit, effectiveFrom: at };
}
export function craving(at: number, strategy: string, before: number | null, after: number | null, outcome: CravingEvent['outcome'] = 'resisted', ratings: CravingEvent['ratings'] = []): CravingEvent {
  return { id: id(), type: 'craving', at, tz: TZ, createdAt: at, strategy, durationSec: 180, intensityBefore: before, ratings, intensityAfter: after, trigger: null, outcome };
}
export const events = (...e: AppEvent[]): AppEvent[] => e;
