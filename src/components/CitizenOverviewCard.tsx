import { useMemo, useState } from 'react';
import {
  Route,
  Camera,
  Bell,
  PhoneCall,
  ArrowRight,
  PanelRightClose,
  PanelRightOpen,
  LocateFixed,
  Loader2,
  Search,
} from 'lucide-react';
import { mcgHotspots, MCG_OFFICIAL_CHANNELS } from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { getHotspotDisplayName, formatWardLabel } from '../i18n/locationHi';
import { fetchRealtimePosition } from '../lib/geolocation';

export function CitizenOverviewCard() {
  const {
    lang,
    role,
    activeView,
    selectedHotspotId,
    setActiveView,
    rightSidebarCollapsed,
    toggleRightSidebar,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
    setSelectedHotspotId,
    setUserLocation,
    addToast,
  } = useStore();

  const [locating, setLocating] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');

  const handleFetchMyLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const fix = await fetchRealtimePosition();
      setUserLocation(fix, true);
      addToast(
        `Showing your real-time location (${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)})`,
        'success'
      );
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Unable to fetch your real-time location',
        'warning'
      );
    } finally {
      setLocating(false);
    }
  };

  const stats = useMemo(() => {
    let critical = 0;
    let high = 0;
    const scored = mcgHotspots.map((h) => ({
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
    }));

    scored.forEach(({ tel }) => {
      if (tel.tier === 'critical') critical += 1;
      else if (tel.tier === 'high') high += 1;
    });

    const sorted = [...scored].sort((a, b) => b.tel.riskPct - a.tel.riskPct);
    const filteredList = quickFilter.trim()
      ? sorted.filter(({ hotspot }) => {
          const q = quickFilter.toLowerCase();
          return (
            hotspot.name.toLowerCase().includes(q) ||
            getHotspotDisplayName(hotspot, 'hi').toLowerCase().includes(q) ||
            String(hotspot.wardNo).includes(q)
          );
        })
      : sorted;

    return {
      critical,
      high,
      topHotspot: sorted[0].hotspot,
      topRisk: sorted[0].tel.riskPct,
      watchList: filteredList.slice(0, 4),
    };
  }, [
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
    quickFilter,
  ]);

  if (role !== 'citizen' || activeView !== 'map' || selectedHotspotId) return null;

  if (rightSidebarCollapsed) {
    return (
      <aside className="hidden lg:flex w-13 shrink-0 h-full border-l border-[#E6E7EC] dark:border-[#22252D] bg-white dark:bg-[#111317] flex-col items-center py-3 gap-2">
        <button
          type="button"
          onClick={toggleRightSidebar}
          className="p-2 rounded-full text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          title="Expand Road Safety Sidebar"
          aria-label="Expand Road Safety Sidebar"
        >
          <PanelRightOpen size={17} />
        </button>

        <div className="w-6 h-px bg-[#E6E7EC] dark:bg-[#22252D] my-0.5" />

        <button
          type="button"
          onClick={() => setActiveView('route')}
          title={t('citizen.safe_corridors', lang)}
          aria-label={t('citizen.safe_corridors', lang)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#111317] dark:text-slate-200 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
        >
          <Route size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveView('report')}
          title={t('citizen.report_flood', lang)}
          aria-label={t('citizen.report_flood', lang)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-rose-600 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
        >
          <Camera size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveView('alerts')}
          title={t('citizen.subscribe_alerts', lang)}
          aria-label={t('citizen.subscribe_alerts', lang)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-amber-600 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
        >
          <Bell size={16} />
        </button>

        <button
          type="button"
          onClick={handleFetchMyLocation}
          disabled={locating}
          title="Fetch My Location"
          aria-label="Fetch My Location"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#111317] dark:text-slate-200 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex w-[308px] xl:w-[330px] shrink-0 h-full flex-col justify-between border-l border-[#E6E7EC] dark:border-[#22252D] bg-white dark:bg-[#111317] overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Panel Header (Inspired by "Chat history" right panel) */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#111317] dark:text-[#F4F4F6]">
            {lang === 'en' ? 'Live Safety Feed' : 'लाइव सुरक्षा अपडेट'}
          </h2>
          <button
            type="button"
            onClick={toggleRightSidebar}
            className="w-7 h-7 rounded-full bg-[#F3F4F6] dark:bg-[#1C1F26] text-[#6B7280] hover:text-[#111317] dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
            title={lang === 'hi' ? 'साइडबार छिपाएं' : 'Collapse right sidebar'}
            aria-label="Collapse right sidebar"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        {/* Rounded Search Pill */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder={lang === 'hi' ? 'हॉटस्पॉट खोजें...' : 'Search hotspots...'}
              className="w-full pl-9 pr-3 py-2 rounded-full text-xs border border-[#EAECEF] dark:border-[#242832] bg-[#F7F7F9] dark:bg-[#181B20] text-[#111317] dark:text-slate-100 placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D2621]/20"
            />
          </div>
        </div>

        {/* Summary Stat Box */}
        <div className="mx-4 mb-3 p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F] space-y-2 relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 studio-iridescent-glow opacity-75" />
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {stats.critical}
            </span>
            <span className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'en' ? 'severe flood zones' : 'गंभीर जलभराव क्षेत्र'}
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-slate-400 tabular-nums">
              · {stats.high} {lang === 'hi' ? 'जोखिम' : 'high'}
            </span>
          </div>
          <p className="relative z-10 text-[11px] text-[#6B7280] dark:text-slate-400 leading-relaxed">
            {lang === 'en'
              ? 'Tap any pin on the map to inspect water depth or call the responsible MCG Ward Engineer.'
              : 'पानी की गहराई देखने या वार्ड इंजीनियर को कॉल करने के लिए मानचित्र पर किसी भी बिंदु पर टैप करें।'}
          </p>
        </div>

        {/* Watchlist Items (Matching clean list aesthetic) */}
        <div className="px-4 space-y-2 pb-3">
          <p className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? 'प्रमुख जलभराव बिंदु' : 'Priority Watchlist'}
          </p>
          {stats.watchList.map(({ hotspot, tel }) => (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => setSelectedHotspotId(hotspot.id)}
              className="w-full text-left p-3 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] hover:border-[#D1D5DB] dark:hover:border-[#343947] transition-all flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] truncate">
                  {getHotspotDisplayName(hotspot, lang)}
                </p>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5 truncate">
                  {formatWardLabel(hotspot.wardNo, lang)} · ~{tel.waterDepthCm}{' '}
                  {lang === 'hi' ? 'सेमी' : 'cm'}
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold tabular-nums shrink-0 ${
                  tel.tier === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : tel.tier === 'high'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[#111317] dark:text-slate-200'
                }`}
              >
                {tel.riskPct}%
              </span>
            </button>
          ))}
        </div>

        {/* Quick Menu Shortcuts */}
        <div className="px-4 pb-4 space-y-2">
          <button
            type="button"
            onClick={() => setActiveView('report')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F] text-[#111317] dark:text-[#F4F4F6] text-xs font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#1F232C] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Camera size={14} className="text-rose-600" />
              {t('citizen.report_flood', lang)}
            </span>
            <ArrowRight size={13} className="text-[#6B7280]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('alerts')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F] text-[#111317] dark:text-[#F4F4F6] text-xs font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#1F232C] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell size={14} className="text-amber-600" />
              {t('citizen.subscribe_alerts', lang)}
            </span>
            <ArrowRight size={13} className="text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Bottom Sticky Actions (Solid Charcoal CTA like Reference Bottom-Right Button) */}
      <div className="p-4 border-t border-[#EAECEF] dark:border-[#22252D] bg-white dark:bg-[#111317] space-y-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveView('route')}
          className="w-full py-2.5 px-4 rounded-full bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Route size={14} />
          <span>{t('citizen.safe_corridors', lang)}</span>
        </button>

        <button
          type="button"
          onClick={handleFetchMyLocation}
          disabled={locating}
          className="w-full py-2 px-3 rounded-full border border-[#E6E7EC] dark:border-[#282C36] bg-[#F3F4F6] hover:bg-[#EAECEF] dark:bg-[#181B20] dark:hover:bg-[#23262F] text-[#111317] dark:text-[#F4F4F6] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LocateFixed size={13} />
          )}
          <span>
            {locating
              ? lang === 'hi'
                ? 'स्थान प्राप्त हो रहा है...'
                : 'Fetching Location...'
              : lang === 'hi'
                ? 'मेरा रीयल-टाइम स्थान दिखाएँ'
                : 'Fetch My Location'}
          </span>
        </button>

        <div className="pt-1 flex items-center justify-between text-[11px] text-[#6B7280] dark:text-slate-400">
          <span>{lang === 'hi' ? 'MCG हेल्पलाइन' : 'MCG Helpline'}</span>
          <a
            href={`tel:${MCG_OFFICIAL_CHANNELS.helpline}`}
            className="inline-flex items-center gap-1 font-mono font-semibold text-[#111317] dark:text-slate-200 hover:underline"
          >
            <PhoneCall size={11} />
            {MCG_OFFICIAL_CHANNELS.helpline}
          </a>
        </div>
      </div>
    </aside>
  );
}
