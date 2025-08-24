"use client"

import React, { useState, useEffect } from 'react'
import { useSlideStore } from '@/store/useSlideStore'

const GeneratingOverlay = () => {
    const { isGenerating } = useSlideStore()
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    
    const messages = [
        "Analyzing content...",
        "Creating layouts...",
        "Applying theme...",
        "Generating slides...",
        "Finalizing presentation..."
    ]

    // Rotate messages every 2 seconds when generating
    useEffect(() => {
        if (!isGenerating) return
        
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [isGenerating, messages.length])

    // Reset message index when generation starts
    useEffect(() => {
        if (isGenerating) {
            setCurrentMessageIndex(0)
        }
    }, [isGenerating])

    if (!isGenerating) return null

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
                    <p className="text-xl font-semibold text-foreground drop-shadow-md" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                        {messages[currentMessageIndex]}
                        <span className="animate-pulse">...</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default GeneratingOverlay 