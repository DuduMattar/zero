// Formatação pt-BR. Funções puras.

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function durationParts(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "3 dias", "1 dia e 4 h", "5 h", "12 min". Sem segundos (decisão de produto). */
export function humanDuration(ms: number): string {
  const p = durationParts(ms);
  if (p.days >= 2) return `${p.days} dias`;
  if (p.days === 1) return p.hours ? `1 dia e ${p.hours} h` : '1 dia';
  if (p.hours >= 1) return p.minutes && p.hours < 6 ? `${p.hours} h ${p.minutes} min` : `${p.hours} h`;
  return `${p.minutes} min`;
}

export function wholeDays(ms: number): number {
  return Math.floor(ms / 86_400_000);
}

export function formatMoney(value: number, currency = 'BRL'): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: value >= 100 ? 0 : 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatDateTime(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
}

export function formatDate(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(ms));
}

export function formatTime(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
}

/** Converte "YYYY-MM-DDTHH:mm" (datetime-local) para epoch ms no fuso dado. */
export function localInputToEpoch(value: string, tz: string): number {
  const [d, t] = value.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = (t ?? '00:00').split(':').map(Number);
  // Aproximação por tentativa: calcula offset do fuso para a data pretendida.
  const guess = Date.UTC(y, m - 1, day, hh, mm);
  const offset = tzOffsetMs(guess, tz);
  const first = guess - offset;
  const offset2 = tzOffsetMs(first, tz);
  return guess - offset2;
}

export function epochToLocalInput(ms: number, tz: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function tzOffsetMs(epoch: number, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(epoch))
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return asUtc - Math.floor(epoch / 1000) * 1000;
}

export const plural = (n: number, s: string, p: string) => (Math.abs(n) === 1 ? s : p);
