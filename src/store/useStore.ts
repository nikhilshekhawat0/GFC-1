import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mcgHotspots,
  initialSensors,
  crews,
  type McgHotspot,
  type Sensor,
  type CauseCategory,
} from '../data/mcgHotspots';
import type { Lang } from '../i18n/translations';
import {
  supabase,
  isSupabaseConfigured,
  fetchSupabaseSnapshot,
  persistFloodReport,
  updateFloodReportStatusInDb,
  persistDispatchAction,
  persistAuditLog,
  persistAlertSubscription,
  type FloodReportRecord,
  type DispatchActionRecord,
  type AuditLogRecord,
  type AlertSubscriptionRecord,
} from '../lib/supabase';

export type Role = 'citizen' | 'ward_engineer' | 'command_authority';
export type ThemeMode = 'dark' | 'light';
export type ActiveView =
  | 'map'
  | 'route'
  | 'report'
  | 'alerts'
  | 'accuracy'
  | 'settings'
  | 'dispatch'
  | 'sensors'
  | 'audit'
  | 'executive'
  | 'citizen-login'
  | 'authority-login';

export interface CitizenUser {
  name: string;
  phone: string;
  address: string;
  wardNo?: number;
  signedInAt: string;
}

export interface AuthorityUser {
  name: string;
  employeeId: string;
  role: 'ward_engineer' | 'command_authority';
  department: 'MCG' | 'GMDA' | 'NHAI';
  signedInAt: string;
}

export interface LiveWeatherData {
  source: string;
  fetchedAt: string;
  location: string;
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  currentRainMmHr: number;
  sixHourForecastMm: number;
  condition: string;
  hourlySeries: Array<{ hour: string; rainMm: number; probabilityPct: number }>;
}

export interface AiBriefingData {
  generatedAt: string;
  model: string;
  headline: string;
  executiveSummary: string;
  priorityWards: Array<{
    wardLabel: string;
    actionDirective: string;
    officerToAlert: string;
  }>;
  interAgencyDirectives: string[];
  pumpReallocationAdvice: string;
}

export interface HotspotTelemetry {
  hotspotId: string;
  riskPct: number;
  waterDepthCm: number;
  tier: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  slaTier: 1 | 2 | 3 | 4 | 5;
  slaRemainingMins: number;
  sparkline: number[];
  citizenReportCount: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  heading?: number | null;
  updatedAt: string;
  focusNonce: number;
}

export interface ReportDraft {
  hotspotId: string;
  customLocation: string;
  description: string;
  lat: number;
  lng: number;
  locationMode: 'gps' | 'ward';
  gpsAccuracy: number | null;
}

export type SosIncidentType =
  | 'person_injured'
  | 'road_accident'
  | 'vehicle_submerged'
  | 'electric_hazard'
  | 'other';

export interface EmergencySosRecord {
  id: string;
  incidentType: SosIncidentType;
  injuredCount: number;
  locationLabel: string;
  lat: number | null;
  lng: number | null;
  description: string;
  callerPhone: string;
  createdAt: string;
  status: 'dispatched';
}

interface AppState {
  theme: ThemeMode;
  lang: Lang;
  role: Role;
  activeView: ActiveView;

  // Environmental & Timeline Simulation
  rainfallMm: number;
  timelineHourOffset: number; // -6 to +12
  isPlayingTimeline: boolean;
  pumpMitigationActive: boolean;
  liveWeather: LiveWeatherData | null;
  weatherLoading: boolean;

  // Geospatial Filters
  selectedZone: 'all' | 1 | 2 | 3 | 4;
  selectedWard: 'all' | number;
  selectedCause: 'all' | CauseCategory;
  selectedCriticality: 'all' | 'critical' | 'high' | 'normal';
  searchQuery: string;
  selectedHotspotId: string | null;
  highlightedHotspotIds: string[];
  userLocation: UserLocation | null;

  // Operational Data
  sensors: Sensor[];
  floodReports: FloodReportRecord[];
  sosReports: EmergencySosRecord[];
  dispatchRecords: Record<string, DispatchActionRecord>;
  auditLog: AuditLogRecord[];
  alertSubscriptions: AlertSubscriptionRecord[];
  aiBriefing: AiBriefingData | null;
  aiBriefingLoading: boolean;
  supabaseSynced: boolean;
  toasts: ToastItem[];

  // Layout Sidebar Collapse State
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;

  // Auth State (Citizen phone+address & separate Authority Employee ID login)
  citizenUser: CitizenUser | null;
  registeredCitizens: CitizenUser[];
  authorityUser: AuthorityUser | null;
  postLoginRedirect: ActiveView | null;
  draftReport: ReportDraft | null;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setLang: (lang: Lang) => void;
  setRole: (role: Role) => void;
  setActiveView: (view: ActiveView) => void;
  toggleLeftSidebar: () => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  toggleRightSidebar: () => void;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  setPostLoginRedirect: (view: ActiveView | null) => void;
  setDraftReport: (draft: ReportDraft | null) => void;
  signInCitizen: (user: Omit<CitizenUser, 'signedInAt'>) => void;
  signInCitizenByPhone: (phone: string) => CitizenUser | null;
  signOutCitizen: () => void;
  signInAuthority: (user: Omit<AuthorityUser, 'signedInAt'>) => void;
  signOutAuthority: () => void;
  setRainfallMm: (mm: number) => void;
  setTimelineHourOffset: (offset: number) => void;
  setIsPlayingTimeline: (playing: boolean) => void;
  togglePumpMitigation: () => void;
  setSelectedZone: (zone: 'all' | 1 | 2 | 3 | 4) => void;
  setSelectedWard: (ward: 'all' | number) => void;
  setSelectedCause: (cause: 'all' | CauseCategory) => void;
  setSelectedCriticality: (crit: 'all' | 'critical' | 'high' | 'normal') => void;
  setSearchQuery: (q: string) => void;
  setSelectedHotspotId: (id: string | null) => void;
  setHighlightedHotspotIds: (ids: string[]) => void;
  setUserLocation: (
    loc: Omit<UserLocation, 'focusNonce'> | null,
    focusMap?: boolean
  ) => void;

  fetchLiveWeather: (syncRainfall?: boolean) => Promise<void>;
  initSupabaseAndRealtime: () => Promise<void>;
  submitFloodReport: (report: FloodReportRecord) => Promise<void>;
  submitSosReport: (
    report: Omit<EmergencySosRecord, 'id' | 'createdAt' | 'status'>
  ) => Promise<EmergencySosRecord>;
  updateFloodReportStatus: (id: string, status: FloodReportRecord['status']) => Promise<void>;
  markHotspotCleared: (hotspotId: string) => Promise<void>;
  deployPumpToHotspot: (hotspotId: string) => Promise<void>;
  escalateHotspotSla: (hotspotId: string) => Promise<void>;
  flagHotspotBlocker: (hotspotId: string, note?: string) => Promise<void>;
  overrideHotspotRank: (hotspotId: string, newRank: number, reason: string) => Promise<void>;
  setSensorStatus: (sensorId: string, status: Sensor['status']) => Promise<void>;
  subscribeAlerts: (sub: Omit<AlertSubscriptionRecord, 'id' | 'created_at'>) => Promise<void>;
  generateAiBriefing: () => Promise<void>;
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

const INITIAL_REPORTS: FloodReportRecord[] = [
  {
    id: 'WR-SEED-01',
    hotspot_id: 'MCG-077',
    ward_no: 20,
    location_name: 'Village Ghata Under Pass',
    lat: 28.42204,
    lng: 77.1096,
    description: 'Knee-deep runoff pooling at underpass dip, 2 cars stalled near exit ramp.',
    ai_severity: 'critical',
    ai_depth_cm: 48,
    ai_blocked_drain: true,
    ai_recommended_agency: 'GMDA',
    ai_summary: 'Severe underpass accumulation confirmed; immediate high-head pump deployment & traffic diversion needed.',
    ai_confidence: 92,
    status: 'verified',
    created_at: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    id: 'WR-SEED-02',
    hotspot_id: 'MCG-004',
    ward_no: 2,
    location_name: 'Sunar Wali Gali Dundahera',
    lat: 28.515706,
    lng: 77.072096,
    description: 'Street 4ft lower than main road is filling rapidly; portable pump needed urgently.',
    ai_severity: 'high',
    ai_depth_cm: 32,
    ai_blocked_drain: true,
    ai_recommended_agency: 'MCG',
    ai_summary: 'Low-lying residential pocket collecting surface runoff; verify Ward 2 suction pump activation.',
    ai_confidence: 88,
    status: 'dispatched',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'WR-SEED-03',
    hotspot_id: 'MCG-087',
    ward_no: 21,
    location_name: 'Wazirabad Dhani Chowk',
    lat: 28.439479,
    lng: 77.088836,
    description: 'GMDA master storm line backing up near Community Center junction.',
    ai_severity: 'critical',
    ai_depth_cm: 44,
    ai_blocked_drain: true,
    ai_recommended_agency: 'GMDA',
    ai_summary: 'Master drain backflow triggered by Chakkarpur Bandh surge; coordinate GMDA + Ward 21 JE.',
    ai_confidence: 90,
    status: 'pending',
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
  },
];

const INITIAL_AUDIT: AuditLogRecord[] = [
  {
    id: 'AL-SEED-01',
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    actor: 'System Telemetry',
    action: 'system_ranking',
    hotspot_id: 'MCG-087',
    original_rank: null,
    new_rank: 1,
    reason: 'GMDA master drain backflow + Chakkarpur Bandh upstream surge',
  },
  {
    id: 'AL-SEED-02',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    actor: 'Sensor Watchdog',
    action: 'sensor_flagged',
    hotspot_id: 'MCG-096',
    original_rank: null,
    new_rank: null,
    reason: 'CCTV Node S-04 offline near Sheeba Apartment Sec-28 — confidence adjusted',
  },
  {
    id: 'AL-SEED-03',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    actor: 'Gemini AI Triage',
    action: 'citizen_report_triaged',
    hotspot_id: 'MCG-077',
    original_rank: null,
    new_rank: null,
    reason: 'Citizen report verified critical (48 cm depth) at Village Ghata Underpass',
  },
];

// Deterministic bell-curve hydrograph factor for timeline offset (-6 to +12 hours)
export function getTimelineHydroFactor(hourOffset: number): number {
  // Peak occurs around T+1h to T+3h; recedes after T+6h
  const peak = 2;
  const spread = 4.8;
  const curve = Math.exp(-Math.pow(hourOffset - peak, 2) / (2 * spread * spread));
  return 0.28 + 0.85 * curve;
}

export function computeHotspotTelemetry(
  hotspot: McgHotspot,
  rainfallMm: number,
  timelineHourOffset: number,
  pumpMitigationActive: boolean,
  sensors: Sensor[],
  floodReports: FloodReportRecord[],
  dispatchRecord?: DispatchActionRecord
): HotspotTelemetry {
  const hydro = getTimelineHydroFactor(timelineHourOffset);
  const rainFactor = Math.min(1, rainfallMm / 130);

  const causeWeight =
    hotspot.causeCategory === 'gmda_backflow'
      ? 18
      : hotspot.causeCategory === 'no_master_drain'
        ? 15
        : hotspot.causeCategory === 'telecom_obstruction'
          ? 14
          : hotspot.causeCategory === 'silt_blockage'
            ? 12
            : hotspot.causeCategory === 'critical_junction'
              ? 16
              : 8;

  const critWeight =
    hotspot.criticality === 'critical' ? 22 : hotspot.criticality === 'high' ? 12 : 4;

  const activeReports = floodReports.filter(
    (r) => r.hotspot_id === hotspot.id && r.status !== 'resolved'
  );
  const reportBoost = Math.min(18, activeReports.length * 9);

  let rawRisk =
    (rainFactor * 46 + (hotspot.leverageScore / 100) * 16 + causeWeight + critWeight) * hydro +
    reportBoost;

  if (pumpMitigationActive) {
    rawRisk *= hotspot.type === 'underpass' ? 0.68 : 0.78;
  }
  if (dispatchRecord?.status === 'done') {
    rawRisk *= 0.35;
  } else if (dispatchRecord?.status === 'in_progress') {
    rawRisk *= 0.72;
  }

  const riskPct = Math.round(Math.min(99, Math.max(8, rawRisk)));
  const waterDepthCm = Math.round(
    Math.max(2, (riskPct / 100) * (hotspot.type === 'underpass' ? 92 : 58))
  );

  const tier: HotspotTelemetry['tier'] =
    riskPct >= 75 ? 'critical' : riskPct >= 55 ? 'high' : riskPct >= 35 ? 'medium' : 'low';

  // Confidence from nearby sensors + citizen reports
  const localSensors = sensors.filter((s) => s.hotspot_id === hotspot.id);
  const offlineCount = localSensors.filter((s) => s.status === 'offline').length;
  let confidence: HotspotTelemetry['confidence'] = 'high';
  if (offlineCount > 0 && activeReports.length === 0) confidence = 'medium';
  if (localSensors.length === 0 && activeReports.length === 0 && hotspot.gpsStatus === 'corrected') {
    confidence = 'medium';
  }
  if (offlineCount >= 2) confidence = 'low';

  // SLA Tier (1=Operator -> 2=Sanitation Sup -> 3=ASI -> 4=JE -> 5=AE)
  const baseSlaTier =
    dispatchRecord?.sla_tier ??
    (riskPct >= 80 ? 4 : riskPct >= 60 ? 3 : riskPct >= 45 ? 2 : 1);
  const slaTier = Math.min(5, Math.max(1, baseSlaTier)) as 1 | 2 | 3 | 4 | 5;
  const slaRemainingMins =
    dispatchRecord?.status === 'done'
      ? 0
      : Math.max(5, Math.round(120 - riskPct * 0.95 - Math.max(0, timelineHourOffset) * 6));

  // 13-point sparkline from T-6h to T+6h
  const sparkline = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((h) => {
    const hFactor = getTimelineHydroFactor(h);
    let val =
      (rainFactor * 46 + (hotspot.leverageScore / 100) * 16 + causeWeight + critWeight) * hFactor +
      (h >= 0 ? reportBoost * 0.6 : 0);
    if (pumpMitigationActive && h >= 0) val *= 0.74;
    return Math.round(Math.min(99, Math.max(6, val)));
  });

  return {
    hotspotId: hotspot.id,
    riskPct,
    waterDepthCm,
    tier,
    confidence,
    slaTier,
    slaRemainingMins,
    sparkline,
    citizenReportCount: activeReports.length,
  };
}

let realtimeChannelInitialized = false;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      lang: 'en',
      role: 'citizen',
      activeView: 'map',

      rainfallMm: 88,
      timelineHourOffset: 0,
      isPlayingTimeline: false,
      pumpMitigationActive: false,
      liveWeather: null,
      weatherLoading: false,

      selectedZone: 'all',
      selectedWard: 'all',
      selectedCause: 'all',
      selectedCriticality: 'all',
      searchQuery: '',
      selectedHotspotId: null,
      highlightedHotspotIds: [],
      userLocation: null,

      sensors: initialSensors,
      floodReports: INITIAL_REPORTS,
      sosReports: [],
      dispatchRecords: {},
      auditLog: INITIAL_AUDIT,
      alertSubscriptions: [],
      aiBriefing: null,
      aiBriefingLoading: false,
      supabaseSynced: false,
      toasts: [],
      leftSidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      rightSidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      citizenUser: null,
      registeredCitizens: [],
      authorityUser: null,
      postLoginRedirect: null,
      draftReport: null,

      toggleTheme: () => {
        const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      setLang: (lang) => set({ lang }),

      setRole: (role) => {
        if (role !== 'citizen' && !get().authorityUser) {
          set({ activeView: 'authority-login' });
          return;
        }
        const currentView = get().activeView;
        const citizenViews: ActiveView[] = ['map', 'route', 'report', 'alerts', 'accuracy', 'settings'];
        const opsViews: ActiveView[] = ['map', 'dispatch', 'sensors', 'audit', 'executive', 'settings'];
        let nextView = currentView;
        if (role === 'citizen' && !citizenViews.includes(currentView)) nextView = 'map';
        if (role !== 'citizen' && !opsViews.includes(currentView)) nextView = 'dispatch';
        set({ role, activeView: nextView });
      },

      setActiveView: (activeView) =>
        set((state) => ({
          activeView,
          postLoginRedirect:
            activeView === 'citizen-login' || activeView === 'authority-login'
              ? state.postLoginRedirect
              : null,
          ...(typeof window !== 'undefined' && window.innerWidth < 768
            ? { leftSidebarCollapsed: true }
            : {}),
        })),
      toggleLeftSidebar: () => set((s) => ({ leftSidebarCollapsed: !s.leftSidebarCollapsed })),
      setLeftSidebarCollapsed: (leftSidebarCollapsed) => set({ leftSidebarCollapsed }),
      toggleRightSidebar: () => set((s) => ({ rightSidebarCollapsed: !s.rightSidebarCollapsed })),
      setRightSidebarCollapsed: (rightSidebarCollapsed) => set({ rightSidebarCollapsed }),
      setPostLoginRedirect: (postLoginRedirect) => set({ postLoginRedirect }),
      setDraftReport: (draftReport) => set({ draftReport }),

      signInCitizen: (user) => {
        const signedIn: CitizenUser = {
          ...user,
          signedInAt: new Date().toISOString(),
        };
        const redirect = get().postLoginRedirect;
        const existing = get().registeredCitizens.filter((c) => c.phone !== signedIn.phone);
        set({
          citizenUser: signedIn,
          registeredCitizens: [signedIn, ...existing],
          role: 'citizen',
          postLoginRedirect: null,
          activeView: redirect || (get().activeView === 'citizen-login' ? 'map' : get().activeView),
        });
        get().addToast(
          get().lang === 'hi' ? `स्वागत है, ${signedIn.name}।` : `Welcome, ${signedIn.name}.`,
          'success'
        );
      },

      signInCitizenByPhone: (phone) => {
        const digits = phone.replace(/\D/g, '').slice(-10);
        const found = get().registeredCitizens.find((c) => c.phone === digits);
        if (!found) return null;
        const updated: CitizenUser = { ...found, signedInAt: new Date().toISOString() };
        const redirect = get().postLoginRedirect;
        set({
          citizenUser: updated,
          role: 'citizen',
          postLoginRedirect: null,
          activeView: redirect || (get().activeView === 'citizen-login' ? 'map' : get().activeView),
        });
        get().addToast(
          get().lang === 'hi' ? `वापसी पर स्वागत है, ${updated.name}।` : `Welcome back, ${updated.name}.`,
          'success'
        );
        return updated;
      },

      signOutCitizen: () => {
        set({ citizenUser: null });
        get().addToast(
          get().lang === 'hi' ? 'निवासी खाते से साइन आउट हो गया' : 'Signed out of resident account',
          'info'
        );
      },

      signInAuthority: (user) => {
        const signedIn: AuthorityUser = {
          ...user,
          signedInAt: new Date().toISOString(),
        };
        const redirect = get().postLoginRedirect;
        set({
          authorityUser: signedIn,
          role: signedIn.role,
          postLoginRedirect: null,
          activeView: redirect || 'dispatch',
        });
        get().addToast(
          get().lang === 'hi'
            ? `${signedIn.name} (${signedIn.employeeId}) के रूप में साइन इन`
            : `Signed in as ${signedIn.name} (${signedIn.employeeId})`,
          'success'
        );
      },

      signOutAuthority: () => {
        set({
          authorityUser: null,
          role: 'citizen',
          activeView: 'map',
        });
        get().addToast(
          get().lang === 'hi' ? 'नगर निगम अधिकारी पोर्टल से साइन आउट हो गया' : 'Signed out of Municipal Authority portal',
          'info'
        );
      },
      setRainfallMm: (rainfallMm) => set({ rainfallMm }),
      setTimelineHourOffset: (timelineHourOffset) => set({ timelineHourOffset }),
      setIsPlayingTimeline: (isPlayingTimeline) => set({ isPlayingTimeline }),
      togglePumpMitigation: () => {
        const next = !get().pumpMitigationActive;
        const hi = get().lang === 'hi';
        set({ pumpMitigationActive: next });
        get().addToast(
          next
            ? hi
              ? 'प्रमुख अंडरपास पर पंप पूर्व-तैनाती सिमुलेशन सक्रिय'
              : 'Pump pre-positioning simulation active across critical underpasses'
            : hi
              ? 'पंप तैनाती सिमुलेशन बंद किया गया'
              : 'Pump mitigation simulation disabled',
          'info'
        );
      },

      setSelectedZone: (selectedZone) => set({ selectedZone, selectedWard: 'all' }),
      setSelectedWard: (selectedWard) => set({ selectedWard }),
      setSelectedCause: (selectedCause) => set({ selectedCause }),
      setSelectedCriticality: (selectedCriticality) => set({ selectedCriticality }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedHotspotId: (selectedHotspotId) =>
        set((state) => ({
          selectedHotspotId,
          rightSidebarCollapsed: selectedHotspotId ? false : state.rightSidebarCollapsed,
          ...(selectedHotspotId && typeof window !== 'undefined' && window.innerWidth < 768
            ? { leftSidebarCollapsed: true }
            : {}),
        })),
      setHighlightedHotspotIds: (highlightedHotspotIds) => set({ highlightedHotspotIds }),
      setUserLocation: (loc, focusMap = false) =>
        set((state) => {
          if (!loc) return { userLocation: null };
          const nextNonce = focusMap
            ? (state.userLocation?.focusNonce || 0) + 1
            : state.userLocation?.focusNonce || 0;
          return {
            userLocation: { ...loc, focusNonce: nextNonce },
            ...(focusMap ? { selectedHotspotId: null } : {}),
          };
        }),

      fetchLiveWeather: async (syncRainfall = false) => {
        set({ weatherLoading: true });
        try {
          const res = await fetch('/api/weather/gurugram');
          if (!res.ok) throw new Error('Weather API failed');
          const data = (await res.json()) as LiveWeatherData;
          set({
            liveWeather: data,
            weatherLoading: false,
            ...(syncRainfall && data.sixHourForecastMm > 5
              ? { rainfallMm: Math.min(150, Math.max(15, data.sixHourForecastMm)) }
              : {}),
          });
          if (syncRainfall) {
            get().addToast(
              get().lang === 'hi'
                ? `गुरुग्राम लाइव पूर्वानुमान सिंक: ${data.sixHourForecastMm} मिमी / 6 घंटे`
                : `Synced Gurugram live forecast: ${data.sixHourForecastMm}mm / 6h`,
              'info'
            );
          }
        } catch {
          set({ weatherLoading: false });
        }
      },

      initSupabaseAndRealtime: async () => {
        if (!isSupabaseConfigured || !supabase || realtimeChannelInitialized) return;
        realtimeChannelInitialized = true;

        const snapshot = await fetchSupabaseSnapshot();
        if (snapshot) {
          const dispatchMap: Record<string, DispatchActionRecord> = {};
          snapshot.dispatches.forEach((d) => {
            dispatchMap[d.hotspot_id] = d;
          });
          set((state) => ({
            floodReports: snapshot.reports.length > 0 ? snapshot.reports : state.floodReports,
            dispatchRecords: Object.keys(dispatchMap).length > 0 ? dispatchMap : state.dispatchRecords,
            auditLog: snapshot.audits.length > 0 ? snapshot.audits : state.auditLog,
            supabaseSynced: true,
          }));
        }

        supabase
          .channel('gfc-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'flood_reports' },
            (payload) => {
              const row = payload.new as FloodReportRecord;
              if (!row?.id) return;
              set((state) => {
                const exists = state.floodReports.some((r) => r.id === row.id);
                return {
                  floodReports: exists
                    ? state.floodReports.map((r) => (r.id === row.id ? row : r))
                    : [row, ...state.floodReports],
                };
              });
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'dispatch_actions' },
            (payload) => {
              const row = payload.new as DispatchActionRecord;
              if (!row?.hotspot_id) return;
              set((state) => ({
                dispatchRecords: { ...state.dispatchRecords, [row.hotspot_id]: row },
              }));
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'audit_logs' },
            (payload) => {
              const row = payload.new as AuditLogRecord;
              if (!row?.id) return;
              set((state) => {
                if (state.auditLog.some((a) => a.id === row.id)) return state;
                return { auditLog: [row, ...state.auditLog] };
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              set({ supabaseSynced: true });
            }
          });
      },

      submitFloodReport: async (report) => {
        set((state) => ({
          floodReports: [report, ...state.floodReports],
        }));

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Gemini AI Triage',
          action: 'citizen_report_triaged',
          hotspot_id: report.hotspot_id || report.location_name,
          original_rank: null,
          new_rank: null,
          reason: `Citizen report (${report.ai_severity.toUpperCase()}, ~${report.ai_depth_cm}cm): ${report.ai_summary || report.description}`,
        };

        set((state) => ({ auditLog: [auditEntry, ...state.auditLog] }));

        await Promise.all([persistFloodReport(report), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi'
            ? 'जलभराव रिपोर्ट सत्यापित और कमांड पैनल को भेजी गई'
            : 'Flood report verified & broadcast to Command HUD',
          'success'
        );
      },

      submitSosReport: async (input) => {
        const record: EmergencySosRecord = {
          ...input,
          id: `SOS-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
          status: 'dispatched',
        };

        const incidentLabelMap: Record<SosIncidentType, string> = {
          person_injured: 'Person Injured',
          road_accident: 'Road Accident',
          vehicle_submerged: 'Vehicle Submerged',
          electric_hazard: 'Electric Wire Hazard',
          other: 'Emergency Incident',
        };

        const coordsSuffix =
          record.lat !== null && record.lng !== null
            ? ` (${record.lat.toFixed(5)}, ${record.lng.toFixed(5)})`
            : '';

        const auditEntry: AuditLogRecord = {
          id: `AL-SOS-${Date.now()}`,
          timestamp: record.createdAt,
          actor: 'Emergency SOS',
          action: 'alert_issued',
          hotspot_id: record.locationLabel || 'Gurugram Live GPS',
          original_rank: null,
          new_rank: null,
          reason: `${incidentLabelMap[record.incidentType]}${
            record.injuredCount > 0 ? ` · ${record.injuredCount} injured` : ''
          }${coordsSuffix}: ${record.description}`,
        };

        set((state) => ({
          sosReports: [record, ...state.sosReports],
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await persistAuditLog(auditEntry);
        get().addToast(
          get().lang === 'hi'
            ? `आपातकालीन SOS ${record.id} दर्ज और त्वरित प्रतिक्रिया के लिए चिह्नित`
            : `Emergency SOS ${record.id} logged & flagged for immediate response`,
          'warning'
        );
        return record;
      },

      updateFloodReportStatus: async (id, status) => {
        set((state) => ({
          floodReports: state.floodReports.map((r) => (r.id === id ? { ...r, status } : r)),
        }));
        await updateFloodReportStatusInDb(id, status);
        get().addToast(
          get().lang === 'hi' ? `रिपोर्ट की स्थिति ${status} अपडेट हुई` : `Report marked ${status}`,
          'info'
        );
      },

      markHotspotCleared: async (hotspotId) => {
        const hotspot = mcgHotspots.find((h) => h.id === hotspotId);
        if (!hotspot) return;
        const existing = get().dispatchRecords[hotspotId];
        const crew = crews.find((c) => c.zone === hotspot.zone) || crews[0];

        const record: DispatchActionRecord = {
          id: existing?.id || `DSP-${hotspotId}`,
          hotspot_id: hotspotId,
          ward_no: hotspot.wardNo,
          action_type: existing?.action_type || 'desilt_and_pump',
          description: existing?.description || `Cleared waterlogging at ${hotspot.name}`,
          assigned_crew_id: existing?.assigned_crew_id || crew.id,
          sla_tier: existing?.sla_tier || 3,
          sla_deadline: existing?.sla_deadline || new Date(Date.now() + 3600000).toISOString(),
          status: 'done',
          is_override: existing?.is_override || false,
          override_reason: existing?.override_reason,
          original_rank: existing?.original_rank,
          rank_override: existing?.rank_override,
          updated_by: get().role === 'command_authority' ? 'Command Authority' : 'Ward Engineer',
          updated_at: new Date().toISOString(),
        };

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: record.updated_by,
          action: 'action_completed',
          hotspot_id: hotspotId,
          original_rank: existing?.rank_override || null,
          new_rank: null,
          reason: `Hotspot cleared by ${crew.name} (Ward ${hotspot.wardNo})`,
        };

        set((state) => ({
          dispatchRecords: { ...state.dispatchRecords, [hotspotId]: record },
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await Promise.all([persistDispatchAction(record), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi' ? `${hotspot.name} साफ चिह्नित किया गया` : `${hotspot.name} marked cleared`,
          'success'
        );
      },

      deployPumpToHotspot: async (hotspotId) => {
        const hotspot = mcgHotspots.find((h) => h.id === hotspotId);
        if (!hotspot) return;
        const existing = get().dispatchRecords[hotspotId];
        const crew = crews.find((c) => c.zone === hotspot.zone) || crews[0];

        const record: DispatchActionRecord = {
          id: existing?.id || `DSP-${hotspotId}`,
          hotspot_id: hotspotId,
          ward_no: hotspot.wardNo,
          action_type: 'pre_position_pump',
          description: `Deployed ${crew.name} to ${hotspot.name}`,
          assigned_crew_id: crew.id,
          sla_tier: existing?.sla_tier || 3,
          sla_deadline: existing?.sla_deadline || new Date(Date.now() + 45 * 60000).toISOString(),
          status: 'in_progress',
          is_override: existing?.is_override || false,
          override_reason: existing?.override_reason,
          original_rank: existing?.original_rank,
          rank_override: existing?.rank_override,
          updated_by: get().role === 'command_authority' ? 'Command Authority' : 'Ward Engineer',
          updated_at: new Date().toISOString(),
        };

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: record.updated_by,
          action: 'alert_issued',
          hotspot_id: hotspotId,
          original_rank: null,
          new_rank: null,
          reason: `Dispatched ${crew.name} (${crew.equipment}) to Ward ${hotspot.wardNo}`,
        };

        set((state) => ({
          dispatchRecords: { ...state.dispatchRecords, [hotspotId]: record },
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await Promise.all([persistDispatchAction(record), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi'
            ? `${hotspot.name} पर ${crew.name} को भेजा गया`
            : `Dispatched ${crew.name} to ${hotspot.name}`,
          'success'
        );
      },

      escalateHotspotSla: async (hotspotId) => {
        if (!get().citizenUser && !get().authorityUser) {
          set({ postLoginRedirect: 'map', activeView: 'citizen-login' });
          get().addToast(
            get().lang === 'hi' ? 'वार्ड समस्या आगे भेजने के लिए साइन इन करें' : 'Please sign in to escalate a ward issue',
            'info'
          );
          return;
        }
        const hotspot = mcgHotspots.find((h) => h.id === hotspotId);
        if (!hotspot) return;
        const existing = get().dispatchRecords[hotspotId];
        const tel = computeHotspotTelemetry(
          hotspot,
          get().rainfallMm,
          get().timelineHourOffset,
          get().pumpMitigationActive,
          get().sensors,
          get().floodReports,
          existing
        );
        const nextTier = Math.min(5, tel.slaTier + 1) as 1 | 2 | 3 | 4 | 5;
        const officerMap = {
          1: hotspot.contacts.callOperator,
          2: hotspot.contacts.sanitationSupervisor,
          3: hotspot.contacts.asi,
          4: hotspot.contacts.je,
          5: hotspot.contacts.ae,
        };
        const targetOfficer = officerMap[nextTier];

        const record: DispatchActionRecord = {
          id: existing?.id || `DSP-${hotspotId}`,
          hotspot_id: hotspotId,
          ward_no: hotspot.wardNo,
          action_type: existing?.action_type || 'sla_escalation',
          description: `Escalated to Tier ${nextTier}: ${targetOfficer.role} ${targetOfficer.name}`,
          assigned_crew_id: existing?.assigned_crew_id || null,
          sla_tier: nextTier,
          sla_deadline: new Date(Date.now() + 30 * 60000).toISOString(),
          status: 'escalated',
          is_override: existing?.is_override || false,
          override_reason: existing?.override_reason,
          original_rank: existing?.original_rank,
          rank_override: existing?.rank_override,
          updated_by:
            get().role === 'citizen'
              ? 'Citizen Escalation'
              : get().role === 'command_authority'
                ? 'Command Authority'
                : 'Ward Engineer',
          updated_at: new Date().toISOString(),
        };

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: record.updated_by,
          action: 'sla_escalated',
          hotspot_id: hotspotId,
          original_rank: null,
          new_rank: null,
          reason: `SLA escalated to L${nextTier} ${targetOfficer.role} (${targetOfficer.name} · ${targetOfficer.phone})`,
        };

        set((state) => ({
          dispatchRecords: { ...state.dispatchRecords, [hotspotId]: record },
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await Promise.all([persistDispatchAction(record), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi'
            ? `${targetOfficer.role}: ${targetOfficer.name} को एस्केलेट किया गया`
            : `Escalated to ${targetOfficer.role}: ${targetOfficer.name}`,
          'warning'
        );
      },

      flagHotspotBlocker: async (hotspotId, note) => {
        const hotspot = mcgHotspots.find((h) => h.id === hotspotId);
        if (!hotspot) return;
        const existing = get().dispatchRecords[hotspotId];

        const record: DispatchActionRecord = {
          id: existing?.id || `DSP-${hotspotId}`,
          hotspot_id: hotspotId,
          ward_no: hotspot.wardNo,
          action_type: existing?.action_type || 'inter_agency_blocker',
          description: note || `Flagged blocker (${hotspot.owningAgency}) at ${hotspot.name}`,
          assigned_crew_id: existing?.assigned_crew_id || null,
          sla_tier: Math.max(existing?.sla_tier || 4, 4),
          sla_deadline: existing?.sla_deadline || new Date(Date.now() + 60 * 60000).toISOString(),
          status: 'flagged',
          is_override: existing?.is_override || false,
          override_reason: existing?.override_reason,
          original_rank: existing?.original_rank,
          rank_override: existing?.rank_override,
          updated_by: get().role === 'command_authority' ? 'Command Authority' : 'Ward Engineer',
          updated_at: new Date().toISOString(),
        };

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: record.updated_by,
          action: 'sensor_flagged',
          hotspot_id: hotspotId,
          original_rank: null,
          new_rank: null,
          reason: note || `Inter-agency/infrastructure blocker flagged (${hotspot.owningAgency})`,
        };

        set((state) => ({
          dispatchRecords: { ...state.dispatchRecords, [hotspotId]: record },
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await Promise.all([persistDispatchAction(record), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi'
            ? 'अवरोध चिह्नित किया गया और ऑडिट लॉग में दर्ज हुआ'
            : 'Blocker flagged & logged in audit stream',
          'warning'
        );
      },

      overrideHotspotRank: async (hotspotId, newRank, reason) => {
        const hotspot = mcgHotspots.find((h) => h.id === hotspotId);
        if (!hotspot) return;
        const existing = get().dispatchRecords[hotspotId];

        const record: DispatchActionRecord = {
          id: existing?.id || `DSP-${hotspotId}`,
          hotspot_id: hotspotId,
          ward_no: hotspot.wardNo,
          action_type: existing?.action_type || 'manual_priority',
          description: existing?.description || `Priority override for ${hotspot.name}`,
          assigned_crew_id: existing?.assigned_crew_id || null,
          sla_tier: existing?.sla_tier || 4,
          sla_deadline: existing?.sla_deadline || new Date(Date.now() + 45 * 60000).toISOString(),
          status: existing?.status || 'pending',
          is_override: true,
          override_reason: reason,
          original_rank: existing?.rank_override || existing?.original_rank || null,
          rank_override: newRank,
          updated_by: get().role === 'command_authority' ? 'Command Authority' : 'Ward Engineer',
          updated_at: new Date().toISOString(),
        };

        const auditEntry: AuditLogRecord = {
          id: `AL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: record.updated_by,
          action: 'manual_override',
          hotspot_id: hotspotId,
          original_rank: record.original_rank || null,
          new_rank: newRank,
          reason,
        };

        set((state) => ({
          dispatchRecords: { ...state.dispatchRecords, [hotspotId]: record },
          auditLog: [auditEntry, ...state.auditLog],
        }));

        await Promise.all([persistDispatchAction(record), persistAuditLog(auditEntry)]);
        get().addToast(
          get().lang === 'hi'
            ? `प्राथमिकता #${newRank} पर मैनुअल बदलाव दर्ज`
            : `Manual override to #${newRank} logged`,
          'warning'
        );
      },

      setSensorStatus: async (sensorId, status) => {
        const sensor = get().sensors.find((s) => s.id === sensorId);
        set((state) => ({
          sensors: state.sensors.map((s) =>
            s.id === sensorId
              ? {
                  ...s,
                  status,
                  last_seen_at:
                    status === 'offline'
                      ? new Date(Date.now() - 4 * 3600000).toISOString()
                      : new Date().toISOString(),
                }
              : s
          ),
        }));

        if (sensor) {
          const auditEntry: AuditLogRecord = {
            id: `AL-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: 'Control Room Operator',
            action: 'sensor_flagged',
            hotspot_id: sensor.hotspot_id,
            original_rank: null,
            new_rank: null,
            reason: `Telemetry node ${sensorId} status updated to ${status.toUpperCase()}`,
          };
          set((state) => ({ auditLog: [auditEntry, ...state.auditLog] }));
          await persistAuditLog(auditEntry);
          get().addToast(
            get().lang === 'hi' ? `सेंसर ${sensorId} की स्थिति ${status} हुई` : `Sensor ${sensorId} marked ${status}`,
            status === 'offline' ? 'warning' : 'success'
          );
        }
      },

      subscribeAlerts: async (sub) => {
        const record: AlertSubscriptionRecord = {
          ...sub,
          id: `SUB-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          alertSubscriptions: [record, ...state.alertSubscriptions],
        }));
        await persistAlertSubscription(record);
        get().addToast(
          get().lang === 'hi'
            ? `${sub.phone} को ${sub.channel.toUpperCase()} बाढ़ अलर्ट के लिए सक्रिय किया गया`
            : `Subscribed ${sub.phone} to ${sub.channel.toUpperCase()} flood alerts`,
          'success'
        );
      },

      generateAiBriefing: async () => {
        const { rainfallMm, timelineHourOffset, pumpMitigationActive, sensors, floodReports, dispatchRecords, lang } = get();
        set({ aiBriefingLoading: true });
        const scored = mcgHotspots
          .map((h) => ({
            hotspot: h,
            tel: computeHotspotTelemetry(
              h,
              rainfallMm,
              timelineHourOffset,
              pumpMitigationActive,
              sensors,
              floodReports,
              dispatchRecords[h.id]
            ),
          }))
          .sort((a, b) => b.tel.riskPct - a.tel.riskPct);

        const highRiskCount = scored.filter((s) => s.tel.riskPct >= 55).length;

        try {
          const res = await fetch('/api/ai/briefing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rainfallMm,
              timelineHourOffset,
              pumpMitigationActive,
              highRiskCount,
              lang,
              topHotspots: scored.slice(0, 8).map((s) => ({
                name: s.hotspot.name,
                wardNo: s.hotspot.wardNo,
                zone: s.hotspot.zone,
                riskPct: s.tel.riskPct,
                causeAnalysis: s.hotspot.causeAnalysis,
                owningAgency: s.hotspot.owningAgency,
                jeName: `${s.hotspot.contacts.je.name} (${s.hotspot.contacts.je.phone})`,
              })),
              recentCitizenReports: floodReports.slice(0, 5).map((r) => ({
                locationName: r.location_name,
                severity: r.ai_severity,
                description: r.description,
              })),
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = (await res.json()) as AiBriefingData;
          set({ aiBriefing: data, aiBriefingLoading: false });
          get().addToast(
            lang === 'hi' ? 'मानसून कमांड ब्रीफिंग अपडेट हो गई' : 'Monsoon Command Briefing updated',
            'success'
          );
        } catch {
          const top3 = scored.slice(0, 3);
          const fallbackBriefing: AiBriefingData =
            lang === 'hi'
              ? {
                  generatedAt: new Date().toISOString(),
                  model: 'telemetry-baseline',
                  headline: `${rainfallMm} मिमी वर्षा दबाव पर ${highRiskCount} संवेदनशील बिंदुओं पर त्वरित जल निकासी निगरानी`,
                  executiveSummary: `वर्तमान T${timelineHourOffset >= 0 ? `+${timelineHourOffset}` : timelineHourOffset}h क्षितिज पर 153 MCG बिंदुओं में से ${highRiskCount} स्थानों पर उच्च जलभराव जोखिम दर्ज है। ${pumpMitigationActive ? 'पंप पूर्व-तैनाती सिमुलेशन सक्रिय है और प्रमुख अंडरपास पर भार कम हो रहा है।' : 'प्रमुख अंडरपास और NH-48 नालों पर मोबाइल पंप तैनाती तुरंत सक्रिय करें।'}`,
                  priorityWards: top3.map((s) => ({
                    wardLabel: `वार्ड ${s.hotspot.wardNo} · ${s.hotspot.name} (${s.tel.riskPct}%)`,
                    actionDirective: `${s.hotspot.owningAgency} सक्शन पंप और गाद सफाई दल तैनात करें (${s.hotspot.causeAnalysis})।`,
                    officerToAlert: `${s.hotspot.contacts.je.name} (${s.hotspot.contacts.je.phone})`,
                  })),
                  interAgencyDirectives: [
                    'NHAI और GMDA मुख्य राजमार्ग सर्विस लेन व कल्वर्ट निकासी समन्वय करें।',
                    'ट्रैफिक पुलिस गंभीर अंडरपास (हीरो होंडा, इफ्को, राजीव चौक) पर डायवर्जन अलर्ट जारी रखे।',
                    `लाइव नागरिक रिपोर्ट कतार (${floodReports.length} प्रविष्टियाँ) की वार्ड स्तर पर पुष्टि करें।`,
                  ],
                  pumpReallocationAdvice: pumpMitigationActive
                    ? 'अतिरिक्त बैकअप पंप ज़ोन 3 और ज़ोन 4 के निचले अंडरपास क्लस्टर में आरक्षित रखें।'
                    : 'शीर्ष 3 उच्च जोखिम वाले वार्डों में उच्च क्षमता वाले डीजल/ट्रैक्टर पंप तुरंत स्थानांतरित करें।',
                }
              : {
                  generatedAt: new Date().toISOString(),
                  model: 'telemetry-baseline',
                  headline: `Immediate Drainage Mobilization Across ${highRiskCount} High-Risk Points (${rainfallMm}mm Load)`,
                  executiveSummary: `At the T${timelineHourOffset >= 0 ? `+${timelineHourOffset}` : timelineHourOffset}h horizon, ${highRiskCount} of 153 monitored MCG corridors exceed critical/high waterlogging thresholds. ${pumpMitigationActive ? 'Pre-positioned pump mitigation is active and lowering peak surge across major underpasses.' : 'Activate standby suction pumps immediately across critical NH-48 and Badshahpur basin corridors.'}`,
                  priorityWards: top3.map((s) => ({
                    wardLabel: `Ward ${s.hotspot.wardNo} · ${s.hotspot.name} (${s.tel.riskPct}%)`,
                    actionDirective: `Deploy ${s.hotspot.owningAgency} dewatering team and clear storm grate (${s.hotspot.causeAnalysis}).`,
                    officerToAlert: `${s.hotspot.contacts.je.name} (${s.hotspot.contacts.je.phone})`,
                  })),
                  interAgencyDirectives: [
                    'NHAI & GMDA: Keep expressway service-lane box culverts cleared and open to downstream outfall.',
                    'Gurugram Traffic Police: Pre-stage diversion cones at submergence-prone underpasses.',
                    `Ward Control Room: Verify ${floodReports.length} active resident flood reports against telemetry feeds.`,
                  ],
                  pumpReallocationAdvice: pumpMitigationActive
                    ? 'Maintain standby suction reserve on Zone 3 & Zone 4 underpass clusters while monitoring 6h inflow.'
                    : 'Reallocate mobile high-head pumps from low-risk Zone 1 sectors to top 3 Ward 24/32/34 bottlenecks.',
                };

          set({ aiBriefing: fallbackBriefing, aiBriefingLoading: false });
          get().addToast(
            lang === 'hi'
              ? 'लाइव टेलीमेट्री के आधार पर कमांड ब्रीफिंग तैयार की गई'
              : 'Command briefing synthesized from live telemetry',
            'info'
          );
        }
      },

      addToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4500);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },
    }),
    {
      name: 'gfc-command-store-v4',
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
        citizenUser: state.citizenUser,
        registeredCitizens: state.registeredCitizens,
        authorityUser: state.authorityUser,
        sensors: state.sensors,
        floodReports: state.floodReports,
        sosReports: state.sosReports,
        dispatchRecords: state.dispatchRecords,
        auditLog: state.auditLog,
        alertSubscriptions: state.alertSubscriptions,
      }),
    }
  )
);
