import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSlideStore } from '@/store/useSlideStore'
import { MasterRecursiveComponent } from '../editor/MasterRecursiveComponent'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Play, Pause } from 'lucide-react'

type Props = {
    onClose: () => void
}

type TransitionType = 'fade' | 'slide' | 'scale' | 'rotate' | 'flip'

const PresentationMode = ({ onClose }: Props) => {
    const { getOrderedSlides, currentTheme } = useSlideStore()
    const slides = getOrderedSlides()
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isAutoPlaying, setIsAutoPlaying] = useState(false)
    const [transition, setTransition] = useState<TransitionType>('slide')
    const [direction, setDirection] = useState(0)
    const [contentScale, setContentScale] = useState(1)
    const slideContentRef = useRef<HTMLDivElement>(null)
    const presentationContainerRef = useRef<HTMLDivElement>(null)

    // Calculate scale for slide content
    const calculateScale = useCallback(() => {
        if (!slideContentRef.current || !presentationContainerRef.current) return;
        
        // First, reset scale to get true dimensions
        slideContentRef.current.style.transform = 'scale(1)';
        
        // Get the natural size of the slide content
        const contentWidth = slideContentRef.current.scrollWidth;
        const contentHeight = slideContentRef.current.scrollHeight;
        
        // Get the presentation container dimensions
        const containerWidth = presentationContainerRef.current.clientWidth;
        const containerHeight = presentationContainerRef.current.clientHeight;
        
        // Calculate scale factors for both dimensions
        const scaleX = (containerWidth * 0.9) / contentWidth; // 90% to leave some padding
        const scaleY = (containerHeight * 0.85) / contentHeight; // 85% for height to account for controls
        
        // Use the smaller scale to ensure everything fits
        const scale = Math.min(scaleX, scaleY);
        
        console.log('Scale calculation:', {
            contentWidth,
            contentHeight,
            containerWidth,
            containerHeight,
            scaleX,
            scaleY,
            finalScale: scale
        });
        
        setContentScale(scale);
    }, []);

    // Recalculate scale when slide changes or window resizes
    useEffect(() => {
        // Small delay to ensure content is rendered
        const timeout = setTimeout(() => {
            calculateScale();
        }, 100);
        
        const handleResize = () => {
            calculateScale();
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', handleResize);
        };
    }, [currentSlideIndex, calculateScale]);

    // Hide scrollbar when presentation mode is active
    useEffect(() => {
        // Save original overflow style
        const originalOverflow = document.body.style.overflow
        // Hide scrollbar
        document.body.style.overflow = 'hidden'
        
        return () => {
            // Restore original overflow when component unmounts
            document.body.style.overflow = originalOverflow
        }
    }, [])

    // Auto-hide controls after 3 seconds of inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handleMouseMove = () => {
            setShowControls(true)
            clearTimeout(timeout)
            timeout = setTimeout(() => setShowControls(false), 3000)
        }
        
        window.addEventListener('mousemove', handleMouseMove)
        timeout = setTimeout(() => setShowControls(false), 3000)
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            clearTimeout(timeout)
        }
    }, [])

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return
        
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => {
                if (prev === slides.length - 1) {
                    setIsAutoPlaying(false)
                    return prev
                }
                setDirection(1)
                return prev + 1
            })
        }, 5000) // Change slide every 5 seconds
        
        return () => clearInterval(interval)
    }, [isAutoPlaying, slides.length])

    const goToNextSlide = useCallback(() => {
        if (currentSlideIndex < slides.length - 1) {
            setDirection(1)
            setCurrentSlideIndex(currentSlideIndex + 1)
        }
    }, [currentSlideIndex, slides.length])

    const goToPreviousSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            setDirection(-1)
            setCurrentSlideIndex(currentSlideIndex - 1)
        }
    }, [currentSlideIndex])

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    goToNextSlide()
                    break
                case 'ArrowLeft':
                    goToPreviousSlide()
                    break
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen()
                    }
                    onClose()
                    break
                case 'f':
                case 'F':
                    toggleFullscreen()
                    break
                case 'Home':
                    setDirection(-1)
                    setCurrentSlideIndex(0)
                    break
                case 'End':
                    setDirection(1)
                    setCurrentSlideIndex(slides.length - 1)
                    break
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    const transitions: TransitionType[] = ['fade', 'slide', 'scale', 'rotate', 'flip']
                    setTransition(transitions[parseInt(e.key) - 1])
                    break
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentSlideIndex, slides.length, goToNextSlide, goToPreviousSlide, onClose, toggleFullscreen])

    // Animation variants for different transition types
    const getAnimationVariants = (type: TransitionType, direction: number) => {
        switch (type) {
            case 'fade':
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                }
            case 'slide':
                return {
                    initial: { x: direction > 0 ? 1000 : -1000, opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: direction < 0 ? 1000 : -1000, opacity: 0 }
                }
            case 'scale':
                return {
                    initial: { scale: 0.8, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    exit: { scale: 1.2, opacity: 0 }
                }
            case 'rotate':
                return {
                    initial: { rotateY: direction > 0 ? 90 : -90, opacity: 0 },
                    animate: { rotateY: 0, opacity: 1 },
                    exit: { rotateY: direction < 0 ? 90 : -90, opacity: 0 }
                }
            case 'flip':
                return {
                    initial: { rotateX: 90, opacity: 0 },
                    animate: { rotateX: 0, opacity: 1 },
                    exit: { rotateX: -90, opacity: 0 }
                }
            default:
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                }
        }
    }

    const currentVariant = getAnimationVariants(transition, direction)

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black z-[9999]'
        >
            {/* Main slide container */}
            <div className='w-full h-full relative overflow-hidden'>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlideIndex}
                        initial={currentVariant.initial}
                        animate={currentVariant.animate}
                        exit={currentVariant.exit}
                        transition={{
                            duration: 0.5,
                            ease: [0.42, 0, 0.58, 1]
                        }}
                        className='absolute inset-0 flex items-center justify-center'
                        style={{
                            backgroundColor: currentTheme.slideBackgroundColor,
                            backgroundImage: currentTheme.gradientBackground,
                            perspective: '1000px'
                        }}
                    >
                        <div 
                            ref={presentationContainerRef}
                            className='w-full h-full max-w-7xl mx-auto p-8 flex items-center justify-center'
                        >
                            <div 
                                className='flex items-center justify-center'
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    maxWidth: '1920px',
                                    maxHeight: '1080px',
                                    aspectRatio: '16 / 9',
                                }}
                            >
                                {slides[currentSlideIndex] && (
                                    <div 
                                        ref={slideContentRef}
                                        className={`${slides[currentSlideIndex]?.className || ''}`}
                                        style={{
                                            transform: `scale(${contentScale})`,
                                            transformOrigin: 'center center',
                                            color: currentTheme.fontColor,
                                            fontFamily: currentTheme.fontFamily,
                                            fontSize: '1.8em', // 20% bigger font size
                                            maxWidth: '900px', // Max width but allow natural sizing
                                            transition: 'transform 0.3s ease',
                                        }}
                                    >
                                        <MasterRecursiveComponent 
                                            content={slides[currentSlideIndex].content} 
                                            onContentChange={() => {}}
                                            slideId={slides[currentSlideIndex].id}
                                            isPreview={false}
                                            isEditable={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls overlay */}
            <motion.div 
                className='absolute inset-0 pointer-events-none z-10'
                initial={{ opacity: 1 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Top bar */}
                <div className='absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto z-20'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <span className='text-white/80 text-sm'>
                                Slide {currentSlideIndex + 1} of {slides.length}
                            </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='text-white hover:bg-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            >
                                {isAutoPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5' />}
                            </Button>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='text-white hover:bg-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? <Minimize2 className='w-5 h-5' /> : <Maximize2 className='w-5 h-5' />}
                            </Button>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='text-white hover:bg-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                                onClick={onClose}
                            >
                                <X className='w-5 h-5' />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom controls */}
                <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto'>
                    {/* Keyboard shortcuts hint */}
                    <div className='text-center text-white/60 text-xs'>
                        <span className='inline-block mx-2'>← → Navigate</span>
                        <span className='inline-block mx-2'>Space Next</span>
                        <span className='inline-block mx-2'>F Fullscreen</span>
                        <span className='inline-block mx-2'>ESC Exit</span>
                        <span className='inline-block mx-2'>1-5 Transitions</span>
                    </div>
                </div>
            </motion.div>

            {/* Click areas for navigation - positioned to not block controls */}
            <div 
                className='absolute inset-0 flex pointer-events-none z-0'
                style={{ outline: 'none' }}
            >
                <div 
                    className='flex-1 pointer-events-auto cursor-pointer'
                    onClick={goToPreviousSlide}
                    aria-label='Previous slide'
                    style={{ 
                        outline: 'none',
                        marginTop: '80px', // Leave space for top controls
                        marginBottom: '80px' // Leave space for bottom controls
                    }}
                />
                <div 
                    className='flex-1 pointer-events-auto cursor-pointer'
                    onClick={goToNextSlide}
                    aria-label='Next slide'
                    style={{ 
                        outline: 'none',
                        marginTop: '80px', // Leave space for top controls
                        marginBottom: '80px' // Leave space for bottom controls
                    }}
                />
            </div>
        </motion.div>
    )
}

export default PresentationMode
