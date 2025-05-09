import { SidebarTrigger } from '@/components/ui/sidebar'
import { User } from '@/generated/prisma'
import { Separator } from '@radix-ui/react-separator'
import React from 'react'
import SearchBar from './upper-info-searchBar'

type Props = {
    user: User
    children: React.ReactNode
}

const UpperInfoBar = ({user}: Props) => {
  return (
    <header className='sticky top-0 z-[10] flex shrink-0 flex-wrap items-center 
    gap-2 border-b bg-background p-4 justify-between ml-[212px]'>
        <Separator orientation='vertical' className='mr-2 h-4' />
        

      <div className='w-full max-w-[95%] flex items-center justify-between gap-4 flex-wrap'>
      <SidebarTrigger />
      <SearchBar />
      </div>
    </header> 
  )
}

export default UpperInfoBar
