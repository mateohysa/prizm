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
            <div className="flex flex-col gap-y-6 items-start group-data-[collapsible=icon]:hidden">
                {!prismaUser.subscription && (
                    <div className="flex flex-col items-start p-2 pb-3 gap-2 bg-background-90 rounded-xl">
                        <div className="flex flex-col items-start">
                            <p className="text-sm font-medium">
                                Get <span className="text-vivid">Creative AI</span>
                            </p>
                            <span className="text-xs text-muted-foreground">
                                Unlock all features including AI and more
                            </span>
                        </div>
                        <Button
                            className="w-full 
                            bg-transparent 
                            hover:bg-background-80 
                            text-foreground 
                            border border-border
                            rounded-md 
                            h-8
                            text-xs
                            font-medium"
                            variant="outline"
                            // onClick={handleUpgradig}
                        >
                            {loading ? 'Upgrading...' : 'Upgrade'}
                        </Button>
                    </div>
                )}

                <SignedIn>
                    <SidebarMenuButton 
                        size={'lg'} 
                        className="data-[state=open]:bg-transparent hover:bg-transparent hover:text-foreground active:bg-transparent"
                        onClick={() => console.log("User profile clicked")}
                    >
                        <UserButton />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground">
                                {user?.fullName}
                            </p>
                            <p className="text-xs truncate text-muted-foreground">
                                {user?.emailAddresses[0]?.emailAddress}
                            </p>
                        </div>
                    </SidebarMenuButton>
                </SignedIn>
            </div>
        </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavFooter
