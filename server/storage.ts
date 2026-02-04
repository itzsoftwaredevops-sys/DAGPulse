import type { MiningStats, Miner, Block, Worker, HashrateDataPoint } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCurrentStats(): MiningStats;
  updateStats(stats: Partial<MiningStats>): void;
  
  getAllMiners(): Miner[];
  getTopMiners(limit: number): Miner[];
  getMinerByAddress(address: string): Miner | undefined;
  createMiner(miner: Omit<Miner, "address">): Miner;
  
  getAllBlocks(): Block[];
  getRecentBlocks(limit: number): Block[];
  getBlockByNumber(number: number): Block | undefined;
  createBlock(block: Omit<Block, "number">): Block;
  
  addHashrateDataPoint(point: HashrateDataPoint): void;
  getHashrateHistory(limit: number): HashrateDataPoint[];
  
  search(query: string): Array<{ type: "validator" | "block"; data: Miner | Block }>;
}

export class MemStorage implements IStorage {
  private stats: MiningStats;
  private validators: Map<string, Miner>;
  private blocks: Map<number, Block>;
  private stakingPowerHistory: HashrateDataPoint[];
  private blockCounter: number;

  constructor() {
    this.stats = this.generateInitialStats();
    this.validators = new Map();
    this.blocks = new Map();
    this.stakingPowerHistory = [];
    this.blockCounter = 100000;

    this.seedInitialData();
  }

  private generateInitialStats(): MiningStats {
    return {
      validatorsOnline: 1200 + Math.floor(Math.random() * 200),
      currentLuck: 95 + Math.random() * 10,
      poolStakingPower: 25e6 + Math.random() * 10e6,
      networkStakingPower: 350e6 + Math.random() * 50e6,
      blockHeight: 100000,
      networkDifficulty: 5e6 + Math.random() * 2e6,
      consensusProtocol: "Avalanche",
      rewardInterval: 3600,
      blockReward: 2.5,
      avaxPrice: 35.50 + Math.random() * 5,
      timestamp: Date.now(),
    };
  }

  private generateValidatorAddress(): string {
    return "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  private generateBlockHash(): string {
    return "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  private generateNode(index: number): Worker {
    const statuses: Worker["status"][] = ["online", "online", "online", "offline", "idle"];
    return {
      id: randomUUID(),
      name: `Node-${index + 1}`,
      stakingPower: 50000 + Math.random() * 200000,
      shares: Math.floor(Math.random() * 10000),
      lastSeen: Date.now() - Math.floor(Math.random() * 3600000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  }

  private seedInitialData(): void {
    for (let i = 0; i < 20; i++) {
      const address = this.generateValidatorAddress();
      const nodeCount = 1 + Math.floor(Math.random() * 5);
      const nodes = Array.from({ length: nodeCount }, (_, idx) =>
        this.generateNode(idx)
      );
      const totalStakingPower = nodes.reduce((sum, w) => sum + w.stakingPower, 0);
      
      const stakingPowerHistory: HashrateDataPoint[] = Array.from({ length: 24 }, (_, idx) => ({
        timestamp: Date.now() - (24 - idx) * 3600000,
        hashrate: totalStakingPower * (0.8 + Math.random() * 0.4),
      }));

      const validator: Miner = {
        address,
        totalBlocks: Math.floor(Math.random() * 1000),
        totalRewards: Math.floor(Math.random() * 50000),
        currentStakingPower: totalStakingPower,
        averageStakingPower24h: totalStakingPower * (0.9 + Math.random() * 0.2),
        currentLuck: 95 + Math.random() * 10,
        networkContribution: (totalStakingPower / this.stats.networkStakingPower) * 100,
        workers: nodes,
        stakingPowerHistory,
        lastActive: Date.now() - Math.floor(Math.random() * 3600000),
      };

      this.validators.set(address, validator);
    }

    for (let i = 0; i < 50; i++) {
      const blockNumber = this.blockCounter - i;
      const validatorsArray = Array.from(this.validators.keys());
      const validatorAddress = validatorsArray[Math.floor(Math.random() * validatorsArray.length)];

      const block: Block = {
        number: blockNumber,
        hash: this.generateBlockHash(),
        timestamp: Date.now() - i * 120000,
        difficulty: this.stats.networkDifficulty * (0.9 + Math.random() * 0.2),
        reward: this.stats.blockReward,
        validatorAddress,
        confirmations: i + 1,
        size: 100000 + Math.floor(Math.random() * 500000),
        transactions: 10 + Math.floor(Math.random() * 200),
      };

      this.blocks.set(blockNumber, block);
    }

    for (let i = 0; i < 30; i++) {
      this.stakingPowerHistory.push({
        timestamp: Date.now() - (30 - i) * 60000,
        hashrate: this.stats.poolStakingPower * (0.8 + Math.random() * 0.4),
      });
    }
  }

  getCurrentStats(): MiningStats {
    return { ...this.stats };
  }

  updateStats(updates: Partial<MiningStats>): void {
    this.stats = { ...this.stats, ...updates, timestamp: Date.now() };
  }

  getAllMiners(): Miner[] {
    return Array.from(this.validators.values()).sort(
      (a, b) => b.currentStakingPower - a.currentStakingPower
    );
  }

  getTopMiners(limit: number): Miner[] {
    return this.getAllMiners().slice(0, limit);
  }

  getMinerByAddress(address: string): Miner | undefined {
    return this.validators.get(address);
  }

  createMiner(validatorData: Omit<Miner, "address">): Miner {
    const address = this.generateValidatorAddress();
    const validator: Miner = { ...validatorData, address };
    this.validators.set(address, validator);
    return validator;
  }

  getAllBlocks(): Block[] {
    return Array.from(this.blocks.values()).sort((a, b) => b.number - a.number);
  }

  getRecentBlocks(limit: number): Block[] {
    return this.getAllBlocks().slice(0, limit);
  }

  getBlockByNumber(number: number): Block | undefined {
    return this.blocks.get(number);
  }

  createBlock(blockData: Omit<Block, "number">): Block {
    this.blockCounter++;
    const block: Block = { ...blockData, number: this.blockCounter };
    this.blocks.set(this.blockCounter, block);
    return block;
  }

  addHashrateDataPoint(point: HashrateDataPoint): void {
    this.stakingPowerHistory.push(point);
    if (this.stakingPowerHistory.length > 100) {
      this.stakingPowerHistory.shift();
    }
  }

  getHashrateHistory(limit: number): HashrateDataPoint[] {
    return this.stakingPowerHistory.slice(-limit);
  }

  search(query: string): Array<{ type: "validator" | "block"; data: Miner | Block }> {
    const results: Array<{ type: "validator" | "block"; data: Miner | Block }> = [];
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.startsWith("0x")) {
      const validator = this.validators.get(query);
      if (validator) {
        results.push({ type: "validator", data: validator });
      }
      
      Array.from(this.validators.values()).forEach((m) => {
        if (m.address.toLowerCase().includes(lowerQuery) && m.address !== query) {
          results.push({ type: "validator", data: m });
        }
      });
    } else {
      const blockNum = parseInt(query);
      if (!isNaN(blockNum)) {
        const block = this.blocks.get(blockNum);
        if (block) {
          results.push({ type: "block", data: block });
        }
      }
    }

    return results.slice(0, 10);
  }
}

export const storage = new MemStorage();
