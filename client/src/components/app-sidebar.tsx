import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Blocks,
  TrendingUp,
  MessageCircle,
  Trophy,
  Wrench,
  Settings,
  BarChart3,
  Zap,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    description: "Live metrics & snapshot",
  },
  {
    title: "Miners",
    icon: Users,
    path: "/miners",
    description: "Address lookup, Workers, Compare",
  },
  {
    title: "Blocks",
    icon: Blocks,
    path: "/blocks",
    description: "Explorer & details",
  },
  {
    title: "Forecast",
    icon: TrendingUp,
    path: "/forecast",
    description: "Trend predictions & scenarios",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    description: "30-day insights & trends",
  },
  {
    title: "AI Support",
    icon: MessageCircle,
    path: "/ai-support",
    description: "Ask DAGPulse (chat) + FAQ",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
    description: "Top miners & guilds",
  },
  {
    title: "Guilds",
    icon: Users,
    path: "/guilds",
    description: "Teams & collaboration",
  },
  {
    title: "Tools",
    icon: Wrench,
    path: "/export",
    description: "Export / Snapshot / Profit",
  },
];

const bottomItems = [
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    description: "Preferences & wallet",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-card/30 backdrop-blur-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`button-sidebar-${item.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground/70">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Account
          </SidebarGroupLabel>
          <SidebarMenu>
            {bottomItems.map((item) => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`button-sidebar-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
