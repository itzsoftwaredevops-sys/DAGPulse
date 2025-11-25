import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { Miner } from "@shared/schema";

interface RiskIndicatorProps {
  miner: Miner;
}

export function RiskIndicator({ miner }: RiskIndicatorProps) {
  const calculateRiskScore = (): {
    level: "low" | "medium" | "high";
    score: number;
    reason: string;
  } => {
    let score = 0;

    // Inactivity check
    const lastActiveHours = (Date.now() - miner.lastActive) / (1000 * 60 * 60);
    if (lastActiveHours > 24) score += 40;
    else if (lastActiveHours > 12) score += 20;

    // Worker downtime check
    const offlineWorkers = miner.workers.filter((w) => w.status === "offline").length;
    if (offlineWorkers > miner.workers.length * 0.5) score += 30;
    else if (offlineWorkers > 0) score += 15;

    // Hashrate stability check
    if (miner.hashrateHistory.length > 1) {
      const rates = miner.hashrateHistory.map((h) => h.hashrate);
      const avg = rates.reduce((a, b) => a + b) / rates.length;
      const variance = Math.sqrt(rates.reduce((a, h) => a + Math.pow(h - avg, 2)) / rates.length) / avg;

      if (variance > 0.5) score += 20;
      else if (variance > 0.2) score += 10;
    }

    // Luck check
    if (miner.currentLuck < 0.5) score += 15;
    else if (miner.currentLuck < 0.75) score += 5;

    const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
    const reason =
      level === "high"
        ? "Multiple risk factors detected"
        : level === "medium"
          ? "Some performance issues"
          : "Mining normally";

    return { level, score: Math.min(100, score), reason };
  };

  const { level, score, reason } = calculateRiskScore();

  const levelConfig = {
    low: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
    medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: AlertTriangle },
    high: { color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg ${config.bg} border border-${level === "low" ? "green" : level === "medium" ? "yellow" : "red"}-500/30 p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-semibold capitalize ${config.color}`}>{level} Risk</p>
          <p className="text-sm text-muted-foreground">{reason}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card/50">
            <div
              className={`h-full bg-gradient-to-r ${
                level === "low"
                  ? "from-green-500 to-green-600"
                  : level === "medium"
                    ? "from-yellow-500 to-yellow-600"
                    : "from-red-500 to-red-600"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Risk Score: {score}/100</p>
        </div>
      </div>
    </div>
  );
}
