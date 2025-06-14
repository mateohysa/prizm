"use client"
import { Project } from '@/generated/prisma'
import type { User } from '@/generated/prisma'
import React from 'react'
import { Sidebar, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import {
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
  } from "@/components/ui/sidebar"
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import NavMain from './nav-main'
import { data } from '@/lib/constants'
import RecentOpen from './recent-open'
import NavFooter from './nav-footer'

// New internal component for header content
const AppSidebarHeaderContent = () => {
  const { state } = useSidebar();
  return (
    <>
      <SidebarMenuButton size={'lg'}
      className='data-[state=open]:text-sidebar-accent-foreground'
      >
        <div className='flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground'>
          <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                        src={'/prizm.png'}
                        alt='Presix Logo'                  
                        className="max-w-xs"
                    />
          </Avatar>
        </div>
        {state === "expanded" && <span className='truncate text-primary text-3xl font-semibold'>presix</span>}
        </SidebarMenuButton>
    </>
  );
};

const AppSidebar = ({recentProjects, user, ...props}: 
    {recentProjects: Project[]} & {user: User} & 
    React.ComponentProps<typeof Sidebar>) => {

    return (
      <Sidebar collapsible='offcanvas'
      {...props}
      className="max-w-[212px] bg-background-90 transition-all duration-300 ease-in-out">
        <SidebarHeader className="pt-6 px-3 pb-0">
          <AppSidebarHeaderContent />
        </SidebarHeader>  
        <SidebarContent className=" px-3 mt-10 gap-y-6 mr-2">
          <NavMain items={data.navMain} />
          <RecentOpen recentProjects={recentProjects} />
        </SidebarContent>
        <SidebarFooter>
          <NavFooter prismaUser={user}/>
        </SidebarFooter>
      </Sidebar>
  )
}

export default AppSidebar
