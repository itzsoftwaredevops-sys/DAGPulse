import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { HashrateChart } from "@/components/HashrateChart";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Award,
  TrendingUp,
  Copy,
  ArrowLeft,
  Server,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RiskIndicator } from "@/components/RiskIndicator";
import type { Miner, Worker } from "@shared/schema";

export default function MinerDetails() {
  const [, params] = useRoute("/miners/:address");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: miner, isLoading } = useQuery<Miner>({
    queryKey: ["/api/miners", params?.address],
    enabled: !!params?.address,
  });

  const handleCopyAddress = () => {
    if (miner?.address) {
      navigator.clipboard.writeText(miner.address);
      toast({
        title: "Address Copied",
        description: "Miner address copied to clipboard",
      });
    }
  };

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
    if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`;
    if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`;
    if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} KH/s`;
    return `${hashrate.toFixed(2)} H/s`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getWorkerStatusColor = (status: Worker["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <LoadingSkeleton type="card" count={3} />
        </main>
      </div>
    );
  }

  if (!miner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Card className="p-12 text-center">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">
              Miner Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The miner address you're looking for doesn't exist.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-8 overflow-hidden p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">
                  Miner Profile
                </h1>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-muted-foreground break-all" data-testid="text-miner-address">
                    {miner.address}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="rounded-lg p-1 hover-elevate active-elevate-2"
                    data-testid="button-copy-address"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Last active: {formatTimestamp(miner.lastActive)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Blocks</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-foreground" data-testid="text-total-blocks">
                  {miner.totalBlocks.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Rewards</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-foreground" data-testid="text-total-rewards">
                  {miner.totalRewards.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Network Share</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-primary" data-testid="text-network-share">
                  {miner.networkContribution.toFixed(3)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Current Luck</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-purple-500" data-testid="text-current-luck">
                  {miner.currentLuck.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        </Card>

        <RiskIndicator miner={miner} />

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-foreground">
                Performance (24h)
              </h2>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Hashrate</span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-current-hashrate">
                  {formatHashrate(miner.currentHashrate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Hashrate</span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-average-hashrate">
                  {formatHashrate(miner.averageHashrate24h)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Efficiency</span>
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-green-500">
                    {((miner.currentHashrate / miner.averageHashrate24h) * 100).toFixed(1)}%
                  </span>
                  <Award className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-foreground">
                Worker Devices
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {miner.workers.length} Active
              </Badge>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {miner.workers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"
                  data-testid={`worker-${worker.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${getWorkerStatusColor(worker.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {worker.shares.toLocaleString()} shares
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatHashrate(worker.hashrate)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(worker.lastSeen)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          {miner.hashrateHistory && miner.hashrateHistory.length > 0 ? (
            <HashrateChart
              data={miner.hashrateHistory}
              title="Hashrate History (24h)"
              height={400}
            />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No hashrate history available</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
