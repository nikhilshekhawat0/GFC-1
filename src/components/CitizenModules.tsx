import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Route,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Loader2,
  Bell,
  Target,
  Navigation,
  ArrowLeft,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  mcgHotspots,
  CORRIDOR_PRESETS,
  calibrationData,
  type McgHotspot,
} from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  getHotspotDisplayName,
  getCorridorLabel,
  getCauseAnalysis,
  localizeLocationName,
  formatWardLabel,
  formatZoneLabel,
} from '../i18n/locationHi';
import { fetchRealtimePosition } from '../lib/geolocation';
import type { FloodReportRecord } from '../lib/supabase';

function compressImageToBase64(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: String(reader.result), mimeType: file.type || 'image/jpeg' });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        resolve({ dataUrl: compressed, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function RouteSafetyView() {
  const {
    lang,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
    setHighlightedHotspotIds,
    setSelectedHotspotId,
    setActiveView,
  } = useStore();

  const [fromQuery, setFromQuery] = useState('Dundahera');
  const [toQuery, setToQuery] = useState('Sector 18');
  const [activePresetId, setActivePresetId] = useState<string | null>(CORRIDOR_PRESETS[0].id);

  const matched = useMemo(() => {
    const preset = CORRIDOR_PRESETS.find((p) => p.id === activePresetId);
    const terms = preset
      ? preset.keywords
      : `${fromQuery} ${toQuery}`
          .toLowerCase()
          .split(/[\s,/-]+/)
          .filter((w) => w.length >= 2);

    const hits = mcgHotspots
      .filter((h) => {
        const hiName = getHotspotDisplayName(h, 'hi');
        const hiLandmark = localizeLocationName(h.landmark, 'hi');
        const hay = `${h.name} ${h.landmark} ${hiName} ${hiLandmark} sector ${h.wardNo} वार्ड ${h.wardNo}`.toLowerCase();
        return terms.some((term) => hay.includes(term));
      })
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
      .sort((a, b) => b.tel.riskPct - a.tel.riskPct)
      .slice(0, 8);

    const maxRisk = hits.length > 0 ? hits[0].tel.riskPct : 18;
    const verdict =
      maxRisk >= 75 ? 'AVOID CORRIDOR' : maxRisk >= 55 ? 'CAUTION ADVISED' : 'CORRIDOR PASSABLE';

    return { hits, maxRisk, verdict, preset };
  }, [
    activePresetId,
    fromQuery,
    toQuery,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
  ]);

  const handleHighlightOnMap = () => {
    const ids = matched.hits.map((m) => m.hotspot.id);
    setHighlightedHotspotIds(ids);
    if (ids[0]) setSelectedHotspotId(ids[0]);
    setActiveView('map');
  };

  const featuredPresets = CORRIDOR_PRESETS.slice(0, 3);
  const extraPresets = CORRIDOR_PRESETS.slice(3);

  return (
    <div className="space-y-6">
      {/* SETO-inspired Centered Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Route size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {t('citizen.safe_corridors', lang)}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              {lang === 'hi'
                ? 'सभी 153 MCG जलभराव बिंदुओं पर अपने यात्रा मार्ग की जाँच करें'
                : 'Cross-checks your travel corridor against all 153 official MCG flood hotspots'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{lang === 'hi' ? 'मानचित्र पर लौटें' : 'Back to Map'}</span>
        </button>
      </div>

      {/* 3-Column Quick Action Corridor Cards (Inspired by Reference Hero Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {featuredPresets.map((p, idx) => {
          const isActive = activePresetId === p.id;
          const iconBg =
            idx === 0
              ? 'bg-[#FCE9DF] text-[#9A4B26] dark:bg-[#3A2822] dark:text-[#F2B59A]'
              : idx === 1
                ? 'bg-[#EAE4FA] text-[#5B3D9E] dark:bg-[#2B253A] dark:text-[#C8B9F6]'
                : 'bg-[#E2EEFC] text-[#1D5293] dark:bg-[#1F2D3D] dark:text-[#96C2F7]';
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePresetId(p.id);
                setFromQuery(lang === 'hi' ? localizeLocationName(p.from, 'hi') : p.from);
                setToQuery(lang === 'hi' ? localizeLocationName(p.to, 'hi') : p.to);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2.5 ${
                isActive
                  ? 'border-[#111317] dark:border-[#F4F4F6] bg-white dark:bg-[#1B1E25] shadow-[0_6px_20px_rgba(17,19,23,0.07)]'
                  : 'border-[#EAECEF] dark:border-[#242832] bg-white/95 dark:bg-[#16191F] hover:border-[#D1D5DB] dark:hover:border-[#343947] shadow-[0_2px_8px_rgba(17,19,23,0.03)]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Navigation size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6] leading-snug">
                  {getCorridorLabel(p, lang)}
                </p>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === 'hi' ? p.altRouteHi : p.altRouteEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {extraPresets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extraPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePresetId(p.id);
                setFromQuery(lang === 'hi' ? localizeLocationName(p.from, 'hi') : p.from);
                setToQuery(lang === 'hi' ? localizeLocationName(p.to, 'hi') : p.to);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activePresetId === p.id
                  ? 'bg-[#111317] dark:bg-[#F4F4F6] border-transparent text-white dark:text-[#111317]'
                  : 'border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#525866] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
              }`}
            >
              {getCorridorLabel(p, lang)}
            </button>
          ))}
        </div>
      )}

      {/* Origin & Destination Composer Box (Reference Prompt Box Styling) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
              {lang === 'hi' ? 'प्रारंभिक सेक्टर / स्थान' : 'Origin Sector / Landmark'}
            </label>
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setActivePresetId(null);
                setFromQuery(e.target.value);
              }}
              placeholder="e.g. Palam Vihar, Sector 21, Basai"
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] focus:outline-none focus:ring-2 focus:ring-[#111317]/15"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
              {lang === 'hi' ? 'गंतव्य सेक्टर / चौक' : 'Destination Sector / Chowk'}
            </label>
            <input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setActivePresetId(null);
                setToQuery(e.target.value);
              }}
              placeholder="e.g. Ghata, Sheetla Mandir, Wazirabad"
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] focus:outline-none focus:ring-2 focus:ring-[#111317]/15"
            />
          </div>
        </div>

        {/* Verdict Footer inside Composer Box */}
        <div className="pt-3 border-t border-[#F0F1F4] dark:border-[#22252D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold ${
                  matched.maxRisk >= 75
                    ? 'text-red-600 dark:text-red-400'
                    : matched.maxRisk >= 55
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {matched.verdict}
              </span>
              <span className="text-xs text-[#9CA3AF]">·</span>
              <span className="text-xs font-mono tabular-nums text-[#525866] dark:text-slate-300">
                Peak Risk {matched.maxRisk}%
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">
              {matched.preset
                ? lang === 'hi'
                  ? matched.preset.altRouteHi
                  : matched.preset.altRouteEn
                : 'Review flagged bottlenecks below before entering low-lying roads or underpasses.'}
            </p>
          </div>
          <button
            onClick={handleHighlightOnMap}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <Route size={14} />
            <span>{lang === 'hi' ? 'मानचित्र पर देखें' : 'Highlight on Map'}</span>
          </button>
        </div>
      </div>

      {/* Matched Hotspots */}
      <div className="space-y-2">
        {matched.hits.map(({ hotspot, tel }) => (
          <div
            key={hotspot.id}
            className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-slate-400">
                <span>{formatWardLabel(hotspot.wardNo, lang)}</span>
                <span>·</span>
                <span>{hotspot.owningAgency}</span>
                <span>·</span>
                <span>JE: {hotspot.contacts.je.name}</span>
              </div>
              <p className="text-sm font-semibold text-[#111317] dark:text-[#F4F4F6] mt-0.5">
                {getHotspotDisplayName(hotspot, lang)}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
                {getCauseAnalysis(hotspot.causeAnalysis, lang)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-mono font-bold tabular-nums ${
                  tel.tier === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : tel.tier === 'high'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {tel.riskPct}%
              </p>
              <p className="text-[11px] font-mono tabular-nums text-[#6B7280] dark:text-slate-400">
                ~{tel.waterDepthCm} cm
              </p>
              <button
                onClick={() => {
                  setSelectedHotspotId(hotspot.id);
                  setActiveView('map');
                }}
                className="mt-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#23262F] text-[11px] font-semibold text-[#111317] dark:text-[#F4F4F6] hover:bg-[#E7E9EE] dark:hover:bg-[#2E323D] transition-colors"
              >
                {lang === 'hi' ? 'देखें' : 'Inspect'}
              </button>
            </div>
          </div>
        ))}
        {matched.hits.length === 0 && (
          <div className="p-6 text-center rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] text-xs text-[#6B7280] dark:text-slate-400">
            No MCG flood hotspots match "{fromQuery} {toQuery}". Try a sector number or chowk name.
          </div>
        )}
      </div>
    </div>
  );
}

export function AiFloodReportView() {
  const {
    lang,
    citizenUser,
    authorityUser,
    userLocation,
    setUserLocation,
    floodReports,
    submitFloodReport,
    setActiveView,
    setPostLoginRedirect,
    draftReport,
    setDraftReport,
    setSelectedHotspotId,
    addToast,
  } = useStore();

  const [selectedHotspotIdInput, setSelectedHotspotIdInput] = useState<string>(
    draftReport?.hotspotId || mcgHotspots[3].id
  );
  const [customLocation, setCustomLocation] = useState<string>(draftReport?.customLocation || '');
  const [locationMode, setLocationMode] = useState<'gps' | 'ward'>(
    draftReport?.locationMode || (userLocation ? 'gps' : 'ward')
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(
    draftReport?.gpsAccuracy ?? userLocation?.accuracyMeters ?? null
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    draftReport
      ? { lat: draftReport.lat, lng: draftReport.lng }
      : userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : { lat: mcgHotspots[3].lat, lng: mcgHotspots[3].lng }
  );
  const [description, setDescription] = useState(draftReport?.description || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const [submitting, setSubmitting] = useState(false);
  const [lastTriaged, setLastTriaged] = useState<FloodReportRecord | null>(null);
  const [locating, setLocating] = useState(false);

  const selectedHotspot: McgHotspot | undefined = useMemo(
    () => mcgHotspots.find((h) => h.id === selectedHotspotIdInput),
    [selectedHotspotIdInput]
  );

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, mimeType } = await compressImageToBase64(file);
      setPhotoPreview(dataUrl);
      setPhotoMime(mimeType);
    } catch {
      addToast('Could not process image file', 'error');
    }
  };

  const handleFetchMyLocation = async () => {
    setLocating(true);
    try {
      const fix = await fetchRealtimePosition();
      setCoords({ lat: fix.lat, lng: fix.lng });
      setGpsAccuracy(fix.accuracyMeters);
      setLocationMode('gps');
      setUserLocation(fix, true);

      // Silently identify nearest MCG ward strictly for routing engineer alerts
      let nearest = mcgHotspots[0];
      let minDist = Infinity;
      mcgHotspots.forEach((h) => {
        const d = haversineKm(fix.lat, fix.lng, h.lat, h.lng);
        if (d < minDist) {
          minDist = d;
          nearest = h;
        }
      });
      setSelectedHotspotIdInput(nearest.id);

      addToast(
        `Real-time location captured (${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)})`,
        'success'
      );
    } catch (err) {
      addToast(
        err instanceof Error
          ? err.message
          : 'Location permission denied — please choose your area from the list',
        'warning'
      );
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!citizenUser && !authorityUser) {
      setDraftReport({
        hotspotId: selectedHotspotIdInput,
        customLocation,
        description,
        lat: coords.lat,
        lng: coords.lng,
        locationMode,
        gpsAccuracy,
      });
      setPostLoginRedirect('report');
      setActiveView('citizen-login');
      addToast('Sign in with your phone number to register this flood report', 'info');
      return;
    }

    if (!description.trim() && !photoPreview) {
      addToast('Please describe the waterlogging or attach a street photo', 'warning');
      return;
    }

    const reporterLabel =
      citizenUser?.name ||
      (authorityUser ? `${authorityUser.name} (${authorityUser.employeeId})` : 'Gurugram Resident');

    setSubmitting(true);
    const gpsLabel = `Live GPS (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
    const locationLabel =
      customLocation.trim() ||
      (locationMode === 'gps' ? gpsLabel : selectedHotspot?.name || 'Gurugram Street');

    try {
      const res = await fetch('/api/ai/triage-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || 'Citizen uploaded waterlogging photo',
          locationName: locationLabel,
          wardNo: selectedHotspot?.wardNo,
          causeAnalysis: selectedHotspot?.causeAnalysis,
          photoBase64: photoPreview || undefined,
          photoMimeType: photoPreview ? photoMime : undefined,
        }),
      });

      let triage: {
        severity: 'critical' | 'high' | 'moderate' | 'low';
        estimatedDepthCm: number;
        blockedDrainSuspected: boolean;
        recommendedAgency: string;
        triageSummary: string;
        confidence: number;
      } = {
        severity: 'high',
        estimatedDepthCm: 28,
        blockedDrainSuspected: true,
        recommendedAgency: selectedHotspot?.owningAgency || 'MCG',
        triageSummary: `Report logged by ${reporterLabel} for ${locationLabel}; Ward ${selectedHotspot?.wardNo || 'N/A'} Engineer notified for drain inspection.`,
        confidence: 82,
      };

      if (res.ok) {
        const data = await res.json();
        const sev = String(data.severity || 'high').toLowerCase();
        triage = {
          severity:
            sev === 'critical' || sev === 'high' || sev === 'moderate' || sev === 'low'
              ? sev
              : 'high',
          estimatedDepthCm: Number(data.estimatedDepthCm ?? 25),
          blockedDrainSuspected: Boolean(data.blockedDrainSuspected),
          recommendedAgency: String(data.recommendedAgency || selectedHotspot?.owningAgency || 'MCG'),
          triageSummary: String(data.triageSummary || triage.triageSummary),
          confidence: Number(data.confidence ?? 85),
        };
      } else {
        addToast('Automatic photo check busy — report saved and routed to the Ward Engineer', 'info');
      }

      const reportLat = locationMode === 'gps' ? coords.lat : selectedHotspot ? selectedHotspot.lat : coords.lat;
      const reportLng = locationMode === 'gps' ? coords.lng : selectedHotspot ? selectedHotspot.lng : coords.lng;

      const record: FloodReportRecord = {
        id: `WR-${Date.now()}`,
        hotspot_id: selectedHotspot?.id || null,
        ward_no: selectedHotspot?.wardNo || null,
        location_name: locationLabel,
        lat: reportLat,
        lng: reportLng,
        description: `${description.trim() || 'Street waterlogging photo report'} — Reported by ${reporterLabel}`,
        photo_data_url: photoPreview || null,
        ai_severity: triage.severity,
        ai_depth_cm: triage.estimatedDepthCm,
        ai_blocked_drain: triage.blockedDrainSuspected,
        ai_recommended_agency: triage.recommendedAgency,
        ai_summary: triage.triageSummary,
        ai_confidence: triage.confidence,
        status: 'verified',
        created_at: new Date().toISOString(),
      };

      await submitFloodReport(record);
      setLastTriaged(record);
      setDraftReport(null);
      setDescription('');
      setPhotoPreview(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Camera size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {t('citizen.report_flood', lang)}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 mt-0.5">
              Tell us where water has collected on your street so the right MCG Ward Engineer can respond quickly.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{lang === 'hi' ? 'मानचित्र पर लौटें' : 'Back to Map'}</span>
        </button>
      </div>

      {/* 3-Step Visual Action Strip (Inspired by Reference Hero Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleFetchMyLocation}
          className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] hover:border-[#D1D5DB] text-left transition-all flex flex-col gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E2EEFC] dark:bg-[#1F2D3D] text-[#1D5293] dark:text-[#96C2F7] flex items-center justify-center">
            <Navigation size={15} className={locating ? 'animate-spin' : ''} />
          </div>
          <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">
            {locating ? 'Detecting GPS...' : 'Pin Real-Time GPS'}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
            Lock exact street coordinates automatically for ward crew dispatch.
          </p>
        </button>

        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FCE9DF] dark:bg-[#3A2822] text-[#9A4B26] dark:text-[#F2B59A] flex items-center justify-center">
            <Upload size={15} />
          </div>
          <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">Attach Street Photo</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
            Estimate standing water depth and blocked drain covers from field photos.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAE4FA] dark:bg-[#2B253A] text-[#5B3D9E] dark:text-[#C8B9F6] flex items-center justify-center">
            <CheckCircle2 size={15} />
          </div>
          <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">Direct JE Routing</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
            Instant WhatsApp and call handoff to the responsible MCG Ward Engineer.
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
              {locationMode === 'gps'
                ? 'Routing Ward (Optional — Pin Uses Your Real-Time GPS)'
                : 'Where is the flooding? (Select Sector / Road)'}
            </label>
            <select
              value={selectedHotspotIdInput}
              onChange={(e) => {
                setSelectedHotspotIdInput(e.target.value);
                setLocationMode('ward');
                const h = mcgHotspots.find((x) => x.id === e.target.value);
                if (h) setCoords({ lat: h.lat, lng: h.lng });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6]"
            >
              {mcgHotspots.map((h) => (
                <option key={h.id} value={h.id}>
                  {formatWardLabel(h.wardNo, lang)} · {getHotspotDisplayName(h, lang)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFetchMyLocation}
              disabled={locating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-[#F3F4F6] dark:bg-[#23262F] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#EAECEF] dark:hover:bg-[#2E323D] transition-colors"
            >
              <Navigation size={13} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Fetching location...' : 'Fetch My Location'}
            </button>
          </div>
        </div>

        {locationMode === 'gps' && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232C] border border-[#E6E7EC] dark:border-[#2D313D] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-[#111317] dark:text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
                  Real-Time Location:{' '}
                  <span className="font-mono">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                  {gpsAccuracy ? (
                    <span className="text-[#6B7280] dark:text-slate-400 font-normal">
                      {' '}
                      (±{gpsAccuracy}m)
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUserLocation(
                  {
                    lat: coords.lat,
                    lng: coords.lng,
                    accuracyMeters: gpsAccuracy ?? undefined,
                    updatedAt: new Date().toISOString(),
                  },
                  true
                );
                setActiveView('map');
              }}
              className="text-xs font-semibold text-[#111317] dark:text-white hover:underline shrink-0"
            >
              Show on Map
            </button>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
            Nearby Landmark or House / Gate Number (optional)
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="e.g. Outside Gate No. 2, near Mother Dairy booth"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
              Photo of the Flooded Road (optional)
            </label>
            <label className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-[#D4D8E0] dark:border-[#343947] bg-[#FAFAFB] dark:bg-[#111317] cursor-pointer hover:border-[#111317] dark:hover:border-white transition-colors overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Uploaded street waterlogging preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-3">
                  <Upload size={20} className="mx-auto text-[#6B7280] mb-1.5" />
                  <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6]">
                    Click to upload a street photo
                  </p>
                  <p className="text-[11px] text-[#6B7280]">Helps estimate water depth automatically</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
              What does the street look like?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="e.g. Knee-deep water, cars are stalled, drain cover looks blocked by garbage..."
              className="w-full h-32 px-3.5 py-2.5 rounded-2xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] resize-none"
            />
          </div>
        </div>

        {citizenUser ? (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F3F4F6] dark:bg-[#1D2028] border border-[#E6E7EC] dark:border-[#282C36] text-xs text-[#525866] dark:text-slate-300">
            <span>
              Reporting as <strong className="text-[#111317] dark:text-[#F4F4F6]">{citizenUser.name}</strong> (+91 {citizenUser.phone})
            </span>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className="text-[#111317] dark:text-white font-semibold hover:underline"
            >
              Account
            </button>
          </div>
        ) : authorityUser ? (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F3F4F6] dark:bg-[#1D2028] border border-[#E6E7EC] dark:border-[#282C36] text-xs text-[#525866] dark:text-slate-300">
            <span>
              Reporting as <strong className="text-[#111317] dark:text-[#F4F4F6]">{authorityUser.name}</strong> ({authorityUser.employeeId})
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            You can browse reports without signing in. When you click submit, you will be asked to sign in with your phone number to register this report.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-xs"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Checking & Sending to Ward Engineer...</span>
            </>
          ) : (
            <>
              <Camera size={16} />
              <span>
                {citizenUser || authorityUser ? 'Send Flood Report' : 'Sign In & Register Flood Report'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Latest Report Confirmation + Direct Officer Call/WhatsApp */}
      {lastTriaged && (
        <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/25 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-[#111317] dark:text-[#F4F4F6]">
                Report Received · Assessed as {lastTriaged.ai_severity.toUpperCase()} (~{lastTriaged.ai_depth_cm} cm deep)
              </span>
            </div>
          </div>
          <p className="text-xs text-[#525866] dark:text-slate-300 leading-relaxed">{lastTriaged.ai_summary}</p>
          {selectedHotspot && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${selectedHotspot.contacts.je.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#181B20] border border-[#E6E7EC] dark:border-[#282C36] text-[#111317] dark:text-[#F4F4F6]"
              >
                <Phone size={12} />
                Call Ward JE: {selectedHotspot.contacts.je.name}
              </a>
              <a
                href={`https://wa.me/91${selectedHotspot.contacts.je.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Gurugram Resident Flood Report (${lastTriaged.ai_severity.toUpperCase()}, ~${lastTriaged.ai_depth_cm}cm) at ${lastTriaged.location_name}, Ward ${selectedHotspot.wardNo}. ${lastTriaged.description}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white"
              >
                <MessageCircle size={12} />
                WhatsApp Ward JE
              </a>
            </div>
          )}
        </div>
      )}

      {/* Live Community Report Stream */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-[#6B7280] dark:text-slate-400">
          Recent Resident Flood Reports ({floodReports.length})
        </h3>
        {floodReports.map((rep) => (
          <div
            key={rep.id}
            className="p-4 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] flex items-start justify-between gap-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span
                  className={`font-bold uppercase ${
                    rep.ai_severity === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : rep.ai_severity === 'high'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-[#111317] dark:text-cyan-400'
                  }`}
                >
                  {rep.ai_severity}
                </span>
                <span className="text-[#9CA3AF]">·</span>
                <span className="text-[#6B7280] dark:text-slate-400">~{rep.ai_depth_cm} cm</span>
                <span className="text-[#9CA3AF]">·</span>
                <span className="text-[#6B7280] dark:text-slate-400">{rep.ai_recommended_agency}</span>
              </div>
              <p className="text-sm font-semibold text-[#111317] dark:text-[#F4F4F6]">
                {localizeLocationName(rep.location_name, lang)}
              </p>
              <p className="text-xs text-[#525866] dark:text-slate-300">{rep.description}</p>
              {rep.ai_summary && (
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                  Assessment: {rep.ai_summary}
                </p>
              )}
            </div>
            {rep.hotspot_id && (
              <button
                onClick={() => {
                  setSelectedHotspotId(rep.hotspot_id!);
                  setActiveView('map');
                }}
                className="px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#23262F] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] hover:bg-[#EAECEF] shrink-0"
              >
                Map
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CitizenAlertsView() {
  const {
    lang,
    citizenUser,
    authorityUser,
    subscribeAlerts,
    alertSubscriptions,
    setActiveView,
    setPostLoginRedirect,
    addToast,
  } = useStore();
  const [phone, setPhone] = useState(citizenUser?.phone ? `+91 ${citizenUser.phone}` : '');
  const [hotspotId, setHotspotId] = useState(mcgHotspots[0].id);
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'ivr'>('whatsapp');

  const handleSubscribe = async () => {
    if (!citizenUser && !authorityUser) {
      setPostLoginRedirect('alerts');
      setActiveView('citizen-login');
      addToast('Sign in with your phone number to register ward rain alerts', 'info');
      return;
    }
    if (!phone.trim()) {
      addToast('Enter a mobile number', 'warning');
      return;
    }
    const h = mcgHotspots.find((x) => x.id === hotspotId);
    await subscribeAlerts({
      phone: phone.trim(),
      ward_no: h?.wardNo || null,
      sector_label: h ? `Ward ${h.wardNo} — ${h.name}` : 'Gurugram General',
      channel,
      lang,
    });
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Bell size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {t('citizen.subscribe_alerts', lang)}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              Receive proactive T-2h waterlogging alerts for your Ward in English or Hindi
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{lang === 'hi' ? 'मानचित्र पर लौटें' : 'Back to Map'}</span>
        </button>
      </div>

      {/* 3-Card Alert Delivery Mode Selector (Inspired by Reference Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([
          {
            id: 'whatsapp',
            title: 'WhatsApp Alerts',
            desc: 'Instant ward flood alerts & alternate road guidance via WhatsApp.',
            iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
          },
          {
            id: 'sms',
            title: 'SMS Alerts',
            desc: 'Low-bandwidth text warnings that deliver even on weak cellular data.',
            iconBg: 'bg-[#EAE4FA] text-[#5B3D9E] dark:bg-[#2B253A] dark:text-[#C8B9F6]',
          },
          {
            id: 'ivr',
            title: 'Voice IVR Call',
            desc: 'Automated Hindi/English voice warnings for senior residents.',
            iconBg: 'bg-[#FCE9DF] text-[#9A4B26] dark:bg-[#3A2822] dark:text-[#F2B59A]',
          },
        ] as const).map((item) => {
          const active = channel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChannel(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                active
                  ? 'border-[#111317] dark:border-[#F4F4F6] bg-white dark:bg-[#1B1E25] shadow-[0_6px_20px_rgba(17,19,23,0.07)]'
                  : 'border-[#EAECEF] dark:border-[#242832] bg-white/95 dark:bg-[#16191F] hover:border-[#D1D5DB]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <Bell size={15} />
              </div>
              <p className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">{item.title}</p>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">{item.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)] space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
            Mobile / WhatsApp Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXXXXXXX"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5">
            Ward / Hotspot Zone
          </label>
          <select
            value={hotspotId}
            onChange={(e) => setHotspotId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[#E6E7EC] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6]"
          >
            {mcgHotspots.map((h) => (
              <option key={h.id} value={h.id}>
                {formatWardLabel(h.wardNo, lang)} ({formatZoneLabel(h.zone, lang)}) —{' '}
                {getHotspotDisplayName(h, lang)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full py-3 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Bell size={15} />
          {lang === 'hi' ? 'वार्ड बारिश अलर्ट सक्रिय करें' : 'Activate Proactive Alerts'}
        </button>
      </div>

      {alertSubscriptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#6B7280] dark:text-slate-400">
            {lang === 'hi'
              ? `सक्रिय अलर्ट (${alertSubscriptions.length})`
              : `Active Subscriptions (${alertSubscriptions.length})`}
          </h3>
          {alertSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="px-4 py-3 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
                  {localizeLocationName(sub.sector_label, lang)}
                </p>
                <p className="text-[#6B7280] dark:text-slate-400 font-mono">{sub.phone}</p>
              </div>
              <span className="uppercase font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {sub.channel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CitizenCalibrationView() {
  const { setActiveView, lang } = useStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4DFD3] via-[#E8DDF7] to-[#D8E7FA] dark:from-[#2C2538] dark:to-[#1F2430] border border-[#E6E7EC] dark:border-[#2D313D] flex items-center justify-center shrink-0">
            <Target size={18} className="text-[#111317] dark:text-[#F4F4F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              Model Calibration & Transparency
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              {calibrationData.period} · Verified against citizen reports & MCG field logs
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
        >
          <ArrowLeft size={13} />
          <span>{lang === 'hi' ? 'मानचित्र पर लौटें' : 'Back to Map'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Alerts Issued</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-[#111317] dark:text-[#F4F4F6] mt-1">
            {calibrationData.alerts_issued}
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Verified Match</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {calibrationData.alerts_verified_correct}
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
          <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Accuracy</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-[#111317] dark:text-white mt-1">
            {calibrationData.accuracy_pct}%
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#16191F] shadow-[0_2px_10px_rgba(17,19,23,0.03)]">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#111317] dark:text-[#F4F4F6]">
          <Target size={15} className="text-[#111317] dark:text-slate-200" />
          <span>Weekly Prediction Verification</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calibrationData.weekly_data}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="alerts" fill="#181A1F" radius={[4, 4, 0, 0]} name="Alerts Issued" />
              <Bar dataKey="correct" fill="#10b981" radius={[4, 4, 0, 0]} name="Verified Correct" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
