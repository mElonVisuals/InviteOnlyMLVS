import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvitePage from "@/pages/invite";
import WelcomePage from "@/pages/welcome";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import DashboardPage from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import UsersPage from "@/pages/users";
import SystemPage from "@/pages/system";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InvitePage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/system" component={SystemPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={InvitePage} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

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
