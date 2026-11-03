import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { hotspots, initialSensors, crews, type Hotspot, type Sensor, type RiskScore, type ActionItem, type AuditLogEntry, type Crew, type WaterlogReport } from '../data/mockData';
import type { Lang } from '../i18n/translations';

export type Role = 'ward_engineer' | 'control_room' | 'commissioner' | 'citizen';
export type Screen = 'risk-map' | 'action-list' | 'sensor-health' | 'audit-log' | 'executive-summary' | 'ward-home' | 'control-room-home' | 'citizen-home' | 'public-route-check' | 'public-alerts' | 'public-report' | 'denied';

export interface Session {
  email: string;
  name: string;
  picture: string;
  role: Role;
  signed_in_at: string;
}

const DEMO_EMAIL_MAP: Record<string, Role> = {
  'ward.engineer@mcg.gov.in': 'ward_engineer',
  'control.room@mcg.gov.in': 'control_room',
  'commissioner@mcg.gov.in': 'commissioner',
};

interface AppState {
  // Auth
  session: Session | null;
  showCitizenToast: boolean;

  // UI state
  lang: Lang;
  currentScreen: Screen;
  rainfallMm: number;
  filterType: string;
  citizenSector: string;

  // Data
  sensors: Sensor[];
  auditLog: AuditLogEntry[];
  actionItems: ActionItem[];
  waterlogReports: WaterlogReport[];
  toasts: { id: string; message: string; type: 'success' | 'info' | 'warning' }[];

  // Auth Actions
  login: (email: string, name: string, picture: string) => void;
  loginAsCitizen: () => void;
  logout: () => void;
  dismissCitizenToast: () => void;

  // UI Actions
  setLang: (lang: Lang) => void;
  setCurrentScreen: (screen: Screen) => void;
  setRainfallMm: (mm: number) => void;
  setFilterType: (type: string) => void;
  setCitizenSector: (sector: string) => void;
  setSensorStatus: (sensorId: string, status: Sensor['status']) => void;
  markActionDone: (actionId: string) => void;
  flagAction: (actionId: string) => void;
  overrideAction: (actionId: string, newRank: number, reason: string) => void;
  assignCrew: (actionId: string, crewId: string) => void;
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  addWaterlogReport: (report: Omit<WaterlogReport, 'id' | 'timestamp'>) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  getRiskScores: () => RiskScore[];
  getRankedActions: () => ActionItem[];
  resolveRole: (email: string) => Role;
}

function computeRisk(hotspot: Hotspot, rainfallMm: number, sensors: Sensor[]): RiskScore {
  const maxPop = Math.max(...hotspots.map(h => h.population_exposure));
  const popNormalized = (hotspot.population_exposure / maxPop) * 100;
  const riskPct = Math.min(100, Math.max(0,
    (rainfallMm / 150) * 60 +
    (hotspot.leverage_score / 100) * 25 +
    (popNormalized / 100) * 15
  ));

  const hotspotSensors = sensors.filter(s => s.hotspot_id === hotspot.id);
  const upstreamIds = [...hotspot.downstream_of, ...hotspot.upstream_of];
  const upstreamSensors = sensors.filter(s => upstreamIds.includes(s.hotspot_id));
  const allRelevantSensors = [...hotspotSensors, ...upstreamSensors];
  const offlineCount = allRelevantSensors.filter(s => s.status === 'offline').length;

  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (offlineCount >= 2 || allRelevantSensors.length === 0) {
    confidence = 'low';
  } else if (offlineCount >= 1) {
    confidence = 'medium';
  }

  const inputsUsed: string[] = [];
  if (rainfallMm > 0) inputsUsed.push(`Rainfall forecast: ${rainfallMm}mm`);
  inputsUsed.push(`Leverage score: ${hotspot.leverage_score}`);
  inputsUsed.push(`Population exposure: ${hotspot.population_exposure.toLocaleString()}`);
  if (offlineCount > 0) inputsUsed.push(`${offlineCount} upstream sensor(s) offline`);

  return {
    hotspot_id: hotspot.id,
    risk_pct: Math.round(riskPct),
    confidence,
    forecast_window: '2026-11-04 06:00 to 12:00',
    inputs_used: inputsUsed,
    computed_at: new Date().toISOString(),
    locked: false,
  };
}

function generateActions(riskScores: RiskScore[], rainfallMm: number): ActionItem[] {
  const actions: ActionItem[] = [];
  const eventStart = new Date('2026-11-04T06:00:00+05:30');

  riskScores.forEach(score => {
    const hotspot = hotspots.find(h => h.id === score.hotspot_id)!;
    const riskPct = score.risk_pct;

    if (riskPct >= 70 && hotspot.type === 'underpass') {
      actions.push({
        id: `ACT-${score.hotspot_id}-pump`,
        rank: 0,
        hotspot_id: score.hotspot_id,
        action_type: 'pre_position_pump',
        description: `Pre-position pump at ${hotspot.name} — downstream of critical drain node`,
        deadline: new Date(eventStart.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        assigned_crew_id: 'CRW-01',
        status: 'pending',
        is_override: false,
      });
    }

    if (riskPct >= 60 && hotspot.downstream_of.length > 0) {
      actions.push({
        id: `ACT-${score.hotspot_id}-desilt`,
        rank: 0,
        hotspot_id: score.hotspot_id,
        action_type: 'desilt_node',
        description: `Desilt ${hotspot.name} — upstream work required earliest`,
        deadline: new Date(eventStart.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        assigned_crew_id: 'CRW-03',
        status: 'pending',
        is_override: false,
      });
    }

    if (riskPct >= 50 && hotspot.owning_agency !== 'MCG') {
      actions.push({
        id: `ACT-${score.hotspot_id}-inspect`,
        rank: 0,
        hotspot_id: score.hotspot_id,
        action_type: 'inspect',
        description: `Inspect ${hotspot.name} and notify ${hotspot.owning_agency}`,
        deadline: new Date(eventStart.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        assigned_crew_id: 'CRW-05',
        status: 'pending',
        is_override: false,
      });
    }

    if (riskPct >= 60) {
      const tier = riskPct >= 70 ? 'action' : 'advisory';
      actions.push({
        id: `ACT-${score.hotspot_id}-alert`,
        rank: 0,
        hotspot_id: score.hotspot_id,
        action_type: 'issue_alert',
        description: `Issue ${tier} alert for ${hotspot.name}`,
        deadline: new Date(eventStart.getTime() - (tier === 'action' ? 6 : 12) * 60 * 60 * 1000).toISOString(),
        assigned_crew_id: 'CRW-04',
        status: 'pending',
        is_override: false,
      });
    }
  });

  const ranked = actions.map(action => {
    const score = riskScores.find(s => s.hotspot_id === action.hotspot_id)!;
    const hotspot = hotspots.find(h => h.id === action.hotspot_id)!;
    const crew = crews.find(c => c.id === action.assigned_crew_id);
    const travelTime = crew?.travel_minutes_to[action.hotspot_id] || 30;
    const travelInverse = Math.max(0, 100 - travelTime);
    const priority = score.risk_pct * 0.6 + hotspot.leverage_score * 0.3 + travelInverse * 0.1;
    return { ...action, _priority: priority };
  });

  ranked.sort((a, b) => b._priority - a._priority);
  return ranked.map((a, i) => ({ ...a, rank: i + 1 } as ActionItem));
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      showCitizenToast: false,
      lang: (localStorage.getItem('gfc-lang') as Lang) || 'en',
      currentScreen: 'citizen-home',
      rainfallMm: 85,
      filterType: 'all',
      citizenSector: '',
      sensors: initialSensors,
      auditLog: [
        { id: 'AL-001', timestamp: '2026-11-04T05:00:00+05:30', actor: 'System', action: 'system_ranking', hotspot_id: 'HSP-005', original_rank: null, new_rank: 1, reason: 'Highest leverage score + rainfall forecast' },
        { id: 'AL-002', timestamp: '2026-11-04T05:00:00+05:30', actor: 'System', action: 'sensor_flagged', hotspot_id: 'HSP-004', original_rank: null, new_rank: null, reason: 'Sensor S-04 offline — confidence downgraded' },
      ],
      actionItems: [],
      waterlogReports: [],
      toasts: [],

      resolveRole: (email) => {
        return DEMO_EMAIL_MAP[email] || 'citizen';
      },

      login: (email, name, picture) => {
        const role = get().resolveRole(email);
        const session: Session = { email, name, picture, role, signed_in_at: new Date().toISOString() };
        const screenMap: Record<Role, Screen> = {
          ward_engineer: 'ward-home',
          control_room: 'control-room-home',
          commissioner: 'executive-summary',
          citizen: 'citizen-home',
        };
        set({ session, currentScreen: screenMap[role] });
        if (role === 'citizen') {
          set({ showCitizenToast: true });
        }
      },

      loginAsCitizen: () => {
        const session: Session = {
          email: 'citizen@guest.local',
          name: 'Guest Citizen',
          picture: '',
          role: 'citizen',
          signed_in_at: new Date().toISOString(),
        };
        set({ session, currentScreen: 'citizen-home' });
      },

      logout: () => {
        set({ session: null, currentScreen: 'citizen-home' });
      },

      dismissCitizenToast: () => set({ showCitizenToast: false }),

      setLang: (lang) => {
        localStorage.setItem('gfc-lang', lang);
        set({ lang });
      },
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setRainfallMm: (mm) => set({ rainfallMm: mm }),
      setFilterType: (type) => set({ filterType: type }),
      setCitizenSector: (sector) => set({ citizenSector: sector }),

      setSensorStatus: (sensorId, status) => {
        set(state => ({
          sensors: state.sensors.map(s => s.id === sensorId ? { ...s, status, last_seen_at: status === 'offline' ? new Date(Date.now() - 6 * 3600000).toISOString() : new Date().toISOString() } : s),
        }));
        const sensor = get().sensors.find(s => s.id === sensorId);
        if (sensor) {
          get().addAuditEntry({
            actor: 'Control Room Supervisor',
            action: 'sensor_flagged',
            hotspot_id: sensor.hotspot_id,
            original_rank: null,
            new_rank: null,
            reason: `Sensor ${sensorId} marked ${status}`,
          });
        }
      },

      markActionDone: (actionId) => {
        set(state => ({
          actionItems: state.actionItems.map(a => a.id === actionId ? { ...a, status: 'done' as const } : a),
        }));
        const action = get().actionItems.find(a => a.id === actionId);
        if (action) {
          get().addAuditEntry({
            actor: 'Ward Engineer',
            action: 'action_completed',
            hotspot_id: action.hotspot_id,
            original_rank: action.rank,
            new_rank: action.rank,
            reason: 'Action marked complete',
          });
          get().addToast('Action marked done', 'success');
        }
      },

      flagAction: (actionId) => {
        set(state => ({
          actionItems: state.actionItems.map(a => a.id === actionId ? { ...a, status: 'flagged' as const } : a),
        }));
        get().addToast('Issue flagged', 'warning');
      },

      overrideAction: (actionId, newRank, reason) => {
        set(state => {
          const action = state.actionItems.find(a => a.id === actionId);
          if (!action) return state;
          const updated = state.actionItems.map(a => {
            if (a.id === actionId) {
              return { ...a, rank: newRank, is_override: true, override_reason: reason, original_rank: action.rank };
            }
            return a;
          });
          updated.sort((a, b) => a.rank - b.rank);
          const renumbered = updated.map((a, i) => ({ ...a, rank: i + 1 }));
          return { actionItems: renumbered };
        });
        const action = get().actionItems.find(a => a.id === actionId);
        if (action) {
          get().addAuditEntry({
            actor: 'Control Room Supervisor',
            action: 'manual_override',
            hotspot_id: action.hotspot_id,
            original_rank: action.original_rank || null,
            new_rank: action.rank,
            reason,
          });
          get().addToast('Override logged', 'warning');
        }
      },

      assignCrew: (actionId, crewId) => {
        set(state => ({
          actionItems: state.actionItems.map(a => a.id === actionId ? { ...a, assigned_crew_id: crewId } : a),
        }));
      },

      addAuditEntry: (entry) => {
        const newEntry: AuditLogEntry = {
          ...entry,
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({ auditLog: [newEntry, ...state.auditLog] }));
      },

      addWaterlogReport: (report) => {
        const newReport: WaterlogReport = {
          ...report,
          id: `WR-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({ waterlogReports: [...state.waterlogReports, newReport] }));
        get().addToast('Report submitted. Thank you!', 'success');
      },

      addToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}`;
        set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      },

      getRiskScores: () => {
        const { rainfallMm, sensors } = get();
        return hotspots.map(h => computeRisk(h, rainfallMm, sensors));
      },

      getRankedActions: () => {
        const { rainfallMm, sensors, actionItems: stored } = get();
        const riskScores = hotspots.map(h => computeRisk(h, rainfallMm, sensors));
        const freshActions = generateActions(riskScores, rainfallMm);

        const merged = freshActions.map(action => {
          const storedAction = stored.find(s => s.id === action.id);
          if (storedAction) {
            return {
              ...action,
              status: storedAction.status,
              is_override: storedAction.is_override,
              override_reason: storedAction.override_reason,
              original_rank: storedAction.original_rank,
              rank: storedAction.is_override ? storedAction.rank : action.rank,
              assigned_crew_id: storedAction.assigned_crew_id || action.assigned_crew_id,
            };
          }
          return action;
        });

        merged.sort((a, b) => a.rank - b.rank);
        return merged.map((a, i) => ({ ...a, rank: i + 1 }));
      },
    }),
    {
      name: 'gfc-store',
      partialize: (state) => ({
        lang: state.lang,
        session: state.session,
        sensors: state.sensors,
        auditLog: state.auditLog,
        actionItems: state.actionItems,
        waterlogReports: state.waterlogReports,
        citizenSector: state.citizenSector,
      }),
    }
  )
);
