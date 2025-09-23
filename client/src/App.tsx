import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Plus, Search, Shield } from "lucide-react";

import PasswordGate from "@/components/PasswordGate";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";
import IdeaBrowser from "@/components/IdeaBrowser";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import ThemeToggle from "@/components/ThemeToggle";

type UserType = 'none' | 'attendee' | 'admin';

function AttendeeApp() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Summit Ideas</h1>
              <p className="text-sm text-muted-foreground">Product & Engineering Summit 2025</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
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

          <TabsContent value="submit" className="space-y-6">
            <IdeaSubmissionForm />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <IdeaBrowser />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AdminApp() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">AI Summit Admin</h1>
                <p className="text-sm text-muted-foreground">Platform Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AdminDashboard />
      </main>
    </div>
  );
}

function Router() {
  const [userType, setUserType] = useState<UserType>('none');

  if (userType === 'none') {
    return (
      <PasswordGate
        onAttendeeAccess={() => setUserType('attendee')}
        onAdminAccess={() => setUserType('admin')}
      />
    );
  }

  return userType === 'admin' ? <AdminApp /> : <AttendeeApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}