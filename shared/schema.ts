import { z } from "zod";

// Real-time Network Statistics (Avalanche)
export const networkStatsSchema = z.object({
  validatorsOnline: z.number(),
  currentLuck: z.number(),
  poolStakingPower: z.number(),
  networkStakingPower: z.number(),
  blockHeight: z.number(),
  networkDifficulty: z.number(),
  consensusProtocol: z.string(),
  rewardInterval: z.number(),
  blockReward: z.number(),
  avaxPrice: z.number(),
  timestamp: z.number(),
});

export type NetworkStats = z.infer<typeof networkStatsSchema>;

// Legacy alias for backward compatibility
export const miningStatsSchema = networkStatsSchema;
export type MiningStats = NetworkStats;

// Staking Power Data Point for Charts
export const stakingPowerDataPointSchema = z.object({
  timestamp: z.number(),
  stakingPower: z.number(),
});

export type StakingPowerDataPoint = z.infer<typeof stakingPowerDataPointSchema>;

// Legacy alias for backward compatibility
export const hashrateDataPointSchema = z.object({
  timestamp: z.number(),
  hashrate: z.number(),
});

export type HashrateDataPoint = z.infer<typeof hashrateDataPointSchema>;

// Worker/Node Device
export const workerSchema = z.object({
  id: z.string(),
  name: z.string(),
  stakingPower: z.number(),
  shares: z.number(),
  lastSeen: z.number(),
  status: z.enum(["online", "offline", "idle"]),
});

export type Worker = z.infer<typeof workerSchema>;

// Validator Profile
export const validatorSchema = z.object({
  address: z.string(),
  totalBlocks: z.number(),
  totalRewards: z.number(),
  currentStakingPower: z.number(),
  averageStakingPower24h: z.number(),
  currentLuck: z.number(),
  networkContribution: z.number(),
  workers: z.array(workerSchema),
  stakingPowerHistory: z.array(hashrateDataPointSchema),
  lastActive: z.number(),
});

export type Validator = z.infer<typeof validatorSchema>;

// Legacy alias for backward compatibility
export const minerSchema = validatorSchema;
export type Miner = Validator;

// Block Information
export const blockSchema = z.object({
  number: z.number(),
  hash: z.string(),
  timestamp: z.number(),
  difficulty: z.number(),
  reward: z.number(),
  validatorAddress: z.string(),
  confirmations: z.number(),
  size: z.number(),
  transactions: z.number(),
});

export type Block = z.infer<typeof blockSchema>;

// Search Result Type
export const searchResultSchema = z.object({
  type: z.enum(["validator", "block"]),
  data: z.union([validatorSchema, blockSchema]),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// WebSocket Message Types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stats_update"),
    data: networkStatsSchema,
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
  predictedStakingPower: z.number(),
  confidence: z.number(), // 0-100
  trend: z.enum(["up", "down", "stable"]),
});

export type Forecast = z.infer<typeof forecastSchema>;

// Risk Assessment
export const riskAssessmentSchema = z.object({
  validatorAddress: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  score: z.number(), // 0-100
  factors: z.object({
    inactivityHours: z.number(),
    stakingPowerVariance: z.number(),
    nodeDowntime: z.number(),
  }),
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
