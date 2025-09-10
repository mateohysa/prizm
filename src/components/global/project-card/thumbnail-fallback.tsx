import React from 'react'
import { themes } from '@/lib/constants'

interface ThumbnailFallbackProps {
  title: string
  themeName: string
  className?: string
}

// Simple hash function for consistent visuals (same as canvas component)
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

const ThumbnailFallback = ({ title, themeName, className = '' }: ThumbnailFallbackProps) => {
  // Find the theme
  const theme = themes.find(t => t.name === themeName) || themes[0]
  
  // Generate consistent initials
  const words = title.split(' ').filter(word => word.length > 0)
  const initials = words.map(word => word[0]).join('').slice(0, 2).toUpperCase()
  
  // Use theme's gradient background or create a simple one
  const backgroundStyle = theme.gradientBackground || 
    `linear-gradient(135deg, ${theme.backgroundColor || '#f0f0f0'} 0%, ${theme.accentColor || '#3b82f6'} 100%)`
  
  return (
    <div 
      className={`w-full h-full rounded-lg flex items-center justify-center ${className}`}
      style={{
        background: backgroundStyle,
        fontFamily: theme.fontFamily || 'sans-serif'
      }}
    >
      <span 
        className="font-bold text-2xl select-none"
        style={{ 
          color: theme.fontColor || '#000000',
          opacity: 0.9
        }}
      >
        {initials}
      </span>
    </div>
  )
}

export default ThumbnailFallback
