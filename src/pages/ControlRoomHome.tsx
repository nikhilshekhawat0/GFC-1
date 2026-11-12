import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots, crews } from '../data/mockData';
import { Dropdown } from '../components/ui/Dropdown';
import { CheckCircle, AlertTriangle, Clock, Shield, Wifi, WifiOff, MapPin, RefreshCw, ChevronRight, Activity } from 'lucide-react';

function getTimeRemaining(deadline: string): string {
  const now = new Date('2026-11-04T02:00:00+05:30');
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff <= 0) return 'Overdue';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function ControlRoomHome() {
  const { lang, getRankedActions, getRiskScores, sensors, rainfallMm, setCurrentScreen, markActionDone, assignCrew } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const actions = getRankedActions();
  const riskScores = getRiskScores();
  const offlineSensors = sensors.filter(s => s.status === 'offline');
  const onlineSensors = sensors.filter(s => s.status === 'online');
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const uptime = Math.round((onlineSensors.length / sensors.length) * 100);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const crewOptions = crews.map(c => ({
    value: c.id,
    label: c.name,
    group: c.available ? 'Available' : 'On duty',
  }));

  return (
    <div className="h-full overflow-auto bg-background">
      {/* Event Banner with Live Clock */}
      <div className={`px-4 py-2.5 text-sm font-medium text-white flex items-center justify-between ${highRisk > 0 ? 'bg-risk-high' : 'bg-risk-medium'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span>Rain: {rainfallMm}mm/6h</span>
          <span className="opacity-70">·</span>
          <span>{offlineSensors.length} sensors offline</span>
          <span className="opacity-70">·</span>
          <span className="flex items-center gap-1">
            <RefreshCw size={12} />
            Last refresh: 2 min ago
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-white/20 rounded transition-colors" title="Refresh data">
            <RefreshCw size={14} />
          </button>
          <span className="font-mono text-xs">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Primary: Full-width Map */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              {lang === 'en' ? 'Live Risk Map' : 'लाइव जोखिम मानचित्र'}
            </h2>
            <button
              onClick={() => setCurrentScreen('risk-map')}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              {lang === 'en' ? 'Open full screen' : 'पूर्ण स्क्रीन खोलें'}
              <ChevronRight size={12} />
            </button>
          </div>
          <div className="h-[420px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
            {/* Simplified map visualization */}
            <div className="absolute inset-0 p-8">
              <div className="grid grid-cols-4 gap-4 h-full">
                {riskScores.slice(0, 12).map(score => {
                  const hotspot = hotspots.find(h => h.id === score.hotspot_id)!;
                  const color = score.risk_pct >= 70 ? 'bg-risk-high' : score.risk_pct >= 50 ? 'bg-risk-medium' : 'bg-risk-low';
                  return (
                    <div key={score.hotspot_id} className="flex flex-col items-center justify-center">
                      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                        {score.risk_pct}
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1 text-center leading-tight truncate w-full px-1">{hotspot.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: Sensor Stream + Override Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Live Sensor Status */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              {lang === 'en' ? 'Sensor Status Stream' : 'सेंसर स्थिति स्ट्रीम'}
            </h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {sensors.map(s => {
                const h = hotspots.find(h => h.id === s.hotspot_id);
                return (
                  <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${s.status === 'offline' ? 'bg-red-50' : 'bg-background'}`}>
                    {s.status === 'online' ? <Wifi size={12} className="text-green-600" /> : <WifiOff size={12} className="text-risk-high" />}
                    <span className="font-mono">{s.id}</span>
                    <span className="text-text-secondary truncate flex-1">{h?.name}</span>
                    <span className={`px-1.5 py-0.5 rounded font-medium ${
                      s.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-secondary">Uptime: <span className="font-semibold text-text-primary">{uptime}%</span></span>
              <button onClick={() => setCurrentScreen('sensor-health')} className="text-primary font-medium flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Override Queue */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              {lang === 'en' ? 'Override Queue' : 'ओवरराइड कतार'}
            </h3>
            <div className="space-y-2">
              {actions.filter(a => a.is_override).length === 0 ? (
                <div className="text-center py-6">
                  <Shield size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-text-secondary">
                    {lang === 'en' ? 'No overrides. All rankings are system-generated.' : 'कोई ओवरराइड नहीं। सभी रैंकिंग सिस्टम-जनरेटेड हैं।'}
                  </p>
                </div>
              ) : (
                actions.filter(a => a.is_override).map(a => {
                  const h = hotspots.find(h => h.id === a.hotspot_id)!;
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">{h.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800">
                          #{a.original_rank} → #{a.rank}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">"{a.override_reason}"</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Actions Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              {lang === 'en' ? 'Action Queue' : 'कार्रवाई कतार'} ({actions.length})
            </h3>
            <button
              onClick={() => setCurrentScreen('action-list')}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              {lang === 'en' ? 'Full list' : 'पूर्ण सूची'}
              <ChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">Hotspot</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">Action</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">Deadline</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">Crew</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {actions.slice(0, 8).map(action => {
                  const h = hotspots.find(h => h.id === action.hotspot_id)!;
                  const score = riskScores.find(r => r.hotspot_id === action.hotspot_id)!;
                  const crew = crews.find(c => c.id === action.assigned_crew_id);
                  return (
                    <tr key={action.id} className="hover:bg-background/50">
                      <td className="px-4 py-2.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          score.risk_pct >= 70 ? 'bg-risk-high' : score.risk_pct >= 50 ? 'bg-risk-medium' : 'bg-risk-low'
                        }`}>{action.rank}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-text-primary">{h.name}</td>
                      <td className="px-4 py-2.5 text-text-secondary text-xs">{action.action_type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 text-text-secondary text-xs flex items-center gap-1">
                        <Clock size={11} /> {getTimeRemaining(action.deadline)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Dropdown
                          trigger={
                            <button className="text-xs px-2 py-1 rounded bg-background border border-border hover:bg-border/50">
                              {crew?.name || 'Assign'}
                            </button>
                          }
                          options={crewOptions}
                          value={action.assigned_crew_id || undefined}
                          onChange={(crewId) => assignCrew(action.id, crewId)}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        {action.status === 'done' ? (
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1 w-fit">
                            <CheckCircle size={11} /> Done
                          </span>
                        ) : (
                          <button
                            onClick={() => markActionDone(action.id)}
                            className="px-2 py-0.5 rounded bg-background border border-border text-xs text-text-secondary hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                          >
                            Mark done
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
    </div>
  );
}
