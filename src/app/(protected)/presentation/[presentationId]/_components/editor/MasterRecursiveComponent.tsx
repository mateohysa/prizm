'use client'
import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { ContentItem } from '@/lib/types'
import { Heading1, Heading3, Heading4, Title } from '@/components/global/editor/headings'
import { cn } from '@/lib/utils'
import Dropzone from './Dropzone'
import { Heading2 } from '@/components/global/editor/headings'
import Paragraph from '@/components/global/editor/Paragraph'

type MasterRecursiveComponentProps = {
    content: ContentItem,
    onContentChange: (
        contentId: string,
        newContent: string | string[] | string[][],
    ) => void,
    isPreview?: boolean,
    isEditable?: boolean,
    slideId?: string,
    index?: number,
}

type ContentRendererProps = {
    content: ContentItem,
    onContentChange: (
        contentId: string,
        newContent: string | string[] | string[][],
    ) => void,
    isPreview?: boolean,
    isEditable?: boolean,
    slideId: string,
    index?: number,

}

const ContentRenderer: React.FC<ContentRendererProps> = React.memo((
    {
        content,
        onContentChange,
        isPreview,
        isEditable,
        slideId,
        index,
    }
)=>{

    const handleChange = useCallback((e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        onContentChange(content.id, e.target.value)
    },[content.id, onContentChange])


    const commonProps = {
        placeholder: content.placeholder,
        value: content.content as string,
        onChange: handleChange,
        isPreview: isPreview
    }

    const animationProps = {
        initial: {
            opacity: 0,
            y: 20,
        },
        animate: {
            opacity: 1,
            y: 0,
        },
        transition: {
            duration: 0.5,
        }
    }
    // TODO COMPLETE TYPEs
    switch(content.type){
        case 'heading1':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Heading1 {...commonProps} />
            </motion.div>)
        case 'heading2':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Heading2 {...commonProps} />
            </motion.div>)
        case 'heading3':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Heading3 {...commonProps} />
            </motion.div>)
        case 'heading4':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Heading4 {...commonProps} />
            </motion.div>)
        case 'title':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Title {...commonProps} />
            </motion.div>)
        case 'paragraph':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <Paragraph {...commonProps} />
            </motion.div>)
        case 'column':
            if(Array.isArray(content.content)){
                return (<motion.div
                    className={cn('w-full h-full flex flex-col', content.className)}
                    {...animationProps}
                    >
                       {content.content.length > 0 ?
                       (content.content as ContentItem[]).map((subItem:ContentItem, subIndex:number)=>(
                        <React.Fragment key={subItem.id || `item-${subIndex}`}>
                            {!isPreview && !subItem.restrictToDrop && 
                            subIndex==0 && 
                            isEditable && 
                            <Dropzone 
                            index={0}
                            parentId={content.id}
                            slideId={slideId || ''}
                            />}
                            <MasterRecursiveComponent 
                            content={subItem}
                            onContentChange={onContentChange}
                            isPreview={isPreview}
                            isEditable={isEditable}
                            slideId={slideId}
                            />
                            {!isPreview && 
                            !subItem.restrictToDrop && 
                            isEditable && 
                            
                            <Dropzone
                            index={subIndex+1}
                            parentId={content.id}
                            slideId={slideId}
                            />}
                        </React.Fragment>
                       ))
                       : isEditable ? (
                        <Dropzone
                        index={0}
                        parentId={content.id}
                        slideId={slideId}
                        />
                       ) : null}
                    </motion.div>)
            }
            return null
        default:
            return null
    }
})

ContentRenderer.displayName = 'ContentRenderer'



export const MasterRecursiveComponent:React.FC<MasterRecursiveComponentProps> = React.memo(
    ({
        content,
        onContentChange,
        isPreview=false,
        isEditable=true,
        slideId,
        index,
    })=>{
        if(isPreview) return (
            <ContentRenderer
        content={content}
        onContentChange={onContentChange}
        isPreview={isPreview}
        isEditable={isEditable}
        slideId={slideId || ''}
        index={index}
        />
        )
        return (
            <React.Fragment>
                <ContentRenderer
                content={content}
                onContentChange={onContentChange}
                isPreview={isPreview}
                isEditable={isEditable}
                slideId={slideId || ''}
                index={index}
                />
            </React.Fragment>
        )
    }
)

MasterRecursiveComponent.displayName = 'MasterRecursiveComponent'