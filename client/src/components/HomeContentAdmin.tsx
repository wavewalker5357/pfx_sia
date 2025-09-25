import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, FileText, Eye, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TipTapEditor } from './TipTapEditor';
import type { SummitHomeContent, InsertSummitHomeContent } from '@shared/schema';
import DOMPurify from 'isomorphic-dompurify';

export function HomeContentAdmin() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [contentId, setContentId] = useState<string | null>(null);

  // Fetch existing home content
  const { data: homeContent, isLoading, error } = useQuery<SummitHomeContent>({
    queryKey: ['/api/admin/home-content'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Initialize form data when content is loaded
  useEffect(() => {
    if (homeContent && homeContent.id) {
      setTitle(homeContent.title);
      setContent(homeContent.content);
      setIsPublished(homeContent.isPublished === 'true');
      setContentId(homeContent.id);
    }
  }, [homeContent]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertSummitHomeContent) => {
      const response = await apiRequest('POST', '/api/admin/home-content', data);
      return await response.json();
    },
    onSuccess: (newContent: SummitHomeContent) => {
      setContentId(newContent.id);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/home-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home-content'] });
      toast({
        title: "Success!",
        description: "Home content created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating home content:', error);
      toast({
        title: "Error",
        description: "Failed to create home content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertSummitHomeContent>) => {
      const response = await apiRequest('PUT', `/api/admin/home-content/${contentId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/home-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home-content'] });
      toast({
        title: "Success!",
        description: "Home content updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating home content:', error);
      toast({
        title: "Error",
        description: "Failed to update home content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Sanitize the content before saving
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'a', 'img', 'br'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'],
    });

    const contentData = {
      title,
      content: sanitizedContent,
      slug: 'home',
      isPublished: isPublished ? 'true' : 'false',
    };

    if (contentId) {
      updateMutation.mutate(contentData);
    } else {
      createMutation.mutate(contentData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Summit Home Page</h2>
          <p className="text-muted-foreground">
            Manage the content that appears on the Summit home page for attendees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            data-testid="button-save-home-content"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content Editor
              </CardTitle>
              <CardDescription>
                Create rich content for your summit home page. You can use headings, formatting, lists, links, and images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Welcome to AI Summit"
                  data-testid="input-page-title"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Page Content</Label>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your summit home page content..."
                  className="min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings & Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Publishing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published-switch">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this content visible to summit attendees
                  </p>
                </div>
                <Switch
                  id="published-switch"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  data-testid="switch-published"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {contentId && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Last Updated</h4>
                    <p className="text-sm text-muted-foreground">
                      {homeContent?.updatedAt ? new Date(homeContent.updatedAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Quick Preview
              </CardTitle>
              <CardDescription>
                Preview how your content will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/10">
                <h3 className="font-semibold text-lg mb-2" data-testid="preview-title">
                  {title || 'Welcome to AI Summit'}
                </h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(content || '<p>Start writing to see your content preview here...</p>')
                  }}
                  data-testid="preview-content"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <p><strong>Headings:</strong> Use H1, H2, H3 for content structure</p>
                <p><strong>Images:</strong> Add images by URL using the image button</p>
                <p><strong>Links:</strong> Create links to external resources</p>
                <p><strong>Lists:</strong> Use bullet or numbered lists for better readability</p>
                <p><strong>Publishing:</strong> Toggle the Published switch to control visibility</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}