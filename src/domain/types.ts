// Tipos do domínio. Nenhum import de React, Dexie ou Date.now() aqui.

export type ProductClass = 'combustion' | 'vape' | 'heated' | 'oral' | 'nrt';

export type ProductId =
  | 'cigarette'
  | 'rolled'
  | 'cigar'
  | 'vape'
  | 'heated'
  | 'pouch'
  | 'nrt_patch'
  | 'nrt_gum'
  | 'nrt_lozenge';

export interface ProductDef {
  id: ProductId;
  label: string;
  cls: ProductClass;
  unitLabel: string; // "cigarro", "pod", "sachê"...
  unitLabelPlural: string;
  /** Produto costuma ter nicotina (vape pode ser 0 mg). */
  nicotineByDefault: boolean;
  /** Pode ser escolhido como "o que eu usava" no onboarding. */
  selectable: boolean;
}

export const PRODUCTS: readonly ProductDef[] = [
  { id: 'cigarette', label: 'Cigarro', cls: 'combustion', unitLabel: 'cigarro', unitLabelPlural: 'cigarros', nicotineByDefault: true, selectable: true },
  { id: 'rolled', label: 'Tabaco enrolado', cls: 'combustion', unitLabel: 'cigarro enrolado', unitLabelPlural: 'cigarros enrolados', nicotineByDefault: true, selectable: true },
  { id: 'cigar', label: 'Charuto / cachimbo', cls: 'combustion', unitLabel: 'unidade', unitLabelPlural: 'unidades', nicotineByDefault: true, selectable: true },
  { id: 'vape', label: 'Vape / pod', cls: 'vape', unitLabel: 'pod', unitLabelPlural: 'pods', nicotineByDefault: true, selectable: true },
  { id: 'heated', label: 'Tabaco aquecido', cls: 'heated', unitLabel: 'stick', unitLabelPlural: 'sticks', nicotineByDefault: true, selectable: true },
  { id: 'pouch', label: 'Sachê / bolsa de nicotina', cls: 'oral', unitLabel: 'sachê', unitLabelPlural: 'sachês', nicotineByDefault: true, selectable: true },
  { id: 'nrt_patch', label: 'Adesivo de nicotina (NRT)', cls: 'nrt', unitLabel: 'adesivo', unitLabelPlural: 'adesivos', nicotineByDefault: true, selectable: false },
  { id: 'nrt_gum', label: 'Goma de nicotina (NRT)', cls: 'nrt', unitLabel: 'goma', unitLabelPlural: 'gomas', nicotineByDefault: true, selectable: false },
  { id: 'nrt_lozenge', label: 'Pastilha de nicotina (NRT)', cls: 'nrt', unitLabel: 'pastilha', unitLabelPlural: 'pastilhas', nicotineByDefault: true, selectable: false },
];

export const productById = (id: ProductId): ProductDef => {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(`Produto desconhecido: ${id}`);
  return p;
};

export type TrackId = 'combustion' | 'vape' | 'tobaccoOrVape' | 'nicotine';
export const TRACK_IDS: readonly TrackId[] = ['tobaccoOrVape', 'combustion', 'vape', 'nicotine'];

export interface Consumption {
  /** Produto principal usado antes de parar. */
  product: ProductId;
  /** Unidades por dia (pode ser fracionário, ex.: 0.3 pod/dia). */
  unitsPerDay: number;
  /** Preço por unidade na moeda do perfil. */
  pricePerUnit: number;
}

export interface Profile {
  id: 'singleton';
  products: ProductId[];
  consumption: Consumption;
  currency: string; // 'BRL'
  /** Marco inicial de parada de tabaco/vape (epoch ms). */
  quitAt: number;
  /** Marco inicial sem nicotina; null enquanto em NRT. */
  nicotineFreeAt: number | null;
  nrt: { uses: boolean; kind?: 'patch' | 'gum' | 'lozenge' | 'other'; plannedEndAt?: number | null };
  yearsUsing?: number | null;
  longestQuitDays?: number | null;
  triedBefore?: boolean | null;
  triggers: string[];
  reasons: string[];
  goals: string[];
  tz: string;
  createdAt: number;
  updatedAt: number;
}

export interface CravingRating {
  atSec: number;
  intensity: number; // 0-10
}

interface EventBase {
  id: string;
  at: number; // epoch ms
  tz: string;
  createdAt: number;
}

export interface CravingEvent extends EventBase {
  type: 'craving';
  strategy: string;
  durationSec: number;
  intensityBefore: number | null; // só conta como linha de base se avaliada nos primeiros segundos (ver craving.ts)
  intensityBeforeAtSec?: number | null;
  ratings: CravingRating[];
  intensityAfter: number | null;
  trigger: string | null;
  /** resisted: diminuiu · continued: saiu com a vontade ainda presente · slipped: houve uso · abandoned: fechou sem responder (dados antigos) */
  outcome: 'resisted' | 'slipped' | 'continued' | 'abandoned';
}

export interface DiaryEvent extends EventBase {
  type: 'diary';
  mood: number; // 1-5
  anxiety: number; // 1-5
  irritability: number;
  energy: number;
  sleep: number;
  focus: number;
  craving: number; // 0-10
  activity: boolean;
  symptoms: string[];
  text: string;
}

export interface SlipEvent extends EventBase {
  type: 'slip';
  product: ProductId;
  hadNicotine: boolean;
  units: number;
  /** fim do consumo, quando o lapso durou um tempo (ex.: noite inteira). null = momento único */
  untilAt?: number | null;
  trigger: string | null;
  feeling: string | null;
  note: string;
  lesson: string;
}

export interface RelapseEvent extends EventBase {
  type: 'relapse';
  products: ProductId[];
  hadNicotine: boolean;
  note: string;
}

export interface QuitMarkerResetEvent extends EventBase {
  type: 'quit_marker_reset';
  newQuitAt: number;
  newNicotineFreeAt: number | null;
  reason: string;
}

export interface NrtEndedEvent extends EventBase {
  type: 'nrt_ended';
  nicotineFreeAt: number;
}

export interface PriceChangeEvent extends EventBase {
  type: 'price_change';
  unitsPerDay: number;
  pricePerUnit: number;
  effectiveFrom: number;
}

export interface NoteEvent extends EventBase {
  type: 'note';
  text: string;
}

export interface AchievementUnlockedEvent extends EventBase {
  type: 'achievement_unlocked';
  achievementId: string;
}

export interface ActivityDoneEvent extends EventBase {
  type: 'activity_done';
  /** dia do programa (−7…90) */
  day: number;
  activityId: string;
}

export interface NrtDoseEvent extends EventBase {
  type: 'nrt_dose';
  kind: 'patch' | 'gum' | 'lozenge' | 'other';
  mg: number | null;
  note: string;
}

export interface BackupMadeEvent extends EventBase {
  type: 'backup_made';
  kind: 'export' | 'share';
  eventCount: number;
  checksum: string;
}

export type AppEvent =
  | CravingEvent
  | DiaryEvent
  | SlipEvent
  | RelapseEvent
  | QuitMarkerResetEvent
  | NrtEndedEvent
  | PriceChangeEvent
  | NoteEvent
  | AchievementUnlockedEvent
  | ActivityDoneEvent
  | NrtDoseEvent
  | BackupMadeEvent;

export type EventType = AppEvent['type'];

export interface Goal {
  id: string;
  title: string;
  amount: number;
  createdAt: number;
  status: 'active' | 'reached' | 'archived';
}

export interface Settings {
  id: 'singleton';
  theme: 'system' | 'dark' | 'light';
  reducedMotion: 'system' | 'on';
  discreetMode: boolean;
  backupReminderDays: number;
  lastExternalBackupAt: number | null;
  lastAutoSnapshotAt: number | null;
  sosDefaultDurationSec: number;
  onboardingDone: boolean;
  schemaVersion: number;
  /** semana (YYYY-WW) da última revisão semanal vista */
  lastWeeklyReviewKey?: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  theme: 'system',
  reducedMotion: 'system',
  discreetMode: false,
  backupReminderDays: 14,
  lastExternalBackupAt: null,
  lastAutoSnapshotAt: null,
  sosDefaultDurationSec: 180,
  onboardingDone: false,
  schemaVersion: 1,
};

export const SCHEMA_VERSION = 1;
