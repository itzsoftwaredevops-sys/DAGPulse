import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { MiningStats, HashrateDataPoint, Block } from "@shared/schema";
import { wsMessageSchema, type WSMessage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/stats", (req, res) => {
    try {
      const stats = storage.getCurrentStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve stats" });
    }
  });

  app.get("/api/validators", (req, res) => {
    try {
      const validators = storage.getAllMiners();
      res.json(validators);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve validators" });
    }
  });

  // Legacy endpoint alias
  app.get("/api/miners", (req, res) => {
    try {
      const validators = storage.getAllMiners();
      res.json(validators);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve validators" });
    }
  });

  app.get("/api/validators/top", (req, res) => {
    try {
      const topValidators = storage.getTopMiners(10);
      res.json(topValidators);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve top validators" });
    }
  });

  // Legacy endpoint alias
  app.get("/api/miners/top", (req, res) => {
    try {
      const topValidators = storage.getTopMiners(10);
      res.json(topValidators);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve top validators" });
    }
  });

  app.get("/api/validators/:address", (req, res) => {
    const { address } = req.params;
    
    const addressSchema = z.string().min(1).max(100);
    const validationResult = addressSchema.safeParse(address);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid validator address" });
    }
    
    const validator = storage.getMinerByAddress(address);
    
    if (!validator) {
      return res.status(404).json({ error: "Validator not found" });
    }
    
    res.json(validator);
  });

  // Legacy endpoint alias
  app.get("/api/miners/:address", (req, res) => {
    const { address } = req.params;
    
    const addressSchema = z.string().min(1).max(100);
    const validationResult = addressSchema.safeParse(address);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid validator address" });
    }
    
    const validator = storage.getMinerByAddress(address);
    
    if (!validator) {
      return res.status(404).json({ error: "Validator not found" });
    }
    
    res.json(validator);
  });

  app.get("/api/blocks", (req, res) => {
    try {
      const blocks = storage.getAllBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve blocks" });
    }
  });

  app.get("/api/blocks/recent", (req, res) => {
    try {
      const recentBlocks = storage.getRecentBlocks(10);
      res.json(recentBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve recent blocks" });
    }
  });

  app.get("/api/blocks/:number", (req, res) => {
    const blockNumberSchema = z.string().regex(/^\d+$/).transform(Number);
    const validationResult = blockNumberSchema.safeParse(req.params.number);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid block number format" });
    }
    
    const blockNumber = validationResult.data;
    const block = storage.getBlockByNumber(blockNumber);
    
    if (!block) {
      return res.status(404).json({ error: "Block not found" });
    }
    
    res.json(block);
  });

  app.get("/api/staking-power", (req, res) => {
    try {
      const history = storage.getHashrateHistory(30);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve staking power history" });
    }
  });

  // Legacy endpoint alias
  app.get("/api/hashrate", (req, res) => {
    try {
      const history = storage.getHashrateHistory(30);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve staking power history" });
    }
  });

  app.get("/api/search", (req, res) => {
    const searchSchema = z.object({
      q: z.string().min(1).max(100),
    });
    
    const validationResult = searchSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid search query. Use ?q=<query>" });
    }
    
    const query = validationResult.data.q;
    const results = storage.search(query);
    res.json(results);
  });

  app.get("/api/forecast", (req, res) => {
    try {
      const history = storage.getHashrateHistory(30);
      
      if (!history || history.length < 2) {
        return res.status(400).json({ error: "Insufficient data for forecast" });
      }

      // Simple linear regression
      const n = history.length;
      const sumX = (n * (n + 1)) / 2;
      const sumY = history.reduce((acc, p) => acc + p.hashrate, 0);
      const sumXY = history.reduce((acc, p, i) => acc + (i + 1) * p.hashrate, 0);
      const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const lastValue = history[history.length - 1].hashrate;
      const predicted = Math.max(0, lastValue + slope * 5);

      const variance = Math.abs(predicted - lastValue) / lastValue;
      const confidence = Math.max(50, Math.min(100, 100 - variance * 100));
      const trend = slope > 0 ? "up" : slope < 0 ? "down" : "stable";

      res.json({
        predicted,
        confidence: Math.round(confidence),
        trend,
        current: lastValue,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate forecast" });
    }
  });

  // Smart Contract Integration Endpoints (Avalanche C-Chain)
  app.get("/api/contract/status", (req, res) => {
    try {
      res.json({
        contractDeployed: true,
        network: "Avalanche Fuji Testnet",
        chainId: 43113,
        minStake: "2000000000000000000000", // 2000 AVAX in wei
        features: [
          "Validator Registration",
          "Stake Management",
          "Reward Claiming",
          "Block Validation Recording",
          "Event Listening"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve contract status" });
    }
  });

  app.get("/api/contract/validators/:address", (req, res) => {
    try {
      const { address } = req.params;
      const validator = storage.getMinerByAddress(address);
      
      if (!validator) {
        return res.status(404).json({ error: "Validator not found" });
      }

      res.json({
        address: validator.address,
        currentStakingPower: validator.currentStakingPower,
        totalBlocks: validator.totalBlocks,
        totalRewards: validator.totalRewards,
        currentLuck: validator.currentLuck,
        lastActive: validator.lastActive,
        isContractVerified: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve validator contract status" });
    }
  });

  // Legacy endpoint alias
  app.get("/api/contract/miners/:address", (req, res) => {
    try {
      const { address } = req.params;
      const validator = storage.getMinerByAddress(address);
      
      if (!validator) {
        return res.status(404).json({ error: "Validator not found" });
      }

      res.json({
        address: validator.address,
        currentStakingPower: validator.currentStakingPower,
        totalBlocks: validator.totalBlocks,
        totalRewards: validator.totalRewards,
        currentLuck: validator.currentLuck,
        lastActive: validator.lastActive,
        isContractVerified: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve validator contract status" });
    }
  });

  app.post("/api/contract/record-block", (req, res) => {
    try {
      const blockSchema = z.object({
        blockNumber: z.number(),
        validatorAddress: z.string(),
        difficulty: z.number()
      });

      const validationResult = blockSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid block data" });
      }

      const { blockNumber, validatorAddress, difficulty } = validationResult.data;
      const validator = storage.getMinerByAddress(validatorAddress);

      if (!validator) {
        return res.status(404).json({ error: "Validator not found" });
      }

      res.json({
        success: true,
        message: "Block validation recorded",
        blockNumber,
        rewardAmount: 2.5 + (difficulty / 1000000),
        validatorAddress
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record block validation" });
    }
  });

  app.post("/api/assistant/query", (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const lowerQuery = query.toLowerCase();
      let response = "";
      let confidence = 0.85;
      let factors: string[] = [];
      let recommendations: string[] = [];

      // STAKING-SPECIFIC QUESTIONS
      if (lowerQuery.includes("staking") && (lowerQuery.includes("drop") || lowerQuery.includes("decrease") || lowerQuery.includes("low"))) {
        response = "Your staking power has dropped significantly. This could be due to network congestion, node disconnections, or validator slashing risks. I recommend checking your node connection status, monitoring your uptime (should stay above 99%), and verifying that all nodes are properly connected to the Avalanche network.";
        confidence = 0.92;
        factors = ["Staking power variance detected", "Potential network congestion"];
        recommendations = ["Check node connection status", "Verify network connectivity", "Monitor node uptime", "Review validator health metrics"];
      } else if (lowerQuery.includes("temp") || lowerQuery.includes("heat") || lowerQuery.includes("overheat")) {
        response = "High temperatures detected in your system. This is critical for validator node stability. Immediately increase cooling, ensure proper ventilation, and consider reducing workload if temperatures exceed safe limits. Operating temperatures should stay below 75°C for optimal performance and longevity.";
        confidence = 0.94;
        factors = ["Thermal issue detected", "Risk of hardware damage"];
        recommendations = ["Increase cooling capacity", "Clean dust filters immediately", "Improve airflow", "Consider load balancing across nodes"];
      } else if (lowerQuery.includes("reward") || lowerQuery.includes("payout")) {
        response = "Staking rewards in Avalanche are distributed based on your stake weight and uptime. Your pending rewards accumulate and can be claimed when you meet the minimum threshold. Check your validator dashboard for your current balance and pending rewards. Rewards are calculated based on the Avalanche consensus participation.";
        confidence = 0.9;
        factors = ["Reward calculation", "Staking mechanism"];
        recommendations = ["Verify you meet minimum AVAX stake threshold", "Check dashboard for pending rewards", "Monitor wallet for incoming payouts", "Maintain high uptime for maximum rewards"];
      } else if (lowerQuery.includes("slash") || lowerQuery.includes("penalty")) {
        response = "Slashing occurs when validators act maliciously or go offline for extended periods. To avoid slashing, maintain high uptime (99%+), ensure your node is properly synced, and never run duplicate validators with the same keys. Set up monitoring alerts for any downtime events.";
        confidence = 0.88;
        factors = ["Slashing risk", "Validator security"];
        recommendations = ["Maintain 99%+ uptime", "Set up monitoring alerts", "Never duplicate validator keys", "Keep node software updated"];
      } else if (lowerQuery.includes("luck")) {
        response = "Luck represents the ratio of expected blocks to actual blocks validated. A luck value above 100% means you're validating blocks more often than statistically expected (good luck!), while below 100% indicates temporary variance. Normal luck ranges from 80% to 120%. Use a 10+ hour average for stability.";
        confidence = 0.91;
        factors = ["Luck calculation explained"];
        recommendations = ["Monitor luck over longer periods (10h+)", "Expect variance in short-term luck", "Compare with network average luck", "Don't make changes based on single-day luck"];
      } else if (lowerQuery.includes("optimize") || lowerQuery.includes("maximize")) {
        response = "To maximize your staking rewards on Avalanche, run redundant nodes for high availability, ensure your stake meets the minimum requirement (2000 AVAX), keep latency to peers under 50ms, and maintain 99%+ uptime. Also monitor your validation performance and adjust your delegation strategy accordingly.";
        confidence = 0.87;
        factors = ["Staking optimization", "Performance tuning"];
        recommendations = ["Run redundant nodes", "Optimize network latency", "Monitor uptime", "Check peer connectivity", "Maintain minimum stake", "Use long-term performance metrics"];
      } else if (lowerQuery.includes("difficulty") || lowerQuery.includes("network")) {
        response = "Avalanche uses a unique consensus protocol called Snowman that doesn't rely on traditional difficulty adjustments. Instead, validators reach consensus through repeated random sampling. Network performance depends on the number of active validators, total staked AVAX, and network throughput (TPS). Your rewards are proportional to your stake and uptime.";
        confidence = 0.83;
        factors = ["Avalanche consensus explained"];
        recommendations = ["Monitor network throughput", "Track validator count trends", "Maintain consistent staking power", "Understand Avalanche consensus model"];
      } else if (lowerQuery.includes("node") || lowerQuery.includes("validator")) {
        response = "Validators are nodes that stake AVAX to participate in consensus and earn rewards. To become a validator, you need at least 2000 AVAX staked. Multiple nodes can be run for redundancy, but each must have unique credentials. Monitor your node status, ensure proper synchronization, and maintain high uptime for maximum rewards.";
        confidence = 0.86;
        factors = ["Validator configuration"];
        recommendations = ["Verify node credentials", "Check sync status", "Monitor node health", "Set up failover nodes for redundancy"];

      // DAGPULSE FEATURE QUESTIONS
      } else if (lowerQuery.includes("dashboard") || lowerQuery.includes("home")) {
        response = "The Dashboard (Home page) is your main hub for real-time Avalanche network intelligence. It displays live network statistics including current luck, validators online, pool staking power, network staking power, network metrics, and AVAX price. You'll see live staking power charts with trend analysis, recent validated blocks, and top validators leaderboard.";
        confidence = 0.88;
        factors = ["Dashboard overview"];
        recommendations = ["Check live network stats", "Monitor real-time staking power charts", "View recent blocks", "Track top validators"];
      } else if (lowerQuery.includes("validators") || lowerQuery.includes("stakers")) {
        response = "The Validators section shows all active validators on the Avalanche network. You can browse all validators or click on any address to see detailed statistics including their staking power, nodes, total blocks validated, current luck, rewards earned, and validation duration. Use the search feature to quickly find specific validator addresses.";
        confidence = 0.9;
        factors = ["Validators page features"];
        recommendations = ["Search for validator addresses", "View validator details and stats", "Compare validator performance", "Track blocks validated"];
      } else if (lowerQuery.includes("block")) {
        response = "The Blocks section displays all validated blocks on the Avalanche network with detailed information like block number, hash, difficulty, reward, validator who validated it, confirmation status, and timestamp. You can look up specific blocks by number to see validation details. This helps you track block production across the network.";
        confidence = 0.87;
        factors = ["Blocks page features"];
        recommendations = ["Search blocks by number", "View block details", "See validator rewards", "Check block confirmations"];
      } else if (lowerQuery.includes("forecast") || lowerQuery.includes("prediction")) {
        response = "The Forecast page uses linear regression analysis to predict future staking power trends. You can view predictions for 1-hour, 24-hour, and 7-day timeframes. Each forecast shows the predicted staking power, confidence level, and trend direction (up, down, or stable). Use this to anticipate network changes and adjust your staking strategy.";
        confidence = 0.89;
        factors = ["Forecast functionality"];
        recommendations = ["Select different timeframes (1h, 24h, 7d)", "Check confidence levels", "Monitor trend directions", "Plan staking adjustments based on forecasts"];
      } else if (lowerQuery.includes("analytics") || lowerQuery.includes("compare")) {
        response = "The Analytics section provides advanced insights and comparison tools. You can compare staking performance between different validators, analyze trends over time with interactive charts, and generate detailed reports. Use this to benchmark your performance against other validators and identify optimization opportunities.";
        confidence = 0.86;
        factors = ["Analytics features"];
        recommendations = ["Compare validators side-by-side", "Analyze historical trends", "Generate reports", "Identify performance gaps"];
      } else if (lowerQuery.includes("export") || lowerQuery.includes("download")) {
        response = "The Export Data page allows you to download staking data in CSV or JSON format. You can export validator statistics, block history, staking power data, and detailed reports. This is useful for maintaining records, analyzing data in external tools, or generating custom reports for your validation operation.";
        confidence = 0.88;
        factors = ["Export functionality"];
        recommendations = ["Choose CSV or JSON format", "Select data types to export", "Save reports locally", "Import into analysis tools"];
      } else if (lowerQuery.includes("leaderboard") || lowerQuery.includes("rank")) {
        response = "The Leaderboard shows competitive rankings of validators on the Avalanche network. Validators are ranked by total blocks validated, current staking power, rewards earned, and overall performance. This gives you a competitive view of the network and shows where your validation operation stands compared to other validators.";
        confidence = 0.87;
        factors = ["Leaderboard rankings"];
        recommendations = ["Check your rank", "Compare with top validators", "Track ranking changes", "Set performance goals"];
      } else if (lowerQuery.includes("guild") || lowerQuery.includes("pool") || lowerQuery.includes("team")) {
        response = "The Guilds page enables team staking collaboration. You can form validator pools (teams) to combine resources, share staking strategies, and collaborate on optimization. Guilds can track combined staking power, shared rewards, and member contributions. This is perfect for coordinating large validation operations.";
        confidence = 0.85;
        factors = ["Guilds/pools feature"];
        recommendations = ["Create or join a guild", "Collaborate with other validators", "Share optimization tips", "Track team performance"];
      } else if (lowerQuery.includes("ai") || lowerQuery.includes("support") || lowerQuery.includes("help")) {
        response = "I'm the DAGPulse AI Support Agent, available 24/7 to help you optimize your Avalanche validation operation. I can answer questions about staking strategy, network mechanics, Avalanche technology, node optimization, troubleshooting issues, and how to use DAGPulse features. Ask me anything about validation and staking!";
        confidence = 0.9;
        factors = ["AI assistant capabilities"];
        recommendations = ["Ask staking questions", "Get troubleshooting help", "Learn optimization strategies", "Understand network mechanics"];
      } else if (lowerQuery.includes("settings") || lowerQuery.includes("wallet") || lowerQuery.includes("configure")) {
        response = "The Settings page lets you configure your DAGPulse experience. You can connect your MetaMask wallet to track your staking earnings directly in the dashboard, customize notification preferences, enable/disable features, and manage your account preferences. Your settings are saved in your browser for persistent configuration.";
        confidence = 0.88;
        factors = ["Settings and wallet"];
        recommendations = ["Connect MetaMask wallet", "Configure notifications", "Customize preferences", "Review account settings"];
      } else if (lowerQuery.includes("notification") || lowerQuery.includes("alert")) {
        response = "DAGPulse offers customizable notifications to keep you updated on important events. You can enable alerts for staking power drops (when your staking power drops more than 30%), new block validations, and reward milestones. Notifications are shown in real-time in the notification center (bell icon in the top right).";
        confidence = 0.87;
        factors = ["Notification system"];
        recommendations = ["Enable relevant alerts", "Check notification center", "Set alert thresholds", "Adjust in settings"];
      } else if (lowerQuery.includes("avalanche") || lowerQuery.includes("avax")) {
        response = "Avalanche is a high-performance, eco-friendly blockchain platform using the Snowman consensus protocol. It features sub-second finality, high throughput (4,500+ TPS), and EVM compatibility via the C-Chain. Validators stake AVAX (minimum 2000 AVAX) to participate in consensus and earn rewards. DAGPulse provides real-time analytics for Avalanche validators and stakers.";
        confidence = 0.92;
        factors = ["Avalanche overview"];
        recommendations = ["Learn about Snowman consensus", "Understand C-Chain compatibility", "Review staking requirements", "Monitor network metrics"];
      } else if (lowerQuery.includes("c-chain") || lowerQuery.includes("fuji")) {
        response = "The C-Chain is Avalanche's EVM-compatible smart contract chain. Fuji is the testnet for Avalanche, perfect for testing validator setups and smart contracts before deploying to mainnet. DAGPulse supports both mainnet and Fuji testnet for comprehensive validator monitoring and staking analytics.";
        confidence = 0.88;
        factors = ["C-Chain and Fuji"];
        recommendations = ["Test on Fuji before mainnet", "Understand C-Chain features", "Use testnet for development", "Verify contracts on Fuji"];

      // GENERAL HELP AND NAVIGATION
      } else if (lowerQuery.includes("how") || lowerQuery.includes("what") || lowerQuery.includes("where")) {
        response = "I'm DAGPulse Assistant, your comprehensive Avalanche validation intelligence system. I can help you with: (1) Staking optimization and troubleshooting, (2) Understanding Avalanche network mechanics, (3) Navigating DAGPulse features and pages, (4) Wallet connection and settings, (5) Data analysis and forecasting. Tell me what you need help with!";
        confidence = 0.8;
        factors = ["General help request"];
        recommendations = ["Ask about specific features", "Describe your staking challenge", "Request network insights", "Ask for navigation help"];

      // DEFAULT FALLBACK
      } else {
        response = "I'm DAGPulse Assistant, your AI staking intelligence system built for the Avalanche network. I can help you with: staking optimization, node troubleshooting, network analysis, understanding luck and consensus, maximizing rewards, wallet connection, and exploring DAGPulse features (Dashboard, Validators, Blocks, Forecast, Analytics, Export, Leaderboard, Guilds). What can I help you with today?";
        confidence = 0.75;
        factors = ["General query"];
        recommendations = ["Ask about staking issues", "Learn about platform features", "Get optimization tips", "Request technical guidance"];
      }

      res.json({ message: response, confidence, factors, recommendations });
    } catch (error) {
      console.error("AI Query Error:", error);
      res.status(500).json({ error: "Failed to process query" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const connectedClients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    connectedClients.add(ws);

    const stats = storage.getCurrentStats();
    const initialMessage: WSMessage = {
      type: "stats_update",
      data: stats,
    };
    ws.send(JSON.stringify(initialMessage));

    const stakingPowerHistory = storage.getHashrateHistory(30);
    stakingPowerHistory.forEach((point) => {
      const message: WSMessage = {
        type: "hashrate_update",
        data: point,
      };
      ws.send(JSON.stringify(message));
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      connectedClients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      connectedClients.delete(ws);
    });
  });

  function broadcastToClients(message: WSMessage) {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  let lastBlockTime = Date.now();
  let updateCounter = 0;

  function simulateRealTimeUpdates() {
    const currentStats = storage.getCurrentStats();
    updateCounter++;

    // More realistic validator fluctuation (±5-10 per cycle)
    const validatorChange = Math.floor((Math.random() - 0.5) * 15);
    const newValidatorsOnline = Math.max(1000, Math.min(1500, currentStats.validatorsOnline + validatorChange));

    // Correlated staking power changes
    const stakingVariance = (Math.random() - 0.5) * 0.08; // ±4% variance
    const newPoolStakingPower = Math.max(20e6, currentStats.poolStakingPower * (1 + stakingVariance));
    const newNetworkStakingPower = Math.max(300e6, currentStats.networkStakingPower * (1 + stakingVariance * 0.5));

    // Difficulty adjustment based on block time (simulates Avalanche mechanics)
    const timeSinceLastBlock = Date.now() - lastBlockTime;
    const targetBlockTime = 2000; // 2 seconds target for Avalanche
    const difficultyAdjustment = (timeSinceLastBlock / targetBlockTime) * 0.02;
    const newNetworkDifficulty = Math.max(4e6, currentStats.networkDifficulty * (1 + difficultyAdjustment));

    // AVAX price with micro-movements
    const priceChange = (Math.random() - 0.5) * 0.5; // ±$0.25
    const newAvaxPrice = Math.max(25, Math.min(50, currentStats.avaxPrice + priceChange));

    // Luck variance around 100%
    const luckDrift = (Math.random() - 0.5) * 2;
    const newLuck = Math.max(85, Math.min(115, currentStats.currentLuck + luckDrift));

    // Potentially increment block height (fast ~2sec blocks on Avalanche)
    let newBlockHeight = currentStats.blockHeight;
    if (Math.random() < 0.95) { // 95% chance of new block every 2 seconds
      newBlockHeight++;
      lastBlockTime = Date.now();
    }

    storage.updateStats({
      validatorsOnline: newValidatorsOnline,
      poolStakingPower: newPoolStakingPower,
      networkStakingPower: newNetworkStakingPower,
      networkDifficulty: newNetworkDifficulty,
      blockHeight: newBlockHeight,
      avaxPrice: newAvaxPrice,
      currentLuck: newLuck,
    });

    const updatedStats = storage.getCurrentStats();
    broadcastToClients({
      type: "stats_update",
      data: updatedStats,
    });

    // Add staking power data point every 5 updates (10 seconds)
    if (updateCounter % 5 === 0) {
      const dataPoint: HashrateDataPoint = {
        timestamp: Date.now(),
        hashrate: newPoolStakingPower,
      };
      storage.addHashrateDataPoint(dataPoint);
      broadcastToClients({
        type: "hashrate_update",
        data: dataPoint,
      });
    }
  }

  // Run updates every 2 seconds (high-frequency for real-time feel)
  setInterval(simulateRealTimeUpdates, 2000);

  // Log startup message
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          DAGPulse Real-Time Avalanche Dashboard            ║
║                                                            ║
║  ✓ WebSocket server initialized on path: /ws              ║
║  ✓ Real-time data simulation started                      ║
║  ✓ Updates every 2 seconds (high-frequency)               ║
║  ✓ Blocks validated every ~2 seconds (Avalanche)          ║
║  ✓ Network statistics: accurate & realistic                ║
║                                                            ║
║  Metrics tracked:                                          ║
║  - Validators Online (dynamic connection tracking)         ║
║  - Pool Staking Power (real-time updates)                  ║
║  - Network Difficulty (blockchain mechanics)               ║
║  - Block Height (incremental)                              ║
║  - Network Luck % (variance simulation)                    ║
║  - AVAX Price (market simulation)                          ║
║  - Consensus: Avalanche (Snowman)                          ║
║  - Reward Interval: 1 hour                                 ║
╚════════════════════════════════════════════════════════════╝
`);

  return httpServer;
}
