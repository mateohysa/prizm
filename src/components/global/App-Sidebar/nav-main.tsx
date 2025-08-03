"use client"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import React, { useEffect, useState } from 'react'
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
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

  return (
      <SidebarGroup className="p-0">
        <SidebarMenu>
            {items.map((item) => (<SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} 
                className={`border border-gray-200 dark:border-transparent ${pathname.includes(item.url) ? "bg-white/30 dark:bg-white/10" : ""}`}>
                    <Link href={item.url}
                    className = {`text-lg ${pathname.includes(item.url) && "font-bold"}`}>
                    
                    <item.icon className="text-lg" />
                    {/* Only show title when mounted and expanded to prevent hydration issues */}
                    {mounted && state === "expanded" && <span>{item.title}</span>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>))}
        </SidebarMenu>
      </SidebarGroup>
  )
}

export default NavMain
