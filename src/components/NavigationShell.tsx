import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore, type Screen, type Role } from '../store/useStore';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { AvatarDropdown, Dropdown } from './ui/Dropdown';
import { t } from '../i18n/translations';

const OFFICIAL_SCREEN_ORDER: Screen[] = [
  'risk-map',
  'action-list',
  'sensor-health',
  'network',
  'audit-log',
  'executive-summary',
];

const CITIZEN_SCREEN_ORDER: Screen[] = [
  'citizen-home',
  'public-route-check',
  'public-alerts',
  'public-report',
];

function getVisibleScreens(role: Role): Screen[] {
  if (role === 'citizen') {
    return CITIZEN_SCREEN_ORDER;
  }
  
  const visible = [...OFFICIAL_SCREEN_ORDER];
  
  // Remove network for ward engineer
  if (role === 'ward_engineer') {
    const idx = visible.indexOf('network');
    if (idx > -1) visible.splice(idx, 1);
  }
  
  // Remove action-list, sensor-health, network for commissioner
  if (role === 'commissioner') {
    ['action-list', 'sensor-health', 'network'].forEach(screen => {
      const idx = visible.indexOf(screen as Screen);
      if (idx > -1) visible.splice(idx, 1);
    });
  }
  
  return visible;
}

function getScreenLabel(screen: Screen, lang: 'en' | 'hi'): string {
  const labels: Record<Screen, string> = {
    'risk-map': lang === 'en' ? 'Risk Map' : 'जोखिम मानचित्र',
    'action-list': lang === 'en' ? 'Action List' : 'कार्रवाई सूची',
    'sensor-health': lang === 'en' ? 'Sensors' : 'सेंसर',
    'network': lang === 'en' ? 'Network' : 'नेटवर्क',
    'audit-log': lang === 'en' ? 'Audit' : 'ऑडिट',
    'executive-summary': lang === 'en' ? 'Executive' : 'कार्यकारी',
    'citizen-home': lang === 'en' ? 'Home' : 'होम',
    'public-route-check': lang === 'en' ? 'Route Check' : 'मार्ग जाँच',
    'public-alerts': lang === 'en' ? 'Alerts' : 'अलर्ट',
    'public-report': lang === 'en' ? 'Report' : 'रिपोर्ट',
    'ward-home': lang === 'en' ? 'Dashboard' : 'डैशबोर्ड',
    'control-room-home': lang === 'en' ? 'Dashboard' : 'डैशबोर्ड',
    'denied': lang === 'en' ? 'Access Denied' : 'पहुँच अस्वीकृत',
  };
  return labels[screen] || screen;
}

interface NavigationShellProps {
  children: React.ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const { lang, setLang, session, logout, currentScreen, setCurrentScreen, rainfallMm, getRiskScores, activeRiskFilter, setActiveRiskFilter } = useStore();
  const [showNavHint, setShowNavHint] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  
  const isOfficial = session && session.role !== 'citizen';
  const visibleScreens = session ? getVisibleScreens(session.role) : [];
  const currentIndex = visibleScreens.indexOf(currentScreen);
  
  const prevScreen = currentIndex > 0 ? visibleScreens[currentIndex - 1] : null;
  const nextScreen = currentIndex < visibleScreens.length - 1 ? visibleScreens[currentIndex + 1] : null;

  // Show navigation hint on first load
  useEffect(() => {
    if (isOfficial && !localStorage.getItem('gfc-nav-hint-shown')) {
      setShowNavHint(true);
      localStorage.setItem('gfc-nav-hint-shown', 'true');
      setTimeout(() => setShowNavHint(false), 5000);
    }
  }, [isOfficial]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
      
      if (e.key === 'ArrowLeft' && (!isInput || e.altKey)) {
        e.preventDefault();
        if (prevScreen) navigateTo(prevScreen, 'backward');
      } else if (e.key === 'ArrowRight' && (!isInput || e.altKey)) {
        e.preventDefault();
        if (nextScreen) navigateTo(nextScreen, 'forward');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevScreen, nextScreen]);

  // Swipe gesture handling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isTransitioning) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, [isTransitioning]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!swipeStartRef.current || isTransitioning) return;
    
    const deltaX = e.clientX - swipeStartRef.current.x;
    const deltaY = Math.abs(e.clientY - swipeStartRef.current.y);
    const deltaTime = Date.now() - swipeStartRef.current.time;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Cancel if too much vertical movement
    if (deltaY > 40) {
      swipeStartRef.current = null;
      return;
    }
    
    // Visual feedback during swipe
    if (mainRef.current) {
      const translateX = Math.min(Math.max(deltaX * 0.3, -100), 100);
      mainRef.current.style.transform = `translateX(${translateX}px)`;
      mainRef.current.style.transition = 'none';
    }
  }, [isTransitioning]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!swipeStartRef.current || isTransitioning) return;
    
    const deltaX = e.clientX - swipeStartRef.current.x;
    const deltaY = Math.abs(e.clientY - swipeStartRef.current.y);
    const deltaTime = Date.now() - swipeStartRef.current.time;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Reset transform
    if (mainRef.current) {
      mainRef.current.style.transition = 'transform 150ms ease-out';
      mainRef.current.style.transform = 'translateX(0)';
    }
    
    // Check if swipe threshold met
    if (Math.abs(deltaX) > 80 && deltaY < 40 && velocity > 0.3) {
      if (deltaX < 0 && nextScreen) {
        navigateTo(nextScreen, 'forward');
      } else if (deltaX > 0 && prevScreen) {
        navigateTo(prevScreen, 'backward');
      }
    }
    
    swipeStartRef.current = null;
  }, [isTransitioning, prevScreen, nextScreen]);

  const navigateTo = useCallback((screen: Screen, direction: 'forward' | 'backward') => {
    if (isTransitioning) return;
    
    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentScreen(screen);
      
      // Move focus to main content
      setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.focus();
        }
      }, 50);
      
      setTimeout(() => {
        setTransitionDirection(null);
        setIsTransitioning(false);
      }, 200);
    }, 180);
  }, [isTransitioning, setCurrentScreen]);

  const riskScores = getRiskScores();
  const highRisk = riskScores.filter(r => r.risk_pct >= 70).length;
  const highestTier = highRisk > 0 ? 'high' : riskScores.filter(r => r.risk_pct >= 50).length > 0 ? 'medium' : 'low';
  const tierColor = highestTier === 'high' ? 'bg-risk-high' : highestTier === 'medium' ? 'bg-risk-medium' : 'bg-risk-low';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Menu Bar */}
      <header 
        className="fixed top-0 left-0 right-0 bg-white border-b border-border z-50 shadow-[0_1px_2px_rgba(11,61,107,0.06)]"
        style={{ height: '56px' }}
        role="banner"
      >
        <div className="h-full flex items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {isOfficial && (
              <button
                onClick={() => {/* Toggle sidebar */}}
                className="p-2 hover:bg-background rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">GFC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-text-primary leading-tight">
                  {t('app.name', lang)}
                </h1>
                <p className="text-xs text-text-secondary leading-tight">
                  {getScreenLabel(currentScreen, lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            {/* Nav Strip */}
            {isOfficial && (
              <nav className="flex items-center gap-1" role="navigation" aria-label="Main screens">
                {visibleScreens.map(screen => (
                  <button
                    key={screen}
                    onClick={() => navigateTo(screen, currentIndex < visibleScreens.indexOf(screen) ? 'forward' : 'backward')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentScreen === screen
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-background'
                    }`}
                  >
                    {getScreenLabel(screen, lang)}
                  </button>
                ))}
              </nav>
            )}

            {/* Prev/Next Buttons */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => prevScreen && navigateTo(prevScreen, 'backward')}
                disabled={!prevScreen}
                className="p-1.5 rounded-lg hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={prevScreen ? `Previous screen: ${getScreenLabel(prevScreen, lang)}` : 'You are at the start'}
                title={prevScreen ? `Previous: ${getScreenLabel(prevScreen, lang)}` : 'You are at the start'}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => nextScreen && navigateTo(nextScreen, 'forward')}
                disabled={!nextScreen}
                className="p-1.5 rounded-lg hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={nextScreen ? `Next screen: ${getScreenLabel(nextScreen, lang)}` : 'You are at the end'}
                title={nextScreen ? `Next: ${getScreenLabel(nextScreen, lang)}` : 'You are at the end'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Event Indicator */}
            {isOfficial && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background">
                <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                {activeRiskFilter ? (
                  <>
                    <span className="text-xs font-medium text-text-primary">
                      Showing {t(`risk.${activeRiskFilter}`, lang)} only
                    </span>
                    <button
                      onClick={() => setActiveRiskFilter(null)}
                      className="text-text-secondary hover:text-text-primary"
                      aria-label="Clear filter"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-medium text-text-primary">
                    {rainfallMm}mm · 6h
                  </span>
                )}
              </div>
            )}

            {/* Language Toggle */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background hover:bg-border transition-colors text-xs font-medium">
                  <span>{lang === 'en' ? 'EN' : 'हिं'}</span>
                </button>
              }
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिंदी' },
              ]}
              value={lang}
              onChange={(v) => setLang(v as 'en' | 'hi')}
              align="end"
            />

            {/* Avatar Menu */}
            {session && (
              <AvatarDropdown
                email={session.email}
                name={session.name}
                picture={session.picture}
                onSignOut={logout}
              />
            )}
          </div>
        </div>
      </header>

      {/* Navigation Hint Toast */}
      {showNavHint && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-[fadeInUp_200ms_ease-out]">
          Use ← → to move between screens. Swipe on mobile.
        </div>
      )}

      {/* Aria Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Now viewing {getScreenLabel(currentScreen, lang)}
      </div>

      {/* Main Content with Swipe Handler */}
      <main
        ref={mainRef}
        className="flex-1 overflow-auto focus:outline-none"
        style={{ 
          marginTop: '56px',
          transition: isTransitioning ? 'opacity 180ms ease-out, transform 180ms ease-out' : 'none',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning 
            ? transitionDirection === 'forward' 
              ? 'translateX(16px)' 
              : 'translateX(-16px)'
            : 'translateX(0)',
        }}
        tabIndex={-1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 flex items-center justify-between px-4" style={{ height: '52px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          onClick={() => prevScreen && navigateTo(prevScreen, 'backward')}
          disabled={!prevScreen}
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <span className="text-xs text-text-secondary">
          {getScreenLabel(currentScreen, lang)}
        </span>
        <button
          onClick={() => nextScreen && navigateTo(nextScreen, 'forward')}
          disabled={!nextScreen}
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
