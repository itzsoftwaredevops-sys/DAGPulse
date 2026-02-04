import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, HelpCircle } from "lucide-react";

const FAQItems = [
  {
    question: "Why did my staking power drop suddenly?",
    answer:
      "Common causes: (1) Network congestion spike, (2) Node overheating (check temps), (3) Node disconnections (verify network settings), (4) Staking threshold issues (verify you meet minimum 2000 AVAX), (5) Validator slashing (maintain 99%+ uptime)",
    category: "Performance",
  },
  {
    question: "What does 'Luck' mean?",
    answer:
      "Luck = Expected blocks vs actual blocks validated. Luck > 100% = you validated more blocks than statistically expected. Luck < 100% = temporary variance. Normal: 80%-120%. Use >10h avg for stability.",
    category: "Concepts",
  },
  {
    question: "How do I maximize staking rewards?",
    answer:
      "1. Run redundant validator nodes (high availability), 2. Maintain 99%+ uptime, 3. Keep network latency <50ms to peers, 4. Monitor node sync status, 5. Stake sufficient AVAX above the 2000 minimum threshold",
    category: "Optimization",
  },
  {
    question: "What causes validator slashing?",
    answer:
      "Slashing occurs when validators act maliciously or have extended downtime. Avoid by: maintaining high uptime, never running duplicate validators with the same keys, keeping nodes properly synced, setting up monitoring alerts.",
    category: "Troubleshooting",
  },
  {
    question: "How often do staking payouts happen?",
    answer:
      "Avalanche staking rewards accumulate continuously and are distributed based on validation performance. Check your validator dashboard for pending rewards. Rewards are calculated based on stake weight and uptime.",
    category: "Rewards",
  },
  {
    question: "What are the hardware requirements for validators?",
    answer:
      "Recommended: 8+ CPU cores, 16GB+ RAM, 1TB SSD, 100+ Mbps internet. Ensure adequate cooling and power supply. Consider redundant nodes for high availability.",
    category: "Hardware",
  },
  {
    question: "How do I reduce power consumption?",
    answer:
      "Use efficient server hardware, enable power saving modes where appropriate, optimize cooling systems, use efficient PSU (80+ Gold or better). Consider cloud hosting for optimal efficiency.",
    category: "Hardware",
  },
  {
    question: "What's the minimum staking requirement?",
    answer:
      "Avalanche requires a minimum of 2000 AVAX to become a validator. Delegators can stake smaller amounts by delegating to existing validators. Check current requirements on the Avalanche documentation.",
    category: "Rewards",
  },
];

const categories = ["All", "Performance", "Concepts", "Optimization", "Troubleshooting", "Rewards", "Hardware"];

export default function AISupport() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Avalanche validation, staking optimization, and DAGPulse features.
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FAQItems.map((item, idx) => (
              <Card
                key={idx}
                className="p-5 space-y-3 hover-elevate transition-all border-border/50"
                data-testid={`card-faq-${idx}`}
              >
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit text-xs">
                    {item.category}
                  </Badge>
                  <h3 className="font-semibold text-sm leading-snug">{item.question}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </Card>
            ))}
          </div>

          {/* Additional Help Section */}
          <Card className="p-8 bg-card/50 border-primary/20 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-primary/50 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
              <p className="text-muted-foreground">
                Can't find your answer? Check the specific pages for detailed information: Validators, Blocks, Forecast, Analytics, and Export sections contain comprehensive data and tools for your validation operation.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
