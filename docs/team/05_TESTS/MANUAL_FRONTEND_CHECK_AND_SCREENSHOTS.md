# Manual UI verification after Chrome automation blocked

The Phase 2E automated Chrome failed before page navigation with a GPU process startup error. **Do not conclude that the existing UI fails.** Assign one team member to a small, local-only browser smoke test with synthetic data.

1. Verify preview port free; use `node .\node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port 4173 --strictPort` only after local safety approval. No public bind. Avoid external service credentials, and remember the page may request Google Fonts. Use new InPrivate/Incognito browser with network-awareness.
2. Visit `http://127.0.0.1:4173` manually in Edge/Chrome. Record screenshot of dashboard at normal desktop width; console errors and failed network requests.
3. Search/filter/pagination in existing Applications screen; capture actual count/fixture state.
4. Create a **fictional** case, reload page, open a second private profile and record which profile has the case. Do not claim DB persistence from browser storage.
5. View case dossier tabs; try valid demo next-step and record whether timeline/metrics update; preserve a video clip or screenshots.
6. Open EVC, compliance, document-expiry screens; try synthetic controls but label file-name-only operations clearly as mock behavior.
7. Close preview and run `git status --short`, preserving screenshots outside repo until reviewed.

**Deliverable:** simple UI matrix `view | opens | action works | uses localStorage? | error | screenshot path`. Attach only genuine screenshots. Re-run after Member 1 HTTP adapter integrates the backend; visual smoke alone is not acceptance of workflow protections.
