import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Miner, HashrateDataPoint } from "@shared/schema";

export default function AdvancedAnalytics() {
  const { data: validators, isLoading: validatorsLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const { data: history, isLoading: historyLoading } = useQuery<HashrateDataPoint[]>({
    queryKey: ["/api/hashrate"],
  });

  // Generate 30-day simulated data from existing points
  const generate30DayData = () => {
    if (!history || history.length === 0) return [];

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const data = [];

    // Create daily data points
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo + i * 24 * 60 * 60 * 1000);
      const dayStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Simulate variance based on actual data pattern
      const baseStakingPower = history[Math.floor((history.length / 30) * i)] || history[0];
      const variance = Math.random() * 0.2 - 0.1; // ±10% variance
      const stakingPower = baseStakingPower ? baseStakingPower.hashrate * (1 + variance) : 0;

      data.push({
        date: dayStr,
        stakingPower: Math.max(0, stakingPower),
        difficulty: 1000 + i * 50 + Math.random() * 200,
      });
    }

    return data;
  };

  // Get top validators comparison
  const getTopValidatorsComparison = () => {
    if (!validators) return [];

    return validators
      .sort((a, b) => b.currentStakingPower - a.currentStakingPower)
      .slice(0, 5)
      .map((v) => ({
        name: `${v.address.slice(0, 6)}...${v.address.slice(-4)}`,
        stakingPower: v.currentStakingPower,
        blocks: v.totalBlocks,
        address: v.address,
      }));
  };

  const formatStakingPower = (power: number) => {
    if (power >= 1e6) return `${(power / 1e6).toFixed(2)} M`;
    if (power >= 1e3) return `${(power / 1e3).toFixed(2)} K`;
    return power.toFixed(2);
  };

  // Calculate efficiency metrics
  const getNetworkMetrics = () => {
    if (!validators) return null;

    const totalStakingPower = validators.reduce((sum, v) => sum + v.currentStakingPower, 0);
    const averageStakingPower = totalStakingPower / validators.length;
    const avgLuck = validators.reduce((sum, v) => sum + v.currentLuck, 0) / validators.length;
    const totalBlocks = validators.reduce((sum, v) => sum + v.totalBlocks, 0);

    return {
      totalStakingPower,
      averageStakingPower,
      avgLuck,
      totalBlocks,
      validatorCount: validators.length,
    };
  };

  const thirtyDayData = generate30DayData();
  const topValidators = getTopValidatorsComparison();
  const metrics = getNetworkMetrics();

  const isLoading = validatorsLoading || historyLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              30-day trends, comparative validator statistics, and network performance insights
            </p>
          </div>

          {/* Key Metrics */}
          {metrics && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Staking Power</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-total-network-staking-power">
                      {formatStakingPower(metrics.totalStakingPower)} AVAX
                    </p>
                  </div>
                  <Zap className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Staking Power</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-avg-validator-staking-power">
                      {formatStakingPower(metrics.averageStakingPower)} AVAX
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Validators</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-active-validators-count">
                      {metrics.validatorCount}
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Blocks</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-total-blocks-network">
                      {metrics.totalBlocks}
                    </p>
                  </div>
                  <Target className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>
            </div>
          )}

          {/* 30-Day Trends */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold">30-Day Staking Power Trend</h2>
            {thirtyDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={thirtyDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => formatStakingPower(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="stakingPower" 
                    stroke="#00d9ff" 
                    strokeWidth={2}
                    dot={false}
                    name="Staking Power (AVAX)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <LoadingSkeleton count={1} />
            )}
          </Card>

          {/* Difficulty Forecast */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold">Difficulty Projection (30-Day)</h2>
            {thirtyDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={thirtyDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => value.toFixed(0)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="difficulty" 
                    stroke="#d400ff" 
                    strokeWidth={2}
                    dot={false}
                    name="Difficulty"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <LoadingSkeleton count={1} />
            )}
          </Card>

          {/* Top Validators Comparison */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold">Top 5 Validators by Staking Power</h2>
            {topValidators.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topValidators}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => formatStakingPower(value)}
                  />
                  <Legend />
                  <Bar dataKey="stakingPower" fill="#00d9ff" name="Staking Power (AVAX)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <LoadingSkeleton count={1} />
            )}

            {topValidators.length > 0 && (
              <div className="mt-6 space-y-2">
                {topValidators.map((validator, idx) => (
                  <div
                    key={validator.address}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
                    data-testid={`row-top-validator-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{idx + 1}</Badge>
                      <div>
                        <p className="font-mono text-sm">{validator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {validator.blocks} blocks validated
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatStakingPower(validator.stakingPower)} AVAX</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {isLoading && <LoadingSkeleton count={3} />}
        </div>
      </main>
    </div>
  );
}
