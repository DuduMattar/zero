import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, productById, type ProductId, type Profile } from '../../domain/types';
import { epochToLocalInput, localInputToEpoch } from '../../domain/format';
import { saveProfile, updateSettings } from '../../data/repos';
import { GOAL_PRESETS, REASON_PRESETS, TRIGGERS } from '../../content/strategies';
import { Button, Chip, Field, Label, Progress, Segmented, inputCls, useToast } from '../../ui';
import { ConsumoInput } from '../../ui/ConsumoInput';
import { toConsumption, type ConsumptionInput } from '../../domain/consumption';

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
const TOTAL = 10;

interface Draft {
  products: ProductId[];
  cons: ConsumptionInput;
  consSkip: boolean;
  yearsUsing: string;
  triedBefore: boolean | null;
  longestQuitDays: string;
  triggers: string[];
  reasons: string[];
  customReason: string;
  quitMode: 'already' | 'planned';
  quitAt: string;
  nrtUses: boolean;
  nrtKind: 'patch' | 'gum' | 'lozenge' | 'other';
  goals: string[];
  customGoal: string;
}

export function Onboarding() {
  const nav = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(() => ({
    products: ['cigarette'],
    cons: { product: 'cigarette', amount: 0, packPrice: 0 },
    consSkip: false,
    yearsUsing: '',
    triedBefore: null,
    longestQuitDays: '',
    triggers: [],
    reasons: [],
    customReason: '',
    quitMode: 'already',
    quitAt: epochToLocalInput(Date.now(), TZ),
    nrtUses: false,
    nrtKind: 'patch',
    goals: [],
    customGoal: '',
  }));
  const up = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  async function finish() {
    const now = Date.now();
    const mainProduct = d.products.includes(d.cons.product) ? d.cons.product : (d.products[0] ?? d.cons.product);
    const conv = d.consSkip ? null : toConsumption({ ...d.cons, product: mainProduct });
    const quitAt = localInputToEpoch(d.quitAt, TZ);
    const reasons = [...d.reasons, ...(d.customReason.trim() ? [d.customReason.trim()] : [])];
    const goals = [...d.goals, ...(d.customGoal.trim() ? [d.customGoal.trim()] : [])];
    const profile: Profile = {
      id: 'singleton',
      products: d.products.length ? d.products : [mainProduct],
      consumption: conv ?? { product: mainProduct, unitsPerDay: 0, pricePerUnit: 0 },
      currency: 'BRL',
      quitAt,
      nicotineFreeAt: d.nrtUses ? null : quitAt,
      nrt: { uses: d.nrtUses, kind: d.nrtUses ? d.nrtKind : undefined, plannedEndAt: null },
      yearsUsing: d.yearsUsing ? Number(d.yearsUsing) : null,
      longestQuitDays: d.longestQuitDays ? Number(d.longestQuitDays) : null,
      triedBefore: d.triedBefore,
      triggers: d.triggers,
      reasons,
      goals,
      tz: TZ,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await saveProfile(profile);
      await updateSettings({ onboardingDone: true });
      nav('/', { replace: true });
    } catch (e) {
      toast('Não consegui salvar. Tente de novo.', 'err');
      console.error(e);
    }
  }

  const selectable = PRODUCTS.filter((p) => p.selectable);

  const screens = [
    // 0
    <div key="0" className="space-y-4">
      <div className="pt-6">
        <div className="display text-[0.8rem] font-bold tracking-[0.3em] text-accent">ZERO</div>
        <h1 className="mt-2 text-3xl font-bold leading-tight">Para parar de fumar. Sem conversa, com registro.</h1>
      </div>
      <p className="text-ink-2">Não é um chat nem uma IA. É um botão de emergência para as vontades, um contador que não mente, um diário e um histórico honesto, com lapsos e tudo.</p>
      <ul className="space-y-2 text-[14px] text-ink-2">
        <li>• Seus dados ficam <b className="text-ink">só neste aparelho</b>. Nada vai para servidor. Remover o app da tela de início apaga tudo: faça backup.</li>
        <li>• Sem conta, sem assinatura, sem anúncios.</li>
        <li>• Você vai responder umas perguntas rápidas. Todas podem ser puladas.</li>
      </ul>
    </div>,
    // 1
    <div key="1" className="space-y-3">
      <h2 className="text-[1.75rem] font-bold leading-tight">O que você usa?</h2>
      <p className="text-ink-2">Marque tudo que se aplica. Isso define quais contadores aparecem.</p>
      <div className="flex flex-wrap gap-2">
        {selectable.map((p) => (
          <Chip key={p.id} active={d.products.includes(p.id)} onClick={() => up({ products: toggle(d.products, p.id) as ProductId[] })}>
            {p.label}
          </Chip>
        ))}
      </div>
    </div>,
    // 2
    <div key="2" className="space-y-5">
      <h2 className="text-[1.75rem] font-bold leading-tight">Quanto você usava?</h2>
      <p className="text-ink-2">Na unidade em que você pensa. Serve para estimar o dinheiro e o consumo evitado; pode ser aproximado.</p>
      <ConsumoInput
        products={d.products.length ? d.products : (['cigarette'] as ProductId[])}
        value={d.products.includes(d.cons.product) ? d.cons : { ...d.cons, product: d.products[0] ?? 'cigarette' }}
        onChange={(cons) => up({ cons })}
        skipped={d.consSkip}
        onSkip={(consSkip) => up({ consSkip })}
      />
    </div>,
    // 3
    <div key="3" className="space-y-4">
      <h2 className="text-[1.75rem] font-bold leading-tight">Sua história</h2>
      <Field label="Há quantos anos usa nicotina?">
        <input className={inputCls} inputMode="numeric" placeholder="ex.: 7" value={d.yearsUsing} onChange={(e) => up({ yearsUsing: e.target.value })} />
      </Field>
      <Field label="Já tentou parar antes?">
        <Segmented ariaLabel="Já tentou parar" value={d.triedBefore === null ? 'skip' : d.triedBefore ? 'yes' : 'no'} onChange={(v) => up({ triedBefore: v === 'skip' ? null : v === 'yes' })} options={[{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }, { value: 'skip', label: 'Pular' }]} />
      </Field>
      <Field label="Maior período sem fumar (dias)" hint="Vale como referência. Seu recorde novo começa agora.">
        <input className={inputCls} inputMode="numeric" placeholder="ex.: 180" value={d.longestQuitDays} onChange={(e) => up({ longestQuitDays: e.target.value })} />
      </Field>
    </div>,
    // 4
    <div key="4" className="space-y-3">
      <h2 className="text-[1.75rem] font-bold leading-tight">Quando dá mais vontade?</h2>
      <p className="text-ink-2">Seus gatilhos conhecidos. O app vai aprender outros com o tempo.</p>
      <div className="flex flex-wrap gap-2">
        {TRIGGERS.filter((t) => t.id !== 'other').map((t) => (
          <Chip key={t.id} active={d.triggers.includes(t.id)} onClick={() => up({ triggers: toggle(d.triggers, t.id) })}>
            {t.label}
          </Chip>
        ))}
      </div>
    </div>,
    // 5
    <div key="5" className="space-y-3">
      <h2 className="text-[1.75rem] font-bold leading-tight">Por que parar?</h2>
      <p className="text-ink-2">Esses motivos aparecem nos momentos difíceis. Escolha os seus de verdade.</p>
      <div className="flex flex-wrap gap-2">
        {REASON_PRESETS.map((r) => (
          <Chip key={r} active={d.reasons.includes(r)} onClick={() => up({ reasons: toggle(d.reasons, r) })}>
            {r}
          </Chip>
        ))}
      </div>
      <input className={inputCls} placeholder="Outro motivo, com suas palavras" value={d.customReason} onChange={(e) => up({ customReason: e.target.value })} />
    </div>,
    // 6
    <div key="6" className="space-y-4">
      <h2 className="text-[1.75rem] font-bold leading-tight">Sua data de parada</h2>
      <Segmented ariaLabel="Modo" value={d.quitMode} onChange={(v) => up({ quitMode: v })} options={[{ value: 'already', label: 'Já parei' }, { value: 'planned', label: 'Vou parar em' }]} />
      <Field label={d.quitMode === 'already' ? 'Último uso foi em' : 'Vou parar em'} hint={d.quitMode === 'planned' ? 'Até lá o app fica em modo preparação e os contadores começam na hora marcada.' : 'Pode ajustar depois, nos Ajustes.'}>
        <input type="datetime-local" className={inputCls} value={d.quitAt} onChange={(e) => up({ quitAt: e.target.value })} />
      </Field>
    </div>,
    // 7
    <div key="7" className="space-y-4">
      <h2 className="text-[1.75rem] font-bold leading-tight">Tratamento com nicotina?</h2>
      <p className="text-ink-2">Adesivo, goma ou pastilha de nicotina (reposição) não contam como lapso. O contador "sem nicotina" começa quando você encerrar o tratamento.</p>
      <Segmented ariaLabel="Usa reposição" value={d.nrtUses ? 'yes' : 'no'} onChange={(v) => up({ nrtUses: v === 'yes' })} options={[{ value: 'no', label: 'Não uso' }, { value: 'yes', label: 'Uso' }]} />
      {d.nrtUses ? (
        <Field label="Tipo">
          <select className={inputCls} value={d.nrtKind} onChange={(e) => up({ nrtKind: e.target.value as Draft['nrtKind'] })}>
            <option value="patch">Adesivo</option>
            <option value="gum">Goma</option>
            <option value="lozenge">Pastilha</option>
            <option value="other">Outro</option>
          </select>
        </Field>
      ) : null}
      <p className="text-[12px] text-ink-3">O app não prescreve nem substitui avaliação profissional. No SUS, o tratamento é gratuito: procure a UBS ou ligue 136.</p>
    </div>,
    // 8
    <div key="8" className="space-y-3">
      <h2 className="text-[1.75rem] font-bold leading-tight">Metas</h2>
      <div className="flex flex-wrap gap-2">
        {GOAL_PRESETS.map((g) => (
          <Chip key={g} active={d.goals.includes(g)} onClick={() => up({ goals: toggle(d.goals, g) })}>
            {g}
          </Chip>
        ))}
      </div>
      <input className={inputCls} placeholder="Outra meta" value={d.customGoal} onChange={(e) => up({ customGoal: e.target.value })} />
    </div>,
    // 9
    <div key="9" className="space-y-4">
      <h2 className="text-[1.75rem] font-bold leading-tight">Pronto para começar</h2>
      <div className="card space-y-2 p-4 text-[14px]">
        <div><Label>Produtos</Label>{(d.products.length ? d.products : [d.cons.product]).map((p) => productById(p).label).join(', ')}</div>
        <div><Label>Parada</Label>{d.quitMode === 'already' ? 'Já parei em' : 'Vou parar em'} {d.quitAt.replace('T', ' às ')}</div>
        <div><Label>Reposição de nicotina</Label>{d.nrtUses ? 'Sim' : 'Não'}</div>
        <div><Label>Motivos</Label>{d.reasons.length + (d.customReason.trim() ? 1 : 0) || 'nenhum ainda'}</div>
      </div>
      <p className="text-[13px] text-ink-2">
        Importante: no iPhone, dados de site podem ser apagados após dias sem uso. Depois, em Ajustes, <b className="text-ink">adicione o ZERO à tela de início</b> e faça um backup.
      </p>
    </div>,
  ];

  const isLast = step === TOTAL - 1;
  return (
    <div className="safe-top mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-6">
      <div className="pt-3">
        <Progress value01={(step + 1) / TOTAL} />
        <div className="mt-1 text-[11px] text-ink-3">
          {step + 1} de {TOTAL}
        </div>
      </div>
      <div className="fade-up flex flex-1 flex-col justify-center py-6" key={step}>
        {screens[step]}
      </div>
      <div className="safe-bottom flex gap-2">
        {step > 0 ? (
          <Button variant="ghost" onClick={back}>
            Voltar
          </Button>
        ) : null}
        {!isLast && step > 0 ? (
          <Button variant="ghost" onClick={next}>
            Pular
          </Button>
        ) : null}
        <Button variant="primary" full size="lg" onClick={isLast ? finish : next} data-testid="onb-next">
          {step === 0 ? 'Começar' : isLast ? 'Concluir' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
