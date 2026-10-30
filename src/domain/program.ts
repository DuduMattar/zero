import { MS_DAY } from './tracks';

/** Dia do programa em relação ao marco de parada: −7 … 0 … 90 … Usa o calendário do fuso. */
export function programDay(quitAt: number, now: number, tz: string): number {
  const key = (ms: number) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  };
  return Math.round((key(now) - key(quitAt)) / MS_DAY);
}

export type Phase = 'preparacao' | 'fase1' | 'fase2' | 'fase3' | 'fase4' | 'manutencao';

export function phaseOf(day: number): Phase {
  if (day < 0) return 'preparacao';
  if (day <= 7) return 'fase1';
  if (day <= 30) return 'fase2';
  if (day <= 60) return 'fase3';
  if (day <= 90) return 'fase4';
  return 'manutencao';
}

export const PHASE_LABEL: Record<Phase, string> = {
  preparacao: 'Preparação',
  fase1: 'Fase 1 · dias 1–7 · abstinência inicial',
  fase2: 'Fase 2 · dias 8–30 · novos hábitos',
  fase3: 'Fase 3 · dias 31–60 · prevenção de recaída',
  fase4: 'Fase 4 · dias 61–90 · manutenção',
  manutencao: 'Depois dos 90 dias',
};
