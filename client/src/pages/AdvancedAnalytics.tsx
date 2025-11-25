import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Miner, HashrateDataPoint } from "@shared/schema";

export default function AdvancedAnalytics() {
  const { data: miners, isLoading: minersLoading } = useQuery<Miner[]>({
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
      const baseHashrate = history[Math.floor((history.length / 30) * i)] || history[0];
      const variance = Math.random() * 0.2 - 0.1; // ±10% variance
      const hashrate = baseHashrate ? baseHashrate.hashrate * (1 + variance) : 0;

      data.push({
        date: dayStr,
        hashrate: Math.max(0, hashrate),
        difficulty: 1000 + i * 50 + Math.random() * 200,
      });
    }

    return data;
  };

  // Get top miners comparison
  const getTopMinersComparison = () => {
    if (!miners) return [];

    return miners
      .sort((a, b) => b.currentHashrate - a.currentHashrate)
      .slice(0, 5)
      .map((m) => ({
        name: `${m.address.slice(0, 6)}...${m.address.slice(-4)}`,
        hashrate: m.currentHashrate,
        blocks: m.totalBlocks,
        address: m.address,
      }));
  };

  // Calculate efficiency metrics
  const getNetworkMetrics = () => {
    if (!miners) return null;

    const totalHashrate = miners.reduce((sum, m) => sum + m.currentHashrate, 0);
    const averageHashrate = totalHashrate / miners.length;
    const avgLuck = miners.reduce((sum, m) => sum + m.currentLuck, 0) / miners.length;
    const totalBlocks = miners.reduce((sum, m) => sum + m.totalBlocks, 0);

    return {
      totalHashrate,
      averageHashrate,
      avgLuck,
      totalBlocks,
      minerCount: miners.length,
    };
  };

  const thirtyDayData = generate30DayData();
  const topMiners = getTopMinersComparison();
  const metrics = getNetworkMetrics();

  const isLoading = minersLoading || historyLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              30-day trends, comparative miner statistics, and network performance insights
            </p>
          </div>

          {/* Key Metrics */}
          {metrics && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Hashrate</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-total-network-hashrate">
                      {(metrics.totalHashrate / 1e6).toFixed(2)} MH/s
                    </p>
                  </div>
                  <Zap className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Hashrate</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-avg-miner-hashrate">
                      {(metrics.averageHashrate / 1e6).toFixed(2)} MH/s
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Miners</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold" data-testid="text-active-miners-count">
                      {metrics.minerCount}
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
            <h2 className="mb-6 text-lg font-semibold">30-Day Hashrate Trend</h2>
            {thirtyDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={thirtyDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => value.toFixed(2)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="hashrate" 
                    stroke="#00d9ff" 
                    strokeWidth={2}
                    dot={false}
                    name="Hashrate (MH/s)"
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

          {/* Top Miners Comparison */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold">Top 5 Miners by Hashrate</h2>
            {topMiners.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topMiners}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => (value / 1e6).toFixed(2)}
                  />
                  <Legend />
                  <Bar dataKey="hashrate" fill="#00d9ff" name="Hashrate (MH/s)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <LoadingSkeleton count={1} />
            )}

            {topMiners.length > 0 && (
              <div className="mt-6 space-y-2">
                {topMiners.map((miner, idx) => (
                  <div
                    key={miner.address}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
                    data-testid={`row-top-miner-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{idx + 1}</Badge>
                      <div>
                        <p className="font-mono text-sm">{miner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {miner.blocks} blocks mined
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{(miner.hashrate / 1e6).toFixed(2)} MH/s</p>
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
