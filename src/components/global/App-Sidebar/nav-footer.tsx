"use client"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { User } from '@/generated/prisma'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { buySubscription } from '@/actions/lemonSqueezy'
import { toast } from 'sonner'

const NavFooter = ({prismaUser}: {prismaUser: User}) => {
    const {isLoaded, isSignedIn, user} = useUser()
    const[loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className="h-20" /> {/* Placeholder to maintain layout */}
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if(!isLoaded || !isSignedIn) return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="h-20" /> {/* Placeholder to maintain layout */}
            </SidebarMenuItem>
        </SidebarMenu>
    )

    const handleUpgrade = async () => {
      // setLoading(true)
      // try{
      //    const res = await buySubscription(prismaUser.id)
      // } 
      // catch(error){
      //   console.error(error)
      //   toast.error("Error", {description: "Unable to upgrade subscription."})
      // }finally{
      //   setLoading(false)
      // }

    }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Upgrade CTA hidden when sidebar is collapsed */}
        {!prismaUser.subscription && (
          <div className="flex flex-col items-start p-2 gap-3 bg-white/40 dark:bg-white/10 bg-clip-padding backdrop-blur-sm backdrop-saturate-100 backdrop-contrast-100 border border-white/20 dark:border-white/5 group-data-[collapsible=icon]:hidden ml-2 mr-2 rounded-lg shadow-lg shadow-black/10 mb-4">
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-sm font-bold leading-tight">
                Get <span className="text-vivid">Creative AI</span>
              </p>
              
            </div>
            <Button
              className="w-full
              border
              border-vivid/60
              bg-white/30 dark:bg-white/10
              hover:bg-white/40 dark:hover:bg-white/20
              text-primary
              rounded-lg
              font-semibold
              h-9
              transition-all
              duration-200"
              variant="outline"
              size={'sm'}
              onClick={handleUpgrade}
            >
              {loading ? 'Upgrading...' : 'Upgrade'}
            </Button>
          </div>
        )}
        {/* Always show the user icon; hide text when collapsed */}
        <SignedIn>
          <SidebarMenuButton
            size="lg"
            tooltip={user?.fullName || ''}
            className="data-[state=open]:bg-white/60 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15 hover:text-foreground active:bg-white/60 dark:active:bg-white/10 shadow-lg shadow-black/10 border border-gray-200 dark:border-transparent bg-white/60 dark:bg-white/10 bg-clip-padding backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100"

          >
            <UserButton />
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate text-foreground">
                {user?.fullName}
              </p>
              <p className="text-xs truncate text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </SidebarMenuButton>
        </SignedIn>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavFooter
