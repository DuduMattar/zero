import { useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { addEvent, stamp } from '../../data/repos';
import { bestStrategy, cravingReducer, initialCraving, toCravingEvent } from '../../domain/craving';
import { STRATEGIES, TRIGGERS, strategyById } from '../../content/strategies';
import { Button, Chip, Label, Scale, useToast } from '../../ui';

function useTick(active: boolean) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setT(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [active]);
  return t;
}

export function Sos() {
  const data = useData(60_000);
  const nav = useNavigate();
  const toast = useToast();
  const [s, dispatch] = useReducer(cravingReducer, undefined, initialCraving);
  const [rateOpen, setRateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const best = useMemo(() => (data ? bestStrategy(data.events) : null), [data]);

  // Alívio primeiro: o cronômetro já começa ao abrir.
  useEffect(() => {
    if (!data || s.startedAt) return;
    const strat = best ? strategyById(best.strategy) : strategyById('breathing');
    dispatch({ type: 'start', now: Date.now(), strategy: strat.id, durationSec: data.settings.sosDefaultDurationSec || strat.defaultSec });
  }, [data, best, s.startedAt]);

  const now = useTick(s.step === 'relief');
  if (!data || !s.startedAt) return null;

  const elapsed = Math.max(0, Math.floor((now - s.startedAt) / 1000));
  const remaining = Math.max(0, s.durationSec - elapsed);
  const over = remaining === 0;
  const strat = strategyById(s.strategy);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const ordered = best ? [strategyById(best.strategy), ...STRATEGIES.filter((x) => x.id !== best.strategy)] : [...STRATEGIES];

  async function finish(outcome: 'resisted' | 'slipped') {
    setSaving(true);
    try {
      const final = cravingReducer(s, { type: 'finish', outcome, now: Date.now() });
      const ev = toCravingEvent(final, stamp(Date.now(), data!.profile.tz).id, data!.profile.tz, Date.now());
      await addEvent(ev);
      if (outcome === 'slipped') nav('/lapso?from=sos', { replace: true });
      else {
        toast('Passou. Registrado.');
        nav('/', { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
      setSaving(false);
    }
  }

  if (s.step === 'relief') {
    return (
      <div className="flex min-h-[calc(100dvh-24px)] flex-col">
        <div className="flex items-center justify-between">
          <button type="button" className="text-[13px] font-semibold text-ink-3" onClick={() => nav(-1)}>
            Fechar
          </button>
          <Label>Vontade passa. Fica com ela.</Label>
          <span className="w-12" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="relative flex h-60 w-60 items-center justify-center">
            {strat.guided === 'breathing' ? <div className="breathe absolute inset-0 rounded-full bg-accent/20" aria-hidden /> : null}
            <div className="absolute inset-6 rounded-full border border-line" aria-hidden />
            <div className="relative text-center">
              <div className="tabular text-6xl font-bold leading-none" aria-live="off" data-testid="sos-timer">
                {mm}:{ss}
              </div>
              <div className="mt-2 text-[13px] text-ink-2">{over ? 'Tempo concluído' : strat.label}</div>
            </div>
          </div>
          {strat.guided === 'breathing' ? <BreathCue startedAt={s.startedAt} now={now} /> : null}
          <ul className="mt-4 w-full space-y-1 px-2 text-center text-[14px] text-ink-2">
            {strat.steps.map((st) => (
              <li key={st}>{st}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
            {ordered.map((x) => (
              <Chip key={x.id} active={x.id === s.strategy} onClick={() => dispatch({ type: 'setStrategy', strategy: x.id })} className="shrink-0">
                {x.short}
                {best && x.id === best.strategy ? ' ★' : ''}
              </Chip>
            ))}
          </div>
          {best ? <div className="text-[11px] text-ink-3">★ Nos seus registros, esta esteve associada à maior queda média de intensidade (n = {best.n}). Não é garantia.</div> : null}

          {rateOpen ? (
            <div className="card p-3">
              <Label>Como está agora? (0 = nada, 10 = insuportável)</Label>
              <div className="mt-2">
                <Scale
                  ariaLabel="Intensidade agora"
                  value={null}
                  onChange={(v) => {
                    dispatch({ type: 'rateNow', now: Date.now(), intensity: v });
                    setRateOpen(false);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setRateOpen(true)}>Como está agora?</Button>
              <Button onClick={() => dispatch({ type: 'extend', extraSec: 60 })}>+ 1 min</Button>
            </div>
          )}
          {s.ratings.length ? <div className="text-[12px] text-ink-3">Registrado: {s.ratings.map((r) => r.intensity).join(' → ')}</div> : null}

          <div className="grid grid-cols-2 gap-2 pb-2">
            <Button variant="primary" size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now() })} data-testid="sos-passed">
              Passou
            </Button>
            <Button variant="danger" size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now() })} data-testid="sos-smoked">
              Fumei
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Saída: um toque de intensidade, gatilho opcional, resultado.
  return (
    <div className="space-y-4 pt-2">
      <Label>Registro rápido</Label>
      <h1 className="text-2xl font-bold">Como está a vontade agora?</h1>
      <Scale ariaLabel="Intensidade final" value={s.intensityAfter} onChange={(v) => dispatch({ type: 'setAfter', intensity: v })} labels={['nada', 'insuportável']} />
      <div>
        <Label className="mb-2">O que puxou? (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((t) => (
            <Chip key={t.id} active={s.trigger === t.id} onClick={() => dispatch({ type: 'setTrigger', trigger: s.trigger === t.id ? null : t.id })}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="text-[12px] text-ink-3">
        Duração: {Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000)} s · estratégia: {strat.label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" size="lg" disabled={saving} onClick={() => finish('resisted')} data-testid="sos-save-resisted">
          Passou, salvar
        </Button>
        <Button variant="danger" size="lg" disabled={saving} onClick={() => finish('slipped')} data-testid="sos-save-slipped">
          Fumei, registrar
        </Button>
      </div>
      <p className="text-[12px] text-ink-3">Se fumou: sem culpa. O próximo passo é o que importa, e o app vai te levar para ele.</p>
    </div>
  );
}

/** Texto do ciclo 4-4-6 (14 s), em sincronia com a animação. Funciona sem animação quando "reduzir movimento" está ativo. */
function BreathCue({ startedAt, now }: { startedAt: number; now: number }) {
  const t = ((now - startedAt) / 1000) % 14;
  const phase = t < 4 ? `Inspire · ${Math.ceil(4 - t)}` : t < 8 ? `Segure · ${Math.ceil(8 - t)}` : `Solte · ${Math.ceil(14 - t)}`;
  return (
    <div className="tabular mt-3 text-base font-semibold text-accent" aria-live="polite">
      {phase}
    </div>
  );
}
