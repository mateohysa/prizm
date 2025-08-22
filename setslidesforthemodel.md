# Implementation Plan: Set Slides Count for AI Model

## Overview
Add a dropdown component that allows users to select the number of slides (5, 10, 12, 15, 20) they want in their AI-generated presentation. This selection will be passed directly to the AI model to generate exactly that many slides.

## Current Implementation Analysis

### Current User Flow:
1. User enters prompt in input field
2. User clicks "Generate Outline" 
3. AI generates variable number of outlines (currently "at least 4 points")
4. User selects how many of the generated outlines to use via dropdown
5. User clicks "Generate" to create final presentation

### Current Code Structure:
- **CreativeAI.tsx** (lines 153-177): Already has Select dropdown component that shows generated outline count
- **aiModel.ts** (lines 25-42): `generateCreativePrompt` function with basic prompt that asks for "at least 4 points"
- **State Management**: `noOfCards` state tracks selected number from generated outlines

## Proposed Changes

### 1. Update CreativeAI.tsx Component

#### 1.1 Add New State Variable
```typescript
const [desiredSlideCount, setDesiredSlideCount] = useState<number>(5) // Default to 5 slides
```

#### 1.2 Modify Existing Dropdown Logic
**Current dropdown (lines 153-177):**
- Shows options based on `outlines.length` (after generation)
- Options are dynamic: 1, 2, 3... up to `outlines.length`

**New dropdown should:**
- Show predefined options: 5, 10, 12, 15, 20
- Be available BEFORE generation
- Use the same theming and styling as current dropdown
- Default to 5 slides selected

#### 1.3 Dropdown Component Changes
Replace the current Select component content:

**From:**
```typescript
{outlines.length===0? (
    <SelectItem value='0' className='font-semibold'>
        No cards
    </SelectItem>
) : (Array.from({length: outlines.length},(_,index)=>index+1) 
).map((num)=><SelectItem
    key={num}
    value={num.toString()}
    className='font-semibold'
>
    {num} {num===1 ? "card" : "cards"}
</SelectItem>)}
```

**To:**
```typescript
{[5, 10, 12, 15, 20].map((num) => (
    <SelectItem
        key={num}
        value={num.toString()}
        className='font-semibold'
    >
        {num} cards
    </SelectItem>
))}
```

#### 1.4 Update State Management
- Change dropdown value from `noOfCards.toString()` to `desiredSlideCount.toString()`
- Change onValueChange from `setNoOfCards(Number(value))` to `setDesiredSlideCount(Number(value))`
- Keep existing `noOfCards` state for tracking actual generated slides

#### 1.5 Update Generate Function
Modify `generateOutline` function (line 50) to pass `desiredSlideCount` to the AI model:
```typescript
const res = await generateCreativePrompt(currentAiPrompt, desiredSlideCount)
```

### 2. Update aiModel.ts

#### 2.1 Modify Function Signature
**Current (line 21):**
```typescript
export const generateCreativePrompt = async (userPrompt: string) => {
```

**New:**
```typescript
export const generateCreativePrompt = async (userPrompt: string, slideCount: number = 10) => {
```

#### 2.2 Update System Prompt
**Current prompt (lines 25-42):**
```typescript
const finalPrompt = `
You are a helpful AI assistant that creates outlines for presentations.
Create a coherent and relevant outline for the following prompt: ${userPrompt}.
The outline should consist of at least 4 points, with
each point written as a single sentence with 10 or less words.
Ensure the outline is well-structured and directly related to the topic.
Return the output in the following JSON format:
{
"outlines":[
    "Point 1",
    "Point 2", 
    "Point 3",
    "Point 4"
    ]
}

Ensure that the JSON is valid and properly formatted. Do not include any other text or explanations outside the JSON.`
```

**New prompt:**
```typescript
const finalPrompt = `
You are a helpful AI assistant that creates outlines for presentations.
Create a coherent and relevant outline for the following prompt: ${userPrompt}.
The outline should consist of exactly ${slideCount} points, with
each point written as a single sentence with 10 or less words.
Ensure the outline is well-structured and directly related to the topic.
Make sure you provide exactly ${slideCount} outline points, no more, no less.
Return the output in the following JSON format:
{
"outlines":[
    "Point 1",
    "Point 2", 
    "Point 3",
    ...continue until you have exactly ${slideCount} points
    ]
}

Ensure that the JSON is valid and properly formatted. Do not include any other text or explanations outside the JSON.`
```

### 3. UI/UX Flow Changes

#### 3.1 New User Flow:
1. User enters prompt in input field
2. User selects desired slide count from dropdown (5, 10, 12, 15, 20)
3. User clicks "Generate Outline"
4. AI generates exactly the requested number of outlines
5. User sees all generated outlines (no secondary selection needed)
6. User clicks "Generate" to create final presentation

#### 3.2 Visual Changes:
- Dropdown will always show the 5 predefined options
- Dropdown will be enabled from the start (not dependent on generation)
- Keep all existing styling, theming, and positioning
- No changes to colors, borders, or visual design

### 4. State Management Updates

#### 4.1 Reset Function Update
Update `resetCards` function (line 39) to include resetting desired slide count:
```typescript
const resetCards = () => {
    setEditingCard(null)
    setSelectedCard(null)
    setEditText("")
    setCurrentAiPrompt("")
    resetOutlines()
    setDesiredSlideCount(10) // Reset to default
}
```

#### 4.2 Remove Automatic Count Setting
Remove or modify the useEffect (lines 116-118) since we won't be automatically setting count based on outlines:
```typescript
// Remove this useEffect or modify to handle the new flow
useEffect(()=>{
    setNoOfCards(outlines.length)
},[outlines.length])
```

### 5. Error Handling and Validation

#### 5.1 Validation in generateOutline
Add validation to ensure desired slide count is within acceptable range:
```typescript
if (desiredSlideCount < 5 || desiredSlideCount > 20) {
    toast.error("Error!", {
        description: "Please select a valid number of slides (5-20)",
    })
    return
}
```

#### 5.2 AI Response Validation
Add validation in AI response handling to ensure we got the expected number of outlines:
```typescript
if (res.status === 200 && res?.data?.outlines) {
    if (res.data.outlines.length !== desiredSlideCount) {
        console.warn(`Expected ${desiredSlideCount} outlines, got ${res.data.outlines.length}`)
        // Could still proceed or retry based on business logic
    }
    // ... rest of existing code
}
```

## Implementation Steps

### Step 1: Update aiModel.ts
1. Modify `generateCreativePrompt` function signature
2. Update the system prompt to use the slide count parameter
3. Test the function with different slide counts

### Step 2: Update CreativeAI.tsx
1. Add `desiredSlideCount` state variable
2. Replace dropdown options with predefined values
3. Update dropdown value and onChange handlers
4. Modify `generateOutline` function call
5. Update `resetCards` function

### Step 3: Testing
1. Test with each slide count option (5, 10, 12, 15, 20)
2. Verify AI generates exact number requested
3. Test error handling and edge cases
4. Verify UI behavior and styling consistency

### Step 4: Optional Enhancements
1. Add loading states specific to slide count
2. Add tooltips explaining slide count selection
3. Consider adding custom slide count input for power users

## Expected Behavior After Implementation

1. **Default State**: Dropdown shows "10 cards" selected by default
2. **User Interaction**: User can select 5, 10, 12, 15, or 20 cards before generating
3. **AI Generation**: AI receives prompt with specific slide count instruction
4. **Result**: Generated outlines match exactly the requested count
5. **Final Generation**: All generated outlines are used (no secondary selection needed)

## Notes

- Maintain all existing styling and theming
- Keep the same component structure and positioning
- Preserve all existing error handling and success messages
- Ensure backward compatibility with existing functionality
- The change should feel natural and improve the user experience by giving more control upfront 