import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvitePage from "@/pages/invite";
import WelcomePage from "@/pages/welcome";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InvitePage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route component={InvitePage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
