# Spec Revision 8: Collapsed Sidebar State Fix

## Overview
Fixed visual and layout bugs in the collapsed sidebar state, improving touch targets, icon centering, badge positioning, and footer layout.

## Key Changes

### 1. Width Adjustment
- **Previous**: 56px collapsed width
- **New**: 64px collapsed width
- **Reason**: Allows proper 48x48 touch targets with breathing room

### 2. Workspace Header Fix
- **Previous**: Chunky dark blue "GFC" box
- **New**: Clean 24px droplet/drain icon in #0B3D6B, centered
- **Layout**: 
  - Height: 56px
  - Margin-bottom: 8px
  - Border-bottom: 1px solid #EAECEF
  - Centered with flexbox

### 3. Navigation Items Fix
- **Hit areas**: 48x48px (increased from 36px)
- **Icon size**: 20px (increased from 16px)
- **Icon stroke**: 1.75px width
- **Centering**: Perfectly centered horizontally and vertically
- **Container**: Flex column, center aligned, 4px gap, 8px vertical padding
- **Active state**: 
  - Solid background: #EEF2F7
  - Color: #0B3D6B
  - **Removed**: Left accent bar (doesn't fit in collapsed mode)
- **Hover state**: 
  - Background: #F0F2F5
  - Color: #1A1F2B
- **Transition**: 100ms for background and color

### 4. Badge Dots Fix
- **Previous**: Floating dots positioned relative to icon
- **New**: Anchored to top-right corner of 48x48 button
- **Position**: 
  - `position: absolute`
  - `top: 10px` (2.5rem in Tailwind)
  - `right: 10px` (2.5rem in Tailwind)
- **Size**: 8px diameter (w-2 h-2)
- **Border**: 2px solid #FAFBFC (matches sidebar background)
- **Tones**:
  - Default: #6B7280
  - Warning: #F59E0B
  - Danger: #EF4444

### 5. Footer and Collapse Toggle Fix
- **Previous**: Expand/collapse toggle mixed with footer items
- **New**: Dedicated vertical stack layout
- **Structure**:
  1. Help icon (48x48)
  2. Settings icon (48x48)
  3. Divider (border-top)
  4. Expand button (48x48) at very bottom
- **Container**:
  - `margin-top: auto` (pushes to bottom)
  - Flex column, center aligned
  - 4px gap between items
  - Padding-bottom: 16px
  - Padding-top: 12px
  - Border-top: 1px solid #EAECEF
- **Expand button**:
  - Size: 48x48px
  - Icon: ChevronRight, 20px
  - Color: #8A93A0
  - Hover: background #F0F2F5, color #1A1F2B
  - Border-radius: 8px

### 6. Section Headers in Collapsed Mode
- **Behavior**: Completely removed from DOM (not just hidden)
- **Replacement**: 16px vertical spacer div between sections
- **Reason**: Cleaner visual hierarchy in collapsed state

### 7. Main Content Margin Update
- **Expanded sidebar**: margin-left: 15rem (240px)
- **Collapsed sidebar**: margin-left: 4rem (64px)
- **Transition**: 180ms ease-in-out for smooth animation
- **Coordination**: Sidebar collapsed state lifted to NavigationShell for proper margin calculation

## Implementation Details

### State Management
- Sidebar collapsed state is now managed by NavigationShell
- Passed to Sidebar via props: `collapsed` and `onCollapsedChange`
- Persisted to localStorage: `gfc_sidebar_collapsed`
- Main content margin dynamically adjusts based on sidebar state

### CSS Structure
```tsx
// Sidebar wrapper
<aside className="w-16"> // 64px when collapsed

// Workspace header (collapsed)
<div className="flex justify-center items-center h-14 mb-2 border-b border-[#EAECEF]">
  <div className="w-6 h-6">
    <svg>...</svg> // 24px droplet icon
  </div>
</div>

// Navigation items (collapsed)
<button className="relative w-12 h-12 flex justify-center items-center rounded-lg">
  <Icon size={20} strokeWidth={1.75} />
  {badge && (
    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-[#FAFBFC]" />
  )}
</button>

// Footer (collapsed)
<div className="mt-auto flex flex-col items-center gap-1 pb-4 pt-3 border-t border-[#EAECEF]">
  <button className="w-12 h-12">Help</button>
  <button className="w-12 h-12">Settings</button>
  <button className="w-12 h-12">Expand</button>
</div>
```

## Visual Improvements

### Before
- ❌ Chunky "GFC" box looked out of place
- ❌ Icons not perfectly centered
- ❌ Small 36px touch targets
- ❌ Badge dots floating away from icons
- ❌ Expand button mixed with footer items
- ❌ Section headers visible in collapsed mode

### After
- ✅ Clean droplet icon matches app branding
- ✅ Perfect icon centering with 48x48 hit areas
- ✅ Larger 20px icons for better visibility
- ✅ Badge dots anchored to button corners
- ✅ Dedicated expand button at bottom
- ✅ Section headers removed, replaced with spacers

## Accessibility

### Touch Targets
- All interactive elements: 48x48px minimum
- Meets WCAG 2.1 AAA touch target requirements
- Proper spacing between items (4px gap)

### Visual Indicators
- Active state: solid background (no left bar)
- Hover state: clear visual feedback
- Badge dots: high contrast with border
- Tooltips: show labels on hover in collapsed mode

### Keyboard Navigation
- Tab order preserved in collapsed mode
- Focus rings visible on all interactive elements
- Enter/Space activates buttons
- Cmd/Ctrl+B toggles sidebar

## Responsive Behavior

### Desktop (≥ 640px)
- Sidebar visible with 64px collapsed width
- Smooth width transition (180ms)
- Main content margin adjusts dynamically
- Tooltips on hover for collapsed items

### Mobile (< 640px)
- Sidebar hidden by default
- Hamburger opens 280px drawer
- Full labels and badges visible in drawer
- No collapsed state on mobile

## Build Status
✅ Production build successful  
✅ Zero TypeScript errors  
✅ Bundle size: 956 KB (273 KB gzipped)  
✅ CSS: 46 KB (9 KB gzipped)  

## Acceptance Criteria Met

✅ Sidebar width increased to 64px for better touch targets  
✅ Workspace header shows only droplet icon, centered  
✅ Navigation items have 48x48 hit areas with 20px icons  
✅ Icons perfectly centered horizontally and vertically  
✅ Active state uses solid background, no left accent bar  
✅ Badge dots anchored to top-right of 48x48 button  
✅ Footer stacked vertically: Help, Settings, divider, Expand button  
✅ Section headers removed from DOM in collapsed mode  
✅ 16px vertical spacers between sections in collapsed mode  
✅ Main content margin adjusts to 64px when sidebar collapsed  
✅ Smooth transitions for sidebar width and content margin  

## Demo Script Additions

1. **Collapse Sidebar**
   - Press Cmd/Ctrl+B
   - Observe clean droplet icon in header
   - Note 48x48 touch targets for all items
   - See badge dots anchored to button corners

2. **Navigate in Collapsed Mode**
   - Hover over icons - tooltips appear
   - Click Risk Map - active state shows solid background
   - Note no left accent bar in collapsed mode

3. **Footer Layout**
   - Scroll to bottom of sidebar
   - See Help, Settings, divider, Expand button stacked
   - Click Expand - sidebar smoothly expands to 240px

4. **Main Content**
   - Observe content margin adjusts with sidebar
   - No overlap or gap when collapsing/expanding
   - Smooth 180ms transition

## Technical Notes

### State Lifting
- Sidebar collapsed state moved from Sidebar to NavigationShell
- Allows main content margin to respond to sidebar state
- Prevents layout jank during transitions

### DOM Optimization
- Section headers completely removed in collapsed mode
- Reduces DOM complexity
- Cleaner visual hierarchy

### CSS Optimization
- Using Tailwind utility classes for consistency
- Minimal custom CSS
- Responsive design with mobile-first approach

## Future Enhancements
- Add keyboard shortcuts display in tooltips
- Implement drag-to-resize sidebar width
- Add notification badges with real-time updates
- Implement sidebar item reordering
- Add collapsible sub-menus for complex navigation
