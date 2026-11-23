import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Globe,
  UserCheck,
  ShieldCheck,
  Check,
  Siren,
  PhoneCall,
  Crosshair,
  Loader2,
  MapPin,
  Send,
  AlertTriangle,
  Share2,
  X,
} from 'lucide-react';
import { useStore, type SosIncidentType, type EmergencySosRecord } from '../store/useStore';
import { t } from '../i18n/translations';
import { localizeLocationName, formatWardLabel } from '../i18n/locationHi';
import { fetchRealtimePosition } from '../lib/geolocation';
import { MCG_OFFICIAL_CHANNELS } from '../data/mcgHotspots';

const INCIDENT_OPTIONS: Array<{ value: SosIncidentType; label: string }> = [
  { value: 'person_injured', label: 'Someone Injured' },
  { value: 'road_accident', label: 'Road Accident' },
  { value: 'vehicle_submerged', label: 'Vehicle Submerged' },
  { value: 'electric_hazard', label: 'Electric Wire Hazard' },
  { value: 'other', label: 'Other Emergency' },
];

export function SettingsView() {
  const {
    theme,
    setTheme,
    lang,
    setLang,
    setActiveView,
    citizenUser,
    authorityUser,
    signOutCitizen,
    signOutAuthority,
    userLocation,
    setUserLocation,
    sosReports,
    submitSosReport,
  } = useStore();

  const [sosOpen, setSosOpen] = useState(false);
  const [incidentType, setIncidentType] = useState<SosIncidentType>('person_injured');
  const [injuredCount, setInjuredCount] = useState<number>(1);
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng, accuracy: userLocation.accuracyMeters }
      : null
  );
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [callerPhone, setCallerPhone] = useState(citizenUser?.phone || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingSos, setSubmittingSos] = useState(false);
  const [lastSubmittedSos, setLastSubmittedSos] = useState<EmergencySosRecord | null>(null);

  useEffect(() => {
    if (citizenUser?.phone && !callerPhone) {
      setCallerPhone(citizenUser.phone);
    }
  }, [citizenUser?.phone, callerPhone]);

  useEffect(() => {
    if (userLocation && !coords) {
      setCoords({
        lat: userLocation.lat,
        lng: userLocation.lng,
        accuracy: userLocation.accuracyMeters,
      });
    }
  }, [userLocation, coords]);

  const handleAttachLiveGps = async () => {
    setLocatingGps(true);
    setGpsError(null);
    try {
      const fix = await fetchRealtimePosition();
      setCoords({ lat: fix.lat, lng: fix.lng, accuracy: fix.accuracyMeters });
      setUserLocation(
        {
          lat: fix.lat,
          lng: fix.lng,
          accuracyMeters: fix.accuracyMeters,
          heading: fix.heading ?? null,
          updatedAt: fix.updatedAt,
        },
        false
      );
      if (!locationLabel.trim()) {
        setLocationLabel(`Gurugram GPS (${fix.lat.toFixed(4)}, ${fix.lng.toFixed(4)})`);
      }
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'Unable to capture live GPS location.');
    } finally {
      setLocatingGps(false);
    }
  };

  const handleOpenSosPanel = () => {
    setSosOpen((prev) => !prev);
    setFormError(null);
    if (!sosOpen && !coords && !locatingGps) {
      void handleAttachLiveGps();
    }
  };

  const handleSubmitSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedDesc = description.trim();
    const trimmedLoc = locationLabel.trim();
    if (!trimmedLoc && !coords) {
      setFormError('Please enter a location or attach your live GPS coordinates.');
      return;
    }
    if (!trimmedDesc) {
      setFormError('Please briefly describe the accident, injury, or hazard.');
      return;
    }

    setSubmittingSos(true);
    try {
      const created = await submitSosReport({
        incidentType,
        injuredCount,
        locationLabel:
          trimmedLoc || `Gurugram GPS (${coords!.lat.toFixed(5)}, ${coords!.lng.toFixed(5)})`,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        description: trimmedDesc,
        callerPhone: callerPhone.trim(),
      });
      setLastSubmittedSos(created);
      setDescription('');
      setSosOpen(false);
    } finally {
      setSubmittingSos(false);
    }
  };

  const buildWhatsappShareHref = (record: EmergencySosRecord) => {
    const typeLabel =
      INCIDENT_OPTIONS.find((o) => o.value === record.incidentType)?.label || 'Emergency';
    const mapLink =
      record.lat !== null && record.lng !== null
        ? ` https://maps.google.com/?q=${record.lat.toFixed(6)},${record.lng.toFixed(6)}`
        : '';
    const text = `EMERGENCY SOS (${record.id}) - ${typeLabel}${
      record.injuredCount > 0 ? `, Injured: ${record.injuredCount}` : ''
    }. Location: ${record.locationLabel}.${mapLink} Details: ${record.description}${
      record.callerPhone ? ` Contact: ${record.callerPhone}` : ''
    }`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('settings.title', lang)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settings.subtitle', lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <ArrowLeft size={14} />
          <span>Back to Map</span>
        </button>
      </div>

      {/* Emergency SOS & Accident Reporting (No login barrier) */}
      <section className="rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Siren size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Emergency SOS & Accident Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Immediate emergency help for someone injured, road accidents, submerged vehicles, or exposed power lines. No login required.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSosPanel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold tracking-wide transition-colors whitespace-nowrap shrink-0"
          >
            <Siren size={15} />
            <span>{sosOpen ? 'Hide SOS Form' : 'Emergency SOS'}</span>
          </button>
        </div>

        {/* 1-Tap Emergency Helplines */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href="tel:112"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100/70 dark:hover:bg-red-950/50 transition-colors"
          >
            <div>
              <p className="text-[11px] font-semibold">Emergency</p>
              <p className="text-sm font-bold tabular-nums">112</p>
            </div>
            <PhoneCall size={14} className="shrink-0" />
          </a>

          <a
            href="tel:108"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ambulance</p>
              <p className="text-sm font-bold tabular-nums">108</p>
            </div>
            <PhoneCall size={14} className="text-red-600 dark:text-red-400 shrink-0" />
          </a>

          <a
            href="tel:100"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Police</p>
              <p className="text-sm font-bold tabular-nums">100</p>
            </div>
            <PhoneCall size={14} className="text-[#0B3D6B] dark:text-blue-400 shrink-0" />
          </a>

          <a
            href={`tel:${MCG_OFFICIAL_CHANNELS.helpline}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">MCG Desk</p>
              <p className="text-xs font-bold tabular-nums truncate">18001801817</p>
            </div>
            <PhoneCall size={14} className="text-[#0B3D6B] dark:text-blue-400 shrink-0" />
          </a>
        </div>

        {/* Last Submitted Confirmation Banner */}
        {lastSubmittedSos && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  SOS Alert Logged · {lastSubmittedSos.id}
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {localizeLocationName(lastSubmittedSos.locationLabel, lang)}
                  {lastSubmittedSos.injuredCount > 0
                    ? ` · ${lastSubmittedSos.injuredCount} ${lang === 'hi' ? 'घायल' : 'injured'}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLastSubmittedSos(null)}
                aria-label="Dismiss SOS confirmation"
                className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 p-0.5"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                <PhoneCall size={13} />
                <span>Call 108 Ambulance</span>
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <PhoneCall size={13} />
                <span>Call 112</span>
              </a>
              <a
                href={buildWhatsappShareHref(lastSubmittedSos)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <Share2 size={13} />
                <span>Share Details & GPS</span>
              </a>
            </div>
          </div>
        )}

        {/* Inline Emergency SOS Accident & Injury Form */}
        {sosOpen && (
          <form
            onSubmit={handleSubmitSos}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Type of Emergency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INCIDENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIncidentType(opt.value)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                      incidentType === opt.value
                        ? 'border-red-600 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  People Injured
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setInjuredCount(count)}
                      className={`py-2 rounded-lg border text-xs font-bold tabular-nums transition-colors ${
                        injuredCount === count
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {count === 3 ? '3+' : count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="sos-phone"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Callback Phone (Optional)
                </label>
                <input
                  id="sos-phone"
                  type="tel"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="sos-location"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Accident / Emergency Location
                </label>
                <button
                  type="button"
                  onClick={handleAttachLiveGps}
                  disabled={locatingGps}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D6B] dark:text-blue-400 hover:underline disabled:opacity-60"
                >
                  {locatingGps ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Crosshair size={13} />
                  )}
                  <span>{locatingGps ? 'Locating...' : 'Attach Live GPS'}</span>
                </button>
              </div>
              <input
                id="sos-location"
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="Landmark, sector, road, or underpass name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              {coords && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 tabular-nums">
                  <MapPin size={12} className="text-red-600 dark:text-red-400 shrink-0" />
                  <span>
                    GPS locked: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    {coords.accuracy ? ` · ±${coords.accuracy}m` : ''}
                  </span>
                </p>
              )}
              {gpsError && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400">{gpsError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sos-details"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                What Happened? (Injuries, trapped persons, traffic blockage)
              </label>
              <textarea
                id="sos-details"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Two-wheeler slipped into flooded manhole near Hero Honda Chowk, rider has leg injury and needs ambulance..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSos}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-60"
              >
                {submittingSos ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Send Emergency SOS Alert</span>
              </button>
            </div>
          </form>
        )}

        {/* Recent SOS Alerts Logged */}
        {sosReports.length > 0 && (
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recent SOS Alerts ({sosReports.length})
            </p>
            <div className="space-y-2">
              {sosReports.slice(0, 3).map((item) => {
                const label =
                  INCIDENT_OPTIONS.find((o) => o.value === item.incidentType)?.label ||
                  'Emergency';
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.id} · {label}
                        {item.injuredCount > 0 ? ` · ${item.injuredCount} injured` : ''}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 truncate">
                        {localizeLocationName(item.locationLabel, lang)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-red-700 dark:text-red-300 shrink-0 tabular-nums">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Appearance / Dark Mode */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('settings.appearance', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose between Classic White daylight theme or Dark Mode for night viewing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 ${
              theme === 'light'
                ? 'border-[#0B3D6B] bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-[#0B3D6B]'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Sun size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Classic White
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean white surfaces with Voyager daylight map
                </p>
              </div>
            </div>
            {theme === 'light' && <Check size={16} className="text-[#0B3D6B] shrink-0 mt-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 ${
              theme === 'dark'
                ? 'border-[#0B3D6B] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#0B3D6B] dark:ring-blue-500'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-blue-300 flex items-center justify-center shrink-0">
                <Moon size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Dark Mode
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Low-glare dark interface with night map tiles
                </p>
              </div>
            </div>
            {theme === 'dark' && (
              <Check size={16} className="text-[#0B3D6B] dark:text-blue-400 shrink-0 mt-0.5" />
            )}
          </button>
        </div>
      </section>

      {/* Language Selection */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-start gap-2.5">
          <Globe size={18} className="text-[#0B3D6B] dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.language', lang)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your preferred language for labels, ward alerts, and guidance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
              lang === 'en'
                ? 'border-[#0B3D6B] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-[#0B3D6B] dark:ring-blue-500'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">English</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Default portal language</p>
            </div>
            {lang === 'en' && (
              <Check size={16} className="text-[#0B3D6B] dark:text-blue-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
              lang === 'hi'
                ? 'border-[#0B3D6B] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-[#0B3D6B] dark:ring-blue-500'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">हिन्दी (Hindi)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">गुरुग्राम नागरिक पोर्टल</p>
            </div>
            {lang === 'hi' && (
              <Check size={16} className="text-[#0B3D6B] dark:text-blue-400 shrink-0" />
            )}
          </button>
        </div>
      </section>

      {/* Account & Sign-In Controls (moved from top bar into Settings) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Account & Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            No login is required to browse the flood map, live GPS view, or route safety. Sign in only when registering flood reports, ward alerts, or opening the MCG Officer Desk.
          </p>
        </div>

        {citizenUser && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <UserCheck size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {citizenUser.name} · +91 {citizenUser.phone}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {localizeLocationName(citizenUser.address, lang)}
                  {citizenUser.wardNo ? ` · ${formatWardLabel(citizenUser.wardNo, lang)}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutCitizen}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        )}

        {authorityUser && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-[#0B3D6B] dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {authorityUser.name} · ID: {authorityUser.employeeId}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {authorityUser.department} ·{' '}
                  {authorityUser.role === 'command_authority' ? 'Command Authority' : 'Ward Engineer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('dispatch')}
                className="px-3 py-1.5 rounded-lg bg-[#0B3D6B] text-white text-xs font-semibold hover:bg-[#093055]"
              >
                Officer Desk
              </button>
              <button
                type="button"
                onClick={signOutAuthority}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {!citizenUser && (
            <button
              type="button"
              onClick={() => setActiveView('citizen-login')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <UserCheck size={17} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Resident Sign In / Sign Up
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Phone number & quick Gurugram address
                </p>
              </div>
            </button>
          )}

          {!authorityUser && (
            <button
              type="button"
              onClick={() => setActiveView('authority-login')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#0B3D6B] dark:text-blue-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={17} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Municipal Authority Login
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign in with Employee ID & passcode
                </p>
              </div>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
