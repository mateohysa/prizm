'use client'

import { cn } from "@/lib/utils"
import React, { useRef, useEffect } from "react"

interface HeadingProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{
    className?: string,
    styles?: React.CSSProperties,
    isPreview?: boolean,
}

// Map Tailwind defaults to base pixel sizes for scalable presentation text.
// text-5xl ≈ 48px, text-4xl ≈ 36px, text-3xl ≈ 30px, text-2xl ≈ 24px, text-xl ≈ 20px
const createHeading = (displayName: string, defaultClassName: string, basePx: number) => {
    const heading = React.forwardRef<HTMLTextAreaElement, HeadingProps>(({ 
        children, styles, isPreview=false, className, ...props}, ref)=>{
            const textAreaRef = useRef<HTMLTextAreaElement>(null)
            useEffect(()=>{
                
                const textArea = textAreaRef.current
                if(textArea && !isPreview){
                    const adjustHeight = () => {
                        // First let the textarea grow/shrink naturally
                        textArea.style.height = 'auto'
                        // Then explicitly set it to its scroll height so that
                        // it fits the content and never collapses to 0px.
                        textArea.style.height = `${textArea.scrollHeight}px`
                    }
                    
                    textArea?.addEventListener('input', adjustHeight)
                    adjustHeight()
                    return ()=>{textArea?.removeEventListener('input', adjustHeight)}
                }
                
            }, [isPreview])
            const previewClassName = isPreview ? 'text-xs' : '' 
            return(
                <textarea
                className={cn(
                    `w-full bg-transparent  ${defaultClassName} ${previewClassName}
                    font-normal placeholder:text-gray-300
                    focus:outline-none resize-none overflow-hidden leading-tight`,
                    className
                )}
                style={{
                    padding: '0',
                    margin: '0',
                    color: 'inherit',
                    boxSizing: 'content-box',
                    lineHeight: '1.2em',
                    minHeight: '1.2em',
                    // Allow presentation to scale typography via CSS var
                    // without affecting the editor (defaults to 1).
                    fontSize: `calc(${basePx}px * var(--presentation-scale, 1))`,
                    ...styles,
                }}
                ref={(el)=>{
                    ;(textAreaRef.current as HTMLTextAreaElement | null) = el
                    if(typeof ref === 'function') ref(el)
                    else if(ref) ref.current = el
                }}
                readOnly={isPreview}
                {...props}
                >
                    {children}
                </textarea>
            )

        }
    )
    heading.displayName = displayName
    return heading
}

const Heading1 = createHeading('Heading1', 'text-4xl', 36)
const Heading2 = createHeading('Heading2', 'text-3xl', 30)
const Heading3 = createHeading('Heading3', 'text-2xl', 24)
const Heading4 = createHeading('Heading4', 'text-xl', 20)
const Title = createHeading('Title', 'text-5xl', 48)

export { Heading1, Heading2, Heading3, Heading4, Title }
