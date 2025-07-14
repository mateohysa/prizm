'use client'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Play, Share, Menu } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import LayoutPreview from '../editor-sidebar/LeftSidebar/LayoutPreview'
import PresentationMode from './PresentationMode'

type Props = {presentationId: string, presentationTitle: string}

const Navbar = ({presentationId, presentationTitle}: Props) => {
    const {currentTheme} = useSlideStore()
    const [isPresentationMode, setIsPresentationMode] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${presentationId}`)
        toast.success("Copied to clipboard!", {
            description: "Share this link with your audience"
        })
    }

  return (
    <nav
    className='fixed top-0 left-0 right-0 z-50 w-full h-20 flex justify-between items-center py-4 px-7 border-b'
    style={{backgroundColor: 
        currentTheme.navbarColor || currentTheme.backgroundColor,
        //color: currentTheme.accentColor
    }}
    >
        {/* Left section */}
        <div className='flex items-center gap-2'>
            {/* Mobile: slide drawer trigger */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    className='sm:hidden'
                    style={{ backgroundColor: currentTheme.backgroundColor }}
                    >
                        <Menu className='w-4 h-4' />
                        <span className='sr-only'>Open slide preview</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side='left' className='p-0'>
                    {/* Re-use the same preview list but keep it visible in the drawer */}
                    <LayoutPreview hiddenOnMobile={false} />
                </SheetContent>
            </Sheet>

            {/* Home link (hidden on xs) */}
            <Link href={`/dashboard`} passHref>
                <Button
                variant="outline"
                className={`hidden sm:flex items-center gap-2`}
                style={{
                    backgroundColor: currentTheme.backgroundColor,
                }}
                >
                    <Home className='w-4 h-4' />
                    <span className='hidden sm:inline'>Home</span>
                </Button>
            </Link>
        </div>
        {/* HREF IS SUBJECT TO CHANGE */}
        <Link href={`/presentation/templatemarket`}
            className="text-lg font-semibold hidden sm:block"
        >{presentationTitle}</Link>
        <div className='flex items-center gap-4'>
            <Button 
            style={{
                backgroundColor: currentTheme.backgroundColor,
            }}
            variant="outline"
            onClick={handleCopy}
            >
                <Share className='w-4 h-4' />
            </Button>
            {/* TODO ADD SELLING TEMPLATES WITH LEMONSQUEEZY */}
            <Button variant={"default"}
            className='flex items-center gap-2'
            onClick={() => {
                setIsPresentationMode(true)
            }}
            >
                <Play className='w-4 h-4' />
                <span className='hidden sm:inline'>Present</span>
            </Button>
        </div>

        {isPresentationMode && <PresentationMode
        onClose={() => setIsPresentationMode(false)}
        />}
    </nav>
  )
}

export default Navbar