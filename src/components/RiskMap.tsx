import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots } from '../data/mockData';
import { MapPin, AlertTriangle, ArrowUp, ArrowDown, Eye, Check, X, Bell, Building2 } from 'lucide-react';
import { DataChip } from './ui/DataChip';

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

function getTierColor(tier: 'high' | 'medium' | 'low' | 'unknown'): string {
  switch (tier) {
    case 'high': return '#C62828';
    case 'medium': return '#F9A825';
    case 'low': return '#2E7D32';
    case 'unknown': return '#757575';
  }
}

export function RiskMap() {
  const { lang, rainfallMm, setRainfallMm, filterType, setFilterType, getRiskScores, sensors, setCurrentScreen, activeRiskFilter, setActiveRiskFilter, addToast, addAuditEntry } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<L.LayerGroup | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const riskScores = getRiskScores();
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const medRisk = riskScores.filter(r => r.risk_pct >= 50 && r.risk_pct < 70).length;
  const lowRisk = riskScores.filter(r => r.risk_pct >= 30 && r.risk_pct < 50).length;

  // Compute matching hotspot IDs based on active filter
  const matchingHotspotIds = useMemo(() => {
    if (!activeRiskFilter) return null;
    return new Set(
      riskScores
        .filter(r => getRiskTier(r.risk_pct) === activeRiskFilter)
        .map(r => r.hotspot_id)
    );
  }, [activeRiskFilter, riskScores]);

  const matchingCount = matchingHotspotIds ? matchingHotspotIds.size : 0;

  const filteredHotspots = filterType === 'all'
    ? hotspots
    : hotspots.filter(h => {
        if (filterType === 'underpass') return h.mcg_category === 'critical_point';
        if (filterType === 'drain-node') return h.mcg_category === 'drainage_block';
        if (filterType === 'road') return h.mcg_category === 'low_lying_area';
        if (filterType === 'residential-sector') return h.mcg_category === 'no_sewer_line';
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
    polylinesRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 100);

    // Keyboard: Esc clears filter
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeRiskFilter) {
        setActiveRiskFilter(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update markers and topology based on filter
  useEffect(() => {
    if (!markersRef.current || !polylinesRef.current || !mapInstanceRef.current) return;
    
    markersRef.current.clearLayers();
    polylinesRef.current.clearLayers();

    const map = mapInstanceRef.current;
    const matchingBounds: L.LatLngBounds | null = matchingHotspotIds ? L.latLngBounds([]) : null;

    filteredHotspots.forEach(hotspot => {
      const score = riskScores.find(r => r.hotspot_id === hotspot.id);
      if (!score) return;

      const color = getRiskColor(score.risk_pct);
      const tier = getRiskTier(score.risk_pct);
      const isMatching = matchingHotspotIds ? matchingHotspotIds.has(hotspot.id) : true;
      const baseSize = Math.max(14, Math.min(28, hotspot.topology.leverage_score / 4));
      const size = isMatching && activeRiskFilter ? baseSize * 1.5 : baseSize;
      const opacity = isMatching ? 1 : 0.2;

      // Create marker with pulse ring if matching and filter active
      const pulseClass = isMatching && activeRiskFilter ? 'marker-pulse' : '';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;">
            ${isMatching && activeRiskFilter ? `<div class="${pulseClass}" style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${getTierColor(tier)};opacity:0.3;"></div>` : ''}
            <div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;opacity:${opacity};transition:opacity 200ms ease,transform 200ms ease;">
              <span style="color:white;font-size:${isMatching && activeRiskFilter ? '11px' : '9px'};font-weight:bold;">${score.risk_pct}</span>
            </div>
            ${isMatching && activeRiskFilter ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:4px;white-space:nowrap;font-size:10px;font-weight:500;color:#1A1F2B;background:white;padding:2px 6px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">${hotspot.name}</div>` : ''}
          </div>
        `,
        iconSize: [size, size + (isMatching && activeRiskFilter ? 20 : 0)],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], { icon })
        .on('click', () => {
          setSelectedHotspot(hotspot.id);
          setActiveRiskFilter(tier);
        });
      
      markersRef.current!.addLayer(marker);

      // Collect bounds for auto-zoom
      if (matchingBounds && isMatching) {
        matchingBounds.extend([hotspot.lat, hotspot.lng]);
      }
    });

    // Draw topology edges for matching hotspots
    if (matchingHotspotIds && matchingHotspotIds.size > 0) {
      filteredHotspots.forEach(hotspot => {
        if (!matchingHotspotIds.has(hotspot.id)) return;
        
        // Draw edges to upstream/downstream
        const connections = [...hotspot.topology.upstream_of, ...hotspot.topology.downstream_of];
        connections.forEach((connectedId: string) => {
          const connectedHotspot = hotspots.find(h => h.id === connectedId);
          if (!connectedHotspot) return;
          
          const connectedScore = riskScores.find(r => r.hotspot_id === connectedId);
          if (!connectedScore) return;
          
          const connectedTier = getRiskTier(connectedScore.risk_pct);
          const isEdgeMatching = matchingHotspotIds.has(connectedId);
          const edgeColor = isEdgeMatching ? getTierColor(connectedTier) : '#757575';
          const edgeOpacity = isEdgeMatching ? 0.8 : 0.1;
          
          const polyline = L.polyline(
            [[hotspot.lat, hotspot.lng], [connectedHotspot.lat, connectedHotspot.lng]],
            {
              color: edgeColor,
              weight: isEdgeMatching ? 3 : 1,
              opacity: edgeOpacity,
              dashArray: isEdgeMatching ? undefined : '5,5',
            }
          );
          polylinesRef.current!.addLayer(polyline);
        });
      });
    }

    // Auto-zoom to matching markers
    if (matchingBounds && matchingHotspotIds && matchingHotspotIds.size > 0) {
      if (matchingHotspotIds.size === 1) {
        const singleId = Array.from(matchingHotspotIds)[0];
        const singleHotspot = hotspots.find(h => h.id === singleId);
        if (singleHotspot) {
          map.setView([singleHotspot.lat, singleHotspot.lng], 15, { animate: true, duration: 0.6 });
        }
      } else {
        map.fitBounds(matchingBounds, { padding: [40, 40], maxZoom: 15, animate: true, duration: 0.6 });
      }
    } else if (!activeRiskFilter) {
      // Reset to citywide view
      map.setView([28.435, 77.01], 12, { animate: true });
    }
  }, [filteredHotspots, riskScores, filterType, activeRiskFilter, matchingHotspotIds]);

  // Handle filter change with toast for empty tiers
  const handleFilterChange = (tier: 'high' | 'medium' | 'low' | 'unknown' | null) => {
    if (tier === null) {
      setActiveRiskFilter(null);
      return;
    }

    const count = riskScores.filter(r => getRiskTier(r.risk_pct) === tier).length;
    if (count === 0) {
      addToast(lang === 'en' ? `No hotspots in ${tier.toUpperCase()} tier right now` : `${tier.toUpperCase()} जोखिम में कोई हॉटस्पॉट नहीं`, 'info');
      return;
    }

    setActiveRiskFilter(tier);
    
    // Announce for screen readers
    const tierLabel = t(`risk.${tier}`, lang);
    setAnnouncement(lang === 'en' ? `Filtered to ${tierLabel}. ${count} hotspots highlighted.` : `${tierLabel} पर फ़िल्टर किया गया। ${count} हॉटस्पॉट हाइलाइट किए गए।`);
  };

  const selectedData = selectedHotspot ? {
    hotspot: hotspots.find(h => h.id === selectedHotspot),
    score: riskScores.find(r => r.hotspot_id === selectedHotspot),
  } : null;

  // Close bottom sheet if selected hotspot no longer matches filter
  useEffect(() => {
    if (selectedHotspot && matchingHotspotIds && !matchingHotspotIds.has(selectedHotspot)) {
      setSelectedHotspot(null);
    }
  }, [matchingHotspotIds, selectedHotspot]);

  const filters = [
    { id: 'all', labelKey: 'risk_map.filter_all' },
    { id: 'underpass', labelKey: 'risk_map.filter_underpass' },
    { id: 'drain-node', labelKey: 'risk_map.filter_drain' },
    { id: 'road', labelKey: 'risk_map.filter_road' },
    { id: 'residential-sector', labelKey: 'risk_map.filter_residential' },
  ];

  const riskTiers: { tier: 'high' | 'medium' | 'low' | 'unknown'; count: number; label: string }[] = [
    { tier: 'high', count: highRisk, label: t('risk.high', lang) },
    { tier: 'medium', count: medRisk, label: t('risk.medium', lang) },
    { tier: 'low', count: lowRisk, label: t('risk.low', lang) },
    { tier: 'unknown', count: riskScores.length - highRisk - medRisk - lowRisk, label: t('risk.unknown', lang) },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Aria-live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

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

        {/* Risk Tier Filter Chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
              ${!activeRiskFilter ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border border border-border'}
            `}
            aria-pressed={!activeRiskFilter}
          >
            {lang === 'en' ? 'All' : 'सभी'}
          </button>
          {riskTiers.map(({ tier, count, label }) => (
            <button
              key={tier}
              onClick={() => handleFilterChange(tier)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                ${activeRiskFilter === tier ? 'text-white' : 'bg-background text-text-secondary hover:bg-border border border-border'}
              `}
              style={activeRiskFilter === tier ? { backgroundColor: getTierColor(tier) } : {}}
              aria-pressed={activeRiskFilter === tier}
              aria-label={lang === 'en' ? `Highlight ${label} hotspots, currently showing ${count}` : `${label} हॉटस्पॉट हाइलाइट करें, वर्तमान में ${count} दिखा रहे हैं`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeRiskFilter === tier ? 'white' : getTierColor(tier) }} />
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
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
        <div ref={mapRef} className="flex-1 min-h-[300px] relative">
          {/* Filter Banner */}
          {activeRiskFilter && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-white"
              style={{ backgroundColor: getTierColor(activeRiskFilter) }}
            >
              <span>
                {lang === 'en'
                  ? `Showing ${matchingCount} ${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} hotspots`
                  : `${matchingCount} ${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} हॉटस्पॉट दिखा रहे हैं`
                }
              </span>
              <button
                onClick={() => handleFilterChange(null)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                aria-label={lang === 'en' ? 'Clear filter' : 'फ़िल्टर साफ़ करें'}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards (right panel on desktop, bottom on mobile) */}
        <div className="lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-border p-4 space-y-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{t('risk_map.legend', lang)}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {riskTiers.map(({ tier, count, label }) => {
              const isActive = activeRiskFilter === tier;
              return (
                <button
                  key={tier}
                  onClick={() => handleFilterChange(tier)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left
                    ${isActive ? 'border-2' : 'border'}
                  `}
                  style={{
                    backgroundColor: isActive ? `${getTierColor(tier)}10` : 'transparent',
                    borderColor: isActive ? getTierColor(tier) : undefined,
                  }}
                  aria-pressed={isActive}
                  aria-label={lang === 'en' ? `Highlight ${label} hotspots, currently showing ${count}` : `${label} हॉटस्पॉट हाइलाइट करें, वर्तमान में ${count} दिखा रहे हैं`}
                >
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: getTierColor(tier) }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? '' : ''}`} style={{ color: isActive ? getTierColor(tier) : undefined }}>
                      {label} {isActive && <Check size={10} className="inline ml-1" />}
                    </p>
                    <p className="text-[10px] text-text-secondary">
                      {tier === 'high' && '≥70%'}
                      {tier === 'medium' && '50-69%'}
                      {tier === 'low' && '30-49%'}
                      {tier === 'unknown' && '<30%'}
                    </p>
                  </div>
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white" style={{ backgroundColor: getTierColor(tier) }}>
                      {lang === 'en' ? 'Viewing' : 'देख रहे हैं'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sheet - Selected Hotspot */}
        {selectedData?.hotspot && selectedData?.score && (
          <div className="absolute bottom-0 left-0 right-0 lg:left-auto lg:right-auto lg:w-96 bg-white rounded-t-2xl lg:rounded-xl shadow-2xl border border-border p-4 z-10 mx-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-text-primary">{selectedData.hotspot.name}</h3>
                <p className="text-xs text-text-secondary">{selectedData.hotspot.zone || 'Unknown zone'} · {selectedData.hotspot.owning_agency}</p>
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="p-1 hover:bg-background rounded">
                <span className="text-lg">×</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
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
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Building2 size={10} />
                {lang === 'en' ? 'Owned by' : 'स्वामित्व'}: {selectedData.hotspot.owning_agency}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin size={14} />
                <span className="flex items-center gap-1.5">
                  {selectedData.hotspot.mcg_category.replace(/_/g, ' ')}
                  <DataChip type="register" />
                </span>
              </div>
              {selectedData.hotspot.cause_note && (
                <div className="flex items-start gap-2 text-text-secondary">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="flex items-start gap-1.5">
                    <span>Cause: {selectedData.hotspot.cause_note}</span>
                    <DataChip type="register" />
                  </span>
                </div>
              )}
              {selectedData.hotspot.topology.downstream_of.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <ArrowDown size={14} />
                  <span className="flex items-center gap-1.5">
                    Downstream: {selectedData.hotspot.topology.downstream_of.map((id: string) => hotspots.find(h => h.id === id)?.name).join(', ')}
                    <DataChip type="modelled" />
                  </span>
                </div>
              )}
              {selectedData.hotspot.topology.upstream_of.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <ArrowUp size={14} />
                  <span className="flex items-center gap-1.5">
                    Upstream: {selectedData.hotspot.topology.upstream_of.map((id: string) => hotspots.find(h => h.id === id)?.name).join(', ')}
                    <DataChip type="modelled" />
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-secondary">
                <AlertTriangle size={14} />
                <span className="flex items-center gap-1.5">
                  Population exposure: {selectedData.hotspot.population_exposure.toLocaleString()}
                  <DataChip type="modelled" />
                </span>
              </div>
              {selectedData.hotspot.je && (
                <div className="pt-2 border-t border-border text-xs">
                  <p className="font-medium text-text-primary">Junior Engineer:</p>
                  <p className="text-text-secondary">{selectedData.hotspot.je.name} · {selectedData.hotspot.je.phone}</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => { setCurrentScreen('action-list'); setSelectedHotspot(null); }}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                {t('action_list.view_in_map', lang)}
              </button>
              {selectedData.hotspot && selectedData.hotspot.owning_agency !== 'MCG' && (
                <button
                  onClick={() => {
                    if (!selectedData.hotspot) return;
                    addAuditEntry({
                      actor: 'Control Room',
                      action: 'alert_issued',
                      hotspot_id: selectedData.hotspot.id,
                      original_rank: null,
                      new_rank: null,
                      reason: `Coordination request sent to ${selectedData.hotspot.owning_agency} for ${selectedData.hotspot.name}`,
                    });
                    addToast(
                      lang === 'en'
                        ? `Notified ${selectedData.hotspot.owning_agency}`
                        : `${selectedData.hotspot.owning_agency} को सूचित किया गया`,
                      'success'
                    );
                  }}
                  className="w-full py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell size={16} />
                  {selectedData.hotspot && (lang === 'en'
                    ? `Notify ${selectedData.hotspot.owning_agency}`
                    : `${selectedData.hotspot.owning_agency} को सूचित करें`
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
