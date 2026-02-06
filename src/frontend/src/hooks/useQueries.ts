import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ClueSummary, Clue, AnswerResult } from '../backend';
import { markClueDeleted, markAllCluesCleared, filterDeletedClues, isInClearWindow } from '../utils/clueConsistency';

export function useGetAllClueSummaries() {
  const { actor, isFetching } = useActor();

  return useQuery<ClueSummary[]>({
    queryKey: ['clueSummaries'],
    queryFn: async () => {
      if (!actor) return [];
      const clues = await actor.getAllClueSummaries();
      // Apply consistency filter to prevent deleted clues from reappearing
      return filterDeletedClues(clues);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFirstAvailableClueSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<ClueSummary | null>({
    queryKey: ['firstAvailableClue'],
    queryFn: async () => {
      if (!actor) return null;
      
      // If we're in a clear window, return null immediately
      if (isInClearWindow()) {
        return null;
      }
      
      try {
        return await actor.getFirstAvailableClueSummary();
      } catch (error: any) {
        if (error.message?.includes('No clues available')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetClueSummary(clueId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ClueSummary | null>({
    queryKey: ['clueSummary', clueId?.toString()],
    queryFn: async () => {
      if (!actor || clueId === null) return null;
      try {
        return await actor.getClueSummary(clueId);
      } catch (error: any) {
        console.error('Get clue summary error:', error);
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

export function useSubmitAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clueId, answer }: { clueId: bigint; answer: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.submitAnswer(clueId, answer);
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          throw new Error('Clue not found');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate clue summaries in case progression state changed
      queryClient.invalidateQueries({ queryKey: ['clueSummaries'] });
    },
  });
}

export function useCreateClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clue: Clue) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.createClue(clue);
    },
    onSuccess: async () => {
      // Proactively refetch to ensure new clue appears immediately
      await queryClient.refetchQueries({ queryKey: ['clueSummaries'] });
      await queryClient.refetchQueries({ queryKey: ['firstAvailableClue'] });
    },
    onError: (error: any) => {
      // Log full error for debugging
      console.error('Create clue mutation error:', error);
    },
  });
}

export function useEditClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clueId, updatedClue }: { clueId: bigint; updatedClue: Clue }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.editClue(clueId, updatedClue);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only authorized users can edit clues');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Clue not found');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      // Force refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: ['clueSummaries'] });
      await queryClient.refetchQueries({ queryKey: ['firstAvailableClue'] });
    },
    onError: (error: any) => {
      console.error('Edit clue mutation error:', error);
    },
  });
}

export function useReassignClueId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oldId, newId }: { oldId: bigint; newId: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.reassignClueId(oldId, newId);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only authorized users can reassign clue IDs');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Clue not found');
        }
        if (error.message?.includes('already exists')) {
          throw new Error('A clue with that ID already exists');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      // Force refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: ['clueSummaries'] });
      await queryClient.refetchQueries({ queryKey: ['firstAvailableClue'] });
    },
    onError: (error: any) => {
      console.error('Reassign clue ID mutation error:', error);
    },
  });
}

export function useDeleteClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clueId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.deleteClue(clueId);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only authorized users can delete clues');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Clue not found');
        }
        throw error;
      }
    },
    onMutate: async (clueId) => {
      // Mark clue as deleted in consistency guard
      markClueDeleted(clueId);
      
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['clueSummaries'] });
      await queryClient.cancelQueries({ queryKey: ['firstAvailableClue'] });

      // Snapshot the previous value
      const previousClues = queryClient.getQueryData<ClueSummary[]>(['clueSummaries']);

      // Optimistically update to remove the deleted clue
      if (previousClues) {
        queryClient.setQueryData<ClueSummary[]>(
          ['clueSummaries'],
          previousClues.filter((clue) => clue.id !== clueId)
        );
      }

      // Return a context object with the snapshotted value
      return { previousClues };
    },
    onError: (error: any, clueId, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousClues) {
        queryClient.setQueryData(['clueSummaries'], context.previousClues);
      }
      console.error('Delete clue mutation error:', error);
    },
    onSuccess: async (_, clueId) => {
      // Invalidate per-clue summary cache for the deleted clue
      queryClient.removeQueries({ queryKey: ['clueSummary', clueId.toString()] });
      
      // Refetch summaries and first available clue to ensure backend state is reflected
      await queryClient.refetchQueries({ queryKey: ['clueSummaries'] });
      await queryClient.refetchQueries({ queryKey: ['firstAvailableClue'] });
    },
  });
}

export function useClearAllClues() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.clearAllClues();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only authorized users can clear all clues');
        }
        throw error;
      }
    },
    onMutate: async () => {
      // Mark all clues as cleared in consistency guard
      markAllCluesCleared();
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clueSummaries'] });
      await queryClient.cancelQueries({ queryKey: ['firstAvailableClue'] });
      await queryClient.cancelQueries({ queryKey: ['clueSummary'] });

      // Snapshot previous values for rollback
      const previousClues = queryClient.getQueryData<ClueSummary[]>(['clueSummaries']);
      const previousFirstClue = queryClient.getQueryData<ClueSummary | null>(['firstAvailableClue']);

      // Optimistically clear all clue data
      queryClient.setQueryData(['clueSummaries'], []);
      queryClient.setQueryData(['firstAvailableClue'], null);

      return { previousClues, previousFirstClue };
    },
    onError: (error: any, _, context) => {
      // Roll back on error
      if (context?.previousClues) {
        queryClient.setQueryData(['clueSummaries'], context.previousClues);
      }
      if (context?.previousFirstClue !== undefined) {
        queryClient.setQueryData(['firstAvailableClue'], context.previousFirstClue);
      }
      console.error('Clear all clues mutation error:', error);
    },
    onSuccess: async () => {
      // Remove all individual clue queries
      queryClient.removeQueries({ queryKey: ['clueSummary'] });
      
      // Refetch to confirm backend state
      await queryClient.refetchQueries({ queryKey: ['clueSummaries'] });
      await queryClient.refetchQueries({ queryKey: ['firstAvailableClue'] });
    },
  });
}
