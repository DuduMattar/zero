import { useEffect } from 'react';
import { HashRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useProfile, useSettings } from '../data/queries';
import { Providers } from './providers';
import { Onboarding } from '../features/onboarding/Onboarding';
import { Dashboard } from '../features/dashboard/Dashboard';
import { Sos } from '../features/sos/Sos';
import { SlipPage } from '../features/slips/SlipPage';
import { Diary } from '../features/diary/Diary';
import { History } from '../features/history/History';
import { SettingsPage } from '../features/settings/SettingsPage';
import { BackupPage } from '../features/settings/BackupPage';
import { InstallPage } from '../features/settings/InstallPage';

const DEEP_LINKS: Record<string, string> = { sos: '/sos', diary: '/diario', diario: '/diario', backup: '/ajustes/backup', lapso: '/lapso', slip: '/lapso', history: '/historico', historico: '/historico' };

function DeepLink() {
  const nav = useNavigate();
  useEffect(() => {
    const open = new URLSearchParams(window.location.search).get('open');
    if (open && DEEP_LINKS[open]) {
      history.replaceState(null, '', window.location.pathname + window.location.hash);
      nav(DEEP_LINKS[open], { replace: true });
    }
  }, [nav]);
  return null;
}

function Tab({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-ink-3'}`}>
      <span aria-hidden className="text-[20px] leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

function Shell() {
  const loc = useLocation();
  const hideTabs = loc.pathname.startsWith('/sos') || loc.pathname.startsWith('/onboarding');
  return (
    <div className="safe-top mx-auto min-h-dvh w-full max-w-lg">
      <main className={`px-4 pt-3 ${hideTabs ? 'pb-6' : 'pb-[calc(84px+env(safe-area-inset-bottom))]'}`}>
        <Outlet />
      </main>
      {!hideTabs ? (
        <nav aria-label="Seções" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-1.5 pb-1.5">
            <Tab to="/" label="Agora" icon="◎" />
            <Tab to="/diario" label="Diário" icon="▤" />
            <Tab to="/historico" label="Histórico" icon="≡" />
            <Tab to="/ajustes" label="Ajustes" icon="⚙" />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function Gate() {
  const profile = useProfile();
  const settings = useSettings();
  if (profile === undefined || settings === undefined) return <div className="p-8 text-center text-ink-3">Carregando…</div>;
  if (!profile || !settings.onboardingDone) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <HashRouter>
      <Providers>
        <DeepLink />
        <Routes>
          <Route path="/onboarding/*" element={<Onboarding />} />
          <Route element={<Gate />}>
            <Route element={<Shell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sos" element={<Sos />} />
              <Route path="/lapso" element={<SlipPage />} />
              <Route path="/diario" element={<Diary />} />
              <Route path="/historico" element={<History />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="/ajustes/backup" element={<BackupPage />} />
              <Route path="/ajustes/instalar" element={<InstallPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Providers>
    </HashRouter>
  );
}
