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

  app.get("/api/miners", (req, res) => {
    try {
      const miners = storage.getAllMiners();
      res.json(miners);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve miners" });
    }
  });

  app.get("/api/miners/top", (req, res) => {
    try {
      const topMiners = storage.getTopMiners(10);
      res.json(topMiners);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve top miners" });
    }
  });

  app.get("/api/miners/:address", (req, res) => {
    const { address } = req.params;
    
    const addressSchema = z.string().min(1).max(100);
    const validationResult = addressSchema.safeParse(address);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid miner address" });
    }
    
    const miner = storage.getMinerByAddress(address);
    
    if (!miner) {
      return res.status(404).json({ error: "Miner not found" });
    }
    
    res.json(miner);
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

  app.get("/api/hashrate", (req, res) => {
    try {
      const history = storage.getHashrateHistory(30);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve hashrate history" });
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

  // Mock AI Assistant Endpoint - Enhanced with DAGPulse Knowledge
  // Smart Contract Integration Endpoints
  app.get("/api/contract/status", (req, res) => {
    try {
      res.json({
        contractDeployed: true,
        network: "Sepolia Testnet",
        chainId: 11155111,
        minStake: "1000000000000000000", // 1 ETH in wei
        features: [
          "Miner Registration",
          "Stake Management",
          "Reward Claiming",
          "Block Discovery Recording",
          "Event Listening"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve contract status" });
    }
  });

  app.get("/api/contract/miners/:address", (req, res) => {
    try {
      const { address } = req.params;
      const miner = storage.getMinerByAddress(address);
      
      if (!miner) {
        return res.status(404).json({ error: "Miner not found" });
      }

      res.json({
        address: miner.address,
        hashrate: miner.hashrate,
        blocksFound: miner.blocksFound,
        rewardsEarned: miner.rewardsEarned,
        currentLuck: miner.currentLuck,
        lastSeen: miner.lastSeen,
        isContractVerified: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve miner contract status" });
    }
  });

  app.post("/api/contract/record-block", (req, res) => {
    try {
      const blockSchema = z.object({
        blockNumber: z.number(),
        minerAddress: z.string(),
        difficulty: z.number()
      });

      const validationResult = blockSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid block data" });
      }

      const { blockNumber, minerAddress, difficulty } = validationResult.data;
      const miner = storage.getMinerByAddress(minerAddress);

      if (!miner) {
        return res.status(404).json({ error: "Miner not found" });
      }

      res.json({
        success: true,
        message: "Block reward recorded",
        blockNumber,
        rewardAmount: 1.5 + (difficulty / 1000000),
        minerAddress
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record block reward" });
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

      // MINING-SPECIFIC QUESTIONS
      if (lowerQuery.includes("hashrate") && (lowerQuery.includes("drop") || lowerQuery.includes("decrease") || lowerQuery.includes("low"))) {
        response = "Your hashrate has dropped significantly. This could be due to network difficulty changes, worker disconnections, or hardware thermal throttling. I recommend checking your pool connection status, monitoring GPU temperatures (should stay below 75°C), and verifying that all workers are properly connected to the mining pool.";
        confidence = 0.92;
        factors = ["Hashrate variance detected", "Potential network difficulty spike"];
        recommendations = ["Check worker connection status", "Verify pool connectivity", "Monitor GPU/CPU temperature", "Reduce mining intensity if overheating"];
      } else if (lowerQuery.includes("temp") || lowerQuery.includes("heat") || lowerQuery.includes("overheat")) {
        response = "High temperatures detected in your system. This is critical for mining hardware stability. Immediately increase fan speed to 80%, clean dust filters, reduce GPU clock by 50MHz, and ensure proper airflow around your mining rig. Operating temperatures should stay below 75°C for optimal performance and longevity.";
        confidence = 0.94;
        factors = ["Thermal issue detected", "Risk of hardware damage"];
        recommendations = ["Increase fan speed to 80%", "Clean dust filters immediately", "Reduce GPU clock by 50MHz", "Improve rig airflow"];
      } else if (lowerQuery.includes("reward") || lowerQuery.includes("payout")) {
        response = "Rewards in BlockDAG are distributed every ~1 hour when you meet the minimum threshold. Your pending balance must exceed 1 BDAG to trigger a payout. Check your pool dashboard for your current balance and pending rewards. Payouts are processed automatically once you meet the minimum requirement.";
        confidence = 0.9;
        factors = ["Reward calculation", "Payout mechanism"];
        recommendations = ["Verify you meet minimum BDAG threshold", "Check pool dashboard for pending rewards", "Monitor wallet for incoming payouts", "Enable notifications for reward milestones"];
      } else if (lowerQuery.includes("stale") || lowerQuery.includes("orphan") || lowerQuery.includes("invalid")) {
        response = "Stale or orphaned shares occur when your submission arrives after the network has already found the block. This reduces your reward probability. To minimize this, switch to a geographically closer mining pool to reduce latency, lower your intensity setting by 5%, enable TCP Fast Open, and ensure your network connection is stable with latency under 50ms.";
        confidence = 0.88;
        factors = ["Share quality issue", "High network latency"];
        recommendations = ["Switch to closer pool server", "Lower intensity by 5%", "Enable TCP Fast Open", "Monitor network latency (<50ms target)"];
      } else if (lowerQuery.includes("luck")) {
        response = "Luck represents the ratio of expected shares to actual shares found. A luck value above 100% means you're finding blocks more often than statistically expected (good luck!), while below 100% indicates temporary variance. Normal luck ranges from 80% to 120%. Use a 10+ hour average for stability, as single-day variance is expected.";
        confidence = 0.91;
        factors = ["Luck calculation explained"];
        recommendations = ["Monitor luck over longer periods (10h+)", "Expect variance in short-term luck", "Compare with pool average luck", "Don't make changes based on single-day luck"];
      } else if (lowerQuery.includes("optimize") || lowerQuery.includes("maximize")) {
        response = "To maximize your mining rewards, run multiple workers for load balancing, carefully tune your mining intensity (start at 64 and increase by 1 until stability drops), keep temperatures under 75°C, ensure your latency to the pool is under 50ms, and enable SSL connections if available. Also monitor your luck percentage over longer periods and adjust your strategy accordingly.";
        confidence = 0.87;
        factors = ["Mining optimization", "Performance tuning"];
        recommendations = ["Run multiple workers", "Optimize intensity setting", "Monitor temperature", "Check pool latency", "Enable SSL if available", "Use long-term luck averages"];
      } else if (lowerQuery.includes("difficulty")) {
        response = "Network difficulty adjusts to maintain consistent block times. Higher difficulty means more computational power is needed per block, which affects your reward per unit time. When difficulty increases, your mining shares require more computation. This is normal blockchain behavior and happens automatically. Your actual mining power remains constant, but you may earn slightly fewer blocks per day during difficulty increases.";
        confidence = 0.83;
        factors = ["Network difficulty explained"];
        recommendations = ["Monitor difficulty trends", "Adjust expectations during difficulty increase", "Maintain consistent mining power", "Track long-term earnings patterns"];
      } else if (lowerQuery.includes("worker") || lowerQuery.includes("pool")) {
        response = "Workers are individual mining rigs or processes connecting to the pool. Multiple workers distribute the mining load and improve reliability. Configure each worker with your pool username and password, ensure they connect to the same mining pool endpoint, and monitor their individual hashrates. If a worker disconnects, the others continue earning rewards.";
        confidence = 0.86;
        factors = ["Worker configuration"];
        recommendations = ["Verify worker credentials", "Check pool endpoint settings", "Monitor worker status", "Set up failover pools for redundancy"];

      // DAGPULSE FEATURE QUESTIONS
      } else if (lowerQuery.includes("dashboard") || lowerQuery.includes("home")) {
        response = "The Dashboard (Home page) is your main hub for real-time mining intelligence. It displays live network statistics including current luck, miners online, pool hashrate, network hashrate, block difficulty, and BDAG price. You'll see live hashrate charts with trend analysis, recent blocks discovered, and top miners leaderboard. This is where you monitor overall network health and performance at a glance.";
        confidence = 0.88;
        factors = ["Dashboard overview"];
        recommendations = ["Check live network stats", "Monitor real-time hashrate charts", "View recent blocks", "Track top miners"];
      } else if (lowerQuery.includes("miners") && !lowerQuery.includes("optimize")) {
        response = "The Miners section shows all active miners on the BlockDAG network. You can browse all miners or click on any miner address to see detailed statistics including their hashrate, workers, total blocks found, current luck, rewards earned, and mining duration. Use the search feature to quickly find specific miner addresses and track their performance metrics over time.";
        confidence = 0.9;
        factors = ["Miners page features"];
        recommendations = ["Search for miner addresses", "View miner details and stats", "Compare miner performance", "Track blocks found by miners"];
      } else if (lowerQuery.includes("block")) {
        response = "The Blocks section displays all discovered blocks on the network with detailed information like block number, hash, difficulty, reward, miner who found it, confirmation status, and timestamp. You can look up specific blocks by number to see who mined them and view transaction details. This helps you track block discoveries across the network and validate mining activity.";
        confidence = 0.87;
        factors = ["Blocks page features"];
        recommendations = ["Search blocks by number", "View block details", "See miner rewards", "Check block confirmations"];
      } else if (lowerQuery.includes("forecast") || lowerQuery.includes("prediction")) {
        response = "The Forecast page uses linear regression analysis to predict future hashrate trends. You can view predictions for 1-hour, 24-hour, and 7-day timeframes. Each forecast shows the predicted hashrate, confidence level (how reliable the prediction is), and the trend direction (up, down, or stable). Use this to anticipate network changes and adjust your mining strategy accordingly.";
        confidence = 0.89;
        factors = ["Forecast functionality"];
        recommendations = ["Select different timeframes (1h, 24h, 7d)", "Check confidence levels", "Monitor trend directions", "Plan mining adjustments based on forecasts"];
      } else if (lowerQuery.includes("analytics") || lowerQuery.includes("compare")) {
        response = "The Analytics section provides advanced insights and comparison tools. You can compare hashrate performance between different miners, analyze trends over time with interactive charts, and generate detailed reports. Use this to benchmark your performance against other miners and identify optimization opportunities for your mining operation.";
        confidence = 0.86;
        factors = ["Analytics features"];
        recommendations = ["Compare miners side-by-side", "Analyze historical trends", "Generate reports", "Identify performance gaps"];
      } else if (lowerQuery.includes("export") || lowerQuery.includes("download")) {
        response = "The Export Data page allows you to download mining data in CSV or JSON format. You can export miner statistics, block history, hashrate data, and detailed reports. This is useful for maintaining records, analyzing data in external tools, or generating custom reports for your mining operation.";
        confidence = 0.88;
        factors = ["Export functionality"];
        recommendations = ["Choose CSV or JSON format", "Select data types to export", "Save reports locally", "Import into analysis tools"];
      } else if (lowerQuery.includes("leaderboard") || lowerQuery.includes("rank")) {
        response = "The Leaderboard shows competitive rankings of miners on the network. Miners are ranked by total blocks found, current hashrate, rewards earned, and overall mining performance. This gives you a competitive view of the network and shows where your mining operation stands compared to other miners. Use it for benchmarking and motivation.";
        confidence = 0.87;
        factors = ["Leaderboard rankings"];
        recommendations = ["Check your rank", "Compare with top miners", "Track ranking changes", "Set performance goals"];
      } else if (lowerQuery.includes("guild") || lowerQuery.includes("team")) {
        response = "The Guilds page enables team mining collaboration. You can form mining guilds (teams) to pool resources, share mining strategies, and collaborate on optimization. Guilds can track combined hashrate, shared rewards, and member contributions. This is perfect for coordinating large mining operations or learning from other miners.";
        confidence = 0.85;
        factors = ["Guilds/teams feature"];
        recommendations = ["Create or join a guild", "Collaborate with other miners", "Share optimization tips", "Track team performance"];
      } else if (lowerQuery.includes("ai") || lowerQuery.includes("support") || lowerQuery.includes("help")) {
        response = "I'm the DAGPulse AI Support Agent, available 24/7 to help you optimize your mining operation. I can answer questions about mining strategy, network mechanics, BlockDAG technology, hardware optimization, troubleshooting issues, and how to use DAGPulse features. Ask me anything about mining, and I'll provide expert guidance based on real network data.";
        confidence = 0.9;
        factors = ["AI assistant capabilities"];
        recommendations = ["Ask mining questions", "Get troubleshooting help", "Learn optimization strategies", "Understand network mechanics"];
      } else if (lowerQuery.includes("settings") || lowerQuery.includes("wallet") || lowerQuery.includes("configure")) {
        response = "The Settings page lets you configure your DAGPulse experience. You can connect your MetaMask wallet to track your mining earnings directly in the dashboard, customize notification preferences (hashrate drop alerts, new block notifications, reward milestones), enable/disable features, and manage your account preferences. Your settings are saved in your browser for persistent configuration.";
        confidence = 0.88;
        factors = ["Settings and wallet"];
        recommendations = ["Connect MetaMask wallet", "Configure notifications", "Customize preferences", "Review account settings"];
      } else if (lowerQuery.includes("notification") || lowerQuery.includes("alert")) {
        response = "DAGPulse offers customizable notifications to keep you updated on important events. You can enable alerts for hashrate drops (when your hashrate drops more than 30%), new block discoveries, and reward milestones. Notifications are shown in real-time in the notification center (bell icon in the top right). You can configure which alerts matter most to you in Settings.";
        confidence = 0.87;
        factors = ["Notification system"];
        recommendations = ["Enable relevant alerts", "Check notification center", "Set alert thresholds", "Adjust in settings"];

      // GENERAL HELP AND NAVIGATION
      } else if (lowerQuery.includes("how") || lowerQuery.includes("what") || lowerQuery.includes("where")) {
        response = "I'm DAGPulse Assistant, your comprehensive mining intelligence system. I can help you with: (1) Mining optimization and troubleshooting, (2) Understanding BlockDAG network mechanics, (3) Navigating DAGPulse features and pages, (4) Wallet connection and settings, (5) Data analysis and forecasting. Tell me what you need help with, and I'll provide specific guidance!";
        confidence = 0.8;
        factors = ["General help request"];
        recommendations = ["Ask about specific features", "Describe your mining challenge", "Request network insights", "Ask for navigation help"];

      // DEFAULT FALLBACK
      } else {
        response = "I'm DAGPulse Assistant, your AI mining intelligence system built for the BlockDAG network. I can help you with: mining optimization, hardware troubleshooting, network analysis, understanding luck and difficulty, maximizing rewards, wallet connection, exploring DAGPulse features (Dashboard, Miners, Blocks, Forecast, Analytics, Export, Leaderboard, Guilds), and answering questions about our platform. What can I help you with today?";
        confidence = 0.75;
        factors = ["General query"];
        recommendations = ["Ask about mining issues", "Learn about platform features", "Get optimization tips", "Request technical guidance"];
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

    const hashrateHistory = storage.getHashrateHistory(30);
    hashrateHistory.forEach((point) => {
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

  function simulateRealTimeUpdates() {
    const currentStats = storage.getCurrentStats();

    const updatedStats: MiningStats = {
      ...currentStats,
      minersOnline: Math.max(100, currentStats.minersOnline + Math.floor((Math.random() - 0.5) * 10)),
      currentLuck: Math.max(80, Math.min(120, currentStats.currentLuck + (Math.random() - 0.5) * 2)),
      poolHashrate: Math.max(3e9, currentStats.poolHashrate + (Math.random() - 0.5) * 5e8),
      networkHashrate: Math.max(40e9, currentStats.networkHashrate + (Math.random() - 0.5) * 2e9),
      blockDifficulty: Math.max(4e6, currentStats.blockDifficulty + (Math.random() - 0.5) * 1e5),
      bdagPrice: Math.max(0.003, currentStats.bdagPrice + (Math.random() - 0.5) * 0.0002),
      timestamp: Date.now(),
      blockHeight: currentStats.blockHeight,
      algorithm: currentStats.algorithm,
      payoutInterval: currentStats.payoutInterval,
      blockReward: currentStats.blockReward,
    };

    storage.updateStats(updatedStats);

    const statsMessage: WSMessage = {
      type: "stats_update",
      data: updatedStats,
    };
    broadcastToClients(statsMessage);

    const hashratePoint: HashrateDataPoint = {
      timestamp: Date.now(),
      hashrate: updatedStats.poolHashrate,
    };
    storage.addHashrateDataPoint(hashratePoint);

    const hashrateMessage: WSMessage = {
      type: "hashrate_update",
      data: hashratePoint,
    };
    broadcastToClients(hashrateMessage);
  }

  function generateNewBlock() {
    const currentStats = storage.getCurrentStats();
    const miners = storage.getAllMiners();
    
    if (miners.length === 0) return;

    const minerAddress = miners[Math.floor(Math.random() * miners.length)].address;

    const newBlock: Omit<Block, "number"> = {
      hash: "0x" + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(""),
      timestamp: Date.now(),
      difficulty: currentStats.blockDifficulty,
      reward: currentStats.blockReward,
      minerAddress,
      confirmations: 0,
      size: 100000 + Math.floor(Math.random() * 500000),
      transactions: 10 + Math.floor(Math.random() * 200),
    };

    const block = storage.createBlock(newBlock);

    storage.updateStats({ blockHeight: block.number });

    const blockMessage: WSMessage = {
      type: "new_block",
      data: block,
    };
    broadcastToClients(blockMessage);

    console.log(`New block mined: #${block.number}`);
  }

  setInterval(simulateRealTimeUpdates, 2000);

  setInterval(generateNewBlock, 30000);

  console.log("WebSocket server initialized on path: /ws");
  console.log("Real-time data simulation started");

  return httpServer;
}
