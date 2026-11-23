import { useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { Play, Pause, RotateCcw, Droplets, Shield, AlertCircle, LocateFixed, Loader2 } from 'lucide-react';
import { mcgHotspots, type McgHotspot } from '../data/mcgHotspots';
import {
  computeHotspotTelemetry,
  useStore,
  type HotspotTelemetry,
  type UserLocation,
} from '../store/useStore';
import { fetchRealtimePosition, watchRealtimePosition } from '../lib/geolocation';
import type { FloodReportRecord } from '../lib/supabase';
import type { Lang } from '../i18n/translations';
import {
  getHotspotDisplayName,
  localizeLocationName,
  formatWardLabel,
  formatZoneLabel,
} from '../i18n/locationHi';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GURUGRAM_CENTER = { lat: 28.448, lng: 77.042 };

function getTierHex(tier: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (tier) {
    case 'critical':
      return '#EF4444';
    case 'high':
      return '#F59E0B';
    case 'medium':
      return '#3B82F6';
    case 'low':
      return '#10B981';
  }
}

export function getFilteredHotspots(
  zone: 'all' | 1 | 2 | 3 | 4,
  ward: 'all' | number,
  cause: string,
  criticality: string,
  searchQuery: string
): McgHotspot[] {
  const q = searchQuery.trim().toLowerCase();
  return mcgHotspots.filter((h) => {
    if (zone !== 'all' && h.zone !== zone) return false;
    if (ward !== 'all' && h.wardNo !== ward) return false;
    if (cause !== 'all' && h.causeCategory !== cause) return false;
    if (criticality !== 'all' && h.criticality !== criticality) return false;
    if (q) {
      const hiName = getHotspotDisplayName(h, 'hi');
      const hiLandmark = localizeLocationName(h.landmark, 'hi');
      const hay = `${h.name} ${h.landmark} ${hiName} ${hiLandmark} ward ${h.wardNo} वार्ड ${h.wardNo} ${h.causeAnalysis} ${h.contacts.je.name} ${h.owningAgency}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function MapCameraController({
  selectedHotspotId,
  userLocation,
}: {
  selectedHotspotId: string | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap();
  const lastFocusNonceRef = useRef<number>(0);

  useEffect(() => {
    if (!map || !userLocation) return;
    if (userLocation.focusNonce > 0 && userLocation.focusNonce !== lastFocusNonceRef.current) {
      lastFocusNonceRef.current = userLocation.focusNonce;
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      const currentZoom = map.getZoom() ?? 12;
      if (currentZoom < 16) {
        map.setZoom(16);
      }
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (!map || !selectedHotspotId) return;
    const hotspot = mcgHotspots.find((h) => h.id === selectedHotspotId);
    if (!hotspot) return;
    map.panTo({ lat: hotspot.lat, lng: hotspot.lng });
    const currentZoom = map.getZoom() ?? 12;
    if (currentZoom < 14) {
      map.setZoom(14);
    }
  }, [map, selectedHotspotId]);

  return null;
}

function UserLocationMarker({
  userLocation,
  lang,
  onReportHere,
}: {
  userLocation: UserLocation;
  lang: 'en' | 'hi';
  onReportHere: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;
    const radius = Math.min(450, Math.max(18, userLocation.accuracyMeters || 30));
    const circle = new mapsLib.Circle({
      map,
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius,
      fillColor: '#1A73E8',
      fillOpacity: 0.14,
      strokeColor: '#1A73E8',
      strokeOpacity: 0.4,
      strokeWeight: 1,
      clickable: false,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, mapsLib, userLocation.lat, userLocation.lng, userLocation.accuracyMeters]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
        title={lang === 'hi' ? 'आपका रीयल-टाइम स्थान' : 'Your Real-Time Location'}
        zIndex={60}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div
          style={{
            position: 'relative',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {typeof userLocation.heading === 'number' && (
            <div
              style={{
                position: 'absolute',
                width: '38px',
                height: '38px',
                transform: `rotate(${userLocation.heading}deg)`,
                background:
                  'conic-gradient(from -32deg at 50% 50%, rgba(26,115,232,0.38) 0deg, rgba(26,115,232,0.38) 64deg, transparent 65deg)',
                borderRadius: '9999px',
                pointerEvents: 'none',
              }}
            />
          )}
          <span
            className="gfc-critical-ring"
            style={{
              position: 'absolute',
              inset: '-7px',
              borderRadius: '9999px',
              border: '1.5px solid #1A73E8',
              background: 'rgba(26, 115, 232, 0.2)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '9999px',
              background: '#1A73E8',
              border: '3px solid #ffffff',
              boxShadow: '0 2px 8px rgba(26,115,232,0.55)',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </div>
      </AdvancedMarker>

      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={250} onCloseClick={() => setOpen(false)}>
          <div className="p-1 text-slate-900 text-xs leading-snug space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
              <p className="font-bold text-slate-900">
                {lang === 'hi' ? 'आपका रीयल-टाइम स्थान' : 'Your Real-Time Location'}
              </p>
            </div>
            <p className="font-mono text-[11px] text-slate-600">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              {userLocation.accuracyMeters ? ` (±${userLocation.accuracyMeters}m)` : ''}
            </p>
            <button
              type="button"
              onClick={onReportHere}
              className="w-full py-1 px-2 rounded-md bg-[#0B3D6B] text-white text-[11px] font-semibold hover:bg-[#093055] transition-colors"
            >
              {lang === 'hi' ? 'यहाँ जलभराव की रिपोर्ट करें' : 'Report Flood at My Location'}
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function DrainageCascadePolylines({
  filteredHotspots,
  telemetryById,
}: {
  filteredHotspots: McgHotspot[];
  telemetryById: Record<string, HotspotTelemetry>;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const polylines: google.maps.Polyline[] = [];

    filteredHotspots.forEach((up) => {
      up.upstreamOf.forEach((downId) => {
        const down = mcgHotspots.find((h) => h.id === downId);
        if (!down) return;
        const upTel = telemetryById[up.id];
        const strokeColor = upTel?.tier === 'critical' ? '#dc2626' : '#0b3d6b';

        const polyline = new mapsLib.Polyline({
          map,
          path: [
            { lat: up.lat, lng: up.lng },
            { lat: down.lat, lng: down.lng },
          ],
          strokeColor,
          strokeOpacity: 0,
          strokeWeight: 2,
          icons: [
            {
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 0.65,
                scale: 2.4,
              },
              offset: '0',
              repeat: '12px',
            },
          ],
        });
        polylines.push(polyline);
      });
    });

    return () => {
      polylines.forEach((line) => line.setMap(null));
    };
  }, [map, mapsLib, filteredHotspots, telemetryById]);

  return null;
}

function HotspotAdvancedMarker({
  hotspot,
  tel,
  lang,
  isSelected,
  isHighlighted,
  onSelect,
}: {
  hotspot: McgHotspot;
  tel: HotspotTelemetry;
  lang: Lang;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (id: string) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const color = getTierHex(tel.tier);
  const isCritical = tel.tier === 'critical';
  const displayName = getHotspotDisplayName(hotspot, lang);
  const baseSize = isSelected
    ? 24
    : isHighlighted
      ? 20
      : isCritical
        ? 18
        : tel.tier === 'high'
          ? 14
          : 11;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: hotspot.lat, lng: hotspot.lng }}
        title={
          lang === 'hi'
            ? `${displayName} · ${formatWardLabel(hotspot.wardNo, lang)} · जलभराव संभावना ${tel.riskPct}%`
            : `${displayName} · Ward ${hotspot.wardNo} · Flood chance ${tel.riskPct}%`
        }
        zIndex={isSelected ? 50 : isCritical ? 30 : 10}
        onClick={() => onSelect(hotspot.id)}
      >
        <div
          style={{
            position: 'relative',
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {(isCritical || isSelected || isHighlighted) && (
            <span
              className="gfc-critical-ring"
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '9999px',
                border: `2px solid ${isHighlighted ? '#0284c7' : color}`,
                background: isHighlighted ? 'rgba(2,132,199,0.16)' : 'rgba(239,68,68,0.18)',
                pointerEvents: 'none',
              }}
            />
          )}
          <div
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              borderRadius: '9999px',
              background: color,
              border: isSelected ? '2.5px solid #ffffff' : '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(15,23,42,0.32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(isSelected || isCritical) && (
              <span
                style={{
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {tel.riskPct}
              </span>
            )}
          </div>
        </div>
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={250} headerDisabled>
          <div className="p-1 text-slate-900 text-xs leading-snug space-y-0.5">
            <p className="font-bold text-slate-900">{displayName}</p>
            <p className="text-slate-600">
              {formatWardLabel(hotspot.wardNo, lang)} · {formatZoneLabel(hotspot.zone, lang)} ·{' '}
              {hotspot.owningAgency}
            </p>
            <p className="font-mono font-semibold text-[#0B3D6B]">
              {lang === 'hi'
                ? `जलभराव संभावना ${tel.riskPct}% (~${tel.waterDepthCm} सेमी)`
                : `Flood chance ${tel.riskPct}% (~${tel.waterDepthCm} cm)`}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function CitizenReportMarker({
  report,
  lang,
  onSelectHotspot,
}: {
  report: FloodReportRecord;
  lang: Lang;
  onSelectHotspot: (id: string) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);
  const displayLocation = localizeLocationName(report.location_name, lang);

  const color =
    report.ai_severity === 'critical'
      ? '#dc2626'
      : report.ai_severity === 'high'
        ? '#d97706'
        : '#0284c7';

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: report.lat, lng: report.lng }}
        title={
          lang === 'hi'
            ? `नागरिक रिपोर्ट: ${displayLocation}`
            : `Resident Report: ${displayLocation}`
        }
        zIndex={40}
        onClick={() => {
          if (report.hotspot_id) onSelectHotspot(report.hotspot_id);
          else setOpen(true);
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            transform: 'rotate(45deg)',
            background: color,
            border: '2px solid #ffffff',
            boxShadow: '0 2px 8px rgba(15,23,42,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 800,
            }}
          >
            !
          </span>
        </div>
      </AdvancedMarker>

      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={230} onCloseClick={() => setOpen(false)}>
          <div className="p-1 text-slate-900 text-xs space-y-0.5">
            <p className="font-bold">
              {lang === 'hi' ? `नागरिक रिपोर्ट: ${displayLocation}` : `Resident Report: ${displayLocation}`}
            </p>
            <p className="text-slate-600">
              {lang === 'hi'
                ? `गंभीरता: ${report.ai_severity.toUpperCase()} (~${report.ai_depth_cm} सेमी)`
                : `Severity: ${report.ai_severity.toUpperCase()} (~${report.ai_depth_cm} cm)`}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapStatusOverlay() {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/95 dark:bg-slate-900/95 p-6">
        <div className="max-w-md rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 p-5 text-center space-y-2 shadow-sm">
          <AlertCircle size={22} className="mx-auto text-red-600 dark:text-red-400" />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Unable to load Google Maps
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please verify that Maps JavaScript API is enabled for your Google Cloud API key and HTTP referrers allow this domain.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function GeospatialMap() {
  const {
    theme,
    lang,
    rainfallMm,
    timelineHourOffset,
    setTimelineHourOffset,
    isPlayingTimeline,
    setIsPlayingTimeline,
    pumpMitigationActive,
    togglePumpMitigation,
    selectedZone,
    selectedWard,
    selectedCause,
    selectedCriticality,
    searchQuery,
    selectedHotspotId,
    setSelectedHotspotId,
    highlightedHotspotIds,
    userLocation,
    setUserLocation,
    setActiveView,
    addToast,
    sensors,
    floodReports,
    dispatchRecords,
  } = useStore();

  const [locating, setLocating] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const watchCleanupRef = useRef<(() => void) | null>(null);
  const hasInitialAutoFocusRef = useRef(false);

  const startLiveLocationWatch = () => {
    if (watchCleanupRef.current) return;
    setLiveTracking(true);
    setLocationDenied(false);
    watchCleanupRef.current = watchRealtimePosition(
      (liveFix) => {
        setLocationDenied(false);
        const shouldAutoFocus =
          !hasInitialAutoFocusRef.current && !useStore.getState().selectedHotspotId;
        hasInitialAutoFocusRef.current = true;
        setUserLocation(liveFix, shouldAutoFocus);
      },
      (_msg, code) => {
        if (code === 1) {
          setLocationDenied(true);
          setLiveTracking(false);
          if (watchCleanupRef.current) {
            watchCleanupRef.current();
            watchCleanupRef.current = null;
          }
        }
      }
    );
  };

  // Automatically track & display user's real-time GPS blue dot whenever viewing the map
  useEffect(() => {
    startLiveLocationWatch();
    return () => {
      if (watchCleanupRef.current) {
        watchCleanupRef.current();
        watchCleanupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchMyLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const fix = await fetchRealtimePosition();
      hasInitialAutoFocusRef.current = true;
      setLocationDenied(false);
      setUserLocation(fix, true);
      startLiveLocationWatch();
      addToast(
        `Centered on your real-time location (${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)})`,
        'success'
      );
    } catch (err) {
      setLocationDenied(true);
      addToast(
        err instanceof Error ? err.message : 'Unable to fetch your real-time location',
        'warning'
      );
    } finally {
      setLocating(false);
    }
  };

  const filteredHotspots = useMemo(
    () =>
      getFilteredHotspots(
        selectedZone,
        selectedWard,
        selectedCause,
        selectedCriticality,
        searchQuery
      ),
    [selectedZone, selectedWard, selectedCause, selectedCriticality, searchQuery]
  );

  const telemetryById = useMemo(() => {
    const mapRecord: Record<string, HotspotTelemetry> = {};
    filteredHotspots.forEach((h) => {
      mapRecord[h.id] = computeHotspotTelemetry(
        h,
        rainfallMm,
        timelineHourOffset,
        pumpMitigationActive,
        sensors,
        floodReports,
        dispatchRecords[h.id]
      );
    });
    return mapRecord;
  }, [
    filteredHotspots,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
  ]);

  const criticalActiveCount = useMemo(() => {
    let count = 0;
    Object.values(telemetryById).forEach((v) => {
      if (v.tier === 'critical') count += 1;
    });
    return count;
  }, [telemetryById]);

  const activeReports = useMemo(
    () => floodReports.filter((r) => r.status !== 'resolved'),
    [floodReports]
  );

  // Timeline playback interval
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const timer = window.setInterval(() => {
      const curr = useStore.getState().timelineHourOffset;
      const next = curr >= 12 ? -6 : curr + 1;
      setTimelineHourOffset(next);
    }, 900);
    return () => window.clearInterval(timer);
  }, [isPlayingTimeline, setTimelineHourOffset]);

  return (
    <div className="flex flex-col w-full h-full min-w-0 min-h-0">
      <div className="relative flex-1 min-h-0 w-full h-full">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
            <div className="max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 text-center space-y-2">
              <AlertCircle size={22} className="mx-auto text-amber-600" />
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Google Maps API key not configured
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Set <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your environment configuration to load the Gurugram flood map.
              </p>
            </div>
          </div>
        ) : (
          <APIProvider
            apiKey={GOOGLE_MAPS_API_KEY}
            libraries={['marker', 'maps']}
            language={lang === 'hi' ? 'hi' : 'en'}
            region="IN"
          >
            <MapStatusOverlay />
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFetchMyLocation}
                disabled={locating}
                title={
                  locationDenied
                    ? 'Allow location access to show your real-time position'
                    : 'Center map on my real-time location'
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D131F] text-slate-900 dark:text-slate-100 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70 transition-colors"
              >
                {locating ? (
                  <Loader2 size={14} className="animate-spin text-[#1A73E8]" />
                ) : (
                  <LocateFixed
                    size={14}
                    className={
                      userLocation
                        ? 'text-[#1A73E8] dark:text-blue-400'
                        : locationDenied
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-[#0B3D6B] dark:text-blue-400'
                    }
                  />
                )}
                <span>
                  {locating
                    ? lang === 'hi'
                      ? 'स्थान प्राप्त हो रहा है...'
                      : 'Locating...'
                    : userLocation && liveTracking
                      ? lang === 'hi'
                        ? 'मेरा लाइव स्थान'
                        : 'My Location'
                      : locationDenied
                        ? lang === 'hi'
                          ? 'लोकेशन चालू करें'
                          : 'Enable Location'
                        : lang === 'hi'
                          ? 'मेरा स्थान दिखाएँ'
                          : 'Fetch My Location'}
                </span>
                {userLocation && liveTracking && (
                  <span
                    className="w-2 h-2 rounded-full bg-[#1A73E8]"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            <GoogleMap
              defaultCenter={GURUGRAM_CENTER}
              defaultZoom={12}
              mapId="DEMO_MAP_ID"
              colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
              gestureHandling="greedy"
              streetViewControl={false}
              fullscreenControl={false}
              mapTypeControl={true}
              zoomControl={true}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <MapCameraController
                selectedHotspotId={selectedHotspotId}
                userLocation={userLocation}
              />
              <DrainageCascadePolylines
                filteredHotspots={filteredHotspots}
                telemetryById={telemetryById}
              />

              {filteredHotspots.map((hotspot) => {
                const tel = telemetryById[hotspot.id];
                if (!tel) return null;
                return (
                  <HotspotAdvancedMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    tel={tel}
                    lang={lang}
                    isSelected={selectedHotspotId === hotspot.id}
                    isHighlighted={highlightedHotspotIds.includes(hotspot.id)}
                    onSelect={setSelectedHotspotId}
                  />
                );
              })}

              {activeReports.map((report) => (
                <CitizenReportMarker
                  key={report.id}
                  report={report}
                  lang={lang}
                  onSelectHotspot={setSelectedHotspotId}
                />
              ))}

              {userLocation && (
                <UserLocationMarker
                  userLocation={userLocation}
                  lang={lang}
                  onReportHere={() => setActiveView('report')}
                />
              )}
            </GoogleMap>
          </APIProvider>
        )}
      </div>

      {/* Docked Bottom Time Forecast & Pump Simulation Bar */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] px-4 py-2.5">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
          {/* Play / Reset + Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="w-8 h-8 rounded-lg bg-[#0B3D6B] text-white flex items-center justify-center hover:bg-[#093055] transition-colors"
              aria-label={isPlayingTimeline ? 'Pause flood forecast playback' : 'Play flood forecast playback'}
            >
              {isPlayingTimeline ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlayingTimeline(false);
                setTimelineHourOffset(0);
              }}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Jump back to right now"
            >
              <RotateCcw size={13} />
            </button>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                {timelineHourOffset === 0
                  ? lang === 'hi'
                    ? 'अभी'
                    : 'Right Now'
                  : timelineHourOffset < 0
                    ? lang === 'hi'
                      ? `${Math.abs(timelineHourOffset)} घंटे पहले`
                      : `${Math.abs(timelineHourOffset)}h Earlier`
                    : lang === 'hi'
                      ? `+${timelineHourOffset} घंटे बाद`
                      : `+${timelineHourOffset}h Ahead`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                {lang === 'hi'
                  ? `${criticalActiveCount} गंभीर · ${filteredHotspots.length} स्थान`
                  : `${criticalActiveCount} severe · ${filteredHotspots.length} spots`}
              </p>
            </div>
          </div>

          {/* Scrubber Slider */}
          <div className="flex-1 min-w-[180px] flex items-center gap-2.5">
            <span className="text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
              -6h
            </span>
            <input
              type="range"
              min={-6}
              max={12}
              step={1}
              value={timelineHourOffset}
              onChange={(e) => setTimelineHourOffset(Number(e.target.value))}
              className="flex-1 h-1.5 accent-[#0B3D6B] cursor-pointer"
              aria-label="Slide to preview flooding over time"
            />
            <span className="text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
              +12h
            </span>
          </div>

          {/* Pumps Toggle + Rain Readout */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={togglePumpMitigation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                pumpMitigationActive
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Shield size={13} />
              <span>
                {lang === 'hi'
                  ? `पंप: ${pumpMitigationActive ? 'चालू' : 'बंद'}`
                  : `Pumps: ${pumpMitigationActive ? 'ON' : 'OFF'}`}
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold tabular-nums text-[#0B3D6B] dark:text-cyan-400 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-cyan-950/50 border border-blue-200/80 dark:border-cyan-800/40 whitespace-nowrap">
              <Droplets size={12} />
              <span>{rainfallMm} mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
