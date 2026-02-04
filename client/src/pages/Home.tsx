import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { StatBox } from "@/components/StatBox";
import { HashrateChart } from "@/components/HashrateChart";
import { MinerCard } from "@/components/MinerCard";
import { BlockCard } from "@/components/BlockCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useLocation } from "wouter";
import {
  Activity,
  Zap,
  TrendingUp,
  Database,
  Layers,
  DollarSign,
  Users,
  Award,
  Code,
  Clock,
} from "lucide-react";
import type { MiningStats, Miner, Block, HashrateDataPoint } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import logoImage from "@assets/generated_images/dagpulse_neon_gradient_logo.png";
import { notificationStore } from "@/lib/notificationStore";

export default function Home() {
  const [, setLocation] = useLocation();
  const [wsConnected, setWsConnected] = useState(false);
  const [liveStats, setLiveStats] = useState<MiningStats | null>(null);
  const [stakingPowerHistory, setStakingPowerHistory] = useState<HashrateDataPoint[]>([]);
  const lastBlockHeightRef = useRef<number>(0);
  const lastStatsRef = useRef<MiningStats | null>(null);

  const { data: initialStats } = useQuery<MiningStats>({
    queryKey: ["/api/stats"],
  });

  const { data: topValidators, isLoading: validatorsLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners/top"],
  });

  const { data: recentBlocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks/recent"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "stats_update") {
          setLiveStats(message.data);

          // Notify on new block
          if (
            lastStatsRef.current &&
            message.data.blockHeight > lastStatsRef.current.blockHeight
          ) {
            notificationStore.addNotification(
              "block_found",
              "New Block Validated!",
              `Block #${message.data.blockHeight} with ${(message.data.blockReward).toFixed(2)} AVAX reward`
            );
          }

          // Notify on price milestone
          if (
            lastStatsRef.current &&
            message.data.avaxPrice > lastStatsRef.current.avaxPrice * 1.05
          ) {
            notificationStore.addNotification(
              "milestone",
              "Price Milestone Reached!",
              `AVAX price increased to $${message.data.avaxPrice.toFixed(2)}`
            );
          }

          lastStatsRef.current = message.data;
        } else if (message.type === "hashrate_update") {
          setStakingPowerHistory((prev) => {
            const newHistory = [...prev, message.data];
            return newHistory.slice(-30);
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const stats = liveStats || initialStats;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in-up">
        <div className="mb-12 space-y-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <img src={logoImage} alt="DAGPulse" className="h-16 w-16 md:h-20 md:w-20" />
            <div>
              <h1 className="font-['Space_Grotesk'] text-4xl font-bold md:text-6xl">
                <span className="bg-neon-gradient bg-clip-text text-transparent">
                  DAGPulse
                </span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground md:text-xl">
                Real-Time Avalanche Network Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm">
              <div className={`h-2 w-2 rounded-full ${wsConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm text-muted-foreground">
                {wsConnected ? "Live Updates Active" : "Connecting..."}
              </span>
            </div>
          </div>

          <SearchBar />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats ? (
            <>
              <StatBox
                label="Validators Online"
                value={stats.validatorsOnline}
                icon={Users}
              />
              <StatBox
                label="Pool Staking Power"
                value={stats.poolStakingPower >= 1e6 ? (stats.poolStakingPower / 1e6).toFixed(2) : (stats.poolStakingPower / 1e3).toFixed(2)}
                unit={stats.poolStakingPower >= 1e6 ? "M AVAX" : "K AVAX"}
                icon={Zap}
                decimals={2}
              />
              <StatBox
                label="Block Height"
                value={stats.blockHeight}
                icon={Layers}
                data-testid="stat-block-height"
              />
              <StatBox
                label="AVAX Price"
                value={stats.avaxPrice}
                unit="USD"
                icon={DollarSign}
                decimals={2}
              />
              <StatBox
                label="Network Staking Power"
                value={stats.networkStakingPower >= 1e6 ? (stats.networkStakingPower / 1e6).toFixed(2) : (stats.networkStakingPower / 1e3).toFixed(2)}
                unit={stats.networkStakingPower >= 1e6 ? "M AVAX" : "K AVAX"}
                icon={Activity}
                decimals={2}
              />
              <StatBox
                label="Network Difficulty"
                value={stats.networkDifficulty >= 1e6 ? (stats.networkDifficulty / 1e6).toFixed(2) : (stats.networkDifficulty / 1e3).toFixed(2)}
                unit={stats.networkDifficulty >= 1e6 ? "M" : "K"}
                icon={TrendingUp}
                decimals={2}
                data-testid="stat-network-difficulty"
              />
              <StatBox
                label="Consensus Protocol"
                value={stats.consensusProtocol}
                icon={Code}
                data-testid="stat-consensus"
              />
              <StatBox
                label="Reward Interval"
                value={(stats.rewardInterval / 3600).toFixed(1)}
                unit="hours"
                icon={Clock}
                decimals={1}
                data-testid="stat-reward-interval"
              />
              <StatBox
                label="Current Luck"
                value={stats.currentLuck}
                unit="%"
                icon={Award}
                decimals={2}
              />
              <StatBox
                label="Block Reward"
                value={stats.blockReward}
                unit="AVAX"
                icon={Database}
                decimals={2}
              />
            </>
          ) : (
            <LoadingSkeleton type="stat" count={10} />
          )}
        </div>

        <div className="mb-8">
          {stakingPowerHistory.length > 0 ? (
            <HashrateChart data={stakingPowerHistory} height={350} />
          ) : (
            <LoadingSkeleton type="chart" count={1} />
          )}
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-foreground">
              Recent Blocks
            </h2>
            <button
              onClick={() => setLocation("/blocks")}
              className="text-sm text-primary hover:text-primary/80 hover-elevate active-elevate-2 rounded-lg px-3 py-1"
              data-testid="link-view-all-blocks"
            >
              View All →
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {blocksLoading ? (
              <LoadingSkeleton type="card" count={4} />
            ) : recentBlocks && recentBlocks.length > 0 ? (
              recentBlocks.slice(0, 4).map((block) => (
                <BlockCard
                  key={block.number}
                  block={block}
                  onClick={() => setLocation(`/blocks/${block.number}`)}
                />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                No recent blocks found
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-foreground">
              Top Validators
            </h2>
            <button
              onClick={() => setLocation("/miners")}
              className="text-sm text-primary hover:text-primary/80 hover-elevate active-elevate-2 rounded-lg px-3 py-1"
              data-testid="link-view-all-validators"
            >
              View All →
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validatorsLoading ? (
              <LoadingSkeleton type="card" count={6} />
            ) : topValidators && topValidators.length > 0 ? (
              topValidators.slice(0, 6).map((validator) => (
                <MinerCard
                  key={validator.address}
                  miner={validator}
                  onClick={() => setLocation(`/miners/${validator.address}`)}
                />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                No validators found
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-border/50 bg-card/20 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 DAGPulse. Real-time Avalanche network analytics.</p>
        </div>
      </footer>
    </div>
  );
}
