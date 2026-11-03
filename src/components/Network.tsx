import { useStore } from '../store/useStore';
import { Wifi, WifiOff, Clock, Database, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface AgencyFeed {
  agency: string;
  drains: number;
  covered: number;
  feed: 'live' | 'stale' | 'none';
  last: string;
  sensors: number;
  modelImpact: string;
}

const mockAgencyData: AgencyFeed[] = [
  {
    agency: 'MCG',
    drains: 41,
    covered: 24,
    feed: 'live',
    last: '12 min ago',
    sensors: 14,
    modelImpact: 'All MCG-owned drains monitored — predictions for urban areas are high confidence.'
  },
  {
    agency: 'GMDA',
    drains: 33,
    covered: 8,
    feed: 'stale',
    last: '26h ago',
    sensors: 6,
    modelImpact: 'GMDA data feed is stale — 6 register hotspots affected, including Wazirabad Chowk and Sector 28.'
  },
  {
    agency: 'HSVP',
    drains: 18,
    covered: 1,
    feed: 'none',
    last: '—',
    sensors: 0,
    modelImpact: 'No HSVP data feed — 1 register hotspot (Village Ghata Underpass) has low confidence predictions.'
  },
  {
    agency: 'Irrigation',
    drains: 22,
    covered: 0,
    feed: 'none',
    last: '—',
    sensors: 0,
    modelImpact: 'All Irrigation-owned natural drains unmonitored — outfall predictions are low confidence.'
  },
  {
    agency: 'NHAI',
    drains: 9,
    covered: 4,
    feed: 'live',
    last: '40 min ago',
    sensors: 8,
    modelImpact: 'NHAI underpasses monitored — high confidence for critical points.'
  },
  {
    agency: 'PWD',
    drains: 14,
    covered: 1,
    feed: 'stale',
    last: '9h ago',
    sensors: 3,
    modelImpact: 'PWD data feed is stale — limited coverage for road drainage.'
  },
  {
    agency: 'PHED',
    drains: 6,
    covered: 0,
    feed: 'none',
    last: '—',
    sensors: 0,
    modelImpact: 'No PHED data feed — limited coverage for water supply infrastructure areas.'
  }
];

function getFeedColor(feed: 'live' | 'stale' | 'none'): string {
  switch (feed) {
    case 'live': return 'bg-green-100 text-green-700 border-green-200';
    case 'stale': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'none': return 'bg-red-100 text-red-700 border-red-200';
  }
}

function getFeedIcon(feed: 'live' | 'stale' | 'none') {
  switch (feed) {
    case 'live': return <Wifi size={14} className="text-green-600" />;
    case 'stale': return <Clock size={14} className="text-amber-600" />;
    case 'none': return <WifiOff size={14} className="text-red-600" />;
  }
}

function getFeedLabel(feed: 'live' | 'stale' | 'none', lang: 'en' | 'hi'): string {
  switch (feed) {
    case 'live': return lang === 'en' ? 'Live' : 'लाइव';
    case 'stale': return lang === 'en' ? 'Stale' : 'पुराना';
    case 'none': return lang === 'en' ? 'No feed' : 'कोई फ़ीड नहीं';
  }
}

export function Network() {
  const { lang, addToast, addAuditEntry } = useStore();
  const [copiedAgency, setCopiedAgency] = useState<string | null>(null);

  const liveCount = mockAgencyData.filter(a => a.feed === 'live').length;
  const staleCount = mockAgencyData.filter(a => a.feed === 'stale').length;
  const noneCount = mockAgencyData.filter(a => a.feed === 'none').length;

  // Determine overall confidence based on lowest-confidence agency
  const overallConfidence = noneCount > 0 ? 'low' : staleCount > 0 ? 'medium' : 'high';
  const confidenceColor = overallConfidence === 'high' ? 'bg-green-100 text-green-700 border-green-200' :
                          overallConfidence === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-700 border-red-200';

  const handleRequestData = (agency: AgencyFeed) => {
    const subject = lang === 'en'
      ? `Data Feed Request: ${agency.agency} Drain Monitoring`
      : `डेटा फ़ीड अनुरोध: ${agency.agency} नाला निगरानी`;

    const body = lang === 'en'
      ? `Subject: Urgent Request for Real-Time Drain Monitoring Data Feed

Dear Nodal Officer, ${agency.agency},

This is a formal request from the Gurugram District Disaster Management Authority (DDMA) under the direction of the District Magistrate.

As per the DDMA directive dated 15 October 2026, all agencies owning drainage infrastructure in Gurugram are required to provide real-time data feeds to the Gurgaon Flood Command (GFC) system for integrated flood prediction and response.

Current Status:
- Your agency owns ${agency.drains} drains
- ${agency.covered} hotspots are currently covered
- ${agency.sensors} sensors are deployed
- Data feed status: ${getFeedLabel(agency.feed, 'en')}

Required Data Schema:
1. Drain water level (cm) - updated every 15 minutes
2. Flow rate (cumecs) - updated every 15 minutes
3. Sensor status (online/offline/degraded) - updated every 5 minutes
4. GPS coordinates of each sensor

Action Required:
Please establish a real-time data feed to the GFC system within 7 days. The technical team can be reached at gfc-tech@mcg.gov.in for API integration support.

This data is critical for accurate flood predictions and timely deployment of response resources. Non-compliance may result in reduced model confidence for your agency's areas, affecting public safety.

Regards,
DDMA Gurugram
Contact: ddma@gurugram.gov.in | +91-124-XXXXXXX`
      : `विषय: वास्तविक समय नाला निगरानी डेटा फ़ीड के लिए तत्काल अनुरोध

महोदय, नोडल अधिकारी, ${agency.agency},

यह जिला आपदा प्रबंधन प्राधिकरण (DDMA) गुरुग्राम की ओर से जिला मजिस्ट्रेट के निर्देश के तहत एक औपचारिक अनुरोध है।

15 अक्टूबर 2026 के DDMA निर्देश के अनुसार, गुरुग्राम में जल निकासी बुनियादी ढांचे के मालिक सभी एजेंसियों को एकीकृत बाढ़ पूर्वानुमान और प्रतिक्रिया के लिए गुरुग्राम बाढ़ कमांड (GFC) सिस्टम को वास्तविक समय डेटा फ़ीड प्रदान करने की आवश्यकता है।

वर्तमान स्थिति:
- आपकी एजेंसी के पास ${agency.drains} नाले हैं
- ${agency.covered} हॉटस्पॉट वर्तमान में कवर किए गए हैं
- ${agency.sensors} सेंसर तैनात हैं
- डेटा फ़ीड स्थिति: ${getFeedLabel(agency.feed, 'hi')}

आवश्यक डेटा स्कीमा:
1. नाले का पानी का स्तर (सेमी) - हर 15 मिनट में अपडेट
2. प्रवाह दर (क्यूमेक्स) - हर 15 मिनट में अपडेट
3. सेंसर स्थिति (ऑनलाइन/ऑफ़लाइन/कमजोर) - हर 5 मिनट में अपडेट
4. प्रत्येक सेंसर के GPS निर्देशांक

अपेक्षित कार्रवाई:
कृपया 7 दिनों के भीतर GFC सिस्टम को वास्तविक समय डेटा फ़ीड स्थापित करें। तकनीकी टीम से API एकीकरण सहायता के लिए gfc-tech@mcg.gov.in पर संपर्क किया जा सकता है।

यह डेटा सटीक बाढ़ पूर्वानुमान और प्रतिक्रिया संसाधनों की समय पर तैनाती के लिए महत्वपूर्ण है। गैर-अनुपालन के परिणामस्वरूप आपकी एजेंसी के क्षेत्रों के लिए मॉडल विश्वसनीयता कम हो सकती है, जिससे सार्वजनिक सुरक्षा प्रभावित होगी।

सादर,
DDMA गुरुग्राम
संपर्क: ddma@gurugram.gov.in | +91-124-XXXXXXX`;

    const fullText = `${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedAgency(agency.agency);
      addToast(
        lang === 'en'
          ? `Coordination request for ${agency.agency} copied to clipboard`
          : `${agency.agency} के लिए समन्वय अनुरोध क्लिपबोर्ड पर कॉपी किया गया`,
        'success'
      );
      
      // Log to audit trail
      addAuditEntry({
        actor: 'DDMA Officer',
        action: 'alert_issued',
        hotspot_id: 'NETWORK',
        original_rank: null,
        new_rank: null,
        reason: `Data feed request sent to ${agency.agency}`,
      });
      
      setTimeout(() => setCopiedAgency(null), 3000);
    }).catch(() => {
      addToast(
        lang === 'en' ? 'Failed to copy to clipboard' : 'क्लिपबोर्ड पर कॉपी करने में विफल',
        'warning'
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Bar */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {lang === 'en' ? 'Network Readiness' : 'नेटवर्क तत्परता'}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-sm text-text-secondary">
                {lang === 'en'
                  ? `${liveCount} of ${mockAgencyData.length} agencies reporting`
                  : `${mockAgencyData.length} में से ${liveCount} एजेंसियाँ रिपोर्टिंग`
                }
              </p>
              <span className="text-text-secondary">·</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">
                  {lang === 'en' ? 'Model confidence:' : 'मॉडल विश्वसनीयता:'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${confidenceColor}`}>
                  {overallConfidence === 'high' && (lang === 'en' ? 'HIGH' : 'उच्च')}
                  {overallConfidence === 'medium' && (lang === 'en' ? 'MEDIUM' : 'मध्यम')}
                  {overallConfidence === 'low' && (lang === 'en' ? 'LOW' : 'कम')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Wifi size={12} className="text-green-600" />
              <span className="text-text-secondary">{liveCount} {lang === 'en' ? 'live' : 'लाइव'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-amber-600" />
              <span className="text-text-secondary">{staleCount} {lang === 'en' ? 'stale' : 'पुराना'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WifiOff size={12} className="text-red-600" />
              <span className="text-text-secondary">{noneCount} {lang === 'en' ? 'none' : 'कोई नहीं'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Agency' : 'एजेंसी'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Drains owned' : 'नाले स्वामित्व'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Hotspots covered' : 'हॉटस्पॉट कवर'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Data feed' : 'डेटा फ़ीड'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Last data' : 'अंतिम डेटा'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Sensors' : 'सेंसर'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs">
                      {lang === 'en' ? 'Model impact' : 'मॉडल प्रभाव'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary text-xs"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAgencyData.map((agency) => (
                    <tr key={agency.agency} className="hover:bg-background/50">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {agency.agency}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {agency.drains}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {agency.covered}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getFeedColor(agency.feed)}`}>
                          {getFeedIcon(agency.feed)}
                          {getFeedLabel(agency.feed, lang)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {agency.last}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {agency.sensors}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs max-w-xs">
                        {agency.modelImpact}
                      </td>
                      <td className="px-4 py-3">
                        {agency.feed !== 'live' && (
                          <button
                            onClick={() => handleRequestData(agency)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            {copiedAgency === agency.agency ? (
                              <>
                                <CheckCircle size={12} />
                                {lang === 'en' ? 'Copied' : 'कॉपी किया गया'}
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                {lang === 'en' ? 'Request data' : 'डेटा अनुरोध'}
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-primary" />
                <span className="text-xs font-medium text-text-secondary">
                  {lang === 'en' ? 'Total Drains' : 'कुल नाले'}
                </span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {mockAgencyData.reduce((sum, a) => sum + a.drains, 0)}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {lang === 'en' ? 'across all agencies' : 'सभी एजेंसियों में'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-primary" />
                <span className="text-xs font-medium text-text-secondary">
                  {lang === 'en' ? 'Covered Hotspots' : 'कवर किए गए हॉटस्पॉट'}
                </span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {mockAgencyData.reduce((sum, a) => sum + a.covered, 0)}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {lang === 'en' ? 'with monitoring' : 'निगरानी के साथ'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-primary" />
                <span className="text-xs font-medium text-text-secondary">
                  {lang === 'en' ? 'Active Sensors' : 'सक्रिय सेंसर'}
                </span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {mockAgencyData.reduce((sum, a) => sum + a.sensors, 0)}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {lang === 'en' ? 'deployed network-wide' : 'नेटवर्क-व्यापी तैनात'}
              </p>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {lang === 'en' ? 'About Network Readiness' : 'नेटवर्क तत्परता के बारे में'}
                </p>
                <p>
                  {lang === 'en'
                    ? 'This screen shows which agencies are providing real-time data to the flood prediction model. Agencies with "No feed" or "Stale" status reduce model confidence for their areas. Use the "Request data" button to send a formal coordination request.'
                    : 'यह स्क्रीन दिखाती है कि कौन सी एजेंसियाँ बाढ़ पूर्वानुमान मॉडल को वास्तविक समय डेटा प्रदान कर रही हैं। "कोई फ़ीड नहीं" या "पुराना" स्थिति वाली एजेंसियाँ अपने क्षेत्रों के लिए मॉडल विश्वसनीयता को कम करती हैं। औपचारिक समन्वय अनुरोध भेजने के लिए "डेटा अनुरोध" बटन का उपयोग करें।'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
