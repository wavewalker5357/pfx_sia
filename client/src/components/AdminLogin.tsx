import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        login('admin');
        // Redirect to admin dashboard
        setLocation('/admin');
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

  const handleBackToLanding = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Access</h1>
          </div>
          <p className="text-muted-foreground">
            AI Summit Ideas • Administration
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Administrator Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the dashboard
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
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Authenticating...' : 'Admin Login'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Demo Credentials:</h4>
              <div className="text-sm text-muted-foreground">
                <div>Username: <code className="bg-background px-1 rounded">admin</code></div>
                <div>Password: <code className="bg-background px-1 rounded">admin123</code></div>
              </div>
            </div>

            {/* Back to Landing */}
            <div className="mt-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToLanding}
                className="w-full"
                data-testid="button-back-to-landing"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Landing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}