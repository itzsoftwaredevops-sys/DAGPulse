import type { Miner, Block, MiningStats } from "@shared/schema";

export function exportMinersToCSV(miners: Miner[]): string {
  if (!miners.length) return "";

  const headers = [
    "Address",
    "Total Blocks",
    "Total Rewards (BDAG)",
    "Current Hashrate (MH/s)",
    "24h Avg Hashrate (MH/s)",
    "Current Luck (%)",
    "Network Contribution (%)",
    "Active Workers",
    "Last Active",
  ];

  const rows = miners.map((miner) => [
    miner.address,
    miner.totalBlocks,
    miner.totalRewards.toFixed(2),
    miner.currentHashrate.toFixed(2),
    miner.averageHashrate24h.toFixed(2),
    miner.currentLuck.toFixed(1),
    miner.networkContribution.toFixed(3),
    miner.workers.filter((w) => w.status === "online").length,
    new Date(miner.lastActive).toISOString(),
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function exportBlocksToCSV(blocks: Block[]): string {
  if (!blocks.length) return "";

  const headers = [
    "Block Number",
    "Block Hash",
    "Miner Address",
    "Timestamp",
    "Difficulty",
    "Reward (BDAG)",
    "Confirmations",
    "Transactions",
    "Size (bytes)",
  ];

  const rows = blocks.map((block) => [
    block.number,
    block.hash,
    block.minerAddress,
    new Date(block.timestamp).toISOString(),
    block.difficulty.toFixed(2),
    block.reward.toFixed(2),
    block.confirmations,
    block.transactions,
    block.size,
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function exportMinersToJSON(miners: Miner[]): string {
  return JSON.stringify(miners, null, 2);
}

export function exportBlocksToJSON(blocks: Block[]): string {
  return JSON.stringify(blocks, null, 2);
}

export function downloadFile(content: string, filename: string, type: "csv" | "json"): void {
  const mimeType = type === "csv" ? "text/csv;charset=utf-8;" : "application/json;charset=utf-8;";
  const link = document.createElement("a");
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
