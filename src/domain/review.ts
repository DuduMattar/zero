import type { AppEvent } from './types';
import { MS_DAY } from './tracks';
import { cravingDrop, strategyEffectiveness } from './craving';
import { topTriggers } from './stats';

export interface WeekStats {
  cravings: number;
  resisted: number;
  avgIntensity: number | null;
  avgDrop: number | null;
  mood: number | null;
  sleep: number | null;
  diaries: number;
  slips: number;
  activities: number;
}

export interface WeeklyReview {
  from: number;
  to: number;
  thisWeek: WeekStats;
  lastWeek: WeekStats;
  topTrigger: string | null;
  bestStrategy: string | null;
  /** frases descritivas, nunca causais */
  lines: string[];
}

function statsIn(events: AppEvent[], from: number, to: number): WeekStats {
  const inRange = events.filter((e) => e.at >= from && e.at < to);
  const cr = inRange.filter((e): e is Extract<AppEvent, { type: 'craving' }> => e.type === 'craving');
  const di = inRange.filter((e): e is Extract<AppEvent, { type: 'diary' }> => e.type === 'diary');
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const firsts = cr.map((e) => e.intensityBefore ?? e.ratings[0]?.intensity ?? e.intensityAfter).filter((x): x is number => x != null);
  const drops = cr.map(cravingDrop).filter((d): d is number => d != null);
  return {
    cravings: cr.length,
    resisted: cr.filter((e) => e.outcome === 'resisted').length,
    avgIntensity: avg(firsts),
    avgDrop: avg(drops),
    mood: avg(di.map((d) => d.mood)),
    sleep: avg(di.map((d) => d.sleep)),
    diaries: di.length,
    slips: inRange.filter((e) => e.type === 'slip').length,
    activities: inRange.filter((e) => e.type === 'activity_done').length,
  };
}

/** Revisão dos últimos 7 dias comparados aos 7 anteriores. Texto descritivo. */
export function weeklyReview(events: AppEvent[], now: number): WeeklyReview {
  const to = now;
  const from = now - 7 * MS_DAY;
  const thisWeek = statsIn(events, from, to);
  const lastWeek = statsIn(events, from - 7 * MS_DAY, from);
  const weekEvents = events.filter((e) => e.at >= from && e.at < to);
  const trig = topTriggers(weekEvents)[0]?.trigger ?? null;
  const best = strategyEffectiveness(weekEvents).find((s) => s.avgDrop != null && s.n >= 3)?.strategy ?? null;
  const lines: string[] = [];
  const fmt1 = (n: number) => n.toFixed(1);

  if (thisWeek.cravings === 0 && lastWeek.cravings === 0) lines.push('Nenhuma vontade registrada nas duas últimas semanas.');
  else if (thisWeek.cravings < lastWeek.cravings) lines.push(`Menos vontades registradas: ${thisWeek.cravings} contra ${lastWeek.cravings} na semana anterior.`);
  else if (thisWeek.cravings > lastWeek.cravings) lines.push(`Mais vontades registradas: ${thisWeek.cravings} contra ${lastWeek.cravings} na semana anterior. Registrar mais também conta.`);
  else lines.push(`${thisWeek.cravings} vontades registradas, igual à semana anterior.`);

  if (thisWeek.cravings) lines.push(`${thisWeek.resisted} de ${thisWeek.cravings} passaram sem consumo.`);
  if (thisWeek.avgIntensity != null && lastWeek.avgIntensity != null) {
    const d = thisWeek.avgIntensity - lastWeek.avgIntensity;
    if (Math.abs(d) >= 0.5) lines.push(`Intensidade média ${d < 0 ? 'menor' : 'maior'}: ${fmt1(thisWeek.avgIntensity)} contra ${fmt1(lastWeek.avgIntensity)}.`);
  }
  if (thisWeek.mood != null && lastWeek.mood != null && Math.abs(thisWeek.mood - lastWeek.mood) >= 0.5) lines.push(`Humor médio ${thisWeek.mood > lastWeek.mood ? 'subiu' : 'caiu'}: ${fmt1(thisWeek.mood)} contra ${fmt1(lastWeek.mood)}.`);
  if (thisWeek.sleep != null && lastWeek.sleep != null && Math.abs(thisWeek.sleep - lastWeek.sleep) >= 0.5) lines.push(`Sono médio ${thisWeek.sleep > lastWeek.sleep ? 'melhor' : 'pior'}: ${fmt1(thisWeek.sleep)} contra ${fmt1(lastWeek.sleep)}.`);
  if (thisWeek.slips) lines.push(`${thisWeek.slips} ${thisWeek.slips === 1 ? 'lapso registrado' : 'lapsos registrados'}. Vale olhar o gatilho de cada um.`);
  if (thisWeek.diaries < 3) lines.push(`Diário em ${thisWeek.diaries} ${thisWeek.diaries === 1 ? 'dia' : 'dias'}. Com 3 ou mais por semana, os gráficos começam a dizer algo.`);
  if (trig) lines.push(`Gatilho mais frequente na semana: ${trig}.`);
  if (best) lines.push(`Estratégia com maior queda média na semana: ${best} (descritivo, amostra pequena).`);

  return { from, to, thisWeek, lastWeek, topTrigger: trig, bestStrategy: best, lines };
}

/** Chave da semana (segunda-feira) no fuso, para marcar "revisão vista". */
export function weekKey(now: number, tz: string): string {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(new Date(now)).map((x) => [x.type, x.value]));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const monday = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)) - ((dow + 6) % 7) * MS_DAY;
  return new Date(monday).toISOString().slice(0, 10);
}

export function isSunday(now: number, tz: string): boolean {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date(now)) === 'Sun';
}
