import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  disabled?: boolean;
}

export function Tooltip({ content, children, disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 12
        });
        setIsVisible(true);
      }
    }, 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Adjust position if tooltip would overflow
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedTop = position.top;
      let adjustedLeft = position.left;

      // Check right overflow
      if (adjustedLeft + tooltipRect.width > viewportWidth) {
        adjustedLeft = viewportWidth - tooltipRect.width - 8;
      }

      // Check bottom overflow
      if (adjustedTop + tooltipRect.height / 2 > viewportHeight) {
        adjustedTop = viewportHeight - tooltipRect.height / 2 - 8;
      }

      // Check top overflow
      if (adjustedTop - tooltipRect.height / 2 < 0) {
        adjustedTop = tooltipRect.height / 2 + 8;
      }

      if (adjustedTop !== position.top || adjustedLeft !== position.left) {
        setPosition({ top: adjustedTop, left: adjustedLeft });
      }
    }
  }, [isVisible, position]);

  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {React.cloneElement(children, {
          'aria-describedby': isVisible ? tooltipId : undefined,
        } as any)}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed pointer-events-none z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
            animation: 'tooltipFadeIn 100ms ease-out'
          }}
        >
          <div className="relative">
            {/* Arrow */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full"
              style={{
                width: 0,
                height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderRight: '4px solid #1A1F2B'
              }}
            />
            {/* Tooltip content */}
            <div
              className="bg-[#1A1F2B] text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap"
              style={{
                maxWidth: '200px'
              }}
            >
              {content}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
