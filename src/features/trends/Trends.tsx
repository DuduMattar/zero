import { useState } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../../app/hooks/useData';
import { ACHIEVEMENTS } from '../../domain/achievements';
import { strategyEffectiveness } from '../../domain/craving';
import { formatMoney } from '../../domain/format';
import { projectSavings } from '../../domain/money';
import { avgDropOverall, cravingsByHour, dailySeries, topTriggers } from '../../domain/stats';
import { MIN_CRAVINGS_FOR_STRATEGY } from '../../domain/thresholds';
import { strategyById, triggerLabel } from '../../content/strategies';
import { Card, Label, Segmented } from '../../ui';
import { Goals } from './Goals';
import { ReviewCard } from './ReviewCard';

type Range = 7 | 30 | 90;

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export function Trends() {
  const data = useData(60_000);
  const [range, setRange] = useState<Range>(7);
  if (!data) return null;
  const { profile, events, now, money, tracks } = data;
  const series = dailySeries(events, profile.tz, now, range);
  const totalCr = series.reduce((a, p) => a + p.cravings, 0);
  const hasDiary = series.some((p) => p.mood != null);
  const hours = cravingsByHour(events, profile.tz);
  const triggers = topTriggers(events).slice(0, 5);
  const strategies = strategyEffectiveness(events);
  const drop = avgDropOverall(events);
  const unlocked = new Set(events.filter((e) => e.type === 'achievement_unlocked').map((e) => (e.type === 'achievement_unlocked' ? e.achievementId : '')));
  const accent = css('--c-accent') || '#2fd38a';
  const calm = css('--c-calm') || '#6ea3ff';
  const ink3 = css('--c-ink-3') || '#888';
  const tick = { fill: ink3, fontSize: 11 };
  const tip = { contentStyle: { background: css('--c-card'), border: `1px solid ${css('--c-line')}`, borderRadius: 12, fontSize: 12 }, labelStyle: { color: ink3 } };

  return (
    <div className="stagger space-y-6">
      <header>
        <h1 className="text-[1.75rem] font-bold leading-tight">Tendências</h1>
        <div className="text-[0.85rem] text-ink-3">Descritivo, a partir dos seus registros. Nunca uma afirmação de causa.</div>
      </header>
      <Segmented ariaLabel="Período" value={String(range) as '7' | '30' | '90'} onChange={(v) => setRange(Number(v) as Range)} options={[{ value: '7', label: '7 dias' }, { value: '30', label: '30 dias' }, { value: '90', label: '90 dias' }]} />

      <Card className="p-6">
        <div className="flex items-end justify-between">
          <div>
            <Label>Vontades</Label>
            <div className="tabular text-[2rem] font-bold leading-none">{totalCr}</div>
          </div>
          <div className="text-right text-[0.85rem] text-ink-2">
            {series.reduce((a, p) => a + p.resisted, 0)} superadas
            {drop.avg != null ? <><br />queda média {drop.avg.toFixed(1)} pts ({drop.n} medidas)</> : null}
          </div>
        </div>
        {totalCr ? (
          <div className="mt-4 h-36" role="img" aria-label="Vontades por dia">
            <ResponsiveContainer>
              <BarChart data={series} margin={{ left: -24, right: 0, top: 4, bottom: 0 }}>
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval={range === 7 ? 0 : 'preserveStartEnd'} />
                <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v, n) => [String(v ?? 0), String(n) === 'cravings' ? 'vontades' : 'superadas']} />
                <Bar dataKey="cravings" fill={accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-[0.9rem] text-ink-3">Nenhuma vontade registrada no período. Quando bater, use o SOS: cada registro alimenta este gráfico.</p>
        )}
      </Card>

      <Card className="p-6">
        <Label>Humor e sono</Label>
        {hasDiary ? (
          <div className="mt-3 h-36" role="img" aria-label="Humor e sono por dia">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval={range === 7 ? 0 : 'preserveStartEnd'} />
                <YAxis domain={[1, 5]} ticks={[1, 3, 5]} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v, n) => [Number(v ?? 0).toFixed(1), String(n) === 'mood' ? 'humor' : 'sono']} />
                <Line type="monotone" dataKey="mood" stroke={accent} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="sleep" stroke={calm} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-1 flex gap-4 text-[0.75rem] text-ink-3"><span><span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} /> humor</span><span><span className="inline-block h-2 w-2 rounded-full" style={{ background: calm }} /> sono</span></div>
          </div>
        ) : (
          <p className="mt-2 text-[0.9rem] text-ink-3">Sem diário no período. Um toque em "Como foi hoje?" no Agora já cria o primeiro ponto.</p>
        )}
      </Card>

      <Card className="p-6">
        <Label>Dinheiro</Label>
        <div className="mt-1 flex items-end justify-between">
          <div className="tabular sensitive text-[2rem] font-bold leading-none">{formatMoney(money.saved, profile.currency)}</div>
          <div className="text-right text-[0.85rem] text-ink-2">{formatMoney(money.perDay, profile.currency)}/dia</div>
        </div>
        {money.perDay > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[['1 ano', 365], ['2 anos', 730], ['5 anos', 1826]].map(([l, d]) => (
              <div key={l} className="rounded-2xl bg-card-2 p-3">
                <div className="text-[0.7rem] text-ink-3">{l}</div>
                <div className="tabular text-[0.95rem] font-semibold">{formatMoney(projectSavings(money.perDay, Number(d)), profile.currency)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[0.9rem] text-ink-3">Sem preço informado. Defina em Ajustes → Consumo e preço para ver a projeção.</p>
        )}
        <div className="mt-3 text-[0.75rem] text-ink-3">Se continuar sem fumar, a projeção usa o consumo e o preço atuais.</div>
      </Card>

      <Goals saved={money.saved} currency={profile.currency} />

      <ReviewCard events={events} now={now} />

      <Card className="p-6">
        <Label>Estratégias</Label>
        {strategies.length ? (
          <ul className="mt-2 divide-y divide-line">
            {strategies.map((s) => (
              <li key={s.strategy} className="flex items-center justify-between py-2.5 text-[0.95rem]">
                <span>{strategyById(s.strategy).label} <span className="text-ink-3">· {s.n}×</span></span>
                <span className={`tabular font-semibold ${s.sufficient ? 'text-accent' : 'text-ink-3'}`}>{s.avgDrop != null ? `−${s.avgDrop.toFixed(1)}` : '—'}{!s.sufficient ? ' ·' : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[0.9rem] text-ink-3">Ainda sem registros de SOS.</p>
        )}
        <div className="mt-2 text-[0.75rem] text-ink-3">Queda média de intensidade (0–10) associada a cada estratégia nos seus registros. Marcamos como "suficiente" só com {MIN_CRAVINGS_FOR_STRATEGY} ou mais medidas (· = poucas). É descritivo e exploratório: não prova que a estratégia causou a queda.</div>
      </Card>

      <Card className="p-6">
        <Label>Gatilhos e horários</Label>
        {triggers.length ? (
          <ul className="mt-2 space-y-2">
            {triggers.map((t) => (
              <li key={t.trigger}>
                <div className="flex justify-between text-[0.9rem]"><span>{triggerLabel(t.trigger)}</span><span className="tabular text-ink-3">{t.n}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-bg-2"><div className="h-full rounded-full bg-accent" style={{ width: `${(t.n / triggers[0].n) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[0.9rem] text-ink-3">Marque o gatilho ao sair do SOS para ver padrões aqui.</p>
        )}
        <div className="mt-4 text-[0.9rem] text-ink-2">
          {hours.sufficient ? (
            <>Nos seus registros, a hora com mais vontades é <b className="text-ink">{String(hours.peak).padStart(2, '0')}h</b>.</>
          ) : (
            <span className="text-ink-3">Padrão por hora aparece com 15 ou mais vontades registradas ({hours.total} até agora).</span>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <Label>Conquistas</Label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id);
            return (
              <div key={a.id} className={`rounded-2xl p-3 ${on ? 'bg-accent/15 border border-accent/40' : 'bg-card-2 opacity-60'}`}>
                <div className={`text-[0.9rem] font-semibold ${on ? 'text-ink' : 'text-ink-3'}`}>{on ? '✓ ' : ''}{a.title}</div>
                <div className="text-[0.7rem] text-ink-3">{a.kind === 'tempo' ? 'tempo' : 'comportamento'}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[0.75rem] text-ink-3">Recorde atual: {Math.floor(tracks.tobaccoOrVape.bestMs / 86_400_000)} dias.</div>
      </Card>
    </div>
  );
}
