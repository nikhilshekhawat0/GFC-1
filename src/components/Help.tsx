import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Info, Video, ShieldAlert, Network, HelpCircle, ChevronRight, AlertTriangle, Users, Droplets, type LucideIcon } from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
}

interface FAQ {
  q: string;
  a: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: '1. Getting Started',
    icon: Info,
    content: `**Welcome to Gurgaon Flood Command.**

This system moves MCG from *reactive pumping* to *predictive drainage*. It does this by fusing the IMD weather forecast, GMDA's CCTV network, and MCG's own hotspot register into a single, ranked action list.

**Your Daily Workflow:**
1. Check the **Risk Map** at 6:00 AM.
2. Review the **Ranked Action List** to see which crews need to be deployed.
3. Pre-position pumps 12–24 hours before rainfall.
4. Issue citizen alerts via SMS/IVR.`
  },
  {
    id: 'decision-engine',
    title: '2. How the AI Ranks Actions',
    icon: ShieldAlert,
    content: `The Decision Engine does not just look at rainfall. It calculates a **Risk Score** based on four factors:

* **MCG Register Tier:** Is this a 'Critical Point' or a 'Low Lying Area'?
* **CCTV Computer Vision:** Are GMDA's cameras detecting water pooling *right now*?
* **Topology Leverage:** Is this node upstream of 5 other hotspots? (If so, it gets fixed first).
* **Crew Load:** Is the assigned Junior Engineer (JE) already overburdened with 5 other locations?

*The system outputs an SOP (Standard Operating Procedure) with exact deadlines (e.g., T-12h, T-6h).*`
  },
  {
    id: 'institutional-data',
    title: '3. Official Data & The "159 vs 7" Gap',
    icon: Network,
    content: `You may notice a discrepancy between what GMDA reports and what MCG reports. The system tracks both.

* **GMDA's Claim (July 2026 Press Release):** Hotspots reduced from 90 to **7** (Narsinghpur, Khandsa Chowk, Jwala Mill Road, Sector 28/Chakkarpur, Laxman Vihar, Sheetla Mata Road, Krishna Chowk).
* **MCG's Reality (June 2025 Register):** **159** active local hotspots across Zones 1–4.

**Why the gap?** GMDA fixed the major trunk drains (70.56 km desilted, 1,500 inlets added, 34 pumps deployed). MCG is still dealing with last-mile internal sector roads. **This system bridges the gap** by combining GMDA's trunk data with MCG's local register.`
  },
  {
    id: 'cctv-network',
    title: '4. GMDA CCTV Integration',
    icon: Video,
    content: `We do not require MCG to buy new sensors. The system integrates directly with GMDA's Smart City CCTV network (expanding to **4,287 cameras** by Dec 2026).

* **Computer Vision:** The AI analyzes video feeds at underpasses to estimate water depth.
* **Privacy:** Video feeds are processed for water depth detection only. No facial recognition or vehicle tracking is used.
* **Hybrid Sensors:** Where CCTV blind spots exist (upstream drains), a minimal number of IoT water-level sensors are used.`
  },
  {
    id: 'overrides',
    title: '5. The Override Protocol',
    icon: AlertTriangle,
    content: `Political discretion is possible, but it is not invisible.

If a councillor or official requests a resource to be moved away from an AI-recommended hotspot, the operator must click **Override**.

* The system will show the **Consequence Preview** (how many residents lose coverage, which downstream nodes are affected).
* A reason must be typed and logged.
* The Commissioner receives an automatic notification of the override in the Executive View.`
  }
];

const faqData: FAQ[] = [
  {
    q: 'What happens if the IMD forecast is wrong and it doesn\'t rain?',
    a: 'The system logs a \'false positive\'. We track this in the calibration dashboard. Trust is built by publishing our accuracy rate, not by hiding misses.'
  },
  {
    q: 'Who owns the CCTV cameras?',
    a: 'They are owned and maintained by GMDA. This system simply plugs into their video API to run visual AI.'
  },
  {
    q: 'What if an Irrigation Department drain is blocked?',
    a: 'The Action List will flag it as a \'Cross-Agency Action\'. You cannot deploy an MCG pump to fix a natural drain. The system provides a \'Notify Agency\' button that drafts a formal coordination request to the Irrigation Department.'
  }
];

const gmdaHotspots = [
  { name: 'Narsinghpur (NH-48)', cause: 'Trunk drain bottleneck', pumps: 4 },
  { name: 'Khandsa Chowk', cause: 'Local drainage failure', pumps: 2 },
  { name: 'Sector 28/Chakkarpur', cause: 'Choked master stormwater drain', pumps: 3 },
  { name: 'Jwala Mill Road', cause: 'Low-lying area', pumps: 2 },
  { name: 'Laxman Vihar', cause: 'Drainage block', pumps: 1 },
  { name: 'Sheetla Mata Road', cause: 'Overflow', pumps: 2 },
  { name: 'Krishna Chowk', cause: 'Infrastructure work', pumps: 1 },
];

// Simple markdown parser
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let key = 0;

  const flushLists = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1.5 my-3 text-text-primary">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
    if (orderedListItems.length > 0) {
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1.5 my-3 text-text-primary">
          {orderedListItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ol>
      );
      orderedListItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      flushLists();
      return;
    }

    if (trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      orderedListItems.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    }

    flushLists();

    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-text-primary mt-6 mb-2">
          {trimmed.slice(2, -2)}
        </h3>
      );
    } else {
      elements.push(
        <p key={key++} className="text-text-primary leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
      );
    }
  });

  flushLists();
  return elements;
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-text-secondary">$1</em>');
}

export function Help() {
  const { lang } = useStore();
  const [activeTopic, setActiveTopic] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return helpTopics;
    const query = searchQuery.toLowerCase();
    return helpTopics.filter(
      topic =>
        topic.title.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const currentTopic = helpTopics.find(t => t.id === activeTopic) || helpTopics[0];

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {lang === 'en' ? 'Help & Information Center' : 'सहायता और सूचना केंद्र'}
              </h1>
              <p className="text-sm text-text-secondary">
                {lang === 'en'
                  ? 'Learn how to use Gurgaon Flood Command effectively'
                  : 'गुरुग्राम बाढ़ कमांड का प्रभावी उपयोग करना सीखें'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Navigation */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'en' ? 'Search topics...' : 'विषय खोजें...'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              {/* Topic List */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="p-2 border-b border-border">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-2">
                    {lang === 'en' ? 'Help Topics' : 'सहायता विषय'}
                  </p>
                </div>
                <nav className="p-2">
                  {filteredTopics.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-4">
                      {lang === 'en' ? 'No topics match your search' : 'आपकी खोज से कोई विषय मेल नहीं खाता'}
                    </p>
                  ) : (
                    filteredTopics.map((topic) => {
                      const Icon = topic.icon;
                      const isActive = activeTopic === topic.id;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => setActiveTopic(topic.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mb-0.5 ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-secondary hover:bg-background hover:text-text-primary'
                          }`}
                        >
                          <Icon size={16} className="flex-shrink-0" />
                          <span className="flex-1 truncate">{topic.title}</span>
                          {isActive && <ChevronRight size={14} className="flex-shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl border border-border mt-4 p-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  {lang === 'en' ? 'Quick Links' : 'त्वरित लिंक'}
                </p>
                <div className="space-y-2">
                  <a href="#faq" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <HelpCircle size={14} />
                    {lang === 'en' ? 'FAQ' : 'सामान्य प्रश्न'}
                  </a>
                  <a href="#gmda-table" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Network size={14} />
                    {lang === 'en' ? 'GMDA Hotspots' : 'GMDA हॉटस्पॉट'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 min-w-0">
            {/* Topic Content */}
            <div className="bg-white rounded-xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <currentTopic.icon size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">{currentTopic.title}</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                {parseMarkdown(currentTopic.content)}
              </div>
            </div>

            {/* Callout Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    {lang === 'en' ? 'Why this matters' : 'यह महत्वपूर्ण क्यों है'}
                  </p>
                  <p className="text-sm text-blue-800">
                    {lang === 'en'
                      ? 'Understanding how the system works helps you make better decisions during flood events. The AI recommendations are based on real data from multiple agencies — trust the data, but always verify with field conditions.'
                      : 'सिस्टम कैसे काम करता है यह समझने से आपको बाढ़ की घटनाओं के दौरान बेहतर निर्णय लेने में मदद मिलती है। AI सिफारिशें कई एजेंसियों के वास्तविक डेटा पर आधारित हैं — डेटा पर भरोसा करें, लेकिन हमेशा क्षेत्र की स्थितियों से सत्यापित करें।'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* GMDA Hotspots Table */}
            <div id="gmda-table" className="bg-white rounded-xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Network size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-text-primary">
                  {lang === 'en' ? 'GMDA\'s 7 Active Critical Nodes (July 2026)' : 'GMDA के 7 सक्रिय महत्वपूर्ण नोड्स (जुलाई 2026)'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">
                        {lang === 'en' ? 'Hotspot' : 'हॉटस्पॉट'}
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">
                        {lang === 'en' ? 'Cause' : 'कारण'}
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-text-secondary text-xs">
                        {lang === 'en' ? 'Pumps Deployed' : 'तैनात पंप'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {gmdaHotspots.map((hotspot, i) => (
                      <tr key={i} className="hover:bg-background/50">
                        <td className="px-4 py-2.5 font-medium text-text-primary">{hotspot.name}</td>
                        <td className="px-4 py-2.5 text-text-secondary">{hotspot.cause}</td>
                        <td className="px-4 py-2.5 text-text-secondary">{hotspot.pumps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div id="faq" className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-text-primary">
                  {lang === 'en' ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले प्रश्न'}
                </h3>
              </div>
              <div className="space-y-3">
                {faqData.map((faq, i) => (
                  <div key={i} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-background transition-colors"
                    >
                      <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                      <ChevronRight
                        size={16}
                        className={`text-text-secondary flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-3 pt-1 border-t border-border bg-background/50">
                        <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
