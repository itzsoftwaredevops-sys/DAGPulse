# DAGPulse - BlockDAG Real-Time Mining Intelligence Suite

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green.svg)](CONTRIBUTING.md)
[![BlockDAG](https://img.shields.io/badge/BlockDAG-Mining-purple.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![React](https://img.shields.io/badge/React-18+-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)]()

A production-ready, competition-grade mining intelligence platform for BlockDAG with real-time analytics, predictive insights, and advanced visualization. Built for the BlockDAG Buildathon Mining Lane with full open source commitment.

## 🎯 Mission

Empower miners with unprecedented visibility into hash rates, network conditions, payouts, and rewards through a central hub of real-time mining intelligence.

## 🚀 Core Features

### Real-Time Intelligence
- **Live Network Metrics** - Miners online, pool/network hashrate, block height, network difficulty, and BDAG price
- **WebSocket Streaming** - 2-second high-frequency updates with 30-point historical data
- **Scrypt Algorithm Display** - Network algorithm clearly shown (Scrypt)
- **Payout Interval Tracking** - Real-time payout status and frequency display
- **Block Height Monitor** - Live blockchain height with incremental updates

### Miner Management
- **Miner Search & Profiles** - Advanced search by Ethereum address with detailed metrics
- **Worker Tracking** - Monitor individual worker status, hashrate, and performance
- **24-Hour History** - Hashrate trends and activity logs
- **Risk Assessment** - Automatic scoring for inactivity, worker downtime, variance, and luck

### Block Exploration
- **Block Search** - Lookup blocks by number with full metadata
- **Reward Tracking** - See which miners discovered each block and earned rewards
- **Confirmation Status** - Monitor block confirmations and network acceptance
- **Transaction Details** - View block size, transaction count, and timestamps

### Advanced Analytics
- **Hashrate Forecasting** - Linear regression predictions for 1h/24h/7d timeframes
- **Miner Comparison** - Side-by-side performance benchmarking (up to 3 miners)
- **Interactive Charts** - Gradient-animated Chart.js visualizations with trend analysis
- **Data Export** - CSV/JSON export for custom analysis and record-keeping

### Collaboration Features
- **Guilds/Teams** - Form mining teams for collaborative resource management
- **Leaderboard** - Competitive miner rankings by blocks, hashrate, and rewards
- **Performance Benchmarking** - Compare your operation against top miners

### User Experience
- **AI Mining Chatbot** - 24/7 intelligent assistant for mining optimization advice
- **Dark/Light Theme** - Full theme support with localStorage persistence
- **Notifications** - Custom alerts for hashrate drops, blocks, and reward milestones
- **Mobile Responsive** - Optimized glassmorphism UI for all device sizes

## 💎 Smart Contract Integration

**MiningRewards.sol** - EVM-compatible mining rewards and staking:
- Miner registration with configurable ETH staking
- Automatic reward calculation based on block difficulty
- Stake increase/decrease functionality
- Block reward claiming mechanism
- Full admin controls for miner verification

**Network:** Ethereum Sepolia Testnet (ChainId: 11155111)
**License:** MIT | **Language:** Solidity ^0.8.19

See [contracts/README.md](contracts/README.md) for deployment, testing, and gas optimization.

## 🏗 Architecture

### Frontend Stack
- **React 18** + TypeScript for type-safe components
- **TailwindCSS** with custom neon gradient theme
- **Chart.js + Recharts** for advanced visualizations
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **shadcn/ui** for accessible UI primitives

### Backend Stack
- **Node.js + Express** for REST API
- **WebSocket Server** on `/ws` for real-time streaming
- **In-Memory Storage** with realistic mining simulation
- **Zod Validation** for type safety at API boundaries
- **Real-Time Engine** updating every 2 seconds

### Shared Type System
- **TypeScript Schemas** - Zod validators for frontend-backend consistency
- **Type-Safe Endpoints** - Full end-to-end type safety
- **Core Models:** MiningStats, Miner, Block, Worker, HashrateDataPoint, Forecast, RiskAssessment

## 📊 Real-Time Data Simulation

**Realistic Network Metrics:**
- **Miners Online** - Dynamic fluctuation (120-250 range) simulating real joins/leaves
- **Pool Hashrate** - ±4% variance with realistic trending
- **Network Difficulty** - Blockchain mechanics-based adjustment per block time
- **Luck Variance** - Statistical distribution reflecting mining variance
- **BDAG Price** - Market simulation with momentum
- **Block Generation** - Every 30 seconds (simulates 2-minute block times)
- **Updates** - Every 2 seconds for high-frequency real-time tracking

## 📁 Project Structure

```
dagpulse/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   │   ├── Home.tsx        # Dashboard with live stats
│   │   │   ├── AllMiners.tsx   # Miners list
│   │   │   ├── MinerDetails.tsx # Miner profile
│   │   │   ├── AllBlocks.tsx   # Blocks list
│   │   │   ├── BlockLookup.tsx # Block details
│   │   │   ├── ForecastView.tsx # Predictions
│   │   │   ├── MinerComparison.tsx # Compare miners
│   │   │   ├── AdvancedAnalytics.tsx # Data analysis
│   │   │   ├── ExportData.tsx  # CSV/JSON export
│   │   │   ├── Leaderboard.tsx # Miner rankings
│   │   │   ├── Guilds.tsx      # Mining teams
│   │   │   ├── AIChat.tsx      # AI chatbot
│   │   │   ├── AISupport.tsx   # AI support/FAQ
│   │   │   ├── Settings.tsx    # Wallet & config
│   │   │   └── not-found.tsx   # 404 page
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatBox.tsx
│   │   │   ├── HashrateChart.tsx
│   │   │   ├── MinerCard.tsx
│   │   │   ├── BlockCard.tsx
│   │   │   └── ...
│   │   ├── lib/                # Utilities
│   │   │   ├── queryClient.ts
│   │   │   ├── useContractInteraction.ts
│   │   │   ├── notificationStore.ts
│   │   │   └── preferencesStore.ts
│   │   └── App.tsx
│   └── index.html
├── server/                      # Node.js Backend
│   ├── index-dev.ts            # Dev server
│   ├── index-prod.ts           # Prod server
│   ├── routes.ts               # API endpoints & WebSocket
│   ├── storage.ts              # In-memory storage
│   └── vite.ts                 # Vite integration
├── shared/                      # Shared Code
│   └── schema.ts               # Zod schemas & types
├── contracts/                   # Smart Contracts
│   ├── MiningRewards.sol       # Main contract
│   ├── MiningRewards.json      # Contract ABI
│   └── README.md               # Contract docs
├── FUNCTIONAL_ARCHITECTURE.md   # System architecture
├── CONTRIBUTING.md              # Contribution guide
├── LICENSE                      # MIT License
└── replit.md                    # Project config
```

## 🔌 API Reference

### Network Statistics
```
GET /api/stats              - Current network metrics
GET /api/hashrate           - 30-point hashrate history
GET /api/forecast           - Hashrate predictions (1h/24h/7d)
```

### Miners
```
GET /api/miners             - All miners
GET /api/miners/top         - Top 10 miners
GET /api/miners/:address    - Miner details & workers
```

### Blocks
```
GET /api/blocks             - All blocks
GET /api/blocks/recent      - Recent 10 blocks
GET /api/blocks/:number     - Block details
```

### Smart Contracts
```
GET /api/contract/status    - Contract deployment info
GET /api/contract/miners/:address - Miner on-chain status
POST /api/contract/record-block   - Record block reward
```

### AI Assistant
```
POST /api/assistant/query   - Query mining AI chatbot
```

### Search
```
GET /api/search?q=<query>   - Search miners & blocks
```

### WebSocket Events (`ws://localhost:5000/ws`)
```
stats_update      - Network metrics (every 2 seconds)
new_block        - Block discovery event
hashrate_update  - Hashrate data point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- MetaMask wallet (optional, for smart contracts)

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/dagpulse.git
cd dagpulse

# Install dependencies
npm install

# Start development server (backend + frontend)
npm run dev
```

Server runs on `http://localhost:5000` with:
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:5000/api
- **WebSocket:** ws://localhost:5000/ws

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🎨 Design System

### Theme
- **Primary:** Neon Blue (#00d9ff)
- **Secondary:** Neon Purple (#d400ff)
- **Gradient:** Cyan-to-Purple spectrum
- **Dark Mode:** Intelligent contrast for readability
- **Light Mode:** Maintained visibility and aesthetics

### Typography
- **Headings:** Space Grotesk (geometric, futuristic)
- **Body:** Inter (clean, readable)
- **Mono:** Fira Code (addresses, hashes)

### Components
- **Glassmorphism:** Frosted glass with backdrop blur
- **Animations:** Smooth 200-300ms transitions
- **Loading States:** Shimmer skeletons for perceived performance
- **Responsive:** Mobile-first with breakpoints at 640px, 768px, 1024px

## 🤖 AI Chatbot Features

The integrated AI Assistant can answer questions about:
- **Mining Optimization** - Hashrate tuning, worker configuration, pool selection
- **Hardware Troubleshooting** - Temperature management, clock optimization, stability
- **Network Mechanics** - Difficulty, luck, block times, reward calculation
- **BlockDAG Technology** - DAG structure, consensus, mining advantages
- **Pool Management** - Worker setup, fee structures, failover configuration
- **DAGPulse Features** - Dashboard navigation, analytics, smart contracts
- **Risk Assessment** - Identifying issues, optimization opportunities

Access the chatbot at `/ai-chat` route or via AI Chat button in navbar.

## 🔐 Smart Contract Usage

### Connect Wallet
1. Click Settings in navbar
2. Click "Connect MetaMask"
3. Approve wallet connection

### Register as Miner
1. Go to Settings → Smart Contract section
2. Click "Register as Miner"
3. Approve transaction in MetaMask
4. Minimum stake: 1 ETH

### Claim Rewards
1. After block discovery, rewards accumulate
2. Go to Settings → Smart Contract
3. Click "Claim Rewards"
4. Approve transaction

## 📈 Performance Features

- **WebSocket Compression** - Bandwidth-optimized real-time updates
- **React Query Caching** - 5-second cache for reduced API calls
- **Chart Throttling** - Optimized rendering for smooth animations
- **GPU Acceleration** - 3D CSS transforms for glassmorphism
- **Lazy Loading** - Route-based code splitting via Wouter
- **Image Optimization** - Compressed logo and assets

## 🧪 Testing

Application includes comprehensive `data-testid` attributes for all interactive elements:
- **Buttons:** `button-{action}-{target}`
- **Inputs:** `input-{field}`
- **Links:** `link-{destination}`
- **Dynamic Elements:** `{type}-{description}-{id}`

## 📚 Documentation

- **[FUNCTIONAL_ARCHITECTURE.md](FUNCTIONAL_ARCHITECTURE.md)** - Complete system architecture, API design, data flow
- **[contracts/README.md](contracts/README.md)** - Smart contract deployment, testing, security, gas optimization
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development setup, code style, contribution process
- **[replit.md](replit.md)** - Project configuration and preferences

## 🤝 Contributing

We welcome contributions from the community! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development environment setup
- Code style and guidelines
- Pull request process
- Areas for contribution

### Quick Contribution Steps

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git commit -m "feat: add your feature"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open Pull Request on GitHub
```

## 🐛 Issues & Support

Found a bug or have a feature request?
1. Check [existing issues](https://github.com/your-username/dagpulse/issues)
2. Open a new issue with detailed description
3. Include steps to reproduce and environment details
4. Share screenshots if it's UI-related

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**Perfect for:**
- Open source mining tools
- Educational mining projects
- Community-driven dashboards
- Commercial operations (with attribution)

## 🏆 BlockDAG Buildathon

Built as a competition-grade submission for the **BlockDAG Buildathon Mining Lane**, featuring:

✅ Real-time network analytics  
✅ Predictive hashrate forecasting  
✅ Smart contract EVM integration  
✅ AI mining intelligence chatbot  
✅ Responsive glassmorphism UI  
✅ Production-ready codebase  
✅ Comprehensive documentation  
✅ Full open source commitment  

## 🎯 Vision

Make BlockDAG mining accessible, transparent, and optimized for everyone. DAGPulse aims to become the industry-standard mining intelligence platform.

## 🙏 Acknowledgments

- **BlockDAG Network** - For the mining lane competition
- **React Ecosystem** - React, TanStack Query, Wouter
- **UI Components** - shadcn/ui, Radix UI primitives
- **Visualization** - Chart.js, Recharts
- **Styling** - TailwindCSS, PostCSS
- **Type Safety** - TypeScript, Zod

---

**Made with ❤️ by the mining community**  
**Open Source • MIT Licensed • Production Ready**

Questions? Open an issue or contribute to the project!
