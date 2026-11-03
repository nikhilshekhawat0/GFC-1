import React, { useState, useRef, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  group?: string;
  danger?: boolean;
  disabled?: boolean;
  isHeader?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  minWidth?: number;
  className?: string;
}

export function Dropdown({ trigger, options, value, onChange, align = 'start', sideOffset = 4, minWidth, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);

  // Group options
  const groups = new Map<string, DropdownOption[]>();
  const ungrouped: DropdownOption[] = [];
  options.forEach(opt => {
    if (opt.group) {
      if (!groups.has(opt.group)) groups.set(opt.group, []);
      groups.get(opt.group)!.push(opt);
    } else {
      ungrouped.push(opt);
    }
  });

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={sideOffset}
          className={`
            bg-white rounded-xl shadow-lg border border-border
            py-2 z-[9999] min-w-[200px] max-h-[320px] overflow-y-auto
            animate-[fadeInUp_150ms_ease-out]
            ${className}
          `}
          style={minWidth ? { minWidth } : undefined}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Ungrouped items */}
          {ungrouped.map((opt, i) => {
            if (opt.isHeader) {
              return (
                <div key={i} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  {opt.label}
                </div>
              );
            }
            if (opt.value === '__divider__') {
              return <DropdownMenu.Separator key={i} className="h-px bg-border my-1" />;
            }
            return (
              <DropdownMenu.Item
                key={opt.value}
                disabled={opt.disabled}
                onSelect={() => onChange?.(opt.value)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer
                  outline-none select-none transition-colors
                  ${opt.danger ? 'text-risk-high hover:bg-red-50' : 'text-text-primary hover:bg-[#F0F4FA]'}
                  ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${value === opt.value ? 'border-l-2 border-l-primary bg-[#F0F4FA]' : ''}
                `}
              >
                {opt.icon && <span className="flex-shrink-0 w-5">{opt.icon}</span>}
                <span className="flex-1 truncate">{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-primary flex-shrink-0" />}
              </DropdownMenu.Item>
            );
          })}

          {/* Grouped items */}
          {Array.from(groups.entries()).map(([groupName, items]) => (
            <React.Fragment key={groupName}>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                {groupName}
              </div>
              {items.map(opt => (
                <DropdownMenu.Item
                  key={opt.value}
                  disabled={opt.disabled}
                  onSelect={() => onChange?.(opt.value)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer
                    outline-none select-none transition-colors
                    ${opt.danger ? 'text-risk-high hover:bg-red-50' : 'text-text-primary hover:bg-[#F0F4FA]'}
                    ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${value === opt.value ? 'border-l-2 border-l-primary bg-[#F0F4FA]' : ''}
                  `}
                >
                  {opt.icon && <span className="flex-shrink-0 w-5">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {value === opt.value && <Check size={14} className="text-primary flex-shrink-0" />}
                </DropdownMenu.Item>
              ))}
            </React.Fragment>
          ))}

          {options.length === 0 && (
            <div className="px-3 py-4 text-sm text-text-secondary text-center">
              No options available
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Pre-built dropdown triggers
export function DropdownButton({ label, icon, open, className = '' }: { label: string; icon?: React.ReactNode; open?: boolean; className?: string }) {
  return (
    <button className={`
      flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-[10px]
      border border-border bg-white text-sm font-medium text-text-primary
      hover:bg-background transition-colors
      ${className}
    `}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 text-left truncate">{label}</span>
      <ChevronDown size={14} className={`text-text-secondary transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function AvatarDropdown({ email, name, picture, onSignOut }: { email: string; name: string; picture: string; onSignOut: () => void }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dropdown
      align="end"
      trigger={
        <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-focus-ring transition-all overflow-hidden">
          {picture ? (
            <img src={picture} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </button>
      }
      options={[
        { value: '__header__', label: `Signed in as`, isHeader: true },
        { value: '__email__', label: email, disabled: true },
        { value: '__divider1__', label: '---' },
        { value: 'profile', label: 'Profile' },
        { value: 'language', label: 'Language' },
        { value: '__divider2__', label: '---' },
        { value: 'signout', label: 'Sign out', danger: true },
      ]}
      onChange={(v) => {
        if (v === 'signout') onSignOut();
      }}
    />
  );
}
