# Prizm: Safe Changes to Saving & Serving Presentations

This guide outlines low‑risk, incremental improvements to how presentations are saved and served, based on the current code. Use the checklists to apply changes one by one.

## What You Have Now

- Single‑row JSON: Slides are stored as a JSON array on each `Project` (simple, but large writes).
- Client state: Zustand with localStorage persistence and a safe wrapper.
- Autosave disabled: Debounce shell exists but doesn’t call `updateSlides()` and is guarded the wrong way.
- Server actions: `updateSlides()` writes entire slides JSON; `getProjectById()` doesn’t enforce ownership.
- Presentation serving: Renders one slide at a time with scaling and transitions (good shape).

## Low‑Risk Save Improvements

- [x] Debounced autosave (enable it): Call `updateSlides()` after a short idle window and only when editing.
  - File: `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:252`
    - Change the guard in `saveSlides()`:
      - From: `if(!isEditable && project){ ... }`
      - To: `if (isEditable && project) { ... }`
  - File: `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:263–266`
    - Inside the 2s `setTimeout`, actually call `saveSlides()`.

- [x] Skip redundant saves: Hash or stringify the slides payload and bail if unchanged.
  - Add near other refs: `const lastSaved = useRef('')`.
  - In `saveSlides()`:
    - `const payload = JSON.stringify(slides)`
    - If `payload !== lastSaved.current`, then `await updateSlides(project.id, JSON.parse(payload))` and set `lastSaved.current = payload`.

- [x] Save on critical non‑text actions: Trigger saves immediately after reorder/add/remove operations.
  - After `reorderSlides`, `addSlideAtIndex`, and `removeSlide`, call the same debounced `saveSlides()` function (reuse the timer).

- [x] Clamp payload size on the client: If `payload.length` exceeds a threshold (e.g., ~1.5–2 MB), disable localStorage persistence temporarily and rely on server saves.
  - File: `src/store/useSlideStore.tsx`
    - Option A: Set `DISABLE_PERSISTENCE = true` when large decks are detected.
    - Option B: Update `createSafeStorage().setItem` to no‑op when a size cap is exceeded, logging a warning.

## Low‑Risk Serve Improvements

- [x] Enforce ownership in server actions to centralize auth.
  - File: `src/actions/project.ts:331` (inside `updateSlides(...)`)
    - Authenticate user and confirm the project's `userId` matches before updating.
  - File: `src/actions/project.ts:304` (inside `getProjectById(...)`)
    - Add `userId: checkUser.user.id` to the `where` clause so SSR fetches are authorization‑safe.

- [ ] Keep lists lean: Continue excluding `slides` from list endpoints to reduce payload size. (Already done in paginated endpoints.)

- [ ] Keep Presentation Mode lean: It already renders a single slide at a time. Only consider prerendering next/prev offscreen if you observe jank on heavy slides.

## Optional (Still Low Blast Radius)

- [ ] Validate on save: Add a light Zod schema for `Slide` and `ContentItem` to catch malformed trees before persisting, inside `updateSlides()`.
- [ ] Autosave UX: Show a subtle “Saving…”/“Saved” indicator in the editor navbar; keep it non‑blocking.
- [ ] Final snapshot on route change: Save once on unmount using the same debounce guard to reduce lost edits.

## Concrete Edits (Surgical)

Use these precise locations as a guide. Line numbers may drift slightly.

- `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:252`
  - Flip guard to save while editing:
  - From: `if(!isEditable && project){ ... }`
  - To: `if (isEditable && project) { ... }`

- `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:263–266`
  - Inside the timer, call `saveSlides()` to actually perform the debounced save.

- `src/actions/project.ts:331` (function: `updateSlides`)
  - Authenticate user (via `onAuthenticateUser()`), fetch project, verify `project.userId === checkUser.user.id`, then update `slides`.

- `src/actions/project.ts:304` (function: `getProjectById`)
  - Modify the Prisma query:
    - From: `where: { id: projectId }`
    - To: `where: { id: projectId, userId: checkUser.user.id }`

## Notes & Rationale

- Debounced, diff‑aware saves reduce DB churn and bandwidth while keeping UX snappy.
- Client‑side persistence is helpful but brittle with large JSON; degrade gracefully to server saves.
- Centralizing auth/ownership checks in server actions avoids coupling to middleware behavior and protects SSR paths.
- Presentation Mode is already efficient; only optimize further if you measure issues.

## Suggested Order of Operations

1) Enable debounced autosave in the editor and add the no‑op change detection.
2) Add ownership checks to `updateSlides` and narrow `getProjectById` to the owner.
3) Trigger saves on reorder/add/remove.
4) Add payload size clamps to persistence.
5) Optional niceties: schema validation, “Saving…” indicator, final snapshot on unmount.

## Quick Verification Checklist

- [ ] Edits persist after 2–3 seconds of inactivity while editing.
- [ ] Reorder/add/remove actions persist reliably without manual refresh.
- [ ] Large decks don’t crash localStorage; a warning is logged and server saves still succeed.
- [ ] Non‑owners cannot fetch another user’s project in SSR or API routes.
- [ ] Presentation Mode still renders and navigates smoothly.

