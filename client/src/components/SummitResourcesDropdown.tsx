import { ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import type { SummitResource } from '@shared/schema';

export default function SummitResourcesDropdown() {
  const { data: summitResources = [], isLoading } = useQuery<SummitResource[]>({
    queryKey: ['/api/summit-resources'],
    enabled: true,
  });

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
        {isLoading ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Loading...</span>
          </DropdownMenuItem>
        ) : activeResources.length === 0 ? (
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
                asChild
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(resource.url, resource.title);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{resource.title}</span>
                    {resource.description && (
                      <span className="text-xs text-muted-foreground">{resource.description}</span>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                </a>
              </DropdownMenuItem>
              {index < activeResources.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}