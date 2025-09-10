'use client'
import React, { useState, useEffect } from 'react'
import ThumbnailCanvas from './thumbnail-canvas'
import ThumbnailFallback from './thumbnail-fallback'

interface ProjectThumbnailProps {
  projectId: string
  title: string
  themeName: string
  className?: string
}

const ProjectThumbnail = ({ projectId, title, themeName, className = '' }: ProjectThumbnailProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // Set hydrated state on client-side
    setIsHydrated(true)
  }, [])
  
  // During SSR and initial render, show fallback
  if (!isHydrated) {
    return (
      <ThumbnailFallback 
        title={title}
        themeName={themeName}
        className={className}
      />
    )
  }
  
  // After hydration, show canvas
  return (
    <ThumbnailCanvas
      projectId={projectId}
      title={title}
      themeName={themeName}
      className={className}
    />
  )
}

export default ProjectThumbnail
