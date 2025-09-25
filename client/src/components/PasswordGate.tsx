import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, Users, Shield, Calendar, Clock, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { CountdownTimer } from './CountdownTimer';
import type { LandingPageSettings } from '@shared/schema';

interface PasswordGateProps {
  onAttendeeAccess: () => void;
  onAdminAccess: () => void;
}

export default function PasswordGate({ onAttendeeAccess, onAdminAccess }: PasswordGateProps) {
  const { toast } = useToast();
  const [attendeePassword, setAttendeePassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch landing page settings to determine which mode to show
  const { data: landingPageSettings, isLoading: isLoadingSettings } = useQuery<LandingPageSettings>({
    queryKey: ['/api/landing-page-settings'],
    queryFn: async () => {
      const response = await fetch('/api/landing-page-settings', {
        credentials: 'include'
      });
      if (!response.ok) {
        // If no settings exist, default to summit mode
        if (response.status === 404) {
          return { mode: 'summit' } as LandingPageSettings;
        }
        throw new Error('Failed to fetch landing page settings');
      }
      return response.json();
    },
    retry: false,
  });

  const handleAttendeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (attendeePassword === 'summit2025') {
        toast({
          title: "Welcome to AI Summit Ideas!",
          description: "You can now submit and browse ideas.",
        });
        onAttendeeAccess();
      } else {
        toast({
          title: "Invalid password",
          description: "Please check the password and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (adminUsername === 'admin' && adminPassword === 'admin123') {
        toast({
          title: "Admin access granted",
          description: "Welcome to the admin dashboard.",
        });
        onAdminAccess();
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your username and password.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine current mode (default to summit if no settings)
  const currentMode = landingPageSettings?.mode || 'summit';

  // Maintenance Mode
  if (currentMode === 'maintenance') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Product & Engineering Summit 2025
            </p>
          </div>

          {/* Maintenance Message */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-semibold">Platform Under Maintenance</h2>
                <p className="text-lg text-muted-foreground" data-testid="text-maintenance-message">
                  {landingPageSettings?.maintenanceMessage || 
                   "The AI Summit platform is currently under construction. Please check back soon!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Countdown Mode
  if (currentMode === 'countdown') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Product & Engineering Summit 2025
            </p>
            <p className="text-muted-foreground">
              September 30th - October 2nd • Collaborative Idea Platform
            </p>
          </div>

          {/* Countdown Timer */}
          <Card>
            <CardContent className="p-8">
              <CountdownTimer
                targetDate={landingPageSettings?.summitStartDate ? new Date(landingPageSettings.summitStartDate) : new Date('2025-10-01T08:00:00.000Z')}
                message={landingPageSettings?.countdownMessage || "Time to start of the Pricefx Product & Engineering Summit"}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Summit Mode (default) - show login interface
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            Product & Engineering Summit 2025
          </p>
          <p className="text-muted-foreground">
            September 30th - October 2nd • Collaborative Idea Platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendee Access */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Summit Attendees</CardTitle>
              </div>
              <CardDescription>
                Enter the shared password to access the collaboration platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAttendeeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee-password">Access Password</Label>
                  <Input
                    id="attendee-password"
                    type="password"
                    placeholder="Enter shared password"
                    value={attendeePassword}
                    onChange={(e) => setAttendeePassword(e.target.value)}
                    data-testid="input-attendee-password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-attendee-login"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Checking...' : 'Enter Summit'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Submit AI ideas, stories, and solutions</li>
                  <li>• Browse all submitted ideas</li>
                  <li>• View participation analytics</li>
                  <li>• Filter and search contributions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Administrator</CardTitle>
              </div>
              <CardDescription>
                Admin login for platform management and advanced analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Admin username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    data-testid="input-admin-username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    data-testid="input-admin-password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-admin-login"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Authenticating...' : 'Admin Login'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Admin features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manage shared access password</li>
                  <li>• Export data in CSV/JSON format</li>
                  <li>• View detailed analytics</li>
                  <li>• Bulk operations and moderation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-4">Demo Credentials for Testing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <strong>Attendee Access:</strong>
                  <br />
                  Password: <code className="bg-white dark:bg-gray-800 px-1 rounded">summit2025</code>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <strong>Admin Access:</strong>
                  <br />
                  Username: <code className="bg-white dark:bg-gray-800 px-1 rounded">admin</code>
                  <br />
                  Password: <code className="bg-white dark:bg-gray-800 px-1 rounded">admin123</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}