import { describe, expect, it } from 'vitest';
import { buildBackup, mergeBackup, previewImport, validateBackup, type BackupPayload } from '../../src/domain/backup';
import { DEFAULT_SETTINGS } from '../../src/domain/types';
import { T0, craving, profile, slip } from './fixtures';

const payload = (): BackupPayload => ({
  profile: profile(),
  events: [slip(T0 + 1000), craving(T0 + 2000, 'breathing', 7, 2)],
  goals: [],
  settings: { ...DEFAULT_SETTINGS, onboardingDone: true },
});

describe('backup', () => {
  it('exporta e valida de volta igual', async () => {
    const file = await buildBackup(payload(), T0);
    const json = JSON.parse(JSON.stringify(file));
    const r = await validateBackup(json);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.file.payload.events).toHaveLength(2);
  });

  it('recusa checksum alterado', async () => {
    const file = await buildBackup(payload(), T0);
    const json = JSON.parse(JSON.stringify(file));
    json.payload.events[0].units = 99;
    const r = await validateBackup(json);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Checksum/);
  });

  it('recusa formato inválido', async () => {
    const r = await validateBackup({ app: 'zero', schemaVersion: 1, exportedAt: 1, checksum: 'x', payload: {} });
    expect(r.ok).toBe(false);
  });

  it('preview conta novos e duplicados; merge faz união por id', async () => {
    const current = payload();
    const incomingPayload: BackupPayload = { ...payload(), events: [...current.events, slip(T0 + 5000)] };
    const file = await buildBackup(incomingPayload, T0 + 10);
    const pv = previewImport(file, current);
    expect(pv.incomingEvents).toBe(3);
    expect(pv.newEvents).toBe(1);
    expect(pv.duplicateEvents).toBe(2);
    const merged = mergeBackup(current, file.payload);
    expect(merged.events).toHaveLength(3);
  });
});
