import { registerSW } from 'virtual:pwa-register';

export const BUILD_ID = __BUILD_ID__;

let registration: ServiceWorkerRegistration | undefined;

// Modo autoUpdate: quando um service worker novo assume, a página recarrega sozinha.
// No iOS o app instalado fica suspenso, não fechado, então a checagem só na abertura não basta:
// checamos também sempre que o app volta ao primeiro plano e a cada hora.
export function setupServiceWorker() {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, r) {
      registration = r;
      if (!r) return;
      const check = () => r.update().catch(() => undefined);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      setInterval(check, 60 * 60 * 1000);
    },
  });
}

/** Força uma checagem. Retorna true se há versão nova sendo instalada (a página vai recarregar). */
export async function checkForUpdate(): Promise<boolean | 'unsupported'> {
  const r = registration ?? (await navigator.serviceWorker?.getRegistration());
  if (!r) return 'unsupported';
  await r.update();
  return Boolean(r.installing || r.waiting);
}
