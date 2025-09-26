import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Tag, User } from 'lucide-react';
import type { Idea, KanbanCategory } from '@shared/schema';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface IdeaBoardProps {
  searchTerm?: string;
  componentFilter?: string;
  tagFilter?: string;
}

export default function IdeaBoard({ searchTerm = '', componentFilter = '', tagFilter = '' }: IdeaBoardProps) {
  const queryClient = useQueryClient();
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState<Map<string, string>>(new Map()); // ideaId -> target category
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
  const { data: ideas = [], isLoading: isLoadingIdeas, error: ideasError } = useQuery<Idea[]>({
    queryKey: ['/api/ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
  });

  // Filter ideas based on search and filter criteria
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !searchTerm || 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesComponent = !componentFilter || idea.component === componentFilter;
    const matchesTag = !tagFilter || idea.tag === tagFilter;
    
    return matchesSearch && matchesComponent && matchesTag;
  });

  // Group ideas by category
  const activeCategories = categories.filter(cat => cat.isActive === 'true').sort((a, b) => parseInt(a.order) - parseInt(b.order));
  const ideaGroups = activeCategories.reduce((acc, category) => {
    acc[category.key] = filteredIdeas.filter(idea => idea.type === category.key);
    return acc;
  }, {} as Record<string, Idea[]>);

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
    console.log('🔴 Drag ended');
    setDraggedIdea(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e: React.DragEvent, categoryKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryKey);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = async (e: React.DragEvent, categoryKey: string) => {
    e.preventDefault();
    setDragOverCategory(null);
    
    // Get dragged idea from DataTransfer instead of React state
    let draggedIdeaFromEvent: Idea | null = null;
    try {
      const ideaData = e.dataTransfer.getData('application/json');
      if (ideaData) {
        draggedIdeaFromEvent = JSON.parse(ideaData);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }

    // Fallback to React state if DataTransfer fails
    const effectiveDraggedIdea = draggedIdeaFromEvent || draggedIdea;
    
    if (!effectiveDraggedIdea) {
      console.warn('No dragged idea found');
      return;
    }

    const ideaId = effectiveDraggedIdea.id;
    
    // Get the current state of the idea from our fresh data
    const currentIdea = ideas.find(idea => idea.id === ideaId); // Use fresh ideas, not filtered
    const currentType = currentIdea?.type || effectiveDraggedIdea.type;
    
    console.log(`🟡 Dragging "${effectiveDraggedIdea.title}"`);
    console.log(`   📋 Current type in database: ${currentIdea?.type || 'unknown'}`);
    console.log(`   📋 Effective current type: ${currentType}`);
    console.log(`   🎯 Target category: ${categoryKey}`);
    
    if (currentType === categoryKey) {
      console.log('💡 No change needed - idea already in target category');
      return; // No change needed
    }

    // Check if there's already a pending operation for this idea
    const existingTarget = pendingOperations.get(ideaId);
    if (existingTarget) {
      // Update the target for the pending operation
      console.log(`🔄 Updating pending operation target from ${existingTarget} to ${categoryKey}`);
      setPendingOperations(prev => new Map(prev).set(ideaId, categoryKey));
      return;
    }

    // Start new operation
    try {
      // Mark operation as pending
      setPendingOperations(prev => new Map(prev).set(ideaId, categoryKey));
      console.log('🚀 Starting category update operation...');
      
      const result = await updateIdeaCategoryMutation.mutateAsync({
        ideaId: ideaId,
        newType: categoryKey
      });
      
      console.log('✅ API call successful:', result);
    } catch (error) {
      console.error('❌ Failed to move idea:', error);
    } finally {
      // Clear pending operation
      setPendingOperations(prev => {
        const newMap = new Map(prev);
        newMap.delete(ideaId);
        return newMap;
      });
    }
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
        <Button size="sm" data-testid="button-add-idea">
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