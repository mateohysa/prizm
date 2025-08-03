"use client"
import React, { useEffect, useState } from 'react'
import { Project } from '@/generated/prisma'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { JsonValue } from '@/generated/prisma/runtime/library'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSlideStore } from '@/store/useSlideStore'
import { Slide } from '@/lib/types'


type Props = {
    recentProjects: Project[]
}
const RecentOpen = ({recentProjects}: Props) => {
  const router = useRouter()
  const { setSlides } = useSlideStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (recentProjects.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>
        Recently Opened
      </SidebarGroupLabel>
      <SidebarMenu>
        {recentProjects.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.title}
              className="hover:bg-primary-80 border border-gray-200 dark:border-transparent"
            >
              <Button 
                variant={'link'}
                onClick={() => {
                    if (item.slides && Array.isArray(item.slides)) {
                        const slides = item.slides as unknown as Slide[]
                        setSlides(slides)
                        router.push(`/presentation/${item.id}`)
                    }
                }}
                className='text-xs items-center justify-start'
              >
                <span>{item.title}</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default RecentOpen
