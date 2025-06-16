"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import { User } from '@/generated/prisma'
import React from 'react'
import SearchBar from './upper-info-searchBar'
import { useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import ModeToggle from '../mode-toggle'
import ThemeSwitcher from '../mode-toggle'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import NewProjectButton from './new-project-button'
type Props = {
    user: User
    
}

const UpperInfoBar = ({user}: Props) => {
  const { open } = useSidebar()
  return (
    <header className={` sticky top-0 z-[10] flex shrink-0 flex-wrap items-center \
      gap-2 border-b bg-background p-4 justify-between  duration-300 ease-in-out`}>
        
        

      <div className='w-full flex flex-wrap items-center gap-8'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='sm:block mr-2 h-4' />
        <SearchBar />
        <ThemeSwitcher />
        <div className='flex flex-wrap gap-4 items-center justify-end'>
          <Button
          className='bg-primary-80 rounded-lg hover:bg-background-80 text-primary font-semibold
          cursor-not-allowed'>
            <Upload />
            Import
          </Button>
           <NewProjectButton user={user} />
        </div>
      </div>
    </header> 
  )
}

export default UpperInfoBar
