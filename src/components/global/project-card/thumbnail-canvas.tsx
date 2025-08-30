'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { themes } from '@/lib/constants'

interface ThumbnailCanvasProps {
  projectId: string
  title: string
  themeName: string
  width?: number
  height?: number
  className?: string
}

// Simple hash function for consistent visuals
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Predefined gradient combinations for variety
const GRADIENT_COMBINATIONS = [
  { type: 'linear', direction: '135deg', colors: ['start', 'accent'] },
  { type: 'linear', direction: '45deg', colors: ['accent', 'start'] },
  { type: 'radial', position: 'center', colors: ['start', 'accent'] },
  { type: 'linear', direction: '90deg', colors: ['start', 'accent'] },
  { type: 'linear', direction: '180deg', colors: ['accent', 'start'] },
]

// Pattern types for visual variety
const PATTERN_TYPES = ['dots', 'diagonal', 'grid', 'circles']

const setupCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const ctx = canvas.getContext('2d')!
  const devicePixelRatio = window.devicePixelRatio || 1
  
  // Set actual size in memory (scaled to device pixel ratio)
  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  
  // Scale the context to ensure correct drawing operations
  ctx.scale(devicePixelRatio, devicePixelRatio)
  
  // Set CSS size (what user sees)
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  
  return ctx
}

const getDesignElements = (projectId: string, title: string) => {
  const hash = hashString(projectId + title)
  
  // Pick gradient combination
  const gradientIndex = hash % GRADIENT_COMBINATIONS.length
  
  // Pick pattern (25% chance)
  const hasPattern = (hash % 4) === 0
  const patternType = PATTERN_TYPES[hash % PATTERN_TYPES.length]
  
  // Pick accent position (0: top-left, 1: top-right, 2: bottom-right, 3: bottom-left)
  const accentPosition = hash % 4
  
  // Pick text style variation
  const textVariation = hash % 3 // 0: title, 1: initials, 2: title truncated
  
  return { gradientIndex, hasPattern, patternType, accentPosition, textVariation }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const ThumbnailCanvas = React.memo(({
  projectId,
  title,
  themeName,
  width = 320,
  height = 180,
  className = ''
}: ThumbnailCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Find the theme
  const theme = themes.find(t => t.name === themeName) || themes[0]
  
  // Intersection Observer for lazy drawing
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Draw once and disconnect
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
    
    if (canvasRef.current) {
      observer.observe(canvasRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const drawGradient = useCallback((ctx: CanvasRenderingContext2D, gradientConfig: any, theme: any) => {
    let gradient
    
    // Parse theme colors
    const startColor = theme.backgroundColor || '#f0f0f0'
    const accentColor = theme.accentColor || '#3b82f6'
    
    if (gradientConfig.type === 'radial') {
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    } else {
      // Linear gradient
      const angle = parseInt(gradientConfig.direction) * Math.PI / 180
      const x1 = width/2 - Math.cos(angle) * width/2
      const y1 = height/2 - Math.sin(angle) * height/2
      const x2 = width/2 + Math.cos(angle) * width/2
      const y2 = height/2 + Math.sin(angle) * height/2
      
      gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    }
    
    if (gradientConfig.colors[0] === 'start') {
      gradient.addColorStop(0, startColor)
      gradient.addColorStop(1, accentColor)
    } else {
      gradient.addColorStop(0, accentColor)
      gradient.addColorStop(1, startColor)
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }, [width, height])
  
  const drawPattern = useCallback((ctx: CanvasRenderingContext2D, patternType: string, theme: any) => {
    const accentRgb = hexToRgb(theme.accentColor || '#3b82f6')
    ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`
    
    const spacing = 20
    
    switch (patternType) {
      case 'dots':
        for (let x = 0; x < width; x += spacing) {
          for (let y = 0; y < height; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
        
      case 'diagonal':
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`
        for (let i = -height; i < width; i += spacing) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i + height, height)
          ctx.stroke()
        }
        break
        
      case 'grid':
        ctx.lineWidth = 0.5
        ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`
        // Vertical lines
        for (let x = 0; x < width; x += spacing) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        // Horizontal lines
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break
        
      case 'circles':
        ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`
        ctx.lineWidth = 1
        for (let x = 0; x < width; x += spacing * 2) {
          for (let y = 0; y < height; y += spacing * 2) {
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        break
    }
  }, [width, height])
  
  const drawText = useCallback((ctx: CanvasRenderingContext2D, title: string, textVariation: number, theme: any) => {
    ctx.fillStyle = theme.fontColor || '#000000'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // Padding from edges
    const padding = 16
    const startX = padding
    const startY = padding
    const maxWidth = width - (padding * 2)
    
    if (textVariation === 1) {
      // Draw initials centered
      const words = title.split(' ').filter(word => word.length > 0)
      const initials = words.map(word => word[0]).join('').slice(0, 2).toUpperCase()
      
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${Math.min(width, height) * 0.3}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      ctx.fillText(initials, width / 2, height / 2)
    } else {
      // Modern font stack used in the app
      const fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      
      // Start with larger font size
      let fontSize = Math.max(18, Math.min(width, height) * 0.12)
      ctx.font = `600 ${fontSize}px ${fontFamily}` // Semi-bold weight
      
      // Function to wrap text properly
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ')
        const lines = []
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word
          const metrics = ctx.measureText(testLine)
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        
        if (currentLine) {
          lines.push(currentLine)
        }
        
        return lines
      }
      
      // Adjust font size until text fits properly
      let lines = wrapText(title, maxWidth)
      while (lines.length > 3 && fontSize > 12) {
        fontSize -= 2
        ctx.font = `600 ${fontSize}px ${fontFamily}`
        lines = wrapText(title, maxWidth)
      }
      
      // Calculate line height (1.3x font size for good readability)
      const lineHeight = fontSize * 1.3
      
      // Draw each line
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight)
        
        // Make sure we don't overflow the canvas height
        if (y + lineHeight <= height - padding) {
          ctx.fillText(line, startX, y)
        }
      })
    }
  }, [width, height])
  
  const drawAccent = useCallback((ctx: CanvasRenderingContext2D, position: number, theme: any) => {
    ctx.fillStyle = theme.accentColor || '#3b82f6'
    
    const thickness = 4
    const length = Math.min(width, height) * 0.3
    
    switch (position) {
      case 0: // top-left
        ctx.fillRect(0, 0, length, thickness)
        ctx.fillRect(0, 0, thickness, length)
        break
      case 1: // top-right
        ctx.fillRect(width - length, 0, length, thickness)
        ctx.fillRect(width - thickness, 0, thickness, length)
        break
      case 2: // bottom-right
        ctx.fillRect(width - length, height - thickness, length, thickness)
        ctx.fillRect(width - thickness, height - length, thickness, length)
        break
      case 3: // bottom-left
        ctx.fillRect(0, height - thickness, length, thickness)
        ctx.fillRect(0, height - length, thickness, length)
        break
    }
  }, [width, height])
  
  // Memoized drawing function
  const drawThumbnail = useCallback(() => {
    if (!canvasRef.current || !isVisible) return
    
    const ctx = setupCanvas(canvasRef.current, width, height)
    const design = getDesignElements(projectId, title)
    const gradientConfig = GRADIENT_COMBINATIONS[design.gradientIndex]
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw background gradient
    drawGradient(ctx, gradientConfig, theme)
    
    // Draw pattern if needed
    if (design.hasPattern) {
      drawPattern(ctx, design.patternType, theme)
    }
    
    // Draw title or initials
    drawText(ctx, title, design.textVariation, theme)
    
    // Draw accent border/stripe
    drawAccent(ctx, design.accentPosition, theme)
    
  }, [projectId, title, theme, isVisible, width, height, drawGradient, drawPattern, drawText, drawAccent])
  
  useEffect(() => {
    if (isVisible) {
      drawThumbnail()
    }
  }, [drawThumbnail, isVisible])
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`rounded-lg ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only redraw if these props change
  return (
    prevProps.projectId === nextProps.projectId &&
    prevProps.title === nextProps.title &&
    prevProps.themeName === nextProps.themeName &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  )
})

ThumbnailCanvas.displayName = 'ThumbnailCanvas'

export default ThumbnailCanvas
