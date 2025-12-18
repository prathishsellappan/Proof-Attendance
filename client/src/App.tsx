import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Verify from "@/pages/verify";

import OrganizerLogin from "@/pages/auth/organizer-login";
import OrganizerRegister from "@/pages/auth/organizer-register";
import OrganizerDashboard from "@/pages/organizer/dashboard";
import CreateEvent from "@/pages/organizer/create-event";
import OrganizerEventDetail from "@/pages/organizer/event-detail";

import StudentLogin from "@/pages/auth/student-login";
import StudentRegister from "@/pages/auth/student-register";
import StudentDashboard from "@/pages/student/dashboard";
import StudentProfile from "@/pages/student/profile";
import ClaimBadge from "@/pages/student/claim-badge";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Landing} />
      <Route path="/verify" component={Verify} />

      {/* Organizer Auth */}
      <Route path="/organizer/login" component={OrganizerLogin} />
      <Route path="/organizer/register" component={OrganizerRegister} />
      
      {/* Organizer Dashboard */}
      <Route path="/organizer/dashboard" component={OrganizerDashboard} />
      <Route path="/organizer/create-event" component={CreateEvent} />
      <Route path="/organizer/event/:id" component={OrganizerEventDetail} />

      {/* Student Auth */}
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/student/register" component={StudentRegister} />
      
      {/* Student Dashboard */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/event/:id" component={ClaimBadge} />
      <Route path="/student/badge/:id" component={ClaimBadge} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
