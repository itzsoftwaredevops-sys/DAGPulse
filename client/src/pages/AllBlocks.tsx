import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { BlockCard } from "@/components/BlockCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Block } from "@shared/schema";

export default function AllBlocks() {
  const [, setLocation] = useLocation();

  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

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

        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-foreground mb-4 text-center">
            Recent Blocks
          </h1>
          <SearchBar placeholder="Search by block number..." />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <LoadingSkeleton type="card" count={9} />
          ) : blocks && blocks.length > 0 ? (
            blocks.map((block) => (
              <BlockCard
                key={block.number}
                block={block}
                onClick={() => setLocation(`/blocks/${block.number}`)}
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-muted-foreground">
              No blocks found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
