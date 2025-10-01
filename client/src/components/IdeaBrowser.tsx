import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, User, ThumbsUp, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { IdeaWithFields } from '@shared/schema';
import { useVoting } from '@/hooks/useVoting';

export type SortBy = 'date-desc' | 'date-asc' | 'votes-desc' | 'votes-asc';

const typeColors = {
  'AI Story': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'AI Idea': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'AI Solution': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

interface IdeaBrowserProps {
  searchTerm?: string;
  componentFilter?: string;
  tagFilter?: string;
  sortBy?: SortBy;
  showFilterControls?: boolean; // New prop to control whether to show built-in filters
}

export default function IdeaBrowser({ 
  searchTerm = '', 
  componentFilter = '', 
  tagFilter = '', 
  sortBy = 'date-desc',
  showFilterControls = false 
}: IdeaBrowserProps) {
  // Local state for when component is used independently
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localComponentFilter, setLocalComponentFilter] = useState('');
  const [localTagFilter, setLocalTagFilter] = useState('');

  // Use local state when in independent mode, otherwise use props (parent-controlled)
  const effectiveSearchTerm = showFilterControls ? localSearchTerm : searchTerm;
  const effectiveComponentFilter = showFilterControls ? localComponentFilter : componentFilter;
  const effectiveTagFilter = showFilterControls ? localTagFilter : tagFilter;

  // Voting hook
  const { isVotingOpen, getMyVotesForIdea, canVote, vote, isVoting } = useVoting();

  // Fetch ideas with dynamic fields from API
  const { data: ideas = [], isLoading, error } = useQuery<IdeaWithFields[]>({
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

  // Get unique filter options for independent mode - split comma-separated values
  const uniqueComponents = Array.from(new Set(
    ideas
      .filter(idea => idea.component)
      .flatMap(idea => idea.component!.split(',').map(c => c.trim()))
      .filter(c => c)
  ));
  
  const uniqueTags = Array.from(new Set(
    ideas
      .filter(idea => idea.tag)
      .flatMap(idea => idea.tag!.split(',').map(t => t.trim()))
      .filter(t => t)
  ));

  // Filter ideas based on search and filter criteria (matching IdeaBoard.tsx exactly)
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !effectiveSearchTerm || 
      idea.title.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      idea.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase());
    
    // Check if filter value exists in comma-separated list
    const matchesComponent = !effectiveComponentFilter || 
      (idea.component && idea.component.split(',').map(c => c.trim()).includes(effectiveComponentFilter));
    
    const matchesTag = !effectiveTagFilter || 
      (idea.tag && idea.tag.split(',').map(t => t.trim()).includes(effectiveTagFilter));
    
    return matchesSearch && matchesComponent && matchesTag;
  });

  // Sort ideas based on sortBy prop
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'votes-desc':
        return (b.totalVotes || 0) - (a.totalVotes || 0);
      case 'votes-asc':
        return (a.totalVotes || 0) - (b.totalVotes || 0);
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'date-desc':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const formatTime = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
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
        <div key={field.id} className="text-sm" data-testid={`text-dynamic-${fieldConfig.name}`}>
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p>Loading ideas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-destructive">Failed to load ideas. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conditional Filter Controls for Independent Mode */}
      {showFilterControls && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search ideas, descriptions, or authors..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-ideas-local"
                />
              </div>

              {/* Component Filter */}
              <Select value={localComponentFilter || "all"} onValueChange={(value) => setLocalComponentFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-component-filter-local">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Components" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Components</SelectItem>
                  {uniqueComponents.map((component) => (
                    <SelectItem key={component} value={component}>
                      {component}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tag Filter */}
              <Select value={localTagFilter || "all"} onValueChange={(value) => setLocalTagFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-tag-filter-local">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {sortedIdeas.length} of {ideas.length} ideas
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setLocalSearchTerm('');
                  setLocalComponentFilter('');
                  setLocalTagFilter('');
                }}
                data-testid="button-clear-filters-local"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedIdeas.map((idea, index) => {
          const myVotes = getMyVotesForIdea(idea.id);
          const canVoteUp = canVote(idea.id, true);
          const canVoteDown = canVote(idea.id, false);

          return (
            <Card key={idea.id} className="hover-elevate" data-testid={`card-idea-${idea.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 break-words line-clamp-2">{idea.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <User className="w-4 h-4" />
                      <span data-testid={`text-author-${idea.id}`}>{idea.name}</span>
                      <Calendar className="w-4 h-4 ml-2" />
                      <span>{formatTime(idea.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={typeColors[idea.type as keyof typeof typeColors]}
                      data-testid={`badge-type-${idea.id}`}
                    >
                      {idea.type}
                    </Badge>
                  </div>
                </div>
                {/* Voting Controls */}
                {isVotingOpen && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => vote(idea.id, false)}
                      disabled={!canVoteDown || isVoting}
                      data-testid={`button-vote-down-${idea.id}`}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="px-3" data-testid={`badge-my-votes-${idea.id}`}>
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {myVotes}
                    </Badge>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => vote(idea.id, true)}
                      disabled={!canVoteUp || isVoting}
                      data-testid={`button-vote-up-${idea.id}`}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      Total: <span className="font-semibold" data-testid={`text-total-votes-${idea.id}`}>{idea.totalVotes || 0}</span>
                    </span>
                  </div>
                )}
                {!isVotingOpen && idea.totalVotes !== undefined && idea.totalVotes > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" data-testid={`badge-votes-closed-${idea.id}`}>
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {idea.totalVotes} vote{idea.totalVotes !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4 line-clamp-3">
                {idea.description}
              </CardDescription>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" data-testid={`badge-component-${idea.id}`}>
                  {idea.component}
                </Badge>
                <Badge variant="secondary" data-testid={`badge-tag-${idea.id}`}>
                  #{idea.tag}
                </Badge>
                {/* Render badge fields (text, list) */}
                {renderBadgeFields(idea.dynamicFields || [])}
              </div>
              {/* Render textarea fields with minimal spacing */}
              <div className="space-y-1">
                {renderTextareaFields(idea.dynamicFields || [])}
              </div>
            </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedIdeas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No ideas found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}