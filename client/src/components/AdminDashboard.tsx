import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Settings, 
  Trash2, 
  Key, 
  FileText, 
  Shield,
  Activity,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AnalyticsDashboard from './AnalyticsDashboard';

// Mock data for admin - TODO: remove mock functionality
const recentActivity = [
  { action: 'New idea submitted', user: 'Sarah Chen', time: '2 minutes ago', type: 'success' },
  { action: 'Export generated', user: 'Admin', time: '15 minutes ago', type: 'info' },
  { action: 'Password changed', user: 'Admin', time: '1 hour ago', type: 'warning' },
  { action: 'Bulk delete performed', user: 'Admin', time: '2 hours ago', type: 'destructive' },
];

const systemStats = {
  totalIdeas: 145,
  todaySubmissions: 28,
  activeUsers: 89,
  storageUsed: '2.4 MB',
  uptime: '99.9%',
  lastBackup: '10 minutes ago',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [sharedPassword, setSharedPassword] = useState('summit2025');
  const [isExporting, setIsExporting] = useState(false);

  const handlePasswordChange = () => {
    console.log('Changing shared password to:', sharedPassword);
    toast({
      title: "Password updated",
      description: "The shared access password has been changed successfully.",
    });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      console.log(`Exporting data in ${format} format`);
      // TODO: Replace with actual export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export successful",
        description: `Ideas exported in ${format.toUpperCase()} format.`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = () => {
    console.log('Performing bulk delete');
    toast({
      title: "Bulk operation completed",
      description: "Selected ideas have been deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage the AI Summit collaboration platform
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin Access
        </Badge>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" data-testid="text-total-ideas">
              {systemStats.totalIdeas}
            </div>
            <p className="text-xs text-muted-foreground">Total Ideas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600" data-testid="text-today-submissions">
              {systemStats.todaySubmissions}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600" data-testid="text-active-users">
              {systemStats.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" data-testid="text-storage">
              {systemStats.storageUsed}
            </div>
            <p className="text-xs text-muted-foreground">Storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600" data-testid="text-uptime">
              {systemStats.uptime}
            </div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium" data-testid="text-backup">
              {systemStats.lastBackup}
            </div>
            <p className="text-xs text-muted-foreground">Last Backup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Controls
            </CardTitle>
            <CardDescription>Manage platform settings and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Management */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Shared Access Password
              </Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={sharedPassword}
                  onChange={(e) => setSharedPassword(e.target.value)}
                  data-testid="input-password"
                />
                <Button 
                  onClick={handlePasswordChange}
                  data-testid="button-update-password"
                >
                  Update
                </Button>
              </div>
            </div>

            <Separator />

            {/* Export Options */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Export Data
              </Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  data-testid="button-export-json"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </div>
            </div>

            <Separator />

            {/* Bulk Operations */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Bulk Operations
              </Label>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                className="w-full"
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform events and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" data-testid={`text-activity-${index}`}>
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.user}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm">Auto-backup enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Include Analytics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}