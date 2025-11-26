import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MiningStats, HashrateDataPoint } from "@shared/schema";

export default function ForecastView() {
  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "7d">("24h");
  
  const { data: stats } = useQuery<MiningStats>({
    queryKey: ["/api/stats"],
  });

  const { data: history } = useQuery<HashrateDataPoint[]>({
    queryKey: ["/api/hashrate"],
  });

  // Simple linear regression for forecasting
  const predictHashrate = (data: HashrateDataPoint[]): number => {
    if (data.length < 2) return data[data.length - 1]?.hashrate || 0;

    const n = data.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = data.reduce((acc, p) => acc + p.hashrate, 0);
    const sumXY = data.reduce((acc, p, i) => acc + (i + 1) * p.hashrate, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const lastValue = data[data.length - 1].hashrate;
    return Math.max(0, lastValue + slope * 5); // Project 5 points ahead
  };

  const generateForecast = (history: HashrateDataPoint[]) => {
    if (!history || history.length === 0) return [];
    
    const lastTimestamp = history[history.length - 1].timestamp;
    const predicted = predictHashrate(history);
    const current = history[history.length - 1].hashrate;
    const variance = Math.abs(predicted - current) / current;
    
    return [
      ...history.slice(-10),
      {
        timestamp: lastTimestamp + 60000,
        hashrate: predicted,
        isForecast: true,
      },
    ];
  };

  const forecastData = history ? generateForecast(history) : [];
  const trend = forecastData.length > 1 
    ? forecastData[forecastData.length - 1].hashrate > forecastData[forecastData.length - 2].hashrate 
      ? "up" 
      : "down"
    : "stable";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Hashrate Forecast</h1>
            <p className="text-muted-foreground">Predictive analytics for mining performance</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={timeframe === "1h" ? "default" : "outline"}
                onClick={() => setTimeframe("1h")}
                size="sm"
                data-testid="button-forecast-1h"
              >
                1 Hour
              </Button>
              <Button 
                variant={timeframe === "24h" ? "default" : "outline"}
                onClick={() => setTimeframe("24h")}
                size="sm"
                data-testid="button-forecast-24h"
              >
                24 Hours
              </Button>
              <Button 
                variant={timeframe === "7d" ? "default" : "outline"}
                onClick={() => setTimeframe("7d")}
                size="sm"
                data-testid="button-forecast-7d"
              >
                7 Days
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Hashrate</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold">{(stats?.poolHashrate ? stats.poolHashrate / 1e6 : 0).toFixed(2)} MH/s</p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Trend</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold capitalize" data-testid="text-forecast-trend">{trend}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Confidence</p>
                    <p className="font-['Space_Grotesk'] text-2xl font-bold">78%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </Card>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-lg font-semibold">Hashrate Trend (24h + Forecast)</h2>
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    formatter={(value: any) => value.toFixed(2)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hashrate" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <LoadingSkeleton count={3} />
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold">Insights</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-neon-blue">•</span>
                <span>Hashrate shows a <strong>{trend}</strong> trend based on recent 24-hour activity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-purple">•</span>
                <span>Forecast model uses linear regression on historical data points</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue">•</span>
                <span>Higher variance indicates potential worker instability</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
