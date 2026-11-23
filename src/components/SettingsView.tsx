import { ArrowLeft, Sun, Moon, Globe, UserCheck, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';

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
  } = useStore();

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

      {/* Signed-in Session Info */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Access</h2>

        {citizenUser ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <UserCheck size={16} className="text-teal-700 dark:text-teal-400" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {citizenUser.name} · +91 {citizenUser.phone}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {citizenUser.address}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutCitizen}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>
        ) : authorityUser ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-[#0B3D6B] dark:text-blue-400" />
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
            <button
              type="button"
              onClick={signOutAuthority}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveView('citizen-login')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Resident Sign In (Phone)
            </button>
            <button
              type="button"
              onClick={() => setActiveView('authority-login')}
              className="px-3.5 py-2 rounded-lg bg-[#0B3D6B] text-white text-xs font-semibold hover:bg-[#093055]"
            >
              Authority Sign In (Employee ID)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
