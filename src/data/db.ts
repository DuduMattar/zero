import Dexie, { type EntityTable } from 'dexie';
import type { AppEvent, Goal, Profile, Settings } from '../domain/types';
import type { BackupPayload } from '../domain/backup';

export interface Snapshot {
  id: string;
  createdAt: number;
  kind: 'auto' | 'manual';
  schemaVersion: number;
  checksum: string;
  eventCount: number;
  payload: BackupPayload;
}

export class ZeroDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>;
  events!: EntityTable<AppEvent, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  backups!: EntityTable<Snapshot, 'id'>;

  constructor(name = 'zero') {
    super(name);
    this.version(1).stores({
      profile: 'id',
      events: 'id, type, at, [type+at]',
      goals: 'id, status, createdAt',
      settings: 'id',
      backups: 'id, createdAt, kind',
    });
  }
}

export const db = new ZeroDB();
