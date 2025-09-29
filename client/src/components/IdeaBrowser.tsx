import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { IdeaWithFields } from '@shared/schema';


const typeColors = {
  'AI Story': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'AI Idea': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'AI Solution': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

interface IdeaBrowserProps {
  searchTerm?: string;
  componentFilter?: string;
  tagFilter?: string;
}

export default function IdeaBrowser({ searchTerm = '', componentFilter = '', tagFilter = '' }: IdeaBrowserProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [localFilterComponent, setLocalFilterComponent] = useState('all');

  // Use props if provided, otherwise use local state for backward compatibility
  const effectiveSearchTerm = searchTerm || localSearchTerm;
  const effectiveComponentFilter = componentFilter !== undefined ? componentFilter : (localFilterComponent === 'all' ? '' : localFilterComponent);
  const effectiveTagFilter = tagFilter;

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

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !effectiveSearchTerm || 
      idea.title.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
      idea.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase());
    const matchesType = filterType === 'all' || idea.type === filterType;
    const matchesComponent = !effectiveComponentFilter || idea.component === effectiveComponentFilter;
    const matchesTag = !effectiveTagFilter || idea.tag === effectiveTagFilter;
    
    return matchesSearch && matchesType && matchesComponent && matchesTag;
  });

  const formatTime = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
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
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Ideas</CardTitle>
          <CardDescription>
            Explore all submitted AI ideas, stories, and solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search ideas..."
                value={effectiveSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-type">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="AI Story">AI Story</SelectItem>
                <SelectItem value="AI Idea">AI Idea</SelectItem>
                <SelectItem value="AI Solution">AI Solution</SelectItem>
              </SelectContent>
            </Select>

            <Select value={effectiveComponentFilter} onValueChange={setLocalFilterComponent}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-component">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="AI/ML">AI/ML</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredIdeas.length} of {ideas.length} ideas
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setLocalSearchTerm('');
                setFilterType('all');
                setLocalFilterComponent('all');
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIdeas.map((idea, index) => (
          <Card key={idea.id} className="hover-elevate" data-testid={`card-idea-${index}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="w-4 h-4" />
                    <span data-testid={`text-author-${index}`}>{idea.name}</span>
                    <Calendar className="w-4 h-4 ml-2" />
                    <span>{formatTime(idea.createdAt)}</span>
                  </div>
                </div>
                <Badge 
                  className={typeColors[idea.type as keyof typeof typeColors]}
                  data-testid={`badge-type-${index}`}
                >
                  {idea.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4 line-clamp-3">
                {idea.description}
              </CardDescription>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" data-testid={`badge-component-${index}`}>
                  {idea.component}
                </Badge>
                <Badge variant="secondary" data-testid={`badge-tag-${index}`}>
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
        ))}
      </div>

      {filteredIdeas.length === 0 && (
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