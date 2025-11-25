# DAGPulse Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from futuristic Web3 dashboards like Etherscan (data density), Dune Analytics (chart aesthetics), and Phantom Wallet (glassmorphism treatment), while maintaining a unique neon-gradient identity.

## Core Design Principles
- **Futuristic Aesthetic**: Neon gradient visual language with blue-to-purple spectrum
- **Data Clarity**: Information hierarchy that makes real-time metrics instantly scannable
- **Fluid Responsiveness**: Seamless experience across all devices
- **Performance Feedback**: Visual indicators for live data updates and loading states

## Typography
- **Primary Font**: 'Inter' via Google Fonts for UI elements and data displays
- **Accent Font**: 'Space Grotesk' for headings and key metrics
- **Hierarchy**:
  - Hero/Large Stats: text-5xl to text-7xl, font-bold
  - Section Headers: text-2xl to text-3xl, font-semibold
  - Body Text: text-base, font-normal
  - Small Data: text-sm, font-medium
  - Labels: text-xs, font-normal, uppercase tracking-wide

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Content max-width: max-w-7xl

## Component Library

### Navigation
- **Sticky Navbar**: Fixed top, glassmorphism background with backdrop-blur-xl, height h-16
- Logo placement: left-aligned with DAGPulse branding
- Navigation links: right-aligned horizontal menu (Home, Miners, Blocks)
- Mobile: Hamburger menu transforming to slide-in drawer

### Dashboard Cards (Glassmorphism)
- Background: Semi-transparent with backdrop-blur-lg
- Border: 1px gradient border (blue-purple spectrum)
- Rounded corners: rounded-xl to rounded-2xl
- Padding: p-6
- Shadow: Subtle glow effect using box-shadow with neon colors
- Hover state: Slight scale transform (scale-105) with increased glow

### Stat Boxes
- Grid layout: 2-3 columns on desktop, single column mobile
- Each box contains: Label (top), Large Value (center), Change indicator (bottom)
- Live pulse animation on value updates
- Icon placement: top-right corner

### Search Bar
- Floating design with elevated glassmorphism card
- Width: full on mobile, max-w-2xl centered on desktop
- Height: h-12
- Search icon: left-aligned
- Placeholder text with gradient shimmer effect
- Dropdown results: absolute positioned below with same glass treatment

### Charts
- **Container**: Glassmorphism card with p-6
- **Colors**: Gradient fills using blue-purple spectrum
- **Grid lines**: Subtle white/10 opacity
- **Tooltips**: Glassmorphism popup with backdrop-blur
- **Responsive**: Full width with aspect-ratio-video constraint

### Miner/Block Cards
- Compact card design with rounded-lg
- Header: Address (truncated) with copy button
- Stats grid: 2 columns for key metrics
- Action button: Full-width at bottom
- Hover: Lift effect with enhanced glow

### Loading States
- **Shimmer Animation**: Animated gradient moving from left to right
- **Skeleton**: Same card structure with pulsing gray gradients
- Duration: 1.5s ease-in-out infinite

## Page-Specific Layouts

### Home Dashboard
- Hero section: h-auto (not forced viewport), featuring logo and real-time network stats ticker
- Stats grid: 3-4 columns showing key mining metrics
- Large hashrate chart: Full-width section below stats
- Recent blocks: 2-column card grid
- Recent miners: Horizontal scrollable list

### Miner Details Page
- Header card: Full-width with miner address and overview stats
- Performance section: 2-column layout (24h stats + worker devices list)
- Hashrate chart: Full-width time-series visualization
- Blocks history: Data table with pagination

### Block Lookup Page
- Search-first layout: Prominent search bar at top
- Block details card: Single-column centered layout with all block information
- Related blocks: Horizontal prev/next navigation

## Animations
- **Page transitions**: Fade-in with slight upward motion (0.3s)
- **Data updates**: Pulse effect on changing values (0.5s)
- **Card hover**: Scale transform with glow enhancement (0.2s)
- **Shimmer loaders**: Continuous gradient animation (1.5s)
- **Chart rendering**: Smooth draw-in animation (1s)

## Responsive Breakpoints
- Mobile: Base styles, single-column layouts, full-width cards
- Tablet (md): 2-column grids, compressed navbar
- Desktop (lg+): 3-4 column grids, full navigation, optimized chart sizes

## Images
**Logo Usage**: DAGPulse logo placed in navbar (h-8) and centered in hero section (h-16 to h-20)
**No Hero Image**: This dashboard is data-focused; use gradient backgrounds instead of hero images
**Icon System**: Use Heroicons for all UI icons (search, wallet, copy, external links, navigation)

## Accessibility
- All interactive elements have focus states with neon gradient outline
- Color contrast meets WCAG AA standards even with dark theme
- Loading states announced for screen readers
- Keyboard navigation fully supported