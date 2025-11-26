import { Link, useLocation, useNavigate } from "wouter";
import { Search, Settings } from "lucide-react";
import logoImage from "@assets/generated_images/dagpulse_neon_gradient_logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const navigate = useNavigate();

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            data-testid="button-settings"
            className="rounded-lg"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="hidden h-9 items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 backdrop-blur-sm md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search...</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
