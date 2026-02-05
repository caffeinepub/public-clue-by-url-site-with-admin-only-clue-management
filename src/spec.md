# Specification

## Summary
**Goal:** Update the app’s frontend routes so all public and admin pages live under a base path that includes “echofields” (e.g., `/echofields/...`).

**Planned changes:**
- Update frontend routing so public clue/progress pages are served under `/echofields/...` while preserving existing URL-based progression behavior.
- Update admin routing so management pages are served under `/echofields/admin` (and related subroutes) and continue to require Internet Identity authentication for admin actions.
- Remove exposure of old top-level public routes that omit “echofields” (either by redirecting to the new paths or only registering the new routes).

**User-visible outcome:** Users can access all public clue/progress pages at `/echofields/...`, and admins can access the admin area at `/echofields/admin`, with old non-“echofields” public routes no longer available.
