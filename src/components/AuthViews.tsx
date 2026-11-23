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
import floodStreetImg from '../assets/images/flood_street_monsoon_1795437233671.jpg';
import stormDrainImg from '../assets/images/storm_drain_culvert_1795437234057.jpg';
import underpassDrainImg from '../assets/images/underpass_rain_drainage_1795437233672.jpg';

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
      {/* Subtle full-bleed underpass & drainage photo base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/60 dark:from-[#070B12] dark:via-[#090F1A] dark:to-[#0B1628]" />
      {!failed.underpass && (
        <img
          src={underpassDrainImg}
          alt="Urban road underpass and storm drain during monsoon rainfall"
          referrerPolicy="no-referrer"
          onError={() => markFailed('underpass')}
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] dark:opacity-[0.11] grayscale-[25%]"
        />
      )}

      {/* Left low-opacity flooded street frame */}
      <div className="hidden md:block absolute top-16 bottom-12 left-4 lg:left-8 w-[34%] max-w-[440px] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        {!failed.street ? (
          <img
            src={floodStreetImg}
            alt="Monsoon waterlogging along an arterial city road"
            referrerPolicy="no-referrer"
            onError={() => markFailed('street')}
            className="w-full h-full object-cover opacity-[0.18] dark:opacity-[0.14] grayscale-[20%]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-blue-900/10 to-slate-900/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/40 to-slate-50 dark:via-[#070B12]/50 dark:to-[#070B12]" />
      </div>

      {/* Right low-opacity storm drain grate frame */}
      <div className="hidden md:block absolute top-16 bottom-12 right-4 lg:right-8 w-[34%] max-w-[440px] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        {!failed.drain ? (
          <img
            src={stormDrainImg}
            alt="Roadside municipal storm drain grate carrying rainwater runoff"
            referrerPolicy="no-referrer"
            onError={() => markFailed('drain')}
            className="w-full h-full object-cover opacity-[0.20] dark:opacity-[0.16] grayscale-[15%]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-800/10 to-blue-900/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-50/40 to-slate-50 dark:via-[#070B12]/50 dark:to-[#070B12]" />
      </div>

      {/* Soft center vignette so the login card stays crisp and high-contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.88)_0%,rgba(248,250,252,0.52)_55%,rgba(248,250,252,0.75)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(7,11,18,0.85)_0%,rgba(7,11,18,0.58)_55%,rgba(7,11,18,0.8)_100%)]" />
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

  const handleBackToMap = () => {
    setPostLoginRedirect(null);
    setActiveView('map');
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      addToast('Please enter a valid 10-digit phone number', 'warning');
      return;
    }
    const normalizedPhone = digits.slice(-10);

    if (citizenMode === 'signin') {
      const existing = signInCitizenByPhone(normalizedPhone);
      if (existing) return;

      setCitizenMode('signup');
      addToast('New phone number — add your quick Gurugram address to finish sign up', 'info');
      return;
    }

    if (address.trim().length < 5) {
      addToast('Please enter a quick Gurugram address (House / Street / Sector)', 'warning');
      return;
    }

    signInCitizen({
      name: name.trim() || `Resident (${normalizedPhone.slice(-4)})`,
      phone: normalizedPhone,
      address: address.trim(),
      wardNo: wardNo ? Number(wardNo) : undefined,
    });
  };

  const fillAuthorityDemo = (roleChoice: 'ward_engineer' | 'command_authority') => {
    setSelectedRole(roleChoice);
    setDepartment('MCG');
    if (roleChoice === 'ward_engineer') {
      setOfficerName('Sh. Sandeep Hooda (JE, Ward 20)');
      setEmployeeId('MCG-JE-204');
      setPasscode('MCG-2025');
    } else {
      setOfficerName('Sh. Naim Hussain (Command AE)');
      setEmployeeId('MCG-CMD-001');
      setPasscode('GFC-ADMIN');
    }
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !passcode.trim()) {
      addToast('Please enter your Employee ID and passcode', 'warning');
      return;
    }

    const expectedPass = selectedRole === 'command_authority' ? 'GFC-ADMIN' : 'MCG-2025';
    if (passcode.trim().toUpperCase() !== expectedPass && passcode.trim().length < 4) {
      addToast('Invalid authority passcode. Use quick fill below or check your officer PIN.', 'error');
      return;
    }

    signInAuthority({
      name:
        officerName.trim() ||
        (selectedRole === 'command_authority' ? 'MCG Command Officer' : 'MCG Ward Engineer'),
      employeeId: employeeId.trim().toUpperCase(),
      role: selectedRole,
      department,
    });
  };

  const redirectReason =
    postLoginRedirect === 'report'
      ? 'Sign in to register your street waterlogging report'
      : postLoginRedirect === 'alerts'
        ? 'Sign in to activate ward rain alerts'
        : null;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 relative overflow-y-auto">
      <FloodPhotoBackdrop />

      {/* Top Bar matching App Theme */}
      <header className="relative z-10 w-full max-w-[1320px] mx-auto px-6 sm:px-10 pt-5 pb-3 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={handleBackToMap}
            className="inline-flex items-center gap-2.5 text-left whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-[#0B3D6B] text-white flex items-center justify-center shrink-0">
              <Droplets size={17} />
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gurgaon Flood Help
            </span>
          </button>
          <div className="w-16 h-px bg-slate-300 dark:bg-slate-700" />
          <a
            href={`tel:${MCG_OFFICIAL_CHANNELS.helpline}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#0B3D6B] dark:hover:text-blue-300"
          >
            <span>MCG Helpline {MCG_OFFICIAL_CHANNELS.helpline}</span>
            <ArrowRight size={11} />
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 pt-1">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Switch Language"
            aria-label="Switch Language"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{lang === 'en' ? 'EN' : 'हिं'}</span>
          </button>

          {portal === 'citizen' && (
            <button
              type="button"
              onClick={() => setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0B3D6B] dark:hover:text-blue-300 hover:underline whitespace-nowrap"
            >
              {citizenMode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          )}

          <button
            type="button"
            onClick={handleBackToMap}
            className="px-4 py-2 rounded-lg bg-[#0B3D6B] hover:bg-[#093055] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
          >
            Back to Map
          </button>
        </div>
      </header>

      {/* Centered Card Matching Classic White / Dark Mode Theme */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[430px] rounded-2xl bg-white/95 dark:bg-[#0D131F]/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-[0_14px_45px_rgba(11,61,107,0.08)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.45)] p-7 sm:p-9 space-y-6">
          {/* Card Heading */}
          <div className="text-center space-y-1.5">
            {redirectReason && (
              <p className="text-[11px] font-semibold text-[#0B3D6B] dark:text-blue-400">
                {redirectReason}
              </p>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {portal === 'authority'
                ? 'Authority Login'
                : citizenMode === 'signin'
                  ? 'Resident Login'
                  : 'Resident Sign Up'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[295px] mx-auto">
              {portal === 'authority'
                ? 'Enter your Employee ID details to sign in to the MCG operations desk'
                : citizenMode === 'signin'
                  ? 'Enter your phone number to sign in and submit flood reports'
                  : 'Enter your phone number & quick Gurugram address to register reports'}
            </p>
          </div>

          {portal === 'citizen' ? (
            citizenUser ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Signed in as {citizenUser.name}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  +91 {citizenUser.phone} · {citizenUser.address}
                  {citizenUser.wardNo ? ` · Ward ${citizenUser.wardNo}` : ''}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('report')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Report Flooding
                  </button>
                  <button
                    type="button"
                    onClick={signOutCitizen}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCitizenSubmit} className="space-y-3.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Phone No"
                    className="w-full pl-12 pr-10 py-3 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                  />
                  <Circle
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"
                  />
                </div>

                {citizenMode === 'signup' && (
                  <>
                    <div className="relative">
                      <MapPin
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Quick Address (House / Street / Sector) *"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                      />
                      <select
                        value={wardNo}
                        onChange={(e) => setWardNo(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                      >
                        <option value="">Ward (optional)</option>
                        {Array.from({ length: 36 }, (_, idx) => idx + 1).map((w) => (
                          <option key={w} value={w}>
                            Ward {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')
                    }
                    className="text-xs font-semibold text-[#0B3D6B] dark:text-blue-400 hover:underline"
                  >
                    {citizenMode === 'signin'
                      ? 'New resident? Add quick address'
                      : 'Already registered? Sign in with phone'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  {citizenMode === 'signin' ? 'Sign in' : 'Sign up & Continue'}
                </button>
              </form>
            )
          ) : authorityUser ? (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-800 space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Officer: {authorityUser.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                ID: <span className="font-mono font-semibold">{authorityUser.employeeId}</span> ·{' '}
                {authorityUser.department}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('dispatch')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Open Action Queue
                </button>
                <button
                  type="button"
                  onClick={signOutAuthority}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthoritySubmit} className="space-y-3.5">
              {/* Role & Department Compact Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ward_engineer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    selectedRole === 'ward_engineer'
                      ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white dark:border-blue-500 dark:bg-blue-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Ward Engineer (JE)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('command_authority')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    selectedRole === 'command_authority'
                      ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white dark:border-blue-500 dark:bg-blue-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Command AE
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as 'MCG' | 'GMDA' | 'NHAI')}
                  aria-label="Department"
                  className="px-2.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                >
                  <option value="MCG">MCG</option>
                  <option value="GMDA">GMDA</option>
                  <option value="NHAI">NHAI</option>
                </select>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="Officer name (optional)"
                  className="col-span-2 px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter Employee ID (e.g. MCG-JE-204)"
                  className="w-full px-4 pr-10 py-3 rounded-xl text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                />
                <BadgeCheck
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"
                />
              </div>

              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode"
                  className="w-full px-4 pr-14 py-3 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPasscode ? 'Hide' : 'Show'}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowTroubleHelp((v) => !v)}
                  className="text-xs font-semibold text-[#0B3D6B] dark:text-blue-400 hover:underline"
                >
                  Having trouble signing in?
                </button>
              </div>

              {showTroubleHelp && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Demo Officer Credentials (1-Click Fill)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fillAuthorityDemo('ward_engineer')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Ward JE · MCG-JE-204
                    </button>
                    <button
                      type="button"
                      onClick={() => fillAuthorityDemo('command_authority')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Command AE · MCG-CMD-001
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-xs"
              >
                Sign in
              </button>
            </form>
          )}

          {/* Divider & Portal Switcher */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span>Or Sign in with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveView('citizen-login')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  portal === 'citizen'
                    ? 'border-[#0B3D6B] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-[#0B3D6B] dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Phone size={13} />
                <span>Resident Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('authority-login')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  portal === 'authority'
                    ? 'border-[#0B3D6B] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-[#0B3D6B] dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Staff ID</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              {portal === 'citizen' ? (
                <>
                  {citizenMode === 'signin' ? "Don't have an account? " : 'Already registered? '}
                  <button
                    type="button"
                    onClick={() =>
                      setCitizenMode(citizenMode === 'signin' ? 'signup' : 'signin')
                    }
                    className="font-bold text-[#0B3D6B] dark:text-blue-400 hover:underline"
                  >
                    {citizenMode === 'signin' ? 'Sign up Now' : 'Sign in'}
                  </button>
                </>
              ) : (
                <>
                  Just checking the map?{' '}
                  <button
                    type="button"
                    onClick={handleBackToMap}
                    className="font-bold text-[#0B3D6B] dark:text-blue-400 hover:underline"
                  >
                    Continue without login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>Gurgaon Flood Help</span>
        <span className="mx-2">|</span>
        <button
          type="button"
          onClick={handleBackToMap}
          className="hover:text-[#0B3D6B] dark:hover:text-blue-300 transition-colors"
        >
          Public Map (No Login Required)
        </button>
      </footer>
    </div>
  );
}

export function CitizenLoginView() {
  return <DedicatedLoginPage initialPortal="citizen" />;
}

export function AuthorityLoginView() {
  return <DedicatedLoginPage initialPortal="authority" />;
}
