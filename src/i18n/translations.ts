export type Lang = 'en' | 'hi';

export const translations: Record<string, Record<Lang, string>> = {
  'app.name': { en: 'Gurgaon Flood Help', hi: 'गुरुग्राम जलभराव सहायता' },
  'app.subtitle': { en: 'Gurugram Citizen & MCG Response Portal', hi: 'गुरुग्राम नागरिक एवं MCG सहायता पोर्टल' },

  // Roles
  'role.citizen': { en: 'Citizen Portal', hi: 'नागरिक पोर्टल' },
  'role.ward_engineer': { en: 'Ward Engineer', hi: 'वार्ड अभियंता' },
  'role.command_authority': { en: 'Command Authority', hi: 'कमांड प्राधिकरण' },

  // Theme
  'theme.dark': { en: 'Dark', hi: 'डार्क' },
  'theme.light': { en: 'Classic White', hi: 'सफेद थीम' },

  // Views (Humanized)
  'view.map': { en: 'Flood Map', hi: 'बाढ़ मानचित्र' },
  'view.route': { en: 'Safe Route', hi: 'सुरक्षित मार्ग' },
  'view.report': { en: 'Report Flood', hi: 'रिपोर्ट करें' },
  'view.alerts': { en: 'Rain Alerts', hi: 'अलर्ट पाएं' },
  'view.accuracy': { en: 'Accuracy', hi: 'सटीकता' },
  'view.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'view.dispatch': { en: 'Action Queue', hi: 'कार्रवाई सूची' },
  'view.sensors': { en: 'Drain Sensors', hi: 'नाला सेंसर' },
  'view.audit': { en: 'Action History', hi: 'कार्रवाई इतिहास' },
  'view.executive': { en: 'Monsoon Brief', hi: 'मानसून सारांश' },

  // Settings
  'settings.title': { en: 'Settings', hi: 'सेटिंग्स' },
  'settings.subtitle': { en: 'Customize display appearance and language preferences.', hi: 'थीम और भाषा की प्राथमिकताएँ बदलें।' },
  'settings.appearance': { en: 'Appearance', hi: 'दिखावट (थीम)' },
  'settings.language': { en: 'Language', hi: 'भाषा' },

  // Weather & Rain Control
  'weather.live_gurugram': { en: 'Gurugram Weather', hi: 'गुरुग्राम मौसम' },
  'weather.sync_live': { en: 'Refresh', hi: 'रिफ्रेश' },
  'weather.storm_sim': { en: 'Expected Rain (6 hrs)', hi: 'अनुमानित वर्षा (6 घंटे)' },
  'weather.pump_mitigation': { en: 'With Pumps Deployed', hi: 'पंप तैनाती प्रभाव' },

  // Risk Tiers
  'risk.critical': { en: 'Severe Flooding', hi: 'गंभीर जलभराव' },
  'risk.high': { en: 'High Waterlogging', hi: 'अधिक जलभराव' },
  'risk.medium': { en: 'Moderate Ponding', hi: 'मध्यम जलभराव' },
  'risk.low': { en: 'Passable / Clear', hi: 'सामान्य / सुरक्षित' },

  // Citizen Actions
  'citizen.safe_corridors': { en: 'Check If Your Route Is Safe', hi: 'जाँचें कि आपका रास्ता सुरक्षित है' },
  'citizen.report_flood': { en: 'Report Street Waterlogging', hi: 'सड़क पर जलभराव की रिपोर्ट करें' },
  'citizen.subscribe_alerts': { en: 'Get Free Ward Rain Alerts', hi: 'अपने वार्ड के बारिश अलर्ट पाएं' },
  'citizen.official_helpline': { en: 'MCG 24x7 Flood Helpline', hi: 'MCG 24x7 हेल्पलाइन' },

  // Dossier & Escalation
  'dossier.cause_analysis': { en: 'Why Water Collects Here (MCG Notes)', hi: 'यहाँ पानी क्यों भरता है (MCG विवरण)' },
  'dossier.escalation_chain': { en: 'Responsible Ward Officers (Tap to Contact)', hi: 'जिम्मेदार वार्ड अधिकारी (सीधे संपर्क करें)' },
  'dossier.call': { en: 'Call', hi: 'कॉल' },
  'dossier.whatsapp': { en: 'WhatsApp', hi: 'व्हाट्सएप' },
  'dossier.escalate_sla': { en: 'Escalate to Next Officer', hi: 'अगले अधिकारी को भेजें' },
  'dossier.gps_verified': { en: 'Location Verified', hi: 'स्थान सत्यापित' },
  'dossier.gps_corrected': { en: 'Pin Adjusted to Exact Street', hi: 'सटीक सड़क पर सुधारित' },

  // Command Actions
  'cmd.generate_briefing': { en: 'Write Monsoon Situation Brief', hi: 'मानसून स्थिति सारांश बनाएं' },
  'cmd.mark_done': { en: 'Mark Cleared', hi: 'साफ हो गया' },
  'cmd.deploy_pump': { en: 'Send Pump Team', hi: 'पंप टीम भेजें' },
  'cmd.override_rank': { en: 'Change Priority', hi: 'प्राथमिकता बदलें' },
  'cmd.flag_issue': { en: 'Report Blocker', hi: 'समस्या दर्ज करें' },
  'cmd.audit_banner': { en: 'Every pump dispatch, officer escalation, and priority change is recorded for accountability.', hi: 'सभी पंप तैनाती, अधिकारी एस्केलेशन और प्राथमिकता बदलाव पारदर्शिता के लिए दर्ज किए जाते हैं।' },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}
