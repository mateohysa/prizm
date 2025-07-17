slide aspect ratio ==
slide preview aspect ratio +
invisible scrollbars everywhere +


saved/notsaved/saving states at the top ==

---

## Investigation: Slide Aspect Ratio (2025-07-05)

- `ScaledPreview.tsx` locks the thumbnail/previews to **16∶9** using the Tailwind class `aspect-[16/9]` (plus a `ring` for styling).
- The main canvas that renders each live slide comes from `Editor.tsx → DraggableSlide`.  Its wrapper has:
  ```ts
  className={cn('w-full', 'min-h-[160px] sm:min-h-[220px] md:min-h-[300px] lg:min-h-[400px]', /* … */)}
  ```
  That means:
  1. Width fills the available column (`w-full`).
  2. Height is only a *minimum*; it can grow unlimited.  There is **no `aspect-*` class** and no `<AspectRatio>` primitive.
- `MasterRecursiveComponent` (which renders the slide's content) and its children also don't enforce any ratio.
- A repo-wide search found zero `aspect-[16/9]`, `aspect-video`, or Radix `<AspectRatio>` within the live-slide path.

**Conclusion**

The editor canvas is currently *free-form*: it expands vertically with its content.  If we want the live slides to mimic the 16∶9 previews, we need to:

1. Wrap the slide container with `className="aspect-[16/9]"` (or replace it with the Radix `<AspectRatio>` component).
2. Decide how to handle overflow: either scroll inside the frame or scale/clip overflowing content.

---