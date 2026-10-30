import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { DEFAULT_SETTINGS, type AppEvent, type Profile, type Settings } from '../domain/types';

/** undefined = ainda carregando; null = não existe */
export function useProfile(): Profile | null | undefined {
  return useLiveQuery(async () => (await db.profile.get('singleton')) ?? null, []);
}

export function useEvents(): AppEvent[] | undefined {
  return useLiveQuery(() => db.events.orderBy('at').toArray(), []);
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(async () => (await db.settings.get('singleton')) ?? DEFAULT_SETTINGS, []);
}

export function useSnapshotCount(): number | undefined {
  return useLiveQuery(() => db.backups.count(), []);
}
