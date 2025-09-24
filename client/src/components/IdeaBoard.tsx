import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Tag, User } from 'lucide-react';
import type { Idea, KanbanCategory } from '@shared/schema';

interface IdeaBoardProps {
  searchTerm?: string;
  componentFilter?: string;
  tagFilter?: string;
}

export default function IdeaBoard({ searchTerm = '', componentFilter = '', tagFilter = '' }: IdeaBoardProps) {
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
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-80 flex-shrink-0">
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
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-96">
        {activeCategories.map((category) => {
          const categoryIdeas = ideaGroups[category.key] || [];
          
          return (
            <div
              key={category.id}
              className="min-w-80 flex-shrink-0"
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
              <div className="space-y-3">
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
                      className="hover-elevate cursor-pointer"
                      data-testid={`idea-card-${idea.id}`}
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