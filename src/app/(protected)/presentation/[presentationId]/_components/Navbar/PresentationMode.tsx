import React, { useEffect, useState } from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import { useSlideStore } from '@/store/useSlideStore'
import { MasterRecursiveComponent } from '../editor/MasterRecursiveComponent'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type Props = {
    onClose: () => void
}

const PresentationMode = ({onClose}: Props) => {
    const {getOrderedSlides, currentTheme} = useSlideStore()
    const slides = getOrderedSlides()
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === 'ArrowRight' || e.key === ' '){
                setCurrentSlideIndex(currentSlideIndex + 1)
            }else if(e.key === 'ArrowLeft'){
                setCurrentSlideIndex(currentSlideIndex - 1)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    },[slides.length, currentSlideIndex, onClose])
  return (
    <div className='fixed inset-0 bg-black flex items-center justify-center z-50'>
        <div
        className='relative w-full h-full'
        style={{
            aspectRatio: '16/9',
            maxHeight: '100vh',
            maxWidth: '177.78vh',
        }}
        >

            {' '}
            <AnimatePresence mode='wait'>
                <motion.div
                key={currentSlideIndex}
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 1.2}}
                transition={{duration: 0.4}}
                className={`w-full h-full pointer-events-none ${slides[currentSlideIndex].className}`}
                style={{
                    backgroundColor: currentTheme.slideBackgroundColor,
                    backgroundImage: currentTheme.gradientBackground,
                    color: currentTheme.accentColor,
                    fontFamily: currentTheme.fontFamily,
                }}
                >
                    <MasterRecursiveComponent 
                    content={slides[currentSlideIndex].content} 
                    onContentChange={() => {}}
                    slideId={slides[currentSlideIndex].id}
                    isPreview={false}
                    isEditable={false}
                    />
                </motion.div>
            </AnimatePresence>
            <Button
            variant='ghost'
            size='icon'
            className='absolute top-4 right-4 text-white'
            onClick={onClose}
            >
                <X className='w-4 h-4' />
            </Button>
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 transform flex space-x-4'>
                <Button
                variant='outline'
                size='icon'
                onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                disabled={currentSlideIndex === 0}  
                >
                    <ChevronLeft className='w-4 h-4' />
                </Button>
                <Button
                variant='outline'
                size='icon'
                onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                disabled={currentSlideIndex === slides.length - 1}  
                >
                    
                        <ChevronRight className='w-4 h-4' />
                </Button>
            </div>
        </div>
    </div>
  )
}

export default PresentationMode