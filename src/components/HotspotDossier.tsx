import { useMemo } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { mcgHotspots, MCG_OFFICIAL_CHANNELS } from '../data/mcgHotspots';
import { computeHotspotTelemetry, useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  getHotspotDisplayName,
  getHotspotDisplayLandmark,
  getCauseAnalysis,
  formatWardLabel,
  formatZoneLabel,
} from '../i18n/locationHi';
import { Sparkline } from './Sparkline';
import { HotspotHistoryChart } from './HotspotHistoryChart';

function cleanPhoneForWa(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits : `91${digits}`;
}

export function HotspotDossier() {
  const {
    lang,
    role,
    selectedHotspotId,
    setSelectedHotspotId,
    rightSidebarCollapsed,
    toggleRightSidebar,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
    escalateHotspotSla,
    deployPumpToHotspot,
    markHotspotCleared,
    flagHotspotBlocker,
  } = useStore();

  const hotspot = useMemo(
    () => mcgHotspots.find((h) => h.id === selectedHotspotId) || null,
    [selectedHotspotId]
  );

  const telemetry = useMemo(() => {
    if (!hotspot) return null;
    return computeHotspotTelemetry(
      hotspot,
      rainfallMm,
      timelineHourOffset,
      pumpMitigationActive,
      sensors,
      floodReports,
      dispatchRecords[hotspot.id]
    );
  }, [
    hotspot,
    rainfallMm,
    timelineHourOffset,
    pumpMitigationActive,
    sensors,
    floodReports,
    dispatchRecords,
  ]);

  if (!hotspot || !telemetry) return null;

  const dispatch = dispatchRecords[hotspot.id];
  const officerTiers = [
    { tier: 1, contact: hotspot.contacts.callOperator },
    { tier: 2, contact: hotspot.contacts.sanitationSupervisor },
    { tier: 3, contact: hotspot.contacts.asi },
    { tier: 4, contact: hotspot.contacts.je },
    { tier: 5, contact: hotspot.contacts.ae },
  ];

  const tierTextColor =
    telemetry.tier === 'critical'
      ? 'text-red-600 dark:text-red-400'
      : telemetry.tier === 'high'
        ? 'text-amber-600 dark:text-amber-400'
        : telemetry.tier === 'medium'
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-emerald-600 dark:text-emerald-400';

  const activeOfficer = officerTiers[telemetry.slaTier - 1]?.contact;

  const buildWhatsappHref = (phone: string, recipientName: string) => {
    const msg = `GFC Monsoon Alert [Ward ${hotspot.wardNo}, Zone ${hotspot.zone}] — ${recipientName}, waterlogging risk is ${telemetry.riskPct}% (~${telemetry.waterDepthCm}cm) at ${hotspot.name} (${hotspot.landmark}). Cause: ${hotspot.causeAnalysis}. GPS: ${hotspot.lat.toFixed(5)}, ${hotspot.lng.toFixed(5)}.`;
    return `https://wa.me/${cleanPhoneForWa(phone)}?text=${encodeURIComponent(msg)}`;
  };

  if (rightSidebarCollapsed) {
    return (
      <aside className="hidden md:flex w-12 shrink-0 h-full border-l border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#111317] flex-col items-center py-3 gap-2">
        <button
          type="button"
          onClick={toggleRightSidebar}
          className="p-2 rounded-full text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          title={`Expand ${hotspot.name}`}
          aria-label="Expand hotspot details"
        >
          <PanelRightOpen size={17} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedHotspotId(null)}
          className="p-2 rounded-full text-[#6B7280] hover:text-red-600 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
          title="Clear selected spot"
          aria-label="Clear selected spot"
        >
          <X size={15} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-0 top-14 z-30 md:static md:inset-auto w-full md:w-[365px] xl:w-[395px] shrink-0 h-[calc(100vh-3.5rem)] md:h-full flex flex-col border-l border-[#E6E7EC] dark:border-[#242832] bg-white dark:bg-[#111317] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#EAECEF] dark:border-[#242832] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#6B7280] dark:text-slate-400">
            <span>#{hotspot.srNo}</span>
            <span>·</span>
            <span>{formatWardLabel(hotspot.wardNo, lang)}</span>
            <span>·</span>
            <span>{formatZoneLabel(hotspot.zone, lang)}</span>
            <span>·</span>
            <span>{hotspot.owningAgency}</span>
          </div>
          <h2 className="text-base font-bold text-[#111317] dark:text-[#F4F4F6] mt-1 leading-snug">
            {getHotspotDisplayName(hotspot, lang)}
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{getHotspotDisplayLandmark(hotspot, lang)}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleRightSidebar}
            className="hidden md:inline-flex p-1.5 rounded-full text-[#6B7280] hover:text-[#111317] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
            title="Collapse sidebar"
            aria-label="Collapse hotspot sidebar"
          >
            <PanelRightClose size={16} />
          </button>
          <button
            type="button"
            onClick={() => setSelectedHotspotId(null)}
            className="p-1.5 rounded-full text-[#6B7280] hover:text-[#111317] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]"
            aria-label="Close hotspot dossier"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Key Road Condition Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F]">
            <p className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
              {lang === 'hi' ? 'जलभराव संभावना' : 'Flood Chance'}
            </p>
            <p className={`text-xl font-bold tabular-nums mt-0.5 ${tierTextColor}`}>
              {telemetry.riskPct}%
            </p>
            <p className="text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 capitalize">
              {lang === 'hi'
                ? telemetry.tier === 'critical'
                  ? 'गंभीर'
                  : telemetry.tier === 'high'
                    ? 'अधिक'
                    : telemetry.tier === 'medium'
                      ? 'मध्यम'
                      : 'सामान्य'
                : telemetry.tier === 'critical'
                  ? 'Severe'
                  : telemetry.tier === 'medium'
                    ? 'Moderate'
                    : telemetry.tier}
            </p>
          </div>
          <div className="p-2.5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F]">
            <p className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
              {lang === 'hi' ? 'पानी की गहराई' : 'Water Depth'}
            </p>
            <p className="text-xl font-bold tabular-nums text-[#111317] dark:text-[#F4F4F6] mt-0.5">
              {telemetry.waterDepthCm}
              <span className="text-xs font-normal text-[#6B7280] ml-0.5">
                {lang === 'hi' ? 'सेमी' : 'cm'}
              </span>
            </p>
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
              {lang === 'hi'
                ? telemetry.waterDepthCm >= 35
                  ? 'घुटने तक पानी'
                  : telemetry.waterDepthCm >= 18
                    ? 'टखने तक पानी'
                    : 'हल्का जलभराव'
                : telemetry.waterDepthCm >= 35
                  ? 'Knee-deep'
                  : telemetry.waterDepthCm >= 18
                    ? 'Ankle-deep'
                    : 'Shallow'}
            </p>
          </div>
          <div className="p-2.5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F]">
            <p className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
              {lang === 'hi' ? 'प्रतिक्रिया SLA' : 'Response SLA'}
            </p>
            <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
              {dispatch?.status === 'done'
                ? lang === 'hi'
                  ? 'साफ'
                  : 'Done'
                : `${telemetry.slaRemainingMins}${lang === 'hi' ? ' मि.' : 'm'}`}
            </p>
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
              {lang === 'hi'
                ? `अधिकारी स्तर ${telemetry.slaTier}/5`
                : `Officer Level ${telemetry.slaTier}/5`}
            </p>
          </div>
        </div>

        {/* 12h Water Level Outlook */}
        <div className="p-3 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F]">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
              {lang === 'hi' ? 'अनुमानित जल स्तर (आज)' : 'Expected Water Level (Today)'}
            </span>
            <span className="font-mono tabular-nums text-[#6B7280] dark:text-slate-400">
              {lang === 'hi' ? 'अधिकतम' : 'Peak'} {Math.max(...telemetry.sparkline)}%
            </span>
          </div>
          <Sparkline
            data={telemetry.sparkline}
            color={telemetry.tier === 'critical' ? '#dc2626' : '#111317'}
            height={42}
            activeIndex={Math.max(0, Math.min(12, timelineHourOffset + 6))}
          />
        </div>

        {/* Historical Flood Frequency & Duration Chart */}
        <HotspotHistoryChart hotspot={hotspot} lang={lang} />

        {/* Location Verification Notice */}
        <div className="text-xs space-y-1">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400 font-mono text-[11px]">
            <span>
              {hotspot.lat.toFixed(5)}°N, {hotspot.lng.toFixed(5)}°E
            </span>
            <span
              className={
                hotspot.gpsStatus === 'corrected'
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-emerald-600 dark:text-emerald-400 font-semibold'
              }
            >
              {hotspot.gpsStatus === 'corrected'
                ? t('dossier.gps_corrected', lang)
                : t('dossier.gps_verified', lang)}
            </span>
          </div>
          {hotspot.gpsNote && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300/90">
              {lang === 'hi' ? 'मानचित्र नोट:' : 'Map Note:'} {hotspot.gpsNote}
            </p>
          )}
        </div>

        {/* MCG Root Cause Analysis */}
        <div className="p-3.5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F] space-y-1.5">
          <h3 className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6]">
            {t('dossier.cause_analysis', lang)}
          </h3>
          <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed">
            {getCauseAnalysis(hotspot.causeAnalysis, lang)}
          </p>
          {(hotspot.upstreamOf.length > 0 || hotspot.downstreamOf.length > 0) && (
            <div className="pt-1.5 border-t border-[#EAECEF] dark:border-[#242832] space-y-1 text-[11px]">
              {hotspot.downstreamOf.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[#6B7280] dark:text-slate-400">
                  <span>{lang === 'hi' ? 'ऊपरी बहाव से प्रभावित:' : 'Fed by upstream:'}</span>
                  {hotspot.downstreamOf.map((id) => {
                    const target = mcgHotspots.find((x) => x.id === id);
                    if (!target) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedHotspotId(id)}
                        className="text-[#111317] dark:text-[#F4F4F6] underline-offset-2 hover:underline font-semibold"
                      >
                        {getHotspotDisplayName(target, lang)}
                      </button>
                    );
                  })}
                </div>
              )}
              {hotspot.upstreamOf.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[#6B7280] dark:text-slate-400">
                  <span>{lang === 'hi' ? 'निचले क्षेत्र पर प्रभाव:' : 'Impacts downstream:'}</span>
                  {hotspot.upstreamOf.map((id) => {
                    const target = mcgHotspots.find((x) => x.id === id);
                    if (!target) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedHotspotId(id)}
                        className="text-[#111317] dark:text-[#F4F4F6] underline-offset-2 hover:underline font-semibold"
                      >
                        {getHotspotDisplayName(target, lang)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5-Tier MCG Accountability Chain & 1-Click Call / WhatsApp */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6]">
              {t('dossier.escalation_chain', lang)}
            </h3>
            <button
              onClick={() => escalateHotspotSla(hotspot.id)}
              disabled={telemetry.slaTier >= 5}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40"
            >
              <Clock size={12} />
              <span>{t('dossier.escalate_sla', lang)}</span>
            </button>
          </div>

          <div className="divide-y divide-[#EAECEF] dark:divide-[#242832] rounded-2xl border border-[#EAECEF] dark:border-[#242832] overflow-hidden">
            {officerTiers.map(({ tier, contact }) => {
              const isCurrentSla = telemetry.slaTier === tier;
              return (
                <div
                  key={tier}
                  className={`px-3 py-2.5 flex items-center justify-between gap-2 ${
                    isCurrentSla
                      ? 'bg-amber-50/90 dark:bg-amber-950/30'
                      : 'bg-white dark:bg-[#16191F]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                      L{tier} · {contact.role}{' '}
                      {isCurrentSla ? (lang === 'hi' ? '· सक्रिय SLA' : '· Active SLA') : ''}
                    </p>
                    <p className="text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] truncate">
                      {contact.name}
                    </p>
                    <p className="text-[11px] font-mono tabular-nums text-[#6B7280] dark:text-slate-400">
                      {contact.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#1B1E25] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] transition-colors"
                      title={`Call ${contact.name}`}
                    >
                      <Phone size={11} />
                      <span>{t('dossier.call', lang)}</span>
                    </a>
                    <a
                      href={buildWhatsappHref(contact.phone, contact.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      title={`WhatsApp ${contact.name}`}
                    >
                      <MessageCircle size={11} />
                      <span>WA</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official MCG Grievance Channels */}
        <div className="p-3 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-[#FAFAFB] dark:bg-[#16191F] flex items-center justify-between gap-2 text-[11px]">
          <div>
            <p className="font-semibold text-[#111317] dark:text-[#F4F4F6]">
              {t('citizen.official_helpline', lang)}
            </p>
            <p className="text-[#6B7280] dark:text-slate-400 font-mono">
              {lang === 'hi' ? 'टोल-फ्री:' : 'Toll-Free:'} {MCG_OFFICIAL_CHANNELS.helpline} ·{' '}
              {lang === 'hi' ? 'व्हाट्सएप बॉट:' : 'WA Bot:'} {MCG_OFFICIAL_CHANNELS.whatsappBot}
            </p>
          </div>
          <a
            href={MCG_OFFICIAL_CHANNELS.portal}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#111317] dark:text-[#F4F4F6] font-semibold hover:underline shrink-0"
          >
            <span>MCG</span>
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      {/* Footer Actions (Role-aware) */}
      <div className="p-3.5 border-t border-[#EAECEF] dark:border-[#242832] bg-white dark:bg-[#111317] flex items-center gap-2">
        {role === 'citizen' && activeOfficer ? (
          <a
            href={buildWhatsappHref(activeOfficer.phone, activeOfficer.name)}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-full bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldAlert size={14} />
            <span>
              {lang === 'hi'
                ? `${activeOfficer.role} (${activeOfficer.name}) को भेजें`
                : `Escalate to ${activeOfficer.role}: ${activeOfficer.name}`}
            </span>
          </a>
        ) : (
          <>
            <button
              onClick={() => deployPumpToHotspot(hotspot.id)}
              className="flex-1 py-2.5 px-3 rounded-full bg-[#0D2621] hover:bg-[#153B33] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Truck size={13} />
              <span>{t('cmd.deploy_pump', lang)}</span>
            </button>
            <button
              onClick={() => markHotspotCleared(hotspot.id)}
              className="flex-1 py-2.5 px-3 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 size={13} />
              <span>{t('cmd.mark_done', lang)}</span>
            </button>
            <button
              onClick={() => flagHotspotBlocker(hotspot.id)}
              className="p-2.5 rounded-full border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title={t('cmd.flag_issue', lang)}
            >
              <AlertTriangle size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
