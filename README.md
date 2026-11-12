# Gurgaon Flood Command (GFC)

A decision-support web application for the Municipal Corporation of Gurugram (MCG) that converts rainfall forecasts into ranked, time-stamped, auditable pre-event action lists across Gurgaon's waterlogging hotspots.

## 🎯 Overview

GFC transforms reactive flood response into predictive drainage management. The system:
- Analyzes IMD rainfall forecasts and real-time sensor data
- Computes risk scores for 32 registered waterlogging hotspots
- Generates prioritized action lists for field crews
- Provides public-facing risk communication for citizens
- Maintains complete audit trails for all decisions

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand with persistence
- **Maps**: Leaflet with OpenStreetMap
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: Custom navigation shell (no React Router)

### Key Features

#### 1. Navigation Shell (Spec Revision 5)
- **Fixed top menu bar** with app mark, breadcrumb, and navigation controls
- **Prev/Next navigation** via buttons, keyboard shortcuts (← →), and swipe gestures
- **Screen order awareness** - role-based screen sequences
- **Smooth transitions** with horizontal slide animations
- **State preservation** across navigation (filters, scroll position, forms)
- **Mobile bottom bar** for thumb-reachable navigation
- **Accessibility**: ARIA labels, screen reader announcements, reduced motion support

#### 2. Risk Tier Highlight Filter (Spec Revision 3)
- Global filter state shared across Risk Map, Action List, and Sensor Health
- Interactive legend, filter chips, and summary cards
- Map markers dim to 20% opacity for non-matching tiers
- Auto-zoom to matching hotspots with pulsing ring animation
- Topology edge highlighting for drainage network visualization

#### 3. Network Data Feed Status (Spec Revision 4b)
- Agency-wise data feed monitoring (MCG, GMDA, NHAI, etc.)
- Live/Stale/No feed status indicators
- Formal coordination request generation with clipboard copy
- DDMA Officer role for cross-agency coordination

#### 4. Real MCG Register Data (Spec Revision 5 - Data Revision)
- 32 actual waterlogging hotspots from MCG Monsoon Preparedness register
- Junior Engineer and field team contact information
- MCG categories: critical_point, low_lying_area, drainage_block, no_sewer_line
- **Honesty layer**: Visual chips distinguish "modelled" vs "MCG register" data

#### 5. Role-Based Access Control
- **Ward Engineer**: Dashboard, Risk Map, Action List, Sensor Health, Audit Log
- **Control Room**: All Ward Engineer screens + Network
- **Commissioner**: Dashboard, Risk Map, Network, Audit Log, Executive View
- **DDMA Officer**: Dashboard, Risk Map, Network, Audit Log, Executive View
- **Citizen**: Public home, Route Check, Alerts, Report (no login required)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎮 Demo Accounts

### Official Roles (Google OAuth simulated)
- **Ward Engineer**: `ward.engineer@mcg.gov.in`
- **Control Room**: `control.room@mcg.gov.in`
- **Commissioner**: `commissioner@mcg.gov.in`
- **DDMA Officer**: `ddma.officer@gurugram.gov.in`

### Citizen Access
- Click "Continue as citizen" on login screen (no authentication required)

## 📱 Navigation Guide

### Desktop
- **Keyboard**: Use ← → arrow keys to navigate between screens
- **Mouse**: Click prev/next arrows in menu bar
- **Nav Strip**: Click screen chips for direct navigation
- **Input Fields**: Arrow keys work normally; use Alt+← → to force navigation

### Mobile
- **Swipe**: Swipe left/right on main content area
- **Bottom Bar**: Use prev/next buttons at bottom of screen
- **Touch**: All interactions optimized for 48px+ touch targets

### Screen Order
**Official Roles**: Risk Map → Action List → Sensors → Network → Audit → Executive  
**Citizen**: Home → Route Check → Alerts → Report

## 🎨 Design System

### Colors
- Primary: `#0B3D6B` (deep blue)
- Risk High: `#C62828` (red)
- Risk Medium: `#F9A825` (amber)
- Risk Low: `#2E7D32` (green)
- Background: `#F7F9FC` (light gray)

### Typography
- Latin: Inter
- Devanagari: Noto Sans Devanagari
- Base size: 16px with 1.5 line height

### Spacing Scale
4px, 8px, 12px, 16px, 24px, 32px, 48px

## 🌐 Internationalization

Full English/Hindi support with:
- Language toggle in menu bar (persisted in localStorage)
- All UI labels translated
- Sample alert messages in both languages
- Screen reader announcements in active language

## 🔒 Data Transparency

### Honesty Layer
The app clearly distinguishes between:
- **MCG Register Data** (green chip): Official register information (coordinates, categories, contacts)
- **Modelled Data** (gray chip): Computed estimates (topology, population exposure, risk scores)

This transparency builds trust and helps users understand data limitations.

## 📊 Key Metrics

### Fleet Deployment (2026 Monsoon)
- 109 dewatering pumps deployed
- 63 suction tankers deployed
- 34 GMDA submersible pump sets

### Model Performance
- 14 alerts issued in last 30 days
- 11 verified correct (79% accuracy)
- Published for public accountability

## 🛠️ Technical Details

### State Management
- Zustand store with persistence middleware
- Global state for: session, language, risk filter, rainfall forecast
- Local state for: UI interactions, form inputs

### Risk Computation
```typescript
risk = (rainfall_mm / 150) * 60 + 
       (leverage_score / 100) * 25 + 
       (population_exposure_normalized) * 15
```

Confidence levels based on sensor coverage:
- **High**: All upstream sensors online
- **Medium**: Some sensors offline
- **Low**: Multiple sensors offline or no coverage

### Action Generation Rules
- Risk ≥ 70% + critical_point → Pre-position pump
- Risk ≥ 60% + downstream connections → Desilt node
- Risk ≥ 50% + non-MCG agency → Inspect & notify
- Risk ≥ 60% → Issue alert (action tier at T-6h, advisory at T-12h)

## 📋 Acceptance Criteria

All features meet the following standards:
- ✅ Responsive design (mobile-first, works on 390x844 to 1366x768)
- ✅ WCAG AA accessibility compliance
- ✅ Color-blind safe (icons + labels, not color alone)
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Reduced motion support
- ✅ Offline-capable after initial load
- ✅ No external API dependencies (demo mode)

## 🎯 Demo Script

1. **Login**: Sign in as Ward Engineer
2. **Risk Map**: Adjust rainfall slider, observe risk changes
3. **Filter**: Click "HIGH" in legend, watch map zoom and dim
4. **Action List**: Review prioritized actions, mark one as done
5. **Override**: Change rank with reason, show audit trail
6. **Sensors**: Mark sensor offline, show confidence downgrade
7. **Navigate**: Use ← → keys or swipe to move between screens
8. **Network**: View agency feed status, request data from GMDA
9. **Switch Role**: Sign in as Commissioner, view Executive dashboard
10. **Citizen View**: Continue as citizen, check route risk in Hindi

## 📄 License

This is a demonstration prototype for civic innovation. Not for production use without proper validation and testing.

## 🤝 Contributing

This project follows the Gurgaon Flood Command specification revisions:
- v1: Initial specification
- v2: Authentication and home screens
- v3: Risk tier highlight filter
- v4b: Network data feed status
- v5: Navigation shell and real MCG data

## 📞 Support

For technical questions or demo access, contact the development team.

---

**Built with care for the people of Gurugram** 🇮🇳
