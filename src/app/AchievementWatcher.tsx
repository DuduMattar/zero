import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from './hooks/useData';
import { addEvent, stamp } from '../data/repos';
import { achievementById, newAchievements } from '../domain/achievements';
import { Button, Sheet } from '../ui';

/** Grava conquistas novas (idempotente) e mostra uma folha discreta, uma vez. Nunca durante o SOS. */
export function AchievementWatcher() {
  const data = useData(60_000);
  const loc = useLocation();
  const [queue, setQueue] = useState<string[]>([]);
  useEffect(() => {
    if (!data || loc.pathname.startsWith('/sos')) return;
    const fresh = newAchievements(data.profile, data.events, data.now);
    if (!fresh.length) return;
    // Conquistas "atrasadas" (várias de uma vez, ou logo após o onboarding) são gravadas em silêncio.
    const silent = fresh.length > 1 || data.now - data.profile.createdAt < 10 * 60_000;
    (async () => {
      for (const id of fresh) await addEvent({ ...stamp(Date.now(), data.profile.tz), type: 'achievement_unlocked', at: Date.now(), achievementId: id });
      if (!silent) setQueue((q) => [...q, ...fresh]);
    })().catch(console.error);
  }, [data, loc.pathname]);
  const current = queue[0] ? achievementById(queue[0]) : null;
  if (!current || loc.pathname.startsWith('/sos')) return null;
  return (
    <Sheet open onClose={() => setQueue((q) => q.slice(1))} title="Marco alcançado">
      <div className="space-y-3">
        <div className="text-[1.5rem] font-bold">{current.title}</div>
        <p className="text-ink-2">{current.body}</p>
        <Button variant="primary" full size="lg" onClick={() => setQueue((q) => q.slice(1))}>Continuar</Button>
      </div>
    </Sheet>
  );
}
