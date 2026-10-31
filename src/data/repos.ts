import { db, type Snapshot, type ZeroDB } from './db';
import { buildBackup, canonicalJson, mergeBackup, sha256Hex, validateBackup, type BackupFile, type BackupPayload } from '../domain/backup';
import { newId } from '../domain/ids';
import { DEFAULT_SETTINGS, SCHEMA_VERSION, type AppEvent, type CravingEvent, type NrtDoseEvent, type Profile, type Settings } from '../domain/types';

const AUTO_SNAPSHOTS_TO_KEEP = 7;

export async function getProfile(d: ZeroDB = db): Promise<Profile | null> {
  return (await d.profile.get('singleton')) ?? null;
}

export async function saveProfile(p: Profile, d: ZeroDB = db): Promise<void> {
  await d.profile.put({ ...p, id: 'singleton' });
}

export async function getSettings(d: ZeroDB = db): Promise<Settings> {
  return (await d.settings.get('singleton')) ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Settings>, d: ZeroDB = db): Promise<Settings> {
  const cur = await getSettings(d);
  const next = { ...cur, ...patch, id: 'singleton' as const };
  await d.settings.put(next);
  return next;
}

export async function addEvent<E extends AppEvent>(e: E, d: ZeroDB = db): Promise<E> {
  await d.events.add(e);
  return e;
}

/**
 * Encerra uma sessão do SOS numa transação só: episódio, dose confirmada (se houver) e limpeza do rascunho.
 * `put` com ids estáveis: repetir depois de uma falha no meio não duplica nada.
 */
export async function saveCravingSession(ev: CravingEvent, dose: NrtDoseEvent | null, d: ZeroDB = db): Promise<void> {
  await d.transaction('rw', d.events, d.settings, async () => {
    await d.events.put(ev);
    if (dose) await d.events.put(dose);
    const cur = (await d.settings.get('singleton')) ?? DEFAULT_SETTINGS;
    await d.settings.put({ ...cur, sosDraft: null });
  });
}

export async function listEvents(d: ZeroDB = db): Promise<AppEvent[]> {
  return d.events.orderBy('at').toArray();
}

export async function deleteEvent(id: string, d: ZeroDB = db): Promise<void> {
  await d.events.delete(id);
}

export function stamp(now: number, tz: string) {
  return { id: newId(now), tz, createdAt: now };
}

// ---------- Backup: payload, snapshots locais, exportação e importação ----------

export async function currentPayload(d: ZeroDB = db): Promise<BackupPayload> {
  const [profile, events, goals, settings] = await Promise.all([getProfile(d), listEvents(d), d.goals.toArray(), d.settings.get('singleton')]);
  return { profile, events, goals, settings: settings ?? null };
}

export async function createSnapshot(kind: Snapshot['kind'], now: number, d: ZeroDB = db): Promise<Snapshot> {
  const payload = await currentPayload(d);
  const checksum = await sha256Hex(canonicalJson(payload));
  const snap: Snapshot = { id: newId(now), createdAt: now, kind, schemaVersion: SCHEMA_VERSION, checksum, eventCount: payload.events.length, payload };
  await d.transaction('rw', d.backups, d.settings, async () => {
    await d.backups.add(snap);
    if (kind === 'auto') {
      const autos = await d.backups.where('kind').equals('auto').sortBy('createdAt');
      const extra = autos.length - AUTO_SNAPSHOTS_TO_KEEP;
      if (extra > 0) await d.backups.bulkDelete(autos.slice(0, extra).map((s) => s.id));
      const cur = (await d.settings.get('singleton')) ?? DEFAULT_SETTINGS;
      await d.settings.put({ ...cur, lastAutoSnapshotAt: now });
    }
  });
  return snap;
}

/** Snapshot automático no máximo uma vez por dia. Retorna true se criou. */
export async function autoSnapshotIfDue(now: number, d: ZeroDB = db): Promise<boolean> {
  const s = await getSettings(d);
  if (s.lastAutoSnapshotAt && now - s.lastAutoSnapshotAt < 86_400_000) return false;
  const hasData = (await d.events.count()) > 0 || (await d.profile.count()) > 0;
  if (!hasData) return false;
  await createSnapshot('auto', now, d);
  return true;
}

export async function listSnapshots(d: ZeroDB = db): Promise<Snapshot[]> {
  return (await d.backups.orderBy('createdAt').reverse().toArray()).map((s) => ({ ...s, payload: s.payload }));
}

export async function deleteSnapshot(id: string, d: ZeroDB = db): Promise<void> {
  await d.backups.delete(id);
}

export async function exportBackupFile(now: number, d: ZeroDB = db): Promise<BackupFile> {
  return buildBackup(await currentPayload(d), now);
}

export async function applyPayload(payload: BackupPayload, mode: 'merge' | 'replace', now: number, d: ZeroDB = db): Promise<void> {
  // Sempre guarda um snapshot manual antes de mexer nos dados.
  await createSnapshot('manual', now, d);
  const cur = await currentPayload(d);
  const next = mode === 'merge' ? mergeBackup(cur, payload) : payload;
  await d.transaction('rw', d.profile, d.events, d.goals, d.settings, async () => {
    await d.profile.clear();
    await d.events.clear();
    await d.goals.clear();
    if (next.profile) await d.profile.put({ ...next.profile, id: 'singleton' });
    if (next.events.length) await d.events.bulkPut(next.events);
    if (next.goals.length) await d.goals.bulkPut(next.goals);
    if (next.settings) await d.settings.put({ ...next.settings, id: 'singleton' });
  });
}

export async function restoreSnapshot(id: string, now: number, d: ZeroDB = db): Promise<void> {
  const snap = await d.backups.get(id);
  if (!snap) throw new Error('Snapshot não encontrado.');
  await applyPayload(snap.payload, 'replace', now, d);
}

export async function parseBackupText(text: string) {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false as const, error: 'O arquivo não é um JSON válido.' };
  }
  return validateBackup(json);
}

export async function wipeAll(d: ZeroDB = db): Promise<void> {
  await d.transaction('rw', d.profile, d.events, d.goals, d.settings, d.backups, async () => {
    await Promise.all([d.profile.clear(), d.events.clear(), d.goals.clear(), d.settings.clear(), d.backups.clear()]);
  });
}

// ---------- Armazenamento persistente (sem garantia no iOS) ----------

export type PersistStatus = 'granted' | 'denied' | 'unsupported';

export async function requestPersistentStorage(): Promise<PersistStatus> {
  try {
    if (!('storage' in navigator) || !navigator.storage?.persist) return 'unsupported';
    const already = await navigator.storage.persisted?.();
    if (already) return 'granted';
    const ok = await navigator.storage.persist();
    return ok ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    if (!e) return null;
    return { usage: e.usage ?? 0, quota: e.quota ?? 0 };
  } catch {
    return null;
  }
}
