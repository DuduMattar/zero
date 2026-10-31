import { z } from 'zod';
import { SCHEMA_VERSION, type AppEvent, type Goal, type Profile, type Settings } from './types';

export interface BackupPayload {
  profile: Profile | null;
  events: AppEvent[];
  goals: Goal[];
  settings: Settings | null;
}

export interface BackupFile {
  app: 'zero';
  schemaVersion: number;
  exportedAt: number;
  checksum: string;
  payload: BackupPayload;
}

/** JSON canônico (chaves ordenadas) para o checksum ser estável. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return Object.keys(o)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        if (o[k] !== undefined) acc[k] = sortKeys(o[k]);
        return acc;
      }, {});
  }
  return v;
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function buildBackup(payload: BackupPayload, exportedAt: number): Promise<BackupFile> {
  const checksum = await sha256Hex(canonicalJson(payload));
  return { app: 'zero', schemaVersion: SCHEMA_VERSION, exportedAt, checksum, payload };
}

const base = { id: z.string().min(1), at: z.number(), tz: z.string(), createdAt: z.number() };
const eventSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('craving'), strategy: z.string(), durationSec: z.number(), intensityBefore: z.number().nullable(), intensityBeforeAtSec: z.number().nullable().optional(), ratings: z.array(z.object({ atSec: z.number(), intensity: z.number() })), intensityAfter: z.number().nullable(), trigger: z.string().nullable(), outcome: z.enum(['resisted', 'slipped', 'continued', 'abandoned']) }),
  z.object({ ...base, type: z.literal('diary'), mood: z.number(), anxiety: z.number(), irritability: z.number(), energy: z.number(), sleep: z.number(), focus: z.number(), craving: z.number(), activity: z.boolean(), symptoms: z.array(z.string()), text: z.string() }),
  z.object({ ...base, type: z.literal('slip'), product: z.string(), hadNicotine: z.boolean(), units: z.number(), untilAt: z.number().nullable().optional(), trigger: z.string().nullable(), feeling: z.string().nullable(), note: z.string(), lesson: z.string() }),
  z.object({ ...base, type: z.literal('relapse'), products: z.array(z.string()), hadNicotine: z.boolean(), note: z.string() }),
  z.object({ ...base, type: z.literal('quit_marker_reset'), newQuitAt: z.number(), newNicotineFreeAt: z.number().nullable(), reason: z.string() }),
  z.object({ ...base, type: z.literal('nrt_ended'), nicotineFreeAt: z.number() }),
  z.object({ ...base, type: z.literal('price_change'), unitsPerDay: z.number(), pricePerUnit: z.number(), effectiveFrom: z.number() }),
  z.object({ ...base, type: z.literal('note'), text: z.string() }),
  z.object({ ...base, type: z.literal('achievement_unlocked'), achievementId: z.string() }),
  z.object({ ...base, type: z.literal('activity_done'), day: z.number(), activityId: z.string() }),
  z.object({ ...base, type: z.literal('nrt_dose'), kind: z.enum(['patch', 'gum', 'lozenge', 'other']), mg: z.number().nullable(), note: z.string() }),
  z.object({ ...base, type: z.literal('backup_made'), kind: z.enum(['export', 'share']), eventCount: z.number(), checksum: z.string() }),
]);

const profileSchema = z.object({
  id: z.literal('singleton'),
  products: z.array(z.string()),
  consumption: z.object({ product: z.string(), unitsPerDay: z.number(), pricePerUnit: z.number() }),
  currency: z.string(),
  quitAt: z.number(),
  nicotineFreeAt: z.number().nullable(),
  nrt: z.object({ uses: z.boolean(), kind: z.string().optional(), plannedEndAt: z.number().nullable().optional() }),
  yearsUsing: z.number().nullable().optional(),
  longestQuitDays: z.number().nullable().optional(),
  triedBefore: z.boolean().nullable().optional(),
  triggers: z.array(z.string()),
  reasons: z.array(z.string()),
  goals: z.array(z.string()),
  tz: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const settingsSchema = z.object({
  id: z.literal('singleton'),
  theme: z.enum(['system', 'dark', 'light']),
  reducedMotion: z.enum(['system', 'on']),
  discreetMode: z.boolean(),
  backupReminderDays: z.number(),
  lastExternalBackupAt: z.number().nullable(),
  lastAutoSnapshotAt: z.number().nullable(),
  sosDefaultDurationSec: z.number(),
  onboardingDone: z.boolean(),
  schemaVersion: z.number(),
  lastWeeklyReviewKey: z.string().nullable().optional(),
});

const goalSchema = z.object({ id: z.string(), title: z.string(), amount: z.number(), createdAt: z.number(), status: z.enum(['active', 'reached', 'archived']) });

export const backupFileSchema = z.object({
  app: z.literal('zero'),
  schemaVersion: z.number().int().min(1).max(SCHEMA_VERSION),
  exportedAt: z.number(),
  checksum: z.string().length(64),
  payload: z.object({
    profile: profileSchema.nullable(),
    events: z.array(eventSchema),
    goals: z.array(goalSchema),
    settings: settingsSchema.nullable(),
  }),
});

export type ValidationResult = { ok: true; file: BackupFile } | { ok: false; error: string };

/** Valida estrutura (zod) e integridade (checksum). */
export async function validateBackup(json: unknown): Promise<ValidationResult> {
  const parsed = backupFileSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `Arquivo inválido: ${first?.path.join('.') || 'raiz'} — ${first?.message ?? 'formato inesperado'}` };
  }
  const file = parsed.data as unknown as BackupFile;
  const expected = await sha256Hex(canonicalJson(file.payload));
  if (expected !== file.checksum) return { ok: false, error: 'Checksum não confere: o arquivo foi alterado ou está corrompido.' };
  return { ok: true, file };
}

export interface ImportPreview {
  incomingEvents: number;
  newEvents: number;
  duplicateEvents: number;
  incomingGoals: number;
  newGoals: number;
  hasProfile: boolean;
  profileDiffers: boolean;
  exportedAt: number;
}

export function previewImport(file: BackupFile, current: BackupPayload): ImportPreview {
  const ids = new Set(current.events.map((e) => e.id));
  const newEvents = file.payload.events.filter((e) => !ids.has(e.id)).length;
  const goalIds = new Set(current.goals.map((g) => g.id));
  const newGoals = file.payload.goals.filter((g) => !goalIds.has(g.id)).length;
  return {
    incomingEvents: file.payload.events.length,
    newEvents,
    duplicateEvents: file.payload.events.length - newEvents,
    incomingGoals: file.payload.goals.length,
    newGoals,
    hasProfile: file.payload.profile != null,
    profileDiffers: canonicalJson(file.payload.profile) !== canonicalJson(current.profile),
    exportedAt: file.exportedAt,
  };
}

/** Mescla: união por id; perfil e ajustes do mais recente (updatedAt / exportedAt). */
export function mergeBackup(current: BackupPayload, incoming: BackupPayload): BackupPayload {
  const events = new Map(current.events.map((e) => [e.id, e]));
  for (const e of incoming.events) if (!events.has(e.id)) events.set(e.id, e);
  const goals = new Map(current.goals.map((g) => [g.id, g]));
  for (const g of incoming.goals) if (!goals.has(g.id)) goals.set(g.id, g);
  let profile = current.profile;
  if (!profile || (incoming.profile && incoming.profile.updatedAt > profile.updatedAt)) profile = incoming.profile;
  const settings = current.settings ?? incoming.settings;
  return {
    profile,
    events: [...events.values()].sort((a, b) => a.at - b.at),
    goals: [...goals.values()],
    settings,
  };
}
