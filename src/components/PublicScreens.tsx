import { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { hotspots } from '../data/mockData';
import { MapPin, Route, Bell, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Phone, MessageSquare, PhoneCall } from 'lucide-react';

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

// PUBLIC ROUTE CHECK
export function PublicRouteCheck() {
  const { lang, getRiskScores } = useStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<typeof hotspots | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const riskScores = getRiskScores();
  const suggestions = hotspots.map(h => h.name);

  const handleCheck = () => {
    if (!from && !to) return;
    // Simulate route check - return hotspots that would be on a route
    const matched = hotspots.filter(h =>
      h.name.toLowerCase().includes(from.toLowerCase()) ||
      h.name.toLowerCase().includes(to.toLowerCase()) ||
      Math.random() > 0.5
    ).slice(0, 4);
    setResults(matched.length > 0 ? matched : hotspots.slice(0, 3));
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('public.check_route', lang)}</h2>

        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{t('public.from', lang)}</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                list="hotspot-suggestions"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="e.g. Sector 56"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{t('public.to', lang)}</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                list="hotspot-suggestions"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="e.g. Subhash Chowk"
              />
            </div>
            <datalist id="hotspot-suggestions">
              {suggestions.map(s => <option key={s} value={s} />)}
            </datalist>
            <button
              onClick={handleCheck}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors"
            >
              {t('public.check', lang)}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-3">
            {results.map(hotspot => {
              const score = riskScores.find(r => r.hotspot_id === hotspot.id);
              if (!score) return null;
              const tier = getRiskTier(score.risk_pct);

              return (
                <div key={hotspot.id} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">{hotspot.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{hotspot.ward}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRiskColor(score.risk_pct)}`}>
                      {t(`risk.${tier}`, lang)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-text-primary">
                    {t(`risk.${tier}`, lang)} — {score.forecast_window}. {t('public.avoid_if_possible', lang)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {t(`confidence.${score.confidence}`, lang)}
                  </p>

                  <button
                    onClick={() => setExpandedId(expandedId === hotspot.id ? null : hotspot.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary font-medium"
                  >
                    {t('public.why', lang)}
                    {expandedId === hotspot.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {expandedId === hotspot.id && (
                    <div className="mt-2 p-3 bg-background rounded-lg">
                      <p className="text-xs text-text-secondary font-medium mb-1">Inputs used:</p>
                      <ul className="text-xs text-text-secondary space-y-1">
                        {score.inputs_used.map((input, i) => (
                          <li key={i}>• {input}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// PUBLIC ALERTS
export function PublicAlerts() {
  const { lang, addToast } = useStore();
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState('');
  const [channel, setChannel] = useState<'sms' | 'ivr'>('sms');

  const handleSubmit = () => {
    if (!phone) return;
    addToast(lang === 'en' ? 'Subscribed to alerts!' : 'अलर्ट की सदस्यता ली!', 'success');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('public.get_sms_alerts', lang)}</h2>

        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{t('public.phone_number', lang)}</label>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-text-secondary" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{t('public.sector', lang)}</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <option value="">Select sector</option>
                {hotspots.map(h => <option key={h.id} value={h.ward}>{h.ward} — {h.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Channel</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="channel" checked={channel === 'sms'} onChange={() => setChannel('sms')} className="accent-primary" />
                  <MessageSquare size={16} />
                  <span className="text-sm">{t('public.channel_sms', lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="channel" checked={channel === 'ivr'} onChange={() => setChannel('ivr')} className="accent-primary" />
                  <PhoneCall size={16} />
                  <span className="text-sm">{t('public.channel_ivr', lang)}</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors"
            >
              {t('public.subscribe', lang)}
            </button>
          </div>
        </div>

        {/* Sample Message */}
        <div className="bg-background rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">{t('public.sample_message', lang)}</h3>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-border">
              <p className="text-xs text-text-secondary mb-1">English:</p>
              <p className="text-sm text-text-primary">⚠️ GFC Alert: HIGH RISK of waterlogging at Subhash Chowk Underpass tomorrow 6am–12pm. Avoid if possible. Confidence: High.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-border">
              <p className="text-xs text-text-secondary mb-1">हिंदी:</p>
              <p className="text-sm text-text-primary">⚠️ GFC अलर्ट: कल सुबह 6 बजे से दोपहर 12 बजे तक सुभाष चौक अंडरपास में जलभराव का उच्च जोखिम। यदि संभव हो तो बचें। विश्वसनीयता: उच्च।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PUBLIC REPORT
export function PublicReport() {
  const { lang, addWaterlogReport } = useStore();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    addWaterlogReport({
      lat: 28.4595 + (Math.random() - 0.5) * 0.1,
      lng: 77.0266 + (Math.random() - 0.5) * 0.1,
      description: 'User reported waterlogging',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={48} className="mx-auto text-risk-low mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">{t('public.thank_you', lang)}</h2>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
          >
            {lang === 'en' ? 'Report another' : 'एक और रिपोर्ट'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('public.report_waterlogging', lang)}</h2>

        <div className="bg-white rounded-2xl border border-border p-6 text-center">
          <AlertTriangle size={48} className="mx-auto text-risk-high mb-4" />
          <p className="text-sm text-text-secondary mb-6">
            {lang === 'en'
              ? 'Tap the button below to report waterlogging at your current location. Your report helps us verify our predictions.'
              : 'अपने वर्तमान स्थान पर जलभराव की रिपोर्ट करने के लिए नीचे बटन दबाएं। आपकी रिपोर्ट हमें अपनी भविष्यवाणियों की पुष्टि करने में मदद करती है।'
            }
          </p>
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-risk-high text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            {t('public.water_here', lang)}
          </button>
          <p className="text-xs text-text-secondary mt-3">
            {lang === 'en' ? 'Location will be auto-captured from your device.' : 'स्थान आपके डिवाइस से स्वचालित रूप से कैप्चर किया जाएगा।'}
          </p>
        </div>
      </div>
    </div>
  );
}
