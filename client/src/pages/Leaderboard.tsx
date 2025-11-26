import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, TrendingUp } from "lucide-react";
import type { Miner } from "@shared/schema";

export default function Leaderboard() {
  const { data: miners, isLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const getTopMiners = (sortBy: "hashrate" | "blocks" | "rewards") => {
    if (!miners) return [];

    const sorted = [...miners].sort((a, b) => {
      if (sortBy === "hashrate") return b.currentHashrate - a.currentHashrate;
      if (sortBy === "blocks") return b.totalBlocks - a.totalBlocks;
      return b.totalRewards - a.totalRewards;
    });

    return sorted.slice(0, 20);
  };

  const topHashrate = getTopMiners("hashrate");
  const topBlocks = getTopMiners("blocks");
  const topRewards = getTopMiners("rewards");

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20";
    if (rank === 2) return "bg-gray-400/20";
    if (rank === 3) return "bg-orange-500/20";
    return "";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-500" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const MinerRow = ({
    rank,
    miner,
    value,
    unit,
  }: {
    rank: number;
    miner: Miner;
    value: string;
    unit: string;
  }) => (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border border-border/50 ${getRankColor(
        rank
      )}`}
      data-testid={`row-leaderboard-${rank}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8">
          {getRankBadge(rank)}
        </div>
        <div>
          <p className="font-mono text-sm font-medium">
            {miner.address.slice(0, 8)}...{miner.address.slice(-6)}
          </p>
          <p className="text-xs text-muted-foreground">
            {miner.workers.length} workers • Luck {miner.currentLuck.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-['Space_Grotesk'] font-bold text-lg">{value}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton count={3} />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Leaderboard</h1>
            <p className="text-muted-foreground">Top miners by hashrate, blocks, and rewards</p>
          </div>

          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Miners</p>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold" data-testid="text-total-miners-leaderboard">
                    {miners?.length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Top Hashrate</p>
                  <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-top-hashrate-leaderboard">
                    {topHashrate[0]
                      ? (topHashrate[0].currentHashrate / 1e6).toFixed(2)
                      : 0}{" "}
                    MH/s
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Blocks</p>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold" data-testid="text-total-blocks-leaderboard">
                    {miners?.reduce((sum, m) => sum + m.totalBlocks, 0) || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>
          </div>

          {/* Leaderboards */}
          <Tabs defaultValue="hashrate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hashrate">Hashrate</TabsTrigger>
              <TabsTrigger value="blocks">Blocks Found</TabsTrigger>
              <TabsTrigger value="rewards">Total Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="hashrate" className="space-y-4 mt-6">
              {topHashrate.map((miner, idx) => (
                <MinerRow
                  key={miner.address}
                  rank={idx + 1}
                  miner={miner}
                  value={(miner.currentHashrate / 1e6).toFixed(2)}
                  unit="MH/s"
                />
              ))}
            </TabsContent>

            <TabsContent value="blocks" className="space-y-4 mt-6">
              {topBlocks.map((miner, idx) => (
                <MinerRow
                  key={miner.address}
                  rank={idx + 1}
                  miner={miner}
                  value={miner.totalBlocks.toString()}
                  unit="blocks"
                />
              ))}
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4 mt-6">
              {topRewards.map((miner, idx) => (
                <MinerRow
                  key={miner.address}
                  rank={idx + 1}
                  miner={miner}
                  value={miner.totalRewards.toFixed(2)}
                  unit="BDAG"
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
