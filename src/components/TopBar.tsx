import { Settings, ShieldCheck, LogOut, Droplets, Map as MapIcon } from 'lucide-react';
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
    <header className="h-14 shrink-0 px-4 lg:px-6 flex items-center justify-between gap-4 border-b border-[#E6E7EC] dark:border-[#22252D] bg-white/95 dark:bg-[#111317]/95 backdrop-blur-md z-40">
      {/* Zone 1: Brand Title */}
      <button
        type="button"
        onClick={() => setActiveView('map')}
        className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none group"
      >
        <div className="w-8 h-8 rounded-full bg-[#111317] dark:bg-[#F4F4F6] text-white dark:text-[#111317] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
          <Droplets size={16} />
        </div>
        <span className="text-sm sm:text-base font-bold tracking-tight text-[#111317] dark:text-[#F4F4F6] leading-none whitespace-nowrap">
          {t('app.name', lang)}
        </span>
      </button>

      {/* Zone 2 & 3: Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {activeView !== 'map' && (
          <button
            type="button"
            onClick={() => setActiveView('map')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-[#F3F4F6] dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#E7E9EE] dark:hover:bg-[#23262F] transition-colors whitespace-nowrap"
          >
            <MapIcon size={13} />
            <span>{t('view.map', lang)}</span>
          </button>
        )}

        {isAuthoritySession && authorityUser && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F] whitespace-nowrap"
            >
              {lang === 'hi' ? 'सार्वजनिक मानचित्र' : 'Public Map'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F4F6] dark:bg-[#181B20] border border-[#E6E7EC] dark:border-[#282C36] text-xs font-semibold text-[#111317] dark:text-[#F4F4F6] whitespace-nowrap">
              <ShieldCheck size={14} className="text-[#111317] dark:text-[#F4F4F6]" />
              <span className="max-w-[160px] truncate">
                {authorityUser.name} · {authorityUser.employeeId}
              </span>
              <button
                type="button"
                onClick={signOutAuthority}
                className="ml-1 text-[#6B7280] hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'settings'
              ? 'bg-[#111317] dark:bg-[#F4F4F6] border-[#111317] dark:border-[#F4F4F6] text-white dark:text-[#111317]'
              : 'border-[#E6E7EC] dark:border-[#282C36] bg-white dark:bg-[#181B20] text-[#111317] dark:text-[#F4F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#23262F]'
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
