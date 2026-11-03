export interface Hotspot {
  id: string;
  register_ref: string;
  name: string;
  landmark: string;
  cause_note: string;
  mcg_category: 'critical_point' | 'normal_point' | 'low_lying_area' | 'drainage_block' | 'no_sewer_line';
  mcg_tier: number | null;
  zone: 'zone_1' | 'zone_2' | 'zone_3' | 'zone_4' | null;
  lat: number;
  lng: number;
  je: { name: string; phone: string };
  field_team: Array<{ name: string; phone: string | null }>;
  owning_agency: 'MCG' | 'GMDA' | 'HSVP' | 'Irrigation' | 'NHAI' | 'PWD';
  topology: {
    upstream_of: string[];
    downstream_of: string[];
    leverage_score: number;
  };
  population_exposure: number;
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
  {
    id: "HSP-001", register_ref: "110", name: "Jayanti Hospital Near Gurugram Sector 10",
    landmark: "Jayanti Hospital Near Gurugram Sector 10",
    cause_note: "Critical point", mcg_category: "critical_point", mcg_tier: null, zone: "zone_3",
    lat: 28.457472, lng: 77.038057,
    je: { name: "Sh. Deepak Yadav", phone: "9891081026" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Arman", phone: "7836181418" },
      { name: "Sh. Vikas", phone: "6360974325" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: ["HSP-005"], downstream_of: [], leverage_score: 72 },
    population_exposure: 18000
  },
  {
    id: "HSP-002", register_ref: "111", name: "Vinayak Plaza, Patel Nagar",
    landmark: "Vinayak Plaza, Patel Nagar",
    cause_note: "Critical point", mcg_category: "critical_point", mcg_tier: null, zone: "zone_3",
    lat: 28.452718, lng: 77.029676,
    je: { name: "Sh. Deepak Yadav", phone: "9891081026" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Arman", phone: "7836181418" },
      { name: "Sh. Vikas", phone: "6360974325" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: ["HSP-003"], leverage_score: 55 },
    population_exposure: 14000
  },
  {
    id: "HSP-003", register_ref: "112", name: "Mahalaxmi Agrasen Chowk",
    landmark: "Mahalaxmi Agrasen Chowk",
    cause_note: "Critical point", mcg_category: "critical_point", mcg_tier: null, zone: "zone_3",
    lat: 28.453387, lng: 77.033793,
    je: { name: "Sh. Deepak Yadav", phone: "9891081026" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Arman", phone: "7836181418" },
      { name: "Sh. Vikas", phone: "6360974325" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 48 },
    population_exposure: 12000
  },
  {
    id: "HSP-004", register_ref: "120", name: "Auto Market, Bhim Nagar",
    landmark: "Auto Market, Bhim Nagar",
    cause_note: "Critical point", mcg_category: "critical_point", mcg_tier: null, zone: "zone_3",
    lat: 28.464627, lng: 77.021145,
    je: { name: "Sh. Kuldeep", phone: "9891081928" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Arman", phone: "7836181418" },
      { name: "Sh. Vikas", phone: "6360974325" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 44 },
    population_exposure: 21000
  },
  {
    id: "HSP-005", register_ref: "150", name: "Shresta Mandir Road",
    landmark: "Shresta Mandir Road",
    cause_note: "Critical point", mcg_category: "critical_point", mcg_tier: null, zone: "zone_3",
    lat: 28.492845, lng: 77.021112,
    je: { name: "Sh. Devender (JE R)", phone: "982130264" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Arman", phone: "7836181418" },
      { name: "Sh. Sonia", phone: "9958204647" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: ["HSP-001"], leverage_score: 68 },
    population_exposure: 16000
  },
  {
    id: "HSP-006", register_ref: "101", name: "Siddeshwar Village Road",
    landmark: "Siddeshwar Village Road",
    cause_note: "Overflow of main GMDA line", mcg_category: "drainage_block", mcg_tier: 2, zone: "zone_4",
    lat: 28.482303, lng: 77.029221,
    je: { name: "Sh. Ravi (JE)", phone: "9811877333" },
    field_team: [
      { name: "Sh. Pankaj Kumar", phone: "9810398615" },
      { name: "Sh. Deepak Garg", phone: "9996093024" },
      { name: "Sh. Balbir", phone: "9991223461" }
    ],
    owning_agency: "GMDA",
    topology: { upstream_of: [], downstream_of: ["HSP-003"], leverage_score: 81 },
    population_exposure: 25000
  },
  {
    id: "HSP-007", register_ref: "155", name: "G-Block, Shiva Enclave, Rajendra Park",
    landmark: "G-Block, Shiva Enclave, Rajendra Park",
    cause_note: "Overflow of main GMDA line", mcg_category: "drainage_block", mcg_tier: 2, zone: "zone_2",
    lat: 28.484481, lng: 77.054628,
    je: { name: "Sh. Sarojjeet", phone: "9873322111" },
    field_team: [
      { name: "Sh. Devender (JE R)", phone: "982130264" },
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Sonia", phone: "9958204647" }
    ],
    owning_agency: "GMDA",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 76 },
    population_exposure: 19000
  },
  {
    id: "HSP-008", register_ref: "61", name: "Umarpur Nangli Nail School",
    landmark: "Umarpur Nangli Nail School",
    cause_note: "No sewer line and drainage", mcg_category: "no_sewer_line", mcg_tier: null, zone: "zone_1",
    lat: 28.466628, lng: 77.079962,
    je: { name: "Sh. Dipanshu", phone: "8860251230" },
    field_team: [
      { name: "Sh. Tajamul Hussain", phone: "726986796" },
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" },
      { name: "Sh. Aay", phone: "847913296" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 62 },
    population_exposure: 11000
  },
  {
    id: "HSP-009", register_ref: "65", name: "Fazilpur",
    landmark: "Humanar Mandir, Fazilpur",
    cause_note: "Low lying area", mcg_category: "low_lying_area", mcg_tier: null, zone: "zone_1",
    lat: 28.490584, lng: 77.031686,
    je: { name: "Sh. Dipanshu", phone: "8860251230" },
    field_team: [
      { name: "Sh. Kapil Yadav", phone: "972882249" },
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" },
      { name: "Sh. Mukesh", phone: "965497951" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 51 },
    population_exposure: 9000
  },
  {
    id: "HSP-010", register_ref: "66", name: "Bagampur Khatola",
    landmark: "Government School and Humanar Mandir, Bagampur Khatola",
    cause_note: "Low lying area", mcg_category: "low_lying_area", mcg_tier: null, zone: "zone_1",
    lat: 28.414231, lng: 77.009124,
    je: { name: "Sh. Sachan Kumar (JE)", phone: "9990010160" },
    field_team: [
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Bajeet Kumar", phone: "991170541" },
      { name: "Sh. Deepchand", phone: "7291927532" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 47 },
    population_exposure: 8500
  },
  {
    id: "HSP-011", register_ref: "77", name: "Village Ghata Underpass",
    landmark: "Village Ghata Underpass",
    cause_note: "Low lying area", mcg_category: "low_lying_area", mcg_tier: null, zone: "zone_2",
    lat: 28.42204, lng: 77.1596,
    je: { name: "Sh. Sangeeta Hooda (JE R)", phone: "999192094" },
    field_team: [
      { name: "Sh. Kuldip Kumar", phone: "995546472" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Ratan", phone: "995346837" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 74 },
    population_exposure: 32000
  },
  {
    id: "HSP-012", register_ref: "86", name: "Wazirabad Chowk",
    landmark: "Front of Community Center, Wazirabad",
    cause_note: "GMDA master line blockage — road cutting water logging due to infrastructure work",
    mcg_category: "drainage_block", mcg_tier: 4, zone: "zone_4",
    lat: 28.434708, lng: 77.088335,
    je: { name: "Sh. Ritesh (JE)", phone: "971032721" },
    field_team: [
      { name: "Sh. Kuldeep Kumar", phone: "9991381241" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Rohit", phone: "9910730312" }
    ],
    owning_agency: "GMDA",
    topology: { upstream_of: [], downstream_of: ["HSP-007"], leverage_score: 83 },
    population_exposure: 27000
  },
  {
    id: "HSP-013", register_ref: "87", name: "Wazirabad Chowk (Jhuggi area)",
    landmark: "Jhuggi area, Wazirabad",
    cause_note: "Overflow of water after heavy rainfall due to blockage of the main GMDA line",
    mcg_category: "drainage_block", mcg_tier: 4, zone: "zone_4",
    lat: 28.43954, lng: 77.08898,
    je: { name: "Sh. Ritesh (JE)", phone: "971032721" },
    field_team: [
      { name: "Sh. Kuldeep Kumar", phone: "9991381241" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Chhoturam", phone: "9567123198" }
    ],
    owning_agency: "GMDA",
    topology: { upstream_of: [], downstream_of: ["HSP-007"], leverage_score: 79 },
    population_exposure: 23000
  },
  {
    id: "HSP-014", register_ref: "88", name: "Sanjay Colony Main Entrance & B-Block",
    landmark: "Near Sec-56 Metro Station",
    cause_note: "Low lying area and water accumulation due to sink point",
    mcg_category: "low_lying_area", mcg_tier: 4, zone: "zone_4",
    lat: 28.445895, lng: 77.066022,
    je: { name: "Sh. Ritesh (JE)", phone: "971032721" },
    field_team: [
      { name: "Sh. Kuldeep Kumar", phone: "9991381241" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Anosh", phone: "7982724448" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 58 },
    population_exposure: 15000
  },
  {
    id: "HSP-015", register_ref: "89", name: "Sector 57 part 1",
    landmark: "Near H.No. 565, Sector 57",
    cause_note: "Storm drainage choking required",
    mcg_category: "drainage_block", mcg_tier: 4, zone: "zone_4",
    lat: 28.420834, lng: 77.074072,
    je: { name: "Sh. Ritesh (JE)", phone: "971032721" },
    field_team: [
      { name: "Sh. Kuldeep Kumar", phone: "9991381241" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Sachin", phone: "9972060472" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 53 },
    population_exposure: 13000
  },
  {
    id: "HSP-016", register_ref: "90", name: "Sector 28 (Opposite Shanti Niketan)",
    landmark: "Opposite Shanti Niketan, DLF Phase 4, Sector 28",
    cause_note: "GMDA Choked Master Stormwater drain",
    mcg_category: "drainage_block", mcg_tier: 4, zone: "zone_4",
    lat: 28.436982, lng: 77.099716,
    je: { name: "Sh. Vinay Verma (JE)", phone: "9810795000" },
    field_team: [
      { name: "Sh. Pankaj Kumar", phone: "9810398615" },
      { name: "Sh. Deepak Garg", phone: "9996093024" },
      { name: "Sh. Vikender Kumar", phone: "9991771765" }
    ],
    owning_agency: "GMDA",
    topology: { upstream_of: [], downstream_of: ["HSP-006"], leverage_score: 85 },
    population_exposure: 29000
  },
  {
    id: "HSP-017", register_ref: "91", name: "F & G Block, DLF Phase 2",
    landmark: "Entrance of Eldeco Mansionz",
    cause_note: "Storm drainage choking required",
    mcg_category: "drainage_block", mcg_tier: 4, zone: "zone_4",
    lat: 28.479333, lng: 77.092911,
    je: { name: "Sh. Ritesh (JE)", phone: "971032721" },
    field_team: [
      { name: "Sh. Kuldeep Kumar", phone: "9991381241" },
      { name: "Sh. Bhojpur Singh", phone: "995546472" },
      { name: "Sh. Veer Singh", phone: "8826741336" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 50 },
    population_exposure: 16000
  },
  {
    id: "HSP-018", register_ref: "102", name: "Silokhera Village Road",
    landmark: "Silokhera Village Road",
    cause_note: "Sewer line blockage and overflow",
    mcg_category: "no_sewer_line", mcg_tier: 4, zone: "zone_4",
    lat: 28.432018, lng: 77.096712,
    je: { name: "Sh. Pooja (JE)", phone: "9811276597" },
    field_team: [
      { name: "Sh. Devender (JE R)", phone: "982130264" },
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Sonia", phone: "9958204647" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: ["HSP-016"], leverage_score: 66 },
    population_exposure: 14000
  },
  {
    id: "HSP-019", register_ref: "103", name: "C-Block near H. No. C-111, South City I",
    landmark: "H. No. C-111, South City I",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 4, zone: "zone_4",
    lat: 28.463632, lng: 77.051173,
    je: { name: "Sh. Pooja (JE)", phone: "9811276597" },
    field_team: [
      { name: "Sh. Devender (JE R)", phone: "982130264" },
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Kamveer", phone: "9772453002" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 42 },
    population_exposure: 12000
  },
  {
    id: "HSP-020", register_ref: "104", name: "South City Main Road (near market)",
    landmark: "Main Market, South City",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 4, zone: "zone_4",
    lat: 28.472886, lng: 77.055081,
    je: { name: "Sh. Pooja (JE)", phone: "9811276597" },
    field_team: [
      { name: "Sh. Devender (JE R)", phone: "982130264" },
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Kamveer", phone: "9772453002" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 45 },
    population_exposure: 17000
  },
  {
    id: "HSP-021", register_ref: "108", name: "CRPF Camp Chowk",
    landmark: "CRPF Camp Chowk",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 4, zone: "zone_4",
    lat: 28.47661, lng: 77.052312,
    je: { name: "Sh. Kanchan Kumar", phone: "9810316626" },
    field_team: [
      { name: "Sh. Pankaj Kumar", phone: "9810398615" },
      { name: "Sh. Deepak Garg", phone: "9996093024" },
      { name: "Sh. Anish", phone: "9999303048" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 54 },
    population_exposure: 20000
  },
  {
    id: "HSP-022", register_ref: "109", name: "Shiv Mandir (near Sarai)",
    landmark: "Ram Mandir Chowk",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 4, zone: "zone_4",
    lat: 28.473628, lng: 77.033606,
    je: { name: "Sh. Kanchan Kumar", phone: "9810316626" },
    field_team: [
      { name: "Sh. Pankaj Kumar", phone: "9810398615" },
      { name: "Sh. Deepak Garg", phone: "9996093024" },
      { name: "Sh. Bansi", phone: "9996657615" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 46 },
    population_exposure: 10500
  },
  {
    id: "HSP-023", register_ref: "44", name: "Sector 10 part-2 market road",
    landmark: "Sector 10 part 2 market road (near Sector 10 police station)",
    cause_note: "Water logging due to low lying area",
    mcg_category: "low_lying_area", mcg_tier: 1, zone: "zone_1",
    lat: 28.446779, lng: 77.035545,
    je: { name: "Sh. Raveender Kumar", phone: "9812507403" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Anosh", phone: "7982724448" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 49 },
    population_exposure: 13000
  },
  {
    id: "HSP-024", register_ref: "45", name: "Sector 10 part 2 market road (slum area)",
    landmark: "Sector 10 part 2 market road, near slum area",
    cause_note: "Water logging due to low lying area",
    mcg_category: "low_lying_area", mcg_tier: 1, zone: "zone_1",
    lat: 28.446779, lng: 77.035545,
    je: { name: "Sh. Raveender Kumar", phone: "9812507403" },
    field_team: [
      { name: "Sh. Krishan Kumar", phone: "982130527" },
      { name: "Sh. Anosh", phone: "7982724448" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 47 },
    population_exposure: 12500
  },
  {
    id: "HSP-025", register_ref: "50", name: "Sector 57 (near Tisga Village)",
    landmark: "Near Tisga Village",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 1, zone: "zone_1",
    lat: 28.471161, lng: 77.074238,
    je: { name: "Sh. Ritesh Rana", phone: "8860245979" },
    field_team: [
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 40 },
    population_exposure: 9000
  },
  {
    id: "HSP-026", register_ref: "62", name: "Uppal Southend S.W Block",
    landmark: "Block S.W, Uppal Southend",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 6, zone: "zone_1",
    lat: 28.410535, lng: 77.847733,
    je: { name: "Sh. Dipanshu", phone: "8860251230" },
    field_team: [
      { name: "Sh. Kapil Yadav", phone: "972882249" },
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" },
      { name: "Sh. Yogesh Priyapati", phone: "750333426" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 36 },
    population_exposure: 11000
  },
  {
    id: "HSP-027", register_ref: "63", name: "Housing Board Uppal Southend",
    landmark: "Housing Board, Uppal Southend",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 6, zone: "zone_1",
    lat: 28.411234, lng: 77.037986,
    je: { name: "Sh. Dipanshu", phone: "8860251230" },
    field_team: [
      { name: "Sh. Kapil Yadav", phone: "972882249" },
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" },
      { name: "Sh. Yogesh Priyapati", phone: "750333426" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 38 },
    population_exposure: 11500
  },
  {
    id: "HSP-028", register_ref: "64", name: "Vipul World",
    landmark: "B.C.D Block, Vipul World",
    cause_note: "Low lying area",
    mcg_category: "low_lying_area", mcg_tier: 6, zone: "zone_1",
    lat: 28.411269, lng: 77.035591,
    je: { name: "Sh. Dipanshu", phone: "8860251230" },
    field_team: [
      { name: "Sh. Kapil Yadav", phone: "972882249" },
      { name: "Sh. Prem Singh", phone: "844746673" },
      { name: "Sh. Gaurav", phone: "995546421" },
      { name: "Sh. Manoj Kaushik", phone: "950279817" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 41 },
    population_exposure: 15500
  },
  {
    id: "HSP-029", register_ref: "24", name: "In front of Huda Market Sec-10 (Government School)",
    landmark: "In front of Huda Market Sec-10, near government school",
    cause_note: "Water logging due to silt in drain",
    mcg_category: "drainage_block", mcg_tier: 2, zone: "zone_1",
    lat: 28.464737, lng: 77.032042,
    je: { name: "Sh. Rahul (JE)", phone: "9811876512" },
    field_team: [
      { name: "Sh. Anuj Aroda", phone: "9817521555" },
      { name: "Sh. Baljeet Kumar", phone: "9810545455" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 59 },
    population_exposure: 20500
  },
  {
    id: "HSP-030", register_ref: "25", name: "Sector 10A Market near Gate No. 1",
    landmark: "Near DAV School, Sector 10A Market",
    cause_note: "Water logging due to silt in drain",
    mcg_category: "drainage_block", mcg_tier: 2, zone: "zone_1",
    lat: 28.46378, lng: 77.030861,
    je: { name: "Sh. Shrikant (JE)", phone: "9712202667" },
    field_team: [
      { name: "Sh. Anuj Aroda", phone: "9817521555" },
      { name: "Sh. Baljeet Kumar", phone: "9810545455" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 57 },
    population_exposure: 19500
  },
  {
    id: "HSP-031", register_ref: "31", name: "Nauru Chowk",
    landmark: "Near Jain Mandir, Nauru Chowk",
    cause_note: "Low lying area and drain block",
    mcg_category: "low_lying_area", mcg_tier: 1, zone: "zone_1",
    lat: 28.44707, lng: 77.032956,
    je: { name: "Sh. Malvinder Singh", phone: "9811595391" },
    field_team: [
      { name: "Sh. Prem Singh", phone: "844746673" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 52 },
    population_exposure: 18000
  },
  {
    id: "HSP-032", register_ref: "38", name: "Sector 10 Pocket-2 near main gate",
    landmark: "Sector 10 Pocket 2 near main gate",
    cause_note: "Water logging due to low lying area",
    mcg_category: "low_lying_area", mcg_tier: 3, zone: "zone_1",
    lat: 28.46468, lng: 77.044377,
    je: { name: "Sh. Anil Kumar (JE)", phone: "9811323182" },
    field_team: [
      { name: "Sh. Manish Kaushik", phone: "9817512156" }
    ],
    owning_agency: "MCG",
    topology: { upstream_of: [], downstream_of: [], leverage_score: 44 },
    population_exposure: 13500
  }
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
