import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { isStandalone } from '../../app/hooks/useNow';
import { useBoot } from '../../app/providers';
import { addEvent, saveProfile, stamp, storageEstimate, updateSettings, wipeAll } from '../../data/repos';
import { epochToLocalInput, formatDateTime, localInputToEpoch } from '../../domain/format';
import { Button, Card, Field, Label, Segmented, inputCls, useConfirm, useToast } from '../../ui';
import { ConsumoInput } from '../../ui/ConsumoInput';
import { fromConsumption, toConsumption, type ConsumptionInput } from '../../domain/consumption';

export function SettingsPage() {
  const data = useData(60_000);
  const boot = useBoot();
  const toast = useToast();
  const confirm = useConfirm(5000);
  const nav = useNavigate();
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null);
  const [cons, setCons] = useState<ConsumptionInput>({ product: 'cigarette', amount: 0, packPrice: 0 });
  const [consSkip, setConsSkip] = useState(false);
  const [quitAt, setQuitAt] = useState('');
  const [reasons, setReasons] = useState('');
  const [nrtEnd, setNrtEnd] = useState(() => epochToLocalInput(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [doseKind, setDoseKind] = useState<'patch' | 'gum' | 'lozenge' | 'other'>('patch');
  const [doseMg, setDoseMg] = useState('');

  useEffect(() => {
    storageEstimate().then(setEst);
  }, []);
  useEffect(() => {
    if (!data) return;
    setCons(fromConsumption(data.profile.consumption));
    setConsSkip(data.profile.consumption.unitsPerDay === 0);
    setQuitAt(epochToLocalInput(data.profile.quitAt, data.profile.tz));
    setReasons(data.profile.reasons.join('\n'));
  }, [data?.profile.updatedAt, data?.profile, data]);

  if (!data) return null;
  const { profile, settings, tracks } = data;
  const persistText = { pending: 'verificando…', granted: 'concedido pelo navegador', denied: 'negado pelo navegador', unsupported: 'não suportado' }[boot.persist];

  async function savePrice() {
    const c = consSkip ? { product: cons.product, unitsPerDay: 0, pricePerUnit: 0 } : toConsumption(cons);
    if (!c) return toast('Preencha a quantidade.', 'err');
    await addEvent({ ...stamp(Date.now(), profile.tz), type: 'price_change', at: Date.now(), unitsPerDay: c.unitsPerDay, pricePerUnit: c.pricePerUnit, effectiveFrom: Date.now() });
    if (c.product !== profile.consumption.product) await saveProfile({ ...profile, consumption: { ...profile.consumption, product: c.product }, updatedAt: Date.now() });
    toast('Consumo e preço atualizados a partir de agora.');
  }
  async function saveQuitAt() {
    const at = localInputToEpoch(quitAt, profile.tz);
    await saveProfile({ ...profile, quitAt: at, nicotineFreeAt: profile.nicotineFreeAt == null ? null : profile.nicotineFreeAt === profile.quitAt ? at : profile.nicotineFreeAt, updatedAt: Date.now() });
    toast('Data inicial corrigida.');
  }
  async function saveReasons() {
    await saveProfile({ ...profile, reasons: reasons.split('\n').map((s) => s.trim()).filter(Boolean), updatedAt: Date.now() });
    toast('Motivos salvos.');
  }
  async function endNrt() {
    const at = localInputToEpoch(nrtEnd, profile.tz);
    await addEvent({ ...stamp(Date.now(), profile.tz), type: 'nrt_ended', at: Date.now(), nicotineFreeAt: at });
    await saveProfile({ ...profile, nicotineFreeAt: profile.nicotineFreeAt ?? at, updatedAt: Date.now() });
    toast('Contador sem nicotina iniciado.');
  }
  async function wipe() {
    if (!confirm.confirm('wipe')) return;
    await wipeAll();
    nav('/onboarding', { replace: true });
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <Card className="space-y-3">
        <Label>Aparência</Label>
        <Segmented ariaLabel="Tema" value={settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[{ value: 'system', label: 'Sistema' }, { value: 'dark', label: 'Escuro' }, { value: 'light', label: 'Claro' }]} />
        <Segmented ariaLabel="Movimento" value={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} options={[{ value: 'system', label: 'Animações: sistema' }, { value: 'on', label: 'Reduzir movimento' }]} />
        <Segmented ariaLabel="Modo discreto" value={settings.discreetMode ? 'on' : 'off'} onChange={(v) => updateSettings({ discreetMode: v === 'on' })} options={[{ value: 'off', label: 'Números visíveis' }, { value: 'on', label: 'Modo discreto' }]} />
        <div className="text-[0.8rem] text-ink-3">Modo discreto borra os números do painel para usar o app em público. O ícone ◎ no topo do painel alterna.</div>
        <Field label="Duração padrão do SOS">
          <select className={inputCls} value={settings.sosDefaultDurationSec} onChange={(e) => updateSettings({ sosDefaultDurationSec: Number(e.target.value) })}>
            {[120, 180, 300, 600].map((s) => (
              <option key={s} value={s}>
                {s / 60} min
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card className="space-y-2">
        <Label>Dados e backup</Label>
        <div className="text-[13px] text-ink-2">
          Armazenamento persistente: <b className="text-ink">{persistText}</b>. No iPhone isso <b className="text-ink">não é garantia</b>: o sistema pode apagar dados de site. O que protege é o backup externo.
        </div>
        {est ? <div className="text-[12px] text-ink-3">Em uso: {(est.usage / 1024).toFixed(0)} KB</div> : null}
        <div className="text-[12px] text-ink-3">Último backup externo: {settings.lastExternalBackupAt ? formatDateTime(settings.lastExternalBackupAt, profile.tz) : 'nunca'}</div>
        <Link to="/ajustes/backup" className="block">
          <Button full variant="primary">Backups e restauração</Button>
        </Link>
        {!isStandalone() ? (
          <Link to="/ajustes/instalar" className="block">
            <Button full>Adicionar à tela de início</Button>
          </Link>
        ) : (
          <div className="text-[12px] text-accent">✓ Rodando como app instalado.</div>
        )}
      </Card>

      <Card className="space-y-4 p-6">
        <Label>Consumo e preço</Label>
        <ConsumoInput products={profile.products} value={cons} onChange={setCons} skipped={consSkip} onSkip={setConsSkip} />
        <Button onClick={savePrice}>Aplicar a partir de agora</Button>
        <div className="text-[0.8rem] text-ink-3">Mudanças valem daqui para a frente; o passado mantém o valor antigo.</div>
      </Card>

      <Link to="/ajustes/perfil" className="block">
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="font-semibold">Perfil</div>
            <div className="text-[0.85rem] text-ink-3">Produtos, gatilhos, motivos, metas e plano de emergência.</div>
          </div>
          <span className="text-xl text-ink-3">›</span>
        </Card>
      </Link>

      <Card className="space-y-3">
        <Label>Marco inicial</Label>
        <Field label="Data e hora em que parou" hint="Corrige a data inicial. Para recomeçar depois de uma recaída, use 'Novo marco' na tela de lapsos.">
          <input type="datetime-local" className={inputCls} value={quitAt} onChange={(e) => setQuitAt(e.target.value)} />
        </Field>
        <Button onClick={saveQuitAt}>Salvar data</Button>
      </Card>

      {tracks.nicotine.state === 'nrt' ? (
        <Card tone="warn" className="space-y-3">
          <Label>Reposição de nicotina</Label>
          <div className="text-[13px] text-ink-2">Você está em tratamento. Registre as doses para acompanhar; quando encerrar, marque abaixo e o contador "sem nicotina" começa nessa data.</div>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <select className={inputCls} value={doseKind} onChange={(e) => setDoseKind(e.target.value as typeof doseKind)}>
              <option value="patch">Adesivo</option>
              <option value="gum">Goma</option>
              <option value="lozenge">Pastilha</option>
              <option value="other">Outro</option>
            </select>
            <input className={inputCls} inputMode="decimal" placeholder="mg" value={doseMg} onChange={(e) => setDoseMg(e.target.value)} />
          </div>
          <Button
            onClick={async () => {
              await addEvent({ ...stamp(Date.now(), profile.tz), type: 'nrt_dose', at: Date.now(), kind: doseKind, mg: doseMg ? Number(doseMg.replace(',', '.')) : null, note: '' });
              setDoseMg('');
              toast('Dose registrada.');
            }}
          >
            Registrar dose agora
          </Button>
          <div className="text-[12px] text-ink-3">
            Hoje: {data.events.filter((e) => e.type === 'nrt_dose' && formatDateTime(e.at, profile.tz).slice(0, 10) === formatDateTime(data.now, profile.tz).slice(0, 10)).length} {data.events.filter((e) => e.type === 'nrt_dose').length === 1 ? 'dose' : 'doses'} · total {data.events.filter((e) => e.type === 'nrt_dose').length}.
            No SUS, o tratamento (adesivo + goma/pastilha, com acompanhamento) é gratuito pela UBS; a dose e a redução são decididas com o profissional, não pelo app.
          </div>
          <Field label="Encerrei em">
            <input type="datetime-local" className={inputCls} value={nrtEnd} onChange={(e) => setNrtEnd(e.target.value)} />
          </Field>
          <Button onClick={endNrt}>Encerrei a reposição</Button>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <Label>Meus motivos (um por linha)</Label>
        <textarea className={`${inputCls} min-h-24`} value={reasons} onChange={(e) => setReasons(e.target.value)} />
        <Button onClick={saveReasons}>Salvar motivos</Button>
      </Card>

      <Card className="space-y-2">
        <Label>Sobre e limitações</Label>
        <ul className="space-y-1 text-[13px] text-ink-2">
          <li>• Dados só neste aparelho; nada vai para servidor. Sem conta, sem anúncios.</li>
          <li>• Sem notificações em segundo plano (precisariam de servidor). Use o app Atalhos do iOS para abrir o ZERO em horários fixos: URL do app + <code>?open=sos</code>, <code>?open=diario</code> ou <code>?open=backup</code>.</li>
          <li>• Sem IA: as sugestões são regras simples sobre os seus registros, com texto descritivo, nunca causal.</li>
          <li>• O app não diagnostica, não prescreve e não substitui profissional de saúde. Falta de ar intensa, dor no peito ou desmaio: procure atendimento (SAMU 192).</li>
          <li>• Tratamento gratuito no SUS: UBS ou Disque Saúde 136.</li>
        </ul>
      </Card>

      <Card tone="danger" className="space-y-2">
        <Label>Zona perigosa</Label>
        <div className="text-[13px] text-ink-2">Apaga perfil, registros, ajustes e backups locais deste aparelho. Backups exportados não são afetados.</div>
        <Button variant="danger" onClick={wipe}>
          {confirm.isArmed('wipe') ? 'Toque de novo para apagar tudo' : 'Apagar todos os dados'}
        </Button>
      </Card>
    </div>
  );
}
