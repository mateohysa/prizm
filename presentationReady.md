**Presentation Ready: Layout Audit & Plan**
- Owner: Codex investigation pass 1
- Scope: Editor vs Presentation parity for all slide layouts

**Why Things Look Different**
- **Different wrappers**: Editor renders slides inside a styled card with padding and shadow (`src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:140`). Presentation renders inside a full-screen 16:9 canvas with a separate content box and transforms.
- **Forced scaling + overrides**: Presentation adds a global content scale and overrides typography and width (`fontSize: '1.8em'`, `maxWidth: '900px'`) at `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:291`. Editor uses the Tailwind sizes from components without such overrides.
- **Resizable group visual differences**: Layouts use `resizable` groups with `className: 'border'`. In presentation we disable that border (`!isEditable && '!border-0'`), so outlines and gutters disappear (expected) but it also removes implied spacing.
- **Aspect & fit**: Presentation computes scale from the rendered content’s scroll size to fit a 16:9 container; the editor does not enforce a 16:9 frame. Content-dependent sizing leads to composition shifts when scaled.

**Layouts Inventory (className from definitions)**
- `blank-card`: `p-8 mx-auto flex justify-center items-center min-h-[200px]` (src/lib/slideLayouts.ts:4)
- `accentLeft`: `min-h-[300px]` (src/lib/slideLayouts.ts:24)
- `accentRight`: `min-h-[300px]` (src/lib/slideLayouts.ts:77)
- `imageAndText`: `min-h-[200px] p-8 mx-auto flex justify-center items-center` (src/lib/slideLayouts.ts:130)
- `textAndImage`: `min-h-[200px] p-8 mx-auto flex justify-center items-center` (src/lib/slideLayouts.ts:190)
- `twoColumns`: `p-4 mx-auto flex justify-center items-center` (src/lib/slideLayouts.ts:250)
- `twoColumnsWithHeadings`: `p-4 mx-auto flex justify-center items-center` (src/lib/slideLayouts.ts:292)
- Note: Each layout often nests a `resizable-column` group with `className: 'border'`, and inner `column` nodes using `w-full h-full p-8 flex justify-center items-center`. Images use `object-cover` with rounded corners via `ImageComponent`.

**Editor Rendering (reference)**
- Slide wrapper adds card-like chrome and applies theme colors and gradient: `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:140`.
- Content is not constrained to 16:9; it expands naturally with textareas auto-grow.
- `ResizablePanelGroup` shows handles and borders, which also create a visual gutter: `src/components/global/editor/ColumnComponent.tsx:23` and `src/components/ui/resizable.tsx:1`.

**Presentation Rendering (reference)**
- Full-screen 16:9 stage with animated slide container and controls overlay.
- The slide content box applies layout `className` plus presentation-only overrides for type size and width (`fontSize: '1.8em'`, `maxWidth: '900px'`): `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:291`.
- Scale is computed by comparing container vs content scroll dimensions (same file lines 27–60), leaving 10–15% margins for controls.

**Observed From Your Screenshots**
- Slide 1 (Text + Image, image on right):
  - Title wraps earlier and sits higher in presentation. Likely due to the global `fontSize: '1.8em'` and the `maxWidth: '900px'` constraint causing earlier line breaks and tighter block width.
  - The image appears dominant and shifts balance vs editor; without the resizable border and with changed scale, the left content area feels narrower.
  - Spacing between the text block and image looks tighter in presentation (no visible gutter from resizable group).
- Slide 2 (Two columns):
  - Heading is oversized relative to body columns in presentation (global 1.8× type scale). In the editor, the native `Title`/`Heading` Tailwind sizes read more balanced.
  - Columns read a bit cramped in presentation (border/gutter removed, same `maxWidth` cap).

**New Case Study: “Major Wine Regions” (Good Baseline)**
- What works well in presentation:
  - Title scale is impactful but still readable at distance; line breaks roughly 2–3 lines with good rhythm.
  - Left text column maintains comfortable line length; paragraph leading is airy and easy to scan.
  - Right-side image fills the column vertically with rounded corners and looks crisp (thanks to `object-cover`).
  - The visual gap between text and image is adequate, and top edges feel aligned.
- Why this slide fares better than others:
  - Effective column proportion is close to 45/55 or 50/50, which keeps text width in the 55–70ch range.
  - The image’s aspect and `object-cover` behavior naturally fill the available height without warping.
  - Safe-area padding around the whole composition keeps elements off the extreme edges.
- Transferable rules from this “good” example:
  - For text+image layouts, aim for a 45/55 split (image slightly larger) or 50/50 when content is longer.
  - Guarantee a persistent inter-column gap in presentation (`gap-6`–`gap-8`) even when resizable borders/handles are hidden.
  - Constrain text columns indirectly via a frame (SlideFrame) rather than hard-coding `maxWidth: 900px`; rely on Tailwind sizes and scale the frame.
  - Keep image `rounded-xl` (or `rounded-lg` at minimum) and consider a very soft shadow in presentation for depth, while avoiding heavy borders.

**Initial Root Causes**
- Global overrides in presentation (`fontSize: 1.8em`, `maxWidth: 900px`) change both typographic scale and column width, diverging from editor composition.
- Scale-to-fit based on content’s scroll size produces variable “design space” per slide; the editor uses natural flow. This unpredictability alters image/text proportions.
- Removing `resizable` borders and handles in presentation also removes a subtle gutter, reducing separation between columns.

**Quick Wins (Low-Risk)**
- Remove the global presentation overrides and rely on the layout’s Tailwind sizes:
  - Drop `fontSize: '1.8em'` and `maxWidth: '900px'` at `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:291`.
  - Keep theme color and font-family.
- Add a non-interactive gutter in presentation when resizable handles are hidden:
  - In `ColumnComponent`, when `!isEditable`, append `gap-6` (or `gap-8`) to the `ResizablePanelGroup` class while keeping `!border-0`.
- Ensure textareas don’t “feel editable” in presentation:
  - For headings and paragraphs, when `isEditable=false`, add `pointer-events-none select-none` via wrapper class, or expose a `readOnlyPresentation` flag to apply those utilities.

**Refinements Inspired by the Good Case**
- Column proportions: For `imageAndText`/`textAndImage`, prefer default sizes of 45/55 (image larger) instead of 50/50 to mimic the balanced composition from the screenshots.
  - Implementation path: allow `resizable-column` content to carry an optional `defaultSizes` array, and have `ColumnComponent` honor it. Fallback remains 50/50 when unspecified.
- Persistent column gap: In `ColumnComponent`, when `!isEditable`, add `gap-8` to the `ResizablePanelGroup` wrapper so the presentation keeps a consistent gutter with handles hidden.
- Image polish: In presentation, bump rounding to `rounded-xl` and optionally add `shadow-md shadow-black/10` on large images only.
- Safe area: Add a uniform inner padding (5–7% of width/height) inside the SlideFrame. This yields consistent breathing room while allowing layouts to keep their own paddings.

**Structural Fix (Parity-Oriented)**
- Introduce a shared slide frame (design resolution) used by both editor preview and presentation:
  - Choose a base of `1600×900` with `aspect-[16/9]`.
  - Render the slide content into a fixed-size inner frame and scale that frame to fit the stage, rather than scaling based on unknown scroll size.
  - This mirrors the `ScaledPreview` approach (`src/app/(protected)/presentation/[presentationId]/_components/editor-sidebar/LeftSidebar/ScaledPreview.tsx:1`) and enforces identical composition.

**Validation Plan Using the Good Case**
- After Phase 1 (remove overrides, add gap), re-check the “Major Wine Regions” slide:
  - Expect similar line breaks if SlideFrame is adopted; without SlideFrame, type may downscale slightly but spacing should improve and text-image balance should remain strong.
  - Measure text column width in ch; target 58–68ch for paragraphs.
- After Phase 2 (SlideFrame), both editor and presentation should match near-perfectly for this slide.

**Problem Case: “Wine’s Long History” (Zoomed-out in Presentation)**
- Observation (from screenshot):
  - In the editor, the layout reads balanced: large H1 on the left, paragraph beneath, image right with comfortable separation.
  - In presentation, the left block appears visually smaller and pushed lower, while the right image looks dominant; overall composition feels “zoomed out”.
- Likely contributors:
  - The current scale algorithm fits to actual rendered content size. If any child reports a larger natural height/width (e.g., ResizablePanelGroup/Panel computing height/width differently without a fixed frame), the computed `scale` shrinks the whole slide.
  - Removal of the global 1.8× font multiplier exposes native Tailwind sizes; on some slides (esp. with taller images) the text can feel under-scaled versus the image.
  - `ResizablePanelGroup` uses `w-full h-full`; without a deterministic parent frame, intrinsic sizing may cause inconsistent natural sizes between editor and presentation.
- Working hypotheses to verify when we implement SlideFrame:
  - With a fixed 16:9 frame (e.g., 1600×900) and scaling the frame (not the content’s scroll size), this slide should regain proportion and no longer look shrunken.
  - Column gaps added for non-editable mode should maintain separation; remaining imbalance likely due to text size relative to large portrait images.
- Potential follow-ups (do not apply yet):
  - Theme-tunable heading scale multiplier in presentation only, applied at the SlideFrame level so it doesn’t affect fit calculation.
  - Optional `defaultSizes` for the two-column resizable group (e.g., 40/60 text–image) to avoid cases where the image visually overwhelms smaller headings.

**Why Zoom Changes When Flicking Slides (No code changes yet)**
- Root cause class: timing, not conflicting CSS.
- Likely sources of nondeterminism:
  - Web fonts load after first measurement → text metrics change → content height grows/shrinks but we don’t recompute scale until the next slide navigation. Returning to the slide later yields a different (now correct) scale.
  - Images decode/load after first measurement → `scrollHeight` increases → initial scale is too large (zoom-in) or too small (zoom-out) until you revisit.
  - Resizable panels finalize layout after mount → slight dimension changes are not observed by the current algorithm.
  - Measurement window is fixed (100ms), while animations and asset loads can exceed that.
- Evidence in code:
  - Scale is computed from `scrollWidth/scrollHeight` vs `clientWidth/clientHeight` with a 100ms timeout and only on slide index changes and window resize: `PresentationMode.tsx`.
  - We are not observing font readiness (`document.fonts.ready`), image load/decoding, or content size changes (no `ResizeObserver`).
- Remediation to stabilize (to implement after you finish examples):
  - Introduce a `ResizeObserver` on `slideContentRef` and recompute scale whenever the content box size changes.
  - Wait for fonts on initial mount/slide change: `await document.fonts.ready` before first measurement.
  - For images, hook into `load`/`decode()` and trigger a recalculation, or rely on the `ResizeObserver` to detect the size change.
  - Replace the content-based measurement with SlideFrame scaling (fixed 16:9 design size) so late asset loads only affect internal layout, not the frame scale.

**Status Update (Implemented)**
- SlideFrame scaling with ResizeObserver and font readiness wait is implemented in PresentationMode.
- Non-editable column gap is active.
- Presentation-only typography multiplier is applied via CSS variable `--presentation-scale` (default 1.2) and consumed by Headings/Paragraph.

**Diagnostics To Run (non-invasive)**
- Log the measured values per slide (contentWidth/Height, containerWidth/Height, final scale) in `PresentationMode.tsx` to confirm deltas before/after assets load.
- Temporarily add an `onload` listener to images (via `ImageComponent`) to console.log when they finish loading; verify scale changes on revisit.

**Proposed Implementation Plan**
- Phase 1: Remove presentation-only overrides and add column gaps
  - PresentationMode: remove font and width overrides; keep transform scaling only.
  - ColumnComponent: when `!isEditable`, add `gap-6` (or `gap-8`) to preserve separation; keep `!border-0`.
- Phase 2: Standard slide frame across editor + presentation
  - Add a `SlideFrame` wrapper (1600×900, `aspect-[16/9]`, `box-border`) and render `MasterRecursiveComponent` inside it in both editor and presentation.
  - Compute scale from container→frame (not content→container). This stabilizes proportions and line breaks.
- Phase 3: Typography and spacing tuning per layout
  - Validate each layout’s padding (`p-4`/`p-8`) reads well on the frame; bump to `p-10 md:p-14` where text feels tight.
  - Confirm default `ResizablePanel` sizes (50/50) for two-column variants and add `gap-*` for all non-editable modes.

**Per-Layout Checks (start here; we’ll tick these off)**
- `textAndImage` (Slide 1):
  - Remove presentation overrides; add `gap-8` between columns; confirm image column maintains comfortable height within frame; verify H1 wrap near 55–65ch line length.
- `twoColumns` (Slide 2):
  - Verify 50/50 default split; add `gap-8`; ensure heading scale uses Tailwind sizes without extra multiplier; confirm both columns keep 65–75 characters per line.
- `imageAndText`:
  - Same as `textAndImage` but mirrored; ensure image padding (`p-3`) + `rounded-lg` look intentional at scale; consider `shadow-md` for more depth in presentation.
- `accentLeft` / `accentRight`:
  - Validate vertical centering and safe-area padding; confirm text block width is not overly wide; consider capping text block at `max-w-prose` inside its column.
- `blank-card`:
  - Ensure the default title looks balanced; keep generous safe-area padding.

**Next Actions (suggested order)**
- Remove the two presentation overrides and add a `gap-*` for non-editable column groups. ✅ Implemented
- Re-test the two provided slides in presentation; capture before/after screenshots.
- If gaps remain, implement the shared `SlideFrame` and scale-to-frame logic for deterministic composition.

**Open Questions / Inputs Needed**
- Do we want a global “safe area” (e.g., 5–7% padding inside the frame) regardless of layout padding?
- Should presentation add subtle shadows around large images for depth, or keep flat/minimal?
- Confirm desired heading scale across themes; default Tailwind sizes look good once the 1.8× override is removed.

**Appendix: Key File References**
- Editor wrapper: `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:140`
- Presentation overrides: `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:291`
- Scale computation: `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:27`
- Column group: `src/components/global/editor/ColumnComponent.tsx:23`
- Resizable primitives: `src/components/ui/resizable.tsx:1`
- Layout definitions: `src/lib/slideLayouts.ts:130` (imageAndText), `src/lib/slideLayouts.ts:190` (textAndImage), `src/lib/slideLayouts.ts:250` (twoColumns), `src/lib/slideLayouts.ts:292` (twoColumnsWithHeadings)
