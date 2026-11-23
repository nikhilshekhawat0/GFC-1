import { Settings, ShieldCheck, LogOut, Droplets } from 'lucide-react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';

export function TopBar() {
  const {
    lang,
    role,
    setRole,
    activeView,
    setActiveView,
    authorityUser,
    signOutAuthority,
  } = useStore();

  const isAuthoritySession = role !== 'citizen' && Boolean(authorityUser);

  return (
    <header className="h-14 shrink-0 px-4 lg:px-6 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B111D] z-40">
      {/* Zone 1: Brand Title */}
      <button
        type="button"
        onClick={() => setActiveView('map')}
        className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none"
      >
        <div className="w-8 h-8 rounded-lg bg-[#0B3D6B] text-white flex items-center justify-center">
          <Droplets size={17} />
        </div>
        <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none whitespace-nowrap">
          {t('app.name', lang)}
        </span>
      </button>

      {/* Zone 2 & 3: Clean Right Actions (Authority Switcher when active + Settings) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {isAuthoritySession && authorityUser && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              Public Map
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-[#0B3D6B] dark:text-blue-200 whitespace-nowrap">
              <ShieldCheck size={14} />
              <span className="max-w-[160px] truncate">
                {authorityUser.name} · {authorityUser.employeeId}
              </span>
              <button
                type="button"
                onClick={signOutAuthority}
                className="ml-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                title="Sign out of Authority Portal"
                aria-label="Sign out of Authority Portal"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setActiveView(activeView === 'settings' ? 'map' : 'settings')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'settings'
              ? 'bg-[#0B3D6B] border-[#0B3D6B] text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          aria-label="Open Settings"
        >
          <Settings size={14} />
          <span className="hidden sm:inline">{t('view.settings', lang)}</span>
        </button>
      </div>
    </header>
  );
}
