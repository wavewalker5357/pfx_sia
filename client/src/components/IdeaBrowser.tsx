import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demo purposes - TODO: remove mock functionality
const mockIdeas = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'AI-Powered Code Review Assistant',
    description: 'An intelligent system that automatically reviews code changes, suggests improvements, and identifies potential security vulnerabilities using machine learning models.',
    component: 'AI/ML',
    tag: 'automation',
    type: 'AI Solution',
    createdAt: new Date('2025-01-15T10:30:00'),
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    title: 'Smart Meeting Summarizer',
    description: 'A tool that joins virtual meetings, transcribes conversations, and generates actionable summaries with key decisions and follow-up tasks.',
    component: 'Product',
    tag: 'productivity',
    type: 'AI Idea',
    createdAt: new Date('2025-01-15T11:15:00'),
  },
  {
    id: '3',
    name: 'Jordan Kim',
    title: 'Automated Testing Story Generator',
    description: 'Using GPT to automatically generate comprehensive test scenarios based on user stories and acceptance criteria, reducing manual testing effort.',
    component: 'Frontend',
    tag: 'efficiency',
    type: 'AI Story',
    createdAt: new Date('2025-01-15T14:20:00'),
  },
  {
    id: '4',
    name: 'Taylor Swift',
    title: 'Intelligent Resource Allocation',
    description: 'AI system that predicts project resource needs and automatically assigns team members based on skills, availability, and project requirements.',
    component: 'Product',
    tag: 'optimization',
    type: 'AI Solution',
    createdAt: new Date('2025-01-15T15:45:00'),
  },
  {
    id: '5',
    name: 'Morgan Lee',
    title: 'Dynamic Documentation Generator',
    description: 'An AI that reads code repositories and automatically generates and maintains up-to-date documentation, API specs, and usage examples.',
    component: 'Backend',
    tag: 'automation',
    type: 'AI Idea',
    createdAt: new Date('2025-01-15T16:10:00'),
  },
];

const typeColors = {
  'AI Story': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'AI Idea': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'AI Solution': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function IdeaBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterComponent, setFilterComponent] = useState('all');

  const filteredIdeas = mockIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || idea.type === filterType;
    const matchesComponent = filterComponent === 'all' || idea.component === filterComponent;
    
    return matchesSearch && matchesType && matchesComponent;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            <Select value={filterComponent} onValueChange={setFilterComponent}>
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
              Showing {filteredIdeas.length} of {mockIdeas.length} ideas
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterComponent('all');
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