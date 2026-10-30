import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSettings } from '../data/queries';
import { autoSnapshotIfDue, requestPersistentStorage, type PersistStatus } from '../data/repos';
import { ToastProvider } from '../ui';

interface BootCtx {
  persist: PersistStatus | 'pending';
}
const BootContext = createContext<BootCtx>({ persist: 'pending' });
export const useBoot = () => useContext(BootContext);

function applyTheme(theme: 'system' | 'dark' | 'light', reduced: 'system' | 'on') {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', dark);
  root.classList.toggle('motion-off', reduced === 'on');
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute('content', dark ? '#0b0f14' : '#f6f7f9');
}

export function Providers({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const [persist, setPersist] = useState<BootCtx['persist']>('pending');

  useEffect(() => {
    if (!settings) return;
    applyTheme(settings.theme, settings.reducedMotion);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => applyTheme(settings.theme, settings.reducedMotion);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [settings?.theme, settings?.reducedMotion, settings]);

  useEffect(() => {
    // Pede persistência a cada abertura e VERIFICA o resultado. No iOS isso não é garantia.
    requestPersistentStorage().then(setPersist);
    autoSnapshotIfDue(Date.now()).catch(console.error);
  }, []);

  const ctx = useMemo(() => ({ persist }), [persist]);
  return (
    <BootContext.Provider value={ctx}>
      <ToastProvider>{children}</ToastProvider>
    </BootContext.Provider>
  );
}
