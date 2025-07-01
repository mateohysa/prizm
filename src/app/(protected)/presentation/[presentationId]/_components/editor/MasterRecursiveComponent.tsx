'use client'
import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { ContentItem } from '@/lib/types'
import { Heading1, Heading3, Heading4, Title } from '@/components/global/editor/headings'
import { cn } from '@/lib/utils'
import Dropzone from './Dropzone'
import { Heading2 } from '@/components/global/editor/headings'
import Paragraph from '@/components/global/editor/Paragraph'
import TableComponent from '@/components/global/editor/TableComp'
import ColumnComponent from '@/components/global/editor/ColumnComponent'
import ImageComponent from '@/components/global/editor/ImageComponent'
import BlockQuote from '@/components/global/editor/BlockQuote'
import {BulletList, TodoList } from '@/components/global/editor/NumberedList'
import NumberedList from '@/components/global/editor/NumberedList'
import CalloutBox from '@/components/global/editor/CalloutBox'
import CodeBlock from '@/components/global/editor/CodeBlock'
import TableOfContents from '@/components/global/editor/TableOfContents'
import Divider from '@/components/global/editor/Divider'

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
        case 'table':
            return (<motion.div
            className='w-full h-full'
            {...animationProps}
            >
                <TableComponent
                ///{...commonProps} 
                content={content.content as string[][]}
                onChange={(newContent)=>onContentChange(content.id, newContent !== null ? newContent : '')}
                isPreview={isPreview}
                isEditable={isEditable}
                initialRowSize={content.initialRows ?? 1}
                initialColSize={content.initialColumns ?? 1}
                />
            </motion.div>)
        case 'codeBlock':
            return(
                <motion.div
                {...animationProps}
                className='w-full h-full'   
                >
                    <CodeBlock
                    code={content.code}
                    language={content.language}
                    onChange={(newCode)=>onContentChange(content.id, newCode)}
                    className={content.className}
                    />
                </motion.div>
            )
        case 'tableOfContents':
            return(
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <TableOfContents 
                    items={content.content as string[]}
                    onItemClick={(id)=>{
                        console.log(`Navigate to section with id: ${id}`)
                    }}
                    className={content.className}
                    />
                </motion.div>
            )
        case 'divider':
            return(
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <Divider className={content.className}/>
                </motion.div>
            )
        case 'resizable-column':
            if(Array.isArray(content.content)){
                return (
                    // <motion.div
                    //     className={cn('w-full h-full', content.className)}
                    //     {...animationProps}
                    // >
                    //     {(content.content as ContentItem[]).map((subItem:ContentItem, subIndex:number)=>(
                    //         subItem.type === 'image' ? null :
                    //         <MasterRecursiveComponent
                    //             key={subItem.id || `item-${subIndex}`}
                    //             content={subItem}
                    //             onContentChange={onContentChange}
                    //             isPreview={isPreview}
                    //             isEditable={isEditable}
                    //             slideId={slideId}
                    //         />
                    //     ))}
                    // </motion.div>
                    <motion.div
                    {...animationProps}
                    className='w-full h-full'
                    >
                        <ColumnComponent 
                        content={content.content as ContentItem[]}
                        className={content.className}
                        onContentChange={onContentChange}
                        slideId={slideId}
                        isPreview={isPreview}
                        isEditable={isEditable}
                        />
                    </motion.div>
                )
            }
            return null
        case 'image':
            return(
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <ImageComponent 
                    src={content.content as string}
                    alt={content.placeholder || 'image'}
                    className={content.className}
                    contentId={content.id}
                    onContentChange={onContentChange}
                    isEditable={isEditable}
                    />
                </motion.div>
            )

        case 'blockquote':
            return (
                <motion.div
                {...animationProps}
                className={cn(`w-full h-full flex flex-col`, content.className)}
                >
                    <BlockQuote>
                        <Paragraph {...commonProps} />
                    </BlockQuote>
                </motion.div>
            )
        case 'numberedList':
            return(
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <NumberedList 
                    items={content.content as string[]}
                    onChange={(newItems: string[])=>onContentChange(content.id, newItems)}
                    className={content.className}
                    />
                </motion.div>
            )
        case 'bulletList':
            return (
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <BulletList
                    items={content.content as string[]}
                    onChange={(newItems)=>onContentChange(content.id, newItems)}
                    className={content.className}
                    />
                </motion.div>
            )
        case 'todoList':
            return (
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <TodoList
                    items={content.content as string[]}
                    onChange={(newItems: string[])=>onContentChange(content.id, newItems)}
                    className={content.className}
                    />
                </motion.div>  
            )
        case 'calloutBox':
            return (
                <motion.div
                {...animationProps}
                className='w-full h-full'
                >
                    <CalloutBox
                    type={content.callOutType || 'info'}
                    className={content.className}
                    >
                        <Paragraph {...commonProps} />
                    </CalloutBox>
                    
                </motion.div>
            )
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