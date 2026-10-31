import { weeklyReview } from '../../domain/review';
import type { AppEvent } from '../../domain/types';
import { Card, Label } from '../../ui';

export function ReviewCard({ events, now }: { events: AppEvent[]; now: number }) {
  const r = weeklyReview(events, now);
  return (
    <Card className="space-y-2 p-6" data-testid="review-card">
      <Label>Revisão da semana</Label>
      <div className="text-[0.85rem] text-ink-3">Últimos 7 dias comparados aos 7 anteriores. Descritivo, a partir dos seus registros.</div>
      <ul className="space-y-1.5 text-[0.95rem]">
        {r.lines.map((l, i) => (
          <li key={i}>• {l}</li>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-2 pt-2 text-center">
        {[
          ['Vontades', r.thisWeek.cravings, r.lastWeek.cravings],
          ['Sem uso', r.thisWeek.resisted, r.lastWeek.resisted],
          ['Diários', r.thisWeek.diaries, r.lastWeek.diaries],
        ].map(([l, a, b]) => (
          <div key={String(l)} className="rounded-2xl bg-card-2 p-3">
            <div className="text-[0.7rem] text-ink-3">{l}</div>
            <div className="tabular text-[1.1rem] font-semibold">{a} <span className="text-[0.75rem] font-normal text-ink-3">vs {b}</span></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
