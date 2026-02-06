# Specification

## Summary
**Goal:** Make the Spectate Portal “Create Clue” flow work end-to-end by fixing backend authorization for owner principals and ensuring the frontend reliably submits and reports results.

**Planned changes:**
- Backend: align canister authorization so owner principals (matching the frontend allowlist) can perform admin clue actions (createClue, editClue, deleteClue, clearAllClues, reassignClueId) without trapping Unauthorized, while non-owners still receive Unauthorized.
- Frontend: ensure Create Clue form submission triggers createClue reliably, updates the “Existing Clues” list immediately, resets the form on success, and shows success/error toasts with human-readable messages (logging errors to console on failure).

**User-visible outcome:** Owner users can create and manage clues from the Spectate Portal successfully, with immediate list updates and clear success/error feedback; non-owners continue to be blocked with an Unauthorized error.
