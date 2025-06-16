'use client'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Play, Share } from 'lucide-react'
import { toast } from 'sonner'

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
        <Link href={`/dashboard`}
        passHref
        >
            <Button
            variant="outline"
            className={`flex items-center gap-2`}
            style={{
                backgroundColor: currentTheme.backgroundColor,
            }}
            >
                <Home className='w-4 h-4' />
                <span className='hidden sm:inline'>Home</span>

            </Button>
        </Link>
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
        {/* TODO ADD PRESENTATION MODE */}
        {/* {isPresentationMode && <PresentationMode />} */}
    </nav>
  )
}

export default Navbar