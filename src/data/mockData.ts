export interface Hotspot {
  id: string;
  name: string;
  ward: string;
  lat: number;
  lng: number;
  type: 'underpass' | 'road' | 'drain-node' | 'residential-sector';
  upstream_of: string[];
  downstream_of: string[];
  leverage_score: number;
  population_exposure: number;
  owning_agency: 'MCG' | 'GMDA' | 'HSVP' | 'Irrigation' | 'NHAI' | 'PWD';
}

export interface Sensor {
  id: string;
  hotspot_id: string;
  type: 'drain_level' | 'rain_gauge' | 'cctv';
  status: 'online' | 'offline' | 'degraded';
  last_reading: number | null;
  last_seen_at: string;
  battery_pct: number;
}

export interface RiskScore {
  hotspot_id: string;
  risk_pct: number;
  confidence: 'high' | 'medium' | 'low';
  forecast_window: string;
  inputs_used: string[];
  computed_at: string;
  locked: boolean;
}

export interface ActionItem {
  id: string;
  rank: number;
  hotspot_id: string;
  action_type: 'pre_position_pump' | 'desilt_node' | 'deploy_crew' | 'issue_alert' | 'inspect';
  description: string;
  deadline: string;
  assigned_crew_id: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'flagged';
  is_override: boolean;
  override_reason?: string;
  original_rank?: number;
}

export interface Crew {
  id: string;
  name: string;
  base_location: string;
  available: boolean;
  current_assignment: string | null;
  travel_minutes_to: Record<string, number>;
}

export interface Alert {
  id: string;
  hotspot_id: string;
  tier: 'advisory' | 'action';
  channel: ('sms' | 'ivr' | 'web')[];
  message_en: string;
  message_hi: string;
  issued_at: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'system_ranking' | 'manual_override' | 'sensor_flagged' | 'alert_issued' | 'action_completed';
  hotspot_id: string;
  original_rank: number | null;
  new_rank: number | null;
  reason: string | null;
}

export interface WaterlogReport {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  description: string;
}

export const hotspots: Hotspot[] = [
  { id: "HSP-001", name: "Subhash Chowk Underpass", ward: "Ward 12", lat: 28.4595, lng: 77.0266, type: "underpass", upstream_of: [], downstream_of: ["HSP-005"], leverage_score: 88, population_exposure: 42000, owning_agency: "NHAI" },
  { id: "HSP-002", name: "Hero Honda Chowk", ward: "Ward 15", lat: 28.4744, lng: 76.9838, type: "underpass", upstream_of: ["HSP-001"], downstream_of: ["HSP-005"], leverage_score: 82, population_exposure: 51000, owning_agency: "NHAI" },
  { id: "HSP-003", name: "Rajiv Chowk Underpass", ward: "Ward 11", lat: 28.4586, lng: 77.0395, type: "underpass", upstream_of: [], downstream_of: ["HSP-001"], leverage_score: 79, population_exposure: 38000, owning_agency: "NHAI" },
  { id: "HSP-004", name: "IFFCO Chowk", ward: "Ward 17", lat: 28.4707, lng: 77.0697, type: "underpass", upstream_of: [], downstream_of: ["HSP-003"], leverage_score: 71, population_exposure: 33000, owning_agency: "NHAI" },
  { id: "HSP-005", name: "Badshahpur Drain Node 4", ward: "Ward 22", lat: 28.4300, lng: 77.0100, type: "drain-node", upstream_of: ["HSP-001", "HSP-002"], downstream_of: ["HSP-011"], leverage_score: 95, population_exposure: 28000, owning_agency: "Irrigation" },
  { id: "HSP-006", name: "Sheetla Mata Road", ward: "Ward 9", lat: 28.4450, lng: 76.9900, type: "road", upstream_of: [], downstream_of: ["HSP-005"], leverage_score: 64, population_exposure: 21000, owning_agency: "MCG" },
  { id: "HSP-007", name: "Narsinghpur Crossing", ward: "Ward 26", lat: 28.4100, lng: 76.9700, type: "road", upstream_of: ["HSP-006"], downstream_of: ["HSP-011"], leverage_score: 58, population_exposure: 19000, owning_agency: "PWD" },
  { id: "HSP-008", name: "Sector 111 Low-Lying Colony", ward: "Ward 31", lat: 28.3900, lng: 76.9500, type: "residential-sector", upstream_of: [], downstream_of: ["HSP-007"], leverage_score: 41, population_exposure: 26000, owning_agency: "HSVP" },
  { id: "HSP-009", name: "Sector 56 Chowk", ward: "Ward 25", lat: 28.4250, lng: 77.0750, type: "road", upstream_of: [], downstream_of: ["HSP-004"], leverage_score: 52, population_exposure: 17000, owning_agency: "MCG" },
  { id: "HSP-010", name: "Golf Course Road Underpass", ward: "Ward 20", lat: 28.4400, lng: 77.0900, type: "underpass", upstream_of: ["HSP-009"], downstream_of: ["HSP-004"], leverage_score: 67, population_exposure: 24000, owning_agency: "GMDA" },
  { id: "HSP-011", name: "Najafgarh Drain Outfall Node", ward: "Ward 34", lat: 28.3800, lng: 76.9200, type: "drain-node", upstream_of: ["HSP-005", "HSP-007"], downstream_of: [], leverage_score: 90, population_exposure: 12000, owning_agency: "Irrigation" },
  { id: "HSP-012", name: "Sohna Road Crossing", ward: "Ward 28", lat: 28.4000, lng: 77.0300, type: "road", upstream_of: [], downstream_of: ["HSP-005"], leverage_score: 49, population_exposure: 22000, owning_agency: "GMDA" },
];

export const initialSensors: Sensor[] = [
  { id: "S-01", hotspot_id: "HSP-001", type: "drain_level", status: "online", last_reading: 45, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 87 },
  { id: "S-02", hotspot_id: "HSP-001", type: "cctv", status: "online", last_reading: null, last_seen_at: "2026-11-04T05:45:00+05:30", battery_pct: 92 },
  { id: "S-03", hotspot_id: "HSP-002", type: "drain_level", status: "online", last_reading: 38, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 78 },
  { id: "S-04", hotspot_id: "HSP-004", type: "cctv", status: "offline", last_reading: null, last_seen_at: "2026-11-03T22:00:00+05:30", battery_pct: 12 },
  { id: "S-05", hotspot_id: "HSP-005", type: "drain_level", status: "online", last_reading: 62, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 95 },
  { id: "S-06", hotspot_id: "HSP-005", type: "rain_gauge", status: "online", last_reading: 12, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 88 },
  { id: "S-07", hotspot_id: "HSP-003", type: "drain_level", status: "online", last_reading: 29, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 81 },
  { id: "S-08", hotspot_id: "HSP-006", type: "rain_gauge", status: "online", last_reading: 8, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 90 },
  { id: "S-09", hotspot_id: "HSP-007", type: "drain_level", status: "online", last_reading: 33, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 76 },
  { id: "S-10", hotspot_id: "HSP-008", type: "rain_gauge", status: "online", last_reading: 10, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 84 },
  { id: "S-11", hotspot_id: "HSP-009", type: "drain_level", status: "online", last_reading: 41, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 91 },
  { id: "S-12", hotspot_id: "HSP-010", type: "cctv", status: "online", last_reading: null, last_seen_at: "2026-11-04T05:45:00+05:30", battery_pct: 96 },
  { id: "S-13", hotspot_id: "HSP-010", type: "drain_level", status: "online", last_reading: 55, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 83 },
  { id: "S-14", hotspot_id: "HSP-011", type: "drain_level", status: "online", last_reading: 71, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 89 },
  { id: "S-15", hotspot_id: "HSP-011", type: "rain_gauge", status: "online", last_reading: 14, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 77 },
  { id: "S-16", hotspot_id: "HSP-012", type: "drain_level", status: "online", last_reading: 36, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 85 },
  { id: "S-17", hotspot_id: "HSP-004", type: "drain_level", status: "online", last_reading: 48, last_seen_at: "2026-11-04T05:30:00+05:30", battery_pct: 79 },
  { id: "S-18", hotspot_id: "HSP-002", type: "cctv", status: "online", last_reading: null, last_seen_at: "2026-11-04T05:45:00+05:30", battery_pct: 94 },
];

export const crews: Crew[] = [
  { id: "CRW-01", name: "Pump Team Alpha", base_location: "Ward 12 Depot", available: true, current_assignment: null, travel_minutes_to: { "HSP-001": 10, "HSP-002": 25, "HSP-003": 15, "HSP-004": 20, "HSP-005": 30, "HSP-006": 20, "HSP-007": 35, "HSP-008": 40, "HSP-009": 25, "HSP-010": 30, "HSP-011": 45, "HSP-012": 35 } },
  { id: "CRW-02", name: "Pump Team Bravo", base_location: "Ward 22 Depot", available: true, current_assignment: null, travel_minutes_to: { "HSP-001": 25, "HSP-002": 20, "HSP-003": 30, "HSP-004": 35, "HSP-005": 10, "HSP-006": 15, "HSP-007": 20, "HSP-008": 25, "HSP-009": 30, "HSP-010": 35, "HSP-011": 15, "HSP-012": 20 } },
  { id: "CRW-03", name: "Desilting Unit 1", base_location: "Central Yard", available: true, current_assignment: null, travel_minutes_to: { "HSP-001": 20, "HSP-002": 15, "HSP-003": 25, "HSP-004": 30, "HSP-005": 20, "HSP-006": 10, "HSP-007": 25, "HSP-008": 30, "HSP-009": 20, "HSP-010": 25, "HSP-011": 35, "HSP-012": 25 } },
  { id: "CRW-04", name: "Alert & Response Team", base_location: "Control Room", available: true, current_assignment: null, travel_minutes_to: { "HSP-001": 5, "HSP-002": 10, "HSP-003": 8, "HSP-004": 12, "HSP-005": 15, "HSP-006": 12, "HSP-007": 20, "HSP-008": 25, "HSP-009": 15, "HSP-010": 18, "HSP-011": 30, "HSP-012": 20 } },
  { id: "CRW-05", name: "Inspection Squad", base_location: "MCG HQ", available: true, current_assignment: null, travel_minutes_to: { "HSP-001": 12, "HSP-002": 18, "HSP-003": 10, "HSP-004": 15, "HSP-005": 22, "HSP-006": 15, "HSP-007": 28, "HSP-008": 32, "HSP-009": 18, "HSP-010": 22, "HSP-011": 38, "HSP-012": 28 } },
];

export const calibrationData = {
  period: "Last 30 days",
  alerts_issued: 14,
  alerts_verified_correct: 11,
  accuracy_pct: 79,
  weekly_data: [
    { week: "Week 1", alerts: 3, correct: 2 },
    { week: "Week 2", alerts: 4, correct: 3 },
    { week: "Week 3", alerts: 3, correct: 3 },
    { week: "Week 4", alerts: 4, correct: 3 },
  ]
};

export const sensorOfflineHistory = [
  { day: "Mon", offline: 1 },
  { day: "Tue", offline: 2 },
  { day: "Wed", offline: 1 },
  { day: "Thu", offline: 0 },
  { day: "Fri", offline: 3 },
  { day: "Sat", offline: 2 },
  { day: "Sun", offline: 1 },
];
