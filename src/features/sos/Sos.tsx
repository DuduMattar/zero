import { useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData, type Data } from '../../app/hooks/useData';
import { addEvent, stamp, updateSettings } from '../../data/repos';
import { cravingReducer, initialCraving, toCravingEvent, usedNrtStrategy, type CravingState } from '../../domain/craving';
import { STRATEGIES, TRIGGERS, strategyById } from '../../content/strategies';
import { Button, Chip, Label, Scale, Sheet, useToast } from '../../ui';

const DRAFT_MAX_AGE_MS = 6 * 3_600_000;

function useTick(active: boolean) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setT(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [active]);
  return t;
}

/** Rascunho válido: episódio começado há menos de 6 h e ainda não concluído. */
export function validDraft(raw: unknown, now: number): CravingState | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<CravingState>;
  if (!d.startedAt || d.step === 'done' || now - d.startedAt > DRAFT_MAX_AGE_MS || !Array.isArray(d.strategies)) return null;
  return { ...initialCraving(), ...d } as CravingState;
}

/** Link do WhatsApp com mensagem pronta. Só prepara; quem envia é a pessoa. */
export function whatsappLink(phone: string, message: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length <= 11) digits = '55' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function Sos() {
  const data = useData(60_000);
  if (!data) return null;
  return <SosInner data={data} />;
}

function SosInner({ data }: { data: Data }) {
  const nav = useNavigate();
  const toast = useToast();
  const { profile, settings } = data;
  const [s, dispatch] = useReducer(cravingReducer, undefined, () => {
    // Alívio primeiro: a estratégia já começa ao abrir. Se há episódio em andamento, retoma exatamente ele.
    const draft = validDraft(settings.sosDraft, Date.now());
    if (draft) return draft;
    const strat = strategyById(settings.favoriteStrategy ?? 'breathing');
    return cravingReducer(initialCraving(), { type: 'start', now: Date.now(), strategy: strat.id, durationSec: settings.sosDefaultDurationSec || strat.defaultSec });
  });
  const [rateOpen, setRateOpen] = useState(false);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const resumed = useRef(Boolean(validDraft(settings.sosDraft, Date.now())));

  // Rascunho gravado a cada passo: fechar o app, abrir o WhatsApp ou recarregar não perde o episódio.
  useEffect(() => {
    if (s.step === 'done') return;
    updateSettings({ sosDraft: s }).catch(console.error);
  }, [s]);
  useEffect(() => {
    if (resumed.current) toast('Vontade em andamento retomada.');
  }, [toast]);

  const now = useTick(s.step === 'relief');
  const elapsed = Math.max(0, Math.floor((now - s.startedAt) / 1000));
  const remaining = Math.max(0, s.durationSec - elapsed);
  const over = remaining === 0;
  const strat = strategyById(s.strategy);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const available = STRATEGIES.filter((x) => !x.requiresNrt || profile.nrt.uses);
  const emergency = profile.goals.filter((g) => /^se eu/i.test(g));
  const hasVape = profile.products.includes('vape');
  const hasPouch = profile.products.includes('pouch');
  const hasSmoke = profile.products.some((id) => id !== 'vape' && id !== 'pouch');
  const usedLabel = hasPouch || (hasVape && hasSmoke) ? 'Usei' : hasVape ? 'Vapei' : 'Fumei';
  const nrtInSession = profile.nrt.uses && usedNrtStrategy(s);
  const support = profile.support && profile.support.phone ? profile.support : null;
  const measures = [...(s.intensityBefore != null ? [`${s.intensityBefore} aos ${s.intensityBeforeAtSec ?? 0} s`] : []), ...s.ratings.map((r) => String(r.intensity))];

  async function persist(final: CravingState) {
    const ev = toCravingEvent(final, stamp(Date.now(), profile.tz).id, profile.tz, Date.now());
    await addEvent(ev);
    if (final.nrtUsed) {
      // Dose confirmada pela pessoa, com o horário de agora; nunca inferida da estratégia escolhida.
      await addEvent({ ...stamp(Date.now(), profile.tz), type: 'nrt_dose', at: Date.now(), kind: final.nrtUsed, mg: null, note: 'Durante uma vontade (SOS)' });
    }
    await updateSettings({ sosDraft: null });
  }

  async function finish(outcome: 'resisted' | 'slipped' | 'continued' | 'abandoned') {
    setSaving(true);
    try {
      await persist(cravingReducer(s, { type: 'finish', outcome, now: Date.now() }));
      if (outcome === 'slipped') nav('/lapso?from=sos', { replace: true });
      else {
        toast(outcome === 'resisted' ? 'Registrado.' : outcome === 'continued' ? 'Registrado. Volte quando precisar.' : 'Encerrada e registrada.');
        nav('/', { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
      setSaving(false);
    }
  }

  async function discard() {
    await updateSettings({ sosDraft: null });
    nav(-1);
  }

  function pickStrategy(id: string) {
    const x = strategyById(id);
    dispatch({ type: 'setStrategy', strategy: id, now: Date.now(), durationSec: x.defaultSec });
    setPickerOpen(false);
    setReasonsOpen(false);
  }

  const picker = (
    <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Trocar estratégia">
      <div className="space-y-2">
        {available.map((x) => (
          <button key={x.id} type="button" className={`press flex w-full items-center justify-between rounded-2xl border p-4 text-left ${x.id === s.strategy ? 'border-accent bg-accent/10' : 'border-line bg-card-2'}`} onClick={() => pickStrategy(x.id)} data-testid={`strategy-${x.id}`}>
            <span>
              <span className="block font-semibold">{x.label}</span>
              <span className="block text-[0.85rem] text-ink-3">{x.steps[0]}</span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );

  const closeSheet = (
    <Sheet open={closeOpen} onClose={() => setCloseOpen(false)} title="Fechar o SOS">
      <div className="space-y-2">
        <Button full size="lg" variant="primary" disabled={saving} onClick={() => finish('abandoned')} data-testid="sos-close-save">
          Salvar como encerrada sem avaliação final
        </Button>
        <Button full size="lg" onClick={discard} data-testid="sos-close-discard">
          Descartar: abri sem querer
        </Button>
        <Button full variant="ghost" onClick={() => setCloseOpen(false)}>Voltar</Button>
      </div>
    </Sheet>
  );

  const nrtConfirm = nrtInSession ? (
    <div className="card space-y-2 p-4" data-testid="sos-nrt-confirm">
      <div className="font-semibold">Você usou a reposição nesta vontade?</div>
      <div className="flex flex-wrap gap-2">
        {([['gum', 'Goma'], ['lozenge', 'Pastilha'], ['patch', 'Adesivo'], ['other', 'Outro']] as const).map(([k, l]) => (
          <Chip key={k} active={s.nrtUsed === k} onClick={() => dispatch({ type: 'setNrtUsed', kind: s.nrtUsed === k ? null : k })}>{l}</Chip>
        ))}
        <Chip active={s.nrtUsed === null} onClick={() => dispatch({ type: 'setNrtUsed', kind: null })}>Não usei</Chip>
      </div>
      <div className="text-[0.8rem] text-ink-3">Se confirmar, a dose é registrada agora como parte do tratamento, não como uso.</div>
    </div>
  ) : null;

  if (s.step === 'relief') {
    return (
      <div className="flex min-h-[calc(100dvh-24px)] flex-col">
        <div className="flex items-center justify-between">
          <button type="button" className="text-[0.85rem] font-semibold text-ink-3" onClick={() => setCloseOpen(true)}>
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
                {profile.reasons.length ? profile.reasons.map((r) => <li key={r}>• {r}</li>) : <li className="text-ink-3">Você ainda não escreveu motivos. Ajustes → Perfil.</li>}
              </ul>
            </div>
          ) : (
            <>
              {strat.guided === 'breathing' ? (
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <div className="breathe absolute inset-0 rounded-full bg-calm/20" aria-hidden />
                  <div className="relative"><BreathCue startedAt={s.strategyStartedAt || s.startedAt} now={now} /></div>
                </div>
              ) : null}
              <h1 className={`${strat.guided === 'breathing' ? 'mt-6' : ''} text-[1.5rem] font-bold leading-tight`}>{strat.label}</h1>
              <ol className="mt-3 w-full space-y-2 px-2 text-[1.05rem] leading-snug text-ink-2">
                {strat.steps.map((st, i) => (
                  <li key={st} className={i === 0 ? 'text-[1.15rem] font-semibold text-ink' : ''}>{st}</li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Button size="sm" onClick={() => setPickerOpen(true)} data-testid="sos-switch">Trocar estratégia</Button>
            {profile.reasons.length ? (
              <Button size="sm" variant="ghost" onClick={() => setReasonsOpen((v) => !v)} data-testid="sos-toggle-reasons">
                {reasonsOpen ? 'Voltar à estratégia' : 'Ler meus motivos'}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {rateOpen ? (
            <div className="card p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{s.intensityBefore == null ? 'Quanto está a vontade agora?' : 'E agora?'}</span>
                <span className="text-[0.75rem] text-ink-3">opcional</span>
              </div>
              <div className="mt-2">
                <Scale
                  ariaLabel="Intensidade agora"
                  value={null}
                  labels={['nada', 'insuportável']}
                  onChange={(v) => {
                    dispatch({ type: 'rateNow', now: Date.now(), intensity: v });
                    setRateOpen(false);
                  }}
                />
              </div>
            </div>
          ) : (
            <Button full onClick={() => setRateOpen(true)}>{s.intensityBefore == null ? 'Como está a vontade? (opcional)' : 'Como está agora?'}</Button>
          )}
          {measures.length ? <div className="text-[0.75rem] text-ink-3">Registrado: {measures.join(' → ')}</div> : null}

          <div className="grid grid-cols-3 gap-2 pb-2">
            <Button variant="primary" size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now(), outcome: 'resisted' })} data-testid="sos-passed">
              Diminuiu
            </Button>
            <Button size="lg" onClick={() => dispatch({ type: 'toExit', now: Date.now(), outcome: 'continued' })} data-testid="sos-continue">
              Continua
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (nrtInSession) dispatch({ type: 'toExit', now: Date.now(), outcome: 'slipped' });
                else finish('slipped');
              }}
              data-testid="sos-smoked"
            >
              {usedLabel}
            </Button>
          </div>
        </div>
        {picker}
        {closeSheet}
      </div>
    );
  }

  if (s.outcome === 'continued') {
    const msg = support?.message || 'Estou com vontade de fumar agora. Você pode falar comigo por alguns minutos? Não preciso de bronca, só de companhia.';
    return (
      <div className="space-y-4 pt-2">
        <Label>A vontade continua</Label>
        <h1 className="text-2xl font-bold leading-tight">O que ajudaria agora?</h1>
        <div className="space-y-2">
          <Button variant="primary" size="lg" full onClick={() => { dispatch({ type: 'backToRelief' }); setPickerOpen(true); }} data-testid="sos-continue-switch">
            Tentar outra estratégia
          </Button>
          {support ? (
            <a href={whatsappLink(support.phone, msg)} target="_blank" rel="noopener" className="press inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-line bg-card-2 px-5 text-base font-semibold" data-testid="sos-support">
              Falar com {support.name || 'minha pessoa de apoio'}
            </a>
          ) : (
            <Link to="/ajustes/perfil" className="press inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-line bg-card-2 px-5 text-base font-semibold text-ink-2">
              Definir uma pessoa de apoio
            </Link>
          )}
          <Button size="lg" full disabled={saving} onClick={() => finish('continued')} data-testid="sos-save-continued">
            Encerrar e salvar
          </Button>
          {profile.reasons.length ? (
            <Button variant="ghost" full onClick={() => { dispatch({ type: 'backToRelief' }); setReasonsOpen(true); }}>
              Ler meus motivos
            </Button>
          ) : null}
        </div>
        {support ? <div className="text-[0.8rem] text-ink-3">Abre o WhatsApp com a mensagem pronta; você decide se envia. Este episódio fica salvo enquanto isso.</div> : null}
        {emergency.length ? (
          <div className="card space-y-1 p-4">
            <Label>Seu plano de emergência</Label>
            {emergency.map((g) => (
              <div key={g} className="text-ink-2">{g}</div>
            ))}
          </div>
        ) : null}
        {picker}
      </div>
    );
  }

  const slipped = s.outcome === 'slipped';
  return (
    <div className="space-y-4 pt-2">
      <Label>{slipped ? 'Registrar o uso' : 'A vontade diminuiu'}</Label>
      {slipped ? (
        <h1 className="text-2xl font-bold leading-tight">Antes de registrar o produto, uma pergunta.</h1>
      ) : (
        <>
          <h1 className="text-2xl font-bold leading-tight">Como está a vontade agora?</h1>
          <Scale ariaLabel="Intensidade final" value={s.intensityAfter} onChange={(v) => dispatch({ type: 'setAfter', intensity: v })} labels={['nada', 'insuportável']} />
        </>
      )}
      {nrtConfirm}
      {!slipped ? (
        contextOpen ? (
          <div>
            <Label className="mb-2">O que puxou?</Label>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <Chip key={t.id} active={s.trigger === t.id} onClick={() => dispatch({ type: 'setTrigger', trigger: s.trigger === t.id ? null : t.id })}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" className="text-[0.9rem] font-semibold text-ink-3" onClick={() => setContextOpen(true)} data-testid="sos-context">
            Adicionar contexto (opcional)
          </button>
        )
      ) : null}
      <div className="text-[0.75rem] text-ink-3">
        {Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000)} s · {s.strategies.length > 1 ? `${s.strategies.length} estratégias` : strat.label}
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
