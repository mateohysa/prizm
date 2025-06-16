# Editor Responsiveness & Sidebar Collapse Guidance

*Updated: {{TODAY}}*

## 1  Objectives

1. Make the left **LayoutPreview** sidebar collapse (or turn into an overlay drawer) when the viewport width is **< 640 px** (Tailwind's `sm` breakpoint).
2. Allow the main editor column to reclaim the full width when the sidebar is hidden.
3. Preserve each slide thumbnail's aspect-ratio so the preview always looks proportional, no matter the column width.
4. Avoid interaction problems (drag-and-drop, focus, scroll) introduced by the new responsive behaviour.

## 2  Sidebar collapse behaviour

### 2.1  Visibility classes

*Original (fixed, always visible)*
```tsx
<div className="w-64 h-full fixed left-0 top-20 border-r overflow-y-auto">
```

*Responsive* (sidebar hidden on xs, visible from `sm` up)
```tsx
<div
  className="hidden sm:block sm:w-64 h-full fixed left-0 top-20 border-r overflow-y-auto"
>
```

### 2.2  Optional drawer overlay (mobile)
If you still need slide previews on < 640 px, implement a Drawer/Sheet component that:
* mounts as an overlay (`fixed inset-0 z-50`) when **open**,
* toggles `pointer-events-none` + `translate-x-[-100%]` when **closed**,
* is triggered by a hamburger button added to the top navbar.

Keep the same list component (`LayoutPreview`) inside the drawer so code isn't duplicated.

### 2.3  Pointer-events safety
When the sidebar is visually off-screen, also add `pointer-events-none` so the underlying DnD drop zones aren't blocked by its hidden area.

```tsx
const hidden = !isOpen && 'pointer-events-none -translate-x-full';
```

---

## 3  Editor column offset

*Original*
```tsx
<div className="flex-1 ml-64 pr-16">
```

*Responsive*
```tsx
<div className="flex-1 sm:ml-64 pr-4 sm:pr-16">
```
*Notes*
1. `sm:ml-64` restores the gap only when the sidebar is visible.
2. A smaller right-padding on mobile (`pr-4`) maximises space.

---

## 4  Slide preview aspect ratio

### 4.1  Rationale
The current card uses hard-coded `min-h` rules (`min-h-[160px] sm:min-h-[220px] …`). Below 640 px it reverts to **160 px** regardless of width, so the 16 : 9 shape is lost.

### 4.2  Solution: aspect-ratio utility
If you already have Tailwind's `@tailwindcss/aspect-ratio` plugin:
```tsx
<div
  className={cn(
    'aspect-video w-full rounded-lg shadow-lg relative',  // 16:9 automatically
    isDragging ? 'opacity-50' : 'opacity-100',
    index === currentSlide && 'ring-2 ring-blue-500 ring-offset-2',
    slide.className,
  )}
>
```
If you don't use the plugin, add a custom utility: `aspect-[16/9]`.

### 4.3  Remove min-height overrides
Delete the previous `min-h-[...]` utilities to let height be derived solely from width.

---

## 5  Interaction considerations
| Area | Impact | Mitigation |
|------|--------|------------|
| **Drag-and-drop** | Hidden sidebar may intercept events if still in DOM | Ensure `pointer-events-none` when off-canvas |
| **Scroll-into-view** | Width change can shift centring maths | Observe after collapse; adjust if needed |
| **Focus / a11y** | Drawer must trap focus when open | Use `@radix-ui/react-dialog` or similar |
| **Navbar layout** | Add hamburger icon only on xs (`sm:hidden`) | Toggle drawer state |

---

## 6  Testing checklist
1. Resize between 639 ↔ 641 px and confirm:
   * Sidebar appears/disappears.
   * Editor column expands/contracts smoothly.
2. Drag slides (re-order & drop new) on both breakpoints; verify no ghost drop zones.
3. Open drawer on mobile; try keyboard navigation to ensure focus trap.
4. Load a project with many slides (≥ 30) and scroll; performance unchanged.
5. Run Lighthouse mobile audit → **no CLS** & **tap targets** still pass.

---