import type { AppEvent, Profile } from './types';
import { computeTracks, MS_DAY } from './tracks';

export interface AchievementDef {
  id: string;
  title: string;
  body: string;
  kind: 'tempo' | 'comportamento';
}

const H = 3_600_000;

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 't24h', title: '24 horas', body: 'Um dia inteiro sem tabaco ou vape.', kind: 'tempo' },
  { id: 't3d', title: '3 dias', body: 'O pico da abstinência física costuma ser agora. Você passou por ele.', kind: 'tempo' },
  { id: 't7d', title: '1 semana', body: 'Sete dias. A maioria das recaídas acontece antes disso.', kind: 'tempo' },
  { id: 't14d', title: '2 semanas', body: 'Duas semanas. O corpo já respira diferente.', kind: 'tempo' },
  { id: 't30d', title: '30 dias', body: 'Um mês. Isso é um hábito novo tomando forma.', kind: 'tempo' },
  { id: 't60d', title: '60 dias', body: 'Dois meses. Poucas pessoas chegam aqui na primeira tentativa.', kind: 'tempo' },
  { id: 't90d', title: '90 dias', body: 'O programa inteiro. Daqui em diante é manutenção.', kind: 'tempo' },
  { id: 't180d', title: '6 meses', body: 'Meio ano sem.', kind: 'tempo' },
  { id: 't1y', title: '1 ano', body: 'Um ano. O risco cardíaco já caiu de forma mensurável.', kind: 'tempo' },
  { id: 't2y', title: '2 anos', body: 'Dois anos.', kind: 'tempo' },
  { id: 'nic30', title: '30 dias sem nicotina', body: 'Um mês sem nicotina de nenhuma origem.', kind: 'tempo' },
  { id: 'c1', title: 'Primeira vontade superada', body: 'Você sentiu, ficou com ela e ela passou.', kind: 'comportamento' },
  { id: 'c10', title: '10 vontades superadas', body: 'Dez vezes. Já dá para ver um padrão nos seus registros.', kind: 'comportamento' },
  { id: 'c50', title: '50 vontades superadas', body: 'Cinquenta. A vontade virou algo que você sabe atravessar.', kind: 'comportamento' },
  { id: 'd7', title: '7 diários seguidos', body: 'Uma semana registrando como você está.', kind: 'comportamento' },
  { id: 'b1', title: 'Primeiro backup externo', body: 'Seus dados estão protegidos fora deste aparelho.', kind: 'comportamento' },
  { id: 's1', title: 'Lapso registrado com lição', body: 'Você anotou o que pode ser diferente. Isso vale mais que fingir que não aconteceu.', kind: 'comportamento' },
];

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);

function diaryStreakDays(events: AppEvent[], tz: string, now: number): number {
  const days = new Set<string>();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (const e of events) if (e.type === 'diary') days.add(fmt.format(new Date(e.at)));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const key = fmt.format(new Date(now - i * MS_DAY));
    if (days.has(key)) streak++;
    else if (i === 0) continue; // hoje ainda pode registrar
    else break;
  }
  return streak;
}

/** Quais conquistas estão cumpridas agora (independe do que já foi gravado). */
export function earnedAchievements(profile: Profile, events: AppEvent[], now: number): string[] {
  const t = computeTracks(profile, events, now);
  const best = Math.max(t.tobaccoOrVape.bestMs, 0);
  const out: string[] = [];
  const time: [string, number][] = [['t24h', 24 * H], ['t3d', 3 * MS_DAY], ['t7d', 7 * MS_DAY], ['t14d', 14 * MS_DAY], ['t30d', 30 * MS_DAY], ['t60d', 60 * MS_DAY], ['t90d', 90 * MS_DAY], ['t180d', 182 * MS_DAY], ['t1y', 365 * MS_DAY], ['t2y', 730 * MS_DAY]];
  for (const [id, ms] of time) if (best >= ms) out.push(id);
  if (t.nicotine.bestMs >= 30 * MS_DAY) out.push('nic30');
  const resisted = events.filter((e) => e.type === 'craving' && e.outcome === 'resisted' && e.at <= now).length;
  if (resisted >= 1) out.push('c1');
  if (resisted >= 10) out.push('c10');
  if (resisted >= 50) out.push('c50');
  if (diaryStreakDays(events, profile.tz, now) >= 7) out.push('d7');
  if (events.some((e) => e.type === 'backup_made')) out.push('b1');
  if (events.some((e) => e.type === 'slip' && e.lesson.trim().length > 0)) out.push('s1');
  return out;
}

/** Conquistas novas = cumpridas − já gravadas. Idempotente. */
export function newAchievements(profile: Profile, events: AppEvent[], now: number): string[] {
  const recorded = new Set(events.filter((e) => e.type === 'achievement_unlocked').map((e) => (e.type === 'achievement_unlocked' ? e.achievementId : '')));
  return earnedAchievements(profile, events, now).filter((id) => !recorded.has(id));
}
