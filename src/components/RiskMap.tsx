import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots } from '../data/mockData';
import { MapPin, AlertTriangle, ArrowUp, ArrowDown, Eye } from 'lucide-react';

function getRiskColor(riskPct: number): string {
  if (riskPct >= 70) return '#C62828';
  if (riskPct >= 50) return '#F9A825';
  if (riskPct >= 30) return '#2E7D32';
  return '#757575';
}

function getRiskTier(riskPct: number): 'high' | 'medium' | 'low' | 'unknown' {
  if (riskPct >= 70) return 'high';
  if (riskPct >= 50) return 'medium';
  if (riskPct >= 30) return 'low';
  return 'unknown';
}

export function RiskMap() {
  const { lang, rainfallMm, setRainfallMm, filterType, setFilterType, getRiskScores, sensors, setCurrentScreen } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const riskScores = getRiskScores();
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const medRisk = riskScores.filter(r => r.risk_pct >= 50 && r.risk_pct < 70).length;
  const lowRisk = riskScores.filter(r => r.risk_pct >= 30 && r.risk_pct < 50).length;

  const filteredHotspots = filterType === 'all'
    ? hotspots
    : hotspots.filter(h => {
        if (filterType === 'underpass') return h.type === 'underpass';
        if (filterType === 'drain-node') return h.type === 'drain-node';
        if (filterType === 'road') return h.type === 'road';
        if (filterType === 'residential-sector') return h.type === 'residential-sector';
        return true;
      });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([28.435, 77.01], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    // Invalidate size after mount to handle container resize
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    filteredHotspots.forEach(hotspot => {
      const score = riskScores.find(r => r.hotspot_id === hotspot.id);
      if (!score) return;

      const color = getRiskColor(score.risk_pct);
      const size = Math.max(14, Math.min(28, hotspot.leverage_score / 4));

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:9px;font-weight:bold;">${score.risk_pct}</span>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], { icon })
        .on('click', () => setSelectedHotspot(hotspot.id));
      markersRef.current!.addLayer(marker);
    });
  }, [filteredHotspots, riskScores, filterType]);

  const selectedData = selectedHotspot ? {
    hotspot: hotspots.find(h => h.id === selectedHotspot),
    score: riskScores.find(r => r.hotspot_id === selectedHotspot),
  } : null;

  const filters = [
    { id: 'all', labelKey: 'risk_map.filter_all' },
    { id: 'underpass', labelKey: 'risk_map.filter_underpass' },
    { id: 'drain-node', labelKey: 'risk_map.filter_drain' },
    { id: 'road', labelKey: 'risk_map.filter_road' },
    { id: 'residential-sector', labelKey: 'risk_map.filter_residential' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Top Banner */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t('risk_map.title', lang)}</h2>
            <p className="text-sm text-text-secondary">
              {t('risk_map.forecast', lang)}: <span className="font-semibold text-primary">{rainfallMm}mm</span> {t('risk_map.in_6h', lang)} · {highRisk} {t('risk_map.high_risk', lang)} {t('risk_map.hotspots', lang)} · {offlineSensors} {t('risk_map.sensors_offline', lang)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-text-secondary font-medium whitespace-nowrap">
              {t('risk_map.rainfall_mm', lang)}:
            </label>
            <input
              type="range"
              min="10"
              max="150"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-32 sm:w-48 accent-primary"
              aria-label={t('risk_map.change_forecast', lang)}
            />
            <span className="text-sm font-bold text-primary min-w-[3ch]">{rainfallMm}</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filterType === f.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}
              `}
            >
              {t(f.labelKey, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Summary */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div ref={mapRef} className="flex-1 min-h-[300px]" />

        {/* Summary Cards (right panel on desktop, bottom on mobile) */}
        <div className="lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-border p-4 space-y-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{t('risk_map.legend', lang)}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
              <div className="w-4 h-4 rounded-full bg-risk-high" />
              <div>
                <p className="text-xs font-semibold text-risk-high">{t('risk.high', lang)} ({highRisk})</p>
                <p className="text-[10px] text-text-secondary">≥70%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
              <div className="w-4 h-4 rounded-full bg-risk-medium" />
              <div>
                <p className="text-xs font-semibold text-yellow-700">{t('risk.medium', lang)} ({medRisk})</p>
                <p className="text-[10px] text-text-secondary">50-69%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-100">
              <div className="w-4 h-4 rounded-full bg-risk-low" />
              <div>
                <p className="text-xs font-semibold text-risk-low">{t('risk.low', lang)} ({lowRisk})</p>
                <p className="text-[10px] text-text-secondary">30-49%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-4 h-4 rounded-full bg-risk-unknown" />
              <div>
                <p className="text-xs font-semibold text-risk-unknown">{t('risk.unknown', lang)}</p>
                <p className="text-[10px] text-text-secondary">&lt;30%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sheet - Selected Hotspot */}
        {selectedData?.hotspot && selectedData?.score && (
          <div className="absolute bottom-0 left-0 right-0 lg:left-auto lg:right-auto lg:w-96 bg-white rounded-t-2xl lg:rounded-xl shadow-2xl border border-border p-4 z-10 mx-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-text-primary">{selectedData.hotspot.name}</h3>
                <p className="text-xs text-text-secondary">{selectedData.hotspot.ward} · {selectedData.hotspot.owning_agency}</p>
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="p-1 hover:bg-background rounded">
                <span className="text-lg">×</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                getRiskTier(selectedData.score.risk_pct) === 'high' ? 'bg-risk-high' :
                getRiskTier(selectedData.score.risk_pct) === 'medium' ? 'bg-risk-medium' :
                getRiskTier(selectedData.score.risk_pct) === 'low' ? 'bg-risk-low' : 'bg-risk-unknown'
              }`}>
                {selectedData.score.risk_pct}% — {t(`risk.${getRiskTier(selectedData.score.risk_pct)}`, lang)}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                selectedData.score.confidence === 'high' ? 'border-green-300 text-green-700 bg-green-50' :
                selectedData.score.confidence === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                'border-red-300 text-red-700 bg-red-50'
              }`}>
                {t(`confidence.${selectedData.score.confidence}`, lang)}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin size={14} />
                <span>{t('risk_map.filter_all', lang)}: {selectedData.hotspot.type}</span>
              </div>
              {selectedData.hotspot.downstream_of.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <ArrowDown size={14} />
                  <span>Downstream: {selectedData.hotspot.downstream_of.map(id => hotspots.find(h => h.id === id)?.name).join(', ')}</span>
                </div>
              )}
              {selectedData.hotspot.upstream_of.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <ArrowUp size={14} />
                  <span>Upstream: {selectedData.hotspot.upstream_of.map(id => hotspots.find(h => h.id === id)?.name).join(', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-secondary">
                <AlertTriangle size={14} />
                <span>Population exposure: {selectedData.hotspot.population_exposure.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { setCurrentScreen('action-list'); setSelectedHotspot(null); }}
              className="mt-4 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              {t('action_list.view_in_map', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
