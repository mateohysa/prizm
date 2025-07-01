# Glass Morphism Implementation Plan

## 1. Objective
Implement an eye-pleasing glass-morphism (frosted-glass) effect that automatically adapts to both **light** and **dark** themes. The effect must be applied **only by adding/modifying Tailwind CSS class names**, with **no changes to component structure, TSX hierarchy, or positional layout**.

## 2. Components Chosen for the Pilot
All three components appear simultaneously on the **Dashboard** screen, providing a single place to observe the effect side-by-side.

| # | Component | File | Role on screen |
|---|-----------|------|----------------|
| 1 | **AppSidebar** | `src/components/global/App-Sidebar/index.tsx` | Main navigation sidebar (left) |
| 2 | **UpperInfoBar** | `src/components/global/upper-info-bar/index.tsx` | Top information bar (contains search & new-project button) |
| 3 | **ProjectCard** | `src/components/global/project-card/index.tsx` | Individual card shown inside the project list |

## 3. Visual Target
1. Semi-transparent panel with subtle blur (`backdrop-blur`).
2. Very light border to increase separation from the background.
3. Slightly desaturated & contrasted background to emphasise *glass*.
4. Works in **light** (bright glass) and **dark** (smoked glass) modes.

*Reference utilities from the user examples:*
```
Example A: h-full w-full bg-gray-200 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border border-gray-100
Example B: bg-gray-500 bg-clip-padding backdrop-filter  backdrop-blur bg-opacity-30 backdrop-saturate-100 backdrop-contrast-100
```
We will combine ideas from both.

## 4. Tailwind-only Strategy
Tailwind already ships with `backdrop-*` utilities. No plugin changes are required; however we **must** ensure that the `@tailwindcss/forms` or similar plugins do not strip these classes during optimisation (they aren't).  If class purge ever fails, the fallback is to add them to `safelist` in `tailwind.config.ts`.

### 4.1. Base Utility Set
```
/* Light theme */
light-glass = "bg-white/40 backdrop-blur-md bg-clip-padding backdrop-saturate-100 backdrop-contrast-100 border border-white/30"

/* Dark theme */
dark-glass  = "bg-white/5  backdrop-blur-md bg-clip-padding backdrop-saturate-100 backdrop-contrast-100 border border-white/10"
```
Translated into Tailwind classes (using the slash opacity syntax):
```
  bg-white/40 dark:bg-white/5
  backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100
  bg-clip-padding border border-white/30 dark:border-white/10
```
Add `rounded-[radius]` where appropriate, keeping each component's original radius.

## 5. Implementation Steps per Component

### 5.1. AppSidebar
1. **Locate root container** – usually an `<aside>` or `<nav>` inside `AppSidebar`'s TSX.
2. Append the full glass utility set *after* any existing `bg-*` classes to let the new background take precedence.
3. Preserve existing paddings, layout, `flex` rules, etc.
4. Check that the sidebar already carries a dark variant (`dark:bg-…`). Remove conflicting `bg-*` classes if necessary but keep layout classes.

*Example class replacement (pseudo):*
```diff
- className="w-60 bg-background p-4 flex flex-col"
+ className="w-60 p-4 flex flex-col bg-white/40 dark:bg-white/5 bg-clip-padding backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 border border-white/30 dark:border-white/10"
```

### 5.2. UpperInfoBar
1. Identify the wrapper `<div>` that spans the full width at the top.
2. Add glass utilities just like in the sidebar, but normally with `backdrop-blur-sm` (lighter blur) to avoid over-blurring page content below.
3. Ensure the existing shadow stays (if any) to improve separation.
4. Because this bar often uses `sticky` positioning, verify that its `z-index` remains **above** page content (`z-30` currently) but still **below** modal layers.

### 5.3. ProjectCard
1. Target the outermost card container (`<article>` or `<div>`). It currently has a solid background.
2. Replace background with glass utilities, but increase opacity so inner text remains readable against underlying page.
   *Suggested*: `bg-white/60 dark:bg-white/10 backdrop-blur`.
3. Maintain current interactive states (`hover`, `focus`) – only convert the `bg-*` portion.
4. Hover: optionally intensify the blur on hover (`hover:backdrop-blur-lg`) to create a valid micro-interaction without movement.

## 6. Dark vs Light Mode Considerations
• **Color readability** – Ensure text and icon colors in each component already use Tailwind's dark variant (`dark:text-*`). If not, add them.
• **Borders** – Transparent borders may disappear in dark mode; using `border-white/10` keeps a subtle rim.
• **Box-shadow** – A small shadow (`shadow-lg/10 dark:shadow-black/20`) can improve separation, but this must be tested.

## 7. Tailwind Config Adjustments (optional safety)
If class pruning removes rarely used utilities, append the following to `tailwind.config.ts`:
```ts
module.exports = {
  // ...existing config,
  safelist: [
    // glass morphism utilities
    'backdrop-blur',
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'backdrop-saturate-100',
    'backdrop-contrast-100',
    'bg-white/5',
    'bg-white/40',
    'border-white/10',
    'border-white/30',
  ],
}
```
The build already runs on Tailwind v3+, so these utilities are natively available.

## 8. Validation & Testing Checklist
1. **Visual parity** – No component layout shifts after edits.
2. **Browser support** – Confirm `backdrop-filter` support in Chrome, Edge, Safari, Firefox 119+. Older Firefox users will simply see the semi-transparent background without blur.
3. **Accessibility** – Contrast ratio remains ≥ 4.5:1 for primary text (increase `bg-opacity` or use darker text color if needed).
4. **Performance** – Run Lighthouse; large background blurs can impact GPU-bound scrolling. Downgrade to `backdrop-blur-sm` if needed.
5. **Snapshot** – Take before/after screenshots for both themes.



## 10. Future Extensions
• Apply the same pattern to modal dialogs, dropdowns, and to the `presentation` editor panel.
• Create a reusable **GlassPanel** component that composes the utility set via `clsx` to keep class names DRY.
• Offer **user preference toggle** to disable heavy blur for low-spec devices.

---
*End of planning document* 