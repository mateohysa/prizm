import { OutlineCard } from "@/lib/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


type CreativeAIStore = {
    outlines: OutlineCard[]
    addMultipleOulines: (outlines: OutlineCard[]) => void
    addOutline: (outline: OutlineCard) => void
    currentAiPrompt: string
    setCurrentAiPrompt: (prompt: string) => void
    resetOutlines: () => void
}

const useCreativeAIStore = create<CreativeAIStore>()(
    persist((set)=>({
        currentAiPrompt: '',
        outlines: [],
        addMultipleOulines: (outlines: OutlineCard[]) => {
            set(() => ({ outlines }))
        },
        addOutline: (outline: OutlineCard) => {
            set((state) => ({outlines: [...state.outlines, outline]}))
        },
        setCurrentAiPrompt: (prompt: string) => {
            set(() => ({currentAiPrompt: prompt}))
        },
        resetOutlines: () => {
            set(() => ({outlines: []}))
        }
    }),{name:'creative-ai'})
)

export default useCreativeAIStore