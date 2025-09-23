import { ExternalLink, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Mock data for summit resources - TODO: replace with API data
const summitResources = [
  { id: '1', title: 'Summit Agenda', url: 'https://example.com/agenda', description: 'Daily schedule and sessions', isActive: 'true' },
  { id: '2', title: 'Meeting Rooms', url: 'https://example.com/rooms', description: 'Reserve conference rooms', isActive: 'true' },
  { id: '3', title: 'Lunch Menu', url: 'https://example.com/lunch', description: 'Today\'s meal options', isActive: 'true' },
  { id: '4', title: 'Evening Activities', url: 'https://example.com/activities', description: 'After-hours events', isActive: 'true' },
  { id: '5', title: 'Hotels & Travel', url: 'https://example.com/hotels', description: 'Accommodation information', isActive: 'true' },
];

export default function SummitResourcesDropdown() {
  const activeResources = summitResources.filter(resource => resource.isActive === 'true');

  const handleLinkClick = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="button-summit-resources"
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Summit Resources
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {activeResources.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No resources available</span>
          </DropdownMenuItem>
        ) : (
          activeResources.map((resource, index) => (
            <div key={resource.id}>
              <DropdownMenuItem
                onClick={() => handleLinkClick(resource.url, resource.title)}
                className="flex items-center justify-between cursor-pointer"
                data-testid={`resource-link-${resource.id}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{resource.title}</span>
                  {resource.description && (
                    <span className="text-xs text-muted-foreground">{resource.description}</span>
                  )}
                </div>
                <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
              </DropdownMenuItem>
              {index < activeResources.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}