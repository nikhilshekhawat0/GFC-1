import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  ArrowUpDown,
  Phone,
  MessageCircle,
  Download,
  Printer,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  mcgHotspots,
  crews,
  calibrationData,
  sensorOfflineHistory,
} from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  getHotspotDisplayName,
  getCauseAnalysis,
  localizeLocationName,
  formatWardLabel,
  formatZoneLabel,
} from '../i18n/locationHi';
import { getFilteredHotspots } from './GeospatialMap';

function exportToCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DispatchSlaView() {
  const {
    lang,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    selectedZone,
    selectedWard,
    selectedCause,
    selectedCriticality,
    searchQuery,
    sensors,
    floodReports,
    dispatchRecords,
    deployPumpToHotspot,
    markHotspotCleared,
    escalateHotspotSla,
    overrideHotspotRank,
    setSelectedHotspotId,
    setActiveView,
  } = useStore();

  const [overrideTarget, setOverrideTarget] = useState<{
    hotspotId: string;
    name: string;
    currentRank: number;
  } | null>(null);
  const [newRankInput, setNewRankInput] = useState('1');
  const [overrideReason, setOverrideReason] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  const rankedList = useMemo(() => {
    const filtered = getFilteredHotspots(
      selectedZone,
      selectedWard,
      selectedCause,
      selectedCriticality,
      searchQuery
    );
    const items = filtered.map((h) => {
      const dispatch = dispatchRecords[h.id];
      const tel = computeHotspotTelemetry(
        h,
        rainfallMm,
        timelineHourOffset,
        pumpMitigationActive,
        sensors,
        floodReports,
        dispatch
      );
      const crew = crews.find((c) => c.zone === h.zone) || crews[0];
      return { hotspot: h, tel, dispatch, crew };
    });

    items.sort((a, b) => {
      const aRank = a.dispatch?.is_override && a.dispatch.rank_override ? a.dispatch.rank_override : 9999;
      const bRank = b.dispatch?.is_override && b.dispatch.rank_override ? b.dispatch.rank_override : 9999;
      if (aRank !== bRank) return aRank - bRank;
      return b.tel.riskPct - a.tel.riskPct;
    });

    return items.map((item, idx) => ({ ...item, rank: idx + 1 }));
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

  const handleExportCsv = () => {
    const header = ['Rank', 'SrNo', 'Ward', 'Zone', 'Hotspot', 'Agency', 'RiskPct', 'DepthCm', 'SLATier', 'Status', 'JE', 'JEPhone', 'Cause'];
    const rows = rankedList.map(({ rank, hotspot, tel, dispatch }) => [
      String(rank),
      String(hotspot.srNo),
      String(hotspot.wardNo),
      String(hotspot.zone),
      hotspot.name,
      hotspot.owningAgency,
      String(tel.riskPct),
      String(tel.waterDepthCm),
      `L${tel.slaTier}`,
      dispatch?.status || 'pending',
      hotspot.contacts.je.name,
      hotspot.contacts.je.phone,
      hotspot.causeAnalysis,
    ]);
    exportToCsv('gfc-sla-dispatch-queue.csv', [header, ...rows]);
  };

  const handleConfirmOverride = async () => {
    if (!overrideTarget || !overrideReason.trim() || !confirmChecked) return;
    await overrideHotspotRank(
      overrideTarget.hotspotId,
      Math.max(1, Number(newRankInput) || 1),
      overrideReason.trim()
    );
    setOverrideTarget(null);
    setOverrideReason('');
    setConfirmChecked(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Truck size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'hi' ? 'वार्ड SLA और पंप तैनाती सूची' : 'Ward SLA & Pump Dispatch Queue'}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              {lang === 'hi'
                ? `${rankedList.length} MCG हॉटस्पॉट — लाइव जोखिम, नाला प्रभाव और नागरिक रिपोर्ट के अनुसार क्रमबद्ध`
                : `${rankedList.length} MCG hotspots ranked by live flood risk, drain leverage & citizen reports`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <Download size={13} />
            CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <Printer size={13} />
            {lang === 'hi' ? 'प्रिंट' : 'Print'}
          </button>
          <button
            onClick={() => setActiveView('map')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] transition-colors"
          >
            <ArrowLeft size={13} />
            {lang === 'hi' ? 'मानचित्र' : 'Map'}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {rankedList.slice(0, 60).map(({ rank, hotspot, tel, dispatch, crew }) => {
          const riskColor =
            tel.tier === 'critical'
              ? 'text-red-600 dark:text-red-400'
              : tel.tier === 'high'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400';

          return (
            <div
              key={hotspot.id}
              className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] dark:bg-[#23262F] flex items-center justify-center font-mono text-xs font-bold tabular-nums text-[#111317] dark:text-[#F4F4F6] shrink-0">
                  #{rank}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#6B7280] dark:text-slate-400">
                    <span>{formatWardLabel(hotspot.wardNo, lang)}</span>
                    <span>·</span>
                    <span>{formatZoneLabel(hotspot.zone, lang)}</span>
                    <span>·</span>
                    <span>{hotspot.owningAgency}</span>
                    <span>·</span>
                    <span className={riskColor}>
                      {tel.riskPct}% (~{tel.waterDepthCm}
                      {lang === 'hi' ? 'सेमी' : 'cm'})
                    </span>
                    <span>·</span>
                    <span>
                      SLA L{tel.slaTier} (
                      {dispatch?.status === 'done'
                        ? lang === 'hi'
                          ? 'साफ'
                          : 'CLEARED'
                        : `${tel.slaRemainingMins}${lang === 'hi' ? ' मि.' : 'm'}`}
                      )
                    </span>
                    {dispatch?.is_override && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {lang === 'hi' ? 'प्राथमिकता बदली गई' : 'OVERRIDE'}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedHotspotId(hotspot.id);
                      setActiveView('map');
                    }}
                    className="text-sm font-semibold text-[#111317] dark:text-[#F4F4F6] hover:underline text-left mt-0.5"
                  >
                    {getHotspotDisplayName(hotspot, lang)}
                  </button>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
                    {getCauseAnalysis(hotspot.causeAnalysis, lang)} · JE: {hotspot.contacts.je.name} ({crew.name})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${hotspot.contacts.je.phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E6E7EC] dark:border-[#282C36] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] whitespace-nowrap"
                >
                  <Phone size={12} />
                  {lang === 'hi' ? 'JE को कॉल' : 'Call JE'}
                </a>
                <a
                  href={`https://wa.me/91${hotspot.contacts.je.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `SAHIBI Dispatch [Ward ${hotspot.wardNo}] ${hotspot.name}: Risk ${tel.riskPct}%. Please deploy pump/desilt crew.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
                >
                  <MessageCircle size={12} />
                  WA
                </a>
                {dispatch?.status !== 'done' && (
                  <>
                    <button
                      onClick={() => deployPumpToHotspot(hotspot.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] whitespace-nowrap"
                    >
                      <Truck size={12} />
                      {t('cmd.deploy_pump', lang)}
                    </button>
                    <button
                      onClick={() => markHotspotCleared(hotspot.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 whitespace-nowrap"
                    >
                      <CheckCircle2 size={12} />
                      {lang === 'hi' ? 'साफ' : 'Clear'}
                    </button>
                    <button
                      onClick={() => escalateHotspotSla(hotspot.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-300 dark:border-amber-700/70 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 whitespace-nowrap"
                    >
                      <Clock size={12} />
                      {lang === 'hi' ? 'एस्केलेट' : 'Escalate'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setOverrideTarget({
                      hotspotId: hotspot.id,
                      name: getHotspotDisplayName(hotspot, lang),
                      currentRank: rank,
                    });
                    setNewRankInput('1');
                    setOverrideReason('');
                    setConfirmChecked(false);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E6E7EC] dark:border-[#282C36] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] whitespace-nowrap"
                >
                  <ArrowUpDown size={12} />
                  {t('cmd.override_rank', lang)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Justification Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 bg-[#111317]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111317] dark:text-[#F4F4F6]">
                {lang === 'hi' ? 'प्राथमिकता बदलें' : 'Override Priority'} — {overrideTarget.name}
              </h3>
              <button
                onClick={() => setOverrideTarget(null)}
                className="p-1.5 rounded-full text-[#6B7280] hover:text-[#111317] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-slate-400 mb-1">
                {lang === 'hi'
                  ? `नया क्रम (वर्तमान #${overrideTarget.currentRank})`
                  : `New Rank (Current #${overrideTarget.currentRank})`}
              </label>
              <input
                type="number"
                min={1}
                max={153}
                value={newRankInput}
                onChange={(e) => setNewRankInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-slate-400 mb-1">
                {lang === 'hi' ? 'अनिवार्य ऑडिट कारण' : 'Mandatory Audit Reason'}
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'जैसे: अस्पताल एम्बुलेंस मार्ग बाधित; आयुक्त निर्देश...'
                    : 'e.g. Hospital ambulance route blocked; Commissioner field directive...'
                }
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] resize-none"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#4B5563] dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="accent-[#0D2621] dark:accent-[#F4F4F6]"
              />
              <span>
                {lang === 'hi'
                  ? 'मैं स्वीकार करता हूँ कि यह बदलाव स्थायी रूप से ऑडिट लॉग में दर्ज होगा'
                  : 'I acknowledge this override is permanently logged in the Audit Trail'}
              </span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOverrideTarget(null)}
                className="flex-1 py-2.5 rounded-full border border-[#E6E7EC] dark:border-[#282C36] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={!overrideReason.trim() || !confirmChecked}
                className="flex-1 py-2.5 rounded-full bg-amber-600 text-white text-xs font-semibold disabled:opacity-50"
              >
                {lang === 'hi' ? 'बदलाव दर्ज करें' : 'Log Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SensorHealthView() {
  const { lang, sensors, setSensorStatus, setActiveView } = useStore();
  const onlineCount = sensors.filter((s) => s.status === 'online').length;
  const offlineCount = sensors.filter((s) => s.status === 'offline').length;
  const uptime = Math.round((onlineCount / sensors.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Wifi size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'hi'
                ? 'नाला एवं वर्षा सेंसर टेलीमेट्री स्थिति'
                : 'Drain & Rain Sensor Telemetry Health'}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5 font-mono tabular-nums">
              {lang === 'hi'
                ? `नेटवर्क अपटाइम: ${uptime}% · ${sensors.length} में से ${offlineCount} नोड ऑफ़लाइन`
                : `Network Uptime: ${uptime}% · ${offlineCount} of ${sensors.length} nodes offline`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] transition-colors"
        >
          <ArrowLeft size={13} />
          {lang === 'hi' ? 'मानचित्र' : 'Map'}
        </button>
      </div>

      <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
        <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] mb-3">
          {lang === 'hi'
            ? 'ऑफ़लाइन सेंसर घटनाएँ (पिछले 7 दिन)'
            : 'Offline Sensor Incidents (Last 7 Days)'}
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sensorOfflineHistory}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="offline" radius={[4, 4, 0, 0]}>
                {sensorOfflineHistory.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.offline > 2 ? '#ef4444' : entry.offline > 0 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#EAECEF] dark:border-[#242832] text-[#6B7280] dark:text-slate-400 bg-[#FAFAFB] dark:bg-[#121418]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">{lang === 'hi' ? 'नोड' : 'Node'}</th>
                <th className="text-left px-4 py-3 font-semibold">
                  {lang === 'hi' ? 'MCG हॉटस्पॉट' : 'MCG Hotspot'}
                </th>
                <th className="text-left px-4 py-3 font-semibold">{lang === 'hi' ? 'प्रकार' : 'Type'}</th>
                <th className="text-left px-4 py-3 font-semibold">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-semibold">{lang === 'hi' ? 'रीडिंग' : 'Reading'}</th>
                <th className="text-right px-4 py-3 font-semibold">{lang === 'hi' ? 'बैटरी' : 'Battery'}</th>
                <th className="text-right px-4 py-3 font-semibold">{lang === 'hi' ? 'कार्रवाई' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] dark:divide-[#242832]">
              {sensors.map((sensor) => {
                const h = mcgHotspots.find((x) => x.id === sensor.hotspot_id);
                return (
                  <tr key={sensor.id} className="hover:bg-[#FAFAFB] dark:hover:bg-[#1B1E25]">
                    <td className="px-4 py-3 font-mono font-semibold text-[#111317] dark:text-[#F4F4F6]">
                      {sensor.id}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563] dark:text-slate-300">
                      {h ? getHotspotDisplayName(h, lang) : sensor.hotspot_id}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] dark:text-slate-400 capitalize">
                      {sensor.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-medium capitalize ${
                          sensor.status === 'online'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : sensor.status === 'offline'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {sensor.status === 'online' ? (
                          <Wifi size={12} />
                        ) : sensor.status === 'offline' ? (
                          <WifiOff size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {lang === 'hi'
                          ? sensor.status === 'online'
                            ? 'ऑनलाइन'
                            : sensor.status === 'offline'
                              ? 'ऑफ़लाइन'
                              : 'चेतावनी'
                          : sensor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#4B5563] dark:text-slate-300">
                      {sensor.last_reading !== null
                        ? `${sensor.last_reading} ${lang === 'hi' ? 'सेमी' : 'cm'}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#4B5563] dark:text-slate-300">
                      {sensor.battery_pct}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sensor.status !== 'offline' ? (
                        <button
                          onClick={() => setSensorStatus(sensor.id, 'offline')}
                          className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                        >
                          {lang === 'hi' ? 'ऑफ़लाइन चिह्नित करें' : 'Flag Offline'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSensorStatus(sensor.id, 'online')}
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                        >
                          {lang === 'hi' ? 'बहाल करें' : 'Restore'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AuditLogView() {
  const { lang, auditLog, setActiveView } = useStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? auditLog : auditLog.filter((e) => e.action === filter);

  const handleExport = () => {
    const header = ['Timestamp', 'Actor', 'Action', 'Hotspot', 'OriginalRank', 'NewRank', 'Reason'];
    const rows = filtered.map((e) => [
      e.timestamp,
      e.actor,
      e.action,
      e.hotspot_id,
      e.original_rank !== null ? String(e.original_rank) : '',
      e.new_rank !== null ? String(e.new_rank) : '',
      e.reason || '',
    ]);
    exportToCsv('sahibi-audit-trail.csv', [header, ...rows]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <FileText size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'hi' ? 'प्रशासन और ओवरराइड ऑडिट स्ट्रीम' : 'Governance & Override Audit Stream'}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              {t('cmd.audit_banner', lang)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <Download size={13} />
            {lang === 'hi' ? 'CSV डाउनलोड' : 'Export CSV'}
          </button>
          <button
            onClick={() => setActiveView('map')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] transition-colors"
          >
            <ArrowLeft size={13} />
            {lang === 'hi' ? 'मानचित्र' : 'Map'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: lang === 'hi' ? 'सभी घटनाएँ' : 'All Events' },
          { id: 'manual_override', label: lang === 'hi' ? 'प्राथमिकता बदलाव' : 'Overrides' },
          { id: 'sla_escalated', label: lang === 'hi' ? 'SLA एस्केलेशन' : 'SLA Escalations' },
          { id: 'citizen_report_triaged', label: lang === 'hi' ? 'AI नागरिक रिपोर्ट' : 'AI Citizen Reports' },
          { id: 'action_completed', label: lang === 'hi' ? 'साफ किया गया' : 'Cleared' },
          { id: 'sensor_flagged', label: lang === 'hi' ? 'सेंसर और बाधाएं' : 'Sensor & Blockers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === tab.id
                ? 'bg-[#0D2621] dark:bg-[#F4F4F6] text-white dark:text-[#111317]'
                : 'border border-[#EAECEF] dark:border-[#282C36] bg-white dark:bg-[#16191F] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map((entry) => {
          const h = mcgHotspots.find((x) => x.id === entry.hotspot_id);
          return (
            <div
              key={entry.id}
              className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#6B7280] dark:text-slate-400">
                  <span className="font-semibold text-[#111317] dark:text-[#F4F4F6] uppercase">
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                  <span>·</span>
                  <span>{entry.actor}</span>
                  {entry.new_rank !== null && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {lang === 'hi' ? `क्रम #${entry.new_rank}` : `Rank #${entry.new_rank}`}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#111317] dark:text-[#F4F4F6]">
                  {h
                    ? `${getHotspotDisplayName(h, lang)} (${formatWardLabel(h.wardNo, lang)})`
                    : localizeLocationName(entry.hotspot_id, lang)}
                </p>
                {entry.reason && (
                  <p className="text-xs text-[#4B5563] dark:text-slate-300">{entry.reason}</p>
                )}
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[#9CA3AF] shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] text-xs text-[#6B7280] dark:text-slate-400">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            {lang === 'hi' ? 'इस फ़िल्टर के लिए कोई ऑडिट रिकॉर्ड नहीं मिला।' : 'No audit records match this filter.'}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExecutiveBriefView() {
  const {
    lang,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
    auditLog,
    aiBriefing,
    aiBriefingLoading,
    generateAiBriefing,
    setActiveView,
  } = useStore();

  const summary = useMemo(() => {
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

    const critical = scored.filter((s) => s.tel.tier === 'critical').length;
    const high = scored.filter((s) => s.tel.tier === 'high').length;
    const popExposed = scored
      .filter((s) => s.tel.riskPct >= 55)
      .reduce((acc, s) => acc + s.hotspot.populationExposure, 0);
    const overrides = auditLog.filter((a) => a.action === 'manual_override').length;

    const byZone = ([1, 2, 3, 4] as const).map((z) => {
      const zoneItems = scored.filter((s) => s.hotspot.zone === z);
      return {
        zone: lang === 'hi' ? `ज़ोन ${z}` : `Zone ${z}`,
        total: zoneItems.length,
        critical: zoneItems.filter((s) => s.tel.tier === 'critical').length,
        high: zoneItems.filter((s) => s.tel.tier === 'high').length,
      };
    });

    return { critical, high, popExposed, overrides, byZone };
  }, [rainfallMm, timelineHourOffset, pumpMitigationActive, sensors, floodReports, dispatchRecords, auditLog, lang]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'hi'
                ? 'आयुक्त और कमांड प्राधिकरण सारांश'
                : 'Commissioner & Command Authority Brief'}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              {lang === 'hi'
                ? '153 MCG हॉटस्पॉट · 36 वार्ड · 4 नगर निगम ज़ोन · मानसून रणनीति संश्लेषण'
                : '153 MCG Hotspots · 36 Wards · 4 Municipal Zones · Monsoon Tactical Synthesis'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAiBriefing}
            disabled={aiBriefingLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {aiBriefingLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>{t('cmd.generate_briefing', lang)}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <Printer size={13} />
            {lang === 'hi' ? 'प्रिंट' : 'Print'}
          </button>
          <button
            onClick={() => setActiveView('map')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <ArrowLeft size={13} />
            {lang === 'hi' ? 'मानचित्र' : 'Map'}
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? 'गंभीर / अधिक जोखिम' : 'Critical / High Risk'}
          </p>
          <p className="text-2xl font-mono font-bold tabular-nums text-red-600 dark:text-red-400 mt-1">
            {summary.critical} <span className="text-sm text-amber-500">/ {summary.high}</span>
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
            {lang === 'hi' ? `${mcgHotspots.length} MCG बिंदुओं में से` : `of ${mcgHotspots.length} MCG points`}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? 'प्रभावित आबादी' : 'Exposed Population'}
          </p>
          <p className="text-2xl font-mono font-bold tabular-nums text-[#111317] dark:text-[#F4F4F6] mt-1">
            {(summary.popExposed / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
            {summary.popExposed.toLocaleString()} {lang === 'hi' ? 'निवासी' : 'residents'}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? 'मॉडल सटीकता' : 'Model Accuracy'}
          </p>
          <p className="text-2xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {calibrationData.accuracy_pct}%
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
            {calibrationData.alerts_verified_correct}/{calibrationData.alerts_issued}{' '}
            {lang === 'hi' ? 'अलर्ट सत्यापित' : 'alerts verified'}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? 'मैनुअल बदलाव' : 'Manual Overrides'}
          </p>
          <p className="text-2xl font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {summary.overrides}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
            {lang === 'hi' ? '100% कारण ऑडिट में दर्ज' : '100% justification logged'}
          </p>
        </div>
      </div>

      {/* Tactical Briefing Card */}
      <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111317] dark:text-[#F4F4F6]">
            <Sparkles size={16} className="text-[#111317] dark:text-[#F4F4F6]" />
            <span>{lang === 'hi' ? 'मानसून कमांड ब्रीफिंग' : 'Monsoon Command Briefing'}</span>
          </div>
          {aiBriefing && (
            <span className="text-[11px] font-mono text-[#9CA3AF]">
              {new Date(aiBriefing.generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {aiBriefing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-[#111317] dark:text-[#F4F4F6]">
                {aiBriefing.headline}
              </p>
              <p className="text-xs text-[#4B5563] dark:text-slate-300 mt-1 leading-relaxed">
                {aiBriefing.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6]">
                  {lang === 'hi' ? 'प्राथमिकता वाले वार्ड निर्देश' : 'Priority Ward Directives'}
                </p>
                {aiBriefing.priorityWards.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#1B1E25] text-xs"
                  >
                    <p className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
                      {w.wardLabel} · {w.officerToAlert}
                    </p>
                    <p className="text-[#6B7280] dark:text-slate-400 mt-0.5">{w.actionDirective}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] mb-1.5">
                    {lang === 'hi'
                      ? 'अंतर-एजेंसी समन्वय (MCG / GMDA / NHAI)'
                      : 'Inter-Agency Coordination (MCG / GMDA / NHAI)'}
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#4B5563] dark:text-slate-300">
                    {aiBriefing.interAgencyDirectives.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[#111317] dark:text-[#F4F4F6]">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#1B1E25] text-xs">
                  <p className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
                    {lang === 'hi' ? 'पंप पुनर्वितरण रणनीति' : 'Pump Reallocation Strategy'}
                  </p>
                  <p className="text-[#6B7280] dark:text-slate-400 mt-0.5">
                    {aiBriefing.pumpReallocationAdvice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {lang === 'hi' ? (
              <>
                लाइव वर्षा डेटा, संवेदनशील MCG वार्ड और हाल की नागरिक रिपोर्ट से कार्य योजना बनाने के लिए{' '}
                <strong>{t('cmd.generate_briefing', lang)}</strong> पर क्लिक करें।
              </>
            ) : (
              <>
                Click <strong>{t('cmd.generate_briefing', lang)}</strong> to synthesize live rainfall telemetry, top vulnerable MCG wards, and recent citizen reports into an actionable command memo.
              </>
            )}
          </p>
        )}
      </div>

      {/* Zone Pressure Chart */}
      <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] mb-3">
          <TrendingUp size={15} className="text-[#111317] dark:text-[#F4F4F6]" />
          <span>
            {lang === 'hi'
              ? 'MCG ज़ोन-वार गंभीर और उच्च जलभराव दबाव (ज़ोन 1–4)'
              : 'MCG Zone-Wise Critical & High Flood Pressure (Zones 1–4)'}
          </span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.byZone}>
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="critical"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name={lang === 'hi' ? 'गंभीर' : 'Critical'}
              />
              <Bar
                dataKey="high"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name={lang === 'hi' ? 'अधिक' : 'High'}
              />
              <Bar
                dataKey="total"
                fill="#0D2621"
                radius={[4, 4, 0, 0]}
                name={lang === 'hi' ? 'कुल हॉटस्पॉट' : 'Total Hotspots'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
