import { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots, crews } from '../data/mockData';
import { Printer, Download, CheckCircle, AlertTriangle, ArrowUpDown, Clock, Shield, X, Users } from 'lucide-react';
import { Dropdown } from './ui/Dropdown';

function getRiskColor(riskPct: number): string {
  if (riskPct >= 70) return 'border-l-risk-high';
  if (riskPct >= 50) return 'border-l-risk-medium';
  if (riskPct >= 30) return 'border-l-risk-low';
  return 'border-l-risk-unknown';
}

function getRiskBg(riskPct: number): string {
  if (riskPct >= 70) return 'bg-red-50';
  if (riskPct >= 50) return 'bg-yellow-50';
  if (riskPct >= 30) return 'bg-green-50';
  return 'bg-gray-50';
}

function getTimeRemaining(deadline: string): string {
  const now = new Date('2026-11-04T02:00:00+05:30'); // Simulated current time
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff <= 0) return 'Overdue';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${t('common.in', 'en')} ${hours}${t('common.hours', 'en')} ${minutes}${t('common.minutes', 'en')}`;
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

export function ActionList() {
  const { lang, getRankedActions, getRiskScores, markActionDone, flagAction, overrideAction, assignCrew, addToast, activeRiskFilter, setActiveRiskFilter } = useStore();
  const [overrideModal, setOverrideModal] = useState<{ actionId: string; currentRank: number } | null>(null);
  const [newRank, setNewRank] = useState('');
  const [reason, setReason] = useState('');
  const [understandChecked, setUnderstandChecked] = useState(false);

  const allActions = getRankedActions();
  const riskScores = getRiskScores();

  // Filter actions based on activeRiskFilter
  const actions = activeRiskFilter
    ? allActions.filter(action => {
        const score = riskScores.find(r => r.hotspot_id === action.hotspot_id);
        return score && getRiskTier(score.risk_pct) === activeRiskFilter;
      })
    : allActions;

  const handleOverride = () => {
    if (!overrideModal || !newRank || !reason || !understandChecked) return;
    overrideAction(overrideModal.actionId, parseInt(newRank), reason);
    setOverrideModal(null);
    setNewRank('');
    setReason('');
    setUnderstandChecked(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">{t('action_list.title', lang)}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                {t('action_list.provisional', lang)}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {t('action_list.event_window', lang)}: 04 Nov 2026, 06:00–12:00 · {t('action_list.last_updated', lang)}: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-background hover:bg-border rounded-lg transition-colors">
              <Printer size={14} />
              {t('action_list.print', lang)}
            </button>
            <button onClick={() => addToast('PDF export started', 'info')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-background hover:bg-border rounded-lg transition-colors">
              <Download size={14} />
              {t('action_list.export', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Banner */}
      {activeRiskFilter && (
        <div
          className="px-4 py-2 flex items-center justify-between text-sm font-medium text-white"
          style={{ backgroundColor: getTierColor(activeRiskFilter) }}
        >
          <span>
            {lang === 'en'
              ? `Filtered to ${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} (${actions.length} of ${allActions.length} actions)`
              : `${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} पर फ़िल्टर किया गया (${allActions.length} में से ${actions.length} कार्रवाइयाँ)`
            }
          </span>
          <button
            onClick={() => setActiveRiskFilter(null)}
            className="flex items-center gap-1 hover:bg-white/20 rounded px-2 py-0.5 transition-colors"
          >
            {lang === 'en' ? 'Clear filter' : 'फ़िल्टर साफ़ करें'}
            <X size={12} />
          </button>
        </div>
      )}

      {/* Action List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2 max-w-5xl mx-auto">
          {actions.length === 0 && activeRiskFilter ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-2">
                {lang === 'en'
                  ? `No ${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} actions right now`
                  : `अभी कोई ${t(`risk.${activeRiskFilter}`, lang).toUpperCase()} कार्रवाई नहीं`
                }
              </p>
              <button
                onClick={() => setActiveRiskFilter(null)}
                className="text-primary hover:underline text-sm font-medium"
              >
                {lang === 'en' ? 'Clear filter' : 'फ़िल्टर साफ़ करें'}
              </button>
            </div>
          ) : (
          actions.map((action) => {
            const hotspot = hotspots.find(h => h.id === action.hotspot_id);
            const score = riskScores.find(r => r.hotspot_id === action.hotspot_id);
            const crew = crews.find(c => c.id === action.assigned_crew_id);
            if (!hotspot || !score) return null;

            const riskColor = getRiskColor(score.risk_pct);
            const riskBg = getRiskBg(score.risk_pct);
            const borderWidth = activeRiskFilter ? 'border-l-6' : 'border-l-4';

            return (
              <div
                key={action.id}
                className={`bg-white rounded-xl border border-border ${borderWidth} ${riskColor} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      score.risk_pct >= 70 ? 'bg-risk-high' :
                      score.risk_pct >= 50 ? 'bg-risk-medium' :
                      score.risk_pct >= 30 ? 'bg-risk-low' : 'bg-risk-unknown'
                    }`}>
                      #{action.rank}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-text-primary text-sm">{hotspot.name}</h3>
                          <p className="text-xs text-text-secondary">{hotspot.zone || 'Unknown zone'} · {hotspot.owning_agency}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {action.is_override && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200" title={action.override_reason}>
                              {t('override.chip', lang)}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                            score.confidence === 'high' ? 'bg-green-600' :
                            score.confidence === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {score.risk_pct}%
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-primary mt-1.5">{action.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getTimeRemaining(action.deadline)}
                        </span>
                        <Dropdown
                          trigger={
                            <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border hover:bg-border/50 transition-colors">
                              <Shield size={11} />
                              <span>{crew?.name || 'Assign crew'}</span>
                            </button>
                          }
                          options={crews.map(c => ({
                            value: c.id,
                            label: c.name,
                            group: c.available ? 'Available' : 'On duty',
                          }))}
                          value={action.assigned_crew_id || undefined}
                          onChange={(crewId) => assignCrew(action.id, crewId)}
                        />
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          action.status === 'done' ? 'bg-green-100 text-green-700' :
                          action.status === 'flagged' ? 'bg-red-100 text-red-700' :
                          action.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t(`action_list.${action.status}`, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      {action.status !== 'done' && (
                        <button
                          onClick={() => markActionDone(action.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={12} />
                          <span className="hidden sm:inline">{t('action_list.mark_done', lang)}</span>
                        </button>
                      )}
                      {action.status !== 'flagged' && action.status !== 'done' && (
                        <button
                          onClick={() => flagAction(action.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <AlertTriangle size={12} />
                          <span className="hidden sm:inline">{t('action_list.flag', lang)}</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setOverrideModal({ actionId: action.id, currentRank: action.rank }); setNewRank(''); setReason(''); setUnderstandChecked(false); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <ArrowUpDown size={12} />
                        <span className="hidden sm:inline">{t('action_list.override', lang)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="bg-white border-t border-border px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          {actions.length} actions · {actions.filter(a => a.status === 'done').length} completed
        </p>
        <button
          disabled
          className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
          title={t('action_list.provisional', lang)}
        >
          {t('action_list.rerun', lang)}
        </button>
      </div>

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{t('override.title', lang)}</h3>
              <button onClick={() => setOverrideModal(null)} className="p-1 hover:bg-background rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">{t('override.new_rank', lang)}</label>
                <input
                  type="number"
                  min="1"
                  max={actions.length}
                  value={newRank}
                  onChange={(e) => setNewRank(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder={`Current: ${overrideModal.currentRank}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">{t('override.reason', lang)}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                  rows={3}
                  placeholder="e.g. Councillor request, political priority..."
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={understandChecked}
                  onChange={(e) => setUnderstandChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <span className="text-sm text-text-secondary">{t('override.understand', lang)}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setOverrideModal(null)}
                  className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-background transition-colors"
                >
                  {t('override.cancel', lang)}
                </button>
                <button
                  onClick={handleOverride}
                  disabled={!newRank || !reason || !understandChecked}
                  className="flex-1 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('override.confirm', lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
