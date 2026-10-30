import { addEvent, stamp } from '../../data/repos';
import { activityForDay } from '../../content/plan90.pt-BR';
import { PHASE_LABEL, phaseOf } from '../../domain/program';
import type { AppEvent } from '../../domain/types';
import { Button, Card, Label, useToast } from '../../ui';

export function PlanCard({ day, events, tz }: { day: number; events: AppEvent[]; tz: string }) {
  const toast = useToast();
  const a = activityForDay(day);
  const done = events.some((e) => e.type === 'activity_done' && e.day === day);
  const doneCount = events.filter((e) => e.type === 'activity_done').length;
  if (a.minutes === 0 && day > 90) return null;
  async function mark() {
    await addEvent({ ...stamp(Date.now(), tz), type: 'activity_done', at: Date.now(), day, activityId: a.id });
    toast('Feito. Uma de cada vez.');
  }
  return (
    <Card className="space-y-2 p-6" data-testid="plan-card">
      <div className="flex items-center justify-between">
        <Label>Plano de hoje</Label>
        <span className="text-[0.75rem] text-ink-3">{PHASE_LABEL[phaseOf(day)].split(' · ')[0]}{a.minutes ? ` · ${a.minutes} min` : ''}</span>
      </div>
      <div className="text-[1.15rem] font-semibold leading-snug">{a.title}</div>
      <p className="text-ink-2">{a.how}</p>
      {done ? (
        <div className="text-[0.9rem] font-semibold text-accent">✓ Feito hoje · {doneCount} no total</div>
      ) : (
        <Button variant="secondary" onClick={mark} data-testid="plan-done">Marcar como feito</Button>
      )}
    </Card>
  );
}
