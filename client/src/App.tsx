import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import MinerDetails from "@/pages/MinerDetails";
import BlockLookup from "@/pages/BlockLookup";
import AllMiners from "@/pages/AllMiners";
import AllBlocks from "@/pages/AllBlocks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/miners" component={AllMiners} />
      <Route path="/miners/:address" component={MinerDetails} />
      <Route path="/blocks" component={AllBlocks} />
      <Route path="/blocks/:number" component={BlockLookup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
