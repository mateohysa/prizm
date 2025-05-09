"use client"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'


const NavMain = ({items}: {items:{
    title: string
    url: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
    isActive?: boolean
    items?: {
        title: string
        url: string
    }[]
}[]
}) => {
    const pathname = usePathname()
    const { state } = useSidebar()

  return (
      <SidebarGroup className="p-0">
        <SidebarMenu>
            {items.map((item) => (<SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} 
                className={`${pathname.includes(item.url) && "bg-muted"}`}>
                    <Link href={item.url}
                    className = {`text-lg ${pathname.includes(item.url) && "font-bold"}`}>
                    
                    <item.icon className="text-lg" />
                    {state === "expanded" && <span>{item.title}</span>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>))}
        </SidebarMenu>
      </SidebarGroup>
  )
}

export default NavMain
