"use client"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { User } from '@/generated/prisma'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const NavFooter = ({prismaUser}: {prismaUser: User}) => {
    const {isLoaded, isSignedIn, user} = useUser()
    const[loading, setLoading] = useState(false)
    const router = useRouter()

    if(!isLoaded || !isSignedIn) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Upgrade CTA hidden when sidebar is collapsed */}
        {!prismaUser.subscription && (
          <div className="flex flex-col items-start p-2 pb-3 gap-2 bg-background-80 group-data-[collapsible=icon]:hidden ml-2 rounded-lg">
            <div className="flex flex-col items-start gap-1">
              <p className="text-base font-bold">
                Get <span className="text-vivid">Creative AI</span>
              </p>
              <span className="text-sm dark:text-secondary">
                Unlock all features including AI and more
              </span>
            </div>
            <Button
              className="w-full
              border
              border-vivid
              bg-background-70
              hover:bg-background-90
              text-primary
              rounded-xl
              font-bold"
              variant="outline"
              size={'lg'}
              // onClick={handleUpgradig}
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
            className="data-[state=open]:bg-transparent hover:bg-transparent hover:text-foreground active:bg-transparent ml-2"
            onClick={() => console.log("User profile clicked")}
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
