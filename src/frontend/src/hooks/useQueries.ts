import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useListClues() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['clues'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listClues();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClue(clueId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['clue', clueId?.toString()],
    queryFn: async () => {
      if (!actor || clueId === null) return null;
      try {
        return await actor.getClue(clueId);
      } catch (error: any) {
        console.error('Get clue error:', error);
        if (error.message?.includes('not found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && clueId !== null,
    retry: false,
  });
}

export function useCreateClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clue: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createClue(clue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clues'] });
    },
  });
}

export function useDeleteClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clueId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteClue(clueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clues'] });
    },
  });
}
