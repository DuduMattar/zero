/** ID único, ordenável no tempo (timestamp + aleatório). */
export function newId(now: number, random: () => number = Math.random): string {
  const t = now.toString(36).padStart(9, '0');
  let r = '';
  for (let i = 0; i < 10; i++) r += Math.floor(random() * 36).toString(36);
  return `${t}${r}`;
}
