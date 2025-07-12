'use client'
import React from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Component, LayoutTemplate, Type } from 'lucide-react'
import LayoutPicker from './Tabs/LayoutPicker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { component } from '@/lib/constants'
import ComponentPreview from './Tabs/tab-components/ComponentPreview'

type Props = {}

const EditorSidebar = (props: Props) => {
    const {currentTheme} = useSlideStore()
  return (
    <div
    className='fixed top-1/2 right-0 transform -translate-y-1/2 z-10'
    >
        <div className='rounded-xl border-r-0 border border-backgorund-70 shadow-lg p-2 flex flex-col items-center space-y-4'>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-full'
                    >
                        <LayoutTemplate className='w-5 h-5' />
                        <span className='sr-only'>Choose Layout</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                side='left'
                align='center'
                className='w-[480px] p-0'
                >
                    <LayoutPicker />
                    
                </PopoverContent>
            </Popover>


            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-full'
                    >
                        <Type className='w-5 h-5' />
                        <span className='sr-only'>Choose Layout</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                side='left'
                align='center'
                className='w-[480px] p-0'
                style={{
                    backgroundColor: currentTheme.slideBackgroundColor,
                    color: currentTheme.fontColor,
                }}
                >
                    <ScrollArea className='h-[400px]'>
                        <div className='p-4 flex flex-col space-y-6'>
                            {
                                component.map((group, idx)=> (
                                    <div
                                    key={idx}
                                    className='space-y-2'
                                    >
                                        <h3 className='text-sm font-medium text-muted-foreground px-1'>
                                            {group.name}
                                        </h3>
                                        <div className='grid grid-cols-3 gap-4'>
                                            {group.components.map((item) => (
                                                <ComponentPreview 
                                                key={item.componentType}
                                                item={item}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                    
                </PopoverContent>
            </Popover>
        </div>
    </div>
  )
}

export default EditorSidebar