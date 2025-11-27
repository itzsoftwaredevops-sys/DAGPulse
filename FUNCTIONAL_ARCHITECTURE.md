# DAGPulse - Functional Architecture

## System Overview

DAGPulse is a production-ready real-time mining intelligence platform for the BlockDAG network. It provides real-time analytics, predictive insights, and advanced visualization for monitoring mining operations.

**Technology Stack:**
- Frontend: React 18 + TypeScript + TailwindCSS + Chart.js
- Backend: Node.js + Express + TypeScript
- Real-time: WebSocket (ws)
- State Management: TanStack Query + React Hooks
- Routing: Wouter (lightweight)
- Database: Neon PostgreSQL (configured, in-memory storage active)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
│  React Components + TailwindCSS + Glassmorphism Design      │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
   │ HTTP    │   │ WebSocket │  │ TanStack│
   │ REST    │   │ /ws       │  │ Query   │
   │ Queries │   │ Stream    │  │ Caching │
   └────┬────┘   └─────┬─────┘  └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│              Node.js + Express Server                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API Routes        │  WebSocket Server         │   │
│  │  /api/stats             │  Real-time Broadcasts     │   │
│  │  /api/miners            │  Type: stats_update       │   │
│  │  /api/blocks            │  Type: hashrate_update    │   │
│  │  /api/forecast          │  Type: new_block          │   │
│  │  /api/search            │                            │   │
│  │  /api/assistant/query   │                            │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  In-Memory Storage (MemStorage)                      │   │
│  │  - Miners: Active mining addresses + stats          │   │
│  │  - Blocks: Recent block discoveries                 │   │
│  │  - Hashrate History: 30-point rolling window        │   │
│  │  - Network Stats: Real-time metrics                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Real-Time Simulation Engine                        │   │
│  │  - Generates live network metrics                   │   │
│  │  - Updates every 1-2 seconds                        │   │
│  │  - Broadcasts via WebSocket                         │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── ThemeProvider (Dark/Light Mode)
├── QueryClientProvider (TanStack Query)
├── SidebarProvider + AppSidebar (Navigation)
├── Router
│   ├── Home (Dashboard)
│   │   ├── StatBox (Network Stats)
│   │   ├── HashrateChart (Chart.js)
│   │   ├── RecentBlocks
│   │   └── TopMiners
│   ├── AllMiners (Miners List)
│   ├── MinerDetails (Detail View)
│   ├── AllBlocks (Block Explorer)
│   ├── BlockLookup (Block Lookup)
│   ├── ForecastView (Predictions)
│   ├── MinerComparison (Analytics)
│   ├── AdvancedAnalytics (Dashboard)
│   ├── ExportData (CSV/JSON Export)
│   ├── AISupport (FAQ Page)
│   ├── Leaderboard (Rankings)
│   ├── Guilds (Team Collaboration)
│   └── Settings (Configuration)
├── NotificationCenter (Toast Alerts)
└── Toaster (Toast Container)
```

### State Management

**Server State (TanStack Query):**
```
Query Keys:
- ["/api/stats"] - Network statistics
- ["/api/miners"] - All miners list
- ["/api/miners/top"] - Top miners
- ["/api/miners/:address"] - Miner details
- ["/api/blocks"] - Block history
- ["/api/blocks/recent"] - Recent blocks
- ["/api/forecast"] - Hashrate predictions
- ["/api/search"] - Global search results

Cache Strategy:
- Default staleTime: 0 (immediate refetch)
- Default cacheTime: 5 minutes
- Manual invalidation on mutations
```

**Local State:**
```
useReducer/useState patterns:
- Theme (Light/Dark) - localStorage
- Notifications - Custom store
- UI State (modals, dropdowns) - Local component state
- WebSocket connection status - Custom hook
```

**WebSocket Real-Time Updates:**
```
Connection: ws://domain/ws (or wss for HTTPS)
Fallback: HTTP polling if WebSocket unavailable
Update Interval: 1-2 seconds

Message Types:
{
  type: "stats_update",
  data: MiningStats
}
{
  type: "hashrate_update",
  data: HashrateDataPoint
}
{
  type: "new_block",
  data: Block
}
```

### Styling & Theme System

**Design System:**
- Base: shadcn/ui + Radix UI primitives
- Utility: TailwindCSS
- Aesthetic: Glassmorphism with blue-purple neon gradients
- Dark/Light: CSS variables + class-based theming

**Color Palette:**
```css
--neon-blue: hsl(217, 91%, 60%)
--neon-purple: hsl(270, 100%, 50%)
--background: hsl(222, 84%, 5%) [dark]
--foreground: hsl(210, 40%, 98%) [dark]
```

**Component Library:**
- StatBox, MinerCard, BlockCard - Custom
- HashrateChart - Chart.js wrapper
- NotificationCenter - Custom
- LoadingSkeleton - Shimmer animations
- All shadcn/ui components pre-configured

---

## Backend Architecture

### API Layers

**Route Handler Structure:**
```
Express App
├── GET /api/stats
│   └── Returns: MiningStats (current network metrics)
├── GET /api/miners
│   └── Returns: Miner[] (all miners)
├── GET /api/miners/top
│   └── Returns: Miner[] (top miners by hashrate)
├── GET /api/miners/:address
│   └── Returns: Miner (specific miner details)
├── GET /api/blocks
│   └── Returns: Block[] (recent blocks)
├── GET /api/blocks/recent
│   └── Returns: Block[] (last 10 blocks)
├── GET /api/blocks/:number
│   └── Returns: Block (specific block)
├── GET /api/hashrate
│   └── Returns: HashrateDataPoint[] (30-point history)
├── GET /api/forecast?hours=1|24|168
│   └── Returns: Forecast (prediction + confidence)
├── GET /api/search?q=query
│   └── Returns: Search results (miners + blocks)
├── POST /api/assistant/query
│   └── Body: { query: string }
│   └── Returns: { message, confidence, factors, recommendations }
└── WebSocket /ws
    └── Bidirectional: stats_update, hashrate_update, new_block
```

### Data Validation

**Zod Schemas (shared/schema.ts):**
```typescript
- MiningStatsSchema
- MinerSchema
- BlockSchema
- WorkerSchema
- HashrateDataPointSchema
- ForecastSchema
- RiskAssessmentSchema
- WSMessageSchema
- Insert schemas with omit() for auto-generated fields
```

### Real-Time Data Simulation

**Simulation Engine (server/storage.ts):**
```javascript
setInterval(() => {
  // Every 1-2 seconds:
  1. Update network statistics
     - Adjust miners online (+/- 5)
     - Adjust luck (+/- 2%)
     - Update pool/network hashrate
  
  2. Update hashrate history
     - Add new data point
     - Maintain 30-point rolling window
     - Calculate variance for predictions
  
  3. Simulate block discoveries
     - Random interval: 5-10 seconds
     - Assign to random miner
     - Update miner blocks + rewards
  
  4. Broadcast to connected WebSocket clients
     - Send stats_update
     - Send hashrate_update
     - Send new_block notification
}, 1000);
```

### Storage Interface

**MemStorage Class:**
```typescript
IStorage {
  // Queries
  getCurrentStats(): MiningStats
  getAllMiners(): Miner[]
  getTopMiners(limit): Miner[]
  getMinerByAddress(address): Miner | null
  getRecentBlocks(limit): Block[]
  getBlockByNumber(number): Block | null
  getHashrateHistory(points): HashrateDataPoint[]
  search(query): SearchResults

  // Mutations
  updateStats(updates): void
  addBlock(block): void
  updateMiner(address, updates): void
  recordHashrate(hashrate): void
}
```

---

## Data Flow Patterns

### Real-Time Data Flow

```
┌─────────────────────────────────────┐
│  Real-Time Simulation Engine        │
│  (Backend: setInterval)             │
└────────────┬────────────────────────┘
             │
             ├─► Update MemStorage
             │
             ├─► Broadcast WebSocket
             │
             └─► Connected Clients (All Users)
                 │
                 ├─► Parse Message
                 ├─► Update Local State
                 └─► Re-render Components
```

### Request-Response Flow

```
Frontend Component
    │
    ├─► useQuery Hook
    │   └─► TanStack Query
    │       └─► Fetch API Call
    │
    ├─► Backend Express Route
    │   ├─► Validate Request (Zod)
    │   ├─► Query MemStorage
    │   └─► Return JSON Response
    │
    └─► Update Component State
        └─► Re-render UI
```

### Search Flow

```
User Input → Search Query
    │
    ├─► Frontend: /api/search?q=query
    │
    ├─► Backend: Parse query
    │
    ├─► MemStorage.search()
    │   ├─► Match miner addresses
    │   ├─► Match block numbers
    │   └─► Return combined results
    │
    └─► Display Results (Miners + Blocks)
```

### Forecast Flow

```
User Requests Forecast
    │
    ├─► GET /api/forecast?hours=1|24|168
    │
    ├─► Backend retrieves hashrate history (30 points)
    │
    ├─► Linear Regression Calculation
    │   ├─► n = 30 points
    │   ├─► Calculate slope
    │   ├─► Calculate confidence based on variance
    │   └─► Determine trend (up/down/stable)
    │
    └─► Return: { predicted, confidence, trend, current }
```

---

## Type System (End-to-End)

### Core Types

```typescript
// Network
type MiningStats = {
  minersOnline: number
  currentLuck: number
  poolHashrate: number
  networkHashrate: number
  blockDifficulty: number
  recentHashrate: number
  estimatedReward: number
  bdagPrice: number
}

// Miner
type Miner = {
  address: string
  hashrate: number
  workers: Worker[]
  blocksFound: number
  currentLuck: number
  rewardsEarned: number
  lastSeen: number
  miningDuration: number
}

// Block
type Block = {
  number: number
  hash: string
  difficulty: number
  reward: number
  minerAddress: string
  confirmations: number
  timestamp: number
}

// Hashrate
type HashrateDataPoint = {
  timestamp: number
  hashrate: number
}

// Forecast
type Forecast = {
  predicted: number
  confidence: number
  trend: "up" | "down" | "stable"
  current: number
}
```

### Insert Schemas

```typescript
const insertMinerSchema = createInsertSchema(miners).omit({ 
  id: true 
})
type InsertMiner = z.infer<typeof insertMinerSchema>
type SelectMiner = typeof miners.$inferSelect
```

---

## API Specification

### Endpoint Reference

| Method | Endpoint | Params | Response | Purpose |
|--------|----------|--------|----------|---------|
| GET | /api/stats | - | MiningStats | Current network statistics |
| GET | /api/miners | - | Miner[] | All miners |
| GET | /api/miners/top | - | Miner[] | Top 10 miners |
| GET | /api/miners/:addr | address | Miner | Specific miner |
| GET | /api/blocks | - | Block[] | Recent blocks |
| GET | /api/blocks/:num | number | Block | Specific block |
| GET | /api/hashrate | - | HashrateDataPoint[] | 30-point history |
| GET | /api/forecast | hours | Forecast | Prediction |
| GET | /api/search | q | SearchResults | Global search |
| POST | /api/assistant/query | { query } | AIResponse | AI assistance |
| WS | /ws | - | Message[] | Real-time stream |

---

## AI Assistant System

### Knowledge Categories

**Mining Technical:**
- Hashrate optimization
- Temperature management
- Reward calculations
- Stale share reduction
- Network difficulty
- Worker configuration

**DAGPulse Features:**
- Dashboard/Home
- Miners section
- Blocks explorer
- Forecast predictions
- Analytics tools
- Data export
- Leaderboard
- Guilds system
- Settings & wallet

**Implementation:**
- Mock keyword-matching system
- No external API (no OPENAI_API_KEY required)
- Confidence scores (0.75-0.95)
- Contextual factors & recommendations
- Extensible for real API integration

---

## Page Architecture

| Page | Route | Data Sources | Features |
|------|-------|-------------|----------|
| Dashboard | / | /api/stats, /api/miners/top, /api/blocks/recent | Live stats, charts, leaderboard |
| Miners | /miners | /api/miners | Browse all miners |
| Miner Details | /miners/:addr | /api/miners/:addr | Detailed stats |
| Blocks | /blocks | /api/blocks | Block explorer |
| Block Lookup | /blocks/:num | /api/blocks/:num | Block details |
| Forecast | /forecast | /api/forecast | Predictions with timeframes |
| Analytics | /analytics | /api/miners | Comparison charts |
| Comparison | /compare | /api/miners | Side-by-side analysis |
| Export | /export | /api/* | CSV/JSON downloads |
| FAQ | /ai-support | Static | FAQ knowledge base |
| Leaderboard | /leaderboard | /api/miners | Competitive rankings |
| Guilds | /guilds | Static | Team collaboration |
| Settings | /settings | localStorage | Configuration & wallet |

---

## Performance Optimizations

### Frontend
- TanStack Query caching (5min default)
- Component memoization (React.memo)
- Lazy loading routes (code splitting)
- Image optimization (logo, assets)
- CSS-in-JS tree-shaking
- WebSocket for low-latency updates

### Backend
- In-memory storage (O(1) lookups)
- Query parameter validation
- Response compression ready
- WebSocket multiplexing
- Linear regression (O(n) forecast)
- Efficient search implementation

### Network
- WebSocket for real-time (vs polling)
- HTTP caching headers
- Gzip compression
- CDN-ready static assets

---

## Deployment Architecture

### Development
```
npm run dev
├── Vite dev server (frontend HMR)
├── Express server (backend)
└── WebSocket server
```

### Production
```
vite build + esbuild
├── dist/public (frontend bundle)
├── dist/index.js (server bundle)
└── Static file serving
```

**Environment:**
- NODE_ENV: development | production
- DATABASE_URL: Neon PostgreSQL (configured)
- SESSION_SECRET: Stored as environment secret

---

## Extensibility Points

### Future Enhancements
1. **Real OpenAI API** - Replace mock /api/assistant/query
2. **Database Integration** - Switch from MemStorage to Drizzle ORM + PostgreSQL
3. **User Authentication** - Passport.js + session management
4. **Advanced Analytics** - Machine learning predictions
5. **Mobile App** - React Native port
6. **API Rate Limiting** - Redis-backed
7. **Caching Layer** - Redis for distributed caching

### Code Organization
- `shared/schema.ts` - Type definitions (frontend & backend)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Data access layer
- `client/src/pages/` - Page components
- `client/src/components/` - Reusable UI components
- `client/src/lib/` - Utilities (queryClient, hooks)

---

## Summary

DAGPulse is architected as a **modern full-stack application** with:
- **Decoupled frontend/backend** (separate concerns)
- **Real-time streaming** (WebSocket)
- **Type-safe end-to-end** (TypeScript + Zod)
- **Scalable storage** (in-memory now, DB-ready)
- **Production-ready UI** (glassmorphism, responsive, dark mode)
- **Extensible AI system** (mock implementation, API-ready)

This architecture enables rapid iteration while maintaining code quality and supporting enterprise features.
