import React from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { Map, List, Activity, FileText, BarChart3, Home, Route, Bell, AlertTriangle, Menu, X, Globe, Droplets, Network as NetworkIcon } from 'lucide-react';
import { AvatarDropdown, Dropdown } from './ui/Dropdown';

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, session, logout, currentScreen, setCurrentScreen, rainfallMm, getRiskScores, sensors } = useStore();

  const isOps = session?.role === 'ward_engineer' || session?.role === 'control_room' || session?.role === 'commissioner' || session?.role === 'ddma_officer';
  const isCitizen = session?.role === 'citizen' || !session;
  const canSeeNetwork = session?.role === 'control_room' || session?.role === 'commissioner' || session?.role === 'ddma_officer';

  const riskScores = getRiskScores();
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  const opsNavItems = [
    { id: 'ward-home', icon: Home, label: lang === 'en' ? 'Dashboard' : 'डैशबोर्ड' },
    { id: 'risk-map', icon: Map, labelKey: 'nav.risk_map' },
    { id: 'action-list', icon: List, labelKey: 'nav.action_list' },
    { id: 'sensor-health', icon: Activity, labelKey: 'nav.sensor_health' },
    { id: 'audit-log', icon: FileText, labelKey: 'nav.audit_log' },
    { id: 'executive-summary', icon: BarChart3, labelKey: 'nav.executive' },
    ...(canSeeNetwork ? [{ id: 'network', icon: NetworkIcon, label: lang === 'en' ? 'Network' : 'नेटवर्क' }] : []),
  ] as const;

  const citizenNavItems = [
    { id: 'citizen-home', icon: Home, label: lang === 'en' ? 'Home' : 'होम' },
    { id: 'public-route-check', icon: Route, labelKey: 'nav.route_check' },
    { id: 'public-alerts', icon: Bell, labelKey: 'nav.alerts' },
    { id: 'public-report', icon: AlertTriangle, labelKey: 'nav.report' },
    { id: 'risk-map', icon: Map, label: lang === 'en' ? 'Risk Map' : 'जोखिम मानचित्र' },
  ] as const;

  const navItems = isOps ? opsNavItems : citizenNavItems;

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="bg-primary text-white px-4 py-2.5 flex items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center relative">
              <Droplets size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-tight">{t('app.name', lang)}</h1>
            </div>
          </div>
        </div>

        {/* Event banner (ops only) */}
        {isOps && (
          <div className="hidden md:flex items-center gap-4 text-xs bg-white/10 rounded-lg px-3 py-1.5">
            <span className="font-medium">{rainfallMm}mm / 6h</span>
            <span className="text-red-300 font-semibold">{highRisk} high-risk</span>
            {offlineSensors > 0 && <span className="text-yellow-300">{offlineSensors} sensors offline</span>}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium">
                <Globe size={14} />
                <span>{lang === 'en' ? 'EN' : 'हिं'}</span>
              </button>
            }
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिंदी' },
            ]}
            value={lang}
            onChange={(v) => setLang(v as 'en' | 'hi')}
            align="end"
          />

          {/* Avatar / Sign In */}
          {session && session.email !== 'citizen@guest.local' ? (
            <AvatarDropdown
              email={session.email}
              name={session.name}
              picture={session.picture}
              onSignOut={handleSignOut}
            />
          ) : session?.email === 'citizen@guest.local' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 hidden sm:inline">{lang === 'en' ? 'Guest' : 'अतिथि'}</span>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {lang === 'en' ? 'Sign in' : 'साइन इन'}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only for ops roles */}
        {isOps && (
          <aside className="hidden lg:flex w-56 bg-white border-r border-border flex-col">
            <nav className="p-3 space-y-1 flex-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                const label = 'label' in item ? item.label : t((item as any).labelKey, lang);
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background hover:text-text-primary'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Role badge */}
            <div className="p-3 border-t border-border">
              <div className="px-3 py-2 rounded-lg bg-background text-xs">
                <p className="font-medium text-text-primary">
                  {session?.role === 'ward_engineer' && (lang === 'en' ? 'Ward Engineer' : 'वार्ड अभियंता')}
                  {session?.role === 'control_room' && (lang === 'en' ? 'Control Room' : 'नियंत्रण कक्ष')}
                  {session?.role === 'commissioner' && (lang === 'en' ? 'Commissioner' : 'आयुक्त')}
                  {session?.role === 'ddma_officer' && (lang === 'en' ? 'DDMA Officer' : 'DDMA अधिकारी')}
                </p>
                <p className="text-text-secondary truncate">{session?.email}</p>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
