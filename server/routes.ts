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

  // Mock AI Assistant Endpoint
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
      } else {
        response = "I'm DAGPulse Assistant, your AI mining intelligence system. I can help you optimize hashrate, troubleshoot issues, understand luck and difficulty, maximize rewards, and tune your mining operation. Ask me about specific mining problems or optimization strategies, and I'll provide detailed guidance based on BlockDAG network parameters.";
        confidence = 0.75;
        factors = ["General query"];
        recommendations = ["Check the FAQ section for common questions", "Review your miner profile for live metrics", "Monitor the dashboard for real-time stats", "Ask specific questions about mining issues"];
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
