import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { RiskMap } from './components/RiskMap';
import { ActionList } from './components/ActionList';
import { SensorHealth } from './components/SensorHealth';
import { AuditLog } from './components/AuditLog';
import { ExecutiveView } from './components/ExecutiveView';
import { PublicHome, PublicRouteCheck, PublicAlerts, PublicCalibration, PublicReport } from './components/PublicScreens';
import { Toasts } from './components/Toasts';

function App() {
  const { currentScreen } = useStore();

  const renderScreen = () => {
    switch (currentScreen) {
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
      case 'public-home':
        return <PublicHome />;
      case 'public-route-check':
        return <PublicRouteCheck />;
      case 'public-alerts':
        return <PublicAlerts />;
      case 'public-calibration':
        return <PublicCalibration />;
      case 'public-report':
        return <PublicReport />;
      default:
        return <RiskMap />;
    }
  };

  return (
    <Layout>
      {renderScreen()}
      <Toasts />
    </Layout>
  );
}

export default App;
