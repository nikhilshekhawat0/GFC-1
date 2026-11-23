import { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  HardHat,
  UserCheck,
  Phone,
  BadgeCheck,
  Lock,
  Building2,
  CheckCircle2,
  Droplets,
  MapPin,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export function CitizenLoginView() {
  const {
    signInCitizen,
    signInCitizenByPhone,
    setActiveView,
    addToast,
    citizenUser,
    signOutCitizen,
  } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [phone, setPhone] = useState(citizenUser?.phone || '');
  const [name, setName] = useState(citizenUser?.name || '');
  const [address, setAddress] = useState(citizenUser?.address || '');
  const [wardNo, setWardNo] = useState<string>(citizenUser?.wardNo ? String(citizenUser.wardNo) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      addToast('Please enter a valid 10-digit phone number', 'warning');
      return;
    }
    const normalizedPhone = digits.slice(-10);

    if (mode === 'signin') {
      const existing = signInCitizenByPhone(normalizedPhone);
      if (existing) return;

      // New phone number -> prompt for quick address to finish sign-up
      setMode('signup');
      addToast('New phone number — please enter your quick address to finish sign-up', 'info');
      return;
    }

    if (address.trim().length < 5) {
      addToast('Please enter a quick address (house/flat/sector)', 'warning');
      return;
    }

    signInCitizen({
      name: name.trim() || `Resident (${normalizedPhone.slice(-4)})`,
      phone: normalizedPhone,
      address: address.trim(),
      wardNo: wardNo ? Number(wardNo) : undefined,
    });
  };

  return (
    <div className="max-w-lg mx-auto py-6 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <ArrowLeft size={14} />
          Back to Flood Map
        </button>
        <button
          type="button"
          onClick={() => setActiveView('authority-login')}
          className="text-xs font-semibold text-[#0B3D6B] dark:text-blue-400 hover:underline whitespace-nowrap"
        >
          Authority Login (Employee ID) →
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {mode === 'signin' ? 'Resident Sign In' : 'Resident Sign Up'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Sign in with your phone number. New residents just add a quick Gurugram address so ward teams know your area.
            </p>
          </div>
        </div>

        {citizenUser ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 size={18} />
              <span>Signed in as {citizenUser.name}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Phone: +91 {citizenUser.phone} · Address: {citizenUser.address}
              {citizenUser.wardNo ? ` · Ward ${citizenUser.wardNo}` : ''}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveView('report')}
                className="px-4 py-2 rounded-lg bg-[#0B3D6B] text-white text-xs font-semibold hover:bg-[#093055]"
              >
                Report Street Waterlogging
              </button>
              <button
                type="button"
                onClick={signOutCitizen}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Sign In / Sign Up Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-[#0B3D6B] dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In (Phone)
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-[#0B3D6B] dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                New Resident Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-[4.25rem] pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Quick Address (House / Street / Sector) *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. H.No. 42, Block C, Sector 21, Gurugram"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Your Name (optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Ward (optional)
                      </label>
                      <select
                        value={wardNo}
                        onChange={(e) => setWardNo(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B3D6B]"
                      >
                        <option value="">Select Ward</option>
                        {Array.from({ length: 36 }, (_, idx) => idx + 1).map((w) => (
                          <option key={w} value={w}>
                            Ward {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {mode === 'signin' ? 'Sign In with Phone Number' : 'Complete Sign Up & Continue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function AuthorityLoginView() {
  const { signInAuthority, setActiveView, addToast, authorityUser, signOutAuthority } = useStore();
  const [selectedRole, setSelectedRole] = useState<'ward_engineer' | 'command_authority'>('ward_engineer');
  const [department, setDepartment] = useState<'MCG' | 'GMDA' | 'NHAI'>('MCG');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [passcode, setPasscode] = useState('');

  const fillDemo = (roleChoice: 'ward_engineer' | 'command_authority') => {
    setSelectedRole(roleChoice);
    if (roleChoice === 'ward_engineer') {
      setDepartment('MCG');
      setName('Sh. Sandeep Hooda (JE, Ward 20)');
      setEmployeeId('MCG-JE-204');
      setPasscode('MCG-2025');
    } else {
      setDepartment('MCG');
      setName('Sh. Naim Hussain (Command AE)');
      setEmployeeId('MCG-CMD-001');
      setPasscode('GFC-ADMIN');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !passcode.trim()) {
      addToast('Please enter your Employee ID and passcode', 'warning');
      return;
    }

    const expectedPass = selectedRole === 'command_authority' ? 'GFC-ADMIN' : 'MCG-2025';
    if (passcode.trim().toUpperCase() !== expectedPass && passcode.trim().length < 4) {
      addToast('Invalid authority passcode. Use demo fill or check your officer PIN.', 'error');
      return;
    }

    signInAuthority({
      name:
        name.trim() ||
        (selectedRole === 'command_authority' ? 'MCG Command Officer' : 'MCG Ward Engineer'),
      employeeId: employeeId.trim().toUpperCase(),
      role: selectedRole,
      department,
    });
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveView('map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <ArrowLeft size={14} />
          Public Citizen Map
        </button>
        <button
          type="button"
          onClick={() => setActiveView('citizen-login')}
          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap"
        >
          Resident Sign In (Phone) →
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Official Header Strip */}
        <div className="bg-[#0B3D6B] text-white px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                MCG · GMDA · NHAI Staff Portal
              </p>
              <h1 className="text-lg font-bold">Municipal Authority Sign In</h1>
            </div>
          </div>
          <ShieldCheck size={24} className="text-blue-200 shrink-0" />
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {authorityUser ? (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-800 space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Officer Session: {authorityUser.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Employee ID: <span className="font-mono font-semibold">{authorityUser.employeeId}</span> ·{' '}
                {authorityUser.department} (
                {authorityUser.role === 'command_authority' ? 'Command Authority' : 'Ward Engineer'})
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('dispatch')}
                  className="px-4 py-2 rounded-lg bg-[#0B3D6B] text-white text-xs font-semibold"
                >
                  Open Action Queue
                </button>
                <button
                  type="button"
                  onClick={signOutAuthority}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ward_engineer')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'ward_engineer'
                      ? 'border-[#0B3D6B] bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-[#0B3D6B]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <HardHat size={15} className="text-[#0B3D6B] dark:text-blue-400" />
                    <span>Ward Engineer (JE)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Dispatch pumps, update drain clearance & field blockers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('command_authority')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'command_authority'
                      ? 'border-[#0B3D6B] bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-[#0B3D6B]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <ShieldCheck size={15} className="text-[#0B3D6B] dark:text-blue-400" />
                    <span>Command Authority (AE)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    36-ward oversight, priority overrides & monsoon briefings.
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agency / Department
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as 'MCG' | 'GMDA' | 'NHAI')}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    >
                      <option value="MCG">MCG Gurugram</option>
                      <option value="GMDA">GMDA Drainage</option>
                      <option value="NHAI">NHAI Highway</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Officer Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sh. Sandeep Hooda"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID *
                </label>
                <div className="relative">
                  <BadgeCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. MCG-JE-204 or GMDA-AE-112"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authority Passcode *
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter officer PIN / passcode"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B3D6B] hover:bg-[#093055] text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Sign In with Employee ID
              </button>

              {/* Quick Demo Credentials Helper */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Demo Staff Access (1-Click Fill)
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('ward_engineer')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Ward JE · ID: MCG-JE-204
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('command_authority')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Command AE · ID: MCG-CMD-001
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
