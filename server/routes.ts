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
