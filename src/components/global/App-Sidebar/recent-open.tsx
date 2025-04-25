import React from 'react'
import { Project } from '@/generated/prisma'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { JsonValue } from '@/generated/prisma/runtime/library'
import { toast } from 'sonner'
import { useRouter } from 'next/router'


type Props = {
    recentProjects: Project[]
}
const RecentOpen = ({recentProjects}: Props) => {
  const router = useRouter
  const handleRecentOpenClick  = (projectId: string, slides:JsonValue) => {
    if(!projectId || !slides){
      toast.error('Project not found',
        {
        description: 'Please try again',
      })
      return
    }
    setSlides(JSON.parse(JSON.stringify(slides)))
    router.push(`/presentation/${projectId}`)
  }
  return (
    recentProjects.length > 0 ? (
      <SidebarGroup className="p-0">
      <SidebarGroupLabel>
        Recently Opened
      </SidebarGroupLabel>
      <SidebarMenu>{recentProjects.length > 0 ? (
        recentProjects.map((item) => (<SidebarMenuItem key={item.id}>
          <SidebarMenuButton 
          asChild 
          tooltip={item.title}
          className="hover:bg-primary-80">
  
            <Button 
            variant={'link'}
            onClick={() => handleRecentOpenClick(item.id, item.slides)}
            className='text-xs items-center justify-start'
            >
              <span>{item.title}</span>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>))
      ):
      (
         ''
         )}
        
      </SidebarMenu>
    </SidebarGroup>
    )
    :
    (
     ''
    )
  )
}

export default RecentOpen
