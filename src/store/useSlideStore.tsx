import { Project } from '@/generated/prisma';
import { Slide, Theme, ContentItem } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid'
import { Content } from '@google/generative-ai';

interface SlideState {
    slides: Slide[];
    project: Project | null;
    setSlides: (slides: Slide[]) => void;
    setProject: (project: Project) => void;
    currentSlide: number;
    setCurrentSlide: (index: number) => void;
    currentTheme : Theme
    removeSlide: (id: string) => void
    setCurrentTheme: (theme: Theme) => void
    getOrderedSlides: () => Slide[]
    reorderSlides: (fromIndex: number, toIndex: number) => void
    addSlideAtIndex: (slide: Slide, index: number) => void
    updateContentItem: (
        slideId: string, 
        contentId: string, 
        newContent: string | string[] | string[][]) => void
    addComponentInSlide: (
        slideId: string,
        item: ContentItem,
        parentId: string,
        index: number
    ) => void
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
            currentSlide: 0,
            setSlides: (slides: Slide[]) => set({slides}),
            setProject: (project) => set({project}),
            setCurrentSlide: (index: number) => set({ currentSlide: index }),
            currentTheme: defaultTheme, 
            setCurrentTheme: (theme: Theme) => set({currentTheme: theme}),
            getOrderedSlides: () => {
                const state = get()
                return [...state.slides].sort((a, b) => a.slideOrder - b.slideOrder)
            },
            updateContentItem: (
                slideId,
                contentId,
                newContent
            ) => {
                set((state) => {
                    const updateContentRecursively = (
                        item: ContentItem
                    ): ContentItem => {
                        if (item.id === contentId) {
                            return { ...item, content: newContent }
                        }

                        if (Array.isArray(item.content)) {
                            return {
                                ...item,
                                content: (item.content as ContentItem[]).map((sub) =>
                                    updateContentRecursively(sub as ContentItem)
                                ),
                            }
                        }

                        return item
                    }

                    return { slides: state.slides.map((slide)=> 
                        slide.id === slideId ? {
                            ...slide, content: updateContentRecursively(slide.content)
                        } : slide
                    ) }
                })
            },
            removeSlide: (id: string) => 
                set((state)=>({
                    slides:state.slides.filter((slide)=>slide.id !== id)
                })),
            addComponentInSlide: (
                slideId,
                item,
                parentId,
                index
            ) => {
                set((state)=>{
                    const updatedSlides = state.slides.map((slide)=>{
                        if(slide.id === slideId){
                            const updateContentRecursively = (content:ContentItem): ContentItem => {
                                if(content.id === parentId && Array.isArray(content.content)){
                                    const updatedContent = [...content.content]
                                    updatedContent.splice(index, 0, item)
                                    return {...content, content: updatedContent as unknown as string[]}
                                }
                                return content
                            }
                            return{...slide, content: updateContentRecursively(slide.content)}
                        }
                        return slide
                    })
                    return {slides: updatedSlides}
                })
            },
            addSlideAtIndex: (slide: Slide, index: number) => {
                set((state)=>{
                    const newSlides = [...state.slides]
                    newSlides.splice(index, 0, {...slide, id: uuidv4()})
                    newSlides.forEach((slide, index) => {
                        slide.slideOrder = index
                    })
                    return {slides: newSlides, currentSlide: index}
                })
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
            },
        }),
        {
            name: 'slides-storage', // unique name
        }
    )
)