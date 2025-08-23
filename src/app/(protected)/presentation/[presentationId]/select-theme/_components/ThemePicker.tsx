import { generateLayouts } from '@/actions/aiModel'
import { Button } from '@/components/ui/button'
import { Theme } from '@/lib/types'
import { useSlideStore } from '@/store/useSlideStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { motion } from 'framer-motion'
import { Loader2, Wand2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Slide } from '@/lib/types'

type Props = {
    selectedTheme: Theme,
    themes: Theme[],
    onThemeSelect: (theme: Theme) => void
}

const ThemePicker = ({selectedTheme, themes, onThemeSelect}: Props) => {
    const router = useRouter()
    const {project, setSlides, currentTheme} = useSlideStore()
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const handleGenerateLayouts = async () => {
        setLoading(true)
        if(!selectedTheme){
        toast.error("Error!" , {description: "Please select a theme first"})
        return
        }
        if(project?.id === ""){
            toast.error("Error!" , {description: "Please create a project first"})
            router.push(`/create-page`)
            return
        }

        try{
            const res = await generateLayouts(params.presentationId as string, currentTheme.name)

            if(res.status === 200) {
                setSlides(res.data as unknown as Slide[])
            }
            toast.error("Success!" , {description: "Layouts generated successfully"})

            router.push(`/presentation/${project?.id}`)
        }catch(error){
            toast.error("Error!" , {description: "Failed to generate layouts"})
        }finally{
            setLoading(false)
        }

    }
  return (
    <div
    className='w-[400px] sticky top-0 h-screen flex flex-col bg-white/40 dark:bg-white/5 backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 bg-clip-padding border border-white/30 dark:border-white/10'
    >
        <div className='p-8 space-y-6 flex-shrink-0'>
            <div className='space-y-2'>
                <h2
                className='text-3xl font-bold tracking-tight text-foreground'
                >
                    Pick a theme
                </h2>
                <p
                className='text-sm text-muted-foreground'
                >
                    Choose from our curated themes.
                </p>
            </div>
            <Button 
            className='w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300'
            onClick={handleGenerateLayouts}
            >
                
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                {loading ? (<p className='animate-pulse'>Generating...</p>) : ("Generate Theme")}
            </Button>
        </div>
        <div className="flex-grow overflow-y-auto px-8 pb-8 hide-scrollbar">
            <div className='grid grid-cols-1 gap-4'>
                {
                    themes.map((theme) => (
                        <motion.div key={theme.name}
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                        >
                            <Button 
                            onClick={() => onThemeSelect(theme)}
                            className='flex flex-col items-center justify-start p-6 w-full h-auto'
                            style={{
                                fontFamily : theme.fontFamily,
                                color: theme.fontColor,
                                background: theme.gradientBackground || theme.backgroundColor,
                            }}
                            >
                                <div className="w-full flex  items-center justify-between">
                                    <span className='text-xl font-bold'>
                                        {theme.name}
                                    </span>
                                    <div className='w-3 h-3 rounded-full'
                                    style={{backgroundColor: theme.accentColor}}
                                    >

                                    </div>
                                </div>
                                <div className='space-y-1 w-full'>
                                    <div className='text-2xl font-bold'
                                    style={{color: theme.accentColor}}
                                    >
                                        Title
                                    </div>
                                    <div className='text-base opacity-80'>
                                        Body &{' '}
                                        <span style={{color: theme.accentColor}}>
                                            link
                                        </span>

                                    </div>
                                </div>

                            
                            </Button>
                        </motion.div>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default ThemePicker