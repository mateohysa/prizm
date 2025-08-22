import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { OutlineCard } from "@/lib/types";
import { getPagedPrompts, migratePromptToDB, Prompt as ServerPrompt } from "@/actions/prompt";

type page = "create" | "creative-ai" | "create-scratch"
 
type Prompt = {
    id: string
    createdAt: string
    title: string
    outlines: OutlineCard[] | []
}

type PromptStore = {
    page: page
    setPage: (page: page) => void
    
    // LocalStorage prompts (max 5)
    prompts: Prompt[] | []
    addPrompt: (prompt: Prompt) => void
    removePrompt: (id: string) => void
    
    // Database prompts (paginated)
    dbPrompts: Prompt[] | []
    dbPage: number
    dbHasMore: boolean
    dbLoading: boolean
    
    // New hybrid methods
    loadMoreFromDB: () => Promise<void>
    addPromptWithTransition: (prompt: Prompt) => void
    initializeDBPrompts: () => Promise<void>
}
const usePromptStore = create<PromptStore>()(
    devtools(persist(
        (set, get) => ({
            page: "create", 
            setPage: (page: page) => {set({page})},
            
            // LocalStorage prompts (max 5)
            prompts: [],
            addPrompt: (prompt: Prompt) => {
                set((state) => ({prompts: [...state.prompts, prompt]}))
            },
            removePrompt: (id: string) => {
                set((state) => ({
                    prompts: state.prompts.filter((prompt: Prompt) => prompt.id !== id)
                }))
            },
            
            // Database prompts state
            dbPrompts: [],
            dbPage: 1,
            dbHasMore: true,
            dbLoading: false,
            
            // Initialize database prompts on first load
            initializeDBPrompts: async () => {
                const { dbLoading, dbPage } = get()
                if (dbLoading) return
                
                set({ dbLoading: true })
                
                try {
                    const result = await getPagedPrompts(1, 5)
                    if (result.status === 200 && result.data) {
                        set({
                            dbPrompts: result.data.prompts,
                            dbHasMore: result.data.hasMore,
                            dbPage: 1,
                            dbLoading: false
                        })
                    } else {
                        set({ dbLoading: false, dbHasMore: false })
                    }
                } catch (error) {
                    console.error("Error initializing DB prompts:", error)
                    set({ dbLoading: false, dbHasMore: false })
                }
            },
            
            // Load more prompts from database
            loadMoreFromDB: async () => {
                const { dbLoading, dbPage, dbHasMore } = get()
                if (dbLoading || !dbHasMore) return
                
                set({ dbLoading: true })
                
                try {
                    const nextPage = dbPage + 1
                    const result = await getPagedPrompts(nextPage, 5)
                    
                    if (result.status === 200 && result.data) {
                        set((state) => ({
                            dbPrompts: [...state.dbPrompts, ...result.data!.prompts],
                            dbHasMore: result.data!.hasMore,
                            dbPage: nextPage,
                            dbLoading: false
                        }))
                    } else {
                        set({ dbLoading: false, dbHasMore: false })
                    }
                } catch (error) {
                    console.error("Error loading more prompts:", error)
                    set({ dbLoading: false })
                }
            },
            
            // Add prompt with transition logic (localStorage -> Database)
            addPromptWithTransition: async (newPrompt: Prompt) => {
                const { prompts } = get()
                
                if (prompts.length >= 5) {
                    // Move oldest localStorage prompt to database
                    const oldestPrompt = prompts[0]
                    
                    try {
                        // Migrate oldest prompt to database
                        await migratePromptToDB(oldestPrompt)
                        
                        // Remove oldest from localStorage, add new one
                        set((state) => ({
                            prompts: [...state.prompts.slice(1), newPrompt]
                        }))
                    } catch (error) {
                        console.error("Error migrating prompt to DB:", error)
                        // Fallback: still add new prompt but keep all in localStorage
                        set((state) => ({
                            prompts: [...state.prompts, newPrompt]
                        }))
                    }
                } else {
                    // Normal add to localStorage (under 5 prompts)
                    set((state) => ({
                        prompts: [...state.prompts, newPrompt]
                    }))
                }
            }
        }), 
    {
        name: "prompts",
        // Only persist localStorage-related state
        partialize: (state) => ({
            page: state.page,
            prompts: state.prompts
        })
    }))
)

export default usePromptStore
