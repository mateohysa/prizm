'use client'

import { cn } from "@/lib/utils"
import React, { useRef, useEffect } from "react"

interface HeadingProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{
    className?: string,
    styles?: React.CSSProperties,
    isPreview?: boolean,
}

const createHeading = (displayName: string, defaultClassName: string) => {
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
                    font-normal text-gray-900 placeholder:text-gray-300
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
                    ...styles
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

const Heading1 = createHeading('Heading1', 'text-4xl')
const Heading2 = createHeading('Heading2', 'text-3xl')
const Heading3 = createHeading('Heading3', 'text-2xl')
const Heading4 = createHeading('Heading4', 'text-xl')
const Title = createHeading('Title', 'text-5xl')

export { Heading1, Heading2, Heading3, Heading4, Title }