import React from 'react'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'



interface BlockQuoteProps extends React.HTMLAttributes<HTMLQuoteElement>{
    children: React.ReactNode,
    className?: string
}

const BlockQuote = ({
    children,
    className,
    ...props
}: BlockQuoteProps) => {
    const {currentTheme} = useSlideStore()
  return (
    <blockquote
    className={cn(`pl-4 boder-l-4 italic`,
        'my-4 py-2',
        'text-gray-700 dark:text-gray-300',
        className)}
        style={{borderLeftColor: currentTheme.accentColor}}
        {...props}
    >
        {children}
    </blockquote>
  )
}

export default BlockQuote