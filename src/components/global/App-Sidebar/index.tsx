"use client"
import { Project } from '@/generated/prisma'
import type { User } from '@/generated/prisma'
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
import NavFooter from './nav-footer'

const AppSidebar = ({recentProjects, user, ...props}: 
    {recentProjects: Project[]} & {user: User} & 
    React.ComponentProps<typeof Sidebar>) => {
  
    return (
    <div>
      <Sidebar collapsible='icon'
      {...props}
      className="max-w-[212px] bg-background-90">
        <SidebarHeader className="pt-6 px-3 pb-0">
            {/* Custom div to replace SidebarMenuButton and remove hover effects */}
            <div className="flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <Avatar className="max-w-xs rounded-full mt-2">
                        <AvatarImage
                            src={'/prizm.png'}
                            alt={`prizm logo`}
                            className="max-w-xs"
                        />
                    </Avatar>
                </div>
                <span className='truncate text-primary text-3xl font-semibold'>prizm</span>
            </div>
        </SidebarHeader>  
        <SidebarContent className="px-3 mt-10 gap-y-6">
          <NavMain items={data.navMain} />
          <RecentOpen recentProjects={recentProjects} />
        </SidebarContent>
        <SidebarFooter>
          <NavFooter prismaUser={user}/>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

export default AppSidebar
