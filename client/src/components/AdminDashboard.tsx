import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { 
  Download, 
  Settings, 
  Trash2, 
  Key, 
  FileText, 
  Shield,
  Activity,
  AlertCircle,
  Clock,
  Plus,
  Edit,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SummitResource, InsertSummitResource } from '@shared/schema';
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

// 24-hour submission data for admin dashboard - TODO: remove mock functionality
const hourlySubmissions = [
  { hour: '00:00', submissions: 0, label: '12 AM' },
  { hour: '01:00', submissions: 0, label: '1 AM' },
  { hour: '02:00', submissions: 0, label: '2 AM' },
  { hour: '03:00', submissions: 0, label: '3 AM' },
  { hour: '04:00', submissions: 0, label: '4 AM' },
  { hour: '05:00', submissions: 0, label: '5 AM' },
  { hour: '06:00', submissions: 1, label: '6 AM' },
  { hour: '07:00', submissions: 2, label: '7 AM' },
  { hour: '08:00', submissions: 5, label: '8 AM' },
  { hour: '09:00', submissions: 12, label: '9 AM' },
  { hour: '10:00', submissions: 18, label: '10 AM' },
  { hour: '11:00', submissions: 15, label: '11 AM' },
  { hour: '12:00', submissions: 8, label: '12 PM' },
  { hour: '13:00', submissions: 22, label: '1 PM' },
  { hour: '14:00', submissions: 28, label: '2 PM' },
  { hour: '15:00', submissions: 35, label: '3 PM' },
  { hour: '16:00', submissions: 42, label: '4 PM' }, // Peak hour
  { hour: '17:00', submissions: 38, label: '5 PM' },
  { hour: '18:00', submissions: 25, label: '6 PM' },
  { hour: '19:00', submissions: 12, label: '7 PM' },
  { hour: '20:00', submissions: 8, label: '8 PM' },
  { hour: '21:00', submissions: 3, label: '9 PM' },
  { hour: '22:00', submissions: 1, label: '10 PM' },
  { hour: '23:00', submissions: 0, label: '11 PM' },
];

const peakHourData = hourlySubmissions.reduce((max, current) => 
  current.submissions > max.submissions ? current : max
, hourlySubmissions[0]);

export default function AdminDashboard() {
  const { toast } = useToast();
  const [sharedPassword, setSharedPassword] = useState('summit2025');
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({ title: '', url: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch summit resources
  const { data: summitResources = [], isLoading: isLoadingResources, refetch: refetchResources } = useQuery<SummitResource[]>({
    queryKey: ['/api/summit-resources'],
    enabled: true,
  });

  // Summit resources mutations
  const createResourceMutation = useMutation({
    mutationFn: (resource: InsertSummitResource) => apiRequest('/api/summit-resources', {
      method: 'POST',
      body: resource,
    }),
    onSuccess: () => {
      refetchResources();
      toast({
        title: "Resource Added",
        description: "Summit resource has been successfully added.",
      });
      setNewResource({ title: '', url: '', description: '' });
      setShowAddForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add summit resource.",
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSummitResource> }) => 
      apiRequest(`/api/summit-resources/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      refetchResources();
      toast({
        title: "Resource Updated",
        description: "Summit resource has been successfully updated.",
      });
      setEditingResource(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update summit resource.",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/summit-resources/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      refetchResources();
      toast({
        title: "Resource Deleted",
        description: "Summit resource has been successfully deleted.",
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete summit resource.",
        variant: "destructive",
      });
    },
  });

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

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Validation Error",
        description: "Title and URL are required fields.",
        variant: "destructive",
      });
      return;
    }

    const resourceData: InsertSummitResource = {
      ...newResource,
      description: newResource.description || null,
      isActive: 'true',
      order: (summitResources.length + 1).toString(),
    };

    createResourceMutation.mutate(resourceData);
  };

  const handleEditResource = (id: string, updatedResource: any) => {
    updateResourceMutation.mutate({ id, data: updatedResource });
  };

  const handleDeleteResource = (id: string) => {
    deleteResourceMutation.mutate(id);
  };

  const handleToggleActive = (id: string) => {
    const resource = summitResources.find(r => r.id === id);
    if (resource) {
      const newActiveState = resource.isActive === 'true' ? 'false' : 'true';
      updateResourceMutation.mutate({ id, data: { isActive: newActiveState } });
    }
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
      </div>

      {/* 24-Hour Submission Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            24-Hour Submission Pattern
          </CardTitle>
          <CardDescription>
            Ideas submitted throughout the day - Peak hour: {peakHourData.label} ({peakHourData.submissions} submissions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlySubmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} ideas`, 'Submissions']}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <ReferenceLine 
                y={peakHourData.submissions} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5"
                label={{ value: "Peak", position: "insideTopRight" }}
              />
              <Bar 
                dataKey="submissions" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Peak Hour: <strong data-testid="text-peak-hour">{peakHourData.label}</strong></span>
              <span>Peak Submissions: <strong>{peakHourData.submissions}</strong></span>
              <span>Total Today: <strong>{hourlySubmissions.reduce((sum, h) => sum + h.submissions, 0)}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Summit Resources Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Summit Resources
          </CardTitle>
          <CardDescription>Manage links displayed in the Summit Resources dropdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Resource Form */}
          {showAddForm && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-title">Title *</Label>
                  <Input
                    id="new-title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    placeholder="e.g., Summit Agenda"
                    data-testid="input-resource-title"
                  />
                </div>
                <div>
                  <Label htmlFor="new-url">URL *</Label>
                  <Input
                    id="new-url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="https://example.com/agenda"
                    data-testid="input-resource-url"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-description">Description</Label>
                <Input
                  id="new-description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  data-testid="input-resource-description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddResource} data-testid="button-save-resource">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewResource({ title: '', url: '', description: '' });
                  }}
                  data-testid="button-cancel-resource"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Add New Resource Button */}
          {!showAddForm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full"
              data-testid="button-add-resource"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Resource
            </Button>
          )}

          {/* Resources List */}
          <div className="space-y-3">
            {summitResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingResource === resource.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 mr-4">
                    <Input
                      value={resource.title}
                      onChange={(e) => handleEditResource(resource.id, { title: e.target.value })}
                      placeholder="Title"
                    />
                    <Input
                      value={resource.url}
                      onChange={(e) => handleEditResource(resource.id, { url: e.target.value })}
                      placeholder="URL"
                    />
                    <Input
                      value={resource.description || ''}
                      onChange={(e) => handleEditResource(resource.id, { description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resource.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                      {resource.isActive === 'false' && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.url}</p>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(resource.id)}
                    data-testid={`button-toggle-${resource.id}`}
                  >
                    {resource.isActive === 'true' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingResource(editingResource === resource.id ? null : resource.id)}
                    data-testid={`button-edit-${resource.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteResource(resource.id)}
                    data-testid={`button-delete-${resource.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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