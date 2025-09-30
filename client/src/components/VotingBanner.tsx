import { useQuery } from '@tanstack/react-query';
import type { VotingSettings, Vote } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Vote as VoteIcon, AlertCircle } from 'lucide-react';
import { getOrCreateSessionId } from '@/utils/session';

export default function VotingBanner() {
  const sessionId = getOrCreateSessionId();

  // Fetch voting settings
  const { data: votingSettings } = useQuery<VotingSettings>({
    queryKey: ['/api/voting-settings'],
  });

  // Fetch user's votes
  const { data: userVotes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/votes?sessionId=${sessionId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch votes');
      return response.json();
    },
    enabled: !!votingSettings && votingSettings.isOpen === 'true',
  });

  if (!votingSettings) return null;

  const isOpen = votingSettings.isOpen === 'true';
  const maxVotes = votingSettings.maxVotesPerParticipant;
  const usedVotes = userVotes.reduce((sum, vote) => sum + vote.voteCount, 0);
  const remainingVotes = maxVotes - usedVotes;

  if (!isOpen) {
    return (
      <Alert className="border-muted" data-testid="banner-voting-closed">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Voting is closed. You can view the results below.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-primary/50 bg-primary/5" data-testid="banner-voting-open">
      <VoteIcon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">Voting is Open</span>
          <span className="text-muted-foreground">•</span>
          <span>
            You have <Badge variant="outline" className="font-semibold" data-testid="badge-remaining-votes">{remainingVotes}</Badge> vote{remainingVotes !== 1 ? 's' : ''} remaining
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
