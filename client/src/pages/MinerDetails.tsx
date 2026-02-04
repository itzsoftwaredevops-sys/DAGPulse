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

  const { data: validator, isLoading } = useQuery<Miner>({
    queryKey: ["/api/miners", params?.address],
    enabled: !!params?.address,
  });

  const handleCopyAddress = () => {
    if (validator?.address) {
      navigator.clipboard.writeText(validator.address);
      toast({
        title: "Address Copied",
        description: "Validator address copied to clipboard",
      });
    }
  };

  const formatStakingPower = (power: number) => {
    if (power >= 1e6) return `${(power / 1e6).toFixed(2)} M AVAX`;
    if (power >= 1e3) return `${(power / 1e3).toFixed(2)} K AVAX`;
    return `${power.toFixed(2)} AVAX`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNodeStatusColor = (status: Worker["status"]) => {
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

  if (!validator) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Card className="p-12 text-center">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">
              Validator Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The validator address you're looking for doesn't exist.
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
                  Validator Profile
                </h1>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-muted-foreground break-all" data-testid="text-validator-address">
                    {validator.address}
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
                  Last active: {formatTimestamp(validator.lastActive)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Blocks Validated</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-foreground" data-testid="text-total-blocks">
                  {validator.totalBlocks.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Rewards</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-foreground" data-testid="text-total-rewards">
                  {validator.totalRewards.toLocaleString()} AVAX
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Network Share</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-primary" data-testid="text-network-share">
                  {validator.networkContribution.toFixed(3)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Current Luck</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-purple-500" data-testid="text-current-luck">
                  {validator.currentLuck.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        </Card>

        <RiskIndicator miner={validator} />

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
                <span className="text-sm text-muted-foreground">Current Staking Power</span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-current-staking-power">
                  {formatStakingPower(validator.currentStakingPower)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Staking Power</span>
                <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground" data-testid="text-average-staking-power">
                  {formatStakingPower(validator.averageStakingPower24h)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Efficiency</span>
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-green-500">
                    {((validator.currentStakingPower / validator.averageStakingPower24h) * 100).toFixed(1)}%
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
                Validator Nodes
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {validator.workers.length} Active
              </Badge>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {validator.workers.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"
                  data-testid={`node-${node.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${getNodeStatusColor(node.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{node.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {node.shares.toLocaleString()} validations
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatStakingPower(node.stakingPower)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(node.lastSeen)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          {validator.stakingPowerHistory && validator.stakingPowerHistory.length > 0 ? (
            <HashrateChart
              data={validator.stakingPowerHistory}
              title="Staking Power History (24h)"
              height={400}
            />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No staking power history available</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
