# DAGPulse - BlockDAG Real-Time Mining Intelligence Suite

## Overview

DAGPulse is a production-ready mining intelligence platform for the BlockDAG network. It provides real-time analytics, predictive insights, and advanced visualization for monitoring mining operations. The application features live network metrics, miner profiles, block exploration, hashrate forecasting, and risk assessment tools. Built with a modern tech stack, it offers both WebSocket-based real-time updates and RESTful API endpoints, with a responsive, mobile-first interface using glassmorphism design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for lightweight client-side routing (not React Router)
- Component-based architecture with reusable UI elements from shadcn/ui

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local state management using React hooks
- WebSocket connection for real-time data streaming
- Custom stores for notifications (`notificationStore.ts`) and user preferences (`preferencesStore.ts`)

**Styling & Theming**
- TailwindCSS utility-first approach with custom configuration
- Dark/light theme support via `ThemeProvider` component with localStorage persistence
- Custom CSS variables for theme colors defined in `index.css`
- Glassmorphism design aesthetic with neon gradients (blue-to-purple spectrum)
- Responsive mobile-first design using Tailwind breakpoints

**Data Visualization**
- Chart.js for animated gradient charts (primary charting library)
- Recharts for advanced analytics visualizations
- Custom `HashrateChart` component with real-time updates
- Linear regression forecasting for hashrate predictions

**Real-Time Updates**
- WebSocket connection on `/ws` path for live data streaming
- Fallback to HTTP polling when WebSocket unavailable
- 1-2 second update intervals for network statistics
- Notification system for block discoveries and risk alerts

### Backend Architecture

**Server Framework**
- Node.js with Express for REST API
- TypeScript for type safety across the stack
- Separate development (`index-dev.ts`) and production (`index-prod.ts`) entry points

**Development vs Production**
- Development: Vite middleware integration for HMR and fast refresh
- Production: Static file serving from `dist/public` directory
- Build process uses Vite for client and esbuild for server bundling

**Data Storage**
- In-memory storage implementation (`MemStorage` class in `storage.ts`)
- Seeded with mock BlockDAG mining data
- Real-time simulation engine generating realistic network metrics
- No database currently in use (Drizzle ORM configured but not actively used)

**API Design**
- RESTful endpoints under `/api` prefix
- Routes defined in `routes.ts`
- Endpoints include: `/api/stats`, `/api/miners`, `/api/blocks`, `/api/hashrate`, `/api/forecast`, `/api/search`
- Input validation using Zod schemas
- Support for query parameters and path parameters

**WebSocket Server**
- WebSocket server integrated with HTTP server
- Broadcasts updates on `/ws` path
- Message types: `stats_update`, `hashrate_update`, `new_block`
- Validated using `wsMessageSchema` from shared schema

**Real-Time Simulation**
- Background intervals generating live network metrics
- Simulated miner activity, block discoveries, and hashrate fluctuations
- Broadcasts to all connected WebSocket clients

### Shared Type System

**Schema Definitions** (`shared/schema.ts`)
- Zod schemas for runtime validation and TypeScript type inference
- Shared between frontend and backend for type consistency
- Core types: `MiningStats`, `Miner`, `Block`, `Worker`, `HashrateDataPoint`, `Forecast`, `RiskAssessment`
- WebSocket message types validated with `wsMessageSchema`

**Type Safety**
- Full end-to-end type safety from API to UI
- No type casting or `any` types in critical paths
- Validation at API boundaries using Zod

### Design System

**Component Library**
- shadcn/ui components (Radix UI primitives) configured in `components.json`
- Custom components: `StatBox`, `MinerCard`, `BlockCard`, `HashrateChart`, `RiskIndicator`, `NotificationCenter`
- Consistent spacing using Tailwind units (2, 4, 6, 8, 12, 16, 20)
- Loading states with shimmer animations (`LoadingSkeleton`)

**Typography**
- Primary font: Inter (from Google Fonts)
- Accent font: Space Grotesk for headings and metrics
- Configured in `index.html` with preconnect optimization

**Navigation**
- Sticky navbar with glassmorphism effect (`Navbar` component)
- Routes: Home (`/`), All Miners (`/miners`), Miner Details (`/miners/:address`), All Blocks (`/blocks`), Block Lookup (`/blocks/:number`), Forecast (`/forecast`), Comparison (`/compare`), Analytics (`/analytics`), Export (`/export`)
- Theme toggle and notification center in navbar

### Build & Deployment

**Build Configuration**
- Vite for frontend bundling with React plugin
- esbuild for server bundling in production
- Separate output directories: `dist/public` (client), `dist/index.js` (server)
- Path aliases: `@/` for client src, `@shared/` for shared code, `@assets/` for assets

**Development Tooling**
- TypeScript strict mode enabled
- ESM module system throughout
- Replit-specific plugins for error overlays and dev banners (conditional)
- Hot module replacement in development

**Environment**
- `NODE_ENV` determines dev vs production behavior
- Database URL configured in `drizzle.config.ts` but not actively used
- WebSocket URL derived from window.location (http/https determines ws/wss)

## External Dependencies

### NPM Packages

**UI & Styling**
- `@radix-ui/*`: Primitive components for accessible UI (accordion, dialog, dropdown, popover, etc.)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority` & `clsx`: Component variant styling utilities
- `cmdk`: Command menu component
- `lucide-react`: Icon library

**Data Visualization**
- `chart.js`: Primary charting library with gradients and animations
- `recharts`: Advanced chart components for analytics
- `react-chartjs-2`: React wrapper for Chart.js

**State & Data Fetching**
- `@tanstack/react-query`: Server state management
- `wouter`: Lightweight routing library

**Forms & Validation**
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolvers
- `zod`: Schema validation library
- `drizzle-zod`: Zod integration for Drizzle (configured but not in active use)

**Backend**
- `express`: Web server framework
- `ws`: WebSocket implementation
- `date-fns`: Date utility library

**Database (Configured, Not Active)**
- `drizzle-orm`: ORM for SQL databases
- `@neondatabase/serverless`: Neon Postgres driver
- `connect-pg-simple`: PostgreSQL session store (available but unused)

### External Services

**Google Fonts**
- Inter, Space Grotesk, DM Sans, Fira Code, Geist Mono, Architects Daughter
- Loaded via link tags in `index.html` with preconnect optimization

**No Third-Party APIs**
- Application uses simulated/mock data
- No external mining pool APIs integrated
- Self-contained real-time simulation engine

### Asset Dependencies

**Images**
- Logo: `@assets/generated_images/dagpulse_neon_gradient_logo.png`
- Favicon configured in `index.html`

### Browser APIs

**WebSocket**
- Native WebSocket API for real-time communication
- Graceful degradation to HTTP polling

**LocalStorage**
- Theme preferences persistence
- User preferences storage (auto-refresh settings, refresh intervals)
- Notification state management

**Clipboard API**
- Copy-to-clipboard functionality for addresses and hashes

## Smart Contract Integration

### Mining Rewards Smart Contract (MiningRewards.sol)

**Purpose:** Decentralized miner verification, staking, and reward distribution on EVM-compatible networks.

**Key Features:**
- Miner registration with ETH staking (minimum 1 ETH)
- Automatic reward calculation based on block difficulty
- Reward claiming mechanism
- Stake increase/decrease functionality
- Admin controls for miner verification and contract management

**Core Functions:**
- `registerMiner(address)` - Register with initial stake (payable)
- `increaseStake(address)` - Increase stake amount
- `unstake(uint256)` - Unstake and withdraw funds
- `claimRewards()` - Claim accumulated rewards
- `recordBlockReward(blockNumber, minerAddress, difficulty)` - Record block discovery (admin only)

**Events:**
- `MinerRegistered` - When miner joins
- `BlockDiscovered` - When block is found
- `RewardClaimed` - When rewards are claimed
- `StakeIncreased` / `MinerUnstaked` - Stake modifications

**Deployment:**
- Target Network: Ethereum Sepolia Testnet (ChainId: 11155111)
- Solidity Version: ^0.8.19
- License: MIT
- Files: contracts/MiningRewards.sol, contracts/MiningRewards.json (ABI)

**Frontend Integration:**
- Hook: `useContractInteraction` (client/src/lib/useContractInteraction.ts)
- Settings Page: Smart Contract UI for staking and reward claiming
- MetaMask required for transaction signing
- Contract address stored in localStorage for persistence

**Backend Integration:**
- Endpoint: GET /api/contract/status - Contract deployment info
- Endpoint: GET /api/contract/miners/:address - Miner on-chain status
- Endpoint: POST /api/contract/record-block - Record block reward discovery
- Ready for webhook integration from contract events

**Architecture:**
```
User (MetaMask) 
    ↓
Frontend (useContractInteraction hook)
    ↓
Ethereum/Sepolia Network
    ↓
MiningRewards Smart Contract
    ↓
DAGPulse Backend (record block, verify status)
    ↓
In-Memory Storage (miner stats, rewards)
```

**Future Enhancements:**
1. Deploy to BlockDAG native blockchain when available
2. ERC-20 token rewards (BDAG tokens) instead of ETH
3. Staking tier system with reward multipliers
4. Referral bonuses for bringing new miners
5. Governance DAO for parameter adjustments
6. Cross-chain bridging for multi-network support
7. Real-time contract event listeners with WebSocket broadcasts