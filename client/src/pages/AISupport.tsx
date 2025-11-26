import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, HelpCircle } from "lucide-react";

const FAQItems = [
  {
    question: "Why did my hashrate drop suddenly?",
    answer:
      "Common causes: (1) Network difficulty spike, (2) Hardware overheating (check temps), (3) Worker disconnections (verify pool settings), (4) Intensity too high (reduce by 10%), (5) ISP throttling (contact provider)",
    category: "Performance",
  },
  {
    question: "What does 'Luck' mean?",
    answer:
      "Luck = Expected shares vs actual shares. Luck > 100% = you found more blocks than statistically expected. Luck < 100% = temporary variance. Normal: 80%-120%. Use >10h avg for stability.",
    category: "Concepts",
  },
  {
    question: "How do I maximize rewards?",
    answer:
      "1. Run multiple workers (load balance), 2. Optimize intensity (starts at 64, increase by 1 until stability drops), 3. Monitor temp < 75°C, 4. Check network latency to pool (target <50ms), 5. Enable SSL if available",
    category: "Optimization",
  },
  {
    question: "What causes orphaned blocks?",
    answer:
      "Stale shares submitted after network finds block. Minimize by: reducing network latency, using geographically close pool, enabling TCP Fast Open, updating driver software.",
    category: "Troubleshooting",
  },
  {
    question: "How often do payouts happen?",
    answer:
      "BlockDAG pays every ~1h (3600s payout interval). Must exceed pool minimum (usually 1 BDAG). Check your account; pending payouts appear in wallet.",
    category: "Rewards",
  },
  {
    question: "What GPU/CPU is best for mining?",
    answer:
      "GPUs generally perform better than CPUs. Top choices: RTX 4090, RTX 4080, RX 7900 XTX. For CPU mining: AMD Ryzen 9 7950X. Ensure adequate cooling and power supply.",
    category: "Hardware",
  },
  {
    question: "How do I reduce power consumption?",
    answer:
      "Lower GPU clock by 100-200MHz, reduce memory clock by 50-100MHz, enable power saving modes, adjust intensity settings downward, use efficient PSU (80+ Gold or better).",
    category: "Hardware",
  },
  {
    question: "What's the minimum pool payout?",
    answer:
      "Varies by pool but typically 0.5-1 BDAG. Check your pool dashboard for exact minimum. Payouts are automatic when you exceed the threshold.",
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
              Find answers to common questions about mining, optimization, and DAGPulse features.
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
                Can't find your answer? Check the specific pages for detailed information: Miners, Blocks, Forecast, Analytics, and Export sections contain comprehensive data and tools for your mining operation.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
