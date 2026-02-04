import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, Award, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_GUILDS = [
  {
    id: "guild-1",
    name: "Avalanche Validators United",
    members: 42,
    totalStakingPower: 125400000,
    totalRewards: 2500,
    joinedDate: "2024-06-15",
    rank: 1,
  },
  {
    id: "guild-2",
    name: "AVAX Staking Collective",
    members: 38,
    totalStakingPower: 98700000,
    totalRewards: 2100,
    joinedDate: "2024-07-01",
    rank: 2,
  },
  {
    id: "guild-3",
    name: "Snowman Alliance",
    members: 25,
    totalStakingPower: 67200000,
    totalRewards: 1400,
    joinedDate: "2024-08-10",
    rank: 3,
  },
];

export default function Guilds() {
  const [newGuildName, setNewGuildName] = useState("");

  const formatStakingPower = (power: number) => {
    if (power >= 1e6) return `${(power / 1e6).toFixed(2)} M AVAX`;
    if (power >= 1e3) return `${(power / 1e3).toFixed(2)} K AVAX`;
    return `${power.toFixed(2)} AVAX`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Guilds & Teams</h1>
              <p className="text-muted-foreground">
                Join validator guilds to collaborate and compete with other validators
              </p>
            </div>
            <Button size="lg" data-testid="button-create-guild">
              <Plus className="mr-2 h-4 w-4" />
              Create Guild
            </Button>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Guilds</TabsTrigger>
              <TabsTrigger value="my">My Guild</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_GUILDS.map((guild) => (
                  <Card
                    key={guild.id}
                    className="p-6 space-y-4 hover-elevate transition-all"
                    data-testid={`card-guild-${guild.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Rank #{guild.rank}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{guild.name}</h3>
                      </div>
                      <Award className="h-5 w-5 text-muted-foreground/50" />
                    </div>

                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="font-semibold">{guild.members}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Total Staking Power</p>
                        <p className="font-semibold">{formatStakingPower(guild.totalStakingPower)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Rewards</p>
                        <p className="font-semibold text-green-500">{guild.totalRewards.toFixed(2)} AVAX</p>
                      </div>
                    </div>

                    <Button className="w-full" data-testid={`button-join-guild-${guild.id}`}>
                      Join Guild
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my" className="space-y-6 mt-6">
              <Card className="p-8 text-center border-dashed">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Guild Joined Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new guild or join an existing one to start collaborating with other validators
                </p>
                <div className="space-y-3 max-w-sm mx-auto">
                  <Input
                    placeholder="Guild name"
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    data-testid="input-new-guild-name"
                  />
                  <Button className="w-full" data-testid="button-create-new-guild">
                    Create My Guild
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Guild Benefits */}
          <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
            <h2 className="font-semibold text-lg">Guild Benefits</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <TrendingUp className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium mb-1">Aggregated Stats</p>
                <p className="text-sm text-muted-foreground">
                  View combined staking power, blocks validated, and rewards across your guild
                </p>
              </div>
              <div>
                <Users className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium mb-1">Team Collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Share insights and optimize validation together
                </p>
              </div>
              <div>
                <Award className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium mb-1">Leaderboard Ranks</p>
                <p className="text-sm text-muted-foreground">
                  Compete for guild rankings and special achievements
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
