"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import { User } from '@/generated/prisma'
import { Separator } from '@radix-ui/react-separator'
import React from 'react'
import SearchBar from './upper-info-searchBar'
import { useSidebar } from '@/components/ui/sidebar'

type Props = {
    user: User
    children: React.ReactNode
}

const UpperInfoBar = ({user}: Props) => {
  const { open } = useSidebar()
  return (
    <header className={`sticky top-0 z-[10] flex shrink-0 flex-wrap items-center \
      gap-2 border-b bg-background p-4 justify-between transition-[margin] duration-300 ease-in-out ${open ? 'ml-[212px]' : 'ml-0'}`}>
        
        

      <div className='w-full max-w-[70%] flex items-center justify-between gap-4 flex-wrap'>
      <SidebarTrigger />
      <div className="hidden md:flex-wrap sm:flex relative max-w-md flex-1">
      <Separator orientation='vertical' className='mr-2 h-4' />
      <SearchBar />
      </div>
      
      </div>
    </header> 
  )
}

export default UpperInfoBar
