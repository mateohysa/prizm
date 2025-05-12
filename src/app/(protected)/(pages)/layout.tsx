import React from 'react'
import { onAuthenticateUser } from "@/actions/user"
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/global/App-Sidebar'
import { getRecentProjects } from '@/actions/project'
import { SidebarTrigger} from '@/components/ui/sidebar'
import UpperInfoBar from '@/components/global/upper-info-bar'

type Props = {
  children: React.ReactNode
}

const Layout = async ({children}: Props) => {
    const recentProjects = await getRecentProjects()
    const checkUser = await onAuthenticateUser()    
    
    if(!checkUser.user) redirect("/sign-in")
    return (
    <SidebarProvider >
      
      <AppSidebar
        user={checkUser.user}
        recentProjects={recentProjects.data || []} 
      />
      <SidebarInset className="flex flex-col h-screen">
        <UpperInfoBar user={checkUser.user} >
          <main className='flex-1 overflow-auto p-6'> 
            {children}
          </main>
        </UpperInfoBar>
      </SidebarInset>

      
      
      
    </SidebarProvider>
  )
}

export default Layout
