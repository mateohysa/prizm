import { useMemo } from 'react'

interface ScalingConfig {
  containerWidth: number
  containerHeight: number
}

interface ScalingResult {
  scale: number
  debug?: {
    containerDimensions: { width: number; height: number }
    targetScale: number
  }
}

const useSlideScaling = ({
  containerWidth,
  containerHeight,
}: ScalingConfig): ScalingResult => {
  
  const scaling = useMemo(() => {
    // Only proceed if we have valid dimensions
    if (containerWidth <= 0 || containerHeight <= 0) {
      return { scale: 1 }
    }

    // Simple approach: Scale based on container height
    // Use more conservative scaling - assume editor content is ~500px height
    // This will result in smaller, more conservative scaling
    const targetEditorHeight = 500
    const targetScale = containerHeight / targetEditorHeight
    
    // Ensure reasonable bounds - more conservative scaling
    const scale = Math.max(1.0, Math.min(1.8, targetScale))
    
    return {
      scale,
      debug: {
        containerDimensions: { width: containerWidth, height: containerHeight },
        targetScale,
      }
    }
  }, [containerWidth, containerHeight])

  return scaling
}

export default useSlideScaling 