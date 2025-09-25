import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, Target, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { SummitHomeContent } from '@shared/schema';
import DOMPurify from 'isomorphic-dompurify';

export default function SummitHomePage() {
  // Fetch published home content
  const { data: homeContent, isLoading, error } = useQuery<SummitHomeContent>({
    queryKey: ['/api/home-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (no content published)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="home-loading">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show default content if no published content exists
  if (error || !homeContent) {
    return (
      <div className="space-y-8" data-testid="home-default">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Welcome to AI Summit</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Product & Engineering Summit 2025
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Join us for an exciting exploration of AI innovation, collaboration, and breakthrough solutions. 
            Share your ideas, discover new possibilities, and connect with fellow innovators.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Submit Ideas</h3>
              <p className="text-muted-foreground text-sm">
                Share your AI innovations, stories, and solutions with the community.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Collaborate</h3>
              <p className="text-muted-foreground text-sm">
                Explore ideas from other attendees and discover new perspectives.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Make Impact</h3>
              <p className="text-muted-foreground text-sm">
                Turn concepts into reality and drive meaningful innovation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Submit Your Ideas</h3>
                  <p className="text-muted-foreground">
                    Navigate to the "Submit Ideas" tab to share your AI innovations, stories, or solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Browse & Discover</h3>
                  <p className="text-muted-foreground">
                    Explore the "Browse Ideas" section to see what others are working on and find inspiration.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Track Progress</h3>
                  <p className="text-muted-foreground">
                    View analytics and insights about submissions and engagement across the summit.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show published content
  return (
    <div className="space-y-6" data-testid="home-content">
      {/* Content Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" data-testid="home-title">
          {homeContent.title}
        </h1>
      </div>

      {/* Rich Content */}
      <Card>
        <CardContent className="p-8">
          <div 
            className="prose prose-lg max-w-none 
                       prose-headings:text-foreground prose-p:text-foreground 
                       prose-strong:text-foreground prose-em:text-foreground
                       prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground
                       prose-blockquote:text-muted-foreground prose-blockquote:border-l-border
                       prose-a:text-primary hover:prose-a:text-primary/80
                       prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                       prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(homeContent.content, {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'a', 'img', 'br', 'span', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
              })
            }}
            data-testid="home-content-body"
          />
        </CardContent>
      </Card>

      {/* Additional Summit Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="hover-elevate">
          <CardContent className="p-6 text-center">
            <Lightbulb className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Submit Ideas</h3>
            <p className="text-sm text-muted-foreground">
              Share your innovative concepts and solutions
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Browse Ideas</h3>
            <p className="text-sm text-muted-foreground">
              Explore submissions from fellow attendees
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">View Analytics</h3>
            <p className="text-sm text-muted-foreground">
              See summit participation and insights
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}