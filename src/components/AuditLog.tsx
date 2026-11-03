import { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots } from '../data/mockData';
import { FileText, Download, Filter, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export function AuditLog() {
  const { lang, auditLog } = useStore();
  const [filterAction, setFilterAction] = useState<string>('all');

  const filtered = filterAction === 'all'
    ? auditLog
    : auditLog.filter(e => e.action === filterAction);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'manual_override': return <AlertTriangle size={14} className="text-amber-600" />;
      case 'action_completed': return <CheckCircle size={14} className="text-green-600" />;
      case 'sensor_flagged': return <AlertTriangle size={14} className="text-red-600" />;
      default: return <FileText size={14} className="text-blue-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'system_ranking': return 'System Ranking';
      case 'manual_override': return 'Manual Override';
      case 'sensor_flagged': return 'Sensor Flagged';
      case 'alert_issued': return 'Alert Issued';
      case 'action_completed': return 'Action Completed';
      default: return action;
    }
  };

  const actionFilters = [
    { id: 'all', label: t('audit.filter_all', lang) },
    { id: 'manual_override', label: 'Overrides' },
    { id: 'system_ranking', label: 'System' },
    { id: 'sensor_flagged', label: 'Sensors' },
    { id: 'action_completed', label: 'Completed' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t('audit.title', lang)}</h2>
            <div className="mt-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 inline-flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-800">{t('audit.banner', lang)}</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-background hover:bg-border rounded-lg transition-colors">
            <Download size={14} />
            {t('audit.export', lang)}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {actionFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1
                ${filterAction === f.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}
              `}
            >
              <Filter size={10} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {filtered.map(entry => {
            const hotspot = hotspots.find(h => h.id === entry.hotspot_id);
            const isOverride = entry.action === 'manual_override';

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${isOverride ? 'border-l-4 border-l-amber-400 border-border' : 'border-border'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">{getActionLabel(entry.action)}</span>
                        <span className="text-xs text-text-secondary">·</span>
                        <span className="text-xs text-text-secondary">{entry.actor}</span>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-text-primary font-medium">{hotspot?.name || entry.hotspot_id}</span>
                      {entry.original_rank !== null && entry.new_rank !== null && (
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">#{entry.original_rank}</span>
                          <ArrowRight size={10} />
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 font-mono font-semibold">#{entry.new_rank}</span>
                        </span>
                      )}
                    </div>

                    {entry.reason && (
                      <p className="mt-1.5 text-sm text-text-secondary italic">"{entry.reason}"</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No audit entries found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
