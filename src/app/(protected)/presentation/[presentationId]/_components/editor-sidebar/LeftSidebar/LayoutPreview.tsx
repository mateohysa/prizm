import React, { useState } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
type Props = {}

const LayoutPreview = (props: Props) => {
    const {getOrderedSlides, reorderSlides} = useSlideStore()
    const slides = getOrderedSlides()
    const [loading, setLoading] = useState(true)
  return (
    <div
    className='w-64 h-full fixed left-0 top-20 border-r  overflow-y-auto'
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

                </div>
            </div>
            }
        </ScrollArea>
    </div>
  )
}

export default LayoutPreview