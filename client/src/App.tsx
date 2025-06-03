import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvitePage from "@/pages/invite";
import WelcomePage from "@/pages/welcome";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InvitePage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
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
