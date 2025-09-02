"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { X } from 'lucide-react'

const GeneratingOverlay = () => {
    const { isGenerating, cancelGeneration, isPresentationReady } = useSlideStore()
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    const [displayedMessages, setDisplayedMessages] = useState<Set<number>>(new Set())
    const [isInitialGeneration, setIsInitialGeneration] = useState(true)
    const generationSessionRef = useRef<number>(0)
    
    const messages = [
        "Analyzing content...",
        "Creating layouts...",
        "Applying theme...",
        "Generating slides...",
        "Finalizing presentation...",
        "Loading your presentation..."
    ]

    // Reset everything when generation starts (new session)
    useEffect(() => {
        if (isGenerating && isInitialGeneration) {
            generationSessionRef.current += 1
            setCurrentMessageIndex(0)
            setDisplayedMessages(new Set([0])) // Start with first message displayed
            setIsInitialGeneration(false)
        } else if (!isGenerating) {
            // Reset for next session
            setIsInitialGeneration(true)
        }
    }, [isGenerating, isInitialGeneration])

    // Progress through messages without repetition
    useEffect(() => {
        if (!isGenerating) return
        
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => {
                const nextIndex = prevIndex + 1
                if (nextIndex >= messages.length - 1) {
                    // Don't go to the last message ("Loading...") during generation
                    return messages.length - 2 // Stay on "Finalizing presentation..."
                }
                
                setDisplayedMessages(prev => new Set([...prev, nextIndex]))
                return nextIndex
            })
        }, 2500) // Slightly longer intervals for better UX

        return () => clearInterval(interval)
    }, [isGenerating, messages.length])

    // Show "Loading your presentation..." when generation is done but presentation not ready
    useEffect(() => {
        if (!isGenerating && !isPresentationReady) {
            setCurrentMessageIndex(messages.length - 1) // "Loading your presentation..."
        }
    }, [isGenerating, isPresentationReady, messages.length])

    // Handle cancel generation
    const handleCancel = () => {
        cancelGeneration()
        // Could add additional cleanup logic here if needed
    }

    // Show overlay if generating OR if presentation is not ready
    const shouldShowOverlay = isGenerating || !isPresentationReady
    
    if (!shouldShowOverlay) return null

    return (
        <div 
            className="fixed inset-0 w-screen h-screen bg-white/50 dark:bg-black/50 backdrop-blur-3xl z-[99999] flex items-center justify-center"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
            {/* Shimmer animation container */}
            <div className="flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 via-blue-400 to-purple-500 opacity-30 animate-ping"></div>
                    <div className="absolute inset-2 w-28 h-28 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-40 animate-pulse delay-75"></div>
                    <div className="absolute inset-4 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-50 animate-ping delay-150"></div>
                    <div className="absolute inset-6 w-20 h-20 rounded-full bg-gradient-to-r from-pink-300 via-blue-300 to-purple-300 opacity-60 animate-pulse delay-300"></div>
                </div>

                {/* Animated text */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        Creating your presentation
                    </h2>
                    <p className="text-xl font-semibold text-foreground drop-shadow-md mb-8" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                        {messages[currentMessageIndex]}
                        <span className="animate-pulse">...</span>
                    </p>
                    
                    {/* Cancel Button */}
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white hover:text-gray-200 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        <X size={18} />
                        Cancel Generation
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GeneratingOverlay 