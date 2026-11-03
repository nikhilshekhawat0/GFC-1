# Spec Revision 7: Sidebar Navigation Implementation

## Overview
Implemented a modern, flat sidebar navigation system that replaces the top bar menu items and provides a more intuitive navigation experience for official users.

## Key Changes

### 1. Sidebar Component (`src/components/Sidebar.tsx`)
- **Fixed left sidebar** for official roles (ward_engineer, control_room, commissioner, ddma_officer)
- **240px expanded** / **56px collapsed** width with smooth transitions
- **Three sections**: MONITOR, COORDINATE, REPORT
- **Collapsible sections** with persistent state (localStorage: `gfc_sidebar_sections`)
- **Collapsible sidebar** with persistent state (localStorage: `gfc_sidebar_collapsed`)
- **Keyboard shortcut**: Cmd/Ctrl+B to toggle sidebar
- **Badges** with different tones (default, warning, danger, info)
- **Active state** with left accent bar and light primary background
- **Mobile drawer** variant for screens < 640px
- **Tooltips** on collapsed icons

### 2. Navigation Shell Updates (`src/components/NavigationShell.tsx`)
- **Removed menu items** from top bar for official roles
- **Top bar now contains**: logo, breadcrumb, prev/next buttons, event pill, language toggle, avatar
- **Citizen menu items** remain in top bar (no sidebar for citizens)
- **Updated screen order** to match sidebar: Risk Map → Action List → Sensor Health → Network Feeds → Audit Log → Alerts → Executive View
- **Main content margin** adjusts based on sidebar state
- **Removed old mobile drawer** (now handled by Sidebar component)

### 3. Sidebar Structure

#### MONITOR Section
- **Risk Map** - with active filter indicator
- **Action List** - badge: "12"
- **Sensor Health** - badge: "3" (warning tone)

#### COORDINATE Section
- **Network Feeds** - badge: "4/7" (warning tone)
- **Audit Log**
- **Alerts**

#### REPORT Section
- **Executive View**

#### Footer
- **Help**
- **Settings**

### 4. Design Specifications

#### Item Style
- Height: 36px
- Padding: 0 10px
- Border radius: 8px
- Font: 13.5px, weight 500
- Icon size: 16px
- Hover: background #F0F2F5
- Active: background #EEF2F7, color #0B3D6B, weight 600
- Active indicator: 2px vertical bar in #0B3D6B

#### Badge Style
- Height: 18px
- Min width: 20px
- Padding: 0 6px
- Border radius: 6px
- Font: 11px, weight 600, tabular-nums
- Tones:
  - Default: bg #E8EBEF, text #5A6475
  - Warning: bg #FEF3C7, text #92400E
  - Danger: bg #FEE2E2, text #991B1B
  - Info: bg #DBEAFE, text #1E40AF

#### Section Header Style
- Font: 11px, weight 600, letter-spacing 0.06em, uppercase
- Color: #8A93A0
- Padding: 14px 10px 6px
- Collapsible with chevron indicator

### 5. Responsive Behavior

#### Desktop (≥ 640px)
- Sidebar visible by default
- Can be collapsed to 56px (icon-only mode)
- Tooltips on hover when collapsed
- Smooth width transition (180ms)

#### Mobile (< 640px)
- Sidebar hidden by default
- Hamburger button in top bar opens drawer
- Drawer width: 280px
- Overlay: rgba(15,23,42,0.35)
- Slide-in animation: 220ms ease-out
- Close on: overlay tap, swipe left, or Esc key

### 6. Accessibility Features
- `role="banner"` on top bar
- `role="navigation"` with `aria-label="Primary"` on sidebar
- `aria-current="page"` on active items
- `aria-expanded` on collapse buttons
- `aria-haspopup="menu"` on dropdown triggers
- Keyboard navigation: Tab, Arrow keys, Enter, Esc
- Skip-to-content link
- Focus ring: 2px #1A5C9E, 2px offset

### 7. State Management
- **Sidebar collapsed state**: localStorage `gfc_sidebar_collapsed`
- **Section collapsed state**: localStorage `gfc_sidebar_sections`
- **Active route**: Zustand store `currentScreen`
- **Risk filter**: Zustand store `activeRiskFilter`

### 8. Navigation Coordination
- Sidebar is the **single source of navigation** for official roles
- Prev/next buttons in top bar follow sidebar order
- Swipe gestures follow sidebar order
- Keyboard shortcuts (ArrowLeft/ArrowRight) follow sidebar order
- All routes remain directly reachable via sidebar

### 9. Citizen Variant
- Citizens **do not see the sidebar**
- Public screens retain flat menu bar from revision 6
- Menu items: Home, Check Route, Alerts, Report

## Acceptance Criteria Met

✅ 240px fixed sidebar with workspace header, three sections, and footer  
✅ Item rows are 36px with 16px icons, 13.5px labels, and appropriate badges  
✅ Collapse button (or Cmd/Ctrl+B) narrows to 56px with icon-only rows and tooltips  
✅ Mobile <640px: sidebar hidden, hamburger opens off-canvas drawer  
✅ Menu items removed from top bar for official roles  
✅ Top bar contains only logo, breadcrumb, prev/next, event pill, language, avatar  
✅ Prev/next and swipe follow sidebar order  
✅ Citizens never see sidebar  
✅ Active state uses light primary tint and 2px left accent bar  
✅ Section headers collapse independently with persistent state  

## Technical Implementation

### Files Modified
1. `src/components/Sidebar.tsx` - New sidebar component
2. `src/components/NavigationShell.tsx` - Integrated sidebar, removed menu items
3. `src/store/useStore.ts` - No changes needed (existing state sufficient)

### Files Created
1. `src/components/Sidebar.tsx` - Complete sidebar implementation

### Dependencies Used
- `lucide-react` - Icons
- `zustand` - State management (existing)
- React hooks - useState, useEffect, useCallback, useRef

## Build Status
✅ Production build successful  
✅ Zero TypeScript errors  
✅ Bundle size: 954 KB (272 KB gzipped)  
✅ CSS: 46 KB (9 KB gzipped)  

## Demo Script Additions

1. **Login as Ward Engineer**
   - Observe sidebar with three sections
   - Note badges on Action List (12) and Sensor Health (3)

2. **Navigate via Sidebar**
   - Click "Risk Map" - observe active state with left accent bar
   - Click "Action List" - smooth transition
   - Click "Sensor Health" - note warning badge

3. **Collapse Sidebar**
   - Press Cmd/Ctrl+B - sidebar narrows to 56px
   - Hover over icons - tooltips appear
   - Press Cmd/Ctrl+B again - sidebar expands

4. **Collapse Sections**
   - Click "MONITOR" header - section collapses
   - Refresh page - section remains collapsed (persistent)

5. **Mobile Experience**
   - Resize to mobile width
   - Tap hamburger button - drawer slides in
   - Tap overlay - drawer closes
   - Swipe left on drawer - closes

6. **Navigation Flow**
   - Use prev/next buttons in top bar
   - Observe they follow sidebar order
   - Use swipe gestures - same order

7. **Citizen View**
   - Switch to citizen role
   - Observe no sidebar
   - Menu items remain in top bar

## Future Enhancements
- Add search functionality in sidebar
- Implement drag-to-reorder for sidebar items
- Add keyboard shortcuts display
- Implement sidebar item customization per user
- Add notification badges with real-time updates
