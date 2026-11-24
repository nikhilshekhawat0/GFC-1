import { useEffect } from 'react';
import { Shield, FileText, X } from 'lucide-react';
import type { Lang } from '../i18n/translations';

export type LegalDocTab = 'privacy' | 'terms';

interface LegalModalProps {
  open: boolean;
  initialTab: LegalDocTab;
  lang: Lang;
  onChangeTab: (tab: LegalDocTab) => void;
  onClose: () => void;
}

const LEGAL_CONTENT = {
  en: {
    modalTitle: 'Legal & Privacy Information',
    privacyTab: 'Privacy Policy',
    termsTab: 'Terms & Conditions',
    close: 'Close',
    lastUpdated: 'Effective for Monsoon 2025–26 Operations · Gurugram',
    privacySections: [
      {
        heading: '1. Public Access Without Login',
        body: 'You can inspect the live Gurugram flood map, drainage status, ward hotspot notes, and safe route checks without signing in or sharing any personal details.',
      },
      {
        heading: '2. Information You Choose to Provide',
        body: 'When you sign in to register a street waterlogging report or ward rain alert, we collect your 10-digit phone number, optional name, and quick Gurugram street/ward address. For Emergency SOS accident alerts, callback phone and incident details are optional and logged solely to assist response.',
      },
      {
        heading: '3. Real-Time GPS & Location Data',
        body: 'Live GPS coordinates are read from your device only when you click Fetch My Location, view live map tracking, or attach GPS to an SOS/flood report. We never track background location when the portal is closed or sell location history.',
      },
      {
        heading: '4. Municipal Sharing & Data Retention',
        body: 'Submitted waterlogging reports and ward contact details are used strictly to route dewatering pumps, alert MCG / GMDA / NHAI ward engineers, and maintain public accountability logs. You may sign out at any time to clear active session access.',
      },
    ],
    termsSections: [
      {
        heading: '1. Civic Guidance & Field Conditions',
        body: 'Flood risk tiers, water depth indicators, and safe-route recommendations are informational civic tools based on MCG hotspot records, rainfall estimates, and citizen updates. Always follow on-ground traffic police advisories, barricades, and weather warnings during heavy rain.',
      },
      {
        heading: '2. Emergency SOS & Life-Safety Disclaimer',
        body: 'The Settings Emergency SOS feature helps capture GPS coordinates and accident context rapidly, but does not replace direct emergency calling. For injuries, submerged vehicles, or exposed power wires, dial 112 (Emergency), 108 (Ambulance), or 100 (Police) immediately.',
      },
      {
        heading: '3. Accurate & Responsible Reporting',
        body: 'Citizens agree to submit truthful, non-misleading Gurugram waterlogging and hazard reports. Repeated false or spam entries may be dismissed by municipal command officers to protect emergency dispatch bandwidth.',
      },
      {
        heading: '4. Municipal Staff Accountability',
        body: 'Authority login credentials (MCG, GMDA, NHAI) are strictly for authorized engineers and command officers. All pump dispatches, clearance confirmations, and SLA escalations are recorded in the system audit trail.',
      },
    ],
  },
  hi: {
    modalTitle: 'गोपनीयता एवं नियम व शर्तें',
    privacyTab: 'गोपनीयता नीति',
    termsTab: 'नियम व शर्तें',
    close: 'बंद करें',
    lastUpdated: 'मानसून 2025–26 संचालन के लिए प्रभावी · गुरुग्राम',
    privacySections: [
      {
        heading: '1. बिना लॉगिन सार्वजनिक मानचित्र पहुंच',
        body: 'आप बिना साइन इन किए या कोई व्यक्तिगत जानकारी साझा किए लाइव गुरुग्राम जलभराव मानचित्र, नाला स्थिति, वार्ड हॉटस्पॉट विवरण और सुरक्षित मार्ग जांच देख सकते हैं।',
      },
      {
        heading: '2. आपके द्वारा दी जाने वाली जानकारी',
        body: 'जब आप सड़क जलभराव रिपोर्ट दर्ज करने या वार्ड वर्षा अलर्ट सक्रिय करने के लिए साइन इन करते हैं, तो हम आपका 10-अंकीय फ़ोन नंबर, वैकल्पिक नाम और गुरुग्राम पता/वार्ड दर्ज करते हैं। आपातकालीन SOS में कॉलबैक नंबर वैकल्पिक है और केवल सहायता हेतु उपयोग होता है।',
      },
      {
        heading: '3. रियल-टाइम GPS और लोकेशन डेटा',
        body: 'आपके डिवाइस की लाइव GPS लोकेशन केवल तभी पढ़ी जाती है जब आप लाइव लोकेशन चुनते हैं या SOS/रिपोर्ट में GPS जोड़ते हैं। पोर्टल बंद होने पर कोई बैकग्राउंड ट्रैकिंग नहीं की जाती और न ही लोकेशन डेटा बेचा जाता है।',
      },
      {
        heading: '4. नगर निगम समन्वय और डेटा नियंत्रण',
        body: 'दर्ज की गई रिपोर्ट और संपर्क विवरण का उपयोग केवल पंप तैनाती, MCG / GMDA / NHAI वार्ड अभियंताओं को सूचित करने और पारदर्शिता लॉग बनाए रखने के लिए किया जाता है। आप कभी भी साइन आउट कर सकते हैं।',
      },
    ],
    termsSections: [
      {
        heading: '1. नागरिक मार्गदर्शन और जमीनी स्थिति',
        body: 'जलभराव स्तर और सुरक्षित मार्ग सुझाव MCG हॉटस्पॉट डेटा, वर्षा अनुमान और नागरिक अपडेट पर आधारित सूचनात्मक उपकरण हैं। भारी बारिश के दौरान हमेशा जमीनी ट्रैफिक पुलिस निर्देशों और बैरिकेड्स का पालन करें।',
      },
      {
        heading: '2. आपातकालीन SOS सूचना',
        body: 'सेटिंग्स में उपलब्ध आपातकालीन SOS फॉर्म तेजी से GPS और दुर्घटना विवरण दर्ज करने में मदद करता है, लेकिन यह सीधे हेल्पलाइन कॉल का विकल्प नहीं है। किसी के घायल होने, वाहन डूबने या बिजली के तार की स्थिति में तुरंत 112, 108 (एम्बुलेंस) या 100 (पुलिस) पर कॉल करें।',
      },
      {
        heading: '3. सटीक और जिम्मेदार रिपोर्टिंग',
        body: 'नागरिक केवल वास्तविक और सही गुरुग्राम जलभराव या दुर्घटना रिपोर्ट दर्ज करने के लिए सहमत हैं। गलत या भ्रामक प्रविष्टियों को कमांड अधिकारियों द्वारा अस्वीकृत किया जा सकता है।',
      },
      {
        heading: '4. अधिकारी पोर्टल और जवाबदेही',
        body: 'अधिकारी लॉगिन (MCG, GMDA, NHAI) केवल अधिकृत अभियंताओं और कमांड अधिकारियों के लिए है। प्रत्येक पंप तैनाती, सफाई पुष्टि और SLA एस्केलेशन ऑडिट लॉग में दर्ज होता है।',
      },
    ],
  },
} as const;

export function LegalModal({ open, initialTab, lang, onChangeTab, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const copy = LEGAL_CONTENT[lang];
  const sections = initialTab === 'privacy' ? copy.privacySections : copy.termsSections;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111317]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={copy.modalTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#16191F] border border-[#EAECEF] dark:border-[#242832] shadow-2xl overflow-hidden text-[#111317] dark:text-[#F4F4F6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EAECEF] dark:border-[#242832] flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-base font-bold">{copy.modalTitle}</h2>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">{copy.lastUpdated}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="p-1.5 rounded-full text-[#6B7280] hover:text-[#111317] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-[#EAECEF] dark:border-[#242832] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onChangeTab('privacy')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              initialTab === 'privacy'
                ? 'bg-[#0D2621] text-white dark:bg-[#F4F4F6] dark:text-[#111317]'
                : 'bg-[#F3F4F6] dark:bg-[#23262F] text-[#6B7280] dark:text-slate-300 hover:bg-[#E5E7EB] dark:hover:bg-[#2E323D]'
            }`}
          >
            <Shield size={13} />
            <span>{copy.privacyTab}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('terms')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              initialTab === 'terms'
                ? 'bg-[#0D2621] text-white dark:bg-[#F4F4F6] dark:text-[#111317]'
                : 'bg-[#F3F4F6] dark:bg-[#23262F] text-[#6B7280] dark:text-slate-300 hover:bg-[#E5E7EB] dark:hover:bg-[#2E323D]'
            }`}
          >
            <FileText size={13} />
            <span>{copy.termsTab}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {sections.map((section) => (
            <div key={section.heading} className="space-y-1">
              <h3 className="text-xs font-bold text-[#111317] dark:text-[#F4F4F6]">{section.heading}</h3>
              <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#EAECEF] dark:border-[#242832] flex justify-end shrink-0 bg-[#FAFAFB] dark:bg-[#121418]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold transition-colors"
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
