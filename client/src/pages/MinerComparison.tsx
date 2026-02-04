import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Miner } from "@shared/schema";

export default function MinerComparison() {
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const { data: allValidators, isLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const queryValidators = selectedValidators
    .map((addr) => {
      const validator = allValidators?.find((v) => v.address === addr);
      return validator;
    })
    .filter(Boolean) as Miner[];

  const handleAddValidator = (address: string) => {
    if (!selectedValidators.includes(address) && selectedValidators.length < 3) {
      setSelectedValidators([...selectedValidators, address]);
      setSearchInput("");
    }
  };

  const handleRemoveValidator = (address: string) => {
    setSelectedValidators(selectedValidators.filter((a) => a !== address));
  };

  const filteredValidators = allValidators?.filter((v) =>
    v.address.toLowerCase().includes(searchInput.toLowerCase())
  ) || [];

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
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Validator Comparison</h1>
            <p className="text-muted-foreground">Compare up to 3 validators side-by-side</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search validators by address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                data-testid="input-validator-search"
              />
            </div>

            {searchInput && (
              <div className="space-y-2">
                {filteredValidators.slice(0, 5).map((validator) => (
                  <button
                    key={validator.address}
                    onClick={() => handleAddValidator(validator.address)}
                    disabled={selectedValidators.includes(validator.address) || selectedValidators.length >= 3}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`button-add-validator-${validator.address}`}
                  >
                    {validator.address.slice(0, 6)}...{validator.address.slice(-4)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedValidators.length > 0 && (
            <div className="grid gap-6">
              {queryValidators.map((validator) => (
                <div
                  key={validator.address}
                  className="rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{validator.address.slice(0, 10)}...{validator.address.slice(-4)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {validator.workers.length} nodes online
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveValidator(validator.address)}
                      data-testid={`button-remove-validator-${validator.address}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Staking Power</p>
                      <p className="text-xl font-bold">{formatStakingPower(validator.currentStakingPower)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Blocks Validated</p>
                      <p className="text-xl font-bold">{validator.totalBlocks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Rewards</p>
                      <p className="text-xl font-bold">{validator.totalRewards.toFixed(2)} AVAX</p>
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
