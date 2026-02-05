/**
 * Session storage utilities for Start gating
 */

const START_GATING_KEY = 'echofields-start-pressed';

export function hasStarted(): boolean {
  return sessionStorage.getItem(START_GATING_KEY) === 'true';
}

export function markStarted(): void {
  sessionStorage.setItem(START_GATING_KEY, 'true');
}

export function clearStarted(): void {
  sessionStorage.removeItem(START_GATING_KEY);
}
