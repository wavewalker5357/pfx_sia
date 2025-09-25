import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, Wrench, Play, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { LandingPageSettings, InsertLandingPageSettings } from '@shared/schema';

export function LandingPageSettingsAdmin() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<LandingPageSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Fetch landing page settings
  const { data: landingPageSettings, isLoading } = useQuery<LandingPageSettings>({
    queryKey: ['/api/landing-page-settings'],
    enabled: true,
  });

  // Create settings mutation (for when no settings exist)
  const createSettingsMutation = useMutation({
    mutationFn: async () => {
      const defaultSettings: InsertLandingPageSettings = {
        mode: "summit",
        maintenanceMessage: "The AI Summit platform is currently under construction. Please check back soon!",
        countdownMessage: "Time to start of the Pricefx Product & Engineering Summit",
        summitStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      const response = await apiRequest('POST', '/api/landing-page-settings', defaultSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landing-page-settings'] });
      toast({
        title: "Settings Created",
        description: "Default landing page settings have been created.",
      });
    },
    onError: (error) => {
      console.error('Failed to create landing page settings:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create landing page settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<InsertLandingPageSettings>) => {
      if (!settings?.id) {
        throw new Error('No settings ID found');
      }
      const response = await apiRequest('PUT', `/api/landing-page-settings/${settings.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landing-page-settings'] });
      setIsDirty(false);
      toast({
        title: "Settings Updated",
        description: "Landing page settings have been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Failed to update landing page settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update landing page settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load settings when data is available
  useEffect(() => {
    if (landingPageSettings) {
      setSettings(landingPageSettings);
      setIsDirty(false);
    }
  }, [landingPageSettings]);

  const handleFieldChange = (field: keyof LandingPageSettings, value: string | Date) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    if (!settings || !isDirty) return;
    
    const updates: Partial<InsertLandingPageSettings> = {
      mode: settings.mode,
      maintenanceMessage: settings.maintenanceMessage,
      countdownMessage: settings.countdownMessage,
      summitStartDate: settings.summitStartDate,
    };
    
    updateSettingsMutation.mutate(updates);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'countdown': return <Clock className="w-4 h-4" />;
      case 'summit': return <Play className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'maintenance': return 'destructive';
      case 'countdown': return 'secondary';
      case 'summit': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading landing page settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Initialize Landing Page Settings</CardTitle>
          <CardDescription>
            No landing page settings found. Create default settings to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              onClick={() => createSettingsMutation.mutate()}
              disabled={createSettingsMutation.isPending}
              data-testid="button-create-landing-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {createSettingsMutation.isPending ? 'Creating...' : 'Create Default Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Landing Page Settings</h2>
          <p className="text-muted-foreground">
            Control the landing page mode and messages for your attendees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getModeColor(settings.mode)} className="gap-1">
            {getModeIcon(settings.mode)}
            {settings.mode.charAt(0).toUpperCase() + settings.mode.slice(1)} Mode
          </Badge>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || updateSettingsMutation.isPending}
            data-testid="button-save-landing-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Current Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getModeIcon(settings.mode)}
            Landing Page Mode
          </CardTitle>
          <CardDescription>
            Choose how the landing page should behave for your attendees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Current Mode</Label>
            <Select 
              value={settings.mode} 
              onValueChange={(value) => handleFieldChange('mode', value)}
            >
              <SelectTrigger data-testid="select-landing-mode">
                <SelectValue placeholder="Select landing page mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-xs text-muted-foreground">Site under construction</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="countdown">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Countdown Mode</div>
                      <div className="text-xs text-muted-foreground">Show countdown timer</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="summit">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Summit Mode</div>
                      <div className="text-xs text-muted-foreground">Full functionality active</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode descriptions */}
          <div className="grid gap-3 mt-4">
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Wrench className="w-4 h-4" />
                Maintenance Mode
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Shows construction message, login forms are hidden
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Clock className="w-4 h-4" />
                Countdown Mode
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Shows countdown timer with message, login forms are hidden
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Play className="w-4 h-4" />
                Summit Mode
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full platform functionality available to attendees
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      {settings.mode === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance Settings
            </CardTitle>
            <CardDescription>
              Configure the message displayed during maintenance mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleFieldChange('maintenanceMessage', e.target.value)}
                placeholder="Enter the message to show during maintenance"
                rows={3}
                data-testid="textarea-maintenance-message"
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed to users when the site is in maintenance mode
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Countdown Settings */}
      {settings.mode === 'countdown' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Countdown Settings
            </CardTitle>
            <CardDescription>
              Configure the countdown timer and message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countdownMessage">Countdown Message</Label>
              <Input
                id="countdownMessage"
                value={settings.countdownMessage}
                onChange={(e) => handleFieldChange('countdownMessage', e.target.value)}
                placeholder="Enter the message to show with countdown"
                data-testid="input-countdown-message"
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed below the countdown timer
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="summitStartDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Summit Start Date & Time
              </Label>
              <Input
                id="summitStartDate"
                type="datetime-local"
                value={settings.summitStartDate ? new Date(settings.summitStartDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFieldChange('summitStartDate', new Date(e.target.value))}
                data-testid="input-summit-start-date"
              />
              <p className="text-xs text-muted-foreground">
                The countdown timer will count down to this date and time
              </p>
            </div>

            {settings.summitStartDate && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="text-sm font-medium">Preview</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Summit starts: {new Date(settings.summitStartDate).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Time remaining: {Math.max(0, Math.ceil((new Date(settings.summitStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summit Mode Info */}
      {settings.mode === 'summit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Summit Mode Active
            </CardTitle>
            <CardDescription>
              The platform is fully operational for attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              In summit mode, attendees have full access to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Idea submission form</li>
                <li>Browse ideas (list and board views)</li>
                <li>Analytics dashboard</li>
                <li>All configured features</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}