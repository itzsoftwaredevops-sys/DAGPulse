import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Miner } from "@shared/schema";

export default function MinerComparison() {
  const [selectedMiners, setSelectedMiners] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const { data: allMiners, isLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const queryMiners = selectedMiners
    .map((addr) => {
      const miner = allMiners?.find((m) => m.address === addr);
      return miner;
    })
    .filter(Boolean) as Miner[];

  const handleAddMiner = (address: string) => {
    if (!selectedMiners.includes(address) && selectedMiners.length < 3) {
      setSelectedMiners([...selectedMiners, address]);
      setSearchInput("");
    }
  };

  const handleRemoveMiner = (address: string) => {
    setSelectedMiners(selectedMiners.filter((a) => a !== address));
  };

  const filteredMiners = allMiners?.filter((m) =>
    m.address.toLowerCase().includes(searchInput.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Miner Comparison</h1>
            <p className="text-muted-foreground">Compare up to 3 miners side-by-side</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search miners by address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                data-testid="input-miner-search"
              />
            </div>

            {searchInput && (
              <div className="space-y-2">
                {filteredMiners.slice(0, 5).map((miner) => (
                  <button
                    key={miner.address}
                    onClick={() => handleAddMiner(miner.address)}
                    disabled={selectedMiners.includes(miner.address) || selectedMiners.length >= 3}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`button-add-miner-${miner.address}`}
                  >
                    {miner.address.slice(0, 6)}...{miner.address.slice(-4)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedMiners.length > 0 && (
            <div className="grid gap-6">
              {queryMiners.map((miner) => (
                <div
                  key={miner.address}
                  className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{miner.address.slice(0, 10)}...{miner.address.slice(-4)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {miner.workers.length} workers online
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMiner(miner.address)}
                      data-testid={`button-remove-miner-${miner.address}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Hashrate</p>
                      <p className="text-xl font-bold">{miner.currentHashrate.toFixed(2)} MH/s</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Blocks</p>
                      <p className="text-xl font-bold">{miner.totalBlocks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Rewards</p>
                      <p className="text-xl font-bold">{miner.totalRewards.toFixed(2)} BDAG</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && <LoadingSkeleton count={3} />}
        </div>
      </main>
    </div>
  );
}
