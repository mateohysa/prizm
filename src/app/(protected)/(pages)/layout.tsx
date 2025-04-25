import React from 'react'
import { onAuthenticateUser } from "@/actions/user"
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/global/App-Sidebar'
import { getRecentProjects } from '@/actions/project'


type Props = {
  children: React.ReactNode
}

const Layout = async ({children}: Props) => {
    const recentProjects = await getRecentProjects()
    const checkUser = await onAuthenticateUser()    
    if(!checkUser.user) redirect("/sign-in")
    return (
    <SidebarProvider>
        <AppSidebar 
        user={checkUser.user}
        recentProjects={recentProjects.data || []} />
    </SidebarProvider>
  )
}

export default Layout
