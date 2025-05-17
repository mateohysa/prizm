"use client"
import React, { useState } from 'react'
import { JsonValue } from '@prisma/client/runtime/library'
import { motion } from 'framer-motion'
import { itemVariants, themes, timeAgo } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import ThumbnailPreview from './thumbnail-preview'
import { useRouter } from 'next/navigation'
import AlertDialogBox from '../alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteProject, recoverProject } from '@/actions/project'
type Props = {
    projectId: string
    title: string
    createdAt: string
    themeName: string
    isDeleted: boolean
    slideData: JsonValue
}
const ProjectCard = ({projectId, 
                    title, 
                    createdAt, 
                    themeName,
                    isDeleted, 
                    slideData, 
                }: Props) => {

        const [loading, setLoading] = useState(false)
        const [open, setOpen] = useState(false)
        const {setSlides} = useSlideStore()
        const router = useRouter()
        const handleNavigation = () => {
            setSlides(JSON.parse(JSON.stringify(slideData)))
            router.push(`/presentation/${projectId}`)
        }
        const theme = themes.find((theme) => theme.name === themeName) || themes[0]
        
        //method for handling project recovery
        const handleRecover = async () => {
            setLoading(true)
            if(!projectId){
                setLoading(false)
                toast.error('Error!', {description: 'Project not found.'})
                return
            }
            try {
                const res = await recoverProject(projectId)
                if(res.status !== 200){
                    toast.error('Error!', {description: 'Something went wrong.'})
                    return
                }
                setOpen(false)
                router.refresh()
                toast.success('Success!', {description: 'Project recovered.'})
            } catch (error) {
                toast.error('Error!', {description: 'Something went wrong.'})
            }
        }

        //method for handling project deletion
        const handleDelete = async () => {
            setLoading(true)
            if(!projectId){
                setLoading(false)
                toast.error('Error!', {description: 'Project not found.'})
                return
            }
            try {
                const res = await deleteProject(projectId)
                if(res.status !== 200){
                    toast.error('Error!', {description: 'Failed to delete project.'})
                    return
                }
                setOpen(false)
                router.refresh()
                toast.success('Success!', {description: 'Project deleted.'})
            } catch (error) {
                toast.error('Error!', {description: 'Something went wrong.'})
            }
        }
  return (
    <motion.div
    variants={itemVariants}
    
    className={`group w-full flex flex-col gap-y-3 rounded-xl p-3 transition-colors
    ${!isDeleted && 'hover:bg-muted/50'}
    `}
    >
        <div className='relative aspect-[16/9] rounded-lg cursor-pointer overflow-hidden'
        onClick={handleNavigation}
        >
            {/* <ThumbnailPreview theme={theme} 
            ///WIP ADD SLIDE DATA
            // slide={JSON.parse(JSON.stringify(slideData))?. [0]}
            /> */}
        </div>
        <div className='w-full'>
            <div className='space-y-1'>
                <h3 className='font-semibold text-base text-primary line-clamp-1'>
                    {title} Some Title
                </h3>
                <div className='flex w-full justify-between items-center gap-2'>
                    <p className='text-sm text-muted-foreground'
                    suppressHydrationWarning
                    >
                        {timeAgo(createdAt)} 
                    </p>
                   {isDeleted? 
                    
                    <AlertDialogBox 
                    description='This will recover your project and restore your data.'
                    className='bg-green-500 text-white dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                    loading={loading}
                    open={open}
                    onClick={handleRecover}
                    handleOpen={() => setOpen(!open)}
                    >
                        <Button
                        size='sm'
                        variant='ghost'
                        className='bg-background-80 dark:hover:bg-background-90'
                        disabled={loading}
                        >
                            Recover
                        </Button>
                    </AlertDialogBox> 
                     : 
                     <AlertDialogBox 
                    description='This will delete your project and send it to the trash.'
                    className='bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
                    loading={loading}
                    open={open}
                    onClick={handleDelete}
                    handleOpen={() => setOpen(!open)}
                    >
                        <Button
                        size='sm'
                        variant='ghost'
                        className='bg-background-80 dark:hover:bg-background-90'
                        disabled={loading}
                        >
                            Delete
                        </Button>
                    </AlertDialogBox> 
                    }
                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default ProjectCard