import { useSlideStore } from '@/store/useSlideStore'
import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
    className?: string,
}

const Divider = ({
    className
}: Props) => {
    const {currentTheme} = useSlideStore()
  return (
    <hr 
    className={cn('my-4', className)}
    style={{
        borderColor: currentTheme.accentColor
    }}
    />
  )
}

export default Divider