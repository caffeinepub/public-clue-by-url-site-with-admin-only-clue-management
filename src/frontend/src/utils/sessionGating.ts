/**
 * Session storage utilities for Start gating and progression tracking
 */

const START_GATING_KEY = 'echofields-start-pressed';
const UNLOCKED_MAX_CLUE_ID_KEY = 'echofields-unlocked-max-clue-id';

export function hasStarted(): boolean {
  return sessionStorage.getItem(START_GATING_KEY) === 'true';
}

export function markStarted(firstClueId: bigint): void {
  sessionStorage.setItem(START_GATING_KEY, 'true');
  sessionStorage.setItem(UNLOCKED_MAX_CLUE_ID_KEY, firstClueId.toString());
}

export function clearStarted(): void {
  sessionStorage.removeItem(START_GATING_KEY);
  sessionStorage.removeItem(UNLOCKED_MAX_CLUE_ID_KEY);
}

export function getUnlockedMaxClueId(): bigint | null {
  const stored = sessionStorage.getItem(UNLOCKED_MAX_CLUE_ID_KEY);
  if (!stored) return null;
  try {
    return BigInt(stored);
  } catch {
    return null;
  }
}

export function unlockNextClue(clueId: bigint): void {
  const current = getUnlockedMaxClueId();
  if (current === null || clueId > current) {
    sessionStorage.setItem(UNLOCKED_MAX_CLUE_ID_KEY, clueId.toString());
  }
}

export function isClueUnlocked(clueId: bigint): boolean {
  if (!hasStarted()) return false;
  const maxUnlocked = getUnlockedMaxClueId();
  if (maxUnlocked === null) return false;
  return clueId <= maxUnlocked;
}
