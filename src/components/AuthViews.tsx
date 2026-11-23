import { useState } from 'react';
import {
  Globe,
  Phone,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Circle,
  Droplets,
} from 'lucide-react';
import { MCG_OFFICIAL_CHANNELS } from '../data/mcgHotspots';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { localizeLocationName, formatWardLabel } from '../i18n/locationHi';
import { LegalModal, type LegalDocTab } from './LegalModal';
import floodStreetImg from '../assets/images/flood_street_monsoon_1795437233671.jpg';
import stormDrainImg from '../assets/images/storm_drain_culvert_1795437234057.jpg';
import underpassDrainImg from '../assets/images/underpass_rain_drainage_1795437233672.jpg';

const LOGIN_COPY = {
  en: {
    helpline: 'Helpline',
    switchLanguage: 'Switch Language',
    toggleLabel: 'हिन्दी',
    signUp: 'Sign up',
    signIn: 'Sign in',
    backToMap: 'Back to Map',
    redirectReport: 'Sign in to register your street waterlogging report',
    redirectAlerts: 'Sign in to activate ward rain alerts',
    authorityTitle: 'Authority Login',
    citizenSignInTitle: 'Resident Login',
    citizenSignUpTitle: 'Resident Sign Up',
    authoritySubtitle: 'Enter your Employee ID details to sign in to the MCG operations desk',
    citizenSignInSubtitle: 'Enter your phone number to sign in and submit flood reports',
    citizenSignUpSubtitle: 'Enter your phone number & quick Gurugram address to register reports',
    signedInAs: 'Signed in as',
    reportFlooding: 'Report Flooding',
    signOut: 'Sign Out',
    enterPhone: 'Enter Phone No',
    quickAddress: 'Quick Address (House / Street / Sector) *',
    yourNameOptional: 'Your name (optional)',
    wardOptional: 'Ward (optional)',
    newResidentPrompt: 'New resident? Add quick address',
    alreadyRegisteredPrompt: 'Already registered? Sign in with phone',
    signUpContinue: 'Sign up & Continue',
    activeOfficer: 'Active Officer:',
    idLabel: 'ID:',
    openActionQueue: 'Open Action Queue',
    wardEngineerJe: 'Ward Engineer (JE)',
    commandAe: 'Command AE',
    departmentAria: 'Department',
    officerNameOptional: 'Officer name (optional)',
    enterEmployeeId: 'Enter Employee ID (e.g. MCG-JE-204)',
    passcodePlaceholder: 'Passcode',
    hide: 'Hide',
    show: 'Show',
    troubleSignIn: 'Having trouble signing in?',
    jeDemo: 'JE Demo',
    aeDemo: 'AE Demo',
    orSignInWith: 'Or Sign in with',
    residentPhone: 'Resident Phone',
    staffId: 'Staff ID',
    noAccount: "Don't have an account? ",
    alreadyRegistered: 'Already registered? ',
    signUpNow: 'Sign up Now',
    justCheckingMap: 'Just checking the map? ',
    continueWithoutLogin: 'Continue without login',
    publicMapFooter: 'Public Map',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    toastInvalidPhone: 'Please enter a valid 10-digit phone number',
    toastNewPhone: 'New phone number — add your quick Gurugram address to finish sign up',
    toastAddressRequired: 'Please enter a quick Gurugram address (House / Street / Sector)',
    toastEmpRequired: 'Please enter your Employee ID and passcode',
    toastInvalidPasscode: 'Invalid authority passcode. Use quick fill below or check your officer PIN.',
    defaultResidentPrefix: 'Resident',
    defaultCommandOfficer: 'MCG Command Officer',
    defaultWardEngineer: 'MCG Ward Engineer',
  },
  hi: {
    helpline: 'हेल्पलाइन',
    switchLanguage: 'भाषा बदलें',
    toggleLabel: 'English',
    signUp: 'साइन अप',
    signIn: 'साइन इन',
    backToMap: 'मानचित्र पर लौटें',
    redirectReport: 'सड़क पर जलभराव रिपोर्ट दर्ज करने के लिए साइन इन करें',
    redirectAlerts: 'वार्ड वर्षा अलर्ट सक्रिय करने के लिए साइन इन करें',
    authorityTitle: 'अधिकारी लॉगिन',
    citizenSignInTitle: 'निवासी लॉगिन',
    citizenSignUpTitle: 'निवासी पंजीकरण',
    authoritySubtitle: 'MCG संचालन डेस्क में साइन इन करने के लिए अपना कर्मचारी आईडी विवरण दर्ज करें',
    citizenSignInSubtitle: 'साइन इन करने और जलभराव रिपोर्ट भेजने के लिए अपना फ़ोन नंबर दर्ज करें',
    citizenSignUpSubtitle: 'रिपोर्ट दर्ज करने के लिए अपना फ़ोन नंबर और गुरुग्राम पता दर्ज करें',
    signedInAs: 'साइन इन:',
    reportFlooding: 'जलभराव रिपोर्ट करें',
    signOut: 'साइन आउट',
    enterPhone: 'फ़ोन नंबर दर्ज करें',
    quickAddress: 'त्वरित पता (मकान / गली / सेक्टर) *',
    yourNameOptional: 'आपका नाम (वैकल्पिक)',
    wardOptional: 'वार्ड (वैकल्पिक)',
    newResidentPrompt: 'नए निवासी? त्वरित पता जोड़ें',
    alreadyRegisteredPrompt: 'पहले से पंजीकृत? फ़ोन से साइन इन करें',
    signUpContinue: 'साइन अप करें व आगे बढ़ें',
    activeOfficer: 'सक्रिय अधिकारी:',
    idLabel: 'आईडी:',
    openActionQueue: 'कार्रवाई सूची खोलें',
    wardEngineerJe: 'वार्ड अभियंता (JE)',
    commandAe: 'कमांड AE',
    departmentAria: 'विभाग',
    officerNameOptional: 'अधिकारी का नाम (वैकल्पिक)',
    enterEmployeeId: 'कर्मचारी आईडी दर्ज करें (जैसे MCG-JE-204)',
    passcodePlaceholder: 'पासकोड',
    hide: 'छिपाएं',
    show: 'दिखाएं',
    troubleSignIn: 'साइन इन में समस्या आ रही है?',
    jeDemo: 'JE डेमो',
    aeDemo: 'AE डेमो',
    orSignInWith: 'या इसके द्वारा साइन इन करें',
    residentPhone: 'निवासी फ़ोन',
    staffId: 'स्टाफ आईडी',
    noAccount: 'खाता नहीं है? ',
    alreadyRegistered: 'पहले से पंजीकृत हैं? ',
    signUpNow: 'अभी साइन अप करें',
    justCheckingMap: 'सिर्फ़ मानचित्र देखना है? ',
    continueWithoutLogin: 'लॉगिन के बिना जारी रखें',
    publicMapFooter: 'सार्वजनिक मानचित्र',
    privacyPolicy: 'गोपनीयता नीति',
    termsConditions: 'नियम व शर्तें',
    toastInvalidPhone: 'कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें',
    toastNewPhone: 'नया फ़ोन नंबर — साइन अप पूरा करने के लिए अपना गुरुग्राम पता जोड़ें',
    toastAddressRequired: 'कृपया अपना गुरुग्राम पता दर्ज करें (मकान / गली / सेक्टर)',
    toastEmpRequired: 'कृपया अपनी कर्मचारी आईडी और पासकोड दर्ज करें',
    toastInvalidPasscode: 'अमान्य अधिकारी पासकोड। नीचे दिए गए डेमो बटन का उपयोग करें या अपना पिन जांचें।',
    defaultResidentPrefix: 'निवासी',
    defaultCommandOfficer: 'MCG कमांड अधिकारी',
    defaultWardEngineer: 'MCG वार्ड अभियंता',
  },
} as const;

function FloodPhotoBackdrop() {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const markFailed = (key: string) => {
    setFailed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Full-bleed underpass & drainage photo base at ~70% opacity */}
      <div className="absolute inset-0 bg-[#F3F4F6] dark:bg-[#0B0C0F]" />
      {!failed.underpass && (
        <img
          src={underpassDrainImg}
          alt="Urban road underpass and storm drain during monsoon rainfall"
          referrerPolicy="no-referrer"
          onError={() => markFailed('underpass')}
          className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-65"
        />
      )}

      {/* Left flooded street frame at ~80% opacity */}
      <div className="hidden md:block absolute top-16 bottom-12 left-4 lg:left-8 w-[34%] max-w-[440px] rounded-2xl overflow-hidden border border-white/50 dark:border-[#242832] shadow-lg">
        {!failed.street ? (
          <img
            src={floodStreetImg}
            alt="Monsoon waterlogging along an arterial city road"
            referrerPolicy="no-referrer"
            onError={() => markFailed('street')}
            className="w-full h-full object-cover opacity-80 dark:opacity-75"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#111317]/20 to-[#111317]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#111317]/20 dark:to-[#0B0C0F]/40" />
      </div>

      {/* Right storm drain grate frame at ~80% opacity */}
      <div className="hidden md:block absolute top-16 bottom-12 right-4 lg:right-8 w-[34%] max-w-[440px] rounded-2xl overflow-hidden border border-white/50 dark:border-[#242832] shadow-lg">
        {!failed.drain ? (
          <img
            src={stormDrainImg}
            alt="Roadside municipal storm drain grate carrying rainwater runoff"
            referrerPolicy="no-referrer"
            onError={() => markFailed('drain')}
            className="w-full h-full object-cover opacity-80 dark:opacity-75"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#111317]/20 to-[#111317]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#111317]/20 dark:to-[#0B0C0F]/40" />
      </div>

      {/* Studio contrast scrim + subtle warm-peach/lavender radial accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111317]/20 via-[#111317]/10 to-[#111317]/30 dark:from-[#0B0C0F]/45 dark:via-[#0B0C0F]/30 dark:to-[#0B0C0F]/55" />
      <div className="studio-iridescent-glow absolute inset-0 opacity-75" />
    </div>
  );
}

export function DedicatedLoginPage({ initialPortal }: { initialPortal: 'citizen' | 'authority' }) {
  const {
    lang,
    setLang,
    activeView,
    setActiveView,
    setPostLoginRedirect,
    postLoginRedirect,
    citizenUser,
    authorityUser,
    signInCitizen,
    signInCitizenByPhone,
    signOutCitizen,
    signInAuthority,
    signOutAuthority,
    addToast,
  } = useStore();

  const copy = LOGIN_COPY[lang];

  const portal: 'citizen' | 'authority' =
    activeView === 'authority-login' ? 'authority' : activeView === 'citizen-login' ? 'citizen' : initialPortal;

  // Citizen state
  const [citizenMode, setCitizenMode] = useState<'signin' | 'signup'>('signin');
  const [phone, setPhone] = useState(citizenUser?.phone || '');
  const [name, setName] = useState(citizenUser?.name || '');
  const [address, setAddress] = useState(citizenUser?.address || '');
  const [wardNo, setWardNo] = useState<string>(citizenUser?.wardNo ? String(citizenUser.wardNo) : '');

  // Authority state
  const [selectedRole, setSelectedRole] = useState<'ward_engineer' | 'command_authority'>('ward_engineer');
  const [department, setDepartment] = useState<'MCG' | 'GMDA' | 'NHAI'>('MCG');
  const [officerName, setOfficerName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showTroubleHelp, setShowTroubleHelp] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalDocTab | null>(null);

  const handleBackToMap = () => {
    setPostLoginRedirect(null);
    setActiveView('map');
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      addToast(copy.toastInvalidPhone, 'warning');
      return;
    }
    const normalizedPhone = digits.slice(-10);

    if (citizenMode === 'signin') {
      const existing = signInCitizenByPhone(normalizedPhone);
      if (existing) return;

      setCitizenMode('signup');
      addToast(copy.toastNewPhone, 'info');
      return;
    }

    if (address.trim().length < 5) {
      addToast(copy.toastAddressRequired, 'warning');
      return;
    }

    signInCitizen({
      name: name.trim() || `${copy.defaultResidentPrefix} (${normalizedPhone.slice(-4)})`,
      phone: normalizedPhone,
      address: address.trim(),
      wardNo: wardNo ? Number(wardNo) : undefined,
    });
  };

  const fillAuthorityDemo = (roleChoice: 'ward_engineer' | 'command_authority') => {
    setSelectedRole(roleChoice);
    setDepartment('MCG');
    if (roleChoice === 'ward_engineer') {
      setOfficerName(lang === 'hi' ? 'श्री संदीप हुड्डा (JE, वार्ड 20)' : 'Sh. Sandeep Hooda (JE, Ward 20)');
      setEmployeeId('MCG-JE-204');
      setPasscode('MCG-2025');
    } else {
      setOfficerName(lang === 'hi' ? 'श्री नईम हुसैन (कमांड AE)' : 'Sh. Naim Hussain (Command AE)');
      setEmployeeId('MCG-CMD-001');
      setPasscode('GFC-ADMIN');
    }
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !passcode.trim()) {
      addToast(copy.toastEmpRequired, 'warning');
      return;
    }

    const expectedPass = selectedRole === 'command_authority' ? 'GFC-ADMIN' : 'MCG-2025';
    if (passcode.trim().toUpperCase() !== expectedPass && passcode.trim().length < 4) {
      addToast(copy.toastInvalidPasscode, 'error');
      return;
    }

    signInAuthority({
      name:
        officerName.trim() ||
        (selectedRole === 'command_authority' ? copy.defaultCommandOfficer : copy.defaultWardEngineer),
      employeeId: employeeId.trim().toUpperCase(),
      role: selectedRole,
      department,
    });
  };

  const redirectReason =
    postLoginRedirect === 'report'
      ? copy.redirectReport
      : postLoginRedirect === 'alerts'
        ? copy.redirectAlerts
        : null;

  return (
    <div className="h-screen w-full flex flex-col justify-between bg-[#F3F4F6] dark:bg-[#0B0C0F] text-[#111317] dark:text-[#F4F4F6] relative overflow-hidden">
      <FloodPhotoBackdrop />

      {/* Top Bar matching Studio Pearl / Graphite Theme */}
      <header className="relative z-20 w-full max-w-[1320px] mx-auto px-4 sm:px-8 pt-3 pb-1 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3 rounded-full bg-white/92 dark:bg-[#16191F]/92 backdrop-blur-md pl-2 pr-4 py-1.5 border border-[#E6E7EC] dark:border-[#242832] shadow-[0_2px_10px_rgba(17,19,23,0.06)]">
          <button
            type="button"
            onClick={handleBackToMap}
            className="inline-flex items-center gap-2 text-left whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            <span className="w-7 h-7 rounded-full bg-[#111317] dark:bg-[#F4F4F6] text-white dark:text-[#111317] flex items-center justify-center shrink-0">
              <Droplets size={14} />
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {t('app.name', lang)}
            </span>
          </button>
          <span className="hidden sm:inline-block h-4 w-px bg-[#E6E7EC] dark:bg-[#282C36]" />
          <a
            href={`tel:${MCG_OFFICIAL_CHANNELS.helpline}`}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280] dark:text-slate-300 hover:text-[#111317] dark:hover:text-white"
          >
            <span>{copy.helpline} {MCG_OFFICIAL_CHANNELS.helpline}</span>
            <ArrowRight size={11} />
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 rounded-full bg-white/92 dark:bg-[#16191F]/92 backdrop-blur-md px-2 py-1.5 border border-[#E6E7EC] dark:border-[#242832] shadow-[0_2px_10px_rgba(17,19,23,0.06)]">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#23262F] hover:bg-[#E5E7EB] dark:hover:bg-[#2E323D] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] transition-colors cursor-pointer"
            title={copy.switchLanguage}
            aria-label={copy.switchLanguage}
          >
            <Globe size={14} className="shrink-0 text-[#111317] dark:text-[#F4F4F6]" />
            <span>{copy.toggleLabel}</span>
          </button>

          {portal === 'citizen' && (
            <button
              type="button"
              onClick={() => setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')}
              className="px-2 text-xs font-semibold text-[#6B7280] dark:text-slate-300 hover:text-[#111317] dark:hover:text-white whitespace-nowrap"
            >
              {citizenMode === 'signin' ? copy.signUp : copy.signIn}
            </button>
          )}

          <button
            type="button"
            onClick={handleBackToMap}
            className="px-3.5 py-1.5 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {copy.backToMap}
          </button>
        </div>
      </header>

      {/* Centered Card Fitting Single Viewport (Zero Page Scroll) */}
      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-1.5">
        <div className="w-full max-w-[420px] rounded-2xl bg-white/95 dark:bg-[#16191F]/95 backdrop-blur-md border border-[#EAECEF] dark:border-[#242832] shadow-[0_14px_45px_rgba(17,19,23,0.12)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.55)] p-5 sm:p-6 space-y-3.5">
          {/* Card Heading */}
          <div className="text-center space-y-1">
            {redirectReason && (
              <p className="text-[11px] font-semibold text-[#111317] dark:text-[#E4E4E7]">
                {redirectReason}
              </p>
            )}
            <h1 className="text-xl font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6]">
              {portal === 'authority'
                ? copy.authorityTitle
                : citizenMode === 'signin'
                  ? copy.citizenSignInTitle
                  : copy.citizenSignUpTitle}
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-snug max-w-[310px] mx-auto">
              {portal === 'authority'
                ? copy.authoritySubtitle
                : citizenMode === 'signin'
                  ? copy.citizenSignInSubtitle
                  : copy.citizenSignUpSubtitle}
            </p>
          </div>

          {portal === 'citizen' ? (
            citizenUser ? (
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 size={18} />
                  <span>
                    {copy.signedInAs} {citizenUser.name}
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] dark:text-slate-300">
                  +91 {citizenUser.phone} · {localizeLocationName(citizenUser.address, lang)}
                  {citizenUser.wardNo ? ` · ${formatWardLabel(citizenUser.wardNo, lang)}` : ''}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('report')}
                    className="flex-1 py-2.5 px-3 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold"
                  >
                    {copy.reportFlooding}
                  </button>
                  <button
                    type="button"
                    onClick={signOutCitizen}
                    className="py-2.5 px-4 rounded-full border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#1B1E25] text-[#111317] dark:text-[#F4F4F6] text-xs font-semibold"
                  >
                    {copy.signOut}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCitizenSubmit} className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-[#6B7280]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={copy.enterPhone}
                    className="w-full pl-12 pr-10 py-2.5 rounded-xl text-sm border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                  />
                  <Circle
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D1D5DB] dark:text-slate-600"
                  />
                </div>

                {citizenMode === 'signup' && (
                  <>
                    <div className="relative">
                      <MapPin
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={copy.quickAddress}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={copy.yourNameOptional}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                      />
                      <select
                        value={wardNo}
                        onChange={(e) => setWardNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                      >
                        <option value="">{copy.wardOptional}</option>
                        {Array.from({ length: 36 }, (_, idx) => idx + 1).map((w) => (
                          <option key={w} value={w}>
                            {formatWardLabel(w, lang)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')
                    }
                    className="text-xs font-semibold text-[#111317] dark:text-[#E4E4E7] hover:underline"
                  >
                    {citizenMode === 'signin'
                      ? copy.newResidentPrompt
                      : copy.alreadyRegisteredPrompt}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-sm font-semibold transition-colors shadow-xs"
                >
                  {citizenMode === 'signin' ? copy.signIn : copy.signUpContinue}
                </button>
              </form>
            )
          ) : authorityUser ? (
            <div className="p-4 rounded-2xl border border-[#EAECEF] bg-[#FAFAFB] dark:bg-[#1B1E25] dark:border-[#242832] space-y-3">
              <p className="text-sm font-bold text-[#111317] dark:text-[#F4F4F6]">
                {copy.activeOfficer} {authorityUser.name}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-slate-300">
                {copy.idLabel} <span className="font-mono font-semibold">{authorityUser.employeeId}</span> ·{' '}
                {authorityUser.department}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('dispatch')}
                  className="flex-1 py-2.5 px-3 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-xs font-semibold"
                >
                  {copy.openActionQueue}
                </button>
                <button
                  type="button"
                  onClick={signOutAuthority}
                  className="py-2.5 px-4 rounded-full border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#16191F] text-[#111317] dark:text-[#F4F4F6] text-xs font-semibold"
                >
                  {copy.signOut}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthoritySubmit} className="space-y-2.5">
              {/* Role & Department Compact Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ward_engineer')}
                  className={`py-1.5 px-3 rounded-full border text-xs font-semibold transition-colors ${
                    selectedRole === 'ward_engineer'
                      ? 'border-transparent bg-[#111317] text-white dark:bg-[#F4F4F6] dark:text-[#111317]'
                      : 'border-[#EAECEF] dark:border-[#282C36] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
                  }`}
                >
                  {copy.wardEngineerJe}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('command_authority')}
                  className={`py-1.5 px-3 rounded-full border text-xs font-semibold transition-colors ${
                    selectedRole === 'command_authority'
                      ? 'border-transparent bg-[#111317] text-white dark:bg-[#F4F4F6] dark:text-[#111317]'
                      : 'border-[#EAECEF] dark:border-[#282C36] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
                  }`}
                >
                  {copy.commandAe}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as 'MCG' | 'GMDA' | 'NHAI')}
                  aria-label={copy.departmentAria}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                >
                  <option value="MCG">MCG</option>
                  <option value="GMDA">GMDA</option>
                  <option value="NHAI">NHAI</option>
                </select>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder={copy.officerNameOptional}
                  className="col-span-2 px-3 py-2 rounded-xl text-xs border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={copy.enterEmployeeId}
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-sm font-mono border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:font-sans placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                />
                <BadgeCheck
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D1D5DB] dark:text-slate-600"
                />
              </div>

              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={copy.passcodePlaceholder}
                  className="w-full px-3.5 pr-14 py-2.5 rounded-xl text-sm border border-[#EAECEF] dark:border-[#282C36] bg-[#FAFAFB] dark:bg-[#111317] text-[#111317] dark:text-[#F4F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111317] dark:focus:ring-[#F4F4F6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280] dark:text-slate-300 hover:text-[#111317] dark:hover:text-white"
                >
                  {showPasscode ? copy.hide : copy.show}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowTroubleHelp((v) => !v)}
                  className="text-xs font-semibold text-[#111317] dark:text-[#E4E4E7] hover:underline"
                >
                  {copy.troubleSignIn}
                </button>
                {showTroubleHelp && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillAuthorityDemo('ward_engineer')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F3F4F6] dark:bg-[#23262F] border border-[#E6E7EC] dark:border-[#282C36] hover:bg-[#E5E7EB] dark:hover:bg-[#2E323D]"
                    >
                      {copy.jeDemo}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillAuthorityDemo('command_authority')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F3F4F6] dark:bg-[#23262F] border border-[#E6E7EC] dark:border-[#282C36] hover:bg-[#E5E7EB] dark:hover:bg-[#2E323D]"
                    >
                      {copy.aeDemo}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#111317] hover:bg-[#23262F] dark:bg-[#F4F4F6] dark:hover:bg-white text-white dark:text-[#111317] text-sm font-semibold transition-colors shadow-xs"
              >
                {copy.signIn}
              </button>
            </form>
          )}

          {/* Divider & Portal Switcher */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
              <div className="flex-1 h-px bg-[#EAECEF] dark:bg-[#242832]" />
              <span>{copy.orSignInWith}</span>
              <div className="flex-1 h-px bg-[#EAECEF] dark:bg-[#242832]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveView('citizen-login')}
                className={`py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  portal === 'citizen'
                    ? 'border-[#111317] dark:border-[#F4F4F6] bg-[#FAFAFB] dark:bg-[#23262F] text-[#111317] dark:text-[#F4F4F6]'
                    : 'border-[#EAECEF] dark:border-[#282C36] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
                }`}
              >
                <Phone size={13} />
                <span>{copy.residentPhone}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('authority-login')}
                className={`py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  portal === 'authority'
                    ? 'border-[#111317] dark:border-[#F4F4F6] bg-[#FAFAFB] dark:bg-[#23262F] text-[#111317] dark:text-[#F4F4F6]'
                    : 'border-[#EAECEF] dark:border-[#282C36] text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
                }`}
              >
                <ShieldCheck size={13} />
                <span>{copy.staffId}</span>
              </button>
            </div>

            <p className="text-center text-xs text-[#6B7280] dark:text-slate-400">
              {portal === 'citizen' ? (
                <>
                  {citizenMode === 'signin' ? copy.noAccount : copy.alreadyRegistered}
                  <button
                    type="button"
                    onClick={() =>
                      setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')
                    }
                    className="font-bold text-[#111317] dark:text-[#F4F4F6] hover:underline"
                  >
                    {citizenMode === 'signin' ? copy.signUpNow : copy.signIn}
                  </button>
                </>
              ) : (
                <>
                  {copy.justCheckingMap}
                  <button
                    type="button"
                    onClick={handleBackToMap}
                    className="font-bold text-[#111317] dark:text-[#F4F4F6] hover:underline"
                  >
                    {copy.continueWithoutLogin}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Footer with legible frosted pill */}
      <footer className="relative z-10 py-2.5 flex justify-center px-4 shrink-0">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full bg-white/90 dark:bg-[#16191F]/90 backdrop-blur-md px-4 py-1 text-[11px] text-[#6B7280] dark:text-slate-300 border border-[#E6E7EC] dark:border-[#242832] shadow-xs">
          <span>{t('app.name', lang)}</span>
          <span className="text-[#D1D5DB] dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={handleBackToMap}
            className="font-medium hover:text-[#111317] dark:hover:text-white transition-colors"
          >
            {copy.publicMapFooter}
          </button>
          <span className="text-[#D1D5DB] dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setLegalTab('privacy')}
            className="font-medium hover:text-[#111317] dark:hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            {copy.privacyPolicy}
          </button>
          <span className="text-[#D1D5DB] dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setLegalTab('terms')}
            className="font-medium hover:text-[#111317] dark:hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            {copy.termsConditions}
          </button>
        </div>
      </footer>

      <LegalModal
        open={legalTab !== null}
        initialTab={legalTab ?? 'privacy'}
        lang={lang}
        onChangeTab={setLegalTab}
        onClose={() => setLegalTab(null)}
      />
    </div>
  );
}

export function CitizenLoginView() {
  return <DedicatedLoginPage initialPortal="citizen" />;
}

export function AuthorityLoginView() {
  return <DedicatedLoginPage initialPortal="authority" />;
}
