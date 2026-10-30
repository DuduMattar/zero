import type { AppEvent } from './types';

const q = (v: unknown) => {
  const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV com uma linha por evento. Colunas fixas + "detalhes" em JSON para o que varia por tipo. */
export function eventsToCsv(events: AppEvent[], tz: string): string {
  const fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, dateStyle: 'short', timeStyle: 'short' });
  const head = ['data_hora', 'tipo', 'resumo', 'detalhes'];
  const rows = events
    .slice()
    .sort((a, b) => a.at - b.at)
    .map((e) => {
      const { id, type, at, tz: _tz, createdAt, ...rest } = e as AppEvent & Record<string, unknown>;
      void id; void _tz; void createdAt;
      let resumo = '';
      switch (e.type) {
        case 'craving': resumo = `${e.strategy} · ${e.outcome} · ${e.durationSec}s`; break;
        case 'slip': resumo = `${e.product} × ${e.units}`; break;
        case 'diary': resumo = `humor ${e.mood} · sono ${e.sleep} · vontade ${e.craving}`; break;
        case 'relapse': resumo = e.products.join('+'); break;
        case 'quit_marker_reset': resumo = new Date(e.newQuitAt).toISOString(); break;
        default: resumo = '';
      }
      return [fmt.format(new Date(at)), type, resumo, rest].map(q).join(',');
    });
  return '﻿' + [head.join(','), ...rows].join('\n');
}
