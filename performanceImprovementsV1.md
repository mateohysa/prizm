# Performance Improvements V1 - Recent Prompts Optimization

## Current State Analysis

### Problem Statement
The Recent Prompts feature in the Creative AI section of the create-page has performance issues:

- **Storage**: All prompts stored in localStorage via Zustand persistence
- **Loading**: All 30+ prompts load and render simultaneously on page visit
- **Memory**: Full `OutlineCard[]` arrays stored for each prompt (large data footprint)
- **Rendering**: 30+ animated `motion.div` components render at once
- **Scalability**: localStorage has 5-10MB browser limits

### Current Implementation
```typescript
// Current Prompt structure in usePromptStore.tsx
type Prompt = {
    id: string
    createdAt: string
    title: string
    outlines: OutlineCard[] | []  // Large data stored
}

// Current storage
const usePromptStore = create<PromptStore>()(
    devtools(persist(
        // ... store logic
    ), {name: "prompts"}))  // All in localStorage
)
```

---

## Step 1: Hybrid Storage Implementation

### Strategy Overview
Implement a **hybrid localStorage + database** approach for recent prompts storage and pagination:

1. **First 5 prompts** → localStorage (instant access)
2. **Prompts 6+** → Database (persistent, paginated)
3. **Display**: 5 recent from localStorage + paginated database results
4. **Transition**: When prompt #6 is created, move localStorage prompt #5 to database

### Benefits
- ✅ **Performance**: Recent prompts load instantly
- ✅ **Scalability**: Unlimited older prompts via database
- ✅ **Familiar Pattern**: Matches sidebar's `take: 5` approach
- ✅ **Gradual Migration**: No breaking changes to existing functionality

---

## Database Schema Changes

### New Prompt Model
Add to `prisma/schema.prisma`:

```prisma
model Prompt {
  id        String   @id @default(cuid())
  userId    String   @db.Uuid
  title     String
  outlines  Json     // OutlineCard[] stored as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  User User @relation(fields: [userId], references: [id])

  @@map("prompts")
}
```

### User Model Update
Add relation to existing User model:
```prisma
model User {
  // ... existing fields
  Prompts Prompt[] // Add this relation
}
```

### Migration Command
```bash
npx prisma migrate dev --name add-prompt-model
```

**Note**: This only adds a new table - existing data (Users, Projects) remains untouched.

---

## Implementation Plan

### 1. Database Layer (`src/actions/prompt.ts`)

Create new server actions:

```typescript
// Get paginated prompts from database (excluding localStorage ones)
export const getPagedPrompts = async (page: number = 1, limit: number = 5)

// Save prompt to database
export const savePromptToDB = async (prompt: Prompt)

// Move prompt from localStorage to database
export const migratePromptToDB = async (prompt: Prompt)
```

### 2. Store Updates (`src/store/usePromptStore.tsx`)

**Current Store Modifications:**
- Maintain current localStorage structure for first 5 prompts
- Add database pagination state
- Add transition logic for 6th prompt

**New Store Properties:**
```typescript
type PromptStore = {
  // Existing
  prompts: Prompt[] | []  // localStorage prompts (max 5)
  
  // New
  dbPrompts: Prompt[] | []  // Database prompts
  dbPage: number
  dbHasMore: boolean
  dbLoading: boolean
  
  // New methods
  loadMoreFromDB: () => Promise<void>
  addPromptWithTransition: (prompt: Prompt) => void
}
```

### 3. Component Updates (`src/app/(protected)/(pages)/(dashboardPages)/create-page/_components/GenAi/RecentPrompts.tsx`)

**Display Logic:**
1. Always show localStorage prompts first (max 5)
2. Show "Load More" button if database has additional prompts
3. Append database prompts below localStorage ones

**Rendering:**
```typescript
// Render localStorage prompts (always first)
{prompts.map((prompt, index) => (
  // Existing prompt rendering
))}

// Render database prompts
{dbPrompts.map((prompt, index) => (
  // Same prompt rendering
))}

// Load More button
{dbHasMore && (
  <Button onClick={loadMoreFromDB} disabled={dbLoading}>
    {dbLoading ? "Loading..." : "Load More"}
  </Button>
)}
```

### 4. Transition Logic

**When 6th prompt is created:**

```typescript
const addPromptWithTransition = (newPrompt: Prompt) => {
  if (prompts.length >= 5) {
    // Move oldest localStorage prompt to database
    const oldestPrompt = prompts[0]
    migratePromptToDB(oldestPrompt)
    
    // Remove oldest from localStorage, add new one
    set(state => ({
      prompts: [...state.prompts.slice(1), newPrompt]
    }))
  } else {
    // Normal add to localStorage
    set(state => ({
      prompts: [...state.prompts, newPrompt]
    }))
  }
}
```

---

## File Changes Summary

### New Files
- `src/actions/prompt.ts` - Database operations
- `performanceImprovementsV1.md` - This documentation

### Modified Files
- `prisma/schema.prisma` - Add Prompt model
- `src/store/usePromptStore.tsx` - Add database pagination state
- `src/app/(protected)/(pages)/(dashboardPages)/create-page/_components/GenAi/RecentPrompts.tsx` - Add pagination UI
- `src/app/(protected)/(pages)/(dashboardPages)/create-page/_components/GenAi/CreativeAI.tsx` - Update prompt creation logic

---

## Expected Outcomes

### Performance Improvements
- **Initial Load**: 5 prompts load instantly from localStorage
- **Reduced Rendering**: Maximum 5-10 animated components instead of 30+
- **Memory Usage**: Significant reduction in localStorage footprint
- **Scalability**: Unlimited prompt history via database

### User Experience
- **Immediate Display**: Recent prompts appear instantly
- **Progressive Loading**: Older prompts available via "Load More"
- **Familiar Pattern**: Consistent with sidebar recent projects behavior
- **No Data Loss**: All existing prompts preserved during migration

### Technical Benefits
- **Gradual Migration**: No breaking changes
- **Database Relationships**: Proper user-prompt relationships
- **Query Optimization**: Efficient pagination with `take` and `skip`
- **Future-Proof**: Foundation for advanced features (search, filtering, etc.)

---

## Next Steps (Future Phases)

- **Step 2**: Implement summarization instead of storing full `outlines` arrays
- **Step 3**: Add vector search for semantic prompt discovery
- **Step 4**: Implement real-time updates and conflict resolution
- **Step 5**: Add advanced filtering and search capabilities

---

**Implementation Date**: TBD  
**Estimated Effort**: 4-6 hours  
**Risk Level**: Low (additive changes only) 