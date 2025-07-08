import React, { useEffect, useState } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import DraggableSlidePreview from './DraggableSlidePreview'

type Props = { hiddenOnMobile?: boolean }

const LayoutPreview = ({ hiddenOnMobile = true }: Props) => {
    const {getOrderedSlides, reorderSlides} = useSlideStore()
    const slides = getOrderedSlides()
    const [loading, setLoading] = useState(true)
    const moveSlide = (dragIndex:number, hoverIndex:number) => {
        reorderSlides(dragIndex, hoverIndex)
    }

    useEffect(() => {
        if(typeof window !== 'undefined') setLoading(false)
    }, [])
  return (
    <div
    className={
        cn(
            // Hide below the `sm` breakpoint when mobile collapse is enabled
            hiddenOnMobile ? 'hidden sm:block' : '',
            'w-72 h-full fixed left-0 top-20 border-r overflow-y-auto'
        )
    }
    >
        <ScrollArea className='h-full w-full' suppressHydrationWarning>
            {loading ?  
            <div className='w-full px-4 flex flex-col space-y-6'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
            </div>
            : 
            <div className='p-4 pb-32 space-y-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-sm font-medium dark:text-white text-gra-500'>
                        SLIDES
                    </h2>
                    <span className='text-xs dark:text-gray-200 text-gray-400' suppressHydrationWarning>
                        {slides.length} slides
                    </span>
                </div>
                {slides.map((slide,index)=>(
                    <DraggableSlidePreview
                    key={slide.id || index} 
                    slide={slide} 
                    index={index} 
                    moveSlide={moveSlide}
                    />
                ))}
            </div>
            }
        </ScrollArea>
    </div>
  )
}

export default LayoutPreview