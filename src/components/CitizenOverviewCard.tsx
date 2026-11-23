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
} from 'lucide-react';
import { mcgHotspots, MCG_OFFICIAL_CHANNELS } from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore } from '../store/useStore';
import { t } from '../i18n/translations';
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
    let topId = mcgHotspots[0].id;
    let topRisk = -1;

    mcgHotspots.forEach((h) => {
      const tel = computeHotspotTelemetry(
        h,
        rainfallMm,
        timelineHourOffset,
        pumpMitigationActive,
        sensors,
        floodReports,
        dispatchRecords[h.id]
      );
      if (tel.tier === 'critical') critical += 1;
      else if (tel.tier === 'high') high += 1;
      if (tel.riskPct > topRisk) {
        topRisk = tel.riskPct;
        topId = h.id;
      }
    });

    return {
      critical,
      high,
      topHotspot: mcgHotspots.find((h) => h.id === topId)!,
      topRisk,
    };
  }, [rainfallMm, timelineHourOffset, pumpMitigationActive, sensors, floodReports, dispatchRecords]);

  if (role !== 'citizen' || activeView !== 'map' || selectedHotspotId) return null;

  if (rightSidebarCollapsed) {
    return (
      <aside className="hidden lg:flex w-12 shrink-0 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] flex-col items-center py-3 gap-2">
        <button
          type="button"
          onClick={toggleRightSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expand Road Safety Sidebar"
          aria-label="Expand Road Safety Sidebar"
        >
          <PanelRightOpen size={17} />
        </button>

        <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

        <button
          type="button"
          onClick={() => setActiveView('route')}
          title={t('citizen.safe_corridors', lang)}
          aria-label={t('citizen.safe_corridors', lang)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0B3D6B] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Route size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveView('report')}
          title={t('citizen.report_flood', lang)}
          aria-label={t('citizen.report_flood', lang)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Camera size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveView('alerts')}
          title={t('citizen.subscribe_alerts', lang)}
          aria-label={t('citizen.subscribe_alerts', lang)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell size={16} />
        </button>

        <button
          type="button"
          onClick={handleFetchMyLocation}
          disabled={locating}
          title="Fetch My Location"
          aria-label="Fetch My Location"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex w-[300px] xl:w-[325px] shrink-0 h-full flex-col justify-between border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] overflow-y-auto">
      <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
        {/* Header with Collapse Toggle */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0B3D6B] dark:text-blue-400">
            {lang === 'en' ? 'Gurugram Road Safety Today' : 'गुरुग्राम सड़क सुरक्षा अपडेट'}
          </span>
          <button
            type="button"
            onClick={toggleRightSidebar}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Collapse right sidebar"
            aria-label="Collapse right sidebar"
          >
            <PanelRightClose size={15} />
            <span>Hide</span>
          </button>
        </div>

        {/* Summary Stat */}
        <div className="p-5 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {stats.critical}
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {lang === 'en' ? 'areas flooded' : 'गंभीर जलभराव क्षेत्र'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              · {stats.high} at risk
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'en'
              ? 'Tap any pin on the map to view water depth, past history, or contact the ward engineer.'
              : 'पानी की गहराई देखने या वार्ड इंजीनियर को कॉल करने के लिए मानचित्र पर किसी भी बिंदु पर टैप करें।'}
          </p>
          <button
            type="button"
            onClick={() => setSelectedHotspotId(stats.topHotspot.id)}
            className="pt-1 text-left text-xs font-semibold text-[#0B3D6B] dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            <span>
              Highest now: {stats.topHotspot.name} ({stats.topRisk}%)
            </span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Up-to-Bottom Citizen Actions */}
        <div className="p-5 space-y-2.5">
          <button
            type="button"
            onClick={() => setActiveView('route')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] text-white text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Route size={15} />
              {t('citizen.safe_corridors', lang)}
            </span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('report')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Camera size={15} className="text-rose-600" />
              {t('citizen.report_flood', lang)}
            </span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('alerts')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell size={15} className="text-amber-600" />
              {t('citizen.subscribe_alerts', lang)}
            </span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={handleFetchMyLocation}
            disabled={locating}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 text-[#0B3D6B] dark:text-blue-200 text-xs font-semibold hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {locating ? (
                <Loader2 size={15} className="animate-spin text-blue-600" />
              ) : (
                <LocateFixed size={15} className="text-blue-600 dark:text-blue-400" />
              )}
              {locating
                ? lang === 'hi'
                  ? 'स्थान प्राप्त हो रहा है...'
                  : 'Fetching Location...'
                : lang === 'hi'
                  ? 'मेरा रीयल-टाइम स्थान दिखाएँ'
                  : 'Fetch My Location'}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>MCG Helpline</span>
        <a
          href={`tel:${MCG_OFFICIAL_CHANNELS.helpline}`}
          className="inline-flex items-center gap-1 font-mono font-semibold text-[#0B3D6B] dark:text-slate-200 hover:underline"
        >
          <PhoneCall size={12} />
          {MCG_OFFICIAL_CHANNELS.helpline}
        </a>
      </div>
    </aside>
  );
}
