import { ContextMenuItemIndicatorProps } from "@radix-ui/react-context-menu";

export interface Slide {
    id: string;
    slideName: string;
    type: string;
    content: ContentItem;
    slideOrder: number;
    className?: string;
}

export type ContentType =
    | 'column'
    | 'resizable-column' 
    | 'text' 
    |'paragraph' 
    | 'image'
    | 'table'
    | 'multicolumn'
    | 'blank'
    |'imageAndText'
    | 'heading1'
    | 'heading2'
    | 'heading3'    
    | 'title'
    | 'heading4'
    | 'table'
    | 'blockquote'
    | 'numberedList'
    | 'bulletedList'
    |'code'
    | 'link' 
    | 'quote' 
    | 'divider'
    | 'calloutBox' 
    | 'todoList'
    | 'bulletList'
    | 'codeBlock'
    | 'customButton' 
    | 'table'
    |'tableOfContents'


export interface ContentItem { id: string
    type: ContentType
    name: string
    content: ContentItem[] | string | string[] | string[] []
    initialRows?: number
    initialColumns?: number
    restrictToDrop?: boolean 
    columns?: number
    placeholder?: string 
    className?: string
    alt?: string
    calloutType?: 'success' | 'warning' | 'info' |
    'question' | 'caution'
    link?: string
    code?: string
    language?: string
    bgColor?: string
    isTransparent?: boolean
}