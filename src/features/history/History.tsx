import { useState } from 'react';
import { useData } from '../../app/hooks/useData';
import { deleteEvent } from '../../data/repos';
import { cravingDrop } from '../../domain/craving';
import { formatDate, formatDateTime, formatTime, humanDuration } from '../../domain/format';
import { productById, type AppEvent } from '../../domain/types';
import { strategyById, triggerLabel } from '../../content/strategies';
import { Button, Card, Chip, EmptyState, Label, useConfirm, useToast } from '../../ui';

type Filter = 'all' | 'craving' | 'slip' | 'diary';

function describe(e: AppEvent, tz: string): { title: string; sub: string; tone: string } {
  switch (e.type) {
    case 'craving': {
      const d = cravingDrop(e);
      return {
        title: e.outcome === 'resisted' ? 'Vontade superada' : e.outcome === 'slipped' ? 'Vontade → fumei' : 'Vontade (sem resultado)',
        sub: `${strategyById(e.strategy).label} · ${Math.round(e.durationSec / 60)} min${d != null ? ` · queda ${d}` : ''}${e.trigger ? ` · ${triggerLabel(e.trigger)}` : ''}`,
        tone: e.outcome === 'resisted' ? 'text-accent' : 'text-warn',
      };
    }
    case 'slip':
      return { title: `Lapso: ${e.units} ${e.units === 1 ? productById(e.product).unitLabel : productById(e.product).unitLabelPlural}`, sub: `${productById(e.product).label}${e.hadNicotine ? '' : ' (sem nicotina)'}${e.trigger ? ` · ${triggerLabel(e.trigger)}` : ''}${e.lesson ? ` · "${e.lesson}"` : ''}`, tone: 'text-warn' };
    case 'relapse':
      return { title: 'Recaída', sub: e.products.map((p) => productById(p).label).join(', ') + (e.note ? ` · ${e.note}` : ''), tone: 'text-danger' };
    case 'quit_marker_reset':
      return { title: 'Novo ponto de partida', sub: `${formatDateTime(e.newQuitAt, tz)}${e.reason ? ` · ${e.reason}` : ''}`, tone: 'text-calm' };
    case 'nrt_ended':
      return { title: 'Encerrei a reposição de nicotina', sub: `Sem nicotina desde ${formatDateTime(e.nicotineFreeAt, tz)}`, tone: 'text-calm' };
    case 'diary':
      return { title: `Diário · humor ${e.mood}/5`, sub: `ansiedade ${e.anxiety} · energia ${e.energy} · sono ${e.sleep} · vontade ${e.craving}${e.activity ? ' · treinou' : ''}${e.text ? ` · ${e.text}` : ''}`, tone: 'text-ink' };
    case 'price_change':
      return { title: 'Consumo/preço atualizado', sub: `${e.unitsPerDay}/dia · ${e.pricePerUnit.toFixed(2)} por unidade`, tone: 'text-ink-3' };
    case 'note':
      return { title: 'Nota', sub: e.text, tone: 'text-ink' };
    case 'achievement_unlocked':
      return { title: 'Conquista', sub: e.achievementId, tone: 'text-accent' };
    case 'backup_made':
      return { title: 'Backup externo', sub: `${e.eventCount} eventos`, tone: 'text-ink-3' };
  }
}

export function History() {
  const data = useData(60_000);
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  if (!data) return null;
  const { profile, events, tracks, now } = data;
  const list = events
    .filter((e) => e.type !== 'backup_made')
    .filter((e) => filter === 'all' || e.type === filter)
    .sort((a, b) => b.at - a.at);
  const byDay = new Map<string, AppEvent[]>();
  for (const e of list) {
    const k = formatDate(e.at, profile.tz);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }
  const eps = tracks.tobaccoOrVape.episodes.slice().reverse();

  async function remove(e: AppEvent) {
    if (!confirm.confirm(e.id)) return;
    try {
      await deleteEvent(e.id);
      toast('Registro apagado.');
    } catch (err) {
      console.error(err);
      toast('Não consegui apagar.', 'err');
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl font-bold">Histórico</h1>

      <Card>
        <Label>Episódios sem tabaco ou vape</Label>
        {eps.length ? (
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {eps.slice(0, 8).map((ep, i) => (
              <li key={i} className="flex justify-between text-ink-2">
                <span>
                  {formatDate(ep.startAt, profile.tz)} → {ep.endAt ? formatDate(ep.endAt, profile.tz) : 'agora'}
                </span>
                <span className="tabular font-semibold text-ink">
                  {humanDuration((ep.endAt ?? now) - ep.startAt)}
                  {ep.endedBy ? <span className="ml-1 font-normal text-ink-3">· {ep.endedBy === 'slip' ? 'lapso' : 'recaída'}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-1 text-[13px] text-ink-3">Nenhum episódio ainda.</div>
        )}
      </Card>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4" style={{ scrollbarWidth: 'none' }}>
        {(
          [
            ['all', 'Tudo'],
            ['craving', 'Vontades'],
            ['slip', 'Lapsos'],
            ['diary', 'Diário'],
          ] as [Filter, string][]
        ).map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)} className="shrink-0">
            {l}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nada por aqui ainda" body="Vontades, lapsos e diário aparecem aqui conforme você registra." />
      ) : (
        [...byDay.entries()].map(([day, items]) => (
          <div key={day}>
            <Label className="mb-1.5">{day}</Label>
            <div className="space-y-1.5">
              {items.map((e) => {
                const d = describe(e, profile.tz);
                const canDelete = now - e.createdAt < 86_400_000 && e.type !== 'backup_made';
                return (
                  <div key={e.id} className="card flex items-start gap-3 p-3" data-testid={`ev-${e.type}`}>
                    <div className="tabular w-11 shrink-0 pt-0.5 text-[12px] text-ink-3">{formatTime(e.at, profile.tz)}</div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[14px] font-semibold ${d.tone}`}>{d.title}</div>
                      <div className="truncate text-[12px] text-ink-2">{d.sub}</div>
                    </div>
                    {canDelete ? (
                      <Button size="sm" variant={confirm.isArmed(e.id) ? 'danger' : 'ghost'} onClick={() => remove(e)} aria-label="Apagar registro feito por engano">
                        {confirm.isArmed(e.id) ? 'Confirmar' : '✕'}
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      <div className="text-[11px] text-ink-3">Registros são permanentes. Só os feitos nas últimas 24 h podem ser apagados (erro de digitação).</div>
    </div>
  );
}
