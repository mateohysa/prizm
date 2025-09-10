import React from 'react'
import { getCachedAuthenticatedUser } from "@/actions/user"
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/global/App-Sidebar'
import { getRecentProjects } from '@/actions/project'
import { SidebarTrigger} from '@/components/ui/sidebar'
import UpperInfoBar from '@/components/global/upper-info-bar'
import NotFound from '@/components/global/not-found'

type Props = {
  children: React.ReactNode
}

const Layout = async ({children}: Props) => {
    // Use cached authentication to avoid redundant DB calls
    const checkUser = await getCachedAuthenticatedUser()    
    
    if(!checkUser.user) redirect("/sign-in")
    
    // Pass the authenticated user to avoid re-authentication in getRecentProjects
    const recentProjects = await getRecentProjects(checkUser)
    return (
    <SidebarProvider className="w-full min-h-screen bg-transparent">
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
