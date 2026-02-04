import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, TrendingUp } from "lucide-react";
import type { Miner } from "@shared/schema";

export default function Leaderboard() {
  const { data: validators, isLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const getTopValidators = (sortBy: "stakingPower" | "blocks" | "rewards") => {
    if (!validators) return [];

    const sorted = [...validators].sort((a, b) => {
      if (sortBy === "stakingPower") return b.currentStakingPower - a.currentStakingPower;
      if (sortBy === "blocks") return b.totalBlocks - a.totalBlocks;
      return b.totalRewards - a.totalRewards;
    });

    return sorted.slice(0, 20);
  };

  const topStakingPower = getTopValidators("stakingPower");
  const topBlocks = getTopValidators("blocks");
  const topRewards = getTopValidators("rewards");

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

  const formatStakingPower = (power: number) => {
    if (power >= 1e6) return `${(power / 1e6).toFixed(2)} M`;
    if (power >= 1e3) return `${(power / 1e3).toFixed(2)} K`;
    return power.toFixed(2);
  };

  const ValidatorRow = ({
    rank,
    validator,
    value,
    unit,
  }: {
    rank: number;
    validator: Miner;
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
            {validator.address.slice(0, 8)}...{validator.address.slice(-6)}
          </p>
          <p className="text-xs text-muted-foreground">
            {validator.workers.length} nodes • Luck {validator.currentLuck.toFixed(1)}%
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
            <p className="text-muted-foreground">Top validators by staking power, blocks validated, and rewards</p>
          </div>

          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Validators</p>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold" data-testid="text-total-validators-leaderboard">
                    {validators?.length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Top Staking Power</p>
                  <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-top-staking-power-leaderboard">
                    {topStakingPower[0]
                      ? formatStakingPower(topStakingPower[0].currentStakingPower)
                      : 0}{" "}
                    AVAX
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Blocks Validated</p>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold" data-testid="text-total-blocks-leaderboard">
                    {validators?.reduce((sum, v) => sum + v.totalBlocks, 0) || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </Card>
          </div>

          {/* Leaderboards */}
          <Tabs defaultValue="stakingPower" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stakingPower">Staking Power</TabsTrigger>
              <TabsTrigger value="blocks">Blocks Validated</TabsTrigger>
              <TabsTrigger value="rewards">Total Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="stakingPower" className="space-y-4 mt-6">
              {topStakingPower.map((validator, idx) => (
                <ValidatorRow
                  key={validator.address}
                  rank={idx + 1}
                  validator={validator}
                  value={formatStakingPower(validator.currentStakingPower)}
                  unit="AVAX"
                />
              ))}
            </TabsContent>

            <TabsContent value="blocks" className="space-y-4 mt-6">
              {topBlocks.map((validator, idx) => (
                <ValidatorRow
                  key={validator.address}
                  rank={idx + 1}
                  validator={validator}
                  value={validator.totalBlocks.toString()}
                  unit="blocks"
                />
              ))}
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4 mt-6">
              {topRewards.map((validator, idx) => (
                <ValidatorRow
                  key={validator.address}
                  rank={idx + 1}
                  validator={validator}
                  value={validator.totalRewards.toFixed(2)}
                  unit="AVAX"
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
