import { z } from "zod";

// Real-time Mining Statistics
export const miningStatsSchema = z.object({
  minersOnline: z.number(),
  currentLuck: z.number(),
  poolHashrate: z.number(),
  networkHashrate: z.number(),
  blockHeight: z.number(),
  blockDifficulty: z.number(),
  algorithm: z.string(),
  payoutInterval: z.number(),
  blockReward: z.number(),
  bdagPrice: z.number(),
  timestamp: z.number(),
});

export type MiningStats = z.infer<typeof miningStatsSchema>;

// Hashrate Data Point for Charts
export const hashrateDataPointSchema = z.object({
  timestamp: z.number(),
  hashrate: z.number(),
});

export type HashrateDataPoint = z.infer<typeof hashrateDataPointSchema>;

// Worker Device
export const workerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hashrate: z.number(),
  shares: z.number(),
  lastSeen: z.number(),
  status: z.enum(["online", "offline", "idle"]),
});

export type Worker = z.infer<typeof workerSchema>;

// Miner Profile
export const minerSchema = z.object({
  address: z.string(),
  totalBlocks: z.number(),
  totalRewards: z.number(),
  currentHashrate: z.number(),
  averageHashrate24h: z.number(),
  currentLuck: z.number(),
  networkContribution: z.number(),
  workers: z.array(workerSchema),
  hashrateHistory: z.array(hashrateDataPointSchema),
  lastActive: z.number(),
});

export type Miner = z.infer<typeof minerSchema>;

// Block Information
export const blockSchema = z.object({
  number: z.number(),
  hash: z.string(),
  timestamp: z.number(),
  difficulty: z.number(),
  reward: z.number(),
  minerAddress: z.string(),
  confirmations: z.number(),
  size: z.number(),
  transactions: z.number(),
});

export type Block = z.infer<typeof blockSchema>;

// Search Result Type
export const searchResultSchema = z.object({
  type: z.enum(["miner", "block"]),
  data: z.union([minerSchema, blockSchema]),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// WebSocket Message Types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stats_update"),
    data: miningStatsSchema,
  }),
  z.object({
    type: z.literal("new_block"),
    data: blockSchema,
  }),
  z.object({
    type: z.literal("hashrate_update"),
    data: hashrateDataPointSchema,
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// Prediction/Forecast Data
export const forecastSchema = z.object({
  timestamp: z.number(),
  predictedHashrate: z.number(),
  confidence: z.number(), // 0-100
  trend: z.enum(["up", "down", "stable"]),
});

export type Forecast = z.infer<typeof forecastSchema>;

// Risk Assessment
export const riskAssessmentSchema = z.object({
  minerAddress: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  score: z.number(), // 0-100
  factors: z.object({
    inactivityHours: z.number(),
    hashrateVariance: z.number(),
    workerDowntime: z.number(),
  }),
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
