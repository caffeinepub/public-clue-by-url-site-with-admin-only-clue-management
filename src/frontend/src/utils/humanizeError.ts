/**
 * Converts unknown error values into human-readable English messages.
 * Handles agent/replica errors, authorization failures, and validation errors.
 */
export function humanizeError(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unknown error occurred';
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects and error-like objects with message property
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    
    if (typeof message === 'string') {
      // Check for common authorization patterns
      if (message.includes('Unauthorized') || message.includes('Only admins')) {
        return 'You do not have permission to perform this action';
      }
      
      // Check for validation errors
      if (message.includes('not found')) {
        return 'The requested item was not found';
      }
      
      if (message.includes('already exists')) {
        return 'An item with that identifier already exists';
      }
      
      // Check for actor/agent errors
      if (message.includes('Actor not initialized')) {
        return 'Connection not ready. Please try again in a moment';
      }
      
      // Return the message as-is if it's already readable
      return message;
    }
  }

  // Fallback for truly unknown errors
  return 'An unexpected error occurred';
}
