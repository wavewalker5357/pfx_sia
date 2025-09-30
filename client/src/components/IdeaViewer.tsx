import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, List, Kanban, ArrowUpDown } from 'lucide-react';
import IdeaBrowser from './IdeaBrowser';
import IdeaBoard from './IdeaBoard';
import VotingBanner from './VotingBanner';
import type { ViewSettings, Idea } from '@shared/schema';

type ViewMode = 'list' | 'board';
type SortBy = 'date-desc' | 'date-asc' | 'votes-desc' | 'votes-asc';

interface IdeaViewerProps {
  onNavigateToSubmit?: () => void;
}

export default function IdeaViewer({ onNavigateToSubmit }: IdeaViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');

  // Fetch view settings to determine default view
  const { data: viewSettings } = useQuery<ViewSettings>({
    queryKey: ['/api/view-settings'],
    queryFn: async () => {
      const response = await fetch('/api/view-settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch view settings');
      return response.json();
    },
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Update view mode when settings are loaded
  useEffect(() => {
    if (viewSettings) {
      const defaultView = (viewSettings.defaultView as ViewMode) || 'list';
      setViewMode(defaultView);
    }
  }, [viewSettings]);

  // Get unique filter options from ideas data
  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ['/api/ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
  });

  // Split comma-separated values for filters
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

  return (
    <div className="space-y-6">
      {/* Voting Banner */}
      <VotingBanner />

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search ideas, descriptions, or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-ideas"
              />
            </div>

            {/* Component Filter */}
            <Select value={componentFilter || "all"} onValueChange={(value) => setComponentFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-component-filter">
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
            <Select value={tagFilter || "all"} onValueChange={(value) => setTagFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-tag-filter">
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

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-sort-by">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes-desc">Most Voted</SelectItem>
                <SelectItem value="votes-asc">Least Voted</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="flex items-center gap-2"
                data-testid="button-board-view"
              >
                <Kanban className="w-4 h-4" />
                Board
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Content */}
      {viewMode === 'list' ? (
        <IdeaBrowser 
          searchTerm={searchTerm}
          componentFilter={componentFilter} 
          tagFilter={tagFilter}
        />
      ) : (
        <IdeaBoard 
          searchTerm={searchTerm}
          componentFilter={componentFilter}
          tagFilter={tagFilter}
          onNavigateToSubmit={onNavigateToSubmit}
        />
      )}
    </div>
  );
}