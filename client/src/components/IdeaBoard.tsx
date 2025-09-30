import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Tag, User } from 'lucide-react';
import type { Idea, IdeaWithFields, KanbanCategory } from '@shared/schema';
import { useState, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface IdeaBoardProps {
  searchTerm?: string;
  componentFilter?: string;
  tagFilter?: string;
  onNavigateToSubmit?: () => void;
}

export default function IdeaBoard({ searchTerm = '', componentFilter = '', tagFilter = '', onNavigateToSubmit }: IdeaBoardProps) {
  const queryClient = useQueryClient();
  const [draggedIdea, setDraggedIdea] = useState<IdeaWithFields | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const pendingUpdatesRef = useRef<Map<string, { target: string; timeoutId: NodeJS.Timeout }>>(new Map()); // ideaId -> {target, timeoutId}
  // Fetch kanban categories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery<KanbanCategory[]>({
    queryKey: ['/api/kanban-categories'],
    queryFn: async () => {
      const response = await fetch('/api/kanban-categories', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch kanban categories');
      return response.json();
    },
  });

  // Fetch ideas
  const { data: ideas = [], isLoading: isLoadingIdeas, error: ideasError } = useQuery<IdeaWithFields[]>({
    queryKey: ['/api/ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
  });

  // Fetch form fields for mapping field IDs to labels
  const { data: formFields = [] } = useQuery({
    queryKey: ['/api/form-fields'],
    queryFn: async () => {
      const response = await fetch('/api/form-fields', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch form fields');
      return response.json();
    },
  });

  // Fetch field options for mapping values to labels
  const { data: fieldOptions = [] } = useQuery({
    queryKey: ['/api/form-field-options'],
    queryFn: async () => {
      const response = await fetch('/api/form-field-options', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch field options');
      return response.json();
    },
  });

  // Filter ideas based on search and filter criteria
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !searchTerm || 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if filter value exists in comma-separated list
    const matchesComponent = !componentFilter || 
      (idea.component && idea.component.split(',').map(c => c.trim()).includes(componentFilter));
    const matchesTag = !tagFilter || 
      (idea.tag && idea.tag.split(',').map(t => t.trim()).includes(tagFilter));
    
    return matchesSearch && matchesComponent && matchesTag;
  });

  // Group ideas by category
  const activeCategories = categories.filter(cat => cat.isActive === 'true').sort((a, b) => parseInt(a.order) - parseInt(b.order));
  const ideaGroups = activeCategories.reduce((acc, category) => {
    acc[category.key] = filteredIdeas.filter(idea => idea.type === category.key);
    return acc;
  }, {} as Record<string, IdeaWithFields[]>);

  // Mutation for updating idea category with proper cancellation handling
  const updateIdeaCategoryMutation = useMutation({
    mutationFn: async ({ ideaId, newType }: { ideaId: string; newType: string }) => {
      const response = await apiRequest('PATCH', `/api/ideas/${ideaId}/category`, { type: newType });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch ideas
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
    },
    onError: (error) => {
      console.error('Failed to update idea category:', error);
    }
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, idea: Idea) => {
    console.log('🟡 Drag started:', idea.title, 'from category:', idea.type);
    setDraggedIdea(idea);
    e.dataTransfer.effectAllowed = 'move';
    // Store the complete idea data in DataTransfer for cross-event persistence
    e.dataTransfer.setData('application/json', JSON.stringify(idea));
    e.dataTransfer.setData('text/plain', idea.id);
  };

  const handleDragEnd = () => {
    console.log('🔴 Drag ended, clearing dragged idea');
    setDraggedIdea(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e: React.DragEvent, categoryKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== categoryKey) {
      console.log(`🔵 Drag over: ${categoryKey}`);
      setDragOverCategory(categoryKey);
    }
  };

  const handleDragLeave = () => {
    console.log('🟠 Drag leave');
    setDragOverCategory(null);
  };

  // Execute debounced update for an idea
  const executeUpdate = async (ideaId: string, targetCategory: string) => {
    // Get current state to check if we still need to move
    const currentIdea = ideas.find(idea => idea.id === ideaId);
    const currentType = currentIdea?.type;
    
    console.log(`🚀 Executing update for ${ideaId}: ${currentType} -> ${targetCategory}`);
    
    if (currentType === targetCategory) {
      console.log('💡 No change needed - already in target category');
      return;
    }

    try {
      const result = await updateIdeaCategoryMutation.mutateAsync({
        ideaId: ideaId,
        newType: targetCategory
      });
      
      console.log('✅ Update successful:', result);
    } catch (error) {
      console.error('❌ Update failed:', error);
    } finally {
      // Clean up pending update
      pendingUpdatesRef.current.delete(ideaId);
    }
  };

  const handleDrop = async (e: React.DragEvent, categoryKey: string) => {
    console.log(`🎯 DROP EVENT: Target category = ${categoryKey}, timestamp = ${Date.now()}`);
    e.preventDefault();
    setDragOverCategory(null);
    
    // Get dragged idea from DataTransfer instead of React state
    let draggedIdeaFromEvent: Idea | null = null;
    try {
      const ideaData = e.dataTransfer.getData('application/json');
      if (ideaData) {
        draggedIdeaFromEvent = JSON.parse(ideaData);
        if (draggedIdeaFromEvent) {
          console.log(`📦 DataTransfer idea: ${draggedIdeaFromEvent.title} (${draggedIdeaFromEvent.id})`);
        }
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }

    // Fallback to React state if DataTransfer fails
    const effectiveDraggedIdea = draggedIdeaFromEvent || draggedIdea;
    
    if (!effectiveDraggedIdea) {
      console.warn('⚠️ No dragged idea found in DataTransfer or React state');
      return;
    }

    const ideaId = effectiveDraggedIdea.id;
    console.log(`🆔 Processing drop for idea: ${effectiveDraggedIdea.title} (${ideaId})`);
    
    // Get the current state of the idea from our fresh data
    const currentIdea = ideas.find(idea => idea.id === ideaId);
    const currentType = currentIdea?.type || effectiveDraggedIdea.type;
    
    console.log(`🟡 Dragging "${effectiveDraggedIdea.title}" from ${currentType} to ${categoryKey}`);
    
    if (currentType === categoryKey) {
      console.log('💡 No change needed - idea already in target category');
      return; // No change needed
    }

    // Debounced update approach - clear previous timeout and set new one
    const pendingUpdates = pendingUpdatesRef.current;
    const existingUpdate = pendingUpdates.get(ideaId);
    
    if (existingUpdate) {
      // Clear previous timeout
      clearTimeout(existingUpdate.timeoutId);
      console.log(`🔄 Updating target from ${existingUpdate.target} to ${categoryKey}`);
    } else {
      console.log(`📝 Scheduling new update: ${ideaId} -> ${categoryKey}`);
    }

    // Set new debounced update
    const timeoutId = setTimeout(() => {
      executeUpdate(ideaId, categoryKey);
    }, 300); // 300ms debounce delay

    pendingUpdates.set(ideaId, { target: categoryKey, timeoutId });
  };

  // State for managing expanded textarea fields
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleFieldExpansion = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  // Helper function to render badge fields (text, list)
  const renderBadgeFields = (dynamicFields: any[]) => {
    if (!dynamicFields || dynamicFields.length === 0) return null;

    // Sort formFields by order before filtering, same as submission form
    const sortedFormFields = [...formFields].sort((a, b) => Number(a.order) - Number(b.order));
    
    const badgeFields = dynamicFields.filter((field) => {
      const fieldConfig = sortedFormFields.find((f: any) => f.id === field.fieldId);
      return fieldConfig && (fieldConfig.type === 'text' || fieldConfig.type === 'list');
    }).sort((a, b) => {
      // Sort badge fields by their field config order
      const fieldConfigA = sortedFormFields.find((f: any) => f.id === a.fieldId);
      const fieldConfigB = sortedFormFields.find((f: any) => f.id === b.fieldId);
      return Number(fieldConfigA?.order || 0) - Number(fieldConfigB?.order || 0);
    });

    if (badgeFields.length === 0) return null;

    return badgeFields.map((field) => {
      const fieldConfig = sortedFormFields.find((f: any) => f.id === field.fieldId);
      if (!fieldConfig) return null;

      // For list fields, try to find the option label
      let displayValue = field.value;
      if (fieldConfig.type === 'list') {
        const option = fieldOptions.find((opt: any) => opt.fieldId === field.fieldId && opt.value === field.value);
        if (option) {
          displayValue = option.label;
        }
      }

      return (
        <Badge 
          key={field.id} 
          variant="outline" 
          className="text-xs"
          data-testid={`badge-dynamic-${fieldConfig.name}`}
        >
          {fieldConfig.label}: {displayValue}
        </Badge>
      );
    }).filter(Boolean);
  };

  // Helper function to render expandable textarea fields
  const renderTextareaFields = (dynamicFields: any[]) => {
    if (!dynamicFields || dynamicFields.length === 0) return null;

    // Sort formFields by order before filtering, same as submission form
    const sortedFormFields = [...formFields].sort((a, b) => Number(a.order) - Number(b.order));
    
    const textareaFields = dynamicFields.filter((field) => {
      const fieldConfig = sortedFormFields.find((f: any) => f.id === field.fieldId);
      return fieldConfig && fieldConfig.type === 'textarea';
    }).sort((a, b) => {
      // Sort textarea fields by their field config order
      const fieldConfigA = sortedFormFields.find((f: any) => f.id === a.fieldId);
      const fieldConfigB = sortedFormFields.find((f: any) => f.id === b.fieldId);
      return Number(fieldConfigA?.order || 0) - Number(fieldConfigB?.order || 0);
    });

    if (textareaFields.length === 0) return null;

    return textareaFields.map((field) => {
      const fieldConfig = sortedFormFields.find((f: any) => f.id === field.fieldId);
      if (!fieldConfig) return null;

      const isExpanded = expandedFields.has(field.id);
      const content = field.value || '';
      const shouldTruncate = content.length > 300;
      
      // Truncate at word boundary, not mid-word
      const getDisplayContent = () => {
        if (!shouldTruncate || isExpanded) return content;
        
        const truncated = content.substring(0, 300);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        
        // Always use word boundary if space exists, otherwise use character boundary
        const wordBoundaryTruncated = lastSpaceIndex > -1 
          ? truncated.substring(0, lastSpaceIndex) 
          : truncated;
        
        return wordBoundaryTruncated.trim() + '...';
      };
      
      const displayContent = getDisplayContent();

      return (
        <div key={field.id} className="text-xs mt-1" data-testid={`text-dynamic-${fieldConfig.name}`}>
          <span className="font-medium">{fieldConfig.label}:</span> {displayContent}
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 text-xs text-primary hover:text-primary-foreground"
              onClick={() => toggleFieldExpansion(field.id)}
              data-testid={`button-toggle-${fieldConfig.name}`}
            >
              {isExpanded ? '[Show less]' : '[Show more]'}
            </Button>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  const isLoading = isLoadingCategories || isLoadingIdeas;
  const error = categoriesError || ideasError;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Error loading board: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 pb-4 min-h-96" 
             style={{
               gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))'
             }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-0">
              <Skeleton className="h-full min-h-96" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Navigation function to switch to Submit Ideas tab
  const handleAddIdea = () => {
    if (onNavigateToSubmit) {
      onNavigateToSubmit();
    }
  };

  return (
    <div className="space-y-4" data-testid="idea-board">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ideas Board</h2>
          <p className="text-muted-foreground">
            Kanban-style view with {filteredIdeas.length} ideas across {activeCategories.length} categories
          </p>
        </div>
        <Button size="sm" onClick={handleAddIdea} data-testid="button-add-idea">
          <Plus className="w-4 h-4 mr-2" />
          Add Idea
        </Button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid gap-4 pb-4 min-h-96 auto-cols-fr overflow-x-auto" 
           style={{
             gridTemplateColumns: `repeat(${Math.max(activeCategories.length, 1)}, minmax(280px, 1fr))`
           }}>
        {activeCategories.map((category) => {
          const categoryIdeas = ideaGroups[category.key] || [];
          
          return (
            <div
              key={category.id}
              className="min-w-0"
              data-testid={`column-${category.key}`}
            >
              {/* Column Header */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.title}
                    <Badge variant="secondary" className="ml-auto">
                      {categoryIdeas.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Ideas Column */}
              <div 
                className={`space-y-3 min-h-32 p-2 rounded transition-colors ${
                  dragOverCategory === category.key ? 'bg-muted/50 border-2 border-dashed border-primary' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, category.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category.key)}
                data-testid={`drop-zone-${category.key}`}
              >
                {categoryIdeas.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No ideas in this category
                    </CardContent>
                  </Card>
                ) : (
                  categoryIdeas.map((idea) => (
                    <Card 
                      key={idea.id} 
                      className={`hover-elevate cursor-grab active:cursor-grabbing transition-all ${
                        draggedIdea?.id === idea.id ? 'opacity-50 rotate-2 scale-95' : ''
                      }`}
                      data-testid={`idea-card-${idea.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idea)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base line-clamp-2">
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {idea.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {/* Author */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            {idea.name}
                          </div>

                          {/* Component and Tag */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              data-testid={`badge-component-${idea.id}`}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {idea.component}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              data-testid={`badge-tag-${idea.id}`}
                            >
                              {idea.tag}
                            </Badge>
                            {/* Render badge fields (text, list) */}
                            {renderBadgeFields(idea.dynamicFields || [])}
                          </div>
                          
                          {/* Render textarea fields with minimal spacing */}
                          <div className="space-y-1">
                            {renderTextareaFields(idea.dynamicFields || [])}
                          </div>

                          {/* Created Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {activeCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <h3 className="font-semibold mb-2">No Active Categories</h3>
              <p>Kanban board requires at least one active category. Please configure categories in the admin dashboard.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}