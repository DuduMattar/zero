import { useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { addEvent, stamp } from '../../data/repos';
import { BASELINE_WINDOW_SEC, bestStrategy, cravingReducer, initialCraving, toCravingEvent } from '../../domain/craving';
import { STRATEGIES, TRIGGERS, strategyById } from '../../content/strategies';
import { Button, Chip, Label, Scale, Sheet, useToast } from '../../ui';

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
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const best = useMemo(() => (data ? bestStrategy(data.events) : null), [data]);

  // Alívio primeiro: a estratégia já começa ao abrir. Nenhum formulário antes.
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
  const available = STRATEGIES.filter((x) => !x.requiresNrt || data.profile.nrt.uses);
  const ordered = best ? [strategyById(best.strategy), ...available.filter((x) => x.id !== best.strategy)] : [...available];
  const baselineOpen = s.intensityBefore == null && elapsed <= BASELINE_WINDOW_SEC;
  const emergency = data.profile.goals.filter((g) => /^se eu/i.test(g));

  async function finish(outcome: 'resisted' | 'slipped' | 'continued') {
    setSaving(true);
    try {
      const final = cravingReducer(s, { type: 'finish', outcome, now: Date.now() });
      const ev = toCravingEvent(final, stamp(Date.now(), data!.profile.tz).id, data!.profile.tz, Date.now());
      await addEvent(ev);
      if (s.strategy === 'nrt_fast' && data!.profile.nrt.uses) {
        // Goma/pastilha dentro do tratamento: dose, não uso. Não toca em nenhuma trilha.
        const k = data!.profile.nrt.kind;
        await addEvent({ ...stamp(Date.now(), data!.profile.tz), type: 'nrt_dose', at: s.startedAt, kind: k === 'gum' || k === 'lozenge' ? k : 'gum', mg: null, note: 'Durante uma vontade (SOS)' });
      }
      if (outcome === 'slipped') nav('/lapso?from=sos', { replace: true });
      else {
        toast(outcome === 'resisted' ? 'Registrado.' : 'Registrado. Volte quando precisar.');
        nav('/', { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
      setSaving(false);
    }
  }

  const picker = (
    <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Trocar estratégia">
      <div className="space-y-2">
        {ordered.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`press flex w-full items-center justify-between rounded-2xl border p-4 text-left ${x.id === s.strategy ? 'border-accent bg-accent/10' : 'border-line bg-card-2'}`}
            onClick={() => {
              dispatch({ type: 'setStrategy', strategy: x.id });
              setPickerOpen(false);
              setReasonsOpen(false);
            }}
            data-testid={`strategy-${x.id}`}
          >
            <span>
              <span className="block font-semibold">{x.label}</span>
              <span className="block text-[0.85rem] text-ink-3">{x.steps[0]}</span>
            </span>
            {best && x.id === best.strategy ? <span className="shrink-0 text-accent">★</span> : null}
          </button>
        ))}
        {best ? <div className="text-[0.75rem] text-ink-3">★ Nos seus registros, esta esteve associada à maior queda média de intensidade ({best.measured} medidas). Não é garantia.</div> : null}
      </div>
    </Sheet>
  );

  if (s.step === 'relief') {
    return (
      <div className="flex min-h-[calc(100dvh-24px)] flex-col">
        <div className="flex items-center justify-between">
          <button type="button" className="text-[0.85rem] font-semibold text-ink-3" onClick={() => nav(-1)}>
            Fechar
          </button>
          <div className="tabular text-[0.85rem] text-ink-3" aria-live="off" data-testid="sos-timer">
            {over ? 'tempo concluído' : `${mm}:${ss}`}
          </div>
          <button type="button" className="text-[0.85rem] font-semibold text-ink-3" onClick={() => dispatch({ type: 'extend', extraSec: 60 })}>
            + 1 min
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
          {reasonsOpen ? (
            <div className="w-full rounded-2xl bg-card-2 p-5 text-left" data-testid="sos-reasons">
              <Label>Meus motivos</Label>
              <ul className="mt-2 space-y-2 text-[1.1rem]">
                {data.profile.reasons.length ? data.profile.reasons.map((r) => <li key={r}>• {r}</li>) : <li className="text-ink-3">Você ainda não escreveu motivos. Ajustes → Perfil.</li>}
              </ul>
            </div>
          ) : (
            <>
              <div className="relative flex h-44 w-44 items-center justify-center">
                {strat.guided === 'breathing' ? <div className="breathe absolute inset-0 rounded-full bg-calm/20" aria-hidden /> : <div className="absolute inset-0 rounded-full bg-card-2" aria-hidden />}
                <div className="relative">{strat.guided === 'breathing' ? <BreathCue startedAt={s.startedAt} now={now} /> : <span className="text-[1.1rem] font-semibold text-calm">{strat.short}</span>}</div>
              </div>
              <h1 className="mt-6 text-[1.5rem] font-bold leading-tight">{strat.label}</h1>
              <ol className="mt-3 w-full space-y-2 px-2 text-[1.05rem] leading-snug text-ink-2">
                {strat.steps.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Button size="sm" onClick={() => setPickerOpen(true)} data-testid="sos-switch">Trocar estratégia</Button>
            <Button size="sm" variant="ghost" onClick={() => setReasonsOpen((v) => !v)} data-testid="sos-toggle-reasons">
              {reasonsOpen ? 'Voltar à estratégia' : 'Ler meus motivos'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {baselineOpen ? (
            <div className="card p-3" data-testid="sos-baseline">
              <Label>Quanto está a vontade agora? (opcional, 0 = nada, 10 = insuportável)</Label>
              <div className="mt-2">
                <Scale ariaLabel="Vontade ao começar" value={null} onChange={(v) => dispatch({ type: 'rateBefore', now: Date.now(), intensity: v })} />
              </div>
            </div>
          ) : rateOpen ? (
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
            <Button full onClick={() => setRateOpen(true)}>Como está agora?</Button>
          )}
          {s.intensityBefore != null || s.ratings.length ? (
            <div className="text-[0.75rem] text-ink-3">
              Registrado: {[...(s.intensityBefore != null ? [`${s.intensityBefore} ao começar`] : []), ...s.ratings.map((r) => String(r.intensity))].join(' → ')}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2 pb-2">
            <Button variant="primary" size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now(), outcome: 'resisted' })} data-testid="sos-passed">
              Diminuiu
            </Button>
            <Button size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now(), outcome: 'continued' })} data-testid="sos-continue">
              Continua
            </Button>
            <Button size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now(), outcome: 'slipped' })} data-testid="sos-smoked">
              Fumei / vapei
            </Button>
          </div>
        </div>
        {picker}
      </div>
    );
  }

  const duration = Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000);

  if (s.outcome === 'continued') {
    return (
      <div className="space-y-4 pt-2">
        <Label>A vontade continua</Label>
        <h1 className="text-2xl font-bold leading-tight">Isso não é fracasso. É uma vontade que ainda não desceu.</h1>
        <p className="text-ink-2">Você pode seguir com outra estratégia, ler seus motivos, ou sair agora. O registro fica salvo de qualquer forma.</p>
        <div className="space-y-2">
          <Button variant="primary" size="lg" full onClick={() => { dispatch({ type: 'backToRelief' }); setPickerOpen(true); }} data-testid="sos-continue-switch">
            Trocar estratégia e continuar
          </Button>
          <Button size="lg" full onClick={() => { dispatch({ type: 'backToRelief' }); setReasonsOpen(true); }}>
            Ler meus motivos e continuar
          </Button>
          <Button size="lg" full disabled={saving} onClick={() => finish('continued')} data-testid="sos-save-continued">
            Sair e guardar o registro
          </Button>
        </div>
        {emergency.length ? (
          <div className="card space-y-1 p-4">
            <Label>Seu plano de emergência</Label>
            {emergency.map((g) => (
              <div key={g} className="text-ink-2">{g}</div>
            ))}
          </div>
        ) : null}
        <p className="text-[0.8rem] text-ink-3">Falar com alguém de confiança também é uma estratégia. Apoio gratuito: Disque Saúde 136.</p>
        {picker}
      </div>
    );
  }

  const slipped = s.outcome === 'slipped';
  return (
    <div className="space-y-4 pt-2">
      <Label>{slipped ? 'Fumei ou vapei' : 'A vontade diminuiu'}</Label>
      <h1 className="text-2xl font-bold leading-tight">{slipped ? 'Vamos registrar o que foi. Primeiro, como está a vontade agora?' : 'Como está a vontade agora?'}</h1>
      {slipped && data.profile.nrt.uses ? <p className="text-[0.85rem] text-ink-3">Adesivo, goma ou pastilha do tratamento não contam como uso. Se foi só isso, volte e escolha a estratégia "Reposição".</p> : null}
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
      <div className="text-[0.75rem] text-ink-3">
        {duration} s · {strat.label}
        {s.intensityBefore == null ? ' · sem avaliação inicial: este episódio não entra na comparação de estratégias' : ''}
      </div>
      {slipped ? (
        <Button variant="primary" size="lg" full disabled={saving} onClick={() => finish('slipped')} data-testid="sos-save-slipped">
          Registrar o uso
        </Button>
      ) : (
        <Button variant="primary" size="lg" full disabled={saving} onClick={() => finish('resisted')} data-testid="sos-save-resisted">
          Salvar
        </Button>
      )}
      <button type="button" className="w-full text-[0.85rem] font-semibold text-ink-3" onClick={() => dispatch({ type: 'backToRelief' })}>
        Voltar
      </button>
    </div>
  );
}

/** Texto do ciclo 4-4-6 (14 s), em sincronia com a animação. Funciona sem animação quando "reduzir movimento" está ativo. */
function BreathCue({ startedAt, now }: { startedAt: number; now: number }) {
  const t = ((now - startedAt) / 1000) % 14;
  const [word, n] = t < 4 ? ['Inspire', Math.ceil(4 - t)] : t < 8 ? ['Segure', Math.ceil(8 - t)] : ['Solte', Math.ceil(14 - t)];
  return (
    <div className="text-center" aria-live="polite">
      <div className="text-[1.4rem] font-bold text-calm">{word}</div>
      <div className="tabular text-[2.5rem] font-bold leading-none text-calm">{n}</div>
    </div>
  );
}
