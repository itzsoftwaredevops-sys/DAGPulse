import type { Miner, Block, MiningStats } from "@shared/schema";

export function exportMinersToCSV(validators: Miner[]): string {
  if (!validators.length) return "";

  const headers = [
    "Address",
    "Blocks Validated",
    "Total Rewards (AVAX)",
    "Current Staking Power (AVAX)",
    "24h Avg Staking Power (AVAX)",
    "Current Luck (%)",
    "Network Contribution (%)",
    "Active Nodes",
    "Last Active",
  ];

  const rows = validators.map((validator) => [
    validator.address,
    validator.totalBlocks,
    validator.totalRewards.toFixed(2),
    validator.currentStakingPower.toFixed(2),
    validator.averageStakingPower24h.toFixed(2),
    validator.currentLuck.toFixed(1),
    validator.networkContribution.toFixed(3),
    validator.workers.filter((w) => w.status === "online").length,
    new Date(validator.lastActive).toISOString(),
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function exportBlocksToCSV(blocks: Block[]): string {
  if (!blocks.length) return "";

  const headers = [
    "Block Number",
    "Block Hash",
    "Validator Address",
    "Timestamp",
    "Difficulty",
    "Reward (AVAX)",
    "Confirmations",
    "Transactions",
    "Size (bytes)",
  ];

  const rows = blocks.map((block) => [
    block.number,
    block.hash,
    block.validatorAddress,
    new Date(block.timestamp).toISOString(),
    block.difficulty.toFixed(2),
    block.reward.toFixed(2),
    block.confirmations,
    block.transactions,
    block.size,
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function exportMinersToJSON(validators: Miner[]): string {
  return JSON.stringify(validators, null, 2);
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
