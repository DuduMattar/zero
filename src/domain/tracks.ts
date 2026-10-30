import { productById, TRACK_IDS, type AppEvent, type ProductId, type Profile, type TrackId } from './types';

export interface Episode {
  startAt: number;
  endAt: number | null; // null = episódio aberto
  endedBy: 'slip' | 'relapse' | null;
}

export type TrackState = 'free' | 'relapse' | 'nrt' | 'not_applicable';

export interface TrackResult {
  id: TrackId;
  state: TrackState;
  /** ms do episódio aberto; 0 quando não há episódio aberto */
  currentMs: number;
  /** maior episódio (fechado ou aberto), em ms */
  bestMs: number;
  /** soma de todos os intervalos livres, sem sobreposição, em ms */
  totalFreeMs: number;
  /** início do episódio aberto, se houver */
  currentStartAt: number | null;
  /** início da "corrida" atual: primeiro episódio depois da última recaída/novo marco. Lapsos isolados não zeram. */
  runStartAt: number | null;
  /** ms desde runStartAt (relógio da linha do tempo de saúde) */
  runMs: number;
  episodes: Episode[];
  slipCount: number;
  relapseCount: number;
}

export type Tracks = Record<TrackId, TrackResult>;

/** Um consumo deste produto (com/sem nicotina) afeta a trilha? */
export function affectsTrack(track: TrackId, productId: ProductId, hadNicotine: boolean): boolean {
  const cls = productById(productId).cls;
  switch (track) {
    case 'combustion':
      return cls === 'combustion';
    case 'vape':
      return cls === 'vape';
    case 'tobaccoOrVape':
      return cls === 'combustion' || cls === 'vape' || cls === 'heated';
    case 'nicotine':
      // NRT em tratamento não é lapso (não aparece como slip no app). Se aparecer, conta.
      return hadNicotine;
  }
}

/** A trilha se aplica ao perfil? (combustion só se a pessoa usava algo com combustão etc.) */
export function trackApplies(track: TrackId, profile: Profile): boolean {
  const classes = new Set(profile.products.map((p) => productById(p).cls));
  switch (track) {
    case 'combustion':
      return classes.has('combustion');
    case 'vape':
      return classes.has('vape');
    case 'tobaccoOrVape':
      return true;
    case 'nicotine':
      return true;
  }
}

function sortedEvents(events: AppEvent[], now: number): AppEvent[] {
  return events
    .filter((e) => e.at <= now)
    .slice()
    .sort((a, b) => a.at - b.at || a.createdAt - b.createdAt);
}

function computeTrack(track: TrackId, profile: Profile, events: AppEvent[], now: number): TrackResult {
  const base: TrackResult = {
    id: track,
    state: 'not_applicable',
    currentMs: 0,
    bestMs: 0,
    totalFreeMs: 0,
    currentStartAt: null,
    runStartAt: null,
    runMs: 0,
    episodes: [],
    slipCount: 0,
    relapseCount: 0,
  };
  if (!trackApplies(track, profile)) return base;

  const episodes: Episode[] = [];
  let open: Episode | null = null;
  let state: TrackState = 'free';
  let slipCount = 0;
  let relapseCount = 0;
  let runStart: number | null = null;

  const openAt = (at: number, newRun = true) => {
    const start = Math.min(at, now);
    open = { startAt: start, endAt: null, endedBy: null };
    episodes.push(open);
    state = 'free';
    if (newRun || runStart == null) runStart = start;
  };
  const closeAt = (at: number, by: 'slip' | 'relapse') => {
    if (!open) return;
    open.endAt = Math.max(open.startAt, at);
    open.endedBy = by;
    open = null;
  };

  // Início da trilha
  if (track === 'nicotine') {
    if (profile.nrt.uses && profile.nicotineFreeAt == null) state = 'nrt';
    else if (profile.nicotineFreeAt != null) openAt(profile.nicotineFreeAt);
    else openAt(profile.quitAt);
  } else {
    openAt(profile.quitAt);
  }

  for (const e of sortedEvents(events, now)) {
    switch (e.type) {
      case 'slip': {
        if (!affectsTrack(track, e.product, e.hadNicotine)) break;
        if (state === 'nrt') break; // nicotina já em uso planejado; não há trilha para encerrar
        if (state === 'free' && open && e.at >= (open as Episode).startAt) {
          slipCount += 1;
          closeAt(e.at, 'slip');
          // reinicia no fim do consumo (lapso que durou um tempo) ou no instante do lapso; não zera a "corrida"
          const resume = e.untilAt != null && e.untilAt > e.at ? e.untilAt : e.at;
          openAt(Math.min(resume, now), false);
        } else if (state === 'relapse') {
          slipCount += 1; // consumo durante recaída: registrado, sem mudar o estado
        }
        // lapso antes do início da trilha: ignorado (não há sequência para encerrar)
        break;
      }
      case 'relapse': {
        const affects =
          track === 'nicotine' ? e.hadNicotine || e.products.some((p) => productById(p).nicotineByDefault) : e.products.some((p) => affectsTrack(track, p, true));
        if (!affects) break;
        relapseCount += 1;
        if (state === 'free') closeAt(e.at, 'relapse');
        if (state !== 'nrt') {
          state = 'relapse';
          runStart = null;
        }
        break;
      }
      case 'quit_marker_reset': {
        if (track === 'nicotine') {
          if (state === 'nrt' && e.newNicotineFreeAt == null) break; // segue em NRT
          if (state === 'free') closeAt(e.newQuitAt, 'relapse');
          openAt(e.newNicotineFreeAt ?? e.newQuitAt);
        } else {
          if (state === 'free') closeAt(e.newQuitAt, 'relapse');
          openAt(e.newQuitAt);
        }
        break;
      }
      case 'nrt_ended': {
        if (track !== 'nicotine') break;
        if (state === 'nrt') openAt(e.nicotineFreeAt);
        break;
      }
      default:
        break;
    }
  }

  // Episódios com duração zero (lapso no mesmo instante) ficam no histórico mas não somam.
  let total = 0;
  let best = 0;
  for (const ep of episodes) {
    const end = ep.endAt ?? now;
    const dur = Math.max(0, end - ep.startAt);
    total += dur;
    if (dur > best) best = dur;
  }
  const current = open ? Math.max(0, now - (open as Episode).startAt) : 0;
  const runStartAt = open ? runStart : null;

  return {
    id: track,
    state,
    currentMs: current,
    bestMs: best,
    totalFreeMs: total,
    currentStartAt: open ? (open as Episode).startAt : null,
    runStartAt,
    runMs: runStartAt != null ? Math.max(0, now - runStartAt) : 0,
    episodes,
    slipCount,
    relapseCount,
  };
}

/** Calcula as quatro trilhas de abstinência a partir do perfil e dos eventos. Puro e determinístico. */
export function computeTracks(profile: Profile, events: AppEvent[], now: number): Tracks {
  const out = {} as Tracks;
  for (const t of TRACK_IDS) out[t] = computeTrack(t, profile, events, now);
  return out;
}

export const MS_DAY = 86_400_000;
export const daysOf = (ms: number): number => ms / MS_DAY;
