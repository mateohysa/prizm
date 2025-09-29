'use client'
import React, { useState, useContext } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useCallback } from 'react'
import { updateSlides } from '@/actions/project'

// Save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed'

// Create a context to share save status with parent components
export const SaveStatusContext = React.createContext<{
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void
}>({ 
  saveStatus: 'idle', 
  setSaveStatus: () => {} 
})


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
    ref={dropRef as unknown as React.LegacyRef<HTMLDivElement>}
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

    const [_, drop] = useDrop({
        accept: ['SLIDE','LAYOUT'],
        hover(item:{index:number; type:string}){
            if(!ref.current || !isEditable) return
            const dragIndex = item.index
            const hoverIndex = index

            if(item.type === 'SLIDE'){
                if(dragIndex === hoverIndex){
                    return
                }
                moveSlide(dragIndex, hoverIndex)
                item.index = hoverIndex
            }
        }
    })
    drag(drop(ref))

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
            'shadow-xl transition-shadow duration-300',
            'overflow-hidden flex flex-col',
            index === currentSlide ? 'ring-2 ring-blue-500 ring-offset-2' : '',
            slide.className,
            isDragging ? 'opacity-50' : 'opacity-100'
        )}
        style={{
            fontFamily: currentTheme.fontFamily,
            color: currentTheme.fontColor,
            backgroundColor: currentTheme.slideBackgroundColor,
            backgroundImage: currentTheme.gradientBackground,
        }}
        onClick={()=>setCurrentSlide(index)}
        >
            <div className='h-full w-full overflow-hidden'>
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
                        <Trash className='w-5 h-5 text-white-500'/>
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
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedRef = useRef('')
    const retryCountRef = useRef(0)
    const { saveStatus, setSaveStatus } = useContext(SaveStatusContext)
    const isMountedRef = useRef(true)

    const moveSlide = (dragIndex: number, hoverIndex: number) => {
        if(isEditable){
            reorderSlides(dragIndex, hoverIndex)
            // Trigger debounced save after reorder
            if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
            autoSaveTimerRef.current = setTimeout(() => {
                saveSlides()
            }, 2000)
        }
    }
    // Remove a slide given its id
    const handleDelete = (slideId: string) => {
        if (isEditable) {
            removeSlide(slideId)
            // Trigger debounced save after delete
            if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
            autoSaveTimerRef.current = setTimeout(() => {
                saveSlides()
            }, 2000)
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
            // Trigger debounced save after add
            if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
            autoSaveTimerRef.current = setTimeout(() => {
                saveSlides()
            }, 2000)
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

    const saveSlides = useCallback(async ()=>{
        if(!isEditable || !project) return
        
        // Skip redundant saves by comparing serialized slides
        const payload = JSON.stringify(slides)
        if(payload === lastSavedRef.current) {
            return // No changes to save
        }
        
        // Check payload size and use appropriate save method
        const payloadSizeInBytes = new Blob([payload]).size
        const payloadSizeInMB = payloadSizeInBytes / (1024 * 1024)
        
        setSaveStatus('saving')
        
        try {
            // Use API route for large presentations to avoid server action limits
            if (payloadSizeInMB > 1) {
                console.log(`Large presentation (${payloadSizeInMB.toFixed(2)}MB). Using API route for reliable saves.`)
                const response = await fetch('/api/projects/update-slides', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        projectId: project.id,
                        slides: JSON.parse(payload)
                    })
                })
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
            } else {
                // Use server action for smaller presentations
                await updateSlides(project.id, JSON.parse(payload))
            }
            
            lastSavedRef.current = payload
            retryCountRef.current = 0
            setSaveStatus('saved')
            
            // Show 'saved' status briefly, then return to idle
            setTimeout(() => {
                if(isMountedRef.current) {
                    setSaveStatus('idle')
                }
            }, 1500)
            
        } catch (error) {
            console.error('Save failed:', error)
            
            // Check if it's a size-related error
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (errorMessage.includes('exceeded') || errorMessage.includes('limit')) {
                console.warn('Save failed due to size limit. Presentation may be too large.')
                setSaveStatus('failed')
                retryCountRef.current = 0 // Don't retry size errors
                return
            }
            
            retryCountRef.current += 1
            
            if (retryCountRef.current < 3) {
                // Retry after 2 seconds
                setTimeout(() => {
                    if(isMountedRef.current) {
                        saveSlides()
                    }
                }, 2000)
            } else {
                // Max retries reached
                setSaveStatus('failed')
                retryCountRef.current = 0
            }
        }
    }, [isEditable, slides, project])
    useEffect(()=>{
        if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

        if(isEditable){
            autoSaveTimerRef.current = setTimeout(()=>{
                saveSlides()
            }, 2000)
        }
        return ()=>{
            if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        }
    }, [slides, isEditable, project])
    
    // Keep refs updated for unmount save
    const slidesRef = useRef(slides)
    const isEditableRef = useRef(isEditable)
    const projectRef = useRef(project)
    
    useEffect(() => {
        slidesRef.current = slides
    }, [slides])
    
    useEffect(() => {
        isEditableRef.current = isEditable
    }, [isEditable])
    
    useEffect(() => {
        projectRef.current = project
    }, [project])

    // Save on unmount to ensure no data is lost - runs only once
    useEffect(() => {
        isMountedRef.current = true
        
        return () => {
            isMountedRef.current = false
            // Perform final save if there are unsaved changes
            const payload = JSON.stringify(slidesRef.current)
            if(payload !== lastSavedRef.current && isEditableRef.current && projectRef.current) {
                // Use navigator.sendBeacon for reliable save on page unload
                if(typeof navigator !== 'undefined' && navigator.sendBeacon) {
                    navigator.sendBeacon('/api/projects/update-slides', JSON.stringify({
                        projectId: projectRef.current.id,
                        slides: JSON.parse(payload)
                    }))
                } else {
                    // Fallback synchronous save (may not complete)
                    updateSlides(projectRef.current.id, JSON.parse(payload)).catch(console.error)
                }
            }
        }
    }, []) // Empty dependency array - runs only on mount/unmount

    return (
        <div className="max-w-3xl mx-auto px-4">
            {loading ? 
            <div className="w-full flex flex-col space-y-6 py-8"> 
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-52 w-full" /> 
                <Skeleton className="h-52 w-full" /> 
            </div>
            : 
            <div className='pb-20 space-y-4 pt-8'>
                {isEditable && (
                    <Dropzone
                        index={0} // TODO: replace with dynamic index if needed
                        onDrop={handleDrop}
                        isEditable={isEditable}
                    />
                )}
                {orderedSlides.map((slide, index) => (
                    <React.Fragment key={`${slide.id}-${index}`}>
                        <DraggableSlide
                            slide={slide}
                            index={index}
                            moveSlide={moveSlide}
                            handleDelete={handleDelete}
                            isEditable={isEditable}
                        />
                        <Dropzone
                        index={index + 1} // TODO: replace with dynamic index if needed
                        onDrop={handleDrop}
                        isEditable={isEditable}
                    />
                    </React.Fragment>
                ))}
            </div>
            }
        </div>
    )
}

export default Editor