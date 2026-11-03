import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots, sensorOfflineHistory } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wifi, WifiOff, Battery, Clock, AlertCircle } from 'lucide-react';

export function SensorHealth() {
  const { lang, sensors, setSensorStatus } = useStore();

  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;
  const uptime = Math.round((onlineCount / sensors.length) * 100);

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'offline') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'online') return <Wifi size={14} className="text-green-600" />;
    if (status === 'offline') return <WifiOff size={14} className="text-red-600" />;
    return <AlertCircle size={14} className="text-yellow-600" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-text-primary">{t('sensor.title', lang)}</h2>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
            <Wifi size={14} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">{t('sensor.network_uptime', lang)}: {uptime}%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
            <WifiOff size={14} className="text-red-600" />
            <span className="text-xs font-medium text-red-700">{offlineCount} of {sensors.length} {t('sensor.offline', lang)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Offline chart */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Offline Sensors — Last 7 Days</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensorOfflineHistory}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="offline" radius={[4, 4, 0, 0]}>
                    {sensorOfflineHistory.map((entry, index) => (
                      <Cell key={index} fill={entry.offline > 2 ? '#C62828' : entry.offline > 0 ? '#F9A825' : '#2E7D32'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensor Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">Hotspot</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">{t('common.status', lang)}</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">{t('sensor.last_reading', lang)}</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">{t('sensor.last_seen', lang)}</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">{t('sensor.battery', lang)}</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sensors.map(sensor => {
                    const hotspot = hotspots.find(h => h.id === sensor.hotspot_id);
                    const isOffline = sensor.status === 'offline';
                    const lastSeen = new Date(sensor.last_seen_at);
                    const hoursAgo = Math.round((Date.now() - lastSeen.getTime()) / 3600000);

                    return (
                      <tr key={sensor.id} className={`${isOffline ? 'bg-red-50/50' : ''} hover:bg-background/50`}>
                        <td className="px-4 py-3 font-mono text-xs">{sensor.id}</td>
                        <td className="px-4 py-3 text-text-primary">{hotspot?.name || sensor.hotspot_id}</td>
                        <td className="px-4 py-3 text-text-secondary capitalize">{sensor.type.replace('_', ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sensor.status)}`}>
                            {getStatusIcon(sensor.status)}
                            {t(`sensor.${sensor.status}`, lang)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {sensor.last_reading !== null ? `${sensor.last_reading} cm` : <span className="text-text-secondary/50">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs ${isOffline ? 'text-red-600' : 'text-text-secondary'}`}>
                            <Clock size={11} />
                            {isOffline ? `${hoursAgo}h ${t('common.ago', lang)}` : lastSeen.toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs ${sensor.battery_pct < 20 ? 'text-red-600 font-medium' : 'text-text-secondary'}`}>
                            <Battery size={11} />
                            {sensor.battery_pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sensor.status !== 'offline' && (
                            <button
                              onClick={() => setSensorStatus(sensor.id, 'offline')}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              {t('sensor.report_fault', lang)}
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
    </div>
  );
}
