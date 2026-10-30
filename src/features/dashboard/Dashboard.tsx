import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { isStandalone } from '../../app/hooks/useNow';
import { formatDate, formatMoney, humanDuration, wholeDays } from '../../domain/format';
import { nextMilestone } from '../../domain/milestones';
import { MS_DAY, type TrackResult } from '../../domain/tracks';
import { productById, type TrackId } from '../../domain/types';
import { Button, Card, Label, Progress } from '../../ui';

const TRACK_LABEL: Record<TrackId, string> = { tobaccoOrVape: 'Sem tabaco ou vape', combustion: 'Sem cigarro', vape: 'Sem vape', nicotine: 'Sem nicotina' };

function TrackPill({ t }: { t: TrackResult }) {
  if (t.state === 'not_applicable') return null;
  const txt =
    t.state === 'nrt' ? 'em reposição de nicotina' : t.state === 'relapse' ? 'em recaída' : humanDuration(t.currentMs);
  const tone = t.state === 'nrt' ? 'text-warn' : t.state === 'relapse' ? 'text-ink-3' : 'text-ink';
  return (
    <div className="flex items-center justify-between rounded-xl bg-card-2 px-3 py-2">
      <span className="text-[13px] text-ink-2">{TRACK_LABEL[t.id]}</span>
      <span className={`tabular text-[13px] font-semibold ${tone}`}>{txt}</span>
    </div>
  );
}

export function Dashboard() {
  const data = useData();
  const nav = useNavigate();
  if (!data) return null;
  const { profile, events, settings, now, tracks, money } = data;
  const main = tracks.tobaccoOrVape;
  const preparing = profile.quitAt > now;
  const relapsing = main.state === 'relapse';
  const nm = nextMilestone(main.currentMs, main.currentStartAt);
  const resisted = events.filter((e) => e.type === 'craving' && e.outcome === 'resisted').length;
  const slips = events.filter((e) => e.type === 'slip').length;
  const week = events.filter((e) => e.type === 'diary' && e.at >= now - 7 * MS_DAY);
  const avg = (k: 'mood' | 'sleep') => (week.length ? (week.reduce((a, e) => a + (e.type === 'diary' ? e[k] : 0), 0) / week.length).toFixed(1) : null);
  const unit = productById(profile.consumption.product);
  const backupDue = !settings.lastExternalBackupAt ? events.length > 0 && now - profile.createdAt > MS_DAY : now - settings.lastExternalBackupAt > settings.backupReminderDays * MS_DAY;
  const bestFromHistory = profile.longestQuitDays ? profile.longestQuitDays * MS_DAY : 0;

  return (
    <div className="space-y-3">
      <header className="flex items-end justify-between pt-1">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">ZERO</div>
          <h1 className="text-xl font-bold">Agora</h1>
        </div>
        <div className="text-[12px] text-ink-3">{formatDate(now, profile.tz)}</div>
      </header>

      <Button variant="primary" full size="lg" className="min-h-16 text-[17px]" onClick={() => nav('/sos')} data-testid="sos">
        Estou com vontade de fumar
      </Button>

      {relapsing ? (
        <Card tone="warn" className="space-y-2">
          <Label>Em recaída</Label>
          <p className="text-[14px] text-ink-2">O contador atual está parado. Seus dias acumulados e seu recorde continuam guardados. Quando quiser recomeçar, marque um novo ponto de partida.</p>
          <Button variant="primary" onClick={() => nav('/lapso?modo=marco')}>
            Novo ponto de partida
          </Button>
        </Card>
      ) : preparing ? (
        <Card tone="accent" className="space-y-1">
          <Label>Preparação</Label>
          <div className="text-2xl font-bold">Falta {humanDuration(profile.quitAt - now)}</div>
          <p className="text-[13px] text-ink-2">Até lá: use o SOS para treinar, registre vontades e organize o ambiente (jogue fora isqueiros, pods, cinzeiros).</p>
        </Card>
      ) : (
        <Card className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <Label>Dias livres acumulados</Label>
              <div className="tabular text-5xl font-bold leading-none" data-testid="total-days">
                {wholeDays(main.totalFreeMs)}
              </div>
            </div>
            <div className="text-right">
              <Label>Recorde</Label>
              <div className="tabular text-2xl font-semibold leading-none">{humanDuration(Math.max(main.bestMs, bestFromHistory))}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[13px] text-ink-2">
            <span>
              Sequência atual: <b className="text-ink">{humanDuration(main.currentMs)}</b>
            </span>
            <span>desde {main.currentStartAt ? formatDate(main.currentStartAt, profile.tz) : '—'}</span>
          </div>
          {nm ? (
            <div>
              <div className="mb-1 flex justify-between text-[12px] text-ink-3">
                <span>Próximo marco: {nm.milestone.label}</span>
                <span>em {humanDuration(nm.remainingMs)}</span>
              </div>
              <Progress value01={nm.progress01} />
            </div>
          ) : null}
        </Card>
      )}

      <div className="space-y-1.5">
        {(['combustion', 'vape', 'nicotine'] as TrackId[]).map((id) => (
          <TrackPill key={id} t={tracks[id]} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3.5">
          <Label>Economia</Label>
          <div className="tabular mt-1 text-xl font-semibold">{formatMoney(money.saved, profile.currency)}</div>
          <div className="text-[12px] text-ink-3">{formatMoney(money.perDay, profile.currency)}/dia</div>
        </div>
        <div className="card p-3.5">
          <Label>Não consumidos</Label>
          <div className="tabular mt-1 text-xl font-semibold">{Math.round(money.unitsNotConsumed)}</div>
          <div className="text-[12px] text-ink-3">{unit.unitLabelPlural} (estimativa)</div>
        </div>
        <div className="card p-3.5">
          <Label>Vontades superadas</Label>
          <div className="tabular mt-1 text-xl font-semibold">{resisted}</div>
          <div className="text-[12px] text-ink-3">{slips} {slips === 1 ? 'lapso registrado' : 'lapsos registrados'}</div>
        </div>
        <div className="card p-3.5">
          <Label>Humor · sono (7 dias)</Label>
          <div className="tabular mt-1 text-xl font-semibold">{avg('mood') ?? '—'} · {avg('sleep') ?? '—'}</div>
          <div className="text-[12px] text-ink-3">{week.length ? `${week.length} ${week.length === 1 ? 'registro' : 'registros'}` : 'sem diário ainda'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => nav('/diario')}>Diário de hoje</Button>
        <Button onClick={() => nav('/lapso')}>Registrar lapso</Button>
      </div>

      {profile.reasons.length ? (
        <Card>
          <Label>Meus motivos</Label>
          <ul className="mt-1.5 space-y-1 text-[14px]">
            {profile.reasons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {backupDue ? (
        <Card tone="warn" className="flex items-center justify-between gap-3">
          <div className="text-[13px] text-ink-2">
            <b className="text-ink">Backup externo pendente.</b> Dados em site no iPhone podem ser apagados. Leva 10 segundos.
          </div>
          <Link to="/ajustes/backup" className="shrink-0 text-[13px] font-semibold text-accent">
            Fazer agora
          </Link>
        </Card>
      ) : null}

      {!isStandalone() ? (
        <Card className="flex items-center justify-between gap-3">
          <div className="text-[13px] text-ink-2">
            <b className="text-ink">Adicione à tela de início.</b> Abre como app e protege melhor seus dados.
          </div>
          <Link to="/ajustes/instalar" className="shrink-0 text-[13px] font-semibold text-accent">
            Como fazer
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
