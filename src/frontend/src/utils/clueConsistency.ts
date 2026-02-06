// Consistency guard to prevent stale clue data from reappearing after deletion
// Tracks recently deleted clues and bulk clear operations

interface ConsistencyState {
  deletedClueIds: Set<bigint>;
  lastClearTimestamp: number | null;
}

const state: ConsistencyState = {
  deletedClueIds: new Set(),
  lastClearTimestamp: null,
};

// Track a deleted clue ID
export function markClueDeleted(clueId: bigint): void {
  state.deletedClueIds.add(clueId);
  
  // Clean up after 10 seconds to prevent memory leak
  setTimeout(() => {
    state.deletedClueIds.delete(clueId);
  }, 10000);
}

// Track a bulk clear operation
export function markAllCluesCleared(): void {
  state.lastClearTimestamp = Date.now();
  state.deletedClueIds.clear();
  
  // Reset after 10 seconds
  setTimeout(() => {
    state.lastClearTimestamp = null;
  }, 10000);
}

// Check if a clue should be filtered out
export function isClueDeleted(clueId: bigint): boolean {
  return state.deletedClueIds.has(clueId);
}

// Check if we're in a post-clear window (should ignore all clues)
export function isInClearWindow(): boolean {
  if (state.lastClearTimestamp === null) return false;
  return Date.now() - state.lastClearTimestamp < 10000; // 10 second window
}

// Filter a clue list based on consistency state
export function filterDeletedClues<T extends { id: bigint }>(clues: T[]): T[] {
  if (isInClearWindow()) {
    return [];
  }
  return clues.filter(clue => !isClueDeleted(clue.id));
}

// Reset all consistency state (useful for testing or manual reset)
export function resetConsistencyState(): void {
  state.deletedClueIds.clear();
  state.lastClearTimestamp = null;
}
