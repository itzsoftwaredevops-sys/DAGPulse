import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Wallet, Bell, Eye, Lock, Check, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContractInteraction } from "@/lib/useContractInteraction";

export default function Settings() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("2000");
  const [contractAddress, setContractAddress] = useState(localStorage.getItem("contractAddress") || "");
  const { toast } = useToast();
  
  const CONTRACT_CONFIG = {
    address: contractAddress || "0x0000000000000000000000000000000000000000",
    chainId: 43113, // Avalanche Fuji Testnet
  };
  
  const { loading: contractLoading, registerMiner, claimRewards, unstake } = useContractInteraction(CONTRACT_CONFIG);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        toast({
          title: "Wallet Connected",
          description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      if (error.code !== -32602) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
            <p className="text-muted-foreground">Preferences and wallet configuration</p>
          </div>

          {/* Wallet Connection */}
          <Card className="p-6 space-y-6 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Wallet className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="font-semibold">Wallet Connection</h2>
                  <p className="text-sm text-muted-foreground">Connect your Avalanche wallet</p>
                </div>
              </div>
              {walletAddress ? (
                <Badge variant="default" className="gap-2">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>

            {walletAddress ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Connected Address</p>
                  <p className="font-mono text-sm break-all">{walletAddress}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDisconnectWallet}
                  data-testid="button-disconnect-wallet"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                data-testid="button-connect-wallet"
              >
                {isConnecting ? "Connecting..." : "Connect MetaMask / Web3"}
              </Button>
            )}

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="inline h-3 w-3 mr-2" />
                MetaMask required for wallet connection. Make sure you have MetaMask extension
                installed and connected to Avalanche network.
              </p>
            </div>
          </Card>

          {/* Smart Contract Integration */}
          {walletAddress && (
            <Card className="p-6 space-y-6 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Zap className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="font-semibold">Smart Contract - Staking Rewards</h2>
                    <p className="text-sm text-muted-foreground">Stake AVAX to earn validation rewards</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-2">
                  <Check className="h-3 w-3" />
                  Active
                </Badge>
              </div>

              <div className="space-y-4 border-t border-primary/20 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-address">Contract Address (Fuji Testnet)</Label>
                  <Input
                    id="contract-address"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => {
                      setContractAddress(e.target.value);
                      localStorage.setItem("contractAddress", e.target.value);
                    }}
                    className="font-mono text-sm"
                    data-testid="input-contract-address"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deploy StakingRewards.sol to Avalanche Fuji and paste the contract address here
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stake-amount">Stake Amount (AVAX)</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      min="2000"
                      step="100"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="2000"
                      data-testid="input-stake-amount"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      className="w-full"
                      onClick={() => registerMiner(stakeAmount)}
                      disabled={contractLoading || !contractAddress}
                      data-testid="button-register-validator"
                    >
                      {contractLoading ? "Processing..." : "Register Validator"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claimRewards()}
                    disabled={contractLoading || !contractAddress}
                    data-testid="button-claim-rewards"
                  >
                    Claim Rewards
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unstake(stakeAmount)}
                    disabled={contractLoading || !contractAddress}
                    data-testid="button-unstake"
                  >
                    Unstake
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs">
                  <p className="text-muted-foreground">
                    <AlertCircle className="inline h-3 w-3 mr-2" />
                    Minimum stake: 2000 AVAX. Rewards calculated based on validation performance. Use Fuji testnet for testing.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-drops">Staking Power Drop Alerts (&gt;30%)</Label>
                <Switch id="notify-drops" defaultChecked data-testid="switch-staking-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-blocks">New Block Notifications</Label>
                <Switch id="notify-blocks" defaultChecked data-testid="switch-block-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-rewards">Reward Milestone Alerts</Label>
                <Switch id="notify-rewards" defaultChecked data-testid="switch-reward-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-email">Email Notifications (Future)</Label>
                <Switch id="notify-email" disabled data-testid="switch-email-alerts" />
              </div>
            </div>
          </Card>

          {/* Display Preferences */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-semibold">Display Preferences</h2>
            </div>

            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto-Refresh Dashboard (2s)</Label>
                <Switch id="auto-refresh" defaultChecked data-testid="switch-auto-refresh" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-testids">Show Test IDs (Dev Mode)</Label>
                <Switch id="show-testids" data-testid="switch-test-ids" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Display Currency</Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  data-testid="select-currency"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>AVAX (native)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Data & Source Transparency */}
          <Card className="p-6 space-y-4 border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-semibold">Data & Source Transparency</h2>
            </div>

            <div className="space-y-3 border-t border-border/50 pt-4 text-sm">
              <div>
                <p className="font-medium">Pool Staking Power Calculation</p>
                <p className="text-muted-foreground">
                  Sum of all online validators' current staking power. Updated via WebSocket every 1-2s.
                </p>
              </div>

              <div>
                <p className="font-medium">Network Staking Power Source</p>
                <p className="text-muted-foreground">
                  Simulated realistic data (demo mode). Production: connects to Avalanche network API.
                </p>
              </div>

              <div>
                <p className="font-medium">Block Difficulty</p>
                <p className="text-muted-foreground">
                  Derived from network timestamp and total cumulative work. Updates on new blocks.
                </p>
              </div>

              <div>
                <p className="font-medium">Connection Health</p>
                <p className="text-muted-foreground">
                  WebSocket: <Badge variant="default" className="ml-2">Connected</Badge>
                </p>
              </div>

              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {new Date().toLocaleTimeString()} {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Button variant="outline" size="sm" data-testid="button-view-metrics">
                  View Full Metrics Schema
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 space-y-4 border-destructive/30 bg-destructive/5">
            <h2 className="font-semibold text-destructive">Danger Zone</h2>

            <div className="space-y-2 border-t border-border/50 pt-4">
              <p className="text-sm text-muted-foreground">
                Reset all preferences and cached data (keeps favorites).
              </p>
              <Button
                variant="outline"
                data-testid="button-clear-cache"
                className="text-destructive"
              >
                Clear Cache & Reset
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
