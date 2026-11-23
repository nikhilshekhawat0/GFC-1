import { useMemo } from 'react';
import {
  Map as MapIcon,
  Route,
  Camera,
  Bell,
  Target,
  ListChecks,
  Activity,
  FileText,
  BarChart3,
  CloudRain,
  RefreshCw,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import { mcgHotspots, type CauseCategory } from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore, type ActiveView } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  getHotspotDisplayName,
  formatWardLabel,
  formatZoneLabel,
} from '../i18n/locationHi';
import { getFilteredHotspots } from './GeospatialMap';

export function LeftCommandRail() {
  const {
    lang,
    role,
    activeView,
    setActiveView,
    leftSidebarCollapsed,
    toggleLeftSidebar,
    rainfallMm,
    setRainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    liveWeather,
    weatherLoading,
    fetchLiveWeather,
    selectedZone,
    setSelectedZone,
    selectedWard,
    setSelectedWard,
    selectedCause,
    setSelectedCause,
    selectedCriticality,
    setSelectedCriticality,
    searchQuery,
    setSearchQuery,
    selectedHotspotId,
    setSelectedHotspotId,
    sensors,
    floodReports,
    dispatchRecords,
  } = useStore();

  const navItems: Array<{ id: ActiveView; labelKey: string; icon: typeof MapIcon }> =
    role === 'citizen'
      ? [
          { id: 'map', labelKey: 'view.map', icon: MapIcon },
          { id: 'route', labelKey: 'view.route', icon: Route },
          { id: 'report', labelKey: 'view.report', icon: Camera },
          { id: 'alerts', labelKey: 'view.alerts', icon: Bell },
          { id: 'accuracy', labelKey: 'view.accuracy', icon: Target },
        ]
      : [
          { id: 'map', labelKey: 'view.map', icon: MapIcon },
          { id: 'dispatch', labelKey: 'view.dispatch', icon: ListChecks },
          { id: 'sensors', labelKey: 'view.sensors', icon: Activity },
          { id: 'audit', labelKey: 'view.audit', icon: FileText },
          { id: 'executive', labelKey: 'view.executive', icon: BarChart3 },
        ];

  const wardsInZone = useMemo(() => {
    const set = new Set<number>();
    mcgHotspots.forEach((h) => {
      if (selectedZone === 'all' || h.zone === selectedZone) set.add(h.wardNo);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [selectedZone]);

  const filteredTopList = useMemo(() => {
    const filtered = getFilteredHotspots(
      selectedZone,
      selectedWard,
      selectedCause,
      selectedCriticality,
      searchQuery
    );
    return filtered
      .map((h) => ({
        hotspot: h,
        tel: computeHotspotTelemetry(
          h,
          rainfallMm,
          timelineHourOffset,
          pumpMitigationActive,
          sensors,
          floodReports,
          dispatchRecords[h.id]
        ),
      }))
      .sort((a, b) => b.tel.riskPct - a.tel.riskPct);
  }, [
    selectedZone,
    selectedWard,
    selectedCause,
    selectedCriticality,
    searchQuery,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
  ]);

  if (leftSidebarCollapsed) {
    return (
      <aside className="w-12 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] flex flex-col items-center py-3 gap-1.5 z-20">
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen size={17} />
        </button>

        <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-1" />

        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                title={t(item.labelKey, lang)}
                aria-label={t(item.labelKey, lang)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? 'bg-[#0B3D6B] text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-800 w-full flex justify-center">
          <button
            type="button"
            onClick={() => setActiveView('settings')}
            title={t('view.settings', lang)}
            aria-label={t('view.settings', lang)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeView === 'settings'
                ? 'bg-[#0B3D6B] text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 top-14 left-0 z-30 w-[84vw] max-w-[300px] sm:static sm:inset-auto sm:w-[276px] lg:w-[296px] shrink-0 h-[calc(100vh-3.5rem)] sm:h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] overflow-hidden">
      {/* Sidebar Header with Collapse Toggle */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {role === 'citizen'
            ? lang === 'hi'
              ? 'नागरिक मेनू'
              : 'Citizen Menu'
            : lang === 'hi'
              ? 'संचालन मेनू'
              : 'Operations Menu'}
        </span>
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={lang === 'hi' ? 'साइडबार छिपाएं' : 'Collapse sidebar'}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={15} />
          <span>{lang === 'hi' ? 'छिपाएं' : 'Hide'}</span>
        </button>
      </div>

      {/* Scrollable Up-to-Bottom Sidebar Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 dark:divide-slate-800/80">
        {/* 1. Up-to-Bottom Vertical Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#0B3D6B] text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span>{t(item.labelKey, lang)}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeView === 'settings'
                ? 'bg-[#0B3D6B] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <Settings size={15} className="shrink-0" />
            <span>{t('view.settings', lang)}</span>
          </button>
        </nav>

        {/* 2. Weather & Rainfall */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CloudRain size={15} className="text-[#0B3D6B] dark:text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {t('weather.live_gurugram', lang)} · {liveWeather ? `${liveWeather.temperatureC}°C` : '29°C'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {liveWeather ? liveWeather.condition : 'Checking Gurugram weather...'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchLiveWeather(true)}
              disabled={weatherLoading}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
            >
              <RefreshCw size={11} className={weatherLoading ? 'animate-spin' : ''} />
              <span>{t('weather.sync_live', lang)}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t('weather.storm_sim', lang)}
              </span>
              <span className="font-mono font-bold tabular-nums text-[#0B3D6B] dark:text-cyan-400">
                {rainfallMm} mm
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full h-1.5 accent-[#0B3D6B] cursor-pointer"
              aria-label="Adjust expected 6-hour rainfall"
            />
          </div>
        </div>

        {/* 3. Find & Filter Hotspots */}
        <div className="p-4 space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'hi' ? 'सेक्टर, सड़क, वार्ड खोजें...' : 'Search sector, street, ward...'
              }
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={String(selectedZone)}
              onChange={(e) =>
                setSelectedZone(
                  e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3 | 4)
                )
              }
              className="px-2.5 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              aria-label="Filter by Zone"
            >
              <option value="all">{lang === 'hi' ? 'सभी ज़ोन' : 'All Zones'}</option>
              <option value="1">{formatZoneLabel(1, lang)}</option>
              <option value="2">{formatZoneLabel(2, lang)}</option>
              <option value="3">{formatZoneLabel(3, lang)}</option>
              <option value="4">{formatZoneLabel(4, lang)}</option>
            </select>

            <select
              value={String(selectedWard)}
              onChange={(e) =>
                setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-2.5 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              aria-label="Filter by Ward"
            >
              <option value="all">{lang === 'hi' ? 'सभी 36 वार्ड' : 'All 36 Wards'}</option>
              {wardsInZone.map((w) => (
                <option key={w} value={w}>
                  {formatWardLabel(w, lang)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedCause}
            onChange={(e) => setSelectedCause(e.target.value as 'all' | CauseCategory)}
            className="w-full px-2.5 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            aria-label="Filter by Drainage Reason"
          >
            <option value="all">{lang === 'hi' ? 'जलभराव के सभी कारण' : 'All Drainage Reasons'}</option>
            <option value="gmda_backflow">{lang === 'hi' ? 'मुख्य नाला बैकफ्लो' : 'Main Drain Backflow'}</option>
            <option value="silt_blockage">{lang === 'hi' ? 'अवरुद्ध / गाद भरा नाला' : 'Blocked / Silted Drain'}</option>
            <option value="no_master_drain">{lang === 'hi' ? 'मास्टर ड्रेन उपलब्ध नहीं' : 'No Master Drain'}</option>
            <option value="telecom_obstruction">{lang === 'hi' ? 'केबल बाधा' : 'Cable Obstruction'}</option>
            <option value="road_level_diff">{lang === 'hi' ? 'सड़क स्तर में अंतर' : 'Uneven Road Level'}</option>
            <option value="critical_junction">{lang === 'hi' ? 'प्रमुख चोकपॉइंट' : 'Major Chokepoint'}</option>
            <option value="low_lying">{lang === 'hi' ? 'निचला इलाका' : 'Low-Lying Area'}</option>
          </select>

          <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              {([
                { id: 'all', label: lang === 'hi' ? 'सभी' : 'All' },
                { id: 'critical', label: lang === 'hi' ? 'गंभीर' : 'Severe' },
                { id: 'high', label: lang === 'hi' ? 'अधिक' : 'High' },
              ] as const).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCriticality(c.id)}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                    selectedCriticality === c.id
                      ? 'bg-[#0B3D6B] text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <span className="tabular-nums font-medium">
              {lang === 'hi' ? `${filteredTopList.length} स्थान` : `${filteredTopList.length} spots`}
            </span>
          </div>
        </div>

        {/* 4. Ranked Hotspot List */}
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
          {filteredTopList.slice(0, 40).map(({ hotspot, tel }) => {
            const isSelected = selectedHotspotId === hotspot.id;
            const badgeCls =
              tel.tier === 'critical'
                ? 'text-red-600 dark:text-red-400'
                : tel.tier === 'high'
                  ? 'text-amber-600 dark:text-amber-400'
                  : tel.tier === 'medium'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-emerald-600 dark:text-emerald-400';

            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => {
                  setSelectedHotspotId(hotspot.id);
                  if (activeView !== 'map') setActiveView('map');
                }}
                className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {getHotspotDisplayName(hotspot, lang)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {formatWardLabel(hotspot.wardNo, lang)} · {formatZoneLabel(hotspot.zone, lang)} ·{' '}
                    {hotspot.owningAgency}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-mono font-bold tabular-nums ${badgeCls}`}>
                    {tel.riskPct}%
                  </p>
                  <p className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    ~{tel.waterDepthCm} {lang === 'hi' ? 'सेमी' : 'cm'}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredTopList.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {lang === 'hi'
                ? 'इस फ़िल्टर से कोई स्थान नहीं मिला।'
                : 'No Gurugram spots match your current filter.'}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
