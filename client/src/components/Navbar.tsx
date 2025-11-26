import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Settings, HelpCircle, ChevronDown } from "lucide-react";
import logoImage from "@assets/generated_images/dagpulse_neon_gradient_logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FAQItems = [
  {
    question: "Why did my hashrate drop?",
    answer:
      "Check network difficulty, worker connections, hardware temperature, or intensity settings. Verify pool connection and reduce intensity by 10% if needed.",
  },
  {
    question: "What does 'Luck' mean?",
    answer:
      "Luck is expected vs actual shares found. >100% means you found more blocks than expected. <100% is normal variance. Use 10h+ averages for stability.",
  },
  {
    question: "How to maximize rewards?",
    answer:
      "Run multiple workers, optimize intensity (start at 64), keep temps <75°C, check pool latency <50ms, and enable SSL if available.",
  },
  {
    question: "What causes stale shares?",
    answer:
      "Submission arrives after network found block. Minimize by reducing latency, using closer pool server, and lowering intensity by 5%.",
  },
  {
    question: "How often are payouts?",
    answer:
      "BlockDAG pays every ~1 hour. Must exceed pool minimum (usually 1 BDAG). Check pool dashboard for pending rewards.",
  },
];

export function Navbar() {
  const [location] = useLocation();
  const [faqOpen, setFaqOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/miners", label: "Miners" },
    { path: "/blocks", label: "Blocks" },
    { path: "/forecast", label: "Forecast" },
    { path: "/analytics", label: "Analytics" },
    { path: "/compare", label: "Compare" },
    { path: "/export", label: "Export" },
  ];

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full items-center justify-between gap-4 px-4 md:px-6">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="rounded-lg" />
        
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-2 py-1 transition-transform hover:scale-105">
            <img src={logoImage} alt="DAGPulse" className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-lg font-bold bg-neon-gradient bg-clip-text text-transparent">
                DAGPulse
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Real-Time Mining
              </span>
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} data-testid={`link-${link.label.toLowerCase()}`}>
              <button
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover-elevate active-elevate-2"
                }`}
              >
                {link.label}
              </button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationCenter />
          
          {/* FAQ Dropdown */}
          <DropdownMenu open={faqOpen} onOpenChange={setFaqOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-faq"
                className="rounded-lg"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Frequently Asked Questions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FAQItems.map((item, idx) => (
                <DropdownMenuItem key={idx} className="flex-col items-start py-3" data-testid={`faq-item-${idx}`}>
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.answer}</p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/ai-support" className="text-primary">
                  <p className="text-sm font-medium">View Full AI Support Page →</p>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-settings"
              className="rounded-lg"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <div className="hidden h-9 items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 backdrop-blur-sm md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search...</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
