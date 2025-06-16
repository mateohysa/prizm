'use client'
import React, { useState } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { component } from '@/lib/constants'
import { LayoutSlides } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useDrop, type DropTargetMonitor, useDrag } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useRef, useEffect } from 'react'
import { Slide } from '@/lib/types'
import { MasterRecursiveComponent } from './MasterRecursiveComponent'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EllipsisVertical, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'


interface DropzoneProps {
    /** Position in the slide list where the item will be dropped */
    index: number
    /** Handler supplied by the parent that performs the actual drop logic */
    onDrop: (
        item: {
            type: string
            layoutType: string
            component: LayoutSlides
            index?: number
        },
        dropIndex: number
    ) => void
    /** Whether editing / dropping is currently allowed */
    isEditable: boolean
}

export const Dropzone:React.FC<DropzoneProps> = ({
    index,
    onDrop,
    isEditable
}) => {
    const [{isOver, canDrop}, dropRef] = useDrop({
        accept: ['SLIDE', 'layout'],
        drop:(item:{
            type: string;
            layoutType: string;
            component: LayoutSlides;
            index?: number;
        }) => {
            onDrop(item, index)
        },
        canDrop:()=> isEditable,
        collect: (monitor: DropTargetMonitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        })
    })

    if(!isEditable) return null;

  return (
    <div
    ref={(node) => {
        if (node) {
            dropRef(node)
        }
    }}
    className={cn(
        'h-4 my-2 rounded-md transition-all duration-200',
        isOver && canDrop ? 'border-green-500 bg-green-100' : 'border-gray-300',
        canDrop ? 'border-blue-300' : ''
    )}
    >
        {isOver && canDrop && (
            <div className='h-full flex items-center justify-center text-green-600'>
                Drop here
            </div>
        )}
    </div>
  )
}
interface DraggableSlideProps {
    slide: Slide,
    index: number,
    moveSlide: (dragIndex: number, hoverIndex: number) => void,
    handleDelete: (slideId: string) => void,
    isEditable: boolean
}
export const DraggableSlide:React.FC<DraggableSlideProps> = (
    {
        slide,
        index,
        moveSlide,
        handleDelete,
        isEditable
    }
) => {

    const ref = useRef(null)
    const {currentSlide, setCurrentSlide, currentTheme, updateContentItem} = useSlideStore()
    const [{isDragging}, drag] = useDrag({
        type: 'SLIDE',
        item: {
            index,
            type: 'SLIDE',
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        }),
        canDrag: isEditable,
    })
    const handleContentChange = (contentId: string, newContent: string | string[] | string[][]) => {
        if(isEditable){
            updateContentItem(slide.id, contentId, newContent)
        }
    }
    // Attach drag ref
    drag(ref)

    return (
        <div 
        ref={ref}
        className={cn(
            'w-full rounded-lg shadow-lg relative p-0',
            'min-h-[160px] sm:min-h-[220px] md:min-h-[300px] lg:min-h-[400px] max-h-[800px]',
            'shadow-xl transition-shadow duration-300',
            'flex flex-col',
            index === currentSlide ? 'ring-2 ring-blue-500 ring-offset-2' : '',
            slide.className,
            isDragging ? 'opacity-50' : 'opacity-100'
        )}
        style={{
            backgroundImage: currentTheme.gradientBackground,
        }}
        onClick={()=>setCurrentSlide(index)}
        >
            <div className='h-full w-full flex-grow overflow-hidden'>
                <MasterRecursiveComponent 
                content={slide.content}
                isPreview={false}
                isEditable={isEditable}
                slideId={slide.id}
                onContentChange={handleContentChange}
                />
            </div>
            {isEditable && <Popover>
                <PopoverTrigger asChild className='absolute top-2 left-2 z-20'>
                    <Button size='icon' variant='ghost' className='text-muted-foreground hover:text-foreground'>
                        <EllipsisVertical className='w-5 h-5' />
                        <span className='sr-only'>More options</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                    <Button variant='ghost'
                    onClick={()=>handleDelete(slide.id)}
                    >
                        <Trash className='w-5 h-5 text-red-500'/>
                        <span className='sr-only'>Delete Slide</span>
                    </Button>
                </PopoverContent>
                </Popover>}
        </div>
    )
}

type Props = {
    isEditable: boolean
}

const Editor = ({ isEditable }: Props) => {
    const {
        getOrderedSlides,
        currentSlide,
        removeSlide,
        addSlideAtIndex,
        reorderSlides,
        slides,
        project
    } = useSlideStore()

    const orderedSlides = getOrderedSlides()

    // Keep a ref to each slide container so we can auto-scroll the selected slide into view
    const slideRefs = useRef<(HTMLDivElement | null)[]>([])
    const [loading, setLoading] = useState(true)

    const moveSlide = (dragIndex: number, hoverIndex: number) => {
        if(isEditable){
            reorderSlides(dragIndex, hoverIndex)    
        }
    }
    // Remove a slide given its id
    const handleDelete = (slideId: string) => {
        if (isEditable) {
            removeSlide(slideId)
        }
    }
    // Handle a drop coming from the Dropzone component
    const handleDrop = (
        item: {
            type: string
            layoutType: string
            component: LayoutSlides
            index?: number
        },
        dropIndex: number
    ) => {
        if (!isEditable) return;
        if (item.type === 'layout') {
            addSlideAtIndex({
                ...item.component,
                id: uuidv4(),
                slideOrder: dropIndex,
            }, dropIndex)
        }else if(item.type === 'SLIDE' && item.index !== undefined){
            moveSlide(item.index, dropIndex)
        }
    }

    useEffect(() => {
        if(slideRefs.current[currentSlide]){
            slideRefs.current[currentSlide].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [currentSlide])

    useEffect(()=>{
        if(typeof window !== 'undefined') setLoading(false)
    }, [])

    return (
        <div
        className='flex-1 flex flex-col h-full max-w-3xl mx-auto px-4 mb-20'
        >
            {loading ? 
            <div className="w-full px-4 flex flex-col space-y-6"> 
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-52 w-full" /> 
                <Skeleton className="h-52 w-full" /> 
            </div>
            : 
            <ScrollArea className='flex-1 mt-8'>
                <div className='px-4 pb-4 space-y-4 pt-2'>
                    {isEditable && (
                        <Dropzone
                            index={0} // TODO: replace with dynamic index if needed
                            onDrop={handleDrop}
                            isEditable={isEditable}
                        />
                    )}
                    {orderedSlides.map((slide, index) => (
                        <React.Fragment key={slide.id || index}>
                            <DraggableSlide
                                slide={slide}
                                index={index}
                                moveSlide={moveSlide}
                                handleDelete={handleDelete}
                                isEditable={isEditable}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </ScrollArea>
            }
        </div>
    )
}

export default Editor