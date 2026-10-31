import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { deleteEvent } from '../../data/repos';
import { cravingDrop } from '../../domain/craving';
import { formatDate, formatDateTime, formatTime, humanDuration } from '../../domain/format';
import { calendarDays } from '../../domain/stats';
import { eventsToCsv } from '../../domain/csv';
import { productById, type AppEvent } from '../../domain/types';
import { strategyById, triggerLabel } from '../../content/strategies';
import { Button, Card, Chip, EmptyState, Label, useConfirm, useToast } from '../../ui';

type Filter = 'all' | 'craving' | 'slip' | 'diary';

function describe(e: AppEvent, tz: string): { title: string; sub: string; tone: string } {
  switch (e.type) {
    case 'craving': {
      const d = cravingDrop(e);
      return { title: e.outcome === 'resisted' ? 'Vontade diminuiu' : e.outcome === 'slipped' ? 'Vontade → uso' : e.outcome === 'continued' ? 'Vontade continuava ao sair' : 'Vontade encerrada sem avaliação final', sub: `${(e.strategies?.length ?? 1) > 1 ? 'Várias estratégias' : strategyById(e.strategy).label} · ${Math.round(e.durationSec / 60)} min${d != null ? ` · variação ${d > 0 ? '−' : d < 0 ? '+' : ''}${Math.abs(d)}` : ''}${e.trigger ? ` · ${triggerLabel(e.trigger)}` : ''}`, tone: e.outcome === 'slipped' ? 'text-warn' : e.outcome === 'resisted' ? 'text-accent' : 'text-ink' };
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
      return { title: 'Consumo/preço atualizado', sub: `${Number(e.unitsPerDay.toFixed(2))}/dia · ${e.pricePerUnit.toFixed(2)} por unidade`, tone: 'text-ink-3' };
    case 'note':
      return { title: 'Nota', sub: e.text, tone: 'text-ink' };
    case 'achievement_unlocked':
      return { title: 'Conquista', sub: e.achievementId, tone: 'text-accent' };
    case 'backup_made':
      return { title: 'Backup externo', sub: `${e.eventCount} eventos`, tone: 'text-ink-3' };
    case 'activity_done':
      return { title: 'Atividade do plano feita', sub: `dia ${e.day}`, tone: 'text-accent' };
    case 'nrt_dose':
      return { title: 'Dose de reposição de nicotina', sub: `${{ patch: 'adesivo', gum: 'goma', lozenge: 'pastilha', other: 'outro' }[e.kind]}${e.mg ? ` · ${e.mg} mg` : ''}`, tone: 'text-calm' };
  }
}

export function History() {
  const data = useData(60_000);
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  if (!data) return null;
  const { profile, events, tracks, now } = data;
  const main = tracks.tobaccoOrVape;
  const cal = calendarDays(main.episodes, events, profile.quitAt, profile.tz, now, 28);
  const list = events.filter((e) => e.type !== 'backup_made' && e.type !== 'achievement_unlocked').filter((e) => filter === 'all' || e.type === filter).sort((a, b) => b.at - a.at);
  const byDay = new Map<string, AppEvent[]>();
  for (const e of list) {
    const k = formatDate(e.at, profile.tz);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }
  const eps = main.episodes.slice().reverse();

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
    <div className="space-y-8">
      <header>
        <h1 className="text-[1.75rem] font-bold leading-tight">Histórico</h1>
        <div className="text-[0.85rem] text-ink-3">Tudo fica. Registros são permanentes.</div>
      </header>

      <Link to="/linha-do-tempo" className="block">
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="font-semibold">Linha do tempo da recuperação</div>
            <div className="text-[0.85rem] text-ink-3">Marcos de 20 minutos a 15 anos, com fonte.</div>
          </div>
          <span className="text-xl text-ink-3">›</span>
        </Card>
      </Link>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Label>Últimos 28 dias</Label>
          <div className="flex gap-3 text-[0.7rem] text-ink-3"><span><i className="inline-block h-2 w-2 rounded-sm bg-accent" /> livre</span><span><i className="inline-block h-2 w-2 rounded-sm bg-warn" /> • lapso</span><span><i className="inline-block h-2 w-2 rounded-sm bg-line" /> — recaída</span></div>
        </div>
        <div className="cal mt-3" role="img" aria-label="Calendário dos últimos 28 dias">
          {cal.map((d) => (
            <div key={d.key} className={d.status} title={d.key}>{d.day}</div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <Label>Episódios sem tabaco ou vape</Label>
        {eps.length ? (
          <ul className="mt-2 divide-y divide-line">
            {eps.slice(0, 8).map((ep, i) => (
              <li key={i} className="flex justify-between py-2.5 text-[0.9rem] text-ink-2">
                <span>{formatDate(ep.startAt, profile.tz)} → {ep.endAt ? formatDate(ep.endAt, profile.tz) : 'agora'}</span>
                <span className="tabular font-semibold text-ink">{humanDuration((ep.endAt ?? now) - ep.startAt)}{ep.endedBy ? <span className="ml-1 font-normal text-ink-3">· {ep.endedBy === 'slip' ? 'lapso' : 'recaída'}</span> : null}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-1 text-[0.9rem] text-ink-3">Nenhum episódio ainda.</div>
        )}
      </Card>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5" style={{ scrollbarWidth: 'none' }}>
        {([['all', 'Tudo'], ['craving', 'Vontades'], ['slip', 'Lapsos'], ['diary', 'Diário']] as [Filter, string][]).map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)} className="shrink-0">{l}</Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nada por aqui ainda" body="Vontades, lapsos e diário aparecem aqui conforme você registra." />
      ) : (
        [...byDay.entries()].map(([day, items]) => (
          <div key={day}>
            <Label className="mb-2">{day}</Label>
            <div className="space-y-2">
              {items.map((e) => {
                const d = describe(e, profile.tz);
                const canDelete = now - e.createdAt < 86_400_000;
                return (
                  <div key={e.id} className="card flex items-start gap-3 p-4" data-testid={`ev-${e.type}`}>
                    <div className="tabular w-11 shrink-0 pt-0.5 text-[0.8rem] text-ink-3">{formatTime(e.at, profile.tz)}</div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold ${d.tone}`}>{d.title}</div>
                      <div className="truncate text-[0.85rem] text-ink-2">{d.sub}</div>
                    </div>
                    {canDelete ? (
                      <Button size="sm" variant={confirm.isArmed(e.id) ? 'danger' : 'ghost'} onClick={() => remove(e)} aria-label="Apagar registro feito por engano">{confirm.isArmed(e.id) ? 'Confirmar' : '✕'}</Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      <div className="text-[0.75rem] text-ink-3">Só registros feitos nas últimas 24 h podem ser apagados (erro de digitação).</div>
      <Button
        full
        data-testid="csv"
        onClick={() => {
          const blob = new Blob([eventsToCsv(events, profile.tz)], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'zero-historico.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        }}
      >
        Exportar CSV
      </Button>
    </div>
  );
}
