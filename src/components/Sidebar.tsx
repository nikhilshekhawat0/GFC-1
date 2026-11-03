import React, { useState, useEffect } from 'react';
import { useStore, type Screen, type Role } from '../store/useStore';
import { 
  Map, ListChecks, Activity, Network, History, Bell, LayoutDashboard, 
  HelpCircle, Settings, ChevronLeft, ChevronRight, ChevronDown, Menu,
  type LucideIcon
} from 'lucide-react';
import { t } from '../i18n/translations';
import { Tooltip } from './ui/Tooltip';

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  screen: Screen;
  badge?: string;
  badgeTone?: 'default' | 'warning' | 'danger' | 'info';
}

interface SidebarSection {
  header: string;
  items: SidebarItem[];
}

interface SidebarProps {
  role: Role;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Sidebar({ role, currentScreen, onNavigate, collapsed, onCollapsedChange }: SidebarProps & { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const { lang, activeRiskFilter } = useStore();
  
  const setCollapsed = (value: boolean) => {
    onCollapsedChange(value);
  };
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('gfc_sidebar_sections');
    return saved ? JSON.parse(saved) : {};
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get role label
  const getRoleLabel = () => {
    switch (role) {
      case 'ward_engineer': return lang === 'en' ? 'MCG · Ward Engineer' : 'MCG · वार्ड अभियंता';
      case 'control_room': return lang === 'en' ? 'MCG · Control Room' : 'MCG · नियंत्रण कक्ष';
      case 'commissioner': return lang === 'en' ? 'MCG · Commissioner' : 'MCG · आयुक्त';
      case 'ddma_officer': return lang === 'en' ? 'DDMA · Officer' : 'DDMA · अधिकारी';
      default: return '';
    }
  };

  // Sidebar structure
  const sections: SidebarSection[] = [
    {
      header: lang === 'en' ? 'MONITOR' : 'निगरानी',
      items: [
        { 
          label: lang === 'en' ? 'Risk Map' : 'जोखिम मानचित्र', 
          icon: Map, 
          screen: 'risk-map',
          badge: activeRiskFilter ? '●' : undefined
        },
        { 
          label: lang === 'en' ? 'Action List' : 'कार्रवाई सूची', 
          icon: ListChecks, 
          screen: 'action-list',
          badge: '12'
        },
        { 
          label: lang === 'en' ? 'Sensor Health' : 'सेंसर स्थिति', 
          icon: Activity, 
          screen: 'sensor-health',
          badge: '3',
          badgeTone: 'warning'
        },
      ]
    },
    {
      header: lang === 'en' ? 'COORDINATE' : 'समन्वय',
      items: [
        { 
          label: lang === 'en' ? 'Network Feeds' : 'नेटवर्क फ़ीड', 
          icon: Network, 
          screen: 'network',
          badge: '4/7',
          badgeTone: 'warning'
        },
        { 
          label: lang === 'en' ? 'Audit Log' : 'ऑडिट लॉग', 
          icon: History, 
          screen: 'audit-log'
        },
        { 
          label: lang === 'en' ? 'Alerts' : 'अलर्ट', 
          icon: Bell, 
          screen: 'citizen-home' // Placeholder - would be a dedicated alerts screen
        },
      ]
    },
    {
      header: lang === 'en' ? 'REPORT' : 'रिपोर्ट',
      items: [
        { 
          label: lang === 'en' ? 'Executive View' : 'कार्यकारी दृश्य', 
          icon: LayoutDashboard, 
          screen: 'executive-summary'
        },
      ]
    }
  ];

  // Filter sections based on role
  const visibleSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Ward engineer doesn't see network
      if (role === 'ward_engineer' && item.screen === 'network') return false;
      // Commissioner doesn't see action-list, sensor-health, network
      if (role === 'commissioner' && ['action-list', 'sensor-health', 'network'].includes(item.screen)) return false;
      return true;
    })
  })).filter(section => section.items.length > 0);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('gfc_sidebar_collapsed', String(collapsed));
    onCollapsedChange(collapsed);
  }, [collapsed]);

  // Persist section collapse state
  useEffect(() => {
    localStorage.setItem('gfc_sidebar_sections', JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  // Keyboard shortcut for collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setCollapsed(!collapsed);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentScreen]);

  const toggleSection = (header: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [header]: !prev[header]
    }));
  };

  const getBadgeStyle = (tone?: string) => {
    switch (tone) {
      case 'warning': return 'bg-[#FEF3C7] text-[#92400E]';
      case 'danger': return 'bg-[#FEE2E2] text-[#991B1B]';
      case 'info': return 'bg-[#DBEAFE] text-[#1E40AF]';
      default: return 'bg-[#E8EBEF] text-[#5A6475]';
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav 
      aria-label="Primary"
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Zone 1: Top Header - Fixed */}
      <div className="flex-shrink-0 px-3 py-4 border-b border-[#EAECEF]">
        {collapsed && !isMobile ? (
          // Collapsed: Just logo mark centered
          <div className="flex justify-center items-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="#0B3D6B"/>
                <path d="M12 16C12 16 9 18 9 20C9 21.1 9.9 22 11 22H13C14.1 22 15 21.1 15 20C15 18 12 16 12 16Z" fill="#0B3D6B"/>
              </svg>
            </div>
          </div>
        ) : (
          // Expanded: Workspace name + Help/Settings icons
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-[13px] font-semibold text-text-primary truncate">
                {t('app.name', lang)}
              </h2>
              <p className="text-[11px] text-[#8A93A0] mt-0.5 truncate">
                {getRoleLabel()}
              </p>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <Tooltip content={lang === 'en' ? 'Help' : 'सहायता'}>
                  <button 
                    onClick={() => onNavigate('help')}
                    className="w-8 h-8 flex justify-center items-center rounded-lg text-[#6B7280] hover:bg-[#F0F2F5] hover:text-[#1A1F2B] transition-colors"
                    aria-label={lang === 'en' ? 'Help' : 'सहायता'}
                  >
                    <HelpCircle size={18} strokeWidth={1.75} />
                  </button>
                </Tooltip>
                <Tooltip content={lang === 'en' ? 'Settings' : 'सेटिंग्स'}>
                  <button 
                    className="w-8 h-8 flex justify-center items-center rounded-lg text-[#6B7280] hover:bg-[#F0F2F5] hover:text-[#1A1F2B] transition-colors"
                    aria-label={lang === 'en' ? 'Settings' : 'सेटिंग्स'}
                  >
                    <Settings size={18} strokeWidth={1.75} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 2: Scrollable Navigation - Middle */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {collapsed && !isMobile ? (
          // Collapsed mode: just icons with 48x48 hit areas
          <div className="flex flex-col items-center gap-1 py-2">
            {visibleSections.map((section, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="h-4" />} {/* 16px spacer between sections */}
                {section.items.map((item, itemIdx) => {
                  const isActive = currentScreen === item.screen;
                  const Icon = item.icon;
                  
                  return (
                    <Tooltip key={itemIdx} content={item.label}>
                      <button
                        onClick={() => onNavigate(item.screen)}
                        className={`
                          relative w-12 h-12 flex justify-center items-center rounded-lg
                          transition-colors
                          ${isActive 
                            ? 'bg-[#EEF2F7] text-[#0B3D6B]' 
                            : 'text-[#6B7280] hover:bg-[#F0F2F5] hover:text-[#1A1F2B]'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                      >
                        <Icon size={20} strokeWidth={1.75} />
                        
                        {/* Badge dot anchored to top-right of button */}
                        {item.badge && (
                          <div 
                            className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-[#FAFBFC] ${
                              item.badgeTone === 'warning' ? 'bg-[#F59E0B]' :
                              item.badgeTone === 'danger' ? 'bg-[#EF4444]' :
                              'bg-[#6B7280]'
                            }`}
                          />
                        )}
                      </button>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          // Expanded mode: full labels and badges
          visibleSections.map((section, idx) => {
            const isCollapsed = collapsedSections[section.header];
            
            return (
              <div key={idx} className="mb-2">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.header)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase text-[#8A93A0] hover:text-text-primary transition-colors"
                  aria-expanded={!isCollapsed}
                >
                  <h3>{section.header}</h3>
                  <ChevronDown 
                    size={12} 
                    className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`} 
                  />
                </button>

                {/* Section Items */}
                {!isCollapsed && (
                  <ul className="space-y-0.5">
                    {section.items.map((item, itemIdx) => {
                      const isActive = currentScreen === item.screen;
                      const Icon = item.icon;
                      
                      return (
                        <li key={itemIdx}>
                          <button
                            onClick={() => onNavigate(item.screen)}
                            className={`
                              w-full flex items-center gap-2.5 h-9 rounded-lg text-[13.5px] font-medium transition-colors relative
                              px-2.5
                              ${isActive 
                                ? 'bg-[#EEF2F7] text-primary font-semibold' 
                                : 'text-[#3F4754] hover:bg-[#F0F2F5] hover:text-text-primary'
                              }
                            `}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />
                            )}
                            
                            <Icon 
                              size={16} 
                              className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-[#6B7280]'}`}
                            />
                            
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`
                                flex-shrink-0 h-[18px] min-w-[20px] px-1.5 rounded-md flex items-center justify-center
                                text-[11px] font-semibold tabular-nums
                                ${getBadgeStyle(item.badgeTone)}
                              `}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Zone 3: Bottom Footer - Fixed */}
      <div className="flex-shrink-0 px-2 py-3 border-t border-[#EAECEF] flex justify-center">
        {collapsed && !isMobile ? (
          // Collapsed: Just expand button
          <Tooltip content="Expand sidebar">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-12 h-12 flex justify-center items-center rounded-lg text-[#8A93A0] hover:bg-[#F0F2F5] hover:text-[#1A1F2B] transition-colors"
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              <ChevronRight size={20} strokeWidth={1.75} />
            </button>
          </Tooltip>
        ) : (
          // Expanded: Collapse button with label
          !isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-2.5 h-9 rounded-lg text-[13.5px] font-medium text-[#3F4754] hover:bg-[#F0F2F5] hover:text-text-primary transition-colors px-2.5"
              aria-label="Collapse sidebar"
              aria-expanded={true}
            >
              <ChevronLeft size={16} className="text-[#6B7280]" />
              <span>{lang === 'en' ? 'Collapse' : 'संक्षिप्त करें'}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-12 bottom-0 bg-[#FAFBFC] border-r border-[#EAECEF] z-30
          transition-[width] duration-[180ms] ease-in-out
          ${collapsed ? 'w-16' : 'w-60'}
        `}
        style={{ willChange: 'width' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-[rgba(15,23,42,0.35)] z-40 md:hidden animate-[fadeIn_150ms_ease-out]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-12 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-[slideInLeft_220ms_ease-out] overflow-y-auto">
            <SidebarContent isMobile />
          </aside>
        </>
      )}

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white border border-[#EAECEF] shadow-sm hover:bg-[#F4F6F8] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </>
  );
}
