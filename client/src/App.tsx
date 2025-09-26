import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Plus, Search, Shield, Home } from "lucide-react";

import PasswordGate from "@/components/PasswordGate";
import AdminLogin from "@/components/AdminLogin";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";
import IdeaViewer from "@/components/IdeaViewer";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import ThemeToggle from "@/components/ThemeToggle";
import SummitResourcesDropdown from "@/components/SummitResourcesDropdown";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SummitHomePage from "@/components/SummitHomePage";

function AttendeeApp() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin={false} />

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home" data-testid="tab-home" className="px-3">
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="submit" data-testid="tab-submit">
              <Plus className="w-4 h-4 mr-2" />
              Submit Ideas
            </TabsTrigger>
            <TabsTrigger value="browse" data-testid="tab-browse">
              <Search className="w-4 h-4 mr-2" />
              Browse Ideas
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <SummitHomePage />
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <IdeaSubmissionForm />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <IdeaViewer />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Protected Admin Route Component
function ProtectedAdminRoute() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      setLocation('/admin-login');
    }
  }, [isAdmin, setLocation]);

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin={true} />
      <main className="container mx-auto px-4 py-6">
        <AdminDashboard />
      </main>
    </div>
  );
}

// Attendee Gate Component - handles attendee login and redirect
function AttendeeGate() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleAttendeeAccess = () => {
    login('attendee');
    setLocation('/attendee');
  };

  const handleAdminRedirect = () => {
    setLocation('/admin-login');
  };

  return (
    <PasswordGate
      onAttendeeAccess={handleAttendeeAccess}
      onAdminAccess={handleAdminRedirect}
    />
  );
}

// Protected Attendee Route Component
function ProtectedAttendeeRoute() {
  const { userType } = useAuth();
  const [, setLocation] = useLocation();

  // Check both React state and sessionStorage to avoid race condition
  const isAttendee = userType === 'attendee' || 
    (userType === 'none' && sessionStorage.getItem('userType') === 'attendee');

  useEffect(() => {
    if (!isAttendee) {
      setLocation('/');
    }
  }, [isAttendee, setLocation]);

  if (!isAttendee) {
    return null; // Will redirect via useEffect
  }

  return <AttendeeApp />;
}

// Fallback redirect component
function FallbackRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation('/');
  }, [setLocation]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public landing page - shows PasswordGate for attendee access */}
      <Route path="/" component={AttendeeGate} />
      
      {/* Always accessible admin login */}
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Protected admin dashboard */}
      <Route path="/admin" component={ProtectedAdminRoute} />
      
      {/* Protected attendee area */}
      <Route path="/attendee" component={ProtectedAttendeeRoute} />
      
      {/* Fallback - redirect to home */}
      <Route component={FallbackRedirect} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}