import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { saveProfile } from '../../data/repos';
import { PRODUCTS, type ProductId, type Profile } from '../../domain/types';
import { GOAL_PRESETS, REASON_PRESETS, TRIGGERS } from '../../content/strategies';
import { Button, Card, Chip, Field, Label, inputCls, useToast } from '../../ui';

export function ProfilePage() {
  const data = useData(60_000);
  if (!data) return null;
  // O formulário só nasce com os dados carregados: evita que um toque rápido seja sobrescrito.
  return <ProfileForm key={data.profile.updatedAt} profile={data.profile} />;
}

function ProfileForm({ profile }: { profile: Profile }) {
  const nav = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState<ProductId[]>(profile.products);
  const [triggers, setTriggers] = useState<string[]>(profile.triggers);
  const [reasons, setReasons] = useState(profile.reasons.join('\n'));
  const [goals, setGoals] = useState(profile.goals.join('\n'));
  const [years, setYears] = useState(profile.yearsUsing ? String(profile.yearsUsing) : '');
  const [longest, setLongest] = useState(profile.longestQuitDays ? String(profile.longestQuitDays) : '');
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  async function save() {
    if (!products.length) return toast('Marque pelo menos um produto.', 'err');
    await saveProfile({
      ...profile,
      products,
      consumption: products.includes(profile.consumption.product) ? profile.consumption : { ...profile.consumption, product: products[0] },
      triggers,
      reasons: lines(reasons),
      goals: lines(goals),
      yearsUsing: years ? Number(years) : null,
      longestQuitDays: longest ? Number(longest) : null,
      updatedAt: Date.now(),
    });
    toast('Perfil salvo.');
    nav(-1);
  }

  return (
    <div className="space-y-6">
      <button type="button" className="text-[0.9rem] font-semibold text-ink-3" onClick={() => nav(-1)}>‹ Ajustes</button>
      <h1 className="text-[1.75rem] font-bold leading-tight">Perfil</h1>
      <Card className="space-y-3 p-6">
        <Label>Produtos que você usava</Label>
        <div className="flex flex-wrap gap-2">
          {PRODUCTS.filter((p) => p.selectable).map((p) => (
            <Chip key={p.id} active={products.includes(p.id)} onClick={() => setProducts((a) => toggle(a, p.id) as ProductId[])}>{p.label}</Chip>
          ))}
        </div>
        <div className="text-[0.8rem] text-ink-3">Define quais trilhas aparecem. Mudar isso não altera o histórico.</div>
      </Card>
      <Card className="space-y-3 p-6">
        <Label>Gatilhos conhecidos</Label>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.filter((t) => t.id !== 'other').map((t) => (
            <Chip key={t.id} active={triggers.includes(t.id)} onClick={() => setTriggers((a) => toggle(a, t.id))}>{t.label}</Chip>
          ))}
        </div>
      </Card>
      <Card className="space-y-3 p-6">
        <Label>Meus motivos (um por linha)</Label>
        <textarea className={`${inputCls} min-h-28`} value={reasons} onChange={(e) => setReasons(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {REASON_PRESETS.filter((r) => !lines(reasons).includes(r)).map((r) => (
            <Chip key={r} onClick={() => setReasons((s) => (s.trim() ? s + '\n' : '') + r)}>+ {r}</Chip>
          ))}
        </div>
      </Card>
      <Card className="space-y-3 p-6">
        <Label>Metas e plano de emergência (um por linha)</Label>
        <textarea className={`${inputCls} min-h-28`} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder={'ex.: Correr 5 km sem parar\nSe eu fumar um: ligar para o Pedro e sair de casa'} />
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.filter((g) => !lines(goals).includes(g)).map((g) => (
            <Chip key={g} onClick={() => setGoals((s) => (s.trim() ? s + '\n' : '') + g)}>+ {g}</Chip>
          ))}
        </div>
      </Card>
      <Card className="space-y-3 p-6">
        <Label>História</Label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Anos usando nicotina"><input className={inputCls} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} /></Field>
          <Field label="Maior período sem (dias)"><input className={inputCls} inputMode="numeric" value={longest} onChange={(e) => setLongest(e.target.value)} /></Field>
        </div>
      </Card>
      <Button variant="primary" size="lg" full onClick={save}>Salvar perfil</Button>
    </div>
  );
}
