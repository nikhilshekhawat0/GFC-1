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
        const hay = `${h.name} ${h.landmark} sector ${h.wardNo}`.toLowerCase();
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('citizen.safe_corridors', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-checks your travel corridor against all 153 official MCG flood hotspots
          </p>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={13} />
          Back to Map
        </button>
      </div>

      {/* Quick Gurugram Corridors */}
      <div className="flex flex-wrap gap-2">
        {CORRIDOR_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePresetId(p.id);
              setFromQuery(p.from);
              setToQuery(p.to);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activePresetId === p.id
                ? 'bg-[#0B3D6B] dark:bg-blue-600 border-transparent text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Origin & Destination Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Origin Sector / Landmark
          </label>
          <input
            type="text"
            value={fromQuery}
            onChange={(e) => {
              setActivePresetId(null);
              setFromQuery(e.target.value);
            }}
            placeholder="e.g. Palam Vihar, Sector 21, Basai"
            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Destination Sector / Chowk
          </label>
          <input
            type="text"
            value={toQuery}
            onChange={(e) => {
              setActivePresetId(null);
              setToQuery(e.target.value);
            }}
            placeholder="e.g. Ghata, Sheetla Mandir, Wazirabad"
            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Verdict Summary */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-mono font-bold ${
                matched.maxRisk >= 75
                  ? 'text-red-600 dark:text-red-400'
                  : matched.maxRisk >= 55
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {matched.verdict}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              Peak Risk {matched.maxRisk}%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {matched.preset
              ? lang === 'hi'
                ? matched.preset.altRouteHi
                : matched.preset.altRouteEn
              : 'Review flagged bottlenecks below before entering low-lying roads or underpasses.'}
          </p>
        </div>
        <button
          onClick={handleHighlightOnMap}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3D6B] dark:bg-blue-600 text-white text-xs font-semibold whitespace-nowrap shrink-0 hover:opacity-95"
        >
          <Route size={14} />
          Highlight on Map
        </button>
      </div>

      {/* Matched Hotspots */}
      <div className="space-y-2">
        {matched.hits.map(({ hotspot, tel }) => (
          <div
            key={hotspot.id}
            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Ward {hotspot.wardNo}</span>
                <span>·</span>
                <span>{hotspot.owningAgency}</span>
                <span>·</span>
                <span>JE: {hotspot.contacts.je.name}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {hotspot.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {hotspot.causeAnalysis}
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
              <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                ~{tel.waterDepthCm} cm
              </p>
              <button
                onClick={() => {
                  setSelectedHotspotId(hotspot.id);
                  setActiveView('map');
                }}
                className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Inspect
              </button>
            </div>
          </div>
        ))}
        {matched.hits.length === 0 && (
          <div className="p-6 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
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
    signInCitizen,
    userLocation,
    setUserLocation,
    floodReports,
    submitFloodReport,
    setActiveView,
    setSelectedHotspotId,
    addToast,
  } = useStore();

  const [selectedHotspotIdInput, setSelectedHotspotIdInput] = useState<string>(mcgHotspots[3].id);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [locationMode, setLocationMode] = useState<'gps' | 'ward'>(userLocation ? 'gps' : 'ward');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(
    userLocation?.accuracyMeters ?? null
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: mcgHotspots[3].lat, lng: mcgHotspots[3].lng }
  );
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const [submitting, setSubmitting] = useState(false);
  const [lastTriaged, setLastTriaged] = useState<FloodReportRecord | null>(null);
  const [locating, setLocating] = useState(false);

  // Lazy citizen sign-up fields (only needed when submitting a report)
  const [residentPhone, setResidentPhone] = useState(citizenUser?.phone || '');
  const [residentAddress, setResidentAddress] = useState(citizenUser?.address || '');
  const [residentName, setResidentName] = useState(citizenUser?.name || '');

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
    if (!description.trim() && !photoPreview) {
      addToast('Please describe the waterlogging or attach a street photo', 'warning');
      return;
    }

    // Lazy resident sign-up check right when submitting a flood report
    let activeCitizen = citizenUser;
    if (!activeCitizen) {
      const digits = residentPhone.replace(/\D/g, '');
      if (digits.length < 10) {
        addToast('Please enter your 10-digit phone number below to send this report', 'warning');
        return;
      }
      if (residentAddress.trim().length < 5) {
        addToast('Please enter your quick Gurugram address below', 'warning');
        return;
      }
      const cleanPhone = digits.slice(-10);
      const cleanName = residentName.trim() || `Resident (${cleanPhone.slice(-4)})`;
      signInCitizen({
        name: cleanName,
        phone: cleanPhone,
        address: residentAddress.trim(),
        wardNo: selectedHotspot?.wardNo,
      });
      activeCitizen = {
        name: cleanName,
        phone: cleanPhone,
        address: residentAddress.trim(),
        wardNo: selectedHotspot?.wardNo,
        signedInAt: new Date().toISOString(),
      };
    }

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
        triageSummary: `Report logged by ${activeCitizen.name} for ${locationLabel}; Ward ${selectedHotspot?.wardNo || 'N/A'} Engineer notified for drain inspection.`,
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
        description: `${description.trim() || 'Street waterlogging photo report'} — Reported by ${activeCitizen.name}`,
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
      setDescription('');
      setPhotoPreview(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('citizen.report_flood', lang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Tell us where water has collected on your street so the right MCG Ward Engineer can respond quickly.
          </p>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={13} />
          Back to Map
        </button>
      </div>

      {/* Submission Form */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {mcgHotspots.map((h) => (
                <option key={h.id} value={h.id}>
                  Ward {h.wardNo} · {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFetchMyLocation}
              disabled={locating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-[#0B3D6B] dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Navigation size={13} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Fetching location...' : 'Fetch My Location'}
            </button>
          </div>
        </div>

        {locationMode === 'gps' && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/80 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Real-Time Location:{' '}
                  <span className="font-mono text-[#0B3D6B] dark:text-blue-300">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                  {gpsAccuracy ? (
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
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
              className="text-xs font-semibold text-[#0B3D6B] dark:text-blue-300 hover:underline shrink-0"
            >
              Show on Map
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nearby Landmark or House / Gate Number (optional)
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="e.g. Outside Gate No. 2, near Mother Dairy booth"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Photo of the Flooded Road (optional)
            </label>
            <label className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-[#0B3D6B] transition-colors overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Uploaded street waterlogging preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-3">
                  <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Click to upload a street photo
                  </p>
                  <p className="text-[11px] text-slate-500">Helps estimate water depth automatically</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What does the street look like?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="e.g. Knee-deep water, cars are stalled, drain cover looks blocked by garbage..."
              className="w-full h-32 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none"
            />
          </div>
        </div>

        {/* Lazy Resident Sign-Up Prompt (Only shown if not signed in yet) */}
        {!citizenUser ? (
          <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3">
            <div>
              <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                Quick Resident Verification (Phone & Quick Address)
              </p>
              <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-0.5">
                Sign up with your phone number and quick address only when submitting a report so the Ward Engineer can confirm clearance.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="tel"
                value={residentPhone}
                onChange={(e) => setResidentPhone(e.target.value)}
                placeholder="10-digit phone number *"
                className="px-3 py-2 rounded-lg text-sm border border-teal-200 dark:border-teal-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={residentAddress}
                onChange={(e) => setResidentAddress(e.target.value)}
                placeholder="Quick address (House / Sector) *"
                className="px-3 py-2 rounded-lg text-sm border border-teal-200 dark:border-teal-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 sm:col-span-2"
              />
            </div>
            <input
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 rounded-lg text-sm border border-teal-200 dark:border-teal-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span>
              Reporting as <strong className="text-slate-900 dark:text-slate-100">{citizenUser.name}</strong> (+91 {citizenUser.phone})
            </span>
            <button
              type="button"
              onClick={() => setActiveView('citizen-login')}
              className="text-[#0B3D6B] dark:text-blue-400 font-semibold hover:underline"
            >
              Account
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-xs"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Checking & Sending to Ward Engineer...</span>
            </>
          ) : (
            <>
              <Camera size={16} />
              <span>{citizenUser ? 'Send Flood Report' : 'Verify & Send Flood Report'}</span>
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
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Report Received · Assessed as {lastTriaged.ai_severity.toUpperCase()} (~{lastTriaged.ai_depth_cm} cm deep)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{lastTriaged.ai_summary}</p>
          {selectedHotspot && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${selectedHotspot.contacts.je.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white"
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recent Resident Flood Reports ({floodReports.length})
        </h3>
        {floodReports.map((rep) => (
          <div
            key={rep.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start justify-between gap-3 shadow-2xs"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span
                  className={`font-bold uppercase ${
                    rep.ai_severity === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : rep.ai_severity === 'high'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-cyan-400'
                  }`}
                >
                  {rep.ai_severity}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">~{rep.ai_depth_cm} cm</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">{rep.ai_recommended_agency}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {rep.location_name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{rep.description}</p>
              {rep.ai_summary && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline shrink-0"
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
  const { lang, subscribeAlerts, alertSubscriptions, setActiveView, addToast } = useStore();
  const [phone, setPhone] = useState('');
  const [hotspotId, setHotspotId] = useState(mcgHotspots[0].id);
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'ivr'>('whatsapp');

  const handleSubscribe = async () => {
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('citizen.subscribe_alerts', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Receive proactive T-2h waterlogging alerts for your Ward in English or Hindi
          </p>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={13} />
          Back to Map
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Mobile / WhatsApp Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXXXXXXX"
            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Ward / Hotspot Zone
          </label>
          <select
            value={hotspotId}
            onChange={(e) => setHotspotId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          >
            {mcgHotspots.map((h) => (
              <option key={h.id} value={h.id}>
                Ward {h.wardNo} (Zone {h.zone}) — {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {(['whatsapp', 'sms', 'ivr'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase border transition-colors ${
                channel === c
                  ? 'bg-[#0B3D6B] dark:bg-blue-600 border-transparent text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full py-2.5 rounded-xl bg-[#0B3D6B] dark:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Bell size={15} />
          Activate Proactive Alerts
        </button>
      </div>

      {alertSubscriptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Subscriptions ({alertSubscriptions.length})
          </h3>
          {alertSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{sub.sector_label}</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono">{sub.phone}</p>
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
  const { setActiveView } = useStore();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Model Calibration & Transparency
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {calibrationData.period} · Verified against citizen reports & MCG field logs
          </p>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={13} />
          Back to Map
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">Alerts Issued</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {calibrationData.alerts_issued}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified Match</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {calibrationData.alerts_verified_correct}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy</p>
          <p className="text-2xl font-mono font-bold tabular-nums text-blue-600 dark:text-cyan-400 mt-1">
            {calibrationData.accuracy_pct}%
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Target size={15} className="text-blue-600 dark:text-cyan-400" />
          <span>Weekly Prediction Verification</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calibrationData.weekly_data}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="alerts" fill="#2563eb" radius={[4, 4, 0, 0]} name="Alerts Issued" />
              <Bar dataKey="correct" fill="#10b981" radius={[4, 4, 0, 0]} name="Verified Correct" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
