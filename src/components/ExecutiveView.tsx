import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { calibrationData, hotspots, crews } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MapPin, AlertTriangle, Target, Download, TrendingUp, FileText, ChevronRight, WifiOff, Truck } from 'lucide-react';

export function ExecutiveView() {
  const { lang, getRiskScores, auditLog, sensors, setCurrentScreen, setActiveRiskFilter } = useStore();
  const riskScores = getRiskScores();

  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const medRisk = riskScores.filter(r => r.risk_pct >= 50 && r.risk_pct < 70).length;
  const lowRisk = riskScores.filter(r => r.risk_pct >= 30 && r.risk_pct < 50).length;
  const totalPopExposed = riskScores
    .filter(r => r.risk_pct >= 50)
    .reduce((sum, r) => {
      const hotspot = hotspots.find(h => h.id === r.hotspot_id);
      return sum + (hotspot?.population_exposure || 0);
    }, 0);

  const offlineSensors = sensors.filter(s => s.status === 'offline').length;
  const overrides = auditLog.filter(e => e.action === 'manual_override');
  const recentOverrides = overrides.slice(0, 5);

  const assignedCrews = crews.filter(c => c.current_assignment !== null).length;
  const availableCrews = crews.filter(c => c.available).length;

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{t('exec.title', lang)}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {t('exec.last_30_days', lang)} · Event: 04 Nov 2026
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
            <Download size={16} />
            {t('exec.download_report', lang)}
          </button>
        </div>

        {/* Citywide Exposure KPIs */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {lang === 'en' ? 'Citywide Exposure' : 'शहरव्यापी जोखिम'}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setActiveRiskFilter('high');
                setCurrentScreen('risk-map');
              }}
              className="bg-white rounded-xl border border-border p-4 text-left hover:shadow-md hover:border-risk-high transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-risk-high" />
                <span className="text-xs font-medium text-text-secondary">{lang === 'en' ? 'High Risk' : 'उच्च जोखिम'}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{highRisk}</p>
              <p className="text-xs text-text-secondary">{lang === 'en' ? 'hotspots' : 'हॉटस्पॉट'}</p>
              <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {lang === 'en' ? 'View on map →' : 'मानचित्र पर देखें →'}
              </p>
            </button>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-primary" />
                <span className="text-xs font-medium text-text-secondary">{lang === 'en' ? 'Population Exposed' : 'प्रभावित जनसंख्या'}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{totalPopExposed.toLocaleString()}</p>
              <p className="text-xs text-text-secondary">{lang === 'en' ? 'within 1km' : '1 किमी के भीतर'}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff size={16} className="text-risk-high" />
                <span className="text-xs font-medium text-text-secondary">{lang === 'en' ? 'Sensors Offline' : 'सेंसर ऑफ़लाइन'}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{offlineSensors}</p>
              <p className="text-xs text-text-secondary">{lang === 'en' ? 'of' : 'में से'} {sensors.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span className="text-xs font-medium text-text-secondary">{lang === 'en' ? 'Overrides' : 'ओवरराइड'}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{overrides.length}</p>
              <p className="text-xs text-text-secondary">{lang === 'en' ? 'this season' : 'इस सीज़न'}</p>
            </div>
          </div>
        </div>

        {/* Risk Snapshot + Override Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Risk Snapshot Map */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              {lang === 'en' ? 'Risk Snapshot' : 'जोखिम स्नैपशॉट'}
            </h3>
            <div className="h-[320px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 p-6">
                <div className="grid grid-cols-4 gap-3 h-full content-center">
                  {riskScores.map(score => {
                    const hotspot = hotspots.find(h => h.id === score.hotspot_id)!;
                    const color = score.risk_pct >= 70 ? 'bg-risk-high' : score.risk_pct >= 50 ? 'bg-risk-medium' : score.risk_pct >= 30 ? 'bg-risk-low' : 'bg-gray-300';
                    return (
                      <div key={score.hotspot_id} className="flex flex-col items-center justify-center group">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-[9px] font-bold shadow-sm group-hover:scale-110 transition-transform`}>
                          {score.risk_pct}
                        </div>
                        <p className="text-[8px] text-text-secondary mt-0.5 text-center leading-tight truncate w-full px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{hotspot.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-high" /> {t('risk.high', lang)}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-medium" /> {t('risk.medium', lang)}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-low" /> {t('risk.low', lang)}</span>
            </div>
          </div>

          {/* Political Override Log */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                {lang === 'en' ? 'Political Override Log' : 'राजनीतिक ओवरराइड लॉग'}
              </h3>
              <button
                onClick={() => setCurrentScreen('audit-log')}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                {lang === 'en' ? 'View full audit' : 'पूर्ण ऑडिट देखें'}
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentOverrides.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={24} className="mx-auto text-text-secondary/40 mb-2" />
                  <p className="text-sm text-text-secondary">
                    {lang === 'en' ? 'No overrides this season.' : 'इस सीज़न में कोई ओवरराइड नहीं।'}
                  </p>
                </div>
              ) : (
                recentOverrides.map(entry => {
                  const h = hotspots.find(h => h.id === entry.hotspot_id);
                  return (
                    <div key={entry.id} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{h?.name}</p>
                          <p className="text-xs text-text-secondary mt-0.5">"{entry.reason}"</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-mono">#{entry.original_rank}</span>
                          <span className="text-text-secondary">→</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-200 text-xs font-mono font-bold">#{entry.new_rank}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{entry.actor} · {new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Operational Readiness */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Truck size={16} className="text-primary" />
            {lang === 'en' ? 'Operational Readiness' : 'परिचालन तत्परता'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-text-primary">{lang === 'en' ? 'Crews assigned' : 'तैनात दल'}</span>
                <span className="text-text-secondary">{assignedCrews} / {crews.length}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(assignedCrews / crews.length) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-text-primary">{lang === 'en' ? 'Crews available' : 'उपलब्ध दल'}</span>
                <span className="text-text-secondary">{availableCrews} / {crews.length}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-risk-low rounded-full transition-all" style={{ width: `${(availableCrews / crews.length) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-text-primary">{lang === 'en' ? 'Pumps pre-positioned' : 'पंप पूर्व-स्थাপિત'}</span>
                <span className="text-text-secondary">3 / 5</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Model Accuracy Scorecard (officials only) */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Target size={16} className="text-primary" />
            {t('exec.model_accuracy', lang)} — {calibrationData.period}
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-primary">{calibrationData.alerts_issued}</p>
              <p className="text-xs text-text-secondary mt-1">{t('public.alerts_issued', lang)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-risk-low">{calibrationData.alerts_verified_correct}</p>
              <p className="text-xs text-text-secondary mt-1">{t('public.verified_correct', lang)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-primary">{calibrationData.accuracy_pct}%</p>
              <p className="text-xs text-text-secondary mt-1">{t('public.accuracy', lang)}</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calibrationData.weekly_data}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="alerts" fill="#0B3D6B" radius={[4, 4, 0, 0]} name="Alerts" />
                <Bar dataKey="correct" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Correct" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> Alerts</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-risk-low inline-block" /> Verified Correct</span>
          </div>
        </div>
      </div>
    </div>
  );
}
