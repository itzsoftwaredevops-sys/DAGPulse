import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Clock, Hash } from "lucide-react";
import type { Block } from "@shared/schema";

interface BlockCardProps {
  block: Block;
  onClick?: () => void;
}

export function BlockCard({ block, onClick }: BlockCardProps) {
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const formatDifficulty = (difficulty: number) => {
    if (difficulty >= 1e12) return `${(difficulty / 1e12).toFixed(2)}T`;
    if (difficulty >= 1e9) return `${(difficulty / 1e9).toFixed(2)}G`;
    if (difficulty >= 1e6) return `${(difficulty / 1e6).toFixed(2)}M`;
    if (difficulty >= 1e3) return `${(difficulty / 1e3).toFixed(2)}K`;
    return difficulty.toString();
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden p-6 transition-all hover:scale-105"
      onClick={onClick}
      data-testid={`card-block-${block.number}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Box className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="font-['Space_Grotesk'] text-xl font-bold text-foreground" data-testid="text-block-number">
                #{block.number.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Block Height</p>
            </div>
          </div>
          <Badge variant={block.confirmations >= 6 ? "default" : "secondary"} className="text-xs">
            {block.confirmations} Confirmations
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              {truncateHash(block.hash)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(block.timestamp)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Difficulty</p>
            <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground" data-testid="text-difficulty">
              {formatDifficulty(block.difficulty)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reward</p>
            <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground" data-testid="text-reward">
              {block.reward} AVAX
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Txs</p>
            <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground" data-testid="text-transactions">
              {block.transactions}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}
