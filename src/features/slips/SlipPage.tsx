import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { addEvent, stamp } from '../../data/repos';
import { bestStrategy } from '../../domain/craving';
import { epochToLocalInput, humanDuration, localInputToEpoch, wholeDays } from '../../domain/format';
import { MS_DAY } from '../../domain/tracks';
import { PRODUCTS, productById, type ProductId } from '../../domain/types';
import { FEELINGS, TRIGGERS, strategyById } from '../../content/strategies';
import { Button, Card, Chip, Field, Label, Segmented, inputCls, useToast } from '../../ui';

type Mode = 'lapso' | 'recaida' | 'marco';

export function SlipPage() {
  const data = useData(60_000);
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const toast = useToast();
  const fromSos = sp.get('from') === 'sos';
  const [mode, setMode] = useState<Mode>((sp.get('modo') as Mode) || 'lapso');
  const [done, setDone] = useState<'slip' | 'relapse' | 'marker' | null>(null);

  // lapso
  const [product, setProduct] = useState<ProductId>('cigarette');
  const [hadNicotine, setHadNicotine] = useState(true);
  const [units, setUnits] = useState('1');
  const [when, setWhen] = useState(() => epochToLocalInput(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [lasted, setLasted] = useState(false);
  const [until, setUntil] = useState(() => epochToLocalInput(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [details, setDetails] = useState(false);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [lesson, setLesson] = useState('');
  // recaída
  const [rProducts, setRProducts] = useState<ProductId[]>([]);
  const [rNote, setRNote] = useState('');
  // marco
  const [mWhen, setMWhen] = useState(() => epochToLocalInput(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [mReason, setMReason] = useState('');

  const best = useMemo(() => (data ? bestStrategy(data.events) : null), [data]);
  if (!data) return null;
  const { profile, events, tracks, now } = data;
  const recentSlips = events.filter((e) => e.type === 'slip' && now - e.at < 72 * 3_600_000).length;
  const selectable = PRODUCTS.filter((p) => p.selectable);

  async function saveSlip() {
    const at = localInputToEpoch(when, profile.tz);
    if (at > Date.now() + 60_000) return toast('A data não pode ser no futuro.', 'err');
    const u = Math.max(0.1, Number(units.replace(',', '.')) || 1);
    const untilAt = lasted ? localInputToEpoch(until, profile.tz) : null;
    if (untilAt != null && untilAt <= at) return toast('O fim precisa ser depois do início.', 'err');
    if (untilAt != null && untilAt > Date.now() + 60_000) return toast('O fim não pode ser no futuro.', 'err');
    try {
      await addEvent({ ...stamp(Date.now(), profile.tz), type: 'slip', at, product, hadNicotine, units: u, untilAt, trigger, feeling, note: note.trim(), lesson: lesson.trim() });
      setDone('slip');
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
    }
  }
  async function saveRelapse() {
    if (!rProducts.length) return toast('Marque pelo menos um produto.', 'err');
    try {
      await addEvent({ ...stamp(Date.now(), profile.tz), type: 'relapse', at: Date.now(), products: rProducts, hadNicotine: true, note: rNote.trim() });
      setDone('relapse');
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
    }
  }
  async function saveMarker() {
    const at = localInputToEpoch(mWhen, profile.tz);
    try {
      await addEvent({ ...stamp(Date.now(), profile.tz), type: 'quit_marker_reset', at: Date.now(), newQuitAt: at, newNicotineFreeAt: profile.nrt.uses && profile.nicotineFreeAt == null ? null : at, reason: mReason.trim() });
      setDone('marker');
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
    }
  }

  if (done === 'slip') {
    const main = tracks.tobaccoOrVape;
    const strat = best ? strategyById(best.strategy) : strategyById('breathing');
    return (
      <div className="space-y-3 pt-2">
        <Label>Registrado</Label>
        <h1 className="text-2xl font-bold">Uso registrado. O histórico permanece.</h1>
        <Card className="space-y-1">
          <div className="text-[14px] text-ink-2">
            Dias somados: <b className="tabular text-ink">{wholeDays(main.totalFreeMs)}</b>. Maior período contínuo: <b className="text-ink">{humanDuration(main.bestMs)}</b>. Nada disso foi perdido.
          </div>
          <div className="text-[13px] text-ink-3">A sequência contínua recomeçou a partir deste uso. Isso não significa que todos os benefícios anteriores desapareceram. A referência de recuperação segue contando desde o início desta tentativa; só uma recaída, com novo marco, a reinicia.</div>
        </Card>
        <Card className="space-y-2">
          <Label>Próxima hora</Label>
          <ul className="space-y-1.5 text-[14px]">
            <li>• Tire do alcance o que sobrou (pod, maço, isqueiro). Agora, não depois.</li>
            <li>• Se vier outra vontade, use <b>{strat.label.toLowerCase()}</b>{best ? ' (a que mais funcionou com você)' : ''}.</li>
            <li>• Beba água, coma algo e saia do lugar onde fumou.</li>
            {profile.reasons[0] ? <li>• Seu motivo: <b>{profile.reasons[0]}</b>.</li> : null}
          </ul>
        </Card>
        {recentSlips >= 1 ? (
          <Card tone="warn" className="text-[13px] text-ink-2">
            Dois ou mais lapsos em 72 h podem indicar que o consumo voltou. Se for o caso, registrar como <b className="text-ink">recaída</b> é mais honesto e o app te ajuda a marcar um novo começo. Só você decide.
          </Card>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" size="lg" onClick={() => nav('/sos')}>
            Abrir SOS
          </Button>
          <Button size="lg" onClick={() => nav('/')}>
            Voltar ao painel
          </Button>
        </div>
      </div>
    );
  }
  if (done === 'relapse') {
    return (
      <div className="space-y-3 pt-2">
        <Label>Registrado</Label>
        <h1 className="text-2xl font-bold">Recaída anotada. O histórico ficou.</h1>
        <p className="text-[14px] text-ink-2">O contador atual fica parado em "em recaída". Dias acumulados e recorde seguem guardados. Quando decidir recomeçar, marque um novo ponto de partida: pode ser agora, amanhã cedo ou numa data que você escolher.</p>
        <Button variant="primary" size="lg" full onClick={() => { setDone(null); setMode('marco'); }}>
          Marcar novo ponto de partida
        </Button>
        <Button full onClick={() => nav('/')}>
          Voltar ao painel
        </Button>
      </div>
    );
  }
  if (done === 'marker') {
    return (
      <div className="space-y-3 pt-2">
        <Label>Pronto</Label>
        <h1 className="text-2xl font-bold">Novo ponto de partida marcado.</h1>
        <p className="text-[14px] text-ink-2">Os contadores recomeçam a partir dessa data. Tudo o que veio antes continua no histórico.</p>
        <Button variant="primary" size="lg" full onClick={() => nav('/')}>
          Ir para o painel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl font-bold">{fromSos ? 'Sem culpa. Vamos registrar.' : 'Lapsos e recaídas'}</h1>
      <Segmented ariaLabel="Tipo de registro" value={mode} onChange={setMode} options={[{ value: 'lapso', label: 'Lapso' }, { value: 'recaida', label: 'Recaída' }, { value: 'marco', label: 'Novo marco' }]} />

      {mode === 'lapso' ? (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-2">Lapso = um episódio isolado. Encerra a sequência das trilhas afetadas e reabre no mesmo instante. Dias acumulados e recorde não mudam.</p>
          <div>
            <Label className="mb-2">O que foi usado?</Label>
            {profile.nrt.uses ? <div className="mb-2 text-[0.8rem] text-ink-3">Adesivo, goma e pastilha do tratamento não são uso: registre doses em Ajustes → Reposição de nicotina.</div> : null}
            <div className="flex flex-wrap gap-2">
              {selectable.map((p) => (
                <Chip key={p.id} active={product === p.id} onClick={() => { setProduct(p.id); setHadNicotine(p.nicotineByDefault); }}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
          {productById(product).cls === 'vape' ? (
            <Segmented ariaLabel="Tinha nicotina" value={hadNicotine ? 'yes' : 'no'} onChange={(v) => setHadNicotine(v === 'yes')} options={[{ value: 'yes', label: 'Com nicotina' }, { value: 'no', label: 'Sem nicotina (0 mg)' }]} />
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Quantidade (${productById(product).unitLabelPlural})`}>
              <input className={inputCls} inputMode="decimal" value={units} onChange={(e) => setUnits(e.target.value)} data-testid="slip-units" />
            </Field>
            <Field label={lasted ? 'Começou em' : 'Quando'}>
              <input type="datetime-local" className={inputCls} value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
          </div>
          <Chip active={lasted} onClick={() => setLasted((v) => !v)}>{lasted ? '✓ ' : ''}Durou um tempo (ex.: a noite inteira)</Chip>
          {lasted ? (
            <Field label="Terminou em" hint="As horas entre o início e o fim não contam como livres.">
              <input type="datetime-local" className={inputCls} value={until} onChange={(e) => setUntil(e.target.value)} />
            </Field>
          ) : null}
          <Button variant="primary" size="lg" full onClick={saveSlip} data-testid="slip-save">
            Registrar lapso
          </Button>
          <button type="button" className="w-full text-center text-[0.9rem] font-semibold text-ink-3" onClick={() => setDetails((v) => !v)}>
            {details ? 'Esconder detalhes' : 'Adicionar detalhes (opcional): gatilho, como estava, o que aprendeu'}
          </button>
          <div className={details ? 'space-y-4' : 'hidden'}>
          <div>
            <Label className="mb-2">Gatilho</Label>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <Chip key={t.id} active={trigger === t.id} onClick={() => setTrigger(trigger === t.id ? null : t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2">Como você estava?</Label>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <Chip key={f} active={feeling === f} onClick={() => setFeeling(feeling === f ? null : f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="O que aconteceu? (opcional)">
            <textarea className={`${inputCls} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Field label="O que pode ser diferente da próxima vez? (opcional)">
            <textarea className={`${inputCls} min-h-20`} value={lesson} onChange={(e) => setLesson(e.target.value)} />
          </Field>
          <Button variant="primary" size="lg" full onClick={saveSlip}>
            Registrar lapso com detalhes
          </Button>
          </div>
        </div>
      ) : null}

      {mode === 'recaida' ? (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-2">Recaída = voltou ao consumo regular. O contador atual para; dias acumulados e recorde ficam. Depois você marca um novo ponto de partida.</p>
          <div>
            <Label className="mb-2">Produtos</Label>
            <div className="flex flex-wrap gap-2">
              {selectable.map((p) => (
                <Chip key={p.id} active={rProducts.includes(p.id)} onClick={() => setRProducts((a) => (a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id]))}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="O que aconteceu? (opcional)">
            <textarea className={`${inputCls} min-h-20`} value={rNote} onChange={(e) => setRNote(e.target.value)} />
          </Field>
          <Button variant="primary" size="lg" full onClick={saveRelapse}>
            Registrar recaída
          </Button>
        </div>
      ) : null}

      {mode === 'marco' ? (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-2">Define um novo começo para os contadores sem apagar nada do histórico. Use depois de uma recaída ou para corrigir a data inicial.</p>
          <Field label="Novo ponto de partida">
            <input type="datetime-local" className={inputCls} value={mWhen} onChange={(e) => setMWhen(e.target.value)} />
          </Field>
          <Field label="Motivo (opcional)">
            <input className={inputCls} value={mReason} onChange={(e) => setMReason(e.target.value)} placeholder="ex.: recomeço depois da recaída" />
          </Field>
          <Button variant="primary" size="lg" full onClick={saveMarker}>
            Marcar novo ponto de partida
          </Button>
          <div className="text-[12px] text-ink-3">Hoje: {wholeDays(tracks.tobaccoOrVape.totalFreeMs)} dias acumulados · {events.filter((e) => e.type === 'quit_marker_reset').length} {events.filter((e) => e.type === 'quit_marker_reset').length === 1 ? 'recomeço' : 'recomeços'} · perfil criado há {wholeDays(now - profile.createdAt)} {wholeDays(now - profile.createdAt) === 1 ? 'dia' : 'dias'}</div>
        </div>
      ) : null}
      <div className="h-2" />
      <div className="text-[11px] text-ink-3">Referência: {Math.round(MS_DAY / 3_600_000)} h = 1 dia. Registros são permanentes; um registro feito por engano pode ser apagado no Histórico em até 24 h.</div>
    </div>
  );
}
