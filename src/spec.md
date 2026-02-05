# Specification

## Summary
**Goal:** Add slug-based, titled, rich-content clues with Start-gated access to the first clue, improved navigation/paste workflows, and a Windows Aero-inspired theme.

**Planned changes:**
- Update backend clue model and APIs to store and serve clues as records with `slug`, `title`, and `content`, while keeping a stable ordering to identify the first clue.
- Add conditional backend state migration to convert existing text-only numeric clues into the new record format with deterministic numeric slugs (e.g., "1") and non-empty default titles (e.g., "Clue #1").
- Update frontend routing and clue loading to use `/echofields/{slug}` and show a clear “Clue Not Found” state for unknown slugs.
- Display clue titles prominently on clue pages and in admin lists alongside the slug/path.
- Implement Start gating for the first clue: show Start on `/echofields` only when at least one clue exists; require Start (session-scoped) before revealing the first clue’s content.
- Update clue navigation UX to allow entering/pasting the next slug (or an internal `/echofields/{slug}` path) to navigate; keep existing external URL handling behavior.
- Extend admin create workflow with inputs for Title, URL segment (slug), and Content, plus a clearly labeled “Create Clue” button and slug/path preview with basic validation.
- Add rich paste support in the admin content area to detect pasted image/video/PPT URLs and auto-insert supported markup (`![Image](url)`, `{{video:url}}`, `{{ppt:url}}`) without altering non-matching pasted text.
- Apply a Windows Aero-inspired visual theme across home, clue pages, and admin pages using glass-like surfaces, gradients, blur/transparency, while keeping text readable in light/dark modes.

**User-visible outcome:** Users can open clues via human-readable `/echofields/{slug}` URLs and see clue titles; the first clue stays locked until Start is pressed (when clues exist); admins can create titled, slugged clues and paste media links that auto-format; the entire site uses a consistent Windows Aero-style look.
