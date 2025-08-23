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
    <header className={`sticky top-0 z-[10] flex shrink-0 items-center border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 bg-clip-padding backdrop-blur-sm backdrop-saturate-100 backdrop-contrast-100 p-4 justify-between duration-300 ease-in-out`}>
      {/* Left side group */}
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='sm:block h-4' />
        <SearchBar />
      </div>

      {/* Right side group */}
      <div className='flex items-center gap-4'>
        <ThemeSwitcher />
        <Button
          className='bg-primary-80 rounded-lg hover:bg-background-80 text-primary font-semibold cursor-not-allowed'
          title="Coming soon">
          <Upload />
          Import
        </Button>
        <NewProjectButton user={user} />
      </div>
    </header> 
  )
}

export default UpperInfoBar
