import { Link } from 'react-router-dom';
import { addEvent, deleteEvent, stamp } from '../../data/repos';
import { activityForDay } from '../../content/plan90.pt-BR';
import { PHASE_LABEL, phaseOf } from '../../domain/program';
import type { AppEvent } from '../../domain/types';
import { Button, Card, Label, useToast } from '../../ui';

export function PlanCard({ day, events, tz, now }: { day: number; events: AppEvent[]; tz: string; now: number }) {
  const toast = useToast();
  const a = activityForDay(day);
  const doneEv = events.find((e) => e.type === 'activity_done' && e.day === day);
  const done = Boolean(doneEv);
  const canUndo = doneEv != null && now - doneEv.createdAt < 86_400_000;
  const doneCount = events.filter((e) => e.type === 'activity_done').length;
  if (a.minutes === 0 && day > 90) return null;
  async function undo() {
    if (!doneEv) return;
    await deleteEvent(doneEv.id);
    toast('Desmarcado.');
  }
  async function mark() {
    await addEvent({ ...stamp(Date.now(), tz), type: 'activity_done', at: Date.now(), day, activityId: a.id });
    toast('Feito. Uma de cada vez.');
  }
  return (
    <Card className="space-y-2 p-6" data-testid="plan-card">
      <div className="flex items-center justify-between">
        <Label>Uma ação para hoje</Label>
        <span className="text-[0.75rem] text-ink-3">{PHASE_LABEL[phaseOf(day)].split(' · ')[0]}{a.minutes ? ` · ${a.minutes} min` : ''}</span>
      </div>
      <div className="text-[1.15rem] font-semibold leading-snug">{a.title}</div>
      <p className="text-ink-2">{a.how}</p>
      {done ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.9rem] font-semibold text-accent">✓ Feito hoje · {doneCount} no total</div>
          {canUndo ? <Button size="sm" variant="ghost" onClick={undo} data-testid="plan-undo">Desfazer</Button> : null}
        </div>
      ) : (
        <div className="flex gap-2">
          {a.to ? <Link to={a.to} className="press inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-accent/15 px-4 text-[15px] font-semibold text-accent select-none" data-testid="plan-open">Abrir</Link> : null}
          <Button variant="secondary" className="flex-1" onClick={mark} data-testid="plan-done">Marcar como feito</Button>
        </div>
      )}
    </Card>
  );
}
