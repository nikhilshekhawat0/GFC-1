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

  if (isAuthScreen) {
    return (
      <div className="min-h-screen w-screen bg-[#EEEEF2] dark:bg-[#0B0C0F] text-[#111317] dark:text-[#F4F4F6]">
        {panelContent}
        <Toasts />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F3F4F6] dark:bg-[#0B0C0F] text-[#111317] dark:text-[#F4F4F6]">
      <TopBar />

      <main className="relative flex-1 min-h-0 flex overflow-hidden bg-[#F3F4F6] dark:bg-[#0B0C0F]">
        {/* Docked Left Navigation & Filters Rail */}
        <LeftCommandRail />

        {/* Center Workspace: Either Map (+ Docked Bottom Timeline) OR Active Form / Command View */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-[#FAFAFB] dark:bg-[#121418]">
          <div className={panelContent ? 'hidden' : 'flex-1 min-w-0 min-h-0 flex flex-col'}>
            <GeospatialMap />
          </div>

          {panelContent && (
            <section className="relative flex-1 min-h-0 overflow-y-auto p-5 sm:p-8 bg-[#FAFAFB] dark:bg-[#121418]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-72 studio-iridescent-glow"
              />
              <div className="relative z-10 max-w-5xl mx-auto">{panelContent}</div>
            </section>
          )}
        </div>

        {/* Docked Right Panel: Citizen Summary (when no pin selected) OR Selected Hotspot Dossier */}
        {!panelContent && <CitizenOverviewCard />}
        {!panelContent && <HotspotDossier />}

        <Toasts />
      </main>
    </div>
  );
}

export default App;
