import { useState, useEffect } from 'react';
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
  X,
  BarChart3,
  Users,
  FormInput
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SummitResource, InsertSummitResource, FormField, InsertFormField, FormFieldOption, InsertFormFieldOption } from '@shared/schema';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<FormFieldOption | null>(null);
  const [newFieldForm, setNewFieldForm] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    helpText: '',
    allowUserAdditions: false
  });

  // Fetch summit resources
  const { data: summitResources = [], isLoading: isLoadingResources, refetch: refetchResources } = useQuery<SummitResource[]>({
    queryKey: ['/api/summit-resources'],
    enabled: true,
  });

  // Fetch form fields
  const { data: formFields = [], isLoading: isLoadingFields } = useQuery<FormField[]>({
    queryKey: ['/api/form-fields'],
    enabled: true,
  });

  // Fetch form field options for selected field
  const { data: fieldOptions = [], isLoading: isLoadingOptions } = useQuery<FormFieldOption[]>({
    queryKey: ['/api/form-field-options', selectedFieldId],
    queryFn: async () => {
      console.log('Fetching options for field:', selectedFieldId);
      if (!selectedFieldId) return [];
      const response = await fetch(`/api/form-field-options?fieldId=${selectedFieldId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch options');
      const data = await response.json();
      console.log('Fetched options:', data);
      return data;
    },
    enabled: !!selectedFieldId,
  });

  // Auto-select first field if none selected
  useEffect(() => {
    if (formFields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(formFields[0].id);
    }
  }, [formFields, selectedFieldId]);

  // Summit resources mutations
  const createResourceMutation = useMutation({
    mutationFn: (resource: InsertSummitResource) => apiRequest('POST', '/api/summit-resources', resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/summit-resources'] });
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
      apiRequest('PUT', `/api/summit-resources/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/summit-resources'] });
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
    mutationFn: (id: string) => apiRequest('DELETE', `/api/summit-resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/summit-resources'] });
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

  // Form field mutations
  const createFieldMutation = useMutation({
    mutationFn: (field: InsertFormField) => {
      // Convert boolean values to strings as expected by the API
      const convertedField = {
        ...field,
        required: typeof field.required === 'boolean' ? (field.required ? 'true' : 'false') : field.required,
        allowUserAdditions: typeof field.allowUserAdditions === 'boolean' ? (field.allowUserAdditions ? 'true' : 'false') : field.allowUserAdditions,
        isActive: typeof field.isActive === 'boolean' ? (field.isActive ? 'true' : 'false') : field.isActive,
      };
      return apiRequest('POST', '/api/form-fields', convertedField);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-fields'] });
      toast({
        title: "Field Created",
        description: "Form field has been successfully created.",
      });
      setShowNewFieldDialog(false);
      setNewFieldForm({
        name: '',
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        allowUserAdditions: false
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form field.",
        variant: "destructive",
      });
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFormField> }) => {
      // Convert boolean values to strings as expected by the API
      const convertedData = {
        ...data,
        required: typeof data.required === 'boolean' ? (data.required ? 'true' : 'false') : data.required,
        allowUserAdditions: typeof data.allowUserAdditions === 'boolean' ? (data.allowUserAdditions ? 'true' : 'false') : data.allowUserAdditions,
        isActive: typeof data.isActive === 'boolean' ? (data.isActive ? 'true' : 'false') : data.isActive,
      };
      return apiRequest('PUT', `/api/form-fields/${id}`, convertedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-fields'] });
      toast({
        title: "Field Updated",
        description: "Form field has been successfully updated.",
      });
      setEditingField(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update form field.",
        variant: "destructive",
      });
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/form-fields/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-fields'] });
      toast({
        title: "Field Deleted",
        description: "Form field has been successfully deleted.",
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete form field.",
        variant: "destructive",
      });
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: (option: InsertFormFieldOption) => apiRequest('POST', '/api/form-field-options', option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-field-options', selectedFieldId] });
      toast({
        title: "Option Added",
        description: "Field option has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add field option.",
        variant: "destructive",
      });
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFormFieldOption> }) => 
      apiRequest('PUT', `/api/form-field-options/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-field-options', selectedFieldId] });
      toast({
        title: "Option Updated",
        description: "Field option has been successfully updated.",
      });
      setEditingOption(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update field option.",
        variant: "destructive",
      });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/form-field-options/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-field-options', selectedFieldId] });
      toast({
        title: "Option Deleted",
        description: "Field option has been successfully deleted.",
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete field option.",
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

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            }`}
            data-testid="tab-overview"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('form-fields')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'form-fields'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            }`}
            data-testid="tab-form-fields"
          >
            <div className="flex items-center gap-2">
              <FormInput className="w-4 h-4" />
              Form Fields
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summit-resources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summit-resources'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            }`}
            data-testid="tab-summit-resources"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Summit Resources
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

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
      )}

      {/* Form Fields Tab */}
      {activeTab === 'form-fields' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Form Field Management</h2>
              <p className="text-muted-foreground">Configure the dynamic form fields for idea submissions</p>
            </div>
            <Button 
              onClick={() => setShowNewFieldDialog(true)}
              className="flex items-center gap-2"
              data-testid="button-add-field"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Fields List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FormInput className="w-5 h-5" />
                  Form Fields ({formFields.length})
                </CardTitle>
                <CardDescription>
                  Manage the fields that appear in the idea submission form
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFields ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field) => (
                      <div 
                        key={field.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedFieldId === field.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-muted-foreground'
                        }`}
                        onClick={() => {
                          console.log('Selecting field:', field.id);
                          setSelectedFieldId(field.id);
                        }}
                        data-testid={`field-item-${field.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{field.label}</h4>
                              <Badge variant={field.required === 'true' ? 'destructive' : 'secondary'} className="text-xs">
                                {field.required === 'true' ? 'Required' : 'Optional'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Field name: {field.name}
                            </p>
                            {field.helpText && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {field.helpText}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Convert strings to booleans for editing
                                setEditingField({
                                  ...field,
                                  required: field.required === 'true',
                                  allowUserAdditions: field.allowUserAdditions === 'true',
                                  isActive: field.isActive === 'true'
                                } as any);
                              }}
                              data-testid={`button-edit-field-${field.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFieldMutation.mutate(field.id);
                              }}
                              data-testid={`button-delete-field-${field.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Field Options (for list type fields) */}
            <Card>
              <CardHeader>
                <CardTitle>Field Options</CardTitle>
                <CardDescription>
                  {selectedFieldId ? 'Manage options for the selected list field' : 'Select a list field to manage its options'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFieldId ? (
                  <div className="space-y-4">
                    {(() => {
                      const selectedField = formFields.find(f => f.id === selectedFieldId);
                      if (selectedField?.type !== 'list') {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <FormInput className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>This field type doesn't support options</p>
                            <p className="text-sm">Only list fields can have selectable options</p>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Options for: {selectedField.label}</h4>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                const newOption = prompt('Enter new option label:');
                                if (newOption && selectedFieldId) {
                                  createOptionMutation.mutate({
                                    fieldId: selectedFieldId,
                                    value: newOption.toLowerCase().replace(/\s+/g, '_'),
                                    label: newOption,
                                    order: fieldOptions.length.toString(),
                                  });
                                }
                              }}
                              data-testid="button-add-option"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {fieldOptions.map((option) => (
                              <div 
                                key={option.id} 
                                className="flex items-center justify-between p-3 border rounded-lg"
                                data-testid={`option-item-${option.id}`}
                              >
                                {editingOption?.id === option.id ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <Input
                                      value={editingOption.label}
                                      onChange={(e) => setEditingOption(prev => prev ? { ...prev, label: e.target.value } : null)}
                                      className="flex-1"
                                      data-testid={`input-edit-option-${option.id}`}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (editingOption) {
                                          console.log('Updating option:', editingOption);
                                          updateOptionMutation.mutate({
                                            id: editingOption.id,
                                            data: {
                                              label: editingOption.label,
                                              value: editingOption.label.toLowerCase().replace(/\s+/g, '_')
                                            }
                                          });
                                        }
                                      }}
                                      disabled={updateOptionMutation.isPending}
                                      data-testid={`button-save-option-${option.id}`}
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingOption(null)}
                                      data-testid={`button-cancel-option-${option.id}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <span className="font-medium">{option.label}</span>
                                      <span className="text-sm text-muted-foreground ml-2">({option.value})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingOption(option)}
                                        data-testid={`button-edit-option-${option.id}`}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteOptionMutation.mutate(option.id)}
                                        data-testid={`button-delete-option-${option.id}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                            
                            {fieldOptions.length === 0 && (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>No options configured</p>
                                <p className="text-sm">Add options for users to select from</p>
                              </div>
                            )}
                          </div>
                          
                          {selectedField.allowUserAdditions === 'true' && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                ℹ️ Users can add their own options to this field during submission
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FormInput className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a field from the left to manage its options</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Field Dialog */}
          {showNewFieldDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md max-h-screen overflow-y-auto">
                <CardHeader>
                  <CardTitle>Add New Form Field</CardTitle>
                  <CardDescription>Create a new field for the idea submission form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field-name">Field Name *</Label>
                      <Input
                        id="field-name"
                        placeholder="e.g., idea_category"
                        value={newFieldForm.name}
                        onChange={(e) => setNewFieldForm(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="input-field-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="field-label">Display Label *</Label>
                      <Input
                        id="field-label"
                        placeholder="e.g., Idea Category"
                        value={newFieldForm.label}
                        onChange={(e) => setNewFieldForm(prev => ({ ...prev, label: e.target.value }))}
                        data-testid="input-field-label"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="field-type">Field Type</Label>
                    <select
                      id="field-type"
                      className="w-full p-2 border rounded-md"
                      value={newFieldForm.type}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, type: e.target.value }))}
                      data-testid="select-field-type"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="list">List (Dropdown)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="field-placeholder">Placeholder</Label>
                    <Input
                      id="field-placeholder"
                      placeholder="Enter placeholder text"
                      value={newFieldForm.placeholder}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
                      data-testid="input-field-placeholder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="field-help">Help Text</Label>
                    <Input
                      id="field-help"
                      placeholder="Additional guidance for users"
                      value={newFieldForm.helpText}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, helpText: e.target.value }))}
                      data-testid="input-field-help"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-required"
                      checked={newFieldForm.required}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                      data-testid="checkbox-field-required"
                    />
                    <Label htmlFor="field-required">Required field</Label>
                  </div>

                  {newFieldForm.type === 'list' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-allow-additions"
                        checked={newFieldForm.allowUserAdditions}
                        onChange={(e) => setNewFieldForm(prev => ({ ...prev, allowUserAdditions: e.target.checked }))}
                        data-testid="checkbox-allow-additions"
                      />
                      <Label htmlFor="field-allow-additions">Allow users to add new options</Label>
                    </div>
                  )}
                </CardContent>
                <div className="p-6 pt-0 flex gap-2">
                  <Button 
                    onClick={() => {
                      createFieldMutation.mutate({
                        name: newFieldForm.name,
                        label: newFieldForm.label,
                        type: newFieldForm.type,
                        required: newFieldForm.required,
                        placeholder: newFieldForm.placeholder || null,
                        helpText: newFieldForm.helpText || null,
                        allowUserAdditions: newFieldForm.allowUserAdditions,
                        order: formFields.length.toString(),
                        isActive: true
                      });
                    }}
                    disabled={!newFieldForm.name || !newFieldForm.label || createFieldMutation.isPending}
                    data-testid="button-create-field"
                  >
                    {createFieldMutation.isPending ? 'Creating...' : 'Create Field'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewFieldDialog(false);
                      setNewFieldForm({
                        name: '',
                        label: '',
                        type: 'text',
                        required: false,
                        placeholder: '',
                        helpText: '',
                        allowUserAdditions: false
                      });
                    }}
                    data-testid="button-cancel-field"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Edit Field Dialog */}
          {editingField && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md max-h-screen overflow-y-auto">
                <CardHeader>
                  <CardTitle>Edit Form Field</CardTitle>
                  <CardDescription>Modify the field properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-field-name">Field Name *</Label>
                      <Input
                        id="edit-field-name"
                        value={editingField.name}
                        onChange={(e) => setEditingField(prev => prev ? { ...prev, name: e.target.value } : null)}
                        data-testid="input-edit-field-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-field-label">Display Label *</Label>
                      <Input
                        id="edit-field-label"
                        value={editingField.label}
                        onChange={(e) => setEditingField(prev => prev ? { ...prev, label: e.target.value } : null)}
                        data-testid="input-edit-field-label"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-field-type">Field Type</Label>
                    <select
                      id="edit-field-type"
                      className="w-full p-2 border rounded-md"
                      value={editingField.type}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, type: e.target.value } : null)}
                      data-testid="select-edit-field-type"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="list">List (Dropdown)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-field-placeholder">Placeholder</Label>
                    <Input
                      id="edit-field-placeholder"
                      value={editingField.placeholder || ''}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, placeholder: e.target.value } : null)}
                      data-testid="input-edit-field-placeholder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-field-help">Help Text</Label>
                    <Input
                      id="edit-field-help"
                      value={editingField.helpText || ''}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, helpText: e.target.value } : null)}
                      data-testid="input-edit-field-help"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-field-required"
                      checked={editingField.required === 'true'}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, required: e.target.checked ? 'true' : 'false' } : null)}
                      data-testid="checkbox-edit-field-required"
                    />
                    <Label htmlFor="edit-field-required">Required field</Label>
                  </div>

                  {editingField.type === 'list' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-field-allow-additions"
                        checked={editingField.allowUserAdditions === 'true'}
                        onChange={(e) => setEditingField(prev => prev ? { ...prev, allowUserAdditions: e.target.checked ? 'true' : 'false' } : null)}
                        data-testid="checkbox-edit-allow-additions"
                      />
                      <Label htmlFor="edit-field-allow-additions">Allow users to add new options</Label>
                    </div>
                  )}
                </CardContent>
                <div className="p-6 pt-0 flex gap-2">
                  <Button 
                    onClick={() => {
                      updateFieldMutation.mutate({
                        id: editingField.id,
                        data: {
                          name: editingField.name,
                          label: editingField.label,
                          type: editingField.type,
                          required: editingField.required,
                          placeholder: editingField.placeholder || null,
                          helpText: editingField.helpText || null,
                          allowUserAdditions: editingField.allowUserAdditions,
                        }
                      });
                    }}
                    disabled={updateFieldMutation.isPending}
                    data-testid="button-save-field-edit"
                  >
                    {updateFieldMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingField(null)}
                    data-testid="button-cancel-field-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Summit Resources Tab */}
      {activeTab === 'summit-resources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Summit Resources</h2>
              <p className="text-muted-foreground">Manage external links in the Summit Resources dropdown</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
              data-testid="button-add-resource"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Summit Resources ({summitResources.length})
              </CardTitle>
              <CardDescription>
                Links that appear in the Summit Resources dropdown menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResources ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Add Resource Form */}
                  {showAddForm && (
                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-title">Title *</Label>
                              <Input
                                id="new-title"
                                placeholder="e.g., Summit Agenda"
                                value={newResource.title}
                                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                                data-testid="input-new-title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-url">URL *</Label>
                              <Input
                                id="new-url"
                                placeholder="https://example.com"
                                value={newResource.url}
                                onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                                data-testid="input-new-url"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="new-description">Description</Label>
                            <Input
                              id="new-description"
                              placeholder="Brief description of the resource"
                              value={newResource.description}
                              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                              data-testid="input-new-description"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleAddResource}
                              disabled={createResourceMutation.isPending}
                              data-testid="button-save-resource"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {createResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowAddForm(false);
                                setNewResource({ title: '', url: '', description: '' });
                              }}
                              data-testid="button-cancel-add"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Resources */}
                  {summitResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        {editingResource === resource.id ? (
                          <div className="space-y-2">
                            <Input
                              value={resource.title}
                              onChange={(e) => {
                                // Update handled via the existing edit functionality
                              }}
                              data-testid={`input-edit-title-${resource.id}`}
                            />
                            <Input
                              value={resource.url}
                              onChange={(e) => {
                                // Update handled via the existing edit functionality
                              }}
                              data-testid={`input-edit-url-${resource.id}`}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{resource.title}</h4>
                              <Badge variant={resource.isActive === 'true' ? 'default' : 'secondary'}>
                                {resource.isActive === 'true' ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.url}</p>
                            {resource.description && (
                              <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {editingResource === resource.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                handleEditResource(resource.id, {
                                  title: resource.title,
                                  url: resource.url,
                                  description: resource.description
                                });
                              }}
                              data-testid={`button-save-edit-${resource.id}`}
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingResource(null)}
                              data-testid={`button-cancel-edit-${resource.id}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(resource.id)}
                              data-testid={`button-toggle-${resource.id}`}
                            >
                              <Activity className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingResource(resource.id)}
                              data-testid={`button-edit-resource-${resource.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResource(resource.id)}
                              data-testid={`button-delete-resource-${resource.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}