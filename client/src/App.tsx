import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SplashScreen } from "@/components/SplashScreen";
import Home from "@/pages/Home";
import MinerDetails from "@/pages/MinerDetails";
import BlockLookup from "@/pages/BlockLookup";
import AllMiners from "@/pages/AllMiners";
import AllBlocks from "@/pages/AllBlocks";
import ForecastView from "@/pages/ForecastView";
import MinerComparison from "@/pages/MinerComparison";
import ExportData from "@/pages/ExportData";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import AISupport from "@/pages/AISupport";
import AIChat from "@/pages/AIChat";
import Leaderboard from "@/pages/Leaderboard";
import Guilds from "@/pages/Guilds";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/miners" component={AllMiners} />
      <Route path="/miners/:address" component={MinerDetails} />
      <Route path="/blocks" component={AllBlocks} />
      <Route path="/blocks/:number" component={BlockLookup} />
      <Route path="/forecast" component={ForecastView} />
      <Route path="/compare" component={MinerComparison} />
      <Route path="/analytics" component={AdvancedAnalytics} />
      <Route path="/export" component={ExportData} />
      <Route path="/ai-support" component={AISupport} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/guilds" component={Guilds} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if this is a fresh session (not returning from another page)
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("dagpulse_splash_shown");
    }
    return true;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("dagpulse_splash_shown", "true");
    setShowSplash(false);
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          {showSplash && (
            <SplashScreen 
              onComplete={handleSplashComplete} 
              duration={3000} 
            />
          )}
          <SidebarProvider style={style as React.CSSProperties}>
            <div className={`flex h-screen w-full ${showSplash ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-y-auto">
                <Router />
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
