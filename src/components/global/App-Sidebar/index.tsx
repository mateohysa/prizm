"use client"
import { Project } from '@/generated/prisma'
import { User } from '@clerk/nextjs/server'
import React from 'react'
import { Sidebar, SidebarGroup, SidebarMenuButton } from '@/components/ui/sidebar'
import {
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarFooter,
  } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import NavMain from './nav-main'
import { data } from '@/lib/constants'
import RecentOpen from './recent-open'



const AppSidebar = ({recentProjects, user, ...props}: 
    {recentProjects: Project[]} & {user: User} & 
    React.ComponentProps<typeof Sidebar>) => {
  
    return (
    <div>
      <Sidebar collapsible='icon'
      {...props}
      className="max-w-[212px] bg-background-90">
        <SidebarHeader className="pt-6 px-3 pb-0">
            <SidebarMenuButton size={'lg'} className="data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage
                            src={'/prizm.png'}
                            alt={`prizm logo`}
                            className="size-small"
                        />
                        
                    </Avatar>
                </div>
                <span className='truncate text-primary text-3xl font-semibold'>prizm</span>
            </SidebarMenuButton>
        </SidebarHeader>  
        <SidebarContent className="px-3 mt-10 gap-y-6 hover:cursor-pointer hover:bg-background-90">
          <NavMain items={data.navMain} />
          <RecentOpen recentProjects={recentProjects} />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  )
}

export default AppSidebar
