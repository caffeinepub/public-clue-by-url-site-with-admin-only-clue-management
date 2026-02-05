import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface Clue {
  id: string;
  title: string;
  content: string;
  createdAt: bigint;
}

// Mock data for demonstration until backend is implemented
const mockClues: Clue[] = [
  {
    id: 'welcome',
    title: 'Welcome to Echofields',
    content: 'This is your first clue. The journey begins here. Look for the word "hidden" to find your next path.',
    createdAt: BigInt(Date.now() * 1000000),
  },
  {
    id: 'hidden',
    title: 'The Hidden Path',
    content: 'You found the hidden path! The next clue awaits at "mystery".',
    createdAt: BigInt(Date.now() * 1000000),
  },
  {
    id: 'mystery',
    title: 'The Mystery Deepens',
    content: 'Well done! You are progressing through the fields. This is a placeholder until the backend is fully implemented.',
    createdAt: BigInt(Date.now() * 1000000),
  },
];

export function useListClues() {
  const { actor, isFetching } = useActor();

  return useQuery<Clue[]>({
    queryKey: ['clues'],
    queryFn: async () => {
      if (!actor) return mockClues;
      // Backend method not yet implemented, using mock data
      // When backend is ready: return actor.listAllClues();
      return mockClues;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClue(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Clue | null>({
    queryKey: ['clue', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      // Backend method not yet implemented, using mock data
      // When backend is ready: 
      // const result = await actor.getClue(id);
      // if ('Some' in result) return result.Some;
      // return null;
      const clue = mockClues.find(c => c.id === id);
      return clue || null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateClue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clue: { id: string; title: string; content: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not yet implemented
      // When backend is ready: return actor.createClue(clue.id, clue.title, clue.content);
      
      // Simulate backend call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add to mock data
      mockClues.push({
        ...clue,
        createdAt: BigInt(Date.now() * 1000000),
      });
      
      return { success: true };
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
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not yet implemented
      // When backend is ready: return actor.deleteClue(id);
      
      // Simulate backend call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from mock data
      const index = mockClues.findIndex(c => c.id === id);
      if (index > -1) {
        mockClues.splice(index, 1);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clues'] });
    },
  });
}
