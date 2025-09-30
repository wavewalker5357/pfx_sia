import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { VotingSettings, Vote } from '@shared/schema';
import { getOrCreateSessionId } from '@/utils/session';
import { useToast } from '@/hooks/use-toast';

export function useVoting() {
  const { toast } = useToast();
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
    enabled: !!votingSettings,
  });

  // Cast or update vote
  const voteMutation = useMutation({
    mutationFn: async ({ ideaId, voteCount }: { ideaId: string; voteCount: number }) => {
      return apiRequest('POST', '/api/votes', {
        ideaId,
        sessionId,
        voteCount
      });
    },
    onSuccess: async () => {
      // Force immediate refetch instead of just invalidating
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/votes', sessionId] }),
        queryClient.refetchQueries({ queryKey: ['/api/ideas'] })
      ]);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to cast vote';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Delete vote mutation
  const deleteVoteMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      return apiRequest('DELETE', `/api/votes/${ideaId}?sessionId=${sessionId}`);
    },
    onSuccess: async () => {
      // Force immediate refetch instead of just invalidating
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/votes', sessionId] }),
        queryClient.refetchQueries({ queryKey: ['/api/ideas'] })
      ]);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to remove vote';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const isVotingOpen = votingSettings?.isOpen === 'true';
  const maxVotes = votingSettings?.maxVotesPerParticipant || 5;
  const usedVotes = userVotes.reduce((sum, vote) => sum + vote.voteCount, 0);
  const remainingVotes = maxVotes - usedVotes;

  const getMyVotesForIdea = (ideaId: string): number => {
    const vote = userVotes.find(v => v.ideaId === ideaId);
    return vote ? vote.voteCount : 0;
  };

  const canVote = (ideaId: string, increment: boolean): boolean => {
    if (!isVotingOpen) return false;
    const myVotes = getMyVotesForIdea(ideaId);
    
    if (increment) {
      return remainingVotes > 0;
    } else {
      return myVotes > 0;
    }
  };

  const vote = (ideaId: string, increment: boolean) => {
    const myVotes = getMyVotesForIdea(ideaId);
    const newVoteCount = increment ? myVotes + 1 : myVotes - 1;

    if (newVoteCount < 0) return;

    if (newVoteCount === 0) {
      // Remove vote entirely
      deleteVoteMutation.mutate(ideaId);
    } else {
      voteMutation.mutate({ ideaId, voteCount: newVoteCount });
    }
  };

  return {
    isVotingOpen,
    maxVotes,
    usedVotes,
    remainingVotes,
    getMyVotesForIdea,
    canVote,
    vote,
    isVoting: voteMutation.isPending || deleteVoteMutation.isPending,
  };
}
