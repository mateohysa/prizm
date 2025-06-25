'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useState } from 'react'

interface TableCompProps {
    content: string[][],
    onChange: (newContent: string[][]) => void,
    isPreview?: boolean,
    isEditable?: boolean,
    initialRowSize: number,
    initialColSize: number,
}

const TableComp = ({
    content,
    onChange,
    isPreview,
    isEditable,
    initialRowSize,
    initialColSize
}: TableCompProps) => {

    const {currentTheme} = useSlideStore()

    const [tableData, setTableData] = useState<string[][]>(()=>{
        if(content.length == 0 || content[0].length == 0){
            return Array(initialRowSize).fill(Array(initialColSize).fill(''))
        }
        return content
    })

    const [rowSize, setRowSize] = useState<number[]>([])
    const [colSize, setColSize] = useState<number[]>([])

    const handleResizeColumn = (index: number, newSize: number) => {
        if(!isEditable) return
        const newSizes = [...colSize]
        newSizes[index] = newSize
        setColSize(newSizes)
    }

     const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        if(!isEditable) return
        const newData = tableData.map((row, rIndex)=>
            rIndex == rowIndex
            ? row.map((cell, cIndex)=>
                (cIndex == colIndex
                ? value
                : cell
            ))
            : row
        )
        setTableData(newData)
        onChange(newData)
     }

    const handleChange = (row: number, col: number, value: string) => {}
  
  if(isPreview){
    return (
        <div className='w-full overflow-x-auto text-xs'>
        <table className='w-full'>
            <thead>
                <tr>
                    {tableData[0].map((cell, index)=> (
                        <th key={index} className='border p-2'
                        style={{width: `${colSize[index]}%`  }}
                        >
                            {cell || 'Type here'}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {tableData.slice(1).map((row, rowIndex)=>(
                    <tr 
                    key={rowIndex}
                    style={{height: `${rowSize[rowIndex+1]}%`}}
                    >
                        {row.map((cell, cellIndex)=>(
                            <td 
                            key={cellIndex}
                            className='border p-2'
                            >
                                {cell || 'Type here'}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    )
  }
  return <div className='w-full h-full relative'
    style={{
        background: currentTheme.gradientBackground || currentTheme.backgroundColor,
        borderRadius: '8px',
    }}
    >
        <ResizablePanelGroup direction='vertical'
        className={`h-full w-full rounded-lg border ${
            initialColSize === 2
            ? 'min-h-[100px]'
            : initialColSize === 3
            ? 'min-h-[150px]'
            : initialColSize === 4
            ? 'min-h-[200px]'
            : 'min-h-[100px]'
        }`}
        onLayout={(sizes) => setRowSize(sizes)}
        >
            {tableData.map((row, rowIndex)=>(
                <React.Fragment key={rowIndex}>
                    {rowIndex > 0 && <ResizableHandle />}
                    <ResizablePanelGroup direction='horizontal'
                    onLayout={(sizes) => setColSize(sizes)}
                    className='h-full w-full'
                    >
                        {row.map((cell, colIndex)=>(
                            <React.Fragment key={colIndex}>
                                {colIndex > 0 && <ResizableHandle>
                                    </ResizableHandle>}
                                    <ResizablePanel
                                        defaultSize={colSize[colIndex]}
                                        onResize={(size)=>handleResizeColumn(colIndex, size)}
                                        key={colIndex}
                                        className='w-full h-full min-h-9'
                                        >
                                            <div className='w-full h-full relative min-h-3'>
                                                <input value={cell}
                                                onChange={(e)=>updateCell(rowIndex, colIndex, e.target.value)}
                                                className='w-full h-full p-4 bg-transparent focus:outline-none focus:ring-2
                                                focus:ring-blue-500 rounded-md'
                                                style={{color: currentTheme.fontColor}}
                                                placeholder='Type here'
                                                readOnly={!isEditable}
                                                >
                                                </input>
                                            </div>
                                        </ResizablePanel>    
                            </React.Fragment>
                        ))} 
                    </ResizablePanelGroup>
                </React.Fragment>
            ))}
        </ResizablePanelGroup>
    </div>
}

export default TableComp