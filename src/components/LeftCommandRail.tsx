import { useMemo, useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Sparkles,
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
    alertSubscriptions,
    dispatchRecords,
    citizenUser,
    authorityUser,
  } = useStore();

  const [toolsExpanded, setToolsExpanded] = useState(true);

  const navItems: Array<{
    id: ActiveView;
    labelKey: string;
    icon: typeof MapIcon;
    badge?: number;
  }> =
    role === 'citizen'
      ? [
          { id: 'map', labelKey: 'view.map', icon: MapIcon },
          { id: 'route', labelKey: 'view.route', icon: Route },
          {
            id: 'report',
            labelKey: 'view.report',
            icon: Camera,
            badge: floodReports.length > 0 ? floodReports.length : undefined,
          },
          {
            id: 'alerts',
            labelKey: 'view.alerts',
            icon: Bell,
            badge: alertSubscriptions.length > 0 ? alertSubscriptions.length : undefined,
          },
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
      <aside className="w-13 shrink-0 h-full border-r border-[#E6E7EC] dark:border-[#22252D] bg-[#F3F4F6] dark:bg-[#111317] flex flex-col items-center py-3 gap-1.5 z-20">
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-2 rounded-full text-[#6B7280] dark:text-slate-300 hover:bg-white dark:hover:bg-[#23262F] transition-colors"
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen size={17} />
        </button>

        <div className="w-6 h-px bg-[#E6E7EC] dark:bg-[#22252D] my-1" />

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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  active
                    ? 'bg-white dark:bg-[#23262F] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(17,19,23,0.08)]'
                    : 'text-[#6B7280] dark:text-slate-400 hover:bg-white/60 dark:hover:bg-[#1D2028] hover:text-[#111317] dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-2 border-t border-[#E6E7EC] dark:border-[#22252D] w-full flex justify-center">
          <button
            type="button"
            onClick={() => setActiveView('settings')}
            title={t('view.settings', lang)}
            aria-label={t('view.settings', lang)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeView === 'settings'
                ? 'bg-white dark:bg-[#23262F] text-[#111317] dark:text-white shadow-[0_2px_8px_rgba(17,19,23,0.08)]'
                : 'text-[#6B7280] dark:text-slate-400 hover:bg-white/60 dark:hover:bg-[#1D2028]'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>
      </aside>
    );
  }

  const profileTitle = authorityUser
    ? authorityUser.name
    : citizenUser
      ? citizenUser.name
      : lang === 'hi'
        ? 'सार्वजनिक उपयोगकर्ता'
        : 'Public Map Viewer';

  const profileSub = authorityUser
    ? authorityUser.employeeId
    : citizenUser
      ? `+91 ${citizenUser.phone}`
      : lang === 'hi'
        ? 'बिना लॉगिन देखें'
        : 'Browse freely · No login';

  return (
    <aside className="fixed inset-y-0 top-14 left-0 z-30 w-[84vw] max-w-[300px] sm:static sm:inset-auto sm:w-[272px] lg:w-[288px] shrink-0 h-[calc(100vh-3.5rem)] sm:h-full flex flex-col border-r border-[#E6E7EC] dark:border-[#22252D] bg-[#F3F4F6] dark:bg-[#111317] overflow-hidden">
      {/* Sidebar Header with Collapse Toggle */}
      <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-400">
          {role === 'citizen'
            ? lang === 'hi'
              ? 'नागरिक मेनू'
              : 'Citizen Workspace'
            : lang === 'hi'
              ? 'संचालन मेनू'
              : 'Operations Workspace'}
        </span>
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#6B7280] hover:text-[#111317] dark:text-slate-400 dark:hover:text-white hover:bg-white/70 dark:hover:bg-[#23262F] transition-colors"
          title={lang === 'hi' ? 'साइडबार छिपाएं' : 'Collapse sidebar'}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={14} />
          <span>{lang === 'hi' ? 'छिपाएं' : 'Hide'}</span>
        </button>
      </div>

      {/* Scrollable Sidebar Body */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {/* 1. Primary Floating-Pill Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-[#23262F] text-[#111317] dark:text-white shadow-[0_2px_10px_rgba(17,19,23,0.06)]'
                    : 'text-[#525866] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-[#1B1E26] hover:text-[#111317] dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      active ? 'text-[#111317] dark:text-white' : 'text-[#6B7280] dark:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{t(item.labelKey, lang)}</span>
                </span>
                {typeof item.badge === 'number' && (
                  <span className="w-5 h-5 rounded-full bg-[#111317] dark:bg-[#F4F4F6] text-white dark:text-[#111317] text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'settings'
                ? 'bg-white dark:bg-[#23262F] text-[#111317] dark:text-white shadow-[0_2px_10px_rgba(17,19,23,0.06)]'
                : 'text-[#525866] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-[#1B1E26] hover:text-[#111317] dark:hover:text-white'
            }`}
          >
            <Settings
              size={15}
              className={`shrink-0 ${
                activeView === 'settings'
                  ? 'text-[#111317] dark:text-white'
                  : 'text-[#6B7280] dark:text-slate-400'
              }`}
            />
            <span>{t('view.settings', lang)}</span>
          </button>
        </nav>

        <div className="h-px bg-[#E5E7EB] dark:bg-[#22252D] mx-1" />

        {/* 2. Collapsible Weather & Filters Section */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setToolsExpanded((v) => !v)}
            className="w-full px-1 flex items-center justify-between text-xs font-bold text-[#111317] dark:text-[#F4F4F6]"
          >
            <span>{lang === 'hi' ? 'मौसम और फ़िल्टर' : 'Weather & Filters'}</span>
            {toolsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {toolsExpanded && (
            <div className="space-y-3 px-1">
              {/* Weather Card */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#181B20] border border-[#EAECEF] dark:border-[#242832] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CloudRain size={15} className="text-[#111317] dark:text-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111317] dark:text-slate-100 truncate">
                        {t('weather.live_gurugram', lang)} ·{' '}
                        {liveWeather ? `${liveWeather.temperatureC}°C` : '29°C'}
                      </p>
                      <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">
                        {liveWeather ? liveWeather.condition : 'Checking weather...'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchLiveWeather(true)}
                    disabled={weatherLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F3F4F6] dark:bg-[#23262F] text-[#111317] dark:text-slate-200 hover:bg-[#E7E9EE] dark:hover:bg-[#2C303A] shrink-0 transition-colors"
                  >
                    <RefreshCw size={10} className={weatherLoading ? 'animate-spin' : ''} />
                    <span>{t('weather.sync_live', lang)}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280] dark:text-slate-400 font-medium">
                      {t('weather.storm_sim', lang)}
                    </span>
                    <span className="font-mono font-bold tabular-nums text-[#111317] dark:text-white">
                      {rainfallMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(Number(e.target.value))}
                    className="w-full h-1.5 accent-[#111317] dark:accent-white cursor-pointer"
                    aria-label="Adjust expected 6-hour rainfall"
                  />
                </div>
              </div>

              {/* Search Pill & Selectors */}
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'hi' ? 'सेक्टर, सड़क, वार्ड खोजें...' : 'Search sector, street, ward...'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-full text-xs border border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#181B20] text-[#111317] dark:text-slate-100 placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317]/20 dark:focus:ring-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={String(selectedZone)}
                    onChange={(e) =>
                      setSelectedZone(
                        e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3 | 4)
                      )
                    }
                    className="px-2.5 py-2 rounded-xl text-xs border border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#181B20] text-[#111317] dark:text-slate-200 focus:outline-none"
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
                    className="px-2.5 py-2 rounded-xl text-xs border border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#181B20] text-[#111317] dark:text-slate-200 focus:outline-none"
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
                  className="w-full px-2.5 py-2 rounded-xl text-xs border border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#181B20] text-[#111317] dark:text-slate-200 focus:outline-none"
                  aria-label="Filter by Drainage Reason"
                >
                  <option value="all">
                    {lang === 'hi' ? 'जलभराव के सभी कारण' : 'All Drainage Reasons'}
                  </option>
                  <option value="gmda_backflow">
                    {lang === 'hi' ? 'मुख्य नाला बैकफ्लो' : 'Main Drain Backflow'}
                  </option>
                  <option value="silt_blockage">
                    {lang === 'hi' ? 'अवरुद्ध / गाद भरा नाला' : 'Blocked / Silted Drain'}
                  </option>
                  <option value="no_master_drain">
                    {lang === 'hi' ? 'मास्टर ड्रेन उपलब्ध नहीं' : 'No Master Drain'}
                  </option>
                  <option value="telecom_obstruction">
                    {lang === 'hi' ? 'केबल बाधा' : 'Cable Obstruction'}
                  </option>
                  <option value="road_level_diff">
                    {lang === 'hi' ? 'सड़क स्तर में अंतर' : 'Uneven Road Level'}
                  </option>
                  <option value="critical_junction">
                    {lang === 'hi' ? 'प्रमुख चोकपॉइंट' : 'Major Chokepoint'}
                  </option>
                  <option value="low_lying">{lang === 'hi' ? 'निचला इलाका' : 'Low-Lying Area'}</option>
                </select>

                <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#6B7280] dark:text-slate-400">
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-[#181B20] p-0.5 rounded-full border border-[#E6E7EC] dark:border-[#242832]">
                    {([
                      { id: 'all', label: lang === 'hi' ? 'सभी' : 'All' },
                      { id: 'critical', label: lang === 'hi' ? 'गंभीर' : 'Severe' },
                      { id: 'high', label: lang === 'hi' ? 'अधिक' : 'High' },
                    ] as const).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCriticality(c.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          selectedCriticality === c.id
                            ? 'bg-[#111317] dark:bg-[#F4F4F6] text-white dark:text-[#111317]'
                            : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <span className="tabular-nums font-semibold">
                    {lang === 'hi' ? `${filteredTopList.length} स्थान` : `${filteredTopList.length} spots`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Ranked Hotspot List */}
        <div className="space-y-1.5 px-0.5">
          {filteredTopList.slice(0, 35).map(({ hotspot, tel }) => {
            const isSelected = selectedHotspotId === hotspot.id;
            const badgeCls =
              tel.tier === 'critical'
                ? 'text-red-600 dark:text-red-400'
                : tel.tier === 'high'
                  ? 'text-amber-600 dark:text-amber-400'
                  : tel.tier === 'medium'
                    ? 'text-[#111317] dark:text-blue-400'
                    : 'text-emerald-600 dark:text-emerald-400';

            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => {
                  setSelectedHotspotId(hotspot.id);
                  if (activeView !== 'map') setActiveView('map');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-white dark:bg-[#23262F] border border-[#D4D8E0] dark:border-[#343947] shadow-2xs'
                    : 'hover:bg-white/80 dark:hover:bg-[#1B1E26] border border-transparent'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111317] dark:text-slate-100 truncate">
                    {getHotspotDisplayName(hotspot, lang)}
                  </p>
                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5 truncate">
                    {formatWardLabel(hotspot.wardNo, lang)} · {formatZoneLabel(hotspot.zone, lang)} ·{' '}
                    {hotspot.owningAgency}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-mono font-bold tabular-nums ${badgeCls}`}>
                    {tel.riskPct}%
                  </p>
                  <p className="text-[10px] font-mono tabular-nums text-[#6B7280] dark:text-slate-400">
                    ~{tel.waterDepthCm} {lang === 'hi' ? 'सेमी' : 'cm'}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredTopList.length === 0 && (
            <div className="p-5 text-center text-xs text-[#6B7280] dark:text-slate-400 rounded-xl bg-white/70 dark:bg-[#181B20]">
              {lang === 'hi'
                ? 'इस फ़िल्टर से कोई स्थान नहीं मिला।'
                : 'No Gurugram spots match your current filter.'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile / Portal Action Card (SETO Reference Bottom-Left Box) */}
      <div className="p-3 shrink-0 border-t border-[#E6E7EC] dark:border-[#22252D] bg-[#F3F4F6] dark:bg-[#111317]">
        <div className="rounded-2xl bg-[#E3E5EA]/80 dark:bg-[#1A1D24] border border-[#D7DAE2] dark:border-[#282C36] p-3 space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#111317] dark:bg-[#F4F4F6] text-white dark:text-[#111317] flex items-center justify-center shrink-0">
              {authorityUser ? <ShieldCheck size={15} /> : <User size={15} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6] truncate">
                {profileTitle}
              </p>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">
                {profileSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveView(
                citizenUser || authorityUser ? 'settings' : 'citizen-login'
              )
            }
            className="w-full py-2 px-3 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles size={12} />
            <span>
              {citizenUser || authorityUser
                ? lang === 'hi'
                  ? 'खाता और SOS'
                  : 'Account & SOS'
                : lang === 'hi'
                  ? 'नागरिक / अधिकारी लॉगिन'
                  : 'Sign In / Portal'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
