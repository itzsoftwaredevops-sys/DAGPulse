import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Clock,
  Hash,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  HardDrive,
  FileText,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Block } from "@shared/schema";

export default function BlockLookup() {
  const [, params] = useRoute("/blocks/:number");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const blockNumber = params?.number ? parseInt(params.number) : undefined;

  const { data: block, isLoading } = useQuery<Block>({
    queryKey: ["/api/blocks", blockNumber],
    enabled: !!blockNumber,
  });

  const handleSearch = (query: string) => {
    const num = parseInt(query);
    if (!isNaN(num)) {
      setLocation(`/blocks/${num}`);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      description: `${label} copied to clipboard`,
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDifficulty = (difficulty: number) => {
    if (difficulty >= 1e12) return `${(difficulty / 1e12).toFixed(2)} T`;
    if (difficulty >= 1e9) return `${(difficulty / 1e9).toFixed(2)} G`;
    if (difficulty >= 1e6) return `${(difficulty / 1e6).toFixed(2)} M`;
    if (difficulty >= 1e3) return `${(difficulty / 1e3).toFixed(2)} K`;
    return difficulty.toLocaleString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 12)}...${hash.slice(-12)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-foreground mb-4 text-center">
            Block Explorer
          </h1>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Enter block number to search..."
          />
        </div>

        {isLoading && <LoadingSkeleton type="card" count={1} />}

        {!isLoading && !block && blockNumber && (
          <Card className="p-12 text-center">
            <Box className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">
              Block Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Block #{blockNumber} doesn't exist or hasn't been validated yet.
            </p>
            <Button onClick={() => setLocation("/blocks")} data-testid="button-explore-blocks">
              Explore Recent Blocks
            </Button>
          </Card>
        )}

        {!isLoading && !block && !blockNumber && (
          <Card className="p-12 text-center">
            <Box className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">
              Search for a Block
            </h2>
            <p className="text-muted-foreground">
              Enter a block number above to view detailed information
            </p>
          </Card>
        )}

        {!isLoading && block && (
          <div className="space-y-6">
            <Card className="overflow-hidden p-6">
              <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-500/10">
                    <Box className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-foreground" data-testid="text-block-number">
                      Block #{block.number.toLocaleString()}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(block.timestamp)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={block.confirmations >= 6 ? "default" : "secondary"}
                  className="text-sm px-4 py-2"
                >
                  {block.confirmations} Confirmations
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Block Hash
                    </span>
                    <button
                      onClick={() => handleCopy(block.hash, "Block Hash")}
                      className="ml-auto rounded p-1 hover-elevate active-elevate-2"
                      data-testid="button-copy-hash"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="font-mono text-sm text-foreground break-all" data-testid="text-block-hash">
                    {block.hash}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Validator Address
                      </span>
                      <button
                        onClick={() => handleCopy(block.validatorAddress, "Validator Address")}
                        className="ml-auto rounded p-1 hover-elevate active-elevate-2"
                        data-testid="button-copy-validator"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                    <button
                      onClick={() => setLocation(`/miners/${block.validatorAddress}`)}
                      className="font-mono text-sm text-primary hover:text-primary/80 break-all text-left"
                      data-testid="link-validator-address"
                    >
                      {truncateHash(block.validatorAddress)}
                    </button>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Timestamp
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {formatTimestamp(block.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Difficulty</p>
                    <p className="font-['Space_Grotesk'] text-xl font-bold text-foreground" data-testid="text-difficulty">
                      {formatDifficulty(block.difficulty)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Reward</p>
                    <p className="font-['Space_Grotesk'] text-xl font-bold text-foreground" data-testid="text-reward">
                      {block.reward} AVAX
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="mb-1 flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Size</p>
                    </div>
                    <p className="font-['Space_Grotesk'] text-xl font-bold text-foreground" data-testid="text-size">
                      {(block.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                    <p className="font-['Space_Grotesk'] text-xl font-bold text-foreground" data-testid="text-transactions">
                      {block.transactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setLocation(`/blocks/${block.number - 1}`)}
                disabled={block.number <= 1}
                data-testid="button-prev-block"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Block
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation(`/blocks/${block.number + 1}`)}
                data-testid="button-next-block"
              >
                Next Block
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
