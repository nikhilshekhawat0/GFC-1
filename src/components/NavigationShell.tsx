import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useStore, type Screen, type Role } from '../store/useStore';
import { Menu, ChevronLeft, ChevronRight, ChevronDown, Droplets, Search, Settings } from 'lucide-react';
import { AvatarDropdown } from './ui/Dropdown';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Scroll detection for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      } else if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevScreen, nextScreen]);

  // Swipe gesture handling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isTransitioning || mobileMenuOpen) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, [isTransitioning, mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    
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

  // Menu items for official roles
  const officialMenuItems = [
    { label: lang === 'en' ? 'Risk Map' : 'जोखिम मानचित्र', screen: 'risk-map' as Screen },
    { 
      label: lang === 'en' ? 'Operations' : 'संचालन', 
      dropdown: [
        { label: lang === 'en' ? 'Action List' : 'कार्रवाई सूची', screen: 'action-list' as Screen },
        { label: lang === 'en' ? 'Sensor Health' : 'सेंसर स्थिति', screen: 'sensor-health' as Screen },
        { label: lang === 'en' ? 'Network Feeds' : 'नेटवर्क फ़ीड', screen: 'network' as Screen },
      ]
    },
    { 
      label: lang === 'en' ? 'Governance' : 'शासन', 
      dropdown: [
        { label: lang === 'en' ? 'Audit Log' : 'ऑडिट लॉग', screen: 'audit-log' as Screen },
      ]
    },
    { label: lang === 'en' ? 'Executive' : 'कार्यकारी', screen: 'executive-summary' as Screen },
  ];

  // Menu items for citizen
  const citizenMenuItems = [
    { label: lang === 'en' ? 'Home' : 'होम', screen: 'citizen-home' as Screen },
    { label: lang === 'en' ? 'Check Route' : 'मार्ग जाँचें', screen: 'public-route-check' as Screen },
    { label: lang === 'en' ? 'Alerts' : 'अलर्ट', screen: 'public-alerts' as Screen },
    { label: lang === 'en' ? 'Report' : 'रिपोर्ट', screen: 'public-report' as Screen },
  ];

  const menuItems = isOfficial ? officialMenuItems : citizenMenuItems;

  const isMenuItemActive = (item: typeof menuItems[0]) => {
    if ('screen' in item) {
      return currentScreen === item.screen;
    }
    if ('dropdown' in item) {
      return item.dropdown.some(d => currentScreen === d.screen);
    }
    return false;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Skip to content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
        Skip to content
      </a>

      {/* Menu Bar - Flat, Assistant Style */}
      <header 
        className={`fixed top-0 left-0 right-0 bg-white z-50 transition-shadow duration-200 ${
          isScrolled ? 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : ''
        }`}
        style={{ 
          height: '48px',
          borderBottom: '1px solid #EAECEF'
        }}
        role="banner"
      >
        <div className="h-full flex items-center justify-between px-4">
          {/* Left Cluster */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => navigateTo(isOfficial ? 'risk-map' : 'citizen-home', 'backward')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label={lang === 'en' ? 'Go to home' : 'होम पर जाएं'}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Droplets size={20} className="text-primary" />
              </div>
              <span className="hidden sm:block text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                {t('app.name', lang)}
              </span>
            </button>

            {/* Desktop Menu Items */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main">
              {menuItems.map((item, idx) => {
                const isActive = isMenuItemActive(item);
                
                if ('dropdown' in item && item.dropdown) {
                  return (
                    <DropdownMenu.Root key={idx}>
                      <DropdownMenu.Trigger asChild>
                        <button
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                              ? 'bg-[#F4F6F8] text-text-primary' 
                              : 'text-text-secondary hover:bg-[#F4F6F8] hover:text-text-primary'
                          }`}
                          aria-haspopup="menu"
                        >
                          {item.label}
                          <ChevronDown size={12} className="transition-transform" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="start"
                          sideOffset={4}
                          className="bg-white rounded-[10px] border border-[#EAECEF] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-1.5 min-w-[180px] z-[60]"
                        >
                          {item.dropdown.map((dropdownItem, dIdx) => (
                            <DropdownMenu.Item
                              key={dIdx}
                              onSelect={() => navigateTo(dropdownItem.screen, 'forward')}
                              className="flex items-center px-2.5 py-2 rounded-md text-sm text-text-primary hover:bg-[#F4F6F8] cursor-pointer outline-none transition-colors"
                            >
                              {dropdownItem.label}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  );
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.screen!, 'forward')}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#F4F6F8] text-text-primary' 
                        : 'text-text-secondary hover:bg-[#F4F6F8] hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Cluster */}
          <div className="flex items-center gap-2">
            {/* Prev/Next Buttons */}
            <div className="hidden md:flex items-center gap-0.5">
              <button
                onClick={() => prevScreen && navigateTo(prevScreen, 'backward')}
                disabled={!prevScreen}
                className="p-1.5 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                aria-label={prevScreen ? `Previous screen: ${getScreenLabel(prevScreen, lang)}` : 'You are at the start'}
                title={prevScreen ? `Previous: ${getScreenLabel(prevScreen, lang)}` : 'You are at the start'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => nextScreen && navigateTo(nextScreen, 'forward')}
                disabled={!nextScreen}
                className="p-1.5 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                aria-label={nextScreen ? `Next screen: ${getScreenLabel(nextScreen, lang)}` : 'You are at the end'}
                title={nextScreen ? `Next: ${getScreenLabel(nextScreen, lang)}` : 'You are at the end'}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Event Pill */}
            {isOfficial && (
              <div className="hidden sm:flex items-center gap-2 h-[26px] px-2.5 rounded-full bg-[#F4F6F8] border border-[#EAECEF] hover:bg-[#EDF0F3] transition-colors">
                <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                {activeRiskFilter ? (
                  <>
                    <span className="text-xs font-medium text-text-primary">
                      {t(`risk.${activeRiskFilter}`, lang)} only
                    </span>
                    <button
                      onClick={() => setActiveRiskFilter(null)}
                      className="text-text-secondary hover:text-text-primary text-xs"
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
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-[13px] text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-[#F4F6F8] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>

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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-[55] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] md:hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-y-auto">
            <div className="p-4">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-6">
                <Droplets size={20} className="text-primary" />
                <span className="text-[15px] font-semibold text-text-primary">
                  {t('app.name', lang)}
                </span>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {menuItems.map((item, idx) => {
                  const isActive = isMenuItemActive(item);
                  
                  if ('dropdown' in item && item.dropdown) {
                    return (
                      <div key={idx} className="space-y-1">
                        <div className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive ? 'bg-[#F4F6F8] text-text-primary' : 'text-text-secondary'
                        }`}>
                          {item.label}
                        </div>
                        <div className="ml-4 space-y-1">
                          {item.dropdown.map((dropdownItem, dIdx) => (
                            <button
                              key={dIdx}
                              onClick={() => navigateTo(dropdownItem.screen, 'forward')}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentScreen === dropdownItem.screen
                                  ? 'bg-[#F4F6F8] text-text-primary'
                                  : 'text-text-secondary hover:bg-[#F4F6F8] hover:text-text-primary'
                              }`}
                            >
                              {dropdownItem.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => navigateTo(item.screen!, 'forward')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#F4F6F8] text-text-primary' 
                          : 'text-text-secondary hover:bg-[#F4F6F8] hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile-only items */}
              <div className="mt-6 pt-6 border-t border-[#EAECEF] space-y-2">
                {isOfficial && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                    <span className="text-xs font-medium text-text-primary">
                      {activeRiskFilter 
                        ? `${t(`risk.${activeRiskFilter}`, lang)} only`
                        : `${rainfallMm}mm · 6h`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Hint Toast */}
      {showNavHint && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-[fadeInUp_200ms_ease-out]">
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
        id="main-content"
        className="flex-1 overflow-auto focus:outline-none"
        style={{ 
          marginTop: '48px',
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

      {/* Mobile Bottom Bar for Prev/Next */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAECEF] z-40 flex items-center justify-between px-4" style={{ height: '52px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          onClick={() => prevScreen && navigateTo(prevScreen, 'backward')}
          disabled={!prevScreen}
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
