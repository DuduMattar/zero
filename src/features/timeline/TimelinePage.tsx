import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/hooks/useData';
import { humanDuration } from '../../domain/format';
import { EVIDENCE_LABEL, sortedTimeline, timelinePosition } from '../../domain/timeline';
import { Card, Label } from '../../ui';

export function TimelinePage() {
  const data = useData(60_000);
  const nav = useNavigate();
  if (!data) return null;
  const { profile, tracks } = data;
  const main = tracks.tobaccoOrVape;
  const pos = timelinePosition(main.currentMs);
  const list = sortedTimeline();
  const vapeOnly = profile.products.includes('vape') && !profile.products.some((p) => p === 'cigarette' || p === 'rolled' || p === 'cigar' || p === 'heated');

  return (
    <div className="space-y-6">
      <button type="button" className="text-[0.9rem] font-semibold text-ink-3" onClick={() => nav(-1)}>‹ Voltar</button>
      <header>
        <h1 className="text-[1.75rem] font-bold leading-tight">Linha do tempo da recuperação</h1>
        <p className="mt-1 text-ink-2">Marcos médios de estudos populacionais, com fonte. O ritmo varia com tempo e intensidade de uso e com a saúde de cada um. Não é previsão individual.</p>
      </header>
      {vapeOnly ? (
        <Card tone="warn" className="p-5 text-[0.9rem] text-ink-2">
          Esses prazos vêm de pesquisas com fumantes de cigarro. Para quem usava só vape/pod, a evidência sobre o tempo de recuperação ainda é limitada; a dependência de nicotina é a mesma.
        </Card>
      ) : null}
      {!list.length ? <Card className="p-6 text-ink-3">Conteúdo em preparação: os marcos entram com fonte verificada.</Card> : null}
      <ol className="relative space-y-3 pl-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {list.map((e) => {
          const reached = pos.reached.includes(e);
          const isCurrent = pos.current?.id === e.id;
          const remaining = e.whenHours * 3_600_000 - main.currentMs;
          return (
            <li key={e.id} className="relative">
              <span className={`absolute -left-6 top-5 h-5 w-5 rounded-full border-2 ${reached ? 'border-accent bg-accent' : 'border-line bg-bg'}`} aria-hidden />
              <Card className={`p-5 ${isCurrent ? 'border-accent/50' : ''} ${reached ? '' : 'opacity-75'}`}>
                <div className="flex items-center justify-between gap-2">
                  <Label>{e.whenLabel}</Label>
                  <span className="text-[0.7rem] text-ink-3">{reached ? '✓ alcançado' : main.currentStartAt ? `em ${humanDuration(remaining)}` : ''}</span>
                </div>
                <div className="mt-1 text-[1.05rem] font-semibold leading-snug">{e.title}</div>
                <p className="mt-1 text-[0.95rem] text-ink-2">{e.body}</p>
                {e.variability ? <p className="mt-1 text-[0.8rem] text-ink-3">{e.variability}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-3">
                  <span className={e.evidence === 'forte' ? 'text-accent' : e.evidence === 'limitada' ? 'text-warn' : ''}>{EVIDENCE_LABEL[e.evidence]}</span>
                  <span>{e.appliesTo === 'cigarette' ? 'cigarro' : e.appliesTo === 'vape' ? 'vape' : 'cigarro e vape'}</span>
                  <a href={e.sourceUrl} target="_blank" rel="noopener" className="underline underline-offset-2">{e.sourceLabel}</a>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
