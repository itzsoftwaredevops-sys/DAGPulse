import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Copy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Miner } from "@shared/schema";

interface MinerCardProps {
  miner: Partial<Miner>;
  onClick?: () => void;
}

export function MinerCard({ miner, onClick }: MinerCardProps) {
  const { toast } = useToast();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (miner.address) {
      navigator.clipboard.writeText(miner.address);
      toast({
        title: "Address Copied",
        description: "Miner address copied to clipboard",
      });
    }
  };

  const formatHashrate = (hashrate?: number) => {
    if (!hashrate) return "0 H/s";
    if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
    if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`;
    if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`;
    if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} KH/s`;
    return `${hashrate.toFixed(2)} H/s`;
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden p-6 transition-all hover:scale-105"
      onClick={onClick}
      data-testid={`card-miner-${miner.address}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-foreground">
                {miner.address ? truncateAddress(miner.address) : "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">Miner Address</p>
            </div>
          </div>
          <button
            onClick={handleCopyAddress}
            className="rounded-lg p-2 hover-elevate active-elevate-2"
            data-testid="button-copy-address"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Blocks</p>
            <p className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-total-blocks">
              {miner.totalBlocks?.toLocaleString() ?? "0"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Rewards</p>
            <p className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-total-rewards">
              {miner.totalRewards?.toLocaleString() ?? "0"} BDAG
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hashrate</p>
            <p className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-hashrate">
              {formatHashrate(miner.currentHashrate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Network Share</p>
            <div className="flex items-center gap-1">
              <p className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-network-share">
                {miner.networkContribution?.toFixed(3) ?? "0.000"}%
              </p>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Badge variant="secondary" className="text-xs">
            {miner.workers?.length ?? 0} Workers
          </Badge>
          <span className="text-xs text-muted-foreground">
            View Details →
          </span>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}
