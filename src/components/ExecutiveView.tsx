import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { calibrationData, hotspots } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MapPin, AlertTriangle, Target, Download, TrendingUp } from 'lucide-react';

export function ExecutiveView() {
  const { lang, getRiskScores, auditLog } = useStore();
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

  const overrideCount = auditLog.filter(e => e.action === 'manual_override').length;

  const stats = [
    { label: t('exec.total_hotspots', lang), value: `${highRisk + medRisk + lowRisk}`, sub: `${highRisk} high · ${medRisk} medium · ${lowRisk} low`, icon: MapPin, color: 'text-primary' },
    { label: t('exec.population_exposed', lang), value: totalPopExposed.toLocaleString(), sub: 'within 1km of high/medium risk', icon: Users, color: 'text-risk-high' },
    { label: t('exec.overrides_season', lang), value: String(overrideCount), sub: 'all logged & auditable', icon: AlertTriangle, color: 'text-amber-600' },
    { label: t('exec.model_accuracy', lang), value: `${calibrationData.accuracy_pct}%`, sub: `${calibrationData.alerts_issued} alerts, ${calibrationData.alerts_verified_correct} correct`, icon: Target, color: 'text-risk-low' },
  ];

  return (
    <div className="h-full overflow-auto">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={stat.color} />
                  <span className="text-xs font-medium text-text-secondary">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary mt-1">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Risk Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-risk-high">{t('risk.high', lang)}</span>
                  <span className="text-text-secondary">{highRisk} hotspots</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-risk-high rounded-full" style={{ width: `${(highRisk / 12) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-yellow-700">{t('risk.medium', lang)}</span>
                  <span className="text-text-secondary">{medRisk} hotspots</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-risk-medium rounded-full" style={{ width: `${(medRisk / 12) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-risk-low">{t('risk.low', lang)}</span>
                  <span className="text-text-secondary">{lowRisk} hotspots</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-risk-low rounded-full" style={{ width: `${(lowRisk / 12) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Target size={16} className="text-primary" />
              {t('exec.model_accuracy', lang)} — {calibrationData.period}
            </h3>
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

        {/* Scorecard */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Model Scorecard</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-amber-600">{overrideCount}</p>
              <p className="text-xs text-text-secondary mt-1">Overrides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
