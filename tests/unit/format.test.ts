import { describe, expect, it } from 'vitest';
import { epochToLocalInput, humanDuration, localInputToEpoch } from '../../src/domain/format';
import { nextMilestone } from '../../src/domain/milestones';
import { DAY, H } from './fixtures';

describe('format', () => {
  it('humanDuration sem segundos', () => {
    expect(humanDuration(5 * 60_000)).toBe('5 min');
    expect(humanDuration(2 * H + 10 * 60_000)).toBe('2 h 10 min');
    expect(humanDuration(DAY + 4 * H)).toBe('1 dia e 4 h');
    expect(humanDuration(9 * DAY)).toBe('9 dias');
  });

  it('datetime-local ↔ epoch em America/Sao_Paulo (UTC-3)', () => {
    const e = localInputToEpoch('2026-10-01T12:00', 'America/Sao_Paulo');
    expect(e).toBe(Date.UTC(2026, 9, 1, 15, 0));
    expect(epochToLocalInput(e, 'America/Sao_Paulo')).toBe('2026-10-01T12:00');
  });
});

describe('nextMilestone', () => {
  it('aponta o próximo marco e o progresso', () => {
    const n = nextMilestone(2 * DAY + 12 * H, 0)!;
    expect(n.milestone.id).toBe('d3');
    expect(n.remainingMs).toBe(12 * H);
    expect(n.progress01).toBeCloseTo(0.5);
  });
  it('null sem episódio aberto', () => {
    expect(nextMilestone(0, null)).toBeNull();
  });
});
