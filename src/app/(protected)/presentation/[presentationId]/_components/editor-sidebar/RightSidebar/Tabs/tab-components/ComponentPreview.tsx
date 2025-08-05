import { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react'
import { useDrag } from 'react-dnd';

type ComponentPreviewProps = {
    type: string;
    componentType: string;
    name: string;
    component: ContentItem;
    icon: string;
}

const ComponentPreview = ({
    item 
}: {item:ComponentPreviewProps}) => {
    const [{isDragging}, drag] = useDrag({
        type: 'CONTENT_ITEM', 
        item: item,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    })
  return (
    <div
    className={cn('border', isDragging ? 'opacity-50' : 'opacity-100')}
    ref={drag as unknown as React.RefObject<HTMLDivElement>}
    >
        <button
        className={cn('flex flex-col items-center cursor-grab active:cursor-grabbing gap-2 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200',
            'text-center w-full',
            'hover:scale-105 transform'
        )}
        >
            <div className='w-full aspect=[16/9] rounded-md border border-white/30 dark:border-white/20 bg-white/10 dark:bg-white/5 p-2 shadow-sm hover:shadow-md transition-shadow duration-200'
            >
                <div className='flex items-center justify-center gap-2'>
                    <span className='text-2xl text-primary'>{item.icon}</span>
                </div>
            </div>
            <span className='text-xs text-gray-500 font-medium'>
                {item.name}
            </span>

        </button>
    </div>
  )
}

export default ComponentPreview