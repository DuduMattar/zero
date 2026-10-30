import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useProfile, useSettings } from '../data/queries';
import { Providers } from './providers';
import { Onboarding } from '../features/onboarding/Onboarding';
import { Dashboard } from '../features/dashboard/Dashboard';
const Trends = lazy(() => import('../features/trends/Trends').then((m) => ({ default: m.Trends })));
import { Sos } from '../features/sos/Sos';
import { SlipPage } from '../features/slips/SlipPage';
import { Diary } from '../features/diary/Diary';
import { History } from '../features/history/History';
import { TimelinePage } from '../features/timeline/TimelinePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { BackupPage } from '../features/settings/BackupPage';
import { InstallPage } from '../features/settings/InstallPage';
import { ProfilePage } from '../features/settings/ProfilePage';
import { AchievementWatcher } from './AchievementWatcher';

const DEEP_LINKS: Record<string, string> = { sos: '/sos', diary: '/diario', diario: '/diario', backup: '/ajustes/backup', lapso: '/lapso', slip: '/lapso', history: '/historico', historico: '/historico', tendencias: '/tendencias', today: '/', hoje: '/' };

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
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-semibold ${isActive ? 'text-accent' : 'text-ink-3'}`}>
      <span aria-hidden className="text-[1.35rem] leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

function Shell() {
  const loc = useLocation();
  const hideTabs = loc.pathname.startsWith('/sos');
  return (
    <div className="safe-top mx-auto min-h-dvh w-full max-w-lg">
      <main className={`px-5 pt-4 ${hideTabs ? 'pb-6' : 'pb-[calc(96px+env(safe-area-inset-bottom))]'}`}>
        <Outlet />
      </main>
      <AchievementWatcher />
      {!hideTabs ? (
        <nav aria-label="Seções" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-1 px-4 pt-1.5 pb-1.5">
            <Tab to="/" label="Agora" icon="◎" />
            <Tab to="/tendencias" label="Tendências" icon="∿" />
            <Tab to="/historico" label="Histórico" icon="≡" />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function Gate() {
  const profile = useProfile();
  const settings = useSettings();
  if (profile === undefined || settings === undefined)
    return (
      <div className="mx-auto max-w-lg space-y-4 px-5 pt-10">
        <div className="skeleton h-16" />
        <div className="skeleton h-40" />
        <div className="skeleton h-24" />
      </div>
    );
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
              <Route path="/tendencias" element={<Suspense fallback={<div className="space-y-4"><div className="skeleton h-12" /><div className="skeleton h-48" /><div className="skeleton h-48" /></div>}><Trends /></Suspense>} />
              <Route path="/historico" element={<History />} />
              <Route path="/linha-do-tempo" element={<TimelinePage />} />
              <Route path="/sos" element={<Sos />} />
              <Route path="/lapso" element={<SlipPage />} />
              <Route path="/diario" element={<Diary />} />
              <Route path="/ajustes" element={<SettingsPage />} />
              <Route path="/ajustes/backup" element={<BackupPage />} />
              <Route path="/ajustes/instalar" element={<InstallPage />} />
              <Route path="/ajustes/perfil" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Providers>
    </HashRouter>
  );
}
