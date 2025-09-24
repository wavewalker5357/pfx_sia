import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, RefreshCw, Eye, Palette, Image, Type, Layout, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { HeaderSettings, InsertHeaderSettings } from '@shared/schema';
import { insertHeaderSettingsSchema } from '@shared/schema';

export function HeaderSettingsAdmin() {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current header settings
  const { data: headerSettings, isLoading } = useQuery<HeaderSettings>({
    queryKey: ['/api/header-settings'],
    queryFn: async () => {
      const response = await fetch('/api/header-settings', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch header settings');
      }
      return response.json();
    },
  });

  // Update header settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<HeaderSettings>) => {
      if (!headerSettings?.id) {
        throw new Error('No header settings found to update');
      }
      
      const response = await fetch('/api/header-settings/' + headerSettings.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update header settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/header-settings'] });
      toast({
        title: 'Header Settings Updated',
        description: 'Header customization has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating header settings:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update header settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState<Partial<InsertHeaderSettings>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when settings load
  useEffect(() => {
    if (headerSettings) {
      // Convert HeaderSettings to InsertHeaderSettings (exclude read-only fields)
      const { id, createdAt, updatedAt, ...insertData } = headerSettings;
      setFormData(insertData);
    }
  }, [headerSettings]);

  const validateField = (field: keyof InsertHeaderSettings, value: string): string | null => {
    try {
      // Create a partial object with just this field to validate
      const testData = { [field]: value };
      const partialSchema = insertHeaderSettingsSchema.partial();
      partialSchema.parse(testData);
      return null;
    } catch (error: any) {
      if (error.errors && error.errors.length > 0) {
        return error.errors[0].message;
      }
      return 'Invalid value';
    }
  };

  const validateForm = (): boolean => {
    try {
      // Validate entire form with partial schema (allows missing fields)
      insertHeaderSettingsSchema.partial().parse(formData);
      setValidationErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleInputChange = (field: keyof InsertHeaderSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      // Only send changed fields
      const changedFields: Partial<InsertHeaderSettings> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (headerSettings && headerSettings[key as keyof HeaderSettings] !== value) {
          changedFields[key as keyof InsertHeaderSettings] = value as any;
        }
      });
      
      if (Object.keys(changedFields).length > 0) {
        updateMutation.mutate(changedFields);
      } else {
        toast({
          title: 'No Changes',
          description: 'No changes detected to save.',
        });
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the validation errors before saving.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setFormData(headerSettings || {});
    toast({
      title: 'Settings Reset',
      description: 'Form has been reset to current saved values.',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading header settings...
        </CardContent>
      </Card>
    );
  }

  if (!headerSettings) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">
            No header settings found. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="header-settings-title">Header Customization</h2>
          <p className="text-muted-foreground">
            Configure visual appearance and content of the application header
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            data-testid="button-toggle-preview"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            data-testid="button-reset-settings"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-header-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" data-testid="tab-content">
            <Type className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="styling" data-testid="tab-styling">
            <Palette className="w-4 h-4 mr-2" />
            Styling
          </TabsTrigger>
          <TabsTrigger value="background" data-testid="tab-background">
            <Image className="w-4 h-4 mr-2" />
            Background
          </TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-layout">
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
        </TabsList>

        {/* Content Settings */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee-title">Attendee Title</Label>
                  <Input
                    id="attendee-title"
                    value={formData.attendeeTitle || ''}
                    onChange={(e) => handleInputChange('attendeeTitle', e.target.value)}
                    placeholder="AI Summit Ideas"
                    data-testid="input-attendee-title"
                    className={validationErrors.attendeeTitle ? 'border-destructive' : ''}
                  />
                  {validationErrors.attendeeTitle && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.attendeeTitle}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendee-subtitle">Attendee Subtitle</Label>
                  <Input
                    id="attendee-subtitle"
                    value={formData.attendeeSubtitle || ''}
                    onChange={(e) => handleInputChange('attendeeSubtitle', e.target.value)}
                    placeholder="Product & Engineering Summit 2025"
                    data-testid="input-attendee-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-title">Admin Title</Label>
                  <Input
                    id="admin-title"
                    value={formData.adminTitle || ''}
                    onChange={(e) => handleInputChange('adminTitle', e.target.value)}
                    placeholder="AI Summit Admin"
                    data-testid="input-admin-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-subtitle">Admin Subtitle</Label>
                  <Input
                    id="admin-subtitle"
                    value={formData.adminSubtitle || ''}
                    onChange={(e) => handleInputChange('adminSubtitle', e.target.value)}
                    placeholder="Platform Management Dashboard"
                    data-testid="input-admin-subtitle"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summit-resources-label">Summit Resources Label</Label>
                  <Input
                    id="summit-resources-label"
                    value={formData.summitResourcesLabel || ''}
                    onChange={(e) => handleInputChange('summitResourcesLabel', e.target.value)}
                    placeholder="Summit Resources"
                    data-testid="input-summit-resources-label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exit-button-label">Exit Button Label</Label>
                  <Input
                    id="exit-button-label"
                    value={formData.exitButtonLabel || ''}
                    onChange={(e) => handleInputChange('exitButtonLabel', e.target.value)}
                    placeholder="Exit"
                    data-testid="input-exit-button-label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logout-button-label">Logout Button Label</Label>
                  <Input
                    id="logout-button-label"
                    value={formData.logoutButtonLabel || ''}
                    onChange={(e) => handleInputChange('logoutButtonLabel', e.target.value)}
                    placeholder="Logout"
                    data-testid="input-logout-button-label"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Settings */}
        <TabsContent value="styling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                      data-testid="input-background-color"
                    />
                    <Input
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={formData.textColor || '#000000'}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                      data-testid="input-text-color"
                    />
                    <Input
                      value={formData.textColor || '#000000'}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title-color">Title Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="title-color"
                      type="color"
                      value={formData.titleColor || '#000000'}
                      onChange={(e) => handleInputChange('titleColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                      data-testid="input-title-color"
                    />
                    <Input
                      value={formData.titleColor || '#000000'}
                      onChange={(e) => handleInputChange('titleColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle-color">Subtitle Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="subtitle-color"
                      type="color"
                      value={formData.subtitleColor || '#666666'}
                      onChange={(e) => handleInputChange('subtitleColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                      data-testid="input-subtitle-color"
                    />
                    <Input
                      value={formData.subtitleColor || '#666666'}
                      onChange={(e) => handleInputChange('subtitleColor', e.target.value)}
                      placeholder="#666666"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-color">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="border-color"
                      type="color"
                      value={formData.borderColor || '#e5e7eb'}
                      onChange={(e) => handleInputChange('borderColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                      data-testid="input-border-color"
                    />
                    <Input
                      value={formData.borderColor || '#e5e7eb'}
                      onChange={(e) => handleInputChange('borderColor', e.target.value)}
                      placeholder="#e5e7eb"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Settings */}
        <TabsContent value="background" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background-image">Background Image URL</Label>
                <Input
                  id="background-image"
                  value={formData.backgroundImage || ''}
                  onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-background-image"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a full URL to an image file (JPG, PNG, WebP)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="background-opacity">Opacity</Label>
                  <Select
                    value={formData.backgroundImageOpacity || '0.1'}
                    onValueChange={(value) => handleInputChange('backgroundImageOpacity', value)}
                  >
                    <SelectTrigger data-testid="select-background-opacity">
                      <SelectValue placeholder="Select opacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">10%</SelectItem>
                      <SelectItem value="0.2">20%</SelectItem>
                      <SelectItem value="0.3">30%</SelectItem>
                      <SelectItem value="0.4">40%</SelectItem>
                      <SelectItem value="0.5">50%</SelectItem>
                      <SelectItem value="0.6">60%</SelectItem>
                      <SelectItem value="0.7">70%</SelectItem>
                      <SelectItem value="0.8">80%</SelectItem>
                      <SelectItem value="0.9">90%</SelectItem>
                      <SelectItem value="1.0">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-position">Position</Label>
                  <Select
                    value={formData.backgroundImagePosition || 'center'}
                    onValueChange={(value) => handleInputChange('backgroundImagePosition', value)}
                  >
                    <SelectTrigger data-testid="select-background-position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="top left">Top Left</SelectItem>
                      <SelectItem value="top right">Top Right</SelectItem>
                      <SelectItem value="bottom left">Bottom Left</SelectItem>
                      <SelectItem value="bottom right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-size">Size</Label>
                  <Select
                    value={formData.backgroundImageSize || 'cover'}
                    onValueChange={(value) => handleInputChange('backgroundImageSize', value)}
                  >
                    <SelectTrigger data-testid="select-background-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="100% 100%">Stretch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Settings */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout & Responsiveness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-height">Header Height</Label>
                  <Input
                    id="header-height"
                    value={formData.headerHeight || 'auto'}
                    onChange={(e) => handleInputChange('headerHeight', e.target.value)}
                    placeholder="auto"
                    data-testid="input-header-height"
                  />
                  <p className="text-xs text-muted-foreground">CSS value (e.g., auto, 80px, 5rem)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="padding-x">Horizontal Padding</Label>
                  <Input
                    id="padding-x"
                    value={formData.paddingX || '1rem'}
                    onChange={(e) => handleInputChange('paddingX', e.target.value)}
                    placeholder="1rem"
                    data-testid="input-padding-x"
                  />
                  <p className="text-xs text-muted-foreground">CSS value (e.g., 1rem, 16px)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="padding-y">Vertical Padding</Label>
                  <Input
                    id="padding-y"
                    value={formData.paddingY || '1rem'}
                    onChange={(e) => handleInputChange('paddingY', e.target.value)}
                    placeholder="1rem"
                    data-testid="input-padding-y"
                  />
                  <p className="text-xs text-muted-foreground">CSS value (e.g., 1rem, 16px)</p>
                </div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-breakpoint">Mobile Breakpoint</Label>
                  <Input
                    id="mobile-breakpoint"
                    value={formData.mobileBreakpoint || '768px'}
                    onChange={(e) => handleInputChange('mobileBreakpoint', e.target.value)}
                    placeholder="768px"
                    data-testid="input-mobile-breakpoint"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile-title-size">Mobile Title Size</Label>
                  <Input
                    id="mobile-title-size"
                    value={formData.mobileTitleSize || '1.5rem'}
                    onChange={(e) => handleInputChange('mobileTitleSize', e.target.value)}
                    placeholder="1.5rem"
                    data-testid="input-mobile-title-size"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desktop-title-size">Desktop Title Size</Label>
                  <Input
                    id="desktop-title-size"
                    value={formData.desktopTitleSize || '2rem'}
                    onChange={(e) => handleInputChange('desktopTitleSize', e.target.value)}
                    placeholder="2rem"
                    data-testid="input-desktop-title-size"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}