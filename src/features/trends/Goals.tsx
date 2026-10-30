import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { newId } from '../../domain/ids';
import { formatMoney } from '../../domain/format';
import type { Goal } from '../../domain/types';
import { Button, Card, Label, Progress, inputCls, useToast } from '../../ui';

/** Objetivos para o dinheiro economizado. Progresso = economia líquida / valor. */
export function Goals({ saved, currency }: { saved: number; currency: string }) {
  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').toArray(), []) ?? [];
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const active = goals.filter((g) => g.status !== 'archived');

  async function add() {
    const v = Number(amount.replace(',', '.'));
    if (!title.trim() || !(v > 0)) return toast('Dê um nome e um valor.', 'err');
    const g: Goal = { id: newId(Date.now()), title: title.trim(), amount: v, createdAt: Date.now(), status: 'active' };
    await db.goals.add(g);
    setTitle('');
    setAmount('');
    toast('Objetivo criado.');
  }
  async function archive(g: Goal) {
    await db.goals.put({ ...g, status: 'archived' });
  }

  return (
    <Card className="space-y-4 p-6">
      <Label>Objetivos para o dinheiro</Label>
      {active.length ? (
        <ul className="space-y-3">
          {active.map((g) => {
            const p = Math.min(1, saved / g.amount);
            const reached = saved >= g.amount;
            return (
              <li key={g.id}>
                <div className="flex items-center justify-between text-[0.95rem]">
                  <span className="font-semibold">{reached ? '✓ ' : ''}{g.title}</span>
                  <span className="tabular text-ink-2">{formatMoney(Math.min(saved, g.amount), currency)} / {formatMoney(g.amount, currency)}</span>
                </div>
                <div className="mt-1.5"><Progress value01={p} tone={reached ? 'accent' : 'calm'} /></div>
                <div className="mt-1 flex justify-between text-[0.75rem] text-ink-3">
                  <span>{reached ? 'Alcançado com a economia atual.' : `${Math.round(p * 100)}%`}</span>
                  <button type="button" className="underline" onClick={() => archive(g)}>arquivar</button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-ink-3">Dê um destino ao que ficou no bolso: viagem, tênis, curso. Progresso calculado pela economia líquida (lapsos descontam).</p>
      )}
      <div className="grid grid-cols-[1fr_110px] gap-2">
        <input className={inputCls} placeholder="ex.: Viagem para Floripa" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="goal-title" />
        <input className={inputCls} inputMode="decimal" placeholder="R$" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="goal-amount" />
      </div>
      <Button onClick={add} data-testid="goal-add">Criar objetivo</Button>
    </Card>
  );
}
