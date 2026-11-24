import { Settings, ShieldCheck, LogOut, Map as MapIcon } from 'lucide-react';
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
      {/* Zone 1: Brand Title & Uploaded Logo */}
      <button
        type="button"
        onClick={() => setActiveView('map')}
        className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none group"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0D2621] border border-[#0D2621]/20 dark:border-[#2D3834] shadow-xs transition-transform group-hover:scale-105 shrink-0">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-11-24_at_19.35.38_86e861e1.jpeg"
            alt="SAHIBI emblem"
            className="w-full h-full object-cover object-center scale-[1.78]"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm sm:text-[15px] font-bold tracking-[0.06em] text-[#0D2621] dark:text-[#F4F4F6] whitespace-nowrap">
            {t('app.name', lang)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] text-[#6B7280] dark:text-slate-400 mt-0.5 whitespace-nowrap">
            {t('app.tagline', lang)}
          </span>
        </div>
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
              ? 'bg-[#0D2621] dark:bg-[#F4F4F6] border-[#0D2621] dark:border-[#F4F4F6] text-white dark:text-[#111317]'
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
