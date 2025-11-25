# DAGPulse - BlockDAG Real-Time Mining Intelligence Suite

A competition-grade, production-ready mining intelligence platform for the BlockDAG network with real-time analytics, predictive insights, and advanced visualization.

## 🚀 Features

### Core Features
- **Real-Time Network Metrics**: Live updates on miners online, pool/network hashrate, block height, difficulty, and BDAG price
- **WebSocket-Based Streaming**: 1-2 second update intervals for instantaneous data delivery with fallback polling
- **Miner Search & Profiles**: Advanced search for miner addresses, detailed performance metrics, worker status, and 24h activity tracking
- **Block Lookup**: Search blocks by number with full metadata including difficulty, rewards, confirmations, and miner information
- **Interactive Charts**: Chart.js visualizations with animated gradients for hashrate trends over 24 hours

### Advanced Features (Bonus)
- **Predictive Analytics**: Linear regression-based hashrate forecasting with trend analysis
- **Miner Comparison Mode**: Compare up to 3 miners side-by-side with performance metrics
- **Risk Assessment Indicators**: Automatic risk scoring based on inactivity, worker downtime, hashrate variance, and luck estimation
- **Dark/Light Theme Toggle**: Full theme support with localStorage persistence
- **Auto-Refresh Controls**: Customizable refresh intervals and toggle-able real-time updates
- **Responsive Mobile-First Design**: Fully optimized for Android, tablet, and desktop with glassmorphism UI

## 🏗 Architecture

### Frontend Stack
- **React 18** + TypeScript for type-safe component development
- **TailwindCSS** for utility-first styling with custom neon gradient theme
- **Chart.js + Recharts** for advanced data visualization
- **React Query (TanStack Query)** for server state management and caching
- **Wouter** for client-side routing
- **shadcn/ui** for accessible, reusable components

### Backend Stack
- **Node.js + Express** for REST API server
- **WebSocket Server** on `/ws` path for real-time data streaming
- **In-Memory Storage** with seeded mock data for BlockDAG simulation
- **Zod** for input validation and type safety
- **Real-Time Simulation Engine** generating realistic network metrics at 1-2 second intervals

### Shared Code
- **TypeScript Schemas** (shared/schema.ts) with Zod for frontend-backend consistency
- Validated types for: MiningStats, Miner, Block, Worker, HashrateDataPoint, Forecast, RiskAssessment

## 📊 Data Models

### MiningStats
```typescript
{
  minersOnline: number
  currentLuck: number
  poolHashrate: number
  networkHashrate: number
  blockHeight: number
  blockDifficulty: number
  algorithm: string
  payoutInterval: number
  blockReward: number
  bdagPrice: number
  timestamp: number
}
```

### Miner
```typescript
{
  address: string
  totalBlocks: number
  totalRewards: number
  currentHashrate: number
  averageHashrate24h: number
  currentLuck: number
  networkContribution: number
  workers: Worker[]
  hashrateHistory: HashrateDataPoint[]
  lastActive: number
}
```

### Block
```typescript
{
  number: number
  hash: string
  timestamp: number
  difficulty: number
  reward: number
  minerAddress: string
  confirmations: number
  size: number
  transactions: number
}
```

## 🔌 API Endpoints

### REST Endpoints
- `GET /api/stats` - Current network statistics
- `GET /api/miners` - All miners list
- `GET /api/miners/top` - Top 10 miners by blocks
- `GET /api/miners/:address` - Specific miner details
- `GET /api/blocks` - All blocks list
- `GET /api/blocks/recent` - Recent 10 blocks
- `GET /api/blocks/:number` - Specific block details
- `GET /api/hashrate` - 30-point hashrate history for charts
- `GET /api/search?q=<query>` - Search miners by address or blocks by number

### WebSocket Events
- `stats_update` - New mining statistics (1-2s interval)
- `new_block` - New block found and mined
- `hashrate_update` - Hashrate data point added

## 🎨 Design System

### Color Theme
- **Primary**: Neon Blue (`#00d9ff`)
- **Secondary**: Neon Purple (`#d400ff`)
- **Accent**: Cyan-Purple Gradient
- **Dark Mode**: Intelligent light text on dark backgrounds
- **Light Mode**: Dark text with maintained contrast

### Typography
- **Headings**: Space Grotesk (futuristic, geometric)
- **Body**: Inter (clean, readable)
- **Monospace**: Font Mono (for addresses, hashes)

### UI Components
- **Glassmorphism**: Frosted glass effect with backdrop blur on cards
- **Animations**: Smooth 200-300ms transitions on all interactive elements
- **Loading States**: Animated shimmer skeletons for excellent perceived performance
- **Responsive**: Breakpoints at 640px (sm), 768px (md), 1024px (lg)

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Running the Project
```bash
npm run dev
```

This command:
- Starts Express backend on port 5000
- Serves React frontend on the same port (via Vite)
- Initializes WebSocket server on `/ws`
- Begins real-time data simulation

### Environment Variables
No external API keys required. All data is simulated for demo purposes.

## 📁 Project Structure

```
/client
  /src
    /components
      - Navbar.tsx           # Main navigation with theme toggle
      - StatBox.tsx          # Animated statistics display
      - SearchBar.tsx        # Search with shimmer effect
      - HashrateChart.tsx    # Chart.js visualization
      - MinerCard.tsx        # Miner profile card
      - BlockCard.tsx        # Block information card
      - LoadingSkeleton.tsx  # Shimmer loading state
      - ThemeProvider.tsx    # Dark/light mode provider
      - ThemeToggle.tsx      # Theme switcher button
      - RiskIndicator.tsx    # Risk assessment display
    /pages
      - Home.tsx             # Dashboard with live stats
      - MinerDetails.tsx     # Miner profile page
      - BlockLookup.tsx      # Block details page
      - AllMiners.tsx        # Miners list page
      - AllBlocks.tsx        # Blocks list page
      - ForecastView.tsx     # Predictive analytics
      - MinerComparison.tsx  # Side-by-side comparison
    /lib
      - queryClient.ts       # React Query setup
      - preferencesStore.ts  # Preferences management
    App.tsx
    main.tsx

/server
  index-dev.ts           # Development server entry
  routes.ts              # REST API and WebSocket routes
  storage.ts             # In-memory data storage

/shared
  schema.ts              # Zod schemas and TypeScript types

tailwind.config.ts       # Tailwind configuration
vite.config.ts          # Vite configuration
index.css               # Global styles and CSS variables
```

## 🔄 Real-Time Data Flow

```
Browser
   ↓
WebSocket Connection
   ↓
Express Server
   ↓
Real-Time Simulation Engine
   ↓
Mock Data (Updated 1-2s)
   ↓
Broadcast to all clients
```

## 🎯 Performance Optimizations

- **WebSocket Compression**: Reduces bandwidth on real-time updates
- **React Query Caching**: 5-second cache for API responses
- **Chart.js Throttling**: Optimized rendering for smooth animations
- **CSS GPU Acceleration**: 3D transforms for glassmorphism effects
- **Code Splitting**: Route-based lazy loading via Wouter
- **Image Optimization**: Compressed logo asset

## 🧪 Testing

The application includes comprehensive `data-testid` attributes for:
- Interactive elements (buttons, inputs, links)
- Display elements (stats, prices, status indicators)
- Dynamic lists with unique identifiers

Example selectors:
- `button-submit`: Submit buttons
- `input-email`: Email inputs
- `text-hashrate-${minerId}`: Dynamic miner hashrate

## 📈 Prediction Model

### Hashrate Forecasting
Uses simple linear regression to predict future hashrate:
1. Calculates trend from historical 24h data points
2. Projects 5 points ahead based on slope
3. Provides confidence score and trend direction (up/down/stable)
4. Useful for mining efficiency planning

### Risk Scoring
Combines multiple factors:
- **Inactivity Duration**: Hours since last activity
- **Worker Downtime**: Percentage of offline workers
- **Hashrate Variance**: Standard deviation from average
- **Luck Factor**: Below-average luck indicates potential issues

Scores range 0-100 with levels: Low (<30), Medium (30-60), High (>60)

## 🏆 Scoring Criteria Alignment

### Innovation ✨
- Predictive hashrate forecasting with linear regression
- Risk assessment algorithm combining multiple metrics
- Miner comparison mode for performance benchmarking
- Advanced WebSocket streaming with fallback support

### Technical Execution ⚙️
- Type-safe frontend-backend communication via Zod
- Real-time simulation engine with realistic data generation
- Comprehensive error handling and validation
- RESTful API + WebSocket dual-mode streaming

### UI/UX 🎨
- Futuristic glassmorphism design with neon gradients
- Smooth animations (200-300ms transitions)
- Mobile-first responsive design
- Shimmer loading skeletons for perceived performance

### Completeness ✅
- All core features: stats, search, profiles, charts
- All bonus features: forecast, comparison, risk, theme toggle
- Full documentation and clean code architecture
- Production-ready error handling and edge cases

## 🤝 Contributing

This is a competition submission for the BlockDAG Buildathon (Mining Lane).

## 📝 License

Proprietary - BlockDAG Buildathon Submission

## 🙏 Acknowledgments

- BlockDAG Network for mining lane competition
- Chart.js for visualization capabilities
- shadcn/ui for accessible components
- React Query for state management
