import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileJson, FileText } from "lucide-react";
import { useState } from "react";
import {
  exportMinersToCSV,
  exportBlocksToCSV,
  exportMinersToJSON,
  exportBlocksToJSON,
  downloadFile,
} from "@/lib/exportUtils";
import type { Miner, Block } from "@shared/schema";

export default function ExportData() {
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: miners, isLoading: minersLoading } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

  const handleExport = (format: "csv" | "json", dataType: "miners" | "blocks") => {
    setExporting(`${dataType}-${format}`);

    try {
      let content = "";
      let filename = "";

      if (dataType === "miners" && miners) {
        content =
          format === "csv"
            ? exportMinersToCSV(miners)
            : exportMinersToJSON(miners);
        filename = `miners-export-${new Date().toISOString().split("T")[0]}.${format}`;
      } else if (dataType === "blocks" && blocks) {
        content =
          format === "csv"
            ? exportBlocksToCSV(blocks)
            : exportBlocksToJSON(blocks);
        filename = `blocks-export-${new Date().toISOString().split("T")[0]}.${format}`;
      }

      if (content) {
        downloadFile(content, filename, format);
      }
    } finally {
      setExporting(null);
    }
  };

  const isLoading = minersLoading || blocksLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Export Data</h1>
            <p className="text-muted-foreground">
              Download mining reports and block history in CSV or JSON format
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Miners Export */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Miners Report</h2>
                <p className="text-sm text-muted-foreground">
                  Export all miner statistics including hashrate, blocks, rewards, and
                  network contribution
                </p>
                <div className="mt-4 p-3 bg-card/50 rounded-lg border border-border/50">
                  <p className="text-sm">
                    <strong>{miners?.length || 0}</strong> miners available
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleExport("csv", "miners")}
                  disabled={isLoading || exporting === "miners-csv"}
                  data-testid="button-export-miners-csv"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {exporting === "miners-csv" ? "Exporting..." : "Export as CSV"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport("json", "miners")}
                  disabled={isLoading || exporting === "miners-json"}
                  data-testid="button-export-miners-json"
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  {exporting === "miners-json" ? "Exporting..." : "Export as JSON"}
                </Button>
              </div>
            </Card>

            {/* Blocks Export */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Block History</h2>
                <p className="text-sm text-muted-foreground">
                  Export block details including number, hash, difficulty, rewards, and
                  confirmations
                </p>
                <div className="mt-4 p-3 bg-card/50 rounded-lg border border-border/50">
                  <p className="text-sm">
                    <strong>{blocks?.length || 0}</strong> blocks available
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleExport("csv", "blocks")}
                  disabled={isLoading || exporting === "blocks-csv"}
                  data-testid="button-export-blocks-csv"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {exporting === "blocks-csv" ? "Exporting..." : "Export as CSV"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport("json", "blocks")}
                  disabled={isLoading || exporting === "blocks-json"}
                  data-testid="button-export-blocks-json"
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  {exporting === "blocks-json" ? "Exporting..." : "Export as JSON"}
                </Button>
              </div>
            </Card>
          </div>

          {isLoading && <LoadingSkeleton count={2} />}

          <Card className="p-6 space-y-4 border-border/50 bg-card/50">
            <h2 className="text-lg font-semibold">Export Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">CSV Format</p>
                <p className="text-muted-foreground">
                  Comma-separated values, easy to import into Excel or other spreadsheet
                  applications
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">JSON Format</p>
                <p className="text-muted-foreground">
                  JavaScript Object Notation, ideal for data processing and analysis tools
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Data Included</p>
                <p className="text-muted-foreground">
                  All miner statistics and block details from the current network state. Data
                  is exported as-is without historical tracking.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
