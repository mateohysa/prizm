import React from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { ContentItem } from '@/lib/types'
import { cn } from '@/lib/utils'

type DropzoneProps = {
    index: number,
    parentId: string,
    slideId: string,
}
const Dropzone = ({
    index,
    parentId,
    slideId,
}: DropzoneProps) => {
    const {addComponentInSlide} = useSlideStore()
    const [{isOver, canDrop}, drop] = useDrop({
        accept: 'CONTENT_ITEM',
        drop: (item:{
            type: string,
            componentType: string,
            label: string,
            component: ContentItem
        }) => {
            if(item.type === "component"){
                addComponentInSlide(slideId, {...item.component, id: uuidv4()}, parentId, index)
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
    
  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>}
    className={cn(
        "w-full h-3 transition-all duration-200",
        '',
        isOver && canDrop ? "border-blue-500 bg-blue-100" : 
        "border-gray-300", 
        'hover:border-blue-300'
    )}
    >
        {isOver && canDrop && 
        <div className='w-full h-full text-sm items-center justify-center
         text-green-600 bg-blue-100'>
            Drop here
        </div>}
    </div>
  )
}

export default Dropzone