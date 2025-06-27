import React, { KeyboardEvent } from 'react'
import { useSlideStore } from '@/store/useSlideStore'
import { cn } from '@/lib/utils'

type ListProps = {
    items: string[],
    onChange: (items: string[]) => void,
    className?: string,
    isEditable?: boolean,
}

type ListItemProps = {
    item: string,
    index: number,
    onChange: (index: number, value: string) => void,
    onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void,
    isEditable: boolean,
    fontColor: string,
}

const ListItem: React.FC<ListItemProps> = ({
    item,
    index,
    onChange,
    onKeyDown,
    isEditable,
    fontColor,
}) => <input 
    type='text'
    value={item}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    className="bg-transparent outline-none w-full py-1"
    style={{color: fontColor}}
    readOnly={!isEditable}
/>

const NumberedList: React.FC<ListProps> = ({
    items,
    onChange,
    className,
    isEditable = true,
}) => {
    const {currentTheme} = useSlideStore()

    const handleChange = (index: number, value: string) => {
        if(isEditable){
            const newItems = [...items]
            newItems[index] = value
            onChange(newItems)
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {

        if(e.key === 'Enter'){
            e.preventDefault()
            const newItems = [...items]
            newItems.splice(index + 1, 0, '')
            onChange(newItems)
            setTimeout(()=>{
                const nextInput = document.querySelector(`li:nth-child(${index + 2}) input`) as HTMLInputElement
                if(nextInput){
                    nextInput.focus()
                }
            },0)
        }else if (e.key === "Backspace" && items[index] === '' && items.length > 1){
            e.preventDefault()
            const newItems = [...items]
            newItems.splice(index, 1)
            onChange(newItems)
        }
    }
  return (
    <ol
    className={cn(`list-decimal list-inside space-y-1`, className)}
    style={{color: currentTheme.accentColor}}
    >
        {items.map((item, index)=>(
            <li key={index}>
                <ListItem
                item={item}
                index={index}
                isEditable={isEditable}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                fontColor={currentTheme.fontColor}
                />
            </li>
        ))}
    </ol>
  )
}

export default NumberedList