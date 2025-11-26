import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Wallet, Bell, Eye, Lock } from "lucide-react";

export default function Settings() {
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
                  <p className="text-sm text-muted-foreground">Connect your BlockDAG wallet</p>
                </div>
              </div>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <Button className="w-full" data-testid="button-connect-wallet">
              Connect MetaMask / Web3
            </Button>
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Live wallet connection coming in v2. For now, enter your miner address above to track
              stats.
            </p>
          </Card>

          {/* Notifications */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-drops">Hashrate Drop Alerts (&gt;30%)</Label>
                <Switch id="notify-drops" defaultChecked data-testid="switch-hashrate-alerts" />
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
                  <option>BDAG (native)</option>
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
                <p className="font-medium">Pool Hashrate Calculation</p>
                <p className="text-muted-foreground">
                  Sum of all online miners' current hashrate. Updated via WebSocket every 1-2s.
                </p>
              </div>

              <div>
                <p className="font-medium">Network Hashrate Source</p>
                <p className="text-muted-foreground">
                  Simulated realistic data (demo mode). Production: connects to BlockDAG network API.
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
