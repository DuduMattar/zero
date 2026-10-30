import { MS_DAY } from './tracks';

export interface Milestone {
  id: string;
  label: string;
  ms: number;
}

const H = 3_600_000;

/** Marcos de tempo da trilha geral (tabaco ou vape). */
export const MILESTONES: readonly Milestone[] = [
  { id: 'h1', label: '1 hora', ms: H },
  { id: 'h12', label: '12 horas', ms: 12 * H },
  { id: 'd1', label: '24 horas', ms: MS_DAY },
  { id: 'd2', label: '48 horas', ms: 2 * MS_DAY },
  { id: 'd3', label: '72 horas', ms: 3 * MS_DAY },
  { id: 'd7', label: '1 semana', ms: 7 * MS_DAY },
  { id: 'd14', label: '2 semanas', ms: 14 * MS_DAY },
  { id: 'd30', label: '30 dias', ms: 30 * MS_DAY },
  { id: 'd60', label: '60 dias', ms: 60 * MS_DAY },
  { id: 'd90', label: '90 dias', ms: 90 * MS_DAY },
  { id: 'd180', label: '6 meses', ms: 182 * MS_DAY },
  { id: 'y1', label: '1 ano', ms: 365 * MS_DAY },
  { id: 'y2', label: '2 anos', ms: 730 * MS_DAY },
  { id: 'y5', label: '5 anos', ms: 5 * 365 * MS_DAY },
];

export interface NextMilestone {
  milestone: Milestone;
  remainingMs: number;
  progress01: number;
  reachedAt: number;
}

export function nextMilestone(currentMs: number, currentStartAt: number | null): NextMilestone | null {
  if (currentStartAt == null) return null;
  const m = MILESTONES.find((x) => x.ms > currentMs);
  if (!m) return null;
  const idx = MILESTONES.indexOf(m);
  const prev = idx > 0 ? MILESTONES[idx - 1].ms : 0;
  return {
    milestone: m,
    remainingMs: m.ms - currentMs,
    progress01: Math.min(1, Math.max(0, (currentMs - prev) / (m.ms - prev))),
    reachedAt: currentStartAt + m.ms,
  };
}

export function reachedMilestones(currentMs: number): Milestone[] {
  return MILESTONES.filter((m) => m.ms <= currentMs);
}
