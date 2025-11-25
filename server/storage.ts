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
  
  search(query: string): Array<{ type: "miner" | "block"; data: Miner | Block }>;
}

export class MemStorage implements IStorage {
  private stats: MiningStats;
  private miners: Map<string, Miner>;
  private blocks: Map<number, Block>;
  private hashrateHistory: HashrateDataPoint[];
  private blockCounter: number;

  constructor() {
    this.stats = this.generateInitialStats();
    this.miners = new Map();
    this.blocks = new Map();
    this.hashrateHistory = [];
    this.blockCounter = 100000;

    this.seedInitialData();
  }

  private generateInitialStats(): MiningStats {
    return {
      minersOnline: 150 + Math.floor(Math.random() * 50),
      currentLuck: 95 + Math.random() * 10,
      poolHashrate: 5e9 + Math.random() * 2e9,
      networkHashrate: 50e9 + Math.random() * 10e9,
      blockHeight: 100000,
      blockDifficulty: 5e6 + Math.random() * 2e6,
      algorithm: "Scrypt",
      payoutInterval: 3600,
      blockReward: 50,
      bdagPrice: 0.0045 + Math.random() * 0.001,
      timestamp: Date.now(),
    };
  }

  private generateMinerAddress(): string {
    return "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  private generateBlockHash(): string {
    return "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  private generateWorker(index: number): Worker {
    const statuses: Worker["status"][] = ["online", "online", "online", "offline", "idle"];
    return {
      id: randomUUID(),
      name: `Worker-${index + 1}`,
      hashrate: 100e6 + Math.random() * 500e6,
      shares: Math.floor(Math.random() * 10000),
      lastSeen: Date.now() - Math.floor(Math.random() * 3600000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  }

  private seedInitialData(): void {
    for (let i = 0; i < 20; i++) {
      const address = this.generateMinerAddress();
      const workerCount = 1 + Math.floor(Math.random() * 5);
      const workers = Array.from({ length: workerCount }, (_, idx) =>
        this.generateWorker(idx)
      );
      const totalHashrate = workers.reduce((sum, w) => sum + w.hashrate, 0);
      
      const hashrateHistory: HashrateDataPoint[] = Array.from({ length: 24 }, (_, idx) => ({
        timestamp: Date.now() - (24 - idx) * 3600000,
        hashrate: totalHashrate * (0.8 + Math.random() * 0.4),
      }));

      const miner: Miner = {
        address,
        totalBlocks: Math.floor(Math.random() * 1000),
        totalRewards: Math.floor(Math.random() * 50000),
        currentHashrate: totalHashrate,
        averageHashrate24h: totalHashrate * (0.9 + Math.random() * 0.2),
        currentLuck: 95 + Math.random() * 10,
        networkContribution: (totalHashrate / this.stats.networkHashrate) * 100,
        workers,
        hashrateHistory,
        lastActive: Date.now() - Math.floor(Math.random() * 3600000),
      };

      this.miners.set(address, miner);
    }

    for (let i = 0; i < 50; i++) {
      const blockNumber = this.blockCounter - i;
      const minersArray = Array.from(this.miners.keys());
      const minerAddress = minersArray[Math.floor(Math.random() * minersArray.length)];

      const block: Block = {
        number: blockNumber,
        hash: this.generateBlockHash(),
        timestamp: Date.now() - i * 120000,
        difficulty: this.stats.blockDifficulty * (0.9 + Math.random() * 0.2),
        reward: this.stats.blockReward,
        minerAddress,
        confirmations: i + 1,
        size: 100000 + Math.floor(Math.random() * 500000),
        transactions: 10 + Math.floor(Math.random() * 200),
      };

      this.blocks.set(blockNumber, block);
    }

    for (let i = 0; i < 30; i++) {
      this.hashrateHistory.push({
        timestamp: Date.now() - (30 - i) * 60000,
        hashrate: this.stats.poolHashrate * (0.8 + Math.random() * 0.4),
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
    return Array.from(this.miners.values()).sort(
      (a, b) => b.currentHashrate - a.currentHashrate
    );
  }

  getTopMiners(limit: number): Miner[] {
    return this.getAllMiners().slice(0, limit);
  }

  getMinerByAddress(address: string): Miner | undefined {
    return this.miners.get(address);
  }

  createMiner(minerData: Omit<Miner, "address">): Miner {
    const address = this.generateMinerAddress();
    const miner: Miner = { ...minerData, address };
    this.miners.set(address, miner);
    return miner;
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
    this.hashrateHistory.push(point);
    if (this.hashrateHistory.length > 100) {
      this.hashrateHistory.shift();
    }
  }

  getHashrateHistory(limit: number): HashrateDataPoint[] {
    return this.hashrateHistory.slice(-limit);
  }

  search(query: string): Array<{ type: "miner" | "block"; data: Miner | Block }> {
    const results: Array<{ type: "miner" | "block"; data: Miner | Block }> = [];
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.startsWith("0x")) {
      const miner = this.miners.get(query);
      if (miner) {
        results.push({ type: "miner", data: miner });
      }
      
      Array.from(this.miners.values()).forEach((m) => {
        if (m.address.toLowerCase().includes(lowerQuery) && m.address !== query) {
          results.push({ type: "miner", data: m });
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
