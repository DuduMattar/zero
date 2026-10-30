import { useMemo } from 'react';
import { useEvents, useProfile, useSettings } from '../../data/queries';
import { computeTracks, type Tracks } from '../../domain/tracks';
import { money, type MoneyResult } from '../../domain/money';
import { DEFAULT_SETTINGS, type AppEvent, type Profile, type Settings } from '../../domain/types';
import { useNow } from './useNow';

export interface Data {
  profile: Profile;
  events: AppEvent[];
  settings: Settings;
  now: number;
  tracks: Tracks;
  money: MoneyResult;
}

/** Perfil + eventos + ajustes + cálculos derivados. null enquanto carrega ou sem perfil. */
export function useData(everyMs = 30_000): Data | null {
  const profile = useProfile();
  const events = useEvents();
  const settings = useSettings();
  const now = useNow(everyMs);
  return useMemo(() => {
    if (!profile || !events) return null;
    return {
      profile,
      events,
      settings: settings ?? DEFAULT_SETTINGS,
      now,
      tracks: computeTracks(profile, events, now),
      money: money(profile, events, now),
    };
  }, [profile, events, settings, now]);
}
