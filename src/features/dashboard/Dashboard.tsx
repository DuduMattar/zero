import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { isStandalone } from '../../app/hooks/useNow';
import { formatDate, humanDuration, wholeDays } from '../../domain/format';
import { messageForDay } from '../../content/messages.pt-BR';
import { programDay, phaseOf, PHASE_LABEL } from '../../domain/program';
import { MS_DAY, type TrackResult } from '../../domain/tracks';
import { timelinePosition, EVIDENCE_LABEL } from '../../domain/timeline';
import type { TrackId } from '../../domain/types';
import { Button, Card, Label, Progress, useToast } from '../../ui';
import { PlanCard } from './PlanCard';
import { ReviewCard } from '../trends/ReviewCard';
import { shareProgress } from '../../app/share';
import { updateSettings } from '../../data/repos';
import { isSunday } from '../../domain/review';

const TRACK_LABEL: Record<TrackId, string> = { tobaccoOrVape: 'Sem tabaco ou vape', combustion: 'Sem cigarro', vape: 'Sem vape', nicotine: 'Sem nicotina' };
const MOODS = [
  { v: 1, e: '😣', l: 'péssimo' },
  { v: 2, e: '😕', l: 'ruim' },
  { v: 3, e: '😐', l: 'ok' },
  { v: 4, e: '🙂', l: 'bem' },
  { v: 5, e: '😄', l: 'ótimo' },
];

function TrackRow({ t }: { t: TrackResult }) {
  if (t.state === 'not_applicable') return null;
  const txt = t.state === 'nrt' ? 'em reposição de nicotina' : t.state === 'relapse' ? 'em recaída' : humanDuration(t.currentMs);
  const tone = t.state === 'nrt' ? 'text-warn' : t.state === 'relapse' ? 'text-ink-3' : 'text-ink';
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line">
      <span className="text-[0.95rem] text-ink-2">{TRACK_LABEL[t.id]}</span>
      <span className={`tabular sensitive text-[0.95rem] font-semibold ${tone}`}>{txt}</span>
    </div>
  );
}

export function Dashboard() {
  const data = useData();
  const nav = useNavigate();
  const toast = useToast();
  if (!data) return null;
  const { profile, events, settings, now, tracks } = data;
  const main = tracks.tobaccoOrVape;
  const preparing = profile.quitAt > now;
  const relapsing = main.state === 'relapse';
  const day = programDay(profile.quitAt, now, profile.tz);
  const msg = messageForDay(day);
  const tl = timelinePosition(main.runMs); // relógio de saúde: lapsos isolados não zeram
  const todayKey = formatDate(now, profile.tz);
  const diaryToday = events.find((e) => e.type === 'diary' && formatDate(e.at, profile.tz) === todayKey);
  const resisted = events.filter((e) => e.type === 'craving' && e.outcome === 'resisted').length;
  const backupDue = !settings.lastExternalBackupAt ? events.length > 0 && now - profile.createdAt > MS_DAY : now - settings.lastExternalBackupAt > settings.backupReminderDays * MS_DAY;
  const bestFromHistory = profile.longestQuitDays ? profile.longestQuitDays * MS_DAY : 0;
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: profile.tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date(now)));
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="stagger space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-accent">ZERO</div>
          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight">{greeting}.</h1>
          <div className="text-[0.85rem] text-ink-3">{formatDate(now, profile.tz)} · {day >= 0 ? `dia ${day}` : `${-day} ${-day === 1 ? 'dia' : 'dias'} para o dia zero`}</div>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label={settings.discreetMode ? 'Mostrar números' : 'Modo discreto'} aria-pressed={settings.discreetMode} onClick={() => updateSettings({ discreetMode: !settings.discreetMode })} className={`press flex h-11 w-11 items-center justify-center rounded-full text-lg ${settings.discreetMode ? 'bg-accent/20 text-accent' : 'bg-card-2'}`} data-testid="discreet">
            {settings.discreetMode ? '◉' : '◎'}
          </button>
          <Link to="/ajustes" aria-label="Ajustes" className="press flex h-11 w-11 items-center justify-center rounded-full bg-card-2 text-xl">
            ⚙
          </Link>
        </div>
      </header>

      <Button variant="primary" full size="lg" className="min-h-[68px] text-[1.1rem]" onClick={() => nav('/sos')} data-testid="sos">
        Estou com vontade de fumar
      </Button>

      {relapsing ? (
        <Card tone="warn" className="space-y-3 p-6">
          <Label>Em recaída</Label>
          <p className="text-ink-2">O contador atual está parado. Seus dias acumulados e seu recorde continuam guardados. Quando quiser recomeçar, marque um novo ponto de partida.</p>
          <Button variant="primary" onClick={() => nav('/lapso?modo=marco')}>Novo ponto de partida</Button>
        </Card>
      ) : preparing ? (
        <Card tone="accent" className="space-y-2 p-6">
          <Label>Preparação</Label>
          <div className="tabular text-[2.5rem] font-bold leading-none">{humanDuration(profile.quitAt - now)}</div>
          <p className="text-ink-2">até o dia zero. Use o SOS para treinar, registre vontades e limpe o ambiente.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <Label>Dias livres acumulados</Label>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="tabular sensitive text-[4rem] font-bold leading-[0.9]" data-testid="total-days">{wholeDays(main.totalFreeMs)}</div>
            <div className="pb-1 text-right">
              <Label>Recorde</Label>
              <div className="tabular sensitive text-[1.35rem] font-semibold leading-tight">{humanDuration(Math.max(main.bestMs, bestFromHistory))}</div>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
            <div>
              <Label>Desde o último consumo</Label>
              <div className="tabular sensitive text-[1.5rem] font-semibold leading-tight">{humanDuration(main.currentMs)}</div>
            </div>
            <span className="pb-1 text-[0.85rem] text-ink-3">desde {main.currentStartAt ? formatDate(main.currentStartAt, profile.tz) : '—'}</span>
          </div>
          <button
            type="button"
            className="mt-4 text-[0.85rem] font-semibold text-accent"
            data-testid="share"
            onClick={async () => {
              const r = await shareProgress({ days: wholeDays(main.totalFreeMs), best: humanDuration(Math.max(main.bestMs, bestFromHistory)), since: main.runStartAt ? formatDate(main.runStartAt, profile.tz) : formatDate(profile.quitAt, profile.tz), dark: document.documentElement.classList.contains('dark') });
              if (r === 'downloaded') toast('Imagem salva.');
            }}
          >
            Compartilhar progresso →
          </button>
        </Card>
      )}

      {!relapsing ? <PlanCard day={day} events={events} tz={profile.tz} now={now} /> : null}
      {isSunday(now, profile.tz) && events.length > 0 ? <ReviewCard events={events} now={now} /> : null}

      {!preparing && !relapsing && (tl.current || tl.next) ? (
        <Link to="/linha-do-tempo" className="block">
          <Card className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <Label>Seu corpo agora</Label>
              <span className="text-[0.75rem] text-ink-3">{tl.current ? EVIDENCE_LABEL[tl.current.evidence] : ''}</span>
            </div>
            {tl.current ? (
              <>
                <div className="text-[1.15rem] font-semibold leading-snug">{tl.current.title}</div>
                <p className="text-ink-2">{tl.current.body}</p>
              </>
            ) : (
              <p className="text-ink-2">Os primeiros efeitos começam em minutos. Abra a linha do tempo para ver o que vem.</p>
            )}
            {tl.next ? (
              <div>
                <div className="mb-1.5 flex justify-between text-[0.8rem] text-ink-3">
                  <span>Próximo: {tl.next.whenLabel}</span>
                  <span>em {humanDuration(tl.next.whenHours * 3_600_000 - main.runMs)}</span>
                </div>
                <Progress value01={tl.progress01} />
              </div>
            ) : null}
            {profile.products.includes('vape') && !profile.products.some((p) => p === 'cigarette' || p === 'rolled' || p === 'cigar') ? (
              <div className="text-[0.75rem] text-warn">Prazos de estudos com cigarro; para quem usava só vape, a evidência é limitada.</div>
            ) : null}
          </Card>
        </Link>
      ) : null}

      <Card className="space-y-2 p-6">
        <div className="flex items-center justify-between">
          <Label>Mensagem do dia</Label>
          <span className="text-[0.75rem] text-ink-3">{PHASE_LABEL[phaseOf(day)].split(' · ')[0]}</span>
        </div>
        <div className="text-[1.15rem] font-semibold leading-snug">{msg.title}</div>
        <p className="text-ink-2">{msg.body}</p>
        {msg.action ? <div className="mt-1 text-[0.9rem] font-semibold text-accent">→ {msg.action}</div> : null}
      </Card>

      <Card className="p-6">
        <Label className="mb-2">Como foi hoje?</Label>
        {diaryToday && diaryToday.type === 'diary' ? (
          <div className="flex items-center justify-between">
            <span className="text-ink-2">Registrado: humor {diaryToday.mood}/5 · sono {diaryToday.sleep}/5</span>
            <Link to="/diario" className="text-[0.9rem] font-semibold text-accent">Registrar de novo</Link>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button key={m.v} type="button" onClick={() => nav(`/diario?mood=${m.v}`)} className="press flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-card-2 text-2xl" aria-label={`Humor ${m.l}`}>
                <span aria-hidden>{m.e}</span>
                <span className="text-[0.65rem] font-semibold text-ink-3">{m.l}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <Label className="mb-1">Trilhas</Label>
        <div>
          {(['combustion', 'vape', 'nicotine'] as TrackId[]).map((id) => (
            <TrackRow key={id} t={tracks[id]} />
          ))}
        </div>
        <div className="mt-3 border-t border-line pt-3 text-[0.85rem] text-ink-3">{resisted} {resisted === 1 ? 'vontade superada' : 'vontades superadas'} · {main.slipCount} {main.slipCount === 1 ? 'lapso' : 'lapsos'}</div>
      </Card>

      {backupDue ? (
        <Card tone="warn" className="flex items-center justify-between gap-3 p-5">
          <div className="text-[0.9rem] text-ink-2"><b className="text-ink">Backup externo pendente.</b> Dados em site no iPhone podem ser apagados.</div>
          <Link to="/ajustes/backup" className="shrink-0 text-[0.9rem] font-semibold text-accent">Fazer agora</Link>
        </Card>
      ) : !isStandalone() ? (
        <Card className="flex items-center justify-between gap-3 p-5">
          <div className="text-[0.9rem] text-ink-2"><b className="text-ink">Adicione à tela de início.</b> Abre como app e protege melhor seus dados.</div>
          <Link to="/ajustes/instalar" className="shrink-0 text-[0.9rem] font-semibold text-accent">Como fazer</Link>
        </Card>
      ) : null}

      <div className="pt-2 text-center">
        <Link to="/lapso" className="text-[0.9rem] font-semibold text-ink-3 underline-offset-4 hover:underline">Fumei ou usei nicotina? Registrar lapso</Link>
      </div>
    </div>
  );
}
