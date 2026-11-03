import { useStore } from './store/useStore';
import { NavigationShell } from './components/NavigationShell';
import { RiskMap } from './components/RiskMap';
import { ActionList } from './components/ActionList';
import { SensorHealth } from './components/SensorHealth';
import { AuditLog } from './components/AuditLog';
import { ExecutiveView } from './components/ExecutiveView';
import { Network } from './components/Network';
import { Help } from './components/Help';
import { PublicRouteCheck, PublicAlerts, PublicReport } from './components/PublicScreens';
import { Toasts } from './components/Toasts';
import { Login } from './pages/Login';
import { CitizenHome } from './pages/CitizenHome';
import { WardEngineerHome } from './pages/WardEngineerHome';
import { ControlRoomHome } from './pages/ControlRoomHome';
import { Denied } from './pages/Denied';

function App() {
  const { currentScreen, session } = useStore();

  // If no session, show login
  if (!session) {
    return <Login />;
  }

  const renderScreen = () => {
    // Route guards
    const officialScreens = ['ward-home', 'control-room-home', 'action-list', 'sensor-health', 'audit-log', 'executive-summary', 'network'];
    const networkScreens = ['network'];
    const isOfficial = session.role !== 'citizen';
    const canSeeNetwork = session.role === 'control_room' || session.role === 'commissioner' || session.role === 'ddma_officer';

    if (officialScreens.includes(currentScreen) && !isOfficial) {
      return <Denied />;
    }

    if (networkScreens.includes(currentScreen) && !canSeeNetwork) {
      return <Denied />;
    }

    switch (currentScreen) {
      case 'citizen-home':
        return <CitizenHome />;
      case 'ward-home':
        return session.role === 'control_room' ? <ControlRoomHome /> : <WardEngineerHome />;
      case 'control-room-home':
        return <ControlRoomHome />;
      case 'risk-map':
        return <RiskMap />;
      case 'action-list':
        return <ActionList />;
      case 'sensor-health':
        return <SensorHealth />;
      case 'audit-log':
        return <AuditLog />;
      case 'executive-summary':
        return <ExecutiveView />;
      case 'network':
        return <Network />;
      case 'help':
        return <Help />;
      case 'public-route-check':
        return <PublicRouteCheck />;
      case 'public-alerts':
        return <PublicAlerts />;
      case 'public-report':
        return <PublicReport />;
      case 'denied':
        return <Denied />;
      default:
        return isOfficial ? <WardEngineerHome /> : <CitizenHome />;
    }
  };

  // Citizen sign-in toast
  const CitizenToast = () => {
    const { showCitizenToast, dismissCitizenToast, lang } = useStore();
    if (!showCitizenToast) return null;
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-4 z-[9999] animate-[fadeInUp_200ms_ease-out]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {lang === 'en' ? 'Signed in as citizen' : 'नागरिक के रूप में साइन इन'}
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {lang === 'en' ? 'Contact MCG for official access.' : 'आधिकारिक पहुँच के लिए MCG से संपर्क करें।'}
            </p>
          </div>
          <button onClick={dismissCitizenToast} className="text-blue-400 hover:text-blue-600 text-lg">×</button>
        </div>
      </div>
    );
  };

  return (
    <NavigationShell>
      {renderScreen()}
      <Toasts />
      <CitizenToast />
    </NavigationShell>
  );
}

export default App;
