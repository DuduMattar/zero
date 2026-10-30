import { describe, expect, it } from 'vitest';
import { money } from '../../src/domain/money';
import { DAY, T0, events, priceChange, profile, slip } from './fixtures';

describe('money', () => {
  it('taxa constante: 10 unidades/dia a R$1 por 3 dias = R$30', () => {
    const m = money(profile(), [], T0 + 3 * DAY);
    expect(m.saved).toBeCloseTo(30, 6);
    expect(m.unitsNotConsumed).toBeCloseTo(30, 6);
    expect(m.perDay).toBe(10);
  });

  it('mudança de preço no meio do período e desconto de lapso', () => {
    const ev = events(priceChange(T0 + 2 * DAY, 10, 2), slip(T0 + 3 * DAY, 'cigarette', true, 2));
    const m = money(profile(), ev, T0 + 4 * DAY);
    // 2 dias a R$1 (20) + 2 dias a R$2 (40) − 2 cigarros a R$2 (4) = 56
    expect(m.saved).toBeCloseTo(56, 6);
    expect(m.unitsSlipped).toBe(2);
    expect(m.perDay).toBe(20);
  });

  it('nunca fica negativa', () => {
    const m = money(profile(), events(slip(T0 + 1000, 'cigarette', true, 500)), T0 + 2000);
    expect(m.saved).toBe(0);
  });
});
