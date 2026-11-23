export interface OfficerContact {
  role: 'Call Operator' | 'Sanitation Supervisor' | 'ASI' | 'JE' | 'AE';
  name: string;
  phone: string;
}

export type CauseCategory =
  | 'low_lying'
  | 'silt_blockage'
  | 'no_master_drain'
  | 'gmda_backflow'
  | 'telecom_obstruction'
  | 'road_level_diff'
  | 'critical_junction';

export interface McgHotspot {
  id: string;
  srNo: number;
  wardNo: number;
  zone: 1 | 2 | 3 | 4;
  name: string;
  landmark: string;
  lat: number;
  lng: number;
  rawGps: string;
  gpsStatus: 'verified' | 'corrected';
  gpsNote?: string;
  causeAnalysis: string;
  causeCategory: CauseCategory;
  criticality: 'critical' | 'high' | 'normal';
  owningAgency: 'MCG' | 'GMDA' | 'NHAI' | 'Irrigation' | 'HSVP';
  type: 'underpass' | 'drain-node' | 'road' | 'residential-sector';
  leverageScore: number;
  populationExposure: number;
  upstreamOf: string[];
  downstreamOf: string[];
  contacts: {
    callOperator: OfficerContact;
    sanitationSupervisor: OfficerContact;
    asi: OfficerContact;
    je: OfficerContact;
    ae: OfficerContact;
  };
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

export interface Crew {
  id: string;
  name: string;
  zone: number;
  base_location: string;
  equipment: string;
  available: boolean;
  travel_minutes_to: Record<string, number>;
}

export interface CorridorPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  keywords: string[];
  altRouteEn: string;
  altRouteHi: string;
}

export const MCG_OFFICIAL_CHANNELS = {
  helpline: '18001801817',
  whatsappBot: '784001817',
  portal: 'https://www.mcg.gov.in',
  documentDate: '02-06-2025',
};

// Compact tuple schema for all 153+ official MCG Monsoon Preparedness hotspots:
// [srNo, wardNo, zone, callOpName, callOpPhone, name, landmark, lat, lng, rawGps, gpsStatus, gpsNote, causeAnalysis, jeName, jePhone, aeName, aePhone, asiName, asiPhone, supName, supPhone, criticalityHint]
type RawRow = [
  number,
  number,
  1 | 2 | 3 | 4,
  string,
  string,
  string,
  string,
  number,
  number,
  string,
  'verified' | 'corrected',
  string | null,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  'critical' | 'high' | 'normal'
];

const RAW_MCG_ROWS: RawRow[] = [
  // ZONE 3 — WARDS 1–4, 12–13, 27, 31, 35–36
  [1, 1, 3, 'Sh. Mohit Vats', '9899850219', 'Near Budwala Booster', 'Near Budwala Booster', 28.488572, 77.102205, '28.488572, 77.102205', 'verified', null, 'Water drain out through sewer line, no master drain is available in adjoining area.', 'Sh. Mohit Rana', '9310788277', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Smt. Anita', '9310103478', 'high'],
  [2, 1, 3, 'Sh. Mohit Vats', '9899850219', 'Nathupur near Harijan Basti', 'Nathupur near Harijan Basti', 28.48003, 77.099612, '28.480030, 77.099612', 'verified', null, 'Water logging occurs due to road level difference.', 'Sh. Mohit Rana', '9310788277', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Yogesh', '8588856888', 'normal'],
  [3, 1, 3, 'Sh. Mohit Vats', '9899850219', 'Sikanderpur entry from Bristol Chowk', 'Sikanderpur entry from Bristol Chowk', 28.479154, 77.094202, '28.479154, 77.094202', 'verified', null, 'It is a low lying area, no storm water drain is available in adjoining area.', 'Sh. Mohit Rana', '9310788277', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Praveen', '9649152820', 'high'],
  [4, 2, 3, 'Sh. Mohit Vats', '9899850219', 'Sunar Wali Gali Dundahera', 'Sunar Wali Gali Dundahera', 28.515706, 77.072096, '28.5157057, 77.072096', 'verified', null, 'Low lying area, approx 4 feet deeper than main road and storm water is drained out through pumping.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Rajesh', '9205090487', 'critical'],
  [5, 2, 3, 'Sh. Mohit Vats', '9899850219', 'Bank Wali Gali Dundahera', 'Bank Wali Gali Dundahera', 28.515706, 77.072096, '88.5157057, 77.072096', 'corrected', 'PDF latitude typo 88.5157 corrected to 28.5157 (Dundahera)', 'Low lying area, main storm water drain is being de-silted.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Pawan', '9560782497', 'high'],
  [6, 2, 3, 'Sh. Mohit Vats', '9899850219', 'Sarhol Mod Sector-18 T-Point', 'Sarhol Mod Sector-18 T-Point', 28.492295, 77.058738, '28.492295, 77.058738', 'verified', null, 'Low lying area, GMDA has constructed storm water drain along Sanath road, but cleaning is required.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Smt. Anita', '9310103478', 'high'],
  [7, 2, 3, 'Sh. Mohit Vats', '9899850219', 'Indian Oil Service Road Sector 18', 'Indian Oil Service Road Sector 18', 28.481765, 77.072026, '28.481765, 77.072026', 'verified', null, 'Water logging due to low lying area, storm water drain is silted up and in damaged condition.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Sanjeet', '9990054986', 'high'],
  [8, 2, 3, 'Sh. Mohit Vats', '9899850219', 'Near LIC Office Sector-18', 'Near LIC Office Sector-18', 28.48195, 77.07235, '28.481765, 77.072026', 'verified', null, 'Water logging due to low lying area, storm water drain is silted up and damaged condition.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Sanjeet', '9990054986', 'high'],
  [9, 2, 3, 'Sh. Mohit Vats', '9899850219', 'In front of Plot No-75D Sector 18', 'Plot No-75D Sector 18', 28.487753, 77.064395, '28.487753, 77.064395', 'verified', null, 'Water logging due to low lying area, storm water drain has been proposed for permanent solution.', 'Sh. Amit Kumar (R)', '8851181407', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Smt. Anita', '9310103478', 'normal'],
  [10, 3, 3, 'Sh. Mohit Vats', '9899850219', 'In front of H.No-1128 Sector 21', 'H.No-1128 Sector 21', 28.501758, 77.067002, '28.501758, 77.067002', 'verified', null, 'Water logging occurs due to blockage of GMDA storm water drain.', 'Sh. Sonu (R)', '9991902393', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Govind', '9205292138', 'high'],
  [11, 3, 3, 'Sh. Deepak', '9306265236', 'Near Radha Krishna Mandir H.No-335 Sec 21', 'Radha Krishna Mandir H.No-335 Sec 21', 28.512149, 77.067662, '28.512149, 77.067662', 'verified', null, 'Water logging occurs due to blockage of GMDA storm water drain.', 'Sh. Sonu (R)', '9991902393', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Smt. Seema Devi', '9870205751', 'high'],
  [12, 3, 3, 'Sh. Deepak', '9306265236', 'Near Delhi Gate Pocket C Sector 21', 'Delhi Gate Pocket C Sector 21', 28.50193, 77.061334, '28.50193, 77.061334', 'verified', null, 'Water logging occurs due to blockage of GMDA storm water drain.', 'Sh. Sonu (R)', '9991902393', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Govind', '9205292138', 'high'],
  [13, 3, 3, 'Sh. Deepak', '9306265236', 'In front of Community Centre Sector 22B', 'Community Centre Sector 22B', 28.508526, 77.066475, '28.508526, 77.066475', 'verified', null, 'Water logging occurs due to blockage of GMDA storm water drain.', 'Sh. Sonu (R)', '9991902393', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Vikram', '9990233890', 'high'],
  [14, 4, 3, 'Sh. Deepak', '9306265236', 'A Block Palam Vihar near Macdy', 'A Block Palam Vihar near McDonald\'s', 28.504993, 77.03767, '28.504993, 77.03767', 'verified', null, 'Water logging due to low lying area.', 'Sh. Sanjeet (R)', '7404342929', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Kamal', '9560290798', 'normal'],
  [15, 4, 3, 'Sh. Deepak', '9306265236', 'Palam Vihar C-2 Block', 'Palam Vihar C-2 Block', 28.496283, 77.019745, '28.49628333, 77.019745', 'verified', null, 'Water logging due to low lying area.', 'Sh. Sanjeet (R)', '7404342929', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Kamal', '9560290798', 'normal'],
  [16, 4, 3, 'Sh. Deepak', '9306265236', 'Palam Vihar D Block near Mother Dairy', 'Palam Vihar D Block Mother Dairy', 28.511153, 77.031295, '28.51115333, 77.031295', 'verified', null, 'Water logging due to low lying area.', 'Sh. Sanjeet (R)', '7404342929', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Kamal', '9560290798', 'normal'],
  [17, 4, 3, 'Sh. Deepak', '9306265236', 'Sec 23 near Ansal Plaza', 'Sec 23 near Ansal Plaza', 28.510931, 77.04226, '28.510931, 77.04226', 'verified', null, 'Water logging due to low lying area.', 'Sh. Sanjeet (R)', '7404342929', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Kuldeep Singh', '9818305323', 'normal'],

  // ZONE 2 — WARDS 5–8, 28–30, 32–34
  [18, 5, 2, 'Sh. Deepak', '9306265236', 'Bajghera Firni', 'Bajghera Firni Road', 28.51278, 77.01087, '28.31278, 77.01087', 'corrected', 'PDF latitude 28.31278 corrected to Bajghera 28.51278', 'Low lying area and silt in drains.', 'Sh. Ram Karan', '7355848489', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sushil', '9718620832', 'high'],
  [19, 6, 2, 'Sh. Deepak', '9306265236', 'Dhankot Canal Road', 'Dhankot Canal Road', 28.471652, 76.955926, '28.471652, 76.955926', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Nishupal Gulia', '9871375032', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Mintu', '9729555060', 'high'],
  [20, 7, 2, 'Sh. Deepak', '9306265236', 'Basai Village near Lakhpat Kataria House', 'Basai Village Lakhpat Kataria House', 28.459073, 76.980922, '28.459073, 76.9809216', 'verified', null, 'Low lying area.', 'Sh. Jasvinder', '9518002897', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Monu', '8882263998', 'normal'],
  [21, 7, 2, 'Sh. Mahen', '8901588774', 'Basai Village near Community Center', 'Basai Village Community Center', 28.468288, 76.985728, '28.4682883, 76.9857277', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Jasvinder', '9518002897', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Monu', '8882263998', 'high'],
  [22, 7, 2, 'Sh. Mahen', '8901588774', 'Dhanwapur Village near Bikaner Chowk', 'Dhanwapur Village Bikaner Chowk', 28.478685, 76.992743, '28.478685, 76.992743', 'verified', null, 'Low lying area.', 'Sh. Jasvinder', '9518002897', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Rajesh', '9250545001', 'normal'],
  [23, 8, 2, 'Sh. Mahen', '8901588774', 'In front of Khushbu Apartment', 'Khushbu Apartment Sec-9A', 28.47062, 76.995575, '28.4706201, 76.9955748', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Deepak Sharma', '8398898925', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Narender', '8882264046', 'high'],
  [24, 8, 2, 'Sh. Mahen', '8901588774', 'Sector-9A Community Centre Road', 'Sector-9A Community Centre', 28.469495, 76.995089, '28.4694946, 76.995089', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Deepak Sharma', '8398898925', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Narender', '8882264046', 'high'],
  [25, 8, 2, 'Sh. Mahen', '8901588774', 'Market Road Sector-9A', 'Market Road Sector-9A', 28.469038, 76.995198, '28.4690379, 76.9951976', 'verified', null, 'Low lying area.', 'Sh. Deepak Sharma', '8398898925', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Narender', '8882264046', 'normal'],
  [26, 8, 2, 'Sh. Mahen', '8901588774', 'Corner of Sidheshwar School', 'Sidheshwar School Sector-9A', 28.468688, 76.995759, '28.4686879, 76.9957591', 'verified', null, 'Low lying area.', 'Sh. Deepak Sharma', '8398898925', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Narender', '8882264046', 'normal'],

  // ZONE 1 — WARDS 9–11, 14–18
  [27, 9, 1, 'Sh. Mahen', '8901588774', 'Side Road of GMDA Bus Stand Sec-10', 'GMDA Bus Stand Sector-10 (Basai Rd Entry)', 28.446052, 76.991622, '28.446052, 76.991622', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Rahul', '9812975091', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Vishal', '9999161398', 'high'],
  [28, 9, 1, 'Sh. Mahen', '8901588774', 'In front of Alpine School Sec-10', 'Alpine School Sector-10', 28.451613, 76.995829, '28.451613, 76.995829', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Rahul', '9812975091', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Vishal', '9999161398', 'high'],
  [29, 9, 1, 'Sh. Mahen', '8901588774', 'HUDA Market Sec-10 (Blue Bells / Euro Intl)', 'HUDA Market Sector-10', 28.452512, 77.004263, '28.452512, 77.004263', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Rahul', '9812975091', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Vishal', '9999161398', 'high'],
  [30, 10, 1, 'Sh. Mahen', '8901588774', 'Sector 10A Market near Gate No-7', 'Near DAV School Sector 10A', 28.43887, 77.005661, '28.438870, 77.005661', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Shubham', '9728220667', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Subhash', '8383843700', 'high'],
  [31, 10, 1, 'Sh. Krishan Kumar', '9813139366', 'Sector 10A Gate No-5', 'Gate No. 05 Sector 10A', 28.444206, 76.99975, '28.444206, 76.999750', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Shubham', '9728220667', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Subhash', '8383843700', 'high'],
  [32, 10, 1, 'Sh. Krishan Kumar', '9813139366', 'Sector 10A in front of Gandhi Nagar Booster', 'Gandhi Nagar Boosting Station', 28.449098, 77.006008, '28.449098, 77.006008', 'verified', null, 'Water logging due to silt in drain.', 'Sh. Shubham', '9728220667', 'Smt. Anju Bala', '9821395243', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Subhash', '8383843700', 'high'],
  [33, 11, 1, 'Sh. Krishan Kumar', '9813139366', 'Hans Enclave', 'Near Jain Mandir Hans Enclave', 28.447337, 77.025965, '28.447337, 77.025965', 'verified', null, 'Low lying area & drain block.', 'Sh. Mulayam Singh', '9467185951', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Anuj', '9910233921', 'high'],
  [34, 11, 1, 'Sh. Krishan Kumar', '9813139366', 'Govt Primary School Naharpur Rupa', 'Near Shiv Mandir Naharpur Rupa', 28.439266, 77.018624, '28.439266, 77.018624', 'verified', null, 'Low lying area.', 'Sh. Mulayam Singh', '9467185951', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Amit', '9891359603', 'normal'],
  [35, 11, 1, 'Sh. Krishan Kumar', '9813139366', 'Naharpur Rupa Main Entry', 'Near Krishan Dharam Kanta', 28.44302, 77.018813, '28.44302, 77.018813', 'verified', null, 'Low lying area.', 'Sh. Mulayam Singh', '9467185951', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Amit', '9891359603', 'normal'],
  [36, 11, 1, 'Sh. Krishan Kumar', '9813139366', 'Sector 47 Near DPS', 'Near Community Centre Sector 47', 28.430144, 77.052801, '28.430144, 77.0528011', 'verified', null, 'Drainage block.', 'Sh. Mulayam Singh', '9467185951', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Kabir', '7683018411', 'high'],

  // ZONE 3 — WARDS 12–13
  [37, 12, 3, 'Sh. Krishan Kumar', '9813139366', 'Back side Govt. School Islampur', 'Back side Govt. School Islampur', 28.43708, 77.035729, '28.43708, 77.035729', 'verified', null, 'Water logging due to low lying area.', 'Sh. Amit Kumar (R)', '8607840780', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Rakesh', '9540705142', 'normal'],
  [38, 12, 3, 'Sh. Krishan Kumar', '9813139366', 'Near H. No. 559 Sec-39 Bakhtawar Chowk', 'H.No. 559 Sec-39 Bakhtawar Chowk', 28.43807, 77.052353, '28.43807, 77.052353', 'verified', null, 'Water logging due to low lying area.', 'Sh. Amit Kumar (R)', '8607840780', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Mahavir', '9899857465', 'normal'],
  [39, 12, 3, 'Sh. Krishan Kumar', '9813139366', 'Sec 39 Pocket D near Main Gate', 'Sec 39 Pocket D Main Gate', 28.440466, 77.054377, '28.440466, 77.054377', 'verified', null, 'Water logging due to low lying area.', 'Sh. Amit Kumar (R)', '8607840780', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Mahavir', '9899857465', 'normal'],
  [40, 12, 3, 'Sh. Krishan Kumar', '9813139366', 'Sec 39 E Pocket back side Cyber Park', 'Sec 39 E Pocket Cyber Park', 28.446411, 77.055261, '28.446411, 77.055261', 'verified', null, 'Water logging due to low lying area.', 'Sh. Amit Kumar (R)', '8607840780', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Mahavir', '9899857465', 'normal'],
  [41, 12, 3, 'Sh. Naveen Kumar', '8053949725', 'South City near H. No. 42 and 77', 'South City H.No. 42 & 77', 28.453538, 77.058164, '28.453538, 77.058164', 'verified', null, 'Water logging due to low lying area.', 'Sh. Amit Kumar (R)', '8607840780', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Karamveer', '9773843302', 'normal'],
  [42, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Sector 15 Part II along Citizen Park', 'Sector 15 Part II Citizen Park', 28.454574, 77.042674, '28.4545738, 77.0426741', 'verified', null, 'Water logging due to low lying area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Rajkumar', '9911327871', 'normal'],
  [43, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Bandh Road near H.No 1094 Sec 15 Part-II', 'Bandh Road H.No 1094 Sec 15 Part-II', 28.460984, 77.042014, '28.4609837, 77.042014', 'verified', null, 'Water logging due to low lying area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Rocky', '8689051389', 'normal'],
  [44, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Jubilee Park Sector 31', 'Jubilee Park Sector 31', 28.453822, 77.045449, '28.4538223, 77.0454493', 'verified', null, 'Water occurs due to low lying area in green belt of NH-8 and adjoining area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Robin', '9910850865', 'high'],
  [45, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Sector 15 Part II Market Rd towards Skoda', 'Sector 15 Part II Market Road', 28.464072, 77.048578, '28.4640717, 77.0485784', 'verified', null, 'Water logging due to low lying area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Sumit', '9999732291', 'normal'],
  [46, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Sector 40 House No 1114', 'Sector 40 H.No 1114', 28.446716, 77.055232, '28.4467156, 77.0552324', 'verified', null, 'Water logging due to low lying area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Tejpal', '9312279426', 'normal'],
  [47, 13, 3, 'Sh. Naveen Kumar', '8053949725', 'Near House of Smt. Kamla Retd. IAS', 'House of Smt. Kamla Retd. IAS', 28.451676, 77.03481, '28.4516755, 77.0348104', 'verified', null, 'Water logging due to low lying area.', 'Sh. Ravinder Kumar (R)', '8950149059', 'Sh. Naim Hussain', '9821395235', 'Sh. Aman', '7838818418', 'Sh. Tejpal', '9312279426', 'normal'],

  // ZONE 1 — WARDS 14–18
  [48, 14, 1, 'Sh. Naveen Kumar', '8053949725', 'Sushant Lok Phase 3 (A, D & B1 Block)', 'A, D & B1 Block Sushant Lok 3', 28.414718, 77.080205, '28.414718, 77.080205', 'verified', null, 'Low lying area.', 'Sh. Neeraj', '9990976362', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Praveen', '9817407204', 'normal'],
  [49, 14, 1, 'Sh. Naveen Kumar', '8053949725', 'Sector 46 near Amethi School H.No 3204', 'Near Amethi School H.No. 3204', 28.434887, 77.064065, '28.434887, 77.064065', 'verified', null, 'Low lying area.', 'Sh. Neeraj', '9990976362', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Jitender', '9560631864', 'normal'],
  [50, 14, 1, 'Sh. Ritesh Rana', '8860250979', 'Sector 57 near Tigra Village', 'Near Tigra Village Sec 57', 28.417193, 77.074298, '28.417193, 77.074298', 'verified', null, 'Low lying area.', 'Sh. Neeraj', '9990976362', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Harsh', '9910367307', 'normal'],
  [51, 14, 1, 'Sh. Ritesh Rana', '8860250979', 'Sector 51 near H.No. 930', 'Near H.No. 930 Sector 51', 28.4321, 77.064471, '28.432100, 77.064471', 'verified', null, 'Low lying area.', 'Sh. Neeraj', '9990976362', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Yogesh', '9773970577', 'normal'],
  [52, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'South City II A Block', 'South City A Block', 28.41879, 77.04498, '28.41879, 77.4498', 'corrected', 'PDF longitude 77.4498 corrected to 77.04498 (South City II)', 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Sunil Lamba', '7834858668', 'normal'],
  [53, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'South City II A1 Block', 'South City A1 Block', 28.4197, 77.048418, '28.41970, 77.48418', 'corrected', 'PDF longitude 77.48418 corrected to 77.048418 (South City II)', 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Sunil Lamba', '7834858668', 'normal'],
  [54, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'South City II C Block', 'South City C Block', 28.4191, 77.0492, '28.41970, 77.48418', 'corrected', 'PDF longitude 77.48418 corrected to 77.0492 (South City II)', 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Sunil Lamba', '7834858668', 'normal'],
  [55, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'Rosewood City C Block', 'Rosewood City C Block', 28.408213, 77.057529, '28.408213, 77.057529', 'verified', null, 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Vishal', '7982226514', 'normal'],
  [56, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'Rosewood City D Block', 'Rosewood City D Block', 28.412003, 77.058406, '28.412003, 77.058406', 'verified', null, 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Vishal', '7982226514', 'normal'],
  [57, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'M R Land Sec 65', 'M R Land Sec 65', 28.400554, 77.05495, '28.400554, 77.054950', 'verified', null, 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Manoj Kaushik', '9582708817', 'normal'],
  [58, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'Dhumaspur Village near Jail Road', 'Near By Jail Road Dhumaspur', 28.376033, 77.07395, '28.376033, 77.073950', 'verified', null, 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Ajay', '8447013290', 'normal'],
  [59, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'Dhumaspur Village near Water Supply', 'Near Water Supply Dhumaspur', 28.377364, 77.074752, '28.377364, 77.074752', 'verified', null, 'Low lying area.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Ajay', '8447013290', 'normal'],
  [60, 15, 1, 'Sh. Ritesh Rana', '8860250979', 'Maidawas Village Shani Mandir', 'Sachin Tyagi Office to Shani Mandir', 28.393465, 77.066523, '28.393465, 77.066523', 'verified', null, 'Drainage block.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Ajay', '8447013290', 'high'],
  [61, 15, 1, 'Sh. Dipanshu', '9818525120', 'Umarpur Nangli Nial School', 'Near Bhumiya Mandir Nangli Umarpur', 28.406628, 77.079962, '28.406628, 77.079962', 'verified', null, 'No sewer line and drainage.', 'Sh. Tajjammul Hussain', '7206968786', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Ajay', '8447013290', 'high'],
  [62, 16, 1, 'Sh. Dipanshu', '9818525120', 'Uppal Southend S & W Block', 'Block S, W Uppal Southend', 28.410535, 77.043733, '28.410535, 77.043733', 'verified', null, 'Low lying area.', 'Sh. Kapil Yadav', '9728822849', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Yogesh Prajapati', '7503334826', 'normal'],
  [63, 16, 1, 'Sh. Dipanshu', '9818525120', 'Housing Board Uppal Southend', 'Housing Board Uppal Southend', 28.411234, 77.039786, '28.411234, 77.039786', 'verified', null, 'Low lying area.', 'Sh. Kapil Yadav', '9728822849', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Yogesh Prajapati', '7503334826', 'normal'],
  [64, 16, 1, 'Sh. Dipanshu', '9818525120', 'Vipul World B, C, D Block', 'Vipul World B.C.D Block', 28.411269, 77.035591, '28.411269, 77.035591', 'verified', null, 'Low lying area.', 'Sh. Kapil Yadav', '9728822849', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Manoj Kaushik', '9582708817', 'normal'],
  [65, 16, 1, 'Sh. Dipanshu', '9818525120', 'Fazilpur Hanuman Mandir', 'Hanuman Mandir Fazilpur', 28.409884, 77.031686, '28.409884, 77.031686', 'verified', null, 'Low lying area.', 'Sh. Kapil Yadav', '9728822849', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Mukesh', '9654579515', 'normal'],
  [66, 17, 1, 'Sh. Dipanshu', '9818525120', 'Begampur Khatola Govt School', 'Govt School & Hanuman Mandir', 28.414523, 77.009124, '28.4145231, 77.009124', 'verified', null, 'Low lying area.', 'Sh. Sachin Kumar', '9990020160', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Deepchand', '7291927532', 'normal'],
  [67, 17, 1, 'Sh. Dipanshu', '9818525120', 'Behrampur Tata Motors & Axis ATM', 'Tata Motors / Axis Bank ATM Behrampur Rd', 28.428727, 77.005692, '28.428727, 77.005692', 'verified', null, 'Low lying area.', 'Sh. Sachin Kumar', '9990020160', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Amit Singh', '8130656944', 'normal'],
  [68, 17, 1, 'Sh. Dipanshu', '9818525120', 'Behrampur Dharmi Ka Theka', 'Dharmi Ka Theka Behrampur Road', 28.422028, 77.01369, '28.422028, 77.013690', 'verified', null, 'Low lying area.', 'Sh. Sachin Kumar', '9990020160', 'Sh. Prem Singh', '8447446873', 'Sh. Baljeet Kumar', '9911705421', 'Sh. Amit Singh', '8130656944', 'normal'],
  [69, 18, 1, 'Sh. Dipanshu', '9818525120', 'Vatika Chowk behind Shamshan Ghat', 'Behind Shamshan Ghat Vatika Chowk', 28.400506, 77.045375, '28.4005059, 77.0453745', 'verified', null, 'Low lying area.', 'Sh. Rahul Khan', '9821395267', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Sagar', '980818103', 'high'],
  [70, 18, 1, 'Sh. Dipanshu', '9818525120', 'Khota Colony Behind Gandhi Colony', 'Gandhi Colony Badshahpur', 28.390209, 77.043861, '28.390209, 77.043861', 'verified', null, 'Low lying area.', 'Sh. Rahul Khan', '9821395267', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Manoj Kaushik', '9582708817', 'normal'],
  [71, 18, 1, 'Sh. Hitesh', '9728682743', 'Tyagiwada near Community Centre', 'Tyagiwada Community Centre', 28.398156, 77.054534, '28.398156, 77.054534', 'verified', null, 'Low lying area.', 'Sh. Rahul Khan', '9821395267', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Manoj Kaushik', '9582708817', 'normal'],
  [72, 18, 1, 'Sh. Hitesh', '9728682743', 'RR Colony Behind Girl School', 'RR Colony Badshahpur', 28.388121, 77.052945, '28.388121, 77.052945', 'verified', null, 'Low lying area.', 'Sh. Rahul Khan', '9821395267', 'Sh. Prem Singh', '8447446873', 'Sh. Gaurav', '9953404421', 'Sh. Manoj Kaushik', '9582708817', 'normal'],

  // ZONE 4 — WARDS 19–26
  [73, 19, 4, 'Sh. Hitesh', '9728682743', 'Maruti Kunj Main Gate', 'Maruti Kunj Main Gate', 28.361118, 77.078915, '28.361118, 77.078915', 'verified', null, 'Newly approved as well as low lying. Road surface water accumulates to this point.', 'Sh. Arif Khan (HKRN)', '9899907495', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Anil', '9711359284', 'high'],
  [74, 19, 4, 'Sh. Hitesh', '9728682743', 'Saneh Vihar Front of Dadi Sati Mandir', 'Dadi Sati Mandir Saneh Vihar', 28.354326, 77.062405, '28.354326, 77.062405', 'verified', null, 'Newly approved colony is uneven, due to which rain water accumulates at different locations.', 'Sh. Arif Khan (HKRN)', '9899907495', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Munesh', '8929767288', 'normal'],
  [75, 19, 4, 'Sh. Hitesh', '9728682743', 'Village Bhondsi near Govt School', 'Govt School Bhondsi', 28.348545, 77.065527, '28.348545, 77.065527', 'verified', null, 'Low lying area. Newly approved and there is no provision of storm water drainage and sewerage line.', 'Sh. Arif Khan (HKRN)', '9899907495', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Munesh', '8929767288', 'high'],
  [76, 20, 4, 'Sh. Hitesh', '9728682743', 'Near Khaliya Wala Kuan Village Bandhwari', 'Khaliya Wala Kuan Bandhwari', 28.4165, 77.1292, '28.247N, 77.855E', 'corrected', 'PDF malformed DMS 28.247N, 77.855E normalized to Bandhwari 28.4165, 77.1292', 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Ashok', '9599266718', 'normal'],
  [77, 20, 4, 'Sh. Hitesh', '9728682743', 'Village Ghata Under Pass', 'Village Ghata Under Pass', 28.42204, 77.1096, '28.42204, 77.1096', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Rakesh', '9953665637', 'critical'],
  [78, 20, 4, 'Sh. Hitesh', '9728682743', 'Teri Gram Faridabad Rd (Baliyawas)', 'Village Baliyawas Faridabad Rd', 28.429778, 77.144577, '28.429778333, 77.14457666', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Ravinder', '9671044026', 'normal'],
  [79, 20, 4, 'Sh. Hitesh', '9728682743', 'Mujjafar Ali Farm House New Gwal Pahari', 'New Gwal Pahari Faridabad Rd', 28.4312, 77.1462, '28.429778333, 77.14457666', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Sukpal', '8920151122', 'normal'],
  [80, 20, 4, 'Sh. Hitesh', '9728682743', 'E Block (Near Creek) Sec-55/56 Road', 'E Block Near Creek Sec-55/56', 28.420036, 77.094937, '28.420036, 77.094937', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Pawan Kumar', '8000116841', 'high'],
  [81, 20, 4, 'Sh. Jaswant', '9050862877', 'CRPF Camp Road Kadarpur', 'Main CRPF Camp Road', 28.393222, 77.096659, '28.393222, 77.096659', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Sanjay', '7056068123', 'normal'],
  [82, 20, 4, 'Sh. Jaswant', '9050862877', 'Kadarpur Mod in front of Baraat Ghar', 'Front of Baraat Ghar Kadarpur', 28.393006, 77.097278, '28.393006, 77.097278', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Sanjay', '7056068123', 'normal'],
  [83, 20, 4, 'Sh. Jaswant', '9050862877', 'Hoshiyar Singh Advocate House Behrampur', 'Behrampur Village', 28.39301, 77.096738, '28.393010, 77.096738', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Amit', '8130656944', 'normal'],
  [84, 20, 4, 'Sh. Jaswant', '9050862877', 'Main Road Ullawas', 'Main Road Ullawas', 28.405003, 77.095611, '28.405003, 77.095611', 'verified', null, 'Low lying area.', 'Sh. Sandeep Hooda (R)', '9991992994', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Bijander', '8930118104', 'normal'],
  [85, 21, 4, 'Sh. Jaswant', '9050862877', 'Ardee City Gate No. 3', 'Ardee City Gate No. 3', 28.441702, 77.071894, '28.441702, 73.071894', 'corrected', 'PDF longitude typo 73.071894 corrected to 77.071894 (Ardee City)', 'Low lying area and all rain water runoff on internal society roads accumulates to this point.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Chatlai RWA', '9899550942', 'high'],
  [86, 21, 4, 'Sh. Jaswant', '9050862877', 'H.No. 1241 to Tempo Stand Wazirabad', 'Tempo Stand Wazirabad', 28.44183, 77.082482, '28.44183, 77.82482', 'corrected', 'PDF longitude 77.82482 corrected to 77.082482 (Wazirabad)', 'The surface of this road is uneven due to which water accumulated at different patches.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Sunil Kumar', '9971211818', 'normal'],
  [87, 21, 4, 'Sh. Jaswant', '9050862877', 'Wazirabad Dhani Chowk', 'Front of Community Center Wazirabad', 28.439479, 77.088836, '28.4394786, 77.0888355', 'verified', null, 'GMDA master line backflows during rain. Once the drain starts taking water, water logging clears.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Rahul', '9910793032', 'critical'],
  [88, 21, 4, 'Sh. Jaswant', '9050862877', 'Jheel Chowk Wazirabad', 'Sec-57 Main Entry', 28.430044, 77.081064, '28.4300435, 77.0810635', 'verified', null, 'Low lying area and water runoff of the village accumulates at this point.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Dharmpal', '9540712098', 'high'],
  [89, 21, 4, 'Sh. Jaswant', '9050862877', 'Suncity Main Entrance & B-Block', 'Near Sec-54 Metro Station', 28.434909, 77.105032, '28.4349086, 77.10503222', 'verified', null, 'Low lying area and water runoff of the society accumulates at this point.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Akash', '7982274408', 'high'],
  [90, 21, 4, 'Sh. Jaswant', '9050862877', 'Sector 57 Part 1', 'Lane of H.No. 956 Sector 57', 28.420603, 77.074107, '28.4206034, 77.0741072', 'verified', null, 'Storm drainage cleaning required.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Sachin', '8527808472', 'high'],
  [91, 21, 4, 'Sh. Kuldeep', '8684985216', 'F & G Block Sushant Lok 2', 'Entrance of Bikanerwala SL-2', 28.416382, 77.085117, '28.4163823, 77.0851170', 'verified', null, 'Storm drainage cleaning required.', 'Sh. Ritesh (R)', '9728182721', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Veer Singh', '8826741299', 'high'],
  [92, 22, 4, 'Sh. Kuldeep', '8684985216', 'Near Camera Museum Village Chakkarpur', 'Camera Museum Chakkarpur', 28.468223, 77.079777, '28.468223, 77.079777', 'verified', null, 'Water comes from Chakkarpur village.', 'Sh. Millan Yadav (HKRN)', '8860367476', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Virander Kumar', '9205117030', 'normal'],
  [93, 22, 4, 'Sh. Kuldeep', '8684985216', 'A-1065 Lane A-Block Sushant Lok-1', 'H.No-1065 Sushant Lok-1', 28.47669, 77.077308, '28.47669, 77.077308', 'verified', null, 'Water comes from Chakkarpur village.', 'Sh. Millan Yadav (HKRN)', '8860367476', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Shamsher', '9810426874', 'normal'],
  [94, 22, 4, 'Sh. Kuldeep', '8684985216', 'A-206 Lane A-Block Sushant Lok-1', 'H.No-206 Sushant Lok-1', 28.469133, 77.079653, '28.469133, 77.079653', 'verified', null, 'Low lying area.', 'Sh. Millan Yadav (HKRN)', '8860367476', 'Sh. Kuldeep Kumar', '9821395241', 'Sh. Bhupender Singh', '9654841272', 'Sh. Shamsher', '9810426874', 'normal'],
  [95, 23, 4, 'Sh. Kuldeep', '8684985216', 'Sector-28 Main Junction', 'Sector-28', 28.4731, 77.0846, 'Blank in PDF row 95', 'corrected', 'Missing coordinates in PDF row 95 mapped to Sector-28 center', 'GMDA Chakkarpur Bandh overflow.', 'Sh. Vinay Verma (HKRN)', '9971070036', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Virander Kumar', '9205117030', 'critical'],
  [96, 23, 4, 'Sh. Kuldeep', '8684985216', 'Opposite Sheeba Apartment GH-I Sec 28', 'Sheeba Apartment GH-I Sector 28', 28.468099, 77.088272, '28.4680992, 77.0882716', 'verified', null, 'GMDA Chakkarpur Bandh overflow.', 'Sh. Vinay Verma (HKRN)', '9971070036', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Virander Kumar', '9205117030', 'critical'],
  [97, 23, 4, 'Sh. Kuldeep', '8684985216', 'Chakarpur Mandir near DLF-I', 'Near DLF-I Chakarpur Mandir', 28.47408, 77.090436, '28.4740801, 77.0904361', 'verified', null, 'Low lying area.', 'Sh. Vinay Verma (HKRN)', '9971070036', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Veer Singh', '8826741299', 'normal'],
  [98, 24, 4, 'Sh. Kuldeep', '8684985216', 'Gulab Park Rd near H.No 336 Sushant Lok', 'H.No 336 Sushant Lok', 28.45418, 77.081424, '28.45418, 77.081424', 'verified', null, 'Low lying area.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Rakesh Kumar', '9999729009', 'normal'],
  [99, 24, 4, 'Sh. Kuldeep', '8684985216', 'Near Govt School Kanhai', 'Near Tularam Market Kanhai', 28.447259, 77.07237, '28.447259, 77.07237', 'verified', null, 'Low lying area.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Ravi', '8744009696', 'normal'],
  [100, 24, 4, 'Sh. Kuldeep', '8684985216', 'Near H.No. 1637 Sector-45', 'H.No 1637 Sector-45', 28.447367, 77.064886, '28.447367, 77.064886', 'verified', null, 'Low lying area.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Ajay', '8447013290', 'normal'],
  [101, 24, 4, 'Sh. Love Chauhan', '9149244041', 'Silokhera Village Road', 'Entry Road Silokhera', 28.458293, 77.060052, '28.458293, 77.060052', 'verified', null, 'Overflow of main GMDA line.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Sk Bablu', '9654122942', 'critical'],
  [102, 24, 4, 'Sh. Love Chauhan', '9149244041', 'C-Block near H.No C-111 South City-I', 'H.No C-111 South City-I', 28.459055, 77.061171, '28.4590552, 77.0611712', 'verified', null, 'Low lying area.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Karmveer', '9773843302', 'normal'],
  [103, 24, 4, 'Sh. Love Chauhan', '9149244041', 'South City Main Market Road', 'Main Market South City-I', 28.457384, 77.063147, '28.457384198, 77.06314722', 'verified', null, 'Low lying area.', 'Sh. Robin (R)', '8053256873', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Karmveer', '9773843302', 'normal'],
  [104, 25, 4, 'Sh. Love Chauhan', '9149244041', 'Sector 17A behind Naveen Goyal House 1832', 'Sec 17A House No 1832', 28.47624, 77.05405, '28.4762397, 77.0540500', 'verified', null, 'De-silting of drains and proper connectivity with Master drain required.', 'Sh. Sumit Chahal (R)', '9599783198', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Sohel', '9205770169', 'high'],
  [105, 25, 4, 'Sh. Love Chauhan', '9149244041', 'Sector 17B near House No 856', 'House No 856 Sec 17B', 28.484807, 77.061897, '28.4848073, 77.0618971', 'verified', null, 'Telecom cables are crossing the drainage line and producing hurdle in dewatering.', 'Sh. Sumit Chahal (R)', '9599783198', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Gagan', '8076764577', 'high'],
  [106, 25, 4, 'Sh. Love Chauhan', '9149244041', 'IDC Sector 16 near GIA House', 'Near GIA House IDC Sec 16', 28.471552, 77.05076, '28.4715522, 77.0507599', 'verified', null, 'Topographical road level is low from main road and drainage system is non-functional.', 'Sh. Sumit Chahal (R)', '9599783198', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Biraj Mohan', '9818225798', 'high'],
  [107, 25, 4, 'Sh. Love Chauhan', '9149244041', 'Old DLF Sec 14 Airforce School Gate', 'Sunder Singh Marg Airforce School', 28.47111, 77.040242, '28.4711101, 77.0402416', 'verified', null, 'Topographical road level is low from main road and drainage system is non-functional.', 'Sh. Sumit Chahal (R)', '9599783198', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Biraj Mohan', '9818225798', 'high'],
  [108, 26, 4, 'Sh. Love Chauhan', '9149244041', 'CRPF Camp Chowk', 'CRPF Chowk', 28.478481, 77.035213, '28.478481, 77.035213', 'verified', null, 'Low lying area.', 'Sh. Rakesh Kumar (R)', '9810954286', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Kalash', '9899029340', 'normal'],
  [109, 26, 4, 'Sh. Love Chauhan', '9149244041', 'Shiv Mandir Ram Mandir Chowk', 'Ram Mandir Chowk', 28.476209, 77.034906, '28.476209, 77.034906', 'verified', null, 'Low lying area.', 'Sh. Rakesh Kumar (R)', '9810954286', 'Sh. Pawan Kumar', '9821395269', 'Sh. Deepak Dagar', '8368448892', 'Sh. Beeru', '8800576115', 'normal'],

  // ZONE 3 — WARD 27
  [110, 27, 3, 'Sh. Love Chauhan', '9149244041', 'Jyoti Hospital Near Ganpati Enclave', 'Jyoti Hospital Ganpati Enclave', 28.457447, 77.036214, '28.4574472, 77.0362136', 'verified', null, 'Critical point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Vikas', '8368974336', 'critical'],
  [111, 27, 3, 'Sh. Amit', '9813187995', 'Vinayak Plaza Patel Nagar', 'Vinayak Plaza Patel Nagar', 28.456712, 77.036908, '28.4567118, 77.0369076', 'verified', null, 'Normal point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Mukesh', '9971238052', 'normal'],
  [112, 27, 3, 'Sh. Amit', '9813187995', 'Maharaja Agrasen Chowk', 'Maharaja Agrasen Chowk', 28.462339, 77.032288, '28.4623387, 77.0322882', 'verified', null, 'Critical point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Rinku', '9354189880', 'critical'],
  [113, 27, 3, 'Sh. Amit', '9813187995', 'Baraf Khana', 'Baraf Khana', 28.458511, 77.031458, '28.4585113, 77.0314581', 'verified', null, 'Normal point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Rajkaran', '9540922965', 'normal'],
  [114, 27, 3, 'Sh. Amit', '9813187995', 'Court Road', 'Court Road', 28.448037, 77.029679, '28.4480373, 77.0296787', 'verified', null, 'Normal point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Rinku', '9354189880', 'normal'],
  [115, 27, 3, 'Sh. Amit', '9813187995', 'Women Hostel Civil Lines', 'Women Hostel Civil Lines', 28.452889, 77.032519, '28.4528888, 77.0325189', 'verified', null, 'Normal point.', 'Sh. Deepak Yadav (R)', '7696102016', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Sanjay', '8510857175', 'normal'],

  // ZONE 2 & 3 — WARDS 28–36 (including merged PDF rows 117b, 124b, 124c)
  [116, 28, 2, 'Sh. Amit', '9813187995', 'Raj Nagar Chowk', 'Raj Nagar Chowk', 28.449237, 77.016491, '28.449237, 77.016491', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Rahul', '9812975091', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Pritam', '7217819881', 'high'],
  [117, 29, 2, 'Sh. Amit', '9813187995', 'Firoz Gandhi Colony near Bada Park', 'Firoz Gandhi Colony Bada Park', 28.457897, 77.010123, '28.457897, 77.010123', 'verified', null, 'Low lying area.', 'Sh. Naveen Yadav', '9582938762', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Suresh (Pradhan)', '9210458131', 'normal'],
  [117, 29, 2, 'Sh. Amit', '9813187995', 'Near Beri Wala Bagh Shivaji Nagar', 'Beri Wala Bagh Shivaji Nagar', 28.452418, 77.02628, '28.452418, 77.02628', 'verified', null, 'Low lying area.', 'Sh. Naveen Yadav', '9582938762', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Vikrant', '8860423316', 'normal'],
  [118, 30, 2, 'Sh. Amit', '9813187995', 'Madanpuri Gali No. 11', 'Madanpuri Gali No. 11', 28.460398, 77.01203, '28.460398, 77.01203', 'verified', null, 'Low lying area.', 'Sh. Vasupal', '9896998474', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Sarwan', '8377872019', 'normal'],
  [119, 30, 2, 'Sh. Amit', '9813187995', 'Madanpuri Road near Madan Lal Grover House', 'Madan Lal Grover House Madanpuri', 28.462491, 77.018694, '28.462491, 77.018694', 'verified', null, 'Low lying area.', 'Sh. Vasupal', '9896998474', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dinesh', '8802742919', 'normal'],
  [120, 31, 3, 'Sh. Amit', '9813187995', 'Auto Market Bhim Nagar', 'Auto Market Bhim Nagar', 28.464603, 77.022115, '28.4646027, 77.0221146', 'verified', null, 'Critical point.', 'Sh. Shubham (R)', '9728220667', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Rajesh', '9821395137', 'critical'],
  [122, 31, 3, 'Sh. Karamveer', '9729003575', 'Rajwanshi Hotel Subhash Nagar', 'Rajwanshi Hotel Subhash Nagar', 28.4654, 77.0235, '289.4646027, 77.0221146', 'corrected', 'PDF latitude typo 289.4646 corrected to 28.4654 (Subhash Nagar)', 'Normal point.', 'Sh. Shubham (R)', '9728220667', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Rajesh', '9821395137', 'normal'],
  [123, 31, 3, 'Sh. Karamveer', '9729003575', 'Miya Wali Colony', 'Miya Wali Colony', 28.468244, 77.027812, '28.4682442, 77.0278116', 'verified', null, 'Normal point.', 'Sh. Shubham (R)', '9728220667', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Smt. Sonia', '9958204647', 'normal'],
  [124, 32, 2, 'Sh. Karamveer', '9729003575', 'Krishna Colony Gali No. 09', 'Krishna Colony Gali No. 09', 28.465266, 77.011929, '28.465266, 77.011929', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Vineet', '8571091010', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Mukesh', '9250595444', 'high'],
  [124, 32, 2, 'Sh. Karamveer', '9729003575', 'Kataria Market Sector-7 Extension', 'Kataria Market Sec-7 Ext', 28.468794, 77.00941, '28.468794, 77.00941', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Vineet', '8571091010', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Hansraj', '8882263996', 'high'],
  [124, 32, 2, 'Sh. Karamveer', '9729003575', 'New Colony near Gaba Kothi', 'New Colony Gaba Kothi', 28.468684, 77.014062, '28.468684, 77.014062', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Vineet', '8571091010', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Smt. Bhagwati', '9813271576', 'high'],
  [125, 33, 2, 'Sh. Karamveer', '9729003575', 'Gali No. 17 Surat Nagar Phase-I', 'Surat Nagar Phase-I Gali 17', 28.48708, 77.006215, '28.48708, 77.006215', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'high'],
  [126, 33, 2, 'Sh. Karamveer', '9729003575', 'Block-B Gali No. 72 Laxman Vihar', 'Block-B Gali 72 Laxman Vihar', 28.481755, 77.006475, '28.481755, 77.006475', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Bhupender', '9211602160', 'high'],
  [127, 33, 2, 'Sh. Karamveer', '9729003575', 'Service Road along Flyover Laxman Vihar', 'Flyover Service Rd Laxman Vihar', 28.485158, 77.001113, '28.485158, 77.001113', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Bhupender', '9211602160', 'high'],
  [128, 33, 2, 'Sh. Karamveer', '9729003575', 'Main Railway Road Laxman Vihar', 'Main Railway Road Laxman Vihar', 28.484325, 77.012811, '28.484325, 77.012811', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Bhupender', '9211602160', 'high'],
  [129, 33, 2, 'Sh. Karamveer', '9729003575', 'HUDA Market near ICICI Bank Sector-04', 'HUDA Market ICICI Bank Sec-04', 28.47511, 77.009221, '28.47511, 77.009221', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Anil Atri', '8810273768', 'high'],
  [130, 33, 2, 'Sh. Karamveer', '9729003575', 'HUDA Market Sector-04 Inner Lane', 'HUDA Market Sector-04', 28.47545, 77.00955, '28.47511, 77.009221', 'verified', null, 'Low lying area.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Anil Atri', '8810273768', 'normal'],
  [131, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Gopi Pandit Wali Gali Rajendra Park', 'Gopi Pandit Wali Gali Rajendra Park', 28.495367, 77.006334, '28.495367, 77.006334', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [132, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'A-Block Park Wali Gali Rajendra Park', 'A-Block Rajendra Park', 28.493615, 77.006604, '28.493615, 77.006604', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [133, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Near Vishkarma Mandir Rajendra Park', 'Vishkarma Mandir Rajendra Park', 28.492844, 77.005764, '28.492844, 77.005764', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [134, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Near Gol Chakkar Rajendra Park', 'Gol Chakkar Rajendra Park', 28.49233, 77.00564, '28.49233, 77.00564', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [135, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'G-Block Ekta Market Rajendra Park', 'Ekta Market Rajendra Park', 28.490451, 77.004828, '28.490451, 77.004828', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [136, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Toyota Showroom Wali Gali Rajendra Park', 'Toyota Showroom Wali Gali', 28.490176, 77.00206, '28.490176, 77.00206', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Sanjay Multani', '9650787246', 'high'],
  [137, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Gali No. 10 Surat Nagar Phase-I', 'Surat Nagar Phase-I Gali 10', 28.483926, 77.005922, '28.483926, 77.005922', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'high'],
  [138, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Gali No. 9 Surat Nagar Phase-I', 'Surat Nagar Phase-I Gali 9', 28.483984, 77.005733, '28.483984, 77.005733', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'high'],
  [139, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Gali No. 3 Surat Nagar Phase-I', 'Surat Nagar Phase-I Gali 3', 28.486648, 77.007244, '28.486648, 77.007244', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'high'],
  [140, 34, 2, 'Ms. Bharti Sharma', '7838875147', 'Gali No. 8 Surat Nagar Phase-I', 'Surat Nagar Phase-I Gali 8', 28.48673, 77.006831, '28.48673, 77.006831', 'verified', null, 'Low lying area and silt in drains.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'high'],
  [141, 34, 2, 'Ms. Sunita', '9810850774', 'Gali No. 17 Surat Nagar Phase-I (W34)', 'Surat Nagar Phase-I Gali 17', 28.4874, 77.0065, '28.48708, 77.006215', 'verified', null, 'Low lying area.', 'Sh. Satyender', '9307322111', 'Sh. Dalip Yadav', '9821395226', 'Sh. Harish Sharma', '9971123511', 'Sh. Dharmender', '9250522666', 'normal'],
  [142, 35, 3, 'Ms. Sunita', '9810850774', 'Sector 5 Part 6', 'Sector 5 Part 6', 28.483117, 77.016437, '28.4831172, 77.16437', 'corrected', 'PDF longitude 77.16437 corrected to 77.016437 (Sector 5)', 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Manju', '8368216012', 'normal'],
  [143, 35, 3, 'Ms. Sunita', '9810850774', 'Sector 5 Part 3', 'Sector 5 Part 3', 28.478918, 77.020052, '28.47891765, 77.02005159', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Vikas', '8368974336', 'normal'],
  [144, 35, 3, 'Ms. Sunita', '9810850774', 'Chintpurni Mata Mandir', 'Chintpurni Mata Mandir Sec 5', 28.477787, 77.016686, '28.477787, 77.016686', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Vikas', '8368974336', 'normal'],
  [145, 35, 3, 'Ms. Sunita', '9810850774', 'Khedi Sarkari School', 'Khedi Sarkari School', 28.490243, 77.015282, '28.490243, 77.015282', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Deepak', '9953768381', 'normal'],
  [146, 35, 3, 'Ms. Sunita', '9810850774', 'Durga Sweets Khedi', 'Durga Sweets Bhimgarh Khedi', 28.486968, 77.011921, '28.486968, 77.011921', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Deepak', '9953768381', 'normal'],
  [147, 35, 3, 'Ms. Sunita', '9810850774', 'Bhimgarh Khedi Ashoka Apartment', 'Ashoka Apartment Bhimgarh Khedi', 28.48786, 77.011567, '28.48786, 77.011567', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Deepak', '9953768381', 'normal'],
  [148, 35, 3, 'Ms. Chanchal', '8447354049', 'Gali No. 11 & 12 Bhimgarh Kheri', 'Gali No 11-12 Bhimgarh Kheri', 28.490448, 77.013175, '28.490448, 77.013175', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Deepak', '9953768381', 'normal'],
  [149, 35, 3, 'Ms. Chanchal', '8447354049', 'Sec 5 Market', 'Sector 5 Market', 28.47925, 77.02045, '28.47891765, 77.02005159', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Vikas', '8368974336', 'normal'],
  [150, 36, 3, 'Ms. Chanchal', '8447354049', 'Sheetla Mandir Road', 'Sheetla Mandir Road', 28.492045, 77.021112, '28.492045, 77.021112', 'verified', null, 'Critical point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Smt. Sonia', '9958204647', 'critical'],
  [151, 36, 3, 'Ms. Chanchal', '8447354049', 'J Block Ashok Vihar Phase-III', 'J Block Ashok Vihar Phase-III', 28.49235, 77.02145, '28.492045, 77.0211112', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Naveen', '9990904779', 'normal'],
  [152, 36, 3, 'Ms. Chanchal', '8447354049', 'Shingha Chowk', 'Shingha Chowk', 28.474647, 77.029829, '28.474647, 777.029829', 'corrected', 'PDF longitude typo 777.029829 corrected to 77.029829', 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Smt. Sonia', '9958204647', 'normal'],
  [153, 36, 3, 'Ms. Chanchal', '8447354049', 'Ashok Vihar Phase-II near Chotu Ram Chowk', 'Chotu Ram Chowk Ashok Vihar II', 28.490075, 77.02287, '28.490075, 77.02287', 'verified', null, 'Normal point.', 'Sh. Devender (R)', '9821395266', 'Sh. Krishan Kumar', '9821395237', 'Sh. Aman', '7838818418', 'Sh. Deepak', '9953768381', 'normal'],
];

function classifyCause(cause: string): CauseCategory {
  const c = cause.toLowerCase();
  if (c.includes('telecom')) return 'telecom_obstruction';
  if (c.includes('backflow') || c.includes('overflow') || c.includes('chakkarpur bandh')) return 'gmda_backflow';
  if (c.includes('no master drain') || c.includes('no storm water drain') || c.includes('no sewer line') || c.includes('no provision')) return 'no_master_drain';
  if (c.includes('road level') || c.includes('topographoical') || c.includes('topographical') || c.includes('uneven')) return 'road_level_diff';
  if (c.includes('silt') || c.includes('block') || c.includes('cleaning')) return 'silt_blockage';
  if (c.includes('critical point')) return 'critical_junction';
  return 'low_lying';
}

function classifyAgency(name: string, cause: string): McgHotspot['owningAgency'] {
  const txt = `${name} ${cause}`.toLowerCase();
  if (txt.includes('nh-8')) return 'NHAI';
  if (txt.includes('gmda') || txt.includes('chakkarpur bandh')) return 'GMDA';
  if (txt.includes('huda') || txt.includes('hsvp')) return 'HSVP';
  if (txt.includes('canal')) return 'Irrigation';
  return 'MCG';
}

function classifyType(name: string, cause: string): McgHotspot['type'] {
  const txt = `${name} ${cause}`.toLowerCase();
  if (txt.includes('under pass') || txt.includes('underpass')) return 'underpass';
  if (txt.includes('bandh') || txt.includes('drain') || txt.includes('booster') || txt.includes('creek')) return 'drain-node';
  if (txt.includes('sector') || txt.includes('block') || txt.includes('colony') || txt.includes('vihar') || txt.includes('enclave') || txt.includes('city')) {
    return 'residential-sector';
  }
  return 'road';
}

export const mcgHotspots: McgHotspot[] = RAW_MCG_ROWS.map((row, idx) => {
  const [
    srNo,
    wardNo,
    zone,
    callOpName,
    callOpPhone,
    name,
    landmark,
    lat,
    lng,
    rawGps,
    gpsStatus,
    gpsNote,
    causeAnalysis,
    jeName,
    jePhone,
    aeName,
    aePhone,
    asiName,
    asiPhone,
    supName,
    supPhone,
    criticality,
  ] = row;

  const id = `MCG-${String(idx + 1).padStart(3, '0')}`;
  const causeCategory = classifyCause(causeAnalysis);
  const owningAgency = classifyAgency(name, causeAnalysis);
  const type = classifyType(name, causeAnalysis);

  const baseLeverage =
    criticality === 'critical'
      ? 86 + (idx % 12)
      : criticality === 'high'
        ? 64 + (idx % 18)
        : 40 + (idx % 20);

  const popExposure =
    criticality === 'critical'
      ? 36000 + (wardNo % 6) * 4500
      : criticality === 'high'
        ? 22000 + (wardNo % 8) * 2800
        : 12000 + (wardNo % 10) * 1600;

  return {
    id,
    srNo,
    wardNo,
    zone,
    name,
    landmark,
    lat,
    lng,
    rawGps,
    gpsStatus,
    gpsNote: gpsNote || undefined,
    causeAnalysis,
    causeCategory,
    criticality,
    owningAgency,
    type,
    leverageScore: Math.min(98, baseLeverage),
    populationExposure: popExposure,
    upstreamOf: [],
    downstreamOf: [],
    contacts: {
      callOperator: { role: 'Call Operator', name: callOpName, phone: callOpPhone },
      sanitationSupervisor: { role: 'Sanitation Supervisor', name: supName, phone: supPhone },
      asi: { role: 'ASI', name: asiName, phone: asiPhone },
      je: { role: 'JE', name: jeName, phone: jePhone },
      ae: { role: 'AE', name: aeName, phone: aePhone },
    },
  };
});

// Wire key drainage cascade dependencies across Gurugram basins
const cascadePairs: Array<[string, string]> = [
  ['MCG-095', 'MCG-087'], // Chakkarpur Bandh -> Wazirabad Dhani Chowk
  ['MCG-096', 'MCG-087'], // Sheeba Apt Sec 28 -> Wazirabad Dhani Chowk
  ['MCG-087', 'MCG-077'], // Wazirabad -> Ghata Underpass
  ['MCG-006', 'MCG-004'], // Sarhol Mod Sec 18 -> Sunar Wali Gali Dundahera
  ['MCG-010', 'MCG-013'], // Sec 21 GMDA drain -> Sec 22B Community Centre
  ['MCG-044', 'MCG-101'], // Jubilee Park NH-8 -> Silokhera GMDA overflow
  ['MCG-112', 'MCG-121'], // Agrasen Chowk -> Auto Market Bhim Nagar
  ['MCG-129', 'MCG-133'], // Service Road Laxman Vihar -> Rajendra Park
];

cascadePairs.forEach(([upId, downId]) => {
  const up = mcgHotspots.find((h) => h.id === upId);
  const down = mcgHotspots.find((h) => h.id === downId);
  if (up && down) {
    up.upstreamOf.push(downId);
    down.downstreamOf.push(upId);
  }
});

export const initialSensors: Sensor[] = [
  { id: 'S-01', hotspot_id: 'MCG-004', type: 'drain_level', status: 'online', last_reading: 58, last_seen_at: new Date(Date.now() - 8 * 60000).toISOString(), battery_pct: 89 },
  { id: 'S-02', hotspot_id: 'MCG-077', type: 'cctv', status: 'online', last_reading: null, last_seen_at: new Date(Date.now() - 5 * 60000).toISOString(), battery_pct: 94 },
  { id: 'S-03', hotspot_id: 'MCG-087', type: 'drain_level', status: 'online', last_reading: 66, last_seen_at: new Date(Date.now() - 12 * 60000).toISOString(), battery_pct: 81 },
  { id: 'S-04', hotspot_id: 'MCG-096', type: 'cctv', status: 'offline', last_reading: null, last_seen_at: new Date(Date.now() - 4 * 3600000).toISOString(), battery_pct: 14 },
  { id: 'S-05', hotspot_id: 'MCG-101', type: 'drain_level', status: 'online', last_reading: 54, last_seen_at: new Date(Date.now() - 6 * 60000).toISOString(), battery_pct: 91 },
  { id: 'S-06', hotspot_id: 'MCG-110', type: 'rain_gauge', status: 'online', last_reading: 18, last_seen_at: new Date(Date.now() - 3 * 60000).toISOString(), battery_pct: 87 },
  { id: 'S-07', hotspot_id: 'MCG-112', type: 'drain_level', status: 'degraded', last_reading: 49, last_seen_at: new Date(Date.now() - 45 * 60000).toISOString(), battery_pct: 38 },
  { id: 'S-08', hotspot_id: 'MCG-121', type: 'drain_level', status: 'online', last_reading: 62, last_seen_at: new Date(Date.now() - 7 * 60000).toISOString(), battery_pct: 84 },
  { id: 'S-09', hotspot_id: 'MCG-152', type: 'cctv', status: 'online', last_reading: null, last_seen_at: new Date(Date.now() - 4 * 60000).toISOString(), battery_pct: 96 },
  { id: 'S-10', hotspot_id: 'MCG-027', type: 'rain_gauge', status: 'online', last_reading: 15, last_seen_at: new Date(Date.now() - 9 * 60000).toISOString(), battery_pct: 82 },
  { id: 'S-11', hotspot_id: 'MCG-105', type: 'drain_level', status: 'offline', last_reading: null, last_seen_at: new Date(Date.now() - 6 * 3600000).toISOString(), battery_pct: 9 },
  { id: 'S-12', hotspot_id: 'MCG-044', type: 'rain_gauge', status: 'online', last_reading: 16, last_seen_at: new Date(Date.now() - 10 * 60000).toISOString(), battery_pct: 88 },
];

export const crews: Crew[] = [
  { id: 'CRW-Z1', name: 'Zone 1 Quick Pump Unit', zone: 1, base_location: 'Sector 10 GMDA Bus Stand Yard', equipment: '2x 60HP Dewatering Pumps + Suction Tanker', available: true, travel_minutes_to: {} },
  { id: 'CRW-Z2', name: 'Zone 2 Super-Sucker Unit', zone: 2, base_location: 'Basai / Sector-9A Depot', equipment: 'Super-Sucker Jetting Machine + Silt Grab', available: true, travel_minutes_to: {} },
  { id: 'CRW-Z3', name: 'Zone 3 Rapid Response Team', zone: 3, base_location: 'Civil Lines / Sheetla Mata Yard', equipment: '2x Mobile Diesel Pumps + Portable GenSet', available: true, travel_minutes_to: {} },
  { id: 'CRW-Z4', name: 'Zone 4 Bandh & Underpass Unit', zone: 4, base_location: 'Wazirabad / Sector 56 Sub-Depot', equipment: 'High-Head Pump Trailer + Barricade Van', available: true, travel_minutes_to: {} },
];

export const CORRIDOR_PRESETS: CorridorPreset[] = [
  {
    id: 'nh48-udhyog',
    label: 'Udyog Vihar / Dundahera → Sector 18',
    from: 'Dundahera',
    to: 'Sector 18',
    keywords: ['dundahera', 'sarhol', 'sector 18', 'sector-18', 'lic', 'indian oil', '21', '22'],
    altRouteEn: 'Use NH-48 expressway main carriageway via Atlas Chowk flyover; avoid Sunar Wali Gali & Sector 18 service lanes.',
    altRouteHi: 'एटलस चौक फ्लाईओवर से NH-48 मुख्य मार्ग अपनाएं; सुनार वाली गली और सेक्टर 18 सर्विस रोड से बचें।',
  },
  {
    id: 'old-gurgaon-sheetla',
    label: 'Sheetla Mata Rd → Bhim Nagar / Bus Stand',
    from: 'Sheetla Mandir',
    to: 'GMDA Bus Stand',
    keywords: ['sheetla', 'bhim nagar', 'agrasen', 'jyoti hospital', 'bus stand', 'raj nagar', 'sector 5', 'laxman vihar'],
    altRouteEn: 'Bypass Sheetla Mandir Road & Auto Market via Sector 14 Mehrauli-Gurgaon parallel spine.',
    altRouteHi: 'शीतला मंदिर रोड और ऑटो मार्केट से बचकर सेक्टर 14 मुख्य मार्ग से जाएं।',
  },
  {
    id: 'golf-course-wazirabad',
    label: 'Chakkarpur / Sec 28 → Wazirabad / Ghata',
    from: 'Sector 28',
    to: 'Ghata Underpass',
    keywords: ['sector-28', 'sheeba', 'wazirabad', 'ghata', 'suncity', 'sec-54', 'ardee', '55/56', 'chakkarpur'],
    altRouteEn: 'Stay on Golf Course Road elevated flyovers; avoid Ghata Underpass & Wazirabad Dhani Chowk during GMDA backflow.',
    altRouteHi: 'गोल्फ कोर्स रोड एलिवेटेड फ्लाईओवर का उपयोग करें; घाटा अंडरपास और वजीराबाद ढाणी चौक से बचें।',
  },
  {
    id: 'sohna-badshahpur',
    label: 'Vatika Chowk → Sohna Rd / South City II',
    from: 'Vatika Chowk',
    to: 'South City',
    keywords: ['vatika', 'badshahpur', 'south city', 'rosewood', 'vipul', 'uppal', 'fazilpur', 'bhondsi', 'maruti kunj'],
    altRouteEn: 'Take Sohna Elevated Corridor overhead; avoid Badshahpur service lanes & Vatika Chowk under-ramp.',
    altRouteHi: 'सोहना एलिवेटेड कॉरिडोर से यात्रा करें; वाटिका चौक और बादशाहपुर सर्विस लेन से बचें।',
  },
];

export const calibrationData = {
  period: 'Monsoon Readiness Audit · 30-Day Rolling',
  alerts_issued: 48,
  alerts_verified_correct: 41,
  accuracy_pct: 85.4,
  weekly_data: [
    { week: 'Wk 1', alerts: 9, correct: 7 },
    { week: 'Wk 2', alerts: 13, correct: 11 },
    { week: 'Wk 3', alerts: 14, correct: 12 },
    { week: 'Wk 4', alerts: 12, correct: 11 },
  ],
};

export const sensorOfflineHistory = [
  { day: 'Mon', offline: 1 },
  { day: 'Tue', offline: 2 },
  { day: 'Wed', offline: 1 },
  { day: 'Thu', offline: 3 },
  { day: 'Fri', offline: 2 },
  { day: 'Sat', offline: 2 },
  { day: 'Sun', offline: 2 },
];
