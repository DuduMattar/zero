import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { addEvent, stamp } from '../../data/repos';
import { formatDate } from '../../domain/format';
import { MS_DAY } from '../../domain/tracks';
import { SYMPTOMS } from '../../content/strategies';
import { Button, Card, Chip, Field, Label, Scale, inputCls, useToast } from '../../ui';

const SCALES: { key: 'mood' | 'anxiety' | 'irritability' | 'energy' | 'sleep' | 'focus'; label: string; low: string; high: string }[] = [
  { key: 'mood', label: 'Humor', low: 'péssimo', high: 'ótimo' },
  { key: 'anxiety', label: 'Ansiedade', low: 'nenhuma', high: 'muita' },
  { key: 'irritability', label: 'Irritabilidade', low: 'nenhuma', high: 'muita' },
  { key: 'energy', label: 'Energia', low: 'zerado', high: 'cheio' },
  { key: 'sleep', label: 'Sono (noite passada)', low: 'péssimo', high: 'ótimo' },
  { key: 'focus', label: 'Concentração', low: 'péssima', high: 'ótima' },
];

export function Diary() {
  const data = useData(60_000);
  const nav = useNavigate();
  const toast = useToast();
  const [v, setV] = useState<Record<string, number | null>>({ mood: null, anxiety: null, irritability: null, energy: null, sleep: null, focus: null, craving: null });
  const [activity, setActivity] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  if (!data) return null;
  const { profile, events, now } = data;
  const entries = events.filter((e) => e.type === 'diary').sort((a, b) => b.at - a.at);
  const todayKey = formatDate(now, profile.tz);
  const today = entries.find((e) => formatDate(e.at, profile.tz) === todayKey);

  async function save() {
    setSaving(true);
    try {
      await addEvent({
        ...stamp(Date.now(), profile.tz),
        type: 'diary',
        at: Date.now(),
        mood: v.mood ?? 3,
        anxiety: v.anxiety ?? 3,
        irritability: v.irritability ?? 3,
        energy: v.energy ?? 3,
        sleep: v.sleep ?? 3,
        focus: v.focus ?? 3,
        craving: v.craving ?? 0,
        activity,
        symptoms,
        text: text.trim(),
      });
      toast('Diário salvo.');
      nav('/');
    } catch (e) {
      console.error(e);
      toast('Não consegui salvar.', 'err');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl font-bold">Diário</h1>
      {today ? (
        <Card tone="accent" className="text-[13px] text-ink-2">
          Você já registrou hoje (humor {today.type === 'diary' ? today.mood : ''}/5). Pode registrar de novo se o dia mudou.
        </Card>
      ) : null}
      <p className="text-[13px] text-ink-2">Toque nas escalas. O que não responder fica no meio (3). Leva menos de um minuto.</p>
      {SCALES.map((s) => (
        <div key={s.key}>
          <Label className="mb-1.5">{s.label}</Label>
          <Scale ariaLabel={s.label} min={1} max={5} value={v[s.key]} onChange={(n) => setV((x) => ({ ...x, [s.key]: n }))} labels={[s.low, s.high]} />
        </div>
      ))}
      <div>
        <Label className="mb-1.5">Vontade de fumar hoje</Label>
        <Scale ariaLabel="Vontade de fumar" min={0} max={10} value={v.craving} onChange={(n) => setV((x) => ({ ...x, craving: n }))} labels={['nenhuma', 'insuportável']} />
      </div>
      <Chip active={activity} onClick={() => setActivity((a) => !a)}>
        {activity ? '✓ ' : ''}Fiz atividade física hoje
      </Chip>
      <div>
        <Label className="mb-1.5">Sintomas</Label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <Chip key={s} active={symptoms.includes(s)} onClick={() => setSymptoms((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]))}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
      <Field label="Observações (opcional)">
        <textarea className={`${inputCls} min-h-20`} value={text} onChange={(e) => setText(e.target.value)} data-testid="diary-text" />
      </Field>
      <Button variant="primary" size="lg" full onClick={save} disabled={saving} data-testid="diary-save">
        Salvar diário
      </Button>

      {entries.length ? (
        <Card>
          <Label>Últimos 7 registros</Label>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {entries.slice(0, 7).map((e) =>
              e.type === 'diary' ? (
                <li key={e.id} className="flex justify-between text-ink-2">
                  <span>{formatDate(e.at, profile.tz)}</span>
                  <span className="tabular">humor {e.mood} · sono {e.sleep} · vontade {e.craving}</span>
                </li>
              ) : null,
            )}
          </ul>
          <div className="mt-2 text-[11px] text-ink-3">{entries.filter((e) => e.at >= now - 7 * MS_DAY).length} nos últimos 7 dias</div>
        </Card>
      ) : null}
    </div>
  );
}
