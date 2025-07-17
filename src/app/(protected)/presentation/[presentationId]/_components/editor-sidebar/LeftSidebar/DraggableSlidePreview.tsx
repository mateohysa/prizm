import { useSlideStore } from '@/store/useSlideStore'
import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Slide } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useRef } from 'react'
import ScaledPreview from './ScaledPreview'

type Props = {
    slide:Slide,
    index:number,
    moveSlide: (index:number, newIndex:number) => void,
}

const DraggableSlidePreview = ({
    slide,
    index,
    moveSlide,
}: Props) => {
    const {currentSlide, setCurrentSlide} = useSlideStore()
    const ref = useRef<HTMLDivElement>(null)
    const [{isDragging}, drag] = useDrag({
        type: 'SLIDE',
        item: {index},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })


    const [, drop] = useDrop({ accept: 'SLIDE',
    hover (item: { index: number }) {
    if (!ref.current) {
        return
    }
    const dragIndex = item.index 
    const hoverIndex = index
        if (dragIndex === hoverIndex) {
        return
    }   
        moveSlide (dragIndex, hoverIndex) 
        item.index = hoverIndex
    }, 
    })
    drag(drop(ref))
    
  return (
    <div
    ref={ref}
    className={cn('relative cursor-pointer group', 
        index === currentSlide ? 'before:bg-blue0500' :
        'before:bg-transparent',
        isDragging ? 'opacity-50' : 'opacity-100'
    )}
    onClick={() => setCurrentSlide(index)}
    >
        <div className='pl-2 mb-4 relative'>
            <ScaledPreview 
            slide={slide}
            isActive={index === currentSlide}
            index={index}
            />
        </div>
    </div>
  )
}

export default DraggableSlidePreview