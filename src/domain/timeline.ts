import { TIMELINE } from '../content/timeline.pt-BR';

export type Evidence = 'forte' | 'moderada' | 'limitada';
export type AppliesTo = 'cigarette' | 'vape' | 'both';

export interface TimelineEntry {
  id: string;
  /** horas após parar */
  whenHours: number;
  whenLabel: string;
  title: string;
  body: string;
  evidence: Evidence;
  appliesTo: AppliesTo;
  sourceLabel: string;
  sourceUrl: string;
  quote?: string;
  variability?: string;
}

const H = 3_600_000;

export function sortedTimeline(): TimelineEntry[] {
  return [...TIMELINE].sort((a, b) => a.whenHours - b.whenHours);
}

/** Último marco alcançado e o próximo, dado o tempo do episódio atual. */
export function timelinePosition(currentMs: number): { reached: TimelineEntry[]; current: TimelineEntry | null; next: TimelineEntry | null; progress01: number } {
  const list = sortedTimeline();
  const reached = list.filter((e) => e.whenHours * H <= currentMs);
  const current = reached.length ? reached[reached.length - 1] : null;
  const next = list.find((e) => e.whenHours * H > currentMs) ?? null;
  const from = current ? current.whenHours * H : 0;
  const to = next ? next.whenHours * H : from;
  const progress01 = next ? Math.min(1, Math.max(0, (currentMs - from) / (to - from || 1))) : 1;
  return { reached, current, next, progress01 };
}

export const EVIDENCE_LABEL: Record<Evidence, string> = { forte: 'evidência forte', moderada: 'evidência moderada', limitada: 'evidência limitada' };
