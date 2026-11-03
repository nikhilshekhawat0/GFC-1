import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots, crews, sensorOfflineHistory } from '../data/mockData';
import { Dropdown, DropdownButton } from '../components/ui/Dropdown';
import { CheckCircle, AlertTriangle, Clock, Shield, ChevronRight, MapPin, WifiOff, FileText, Printer, Bell, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function getTimeRemaining(deadline: string): string {
  const now = new Date('2026-11-04T02:00:00+05:30');
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff <= 0) return 'Overdue';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function getRiskColor(riskPct: number): string {
  if (riskPct >= 70) return 'border-l-risk-high';
  if (riskPct >= 50) return 'border-l-risk-medium';
  return 'border-l-risk-low';
}

export function WardEngineerHome() {
  const { lang, getRankedActions, getRiskScores, sensors, auditLog, rainfallMm, markActionDone, flagAction, assignCrew, setCurrentScreen } = useStore();

  const actions = getRankedActions();
  const riskScores = getRiskScores();
  const top3 = actions.slice(0, 3);
  const offlineSensors = sensors.filter(s => s.status === 'offline');
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const recentAudit = auditLog.slice(0, 3);
  const uptime = Math.round((sensors.filter(s => s.status === 'online').length / sensors.length) * 100);

  const crewOptions = crews.map(c => ({
    value: c.id,
    label: c.name,
    group: c.available ? 'Available' : 'On duty',
  }));

  return (
    <div className="h-full overflow-auto bg-background">
      {/* Event Banner */}
      <div className={`px-4 py-2.5 text-sm font-medium text-white flex items-center justify-between ${highRisk > 0 ? 'bg-risk-high' : 'bg-risk-medium'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span>Rain forecast: {rainfallMm}mm in 6h</span>
          <span className="opacity-70">·</span>
          <span>Ranking locked at 04:00</span>
          <span className="opacity-70">·</span>
          <span className="flex items-center gap-1">
            <WifiOff size={12} />
            {offlineSensors.length} sensors offline
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Primary Focus: Your next 3 actions */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-1">
            {lang === 'en' ? 'Your next 3 actions' : 'आपकी अगली 3 कार्रवाइयाँ'}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {lang === 'en' ? 'Priority-ranked tasks for today\'s rainfall event.' : 'आज की वर्षा घटना के लिए प्राथमिकता-क्रमबद्ध कार्य।'}
          </p>

          <div className="space-y-3">
            {top3.map((action) => {
              const hotspot = hotspots.find(h => h.id === action.hotspot_id)!;
              const score = riskScores.find(r => r.hotspot_id === action.hotspot_id)!;
              const crew = crews.find(c => c.id === action.assigned_crew_id);

              return (
                <div
                  key={action.id}
                  className={`bg-white rounded-2xl border border-border border-l-4 ${getRiskColor(score.risk_pct)} shadow-sm p-4 sm:p-5`}
                >
                  <div className="flex gap-4">
                    {/* Rank Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                      score.risk_pct >= 70 ? 'bg-risk-high' :
                      score.risk_pct >= 50 ? 'bg-risk-medium' : 'bg-risk-low'
                    }`}>
                      {action.rank}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-text-primary">{hotspot.name}</h3>
                          <p className="text-xs text-text-secondary">{hotspot.ward} · {hotspot.owning_agency}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {action.is_override && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {t('override.chip', lang)}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                            score.confidence === 'high' ? 'bg-green-600' :
                            score.confidence === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {score.risk_pct}%
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-primary mt-2">{action.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getTimeRemaining(action.deadline)}
                        </span>

                        {/* Crew Dropdown */}
                        <Dropdown
                          trigger={
                            <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border text-xs hover:bg-border/50 transition-colors">
                              <Shield size={11} />
                              {crew?.name || 'Assign crew'}
                            </button>
                          }
                          options={crewOptions}
                          value={action.assigned_crew_id || undefined}
                          onChange={(crewId) => assignCrew(action.id, crewId)}
                        />

                        {action.status === 'done' && (
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle size={11} /> Done
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {action.status !== 'done' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => markActionDone(action.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle size={12} />
                            {t('action_list.mark_done', lang)}
                          </button>
                          <button
                            onClick={() => flagAction(action.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <AlertTriangle size={12} />
                            {t('action_list.flag', lang)}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentScreen('action-list')}
            className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            {lang === 'en' ? `See full ranked action list (${actions.length})` : `पूर्ण क्रमबद्ध कार्रवाई सूची देखें (${actions.length})`}
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mini Map */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                {lang === 'en' ? 'Risk Map' : 'जोखिम मानचित्र'}
              </h3>
              <button
                onClick={() => setCurrentScreen('risk-map')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {lang === 'en' ? 'Open full map' : 'पूर्ण मानचित्र खोलें'}
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="h-[280px] rounded-xl bg-background border border-border flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="mx-auto text-primary/40 mb-2" />
                <p className="text-xs text-text-secondary">
                  {lang === 'en' ? 'Click "Open full map" for interactive view' : 'इंटरैक्टिव दृश्य के लिए "पूर्ण मानचित्र खोलें" पर क्लिक करें'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-risk-high" /> {highRisk} high</span>
                  <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-risk-medium" /> {riskScores.filter(r => r.risk_pct >= 50 && r.risk_pct < 70).length} med</span>
                  <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-risk-low" /> {riskScores.filter(r => r.risk_pct >= 30 && r.risk_pct < 50).length} low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Health Summary */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <WifiOff size={16} className="text-risk-high" />
                {lang === 'en' ? 'Sensor Health' : 'सेंसर स्थिति'}
              </h3>
              <button
                onClick={() => setCurrentScreen('sensor-health')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {lang === 'en' ? 'View all' : 'सभी देखें'}
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <p className="text-2xl font-bold text-text-primary">{uptime}%</p>
                <p className="text-xs text-text-secondary">{lang === 'en' ? 'Network uptime' : 'नेटवर्क अपटाइम'}</p>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-risk-high">{offlineSensors.length}</p>
                <p className="text-xs text-text-secondary">{lang === 'en' ? 'Offline' : 'ऑफ़लाइन'}</p>
              </div>
            </div>
            {offlineSensors.length > 0 && (
              <div className="space-y-1.5">
                {offlineSensors.slice(0, 3).map(s => {
                  const h = hotspots.find(h => h.id === s.hotspot_id);
                  return (
                    <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-xs">
                      <WifiOff size={12} className="text-risk-high" />
                      <span className="font-mono">{s.id}</span>
                      <span className="text-text-secondary truncate">{h?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tertiary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Audit */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                {lang === 'en' ? 'Recent Activity' : 'हाल की गतिविधि'}
              </h3>
              <button
                onClick={() => setCurrentScreen('audit-log')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {lang === 'en' ? 'View all' : 'सभी देखें'}
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentAudit.map(entry => {
                const h = hotspots.find(h => h.id === entry.hotspot_id);
                return (
                  <div key={entry.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${entry.action === 'manual_override' ? 'bg-amber-50 border border-amber-100' : 'bg-background'}`}>
                    {entry.action === 'manual_override' ? <AlertTriangle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" /> : <FileText size={12} className="text-text-secondary mt-0.5 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-text-primary truncate">{h?.name} — {entry.reason}</p>
                      <p className="text-text-secondary">{entry.actor} · {new Date(entry.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {lang === 'en' ? 'Quick Links' : 'त्वरित लिंक'}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentScreen('action-list')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-border/50 transition-colors text-left"
              >
                <Printer size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{lang === 'en' ? 'Print action list' : 'कार्रवाई सूची प्रिंट करें'}</p>
                  <p className="text-xs text-text-secondary">{lang === 'en' ? 'For field teams' : 'फील्ड टीमों के लिए'}</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentScreen('risk-map')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-border/50 transition-colors text-left"
              >
                <Bell size={18} className="text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{lang === 'en' ? 'Issue citizen alert' : 'नागरिक अलर्ट जारी करें'}</p>
                  <p className="text-xs text-text-secondary">{lang === 'en' ? 'SMS / IVR to affected sectors' : 'प्रभावित सेक्टरों को SMS / IVR'}</p>
                </div>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background opacity-50 cursor-not-allowed text-left"
                title={lang === 'en' ? 'Ranking locked at T-24h' : 'T-24h पर रैंकिंग लॉक'}
              >
                <RefreshCw size={18} className="text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{lang === 'en' ? 'Re-run ranking' : 'रैंकिंग पुनः चलाएं'}</p>
                  <p className="text-xs text-text-secondary">{lang === 'en' ? 'Locked (T-24h rule)' : 'लॉक (T-24h नियम)'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
