import React from 'react'
import { onAuthenticateUser } from "@/actions/user"
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/global/App-Sidebar'
import { getRecentProjects } from '@/actions/project'
import { SidebarTrigger} from '@/components/ui/sidebar'
import UpperInfoBar from '@/components/global/upper-info-bar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbItem, BreadcrumbList } from '@/components/ui/breadcrumb'
import TestAppSidebar from '@/components/global/Test-Sidebar'
import NotFound from '@/components/global/not-found'

type Props = {
  children: React.ReactNode
}

const Layout = async ({children}: Props) => {
    const recentProjects = await getRecentProjects()
    const checkUser = await onAuthenticateUser()    
    
    if(!checkUser.user) redirect("/sign-in")
    return (
    <SidebarProvider className="w-full min-h-screen bg-background">
      <AppSidebar
        user={checkUser.user}
        recentProjects={recentProjects.data || []}
      />

    <SidebarInset>
        <UpperInfoBar user={checkUser.user} />
        <div className="flex flex-1 flex-col gap-4 p-4">
        
          {children}
          
        </div> 
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
