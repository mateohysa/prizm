import { SidebarTrigger } from '@/components/ui/sidebar'
import { User } from '@/generated/prisma'
import React from 'react'

type Props = {
    user: User
    children: React.ReactNode
}

const UpperInfoBar = ({user}: Props) => {
  return (
    <header className='sticky top-0 z-[10] flex shrink-0 flex-wrap items-center 
    gap-2 border-b bg-background p-4 justify-between'>
      <SidebarTrigger />
    </header>
  )
}

export default UpperInfoBar
