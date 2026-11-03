import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { Map, List, Activity, FileText, BarChart3, Home, Route, Bell, Target, AlertTriangle, Menu, X, Globe, User } from 'lucide-react';

const opsNavItems = [
  { id: 'risk-map', icon: Map, labelKey: 'nav.risk_map' },
  { id: 'action-list', icon: List, labelKey: 'nav.action_list' },
  { id: 'sensor-health', icon: Activity, labelKey: 'nav.sensor_health' },
  { id: 'audit-log', icon: FileText, labelKey: 'nav.audit_log' },
  { id: 'executive-summary', icon: BarChart3, labelKey: 'nav.executive' },
] as const;

const publicNavItems = [
  { id: 'public-home', icon: Home, labelKey: 'nav.public_home' },
  { id: 'public-route-check', icon: Route, labelKey: 'nav.route_check' },
  { id: 'public-alerts', icon: Bell, labelKey: 'nav.alerts' },
  { id: 'public-calibration', icon: Target, labelKey: 'nav.calibration' },
  { id: 'public-report', icon: AlertTriangle, labelKey: 'nav.report' },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, role, setRole, currentScreen, setCurrentScreen, rainfallMm, getRiskScores, sensors } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isOps = role === 'ward_engineer' || role === 'control_room' || role === 'executive';
  const navItems = isOps ? opsNavItems : publicNavItems;
  const riskScores = getRiskScores();
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  const roles: { id: typeof role; labelKey: string }[] = [
    { id: 'ward_engineer', labelKey: 'role.ward_engineer' },
    { id: 'control_room', labelKey: 'role.control_room' },
    { id: 'executive', labelKey: 'role.executive' },
    { id: 'citizen', labelKey: 'role.citizen' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-light transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">GFC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-tight">{t('app.name', lang)}</h1>
              <p className="text-xs text-white/70 leading-tight">{t('app.tagline', lang)}</p>
            </div>
          </div>
        </div>

        {/* Event banner (ops only) */}
        {isOps && (
          <div className="hidden md:flex items-center gap-4 text-xs bg-white/10 rounded-lg px-3 py-1.5">
            <span className="font-medium">{t('risk_map.forecast', lang)}: {rainfallMm}mm {t('risk_map.in_6h', lang)}</span>
            <span className="text-red-300 font-semibold">{highRisk} {t('risk_map.high_risk', lang)} {t('risk_map.hotspots', lang)}</span>
            {offlineSensors > 0 && <span className="text-yellow-300">{offlineSensors} {t('risk_map.sensors_offline', lang)}</span>}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs">
              <User size={14} />
              <span className="hidden sm:inline">{t(`role.${role === 'ward_engineer' ? 'ward_engineer' : role === 'control_room' ? 'control_room' : role === 'executive' ? 'executive' : 'citizen'}`, lang)}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white text-text-primary rounded-lg shadow-lg py-1 min-w-[160px] hidden group-hover:block z-50">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-background transition-colors ${role === r.id ? 'bg-background font-semibold' : ''}`}
                >
                  {t(r.labelKey, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium"
            aria-label="Toggle language"
          >
            <Globe size={14} />
            <span>{lang === 'en' ? 'हिं' : 'EN'}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-56 bg-white border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-0
        `}>
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentScreen(item.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background hover:text-text-primary'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} />
                  <span>{t(item.labelKey, lang)}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
