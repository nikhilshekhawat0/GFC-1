import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots } from '../data/mockData';
import { Route, Bell, Map, Camera, MapPin, Clock, ChevronRight, Shield, Droplets, Eye } from 'lucide-react';

function getRiskColor(riskPct: number): string {
  if (riskPct >= 70) return 'bg-risk-high';
  if (riskPct >= 50) return 'bg-risk-medium';
  if (riskPct >= 30) return 'bg-risk-low';
  return 'bg-risk-unknown';
}

function getRiskTier(riskPct: number): string {
  if (riskPct >= 70) return 'high';
  if (riskPct >= 50) return 'medium';
  if (riskPct >= 30) return 'low';
  return 'unknown';
}

export function CitizenHome() {
  const { lang, getRiskScores, setCurrentScreen, citizenSector, setCitizenSector, rainfallMm } = useStore();
  const riskScores = getRiskScores();
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const mediumRisk = riskScores.filter(r => r.risk_pct >= 50 && r.risk_pct < 70).length;

  // Get alerts for selected sector
  const sectorAlerts = citizenSector
    ? riskScores.filter(r => {
        const h = hotspots.find(h => h.id === r.hotspot_id);
        return h?.ward === citizenSector && r.risk_pct >= 50;
      }).slice(0, 3)
    : [];

  const quickActions = [
    { icon: Route, label: t('public.check_route', lang), desc: lang === 'en' ? 'See risk on roads you use' : 'अपनी सड़कों पर जोखिम देखें', route: 'public-route-check' as const, color: 'text-primary bg-primary/10' },
    { icon: Bell, label: t('public.get_sms_alerts', lang), desc: lang === 'en' ? 'SMS or IVR for your sector' : 'आपके सेक्टर के लिए SMS या IVR', route: 'public-alerts' as const, color: 'text-amber-600 bg-amber-50' },
    { icon: Map, label: t('public.see_risk_map', lang), desc: lang === 'en' ? 'All hotspots at a glance' : 'सभी हॉटस्पॉट एक नज़र में', route: 'risk-map' as const, color: 'text-risk-low bg-green-50' },
    { icon: Camera, label: t('public.report_waterlogging', lang), desc: lang === 'en' ? 'Help us check predictions' : 'हमारी भविष्यवाणियों की जाँच में मदद करें', route: 'public-report' as const, color: 'text-risk-high bg-red-50' },
  ];

  const wards = [...new Set(hotspots.map(h => h.ward))];

  return (
    <div className="h-full overflow-auto bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B3D6B 0%, #1A5C9E 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-white/30" />
          <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full border-2 border-white/20" />
        </div>
        <div className="relative px-4 py-8 sm:py-12 max-w-lg mx-auto">
          <p className="text-white/70 text-sm mb-1">{t('public.next_24h', lang)}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {lang === 'en' ? 'Next 24 hours in Gurgaon' : 'गुरुग्राम में अगले 24 घंटे'}
          </h1>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl font-bold text-white">{highRisk}</span>
            <div>
              <p className="text-white font-semibold">{t('public.areas_high_risk', lang)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-risk-high" />
                <span className="text-white/70 text-xs">{highRisk} {t('risk.high', lang)}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-risk-medium ml-1" />
                <span className="text-white/70 text-xs">{mediumRisk} {t('risk.medium', lang)}</span>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-xs">
            {lang === 'en'
              ? `Based on IMD forecast for ${rainfallMm}mm rain in 6 hours. Last updated 12 minutes ago.`
              : `${rainfallMm}मिमी वर्षा के IMD पूर्वानुमान के आधार पर 6 घंटे में। 12 मिनट पहले अपडेट किया गया।`
            }
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentScreen('public-route-check')}
              className="flex-1 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Route size={16} />
              {t('public.check_route', lang)}
            </button>
            <button
              onClick={() => setCurrentScreen('risk-map')}
              className="flex-1 py-3 border-2 border-white/40 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              {t('public.see_risk_map', lang)}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => setCurrentScreen(action.route)}
                className="bg-white rounded-2xl border border-border p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-text-primary text-sm">{action.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{action.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Alerts for your area */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Bell size={16} className="text-amber-600" />
            {lang === 'en' ? 'Alerts for your area' : 'आपके क्षेत्र के लिए अलर्ट'}
          </h3>

          {!citizenSector ? (
            <div className="text-center py-4">
              <p className="text-sm text-text-secondary mb-3">
                {lang === 'en' ? 'No sector set. Pick your sector to see local alerts.' : 'कोई सेक्टर सेट नहीं। स्थानीय अलर्ट देखने के लिए अपना सेक्टर चुनें।'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {wards.slice(0, 6).map(ward => (
                  <button
                    key={ward}
                    onClick={() => setCitizenSector(ward)}
                    className="px-3 py-1.5 text-xs font-medium bg-background hover:bg-primary hover:text-white border border-border rounded-full transition-colors"
                  >
                    {ward}
                  </button>
                ))}
              </div>
            </div>
          ) : sectorAlerts.length === 0 ? (
            <div className="text-center py-4">
              <Shield size={24} className="mx-auto text-risk-low mb-2" />
              <p className="text-sm text-text-secondary">
                {lang === 'en' ? `No active alerts for ${citizenSector}.` : `${citizenSector} के लिए कोई सक्रिय अलर्ट नहीं।`}
              </p>
              <button onClick={() => setCitizenSector('')} className="text-xs text-primary mt-2 font-medium">
                {lang === 'en' ? 'Change sector' : 'सेक्टर बदलें'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sectorAlerts.map(alert => {
                const hotspot = hotspots.find(h => h.id === alert.hotspot_id)!;
                const tier = getRiskTier(alert.risk_pct);
                return (
                  <div key={alert.hotspot_id} className="flex items-center gap-3 p-3 rounded-xl bg-background">
                    <div className={`w-2 h-10 rounded-full ${getRiskColor(alert.risk_pct)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tier === 'high' ? 'bg-risk-high text-white' : 'bg-risk-medium text-white'
                        }`}>
                          {tier === 'high' ? 'ACTION' : 'ADVISORY'}
                        </span>
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Clock size={10} /> {alert.forecast_window}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mt-1 truncate">{hotspot.name}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      alert.confidence === 'high' ? 'border-green-300 text-green-700 bg-green-50' :
                      alert.confidence === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                      'border-red-300 text-red-700 bg-red-50'
                    }`}>
                      {t(`confidence.${alert.confidence}`, lang)}
                    </span>
                  </div>
                );
              })}
              <button onClick={() => setCitizenSector('')} className="text-xs text-primary font-medium mt-2">
                {lang === 'en' ? 'Change sector' : 'सेक्टर बदलें'}
              </button>
            </div>
          )}
        </div>

        {/* How this works */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-text-primary mb-3">
            {lang === 'en' ? 'How this works' : 'यह कैसे काम करता है'}
          </h3>
          <div className="space-y-3">
            {[
              { icon: Droplets, text: lang === 'en' ? 'We read the IMD rainfall forecast and drain sensors.' : 'हम IMD वर्षा पूर्वानुमान और नाले के सेंसर पढ़ते हैं।' },
              { icon: MapPin, text: lang === 'en' ? 'We rank which hotspots are most likely to flood in the next 24 hours.' : 'हम रैंक करते हैं कि अगले 24 घंटों में कौन से हॉटस्पॉट में बाढ़ आने की सबसे अधिक संभावना है।' },
              { icon: Shield, text: lang === 'en' ? 'We tell MCG crews what to do first, and we tell you what to avoid.' : 'हम MCG दलों को बताते हैं कि पहले क्या करना है, और हम आपको बताते हैं कि क्या बचना है।' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary pt-1">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-text-secondary">
            {lang === 'en'
              ? 'A decision-support tool. Always follow local authority instructions during flooding.'
              : 'एक निर्णय समर्थन उपकरण। बाढ़ के दौरान हमेशा स्थानीय अधिकारियों के निर्देशों का पालन करें।'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
