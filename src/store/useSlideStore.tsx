import { Project } from '@/generated/prisma';
import { Slide, Theme } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SlideState {
    slides: Slide[];
    project: Project | null;
    setSlides: (slides: Slide[]) => void;
    setProject: (project: Project) => void;
    currentTheme : Theme
    setCurrentTheme: (theme: Theme) => void
    getOrderedSlides: () => Slide[]
    reorderSlides: (fromIndex: number, toIndex: number) => void
}


const defaultTheme: Theme = { 
    name: 'Default',
    fontFamily: "'Inter', sans-serif",
    fontColor: '#333333', 
    backgroundColor: '#f0f0f0', 
    slideBackgroundColor: '#ffffff',
    accentColor: '#3b82f6',
    type: 'light',
    }

export const useSlideStore = create(
    persist<SlideState>(
        (set, get) => ({
            project: null,
            slides: [],
            setSlides: (slides: Slide[]) => set({slides}),
            setProject: (project) => set({project}),
            currentTheme: defaultTheme, 
            setCurrentTheme: (theme: Theme) => set({currentTheme: theme}),
            getOrderedSlides: () => {
                const state = get()
                return [...state.slides].sort((a, b) => a.slideOrder - b.slideOrder)
            },
            reorderSlides: (fromIndex: number, toIndex: number) => {
                set((state) => {
                    const newSlides = [...state.slides]
                    const [removed] = newSlides.splice(fromIndex, 1)
                    newSlides.splice(toIndex, 0, removed) 
                    return  {
                        slides: newSlides.map((slide, index) => ({
                            ...slide,
                            slideOrder: index
                        }))
                    }
                })
            }
        }),
        {
            name: 'slides-storage', // unique name
        }
    )
)