export type Lang = 'en' | 'hi';

export const translations: Record<string, Record<Lang, string>> = {
  // App
  'app.name': { en: 'Gurgaon Flood Command', hi: 'गुरुग्राम बाढ़ नियंत्रण' },
  'app.tagline': { en: 'From reactive pumping to predictive drainage.', hi: 'प्रतिक्रियावादी पंपिंग से पूर्वानुमानित जल निकासी तक।' },
  'app.version': { en: 'v1.0.0', hi: 'v1.0.0' },

  // Roles
  'role.ward_engineer': { en: 'Ward Engineer', hi: 'वार्ड अभियंता' },
  'role.control_room': { en: 'Control Room', hi: 'नियंत्रण कक्ष' },
  'role.citizen': { en: 'Citizen', hi: 'नागरिक' },
  'role.executive': { en: 'Executive', hi: 'कार्यकारी' },

  // Nav
  'nav.risk_map': { en: 'Risk Map', hi: 'जोखिम मानचित्र' },
  'nav.action_list': { en: 'Action List', hi: 'कार्रवाई सूची' },
  'nav.sensor_health': { en: 'Sensor Health', hi: 'सेंसर स्थिति' },
  'nav.audit_log': { en: 'Audit Log', hi: 'ऑडिट लॉग' },
  'nav.executive': { en: 'Executive View', hi: 'कार्यकारी दृश्य' },
  'nav.public_home': { en: 'Home', hi: 'होम' },
  'nav.route_check': { en: 'Check Route', hi: 'मार्ग जाँचें' },
  'nav.alerts': { en: 'Get Alerts', hi: 'अलर्ट पाएं' },
  'nav.calibration': { en: 'Accuracy', hi: 'सटीकता' },
  'nav.report': { en: 'Report', hi: 'रिपोर्ट' },

  // Risk Map
  'risk_map.title': { en: "Today's Risk Map", hi: 'आज का जोखिम मानचित्र' },
  'risk_map.forecast': { en: 'Rain forecast', hi: 'वर्षा पूर्वानुमान' },
  'risk_map.in_6h': { en: 'in 6 hours', hi: '6 घंटे में' },
  'risk_map.high_risk': { en: 'high-risk', hi: 'उच्च जोखिम' },
  'risk_map.hotspots': { en: 'hotspots', hi: 'हॉटस्पॉट' },
  'risk_map.sensors_offline': { en: 'sensors offline', hi: 'सेंसर ऑफ़लाइन' },
  'risk_map.change_forecast': { en: 'Change forecast', hi: 'पूर्वानुमान बदलें' },
  'risk_map.rainfall_mm': { en: 'Rainfall (mm)', hi: 'वर्षा (मिमी)' },
  'risk_map.legend': { en: 'Legend', hi: 'लेजेंड' },
  'risk_map.filter_all': { en: 'All', hi: 'सभी' },
  'risk_map.filter_underpass': { en: 'Underpass', hi: 'अंडरपास' },
  'risk_map.filter_drain': { en: 'Drain node', hi: 'नाला नोड' },
  'risk_map.filter_road': { en: 'Road', hi: 'सड़क' },
  'risk_map.filter_residential': { en: 'Residential', hi: 'आवासीय' },

  // Risk tiers
  'risk.high': { en: 'HIGH', hi: 'उच्च' },
  'risk.medium': { en: 'MEDIUM', hi: 'मध्यम' },
  'risk.low': { en: 'LOW', hi: 'कम' },
  'risk.unknown': { en: 'UNKNOWN', hi: 'अज्ञात' },

  // Confidence
  'confidence.high': { en: 'High confidence', hi: 'उच्च विश्वसनीयता' },
  'confidence.medium': { en: 'Medium confidence', hi: 'मध्यम विश्वसनीयता' },
  'confidence.low': { en: 'Low confidence', hi: 'कम विश्वसनीयता' },

  // Action List
  'action_list.title': { en: 'Ranked Action List', hi: 'क्रमबद्ध कार्रवाई सूची' },
  'action_list.event_window': { en: 'Event window', hi: 'घटना अवधि' },
  'action_list.last_updated': { en: 'Last updated', hi: 'अंतिम अपडेट' },
  'action_list.print': { en: 'Print', hi: 'प्रिंट' },
  'action_list.export': { en: 'Export PDF', hi: 'PDF निर्यात' },
  'action_list.mark_done': { en: 'Mark Done', hi: 'पूर्ण चिह्नित' },
  'action_list.flag': { en: 'Flag Issue', hi: 'समस्या चिह्नित' },
  'action_list.override': { en: 'Override', hi: 'ओवरराइड' },
  'action_list.rerun': { en: 'Re-run Ranking', hi: 'रैंकिंग पुनः चलाएं' },
  'action_list.provisional': { en: 'Ranking provisional', hi: 'रैंकिंग अनंतिम' },
  'action_list.locked': { en: 'Ranking locked (T-24h)', hi: 'रैंकिंग लॉक (T-24h)' },
  'action_list.in_progress': { en: 'In Progress', hi: 'प्रगति में' },
  'action_list.done': { en: 'Done', hi: 'पूर्ण' },
  'action_list.flagged': { en: 'Flagged', hi: 'चिह्नित' },
  'action_list.pending': { en: 'Pending', hi: 'लंबित' },
  'action_list.view_in_map': { en: 'View on Map', hi: 'मानचित्र पर देखें' },

  // Action types
  'action.pre_position_pump': { en: 'Pre-position pump', hi: 'पंप पूर्व-स्थাপন' },
  'action.desilt_node': { en: 'Desilt drain node', hi: 'नाला सफाई' },
  'action.deploy_crew': { en: 'Deploy crew', hi: 'दल तैनात' },
  'action.issue_alert': { en: 'Issue alert', hi: 'अलर्ट जारी' },
  'action.inspect': { en: 'Inspect & notify agency', hi: 'निरीक्षण और एजेंसी सूचना' },

  // Sensor Health
  'sensor.title': { en: 'Sensor Health', hi: 'सेंसर स्थिति' },
  'sensor.network_uptime': { en: 'Network uptime', hi: 'नेटवर्क अपटाइम' },
  'sensor.offline': { en: 'Offline', hi: 'ऑफ़लाइन' },
  'sensor.online': { en: 'Online', hi: 'ऑनलाइन' },
  'sensor.degraded': { en: 'Degraded', hi: 'कमजोर' },
  'sensor.report_fault': { en: 'Report Fault', hi: 'खराबी रिपोर्ट' },
  'sensor.last_seen': { en: 'Last seen', hi: 'अंतिम देखा' },
  'sensor.battery': { en: 'Battery', hi: 'बैटरी' },
  'sensor.last_reading': { en: 'Last reading', hi: 'अंतिम रीडिंग' },

  // Audit Log
  'audit.title': { en: 'Audit Log', hi: 'ऑडिट लॉग' },
  'audit.banner': { en: 'Every override is logged and visible to senior officials.', hi: 'प्रत्येक ओवरराइड लॉग किया जाता है और वरिष्ठ अधिकारियों को दिखाई देता है।' },
  'audit.export': { en: 'Export PDF', hi: 'PDF निर्यात' },
  'audit.filter_all': { en: 'All Actions', hi: 'सभी कार्रवाइयाँ' },
  'audit.actor': { en: 'Actor', hi: 'अभिनेता' },
  'audit.action_type': { en: 'Action', hi: 'कार्रवाई' },
  'audit.reason': { en: 'Reason', hi: 'कारण' },
  'audit.rank_change': { en: 'Rank change', hi: 'रैंक परिवर्तन' },

  // Executive
  'exec.title': { en: 'Executive View', hi: 'कार्यकारी दृश्य' },
  'exec.total_hotspots': { en: 'Total Hotspots', hi: 'कुल हॉटस्पॉट' },
  'exec.population_exposed': { en: 'Population Exposed', hi: 'प्रभावित जनसंख्या' },
  'exec.overrides_season': { en: 'Overrides This Season', hi: 'इस सीज़न में ओवरराइड' },
  'exec.model_accuracy': { en: 'Model Accuracy', hi: 'मॉडल सटीकता' },
  'exec.last_30_days': { en: 'Last 30 days', hi: 'पिछले 30 दिन' },
  'exec.download_report': { en: 'Download Report', hi: 'रिपोर्ट डाउनलोड' },

  // Public
  'public.next_24h': { en: 'Next 24 hours', hi: 'अगले 24 घंटे' },
  'public.areas_high_risk': { en: 'areas at high risk', hi: 'क्षेत्र उच्च जोखिम में' },
  'public.check_route': { en: 'Check My Route', hi: 'मेरा मार्ग जाँचें' },
  'public.see_risk_map': { en: 'See Risk Map', hi: 'जोखिम मानचित्र देखें' },
  'public.get_sms_alerts': { en: 'Get SMS Alerts', hi: 'SMS अलर्ट पाएं' },
  'public.report_waterlogging': { en: 'Report Waterlogging', hi: 'जलभराव रिपोर्ट करें' },
  'public.from': { en: 'From', hi: 'से' },
  'public.to': { en: 'To', hi: 'तक' },
  'public.check': { en: 'Check', hi: 'जाँचें' },
  'public.high_risk_msg': { en: 'HIGH RISK', hi: 'उच्च जोखिम' },
  'public.avoid_if_possible': { en: 'Avoid if possible.', hi: 'यदि संभव हो तो बचें।' },
  'public.why': { en: 'Why?', hi: 'क्यों?' },
  'public.phone_number': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'public.sector': { en: 'Sector', hi: 'सेक्टर' },
  'public.channel_sms': { en: 'SMS', hi: 'SMS' },
  'public.channel_ivr': { en: 'IVR Call', hi: 'IVR कॉल' },
  'public.subscribe': { en: 'Subscribe', hi: 'सदस्यता लें' },
  'public.sample_message': { en: 'Sample alert message', hi: 'नमूना अलर्ट संदेश' },
  'public.water_here': { en: 'Water here now', hi: 'यहाँ पानी है' },
  'public.thank_you': { en: 'Thank you. This helps us check our predictions.', hi: 'धन्यवाद। यह हमें अपनी भविष्यवाणियों की जाँच करने में मदद करता है।' },
  'public.accuracy_title': { en: 'How Accurate Are We?', hi: 'हम कितने सटीक हैं?' },
  'public.accuracy_note': { en: 'We will sometimes be wrong. We publish our accuracy so you can judge each alert.', hi: 'हम कभी-कभी गलत हो सकते हैं। हम अपनी सटीकता प्रकाशित करते हैं ताकि आप प्रत्येक अलर्ट का मूल्यांकन कर सकें।' },
  'public.alerts_issued': { en: 'Alerts issued', hi: 'जारी अलर्ट' },
  'public.verified_correct': { en: 'Verified correct', hi: 'सत्यापित सही' },
  'public.accuracy': { en: 'Accuracy', hi: 'सटीकता' },

  // Override modal
  'override.title': { en: 'Override Ranking', hi: 'रैंकिंग ओवरराइड' },
  'override.new_rank': { en: 'New Rank', hi: 'नई रैंक' },
  'override.reason': { en: 'Reason (required)', hi: 'कारण (आवश्यक)' },
  'override.understand': { en: 'I understand this is logged', hi: 'मैं समझता/समझती हूँ कि यह लॉग किया जाएगा' },
  'override.confirm': { en: 'Confirm Override', hi: 'ओवरराइड पुष्टि करें' },
  'override.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'override.chip': { en: 'OVERRIDE', hi: 'ओवरराइड' },

  // Common
  'common.hotspots': { en: 'hotspots', hi: 'हॉटस्पॉट' },
  'common.crew': { en: 'Crew', hi: 'दल' },
  'common.deadline': { en: 'Deadline', hi: 'समय सीमा' },
  'common.rank': { en: 'Rank', hi: 'रैंक' },
  'common.status': { en: 'Status', hi: 'स्थिति' },
  'common.in': { en: 'in', hi: 'में' },
  'common.hours': { en: 'h', hi: 'घं' },
  'common.minutes': { en: 'm', hi: 'मि' },
  'common.ago': { en: 'ago', hi: 'पहले' },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] || key;
}
