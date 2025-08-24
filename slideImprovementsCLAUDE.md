# Slide Layout Issues Investigation
**Date:** January 2025  
**Scope:** Analysis of `accentLeft` and `twoColumnsWithHeadings` slide layout problems  
**Status:** Investigation Complete - No Changes Made

## Executive Summary

This investigation identifies critical layout issues affecting two primary slide types in the Prizm presentation system:

1. **`accentLeft`**: Text content is incorrectly centered due to CSS flexbox alignment
2. **`twoColumnsWithHeadings`**: Appears as 3 columns instead of 2 due to problematic AI-generated nested `resizable-column` structures

Both issues stem from mismatches between the intended layout design and the actual implementation/generation patterns.

---

## Architecture Overview

### Slide Rendering System
- **Core Component**: `MasterRecursiveComponent` recursively renders slide content tree
- **Layout Types**: Defined in `src/lib/slideLayouts.ts` with corresponding components
- **Content Types**: Including `column`, `resizable-column`, `heading1`, `paragraph`, etc.
- **AI Generation**: `src/actions/aiModel.ts` uses Gemini API to generate slide structures

### Key Rendering Logic
```typescript
// MasterRecursiveComponent.tsx
case 'resizable-column':
  return <ColumnComponent content={content.content as ContentItem[]} />

case 'column':
  if (hasAtLeastTwoChildren && onlyBlockChildren) {
    // Renders as horizontal split using ColumnComponent
    return <ColumnComponent content={children} />
  }
  // Renders as vertical stack
  return <div className='flex flex-col'>{children}</div>
```

---

## Issue #1: AccentLeft Layout Problems

### Expected vs Actual Structure

**Expected Structure** (from `slideLayouts.ts`):
```typescript
{
  type: "accentLeft",
  content: {
    type: "column",
    content: [
      {
        type: "resizable-column", // Horizontal split: image | text
        content: [
          { type: "image", content: "image-url" },
          {
            type: "column",
            content: [
              { type: "heading1", content: "", placeholder: "Heading1" },
              { type: "paragraph", content: "", placeholder: "start typing here" }
            ],
            className: "w-full h-full p-8 flex justify-center items-center" // PROBLEM!
          }
        ]
      }
    ]
  }
}
```

### Root Cause Analysis

**Problem 1: Text Centering**
- **Location**: `src/lib/slideLayouts.ts:142` and `src/actions/aiModel.ts:142`
- **Issue**: Text column has `className: "w-full h-full p-8 flex justify-center items-center"`
- **Effect**: Combined with `column` renderer's `flex flex-col`, results in:
  ```css
  .flex.flex-col.w-full.h-full.p-8.flex.justify-center.items-center
  ```
- **Visual Impact**: Heading and paragraph appear centered vertically and horizontally instead of natural left-aligned flow

**Problem 2: Image CSS Class Issues**
- **Location**: `src/components/global/editor/ImageComponent.tsx:39`
- **Issue**: Template string concatenation without null check:
  ```typescript
  className={`object-cover w-full h-full rounded-lg ${className}`}
  ```
- **Effect**: When `className` is undefined, produces `"... rounded-lg undefined"`
- **Evidence**: User's DOM inspection shows trailing `undefined` in class list

### DOM Evidence Analysis
From user's inspection data:
```html
<div class="flex-col w-full h-full p-8 flex justify-center items-center">
  <textarea class="w-full bg-transparent text-5xl font-normal">Cats: Domestication and Evolution</textarea>
  <textarea class="w-full bg-transparent font-normal text-lg">An overview of...</textarea>
</div>
```

This confirms the centering classes are being applied to the text container.

---

## Issue #2: TwoColumnsWithHeadings "3-Column" Problem

### Expected vs Actual Structure

**Expected Structure** (from `slideLayouts.ts:292-360`):
```typescript
{
  type: "twoColumnsWithHeadings",
  content: {
    type: "column",
    content: [
      { type: "title" },
      {
        type: "resizable-column", // Two equal columns
        content: [
          {
            type: "column", // Left: heading + content
            content: [
              { type: "heading3", placeholder: "Heading 3" },
              { type: "paragraph", placeholder: "Start typing..." }
            ]
          },
          {
            type: "column", // Right: heading + content  
            content: [
              { type: "heading3", placeholder: "Heading 3" },
              { type: "paragraph", placeholder: "Start typing..." }
            ]
          }
        ]
      }
    ]
  }
}
```

**Actual AI-Generated Structure** (from AI examples in `aiModel.ts:387-436`):
```typescript
{
  type: "twoColumnsWithHeadings",
  content: {
    type: "resizable-column", // WRONG: This creates nested panels
    content: [
      {
        type: "resizable-column", // NESTED: Creates inner split on left side
        content: [
          { type: "heading3", content: "Different Breeds" }, // Left panel: just heading
          { type: "bulletList", content: ["Siamese", "Persian", ...] } // Middle panel: just list
        ]
      },
      {
        type: "column", // Right panel: heading + list
        content: [
          { type: "heading3", content: "Unique Traits" },
          { type: "bulletList", content: ["Coat Length", ...] }
        ]
      }
    ]
  }
}
```

### Root Cause Analysis

**Problem: AI Generates Nested `resizable-column` Structures**
- **Location**: AI prompt examples in `src/actions/aiModel.ts:387-436`
- **Issue**: The AI model receives inconsistent examples where some layouts use nested `resizable-column` types
- **Effect**: Creates unwanted three-panel layout:
  1. **Left Panel**: Just the heading "Different Breeds" 
  2. **Middle Panel**: Just the bullet list (no heading)
  3. **Right Panel**: Both heading "Unique Traits" and bullet list

### DOM Evidence Analysis
From user's inspection, the actual DOM structure shows:
```html
<div data-panel-group-id="«ra»"> <!-- Outer horizontal split -->
  <div data-panel-id="«rq»"> <!-- Left half -->
    <div data-panel-group-id="«rr»"> <!-- Inner horizontal split -->
      <div data-panel-id="«r13»"> <!-- "Different Breeds" heading only -->
      <div data-panel-id="«r15»"> <!-- Bullet list only -->
    </div>
  </div>
  <div data-panel-id="«rt»"> <!-- Right half: "Unique Traits" + list -->
</div>
```

This confirms the nested resizable structure creating 3 visual columns.

---

## Issue #3: Aspect Ratio Mismatches

### Current State Analysis

**Editor Canvas** (free-form):
- **Location**: `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx:137-151`
- **Classes**: `w-full rounded-lg shadow-lg relative` with responsive min-heights
- **Behavior**: No aspect ratio constraints; slides grow vertically with content
- **Evidence**: User's markdown notes confirm slides are "not constrained to 16:9"

**Preview Thumbnails** (fixed 16:9):
- **Location**: `src/app/(protected)/presentation/[presentationId]/_components/editor-sidebar/LeftSidebar/ScaledPreview.tsx:21`
- **Classes**: `aspect-[16/9]` with `scale-[0.5]` scaling
- **Behavior**: Always maintains 16:9 ratio regardless of actual slide content

**Presentation Mode** (fixed 16:9):
- **Location**: `src/app/(protected)/presentation/[presentationId]/_components/Navbar/PresentationMode.tsx:48-52`
- **Inline Styles**: `aspectRatio: '16/9'`, `maxHeight: '100vh'`, `maxWidth: '177.78vh'`

### Impact
- **Visual Inconsistency**: Editor slides can be tall/narrow while previews show 16:9
- **User Experience**: What users see in editor may not match presentation mode
- **Layout Planning**: Difficult to design slides when preview doesn't match editor

---

## Issue Summary & Priorities

### Critical Issues (Immediate Impact)

1. **TwoColumnsWithHeadings Structural Problem**
   - **Severity**: High - Breaks intended layout completely
   - **Root Cause**: AI generates nested `resizable-column` instead of simple `column` children
   - **Fix Location**: `src/actions/aiModel.ts` - Update AI prompt examples

2. **AccentLeft Text Centering**
   - **Severity**: Medium - Layout works but visually incorrect
   - **Root Cause**: `justify-center items-center` classes in text column
   - **Fix Location**: `src/lib/slideLayouts.ts:142` and `src/actions/aiModel.ts:142`

### Cosmetic Issues (Low Impact)

3. **Image Component CSS Undefined**
   - **Severity**: Low - No visual impact, code quality issue
   - **Root Cause**: Template string concatenation without null guard
   - **Fix Location**: `src/components/global/editor/ImageComponent.tsx:39`

4. **Aspect Ratio Inconsistency**
   - **Severity**: Medium - UX confusion but system works
   - **Root Cause**: Editor canvas has no aspect constraints while previews are 16:9
   - **Fix Location**: Editor component or preview scaling logic

---

## Recommendations

### Immediate Fixes Needed

1. **Fix TwoColumnsWithHeadings AI Generation**
   - Update AI prompt examples to use `column` children instead of nested `resizable-column`
   - Ensure AI model receives consistent structure examples

2. **Fix AccentLeft Text Alignment**
   - Remove `justify-center items-center` from text column className
   - Replace with appropriate alignment classes (e.g., `justify-start items-start`)

3. **Fix Image Component CSS**
   - Add null check for className parameter
   - Use conditional concatenation or default empty string

### Future Improvements

4. **Aspect Ratio Standardization**
   - Decide on consistent aspect ratio strategy across editor/preview/presentation modes
   - Consider implementing aspect ratio constraints on editor canvas if 16:9 is desired
   - Or update preview thumbnails to reflect actual slide dimensions

5. **AI Generation Validation**
   - Add post-processing validation to ensure generated structures match expected patterns
   - Implement safeguards against unwanted nested `resizable-column` structures

---

## Files Requiring Changes

### Immediate Priority
- `src/actions/aiModel.ts` - Lines 387-436 (AI prompt examples)
- `src/lib/slideLayouts.ts` - Line 142 (AccentLeft text column className)
- `src/components/global/editor/ImageComponent.tsx` - Line 39 (CSS concatenation)

### Future Consideration
- `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx` - Aspect ratio constraints
- `src/app/(protected)/presentation/[presentationId]/_components/editor-sidebar/LeftSidebar/ScaledPreview.tsx` - Preview scaling

---

## Technical Notes

### MasterRecursiveComponent Logic
The component's heuristic for rendering `column` types affects layout behavior:
- **Horizontal Split**: When column has ≥2 children that are all block-like (`image`, `column`, `resizable-column`)
- **Vertical Stack**: Otherwise uses `flex flex-col`

This heuristic is working correctly but is sensitive to the content structure generated by AI.

### ResizablePanelGroup Behavior
- Uses `react-resizable-panels` library
- Creates horizontal splits with draggable handles
- `minSize={20}` prevents panels from collapsing completely
- Handles are only shown when `isEditable={true}`

### AI Model Constraints
- Model is restricted to 6 layout types: `accentLeft`, `accentRight`, `imageAndText`, `textAndImage`, `twoColumns`, `twoColumnsWithHeadings`
- Content types allow both `column` and `resizable-column`, creating flexibility that enables problematic nesting
- Model uses provided examples but may generate variations that break intended structure

---

**Investigation completed. Ready for implementation phase.** 