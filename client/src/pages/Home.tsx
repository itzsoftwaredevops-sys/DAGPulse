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
} from "lucide-react";
import type { MiningStats, Miner, Block, HashrateDataPoint } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import logoImage from "@assets/generated_images/dagpulse_neon_gradient_logo.png";
import { notificationStore } from "@/lib/notificationStore";

export default function Home() {
  const [, setLocation] = useLocation();
  const [wsConnected, setWsConnected] = useState(false);
  const [liveStats, setLiveStats] = useState<MiningStats | null>(null);
  const [hashrateHistory, setHashrateHistory] = useState<HashrateDataPoint[]>([]);
  const lastBlockHeightRef = useRef<number>(0);
  const lastStatsRef = useRef<MiningStats | null>(null);

  const { data: initialStats } = useQuery<MiningStats>({
    queryKey: ["/api/stats"],
  });

  const { data: topMiners, isLoading: minersLoading } = useQuery<Miner[]>({
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
              "New Block Mined!",
              `Block #${message.data.blockHeight} with ${(message.data.blockReward).toFixed(2)} BDAG reward`
            );
          }

          // Notify on price milestone
          if (
            lastStatsRef.current &&
            message.data.bdagPrice > lastStatsRef.current.bdagPrice * 1.1
          ) {
            notificationStore.addNotification(
              "milestone",
              "Price Milestone Reached!",
              `BDAG price increased to $${message.data.bdagPrice.toFixed(4)}`
            );
          }

          lastStatsRef.current = message.data;
        } else if (message.type === "hashrate_update") {
          setHashrateHistory((prev) => {
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
                Real-Time BlockDAG Mining Dashboard
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
                label="Miners Online"
                value={stats.minersOnline}
                icon={Users}
              />
              <StatBox
                label="Pool Hashrate"
                value={stats.poolHashrate >= 1e9 ? (stats.poolHashrate / 1e9).toFixed(2) : (stats.poolHashrate / 1e6).toFixed(2)}
                unit={stats.poolHashrate >= 1e9 ? "GH/s" : "MH/s"}
                icon={Zap}
                decimals={2}
              />
              <StatBox
                label="Block Height"
                value={stats.blockHeight}
                icon={Layers}
              />
              <StatBox
                label="BDAG Price"
                value={stats.bdagPrice}
                unit="USD"
                icon={DollarSign}
                decimals={4}
              />
              <StatBox
                label="Network Hashrate"
                value={stats.networkHashrate >= 1e9 ? (stats.networkHashrate / 1e9).toFixed(2) : (stats.networkHashrate / 1e6).toFixed(2)}
                unit={stats.networkHashrate >= 1e9 ? "GH/s" : "MH/s"}
                icon={Activity}
                decimals={2}
              />
              <StatBox
                label="Current Luck"
                value={stats.currentLuck}
                unit="%"
                icon={Award}
                decimals={2}
              />
              <StatBox
                label="Block Difficulty"
                value={stats.blockDifficulty >= 1e6 ? (stats.blockDifficulty / 1e6).toFixed(2) : (stats.blockDifficulty / 1e3).toFixed(2)}
                unit={stats.blockDifficulty >= 1e6 ? "M" : "K"}
                icon={TrendingUp}
                decimals={2}
              />
              <StatBox
                label="Block Reward"
                value={stats.blockReward}
                unit="BDAG"
                icon={Database}
                decimals={2}
              />
            </>
          ) : (
            <LoadingSkeleton type="stat" count={8} />
          )}
        </div>

        <div className="mb-8">
          {hashrateHistory.length > 0 ? (
            <HashrateChart data={hashrateHistory} height={350} />
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
              Top Miners
            </h2>
            <button
              onClick={() => setLocation("/miners")}
              className="text-sm text-primary hover:text-primary/80 hover-elevate active-elevate-2 rounded-lg px-3 py-1"
              data-testid="link-view-all-miners"
            >
              View All →
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {minersLoading ? (
              <LoadingSkeleton type="card" count={6} />
            ) : topMiners && topMiners.length > 0 ? (
              topMiners.slice(0, 6).map((miner) => (
                <MinerCard
                  key={miner.address}
                  miner={miner}
                  onClick={() => setLocation(`/miners/${miner.address}`)}
                />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                No miners found
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-border/50 bg-card/20 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 DAGPulse. Real-time BlockDAG mining analytics.</p>
        </div>
      </footer>
    </div>
  );
}
