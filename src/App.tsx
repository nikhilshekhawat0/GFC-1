import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { GeospatialMap } from './components/GeospatialMap';
import { LeftCommandRail } from './components/LeftCommandRail';
import { HotspotDossier } from './components/HotspotDossier';
import { CitizenOverviewCard } from './components/CitizenOverviewCard';
import { CitizenLoginView, AuthorityLoginView } from './components/AuthViews';
import { SettingsView } from './components/SettingsView';
import {
  RouteSafetyView,
  AiFloodReportView,
  CitizenAlertsView,
  CitizenCalibrationView,
} from './components/CitizenModules';
import {
  DispatchSlaView,
  SensorHealthView,
  AuditLogView,
  ExecutiveBriefView,
} from './components/CommandModules';
import { Toasts } from './components/Toasts';

function App() {
  const { theme, activeView, authorityUser, fetchLiveWeather, initSupabaseAndRealtime } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    fetchLiveWeather(false);
    initSupabaseAndRealtime();
  }, [fetchLiveWeather, initSupabaseAndRealtime]);

  const isAuthScreen = activeView === 'citizen-login' || activeView === 'authority-login';

  const renderPanelView = () => {
    switch (activeView) {
      case 'citizen-login':
        return <CitizenLoginView />;
      case 'authority-login':
        return <AuthorityLoginView />;
      case 'route':
        return <RouteSafetyView />;
      case 'report':
        return <AiFloodReportView />;
      case 'alerts':
        return <CitizenAlertsView />;
      case 'accuracy':
        return <CitizenCalibrationView />;
      case 'settings':
        return <SettingsView />;
      case 'dispatch':
        return authorityUser ? <DispatchSlaView /> : <AuthorityLoginView />;
      case 'sensors':
        return authorityUser ? <SensorHealthView /> : <AuthorityLoginView />;
      case 'audit':
        return authorityUser ? <AuditLogView /> : <AuthorityLoginView />;
      case 'executive':
        return authorityUser ? <ExecutiveBriefView /> : <AuthorityLoginView />;
      default:
        return null;
    }
  };

  const panelContent = renderPanelView();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100">
      <TopBar />

      <main className="relative flex-1 min-h-0 flex overflow-hidden bg-slate-50 dark:bg-[#070B12]">
        {/* Docked Left Navigation & Filters Rail */}
        {!isAuthScreen && <LeftCommandRail />}

        {/* Center Workspace: Either Map (+ Docked Bottom Timeline) OR Active Form / Command View */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
          <div className={panelContent ? 'hidden' : 'flex-1 min-w-0 min-h-0 flex flex-col'}>
            <GeospatialMap />
          </div>

          {panelContent && (
            <section className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 bg-slate-50 dark:bg-[#070B12]">
              <div className="max-w-5xl mx-auto">{panelContent}</div>
            </section>
          )}
        </div>

        {/* Docked Right Panel: Citizen Summary (when no pin selected) OR Selected Hotspot Dossier */}
        {!isAuthScreen && !panelContent && <CitizenOverviewCard />}
        {!isAuthScreen && !panelContent && <HotspotDossier />}

        <Toasts />
      </main>
    </div>
  );
}

export default App;
