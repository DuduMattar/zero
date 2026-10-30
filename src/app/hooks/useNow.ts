import { useEffect, useState } from 'react';

/** Relógio compartilhado. Recalcula a cada `everyMs`; os valores são derivados dos timestamps persistidos, não de um contador em memória. */
export function useNow(everyMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, everyMs);
    const onVis = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [everyMs]);
  return now;
}

export const isStandalone = (): boolean =>
  (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) || (navigator as unknown as { standalone?: boolean }).standalone === true;

export const isIOS = (): boolean => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
